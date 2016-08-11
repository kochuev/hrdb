import googleapis from 'googleapis';
import fs from 'fs';
import config from '../../config/environment';
import Bluebird from 'bluebird';
import Position from '../../api/candidate/position.model';
import EventEmitter from 'events';
import moment from 'moment';

class GCalendar extends EventEmitter {

  constructor() {
    super();
    this.credentials = JSON.parse(fs.readFileSync(config.calendar.keyFile));
    this.oauth2Client = new googleapis.auth.OAuth2();
    this.eventsApi = Bluebird.promisifyAll(googleapis.calendar('v3').events);
  }

  authorize() {
    return new Bluebird((resolve, reject) => {
      var jwt = new googleapis.auth.JWT(
        this.credentials.client_email,
        null,
        this.credentials.private_key,
        ['https://www.googleapis.com/auth/calendar']);

      jwt.authorize((err, tkn) => {
        if (err)
          return reject(err);

        this.oauth2Client.setCredentials({
          access_token: tkn.access_token
        });

        return resolve(this.oauth2Client)
      })
    });
  }

  handleSkypeInterviews(candidate) {
    return Bluebird.resolve(candidate.visits)
      .map(visit => {
        return Position.findByIdAsync(visit.general._position)
          .then(position => {
            return {
              visit: visit,
              position: position
            }
          })
      })
      .map(visitAndPosition => {
        let event = {
          summary: 'Skype interview with ' + candidate.firstName + ' ' + candidate.lastName + (candidate.skypeId ? ' (' + candidate.skypeId + ')' : '') + ' on ' + visitAndPosition.position.name + ' position'
        };
        return this.handleInterview(candidate, visitAndPosition.visit, event, 'skype');
      })
      .all()
      .then(events => {
        return candidate;
      });
  }

  handleOfficeInterviews(candidate) {
    return Bluebird.resolve(candidate.visits)
      .map(visit => {
        return Position.findByIdAsync(visit.general._position)
          .then(position => {
            return {
              visit: visit,
              position: position
            }
          })
      })
      .map(visitAndPosition => {
        let event = {
          summary: 'Office interview with ' + candidate.firstName + ' ' + candidate.lastName + ' on ' + visitAndPosition.position.name + ' position'
        };
        return this.handleInterview(candidate, visitAndPosition.visit, event, 'office');
      })
      .all()
      .then(events => {
        return candidate;
      });
  }

  removeInterviews(visit) {
    if (visit.skype.eventId) {
      return this.eventsApi.deleteAsync({
        auth: this.oauth2Client,
        calendarId: config.calendar.id,
        eventId: visit.skype.eventId
      });
    }

    if (visit.office.eventId) {
      return this.eventsApi.deleteAsync({
        auth: this.oauth2Client,
        calendarId: config.calendar.id,
        eventId: visit.office.eventId
      });
    }

    return Bluebird.resolve(null)
  }

  handleRemovedVisits(oldVisits, newVisits) {
    Bluebird.resolve(oldVisits)
      .filter(oldVisit => {
        for (var j = 0; j < newVisits.length; j++) {
          if (oldVisit._id = newVisits[j]._id)
            return false;
        }

        return this.removeInterviews(oldVisit);
      })
      .all();
  }

  handleInterview(candidate, visit, event, type) {
    if (visit.closed || !visit[type] || (!visit[type].planned && !visit[type].eventId)) {
      return Bluebird.resolve('null');
    }

    if (!visit[type])
      visit[type] = {};

    // remove event as interview was cancelled
    if (!visit[type].planned && visit[type].eventId) {
      return this.eventsApi.getAsync({
        auth: this.oauth2Client,
        calendarId: config.calendar.id,
        eventId: visit[type].eventId
      })
        .then(oldEvent =>{
          // Do a notification if interview is not in the past
          if (!moment(oldEvent.start.dateTime).isBefore()) {
            this.emit('interviewCanceled', {
              type: type,
              candidate: candidate,
              visit: visit,
              oldDateTime: moment(oldEvent.start.dateTime).toDate()
            });
          }
          return oldEvent;
        })
        .then(oldEvent => {
          return this.eventsApi.deleteAsync({
            auth: this.oauth2Client,
            calendarId: config.calendar.id,
            eventId: oldEvent.id,
            sendNotifications: true
          })
        })
        .catch(e => {
          return null;
        })
        .finally(() => {
          visit[type].eventId = null;
        })
    }

    /** @type {moment} */
    var startDate = moment(visit[type].dateTime);
    /** @type {moment} */
    var endDate = moment(startDate).add(config.calendar.interviewDuration[type], 'minutes');

    // defining event object for google
    event.start = { dateTime: startDate.toDate() };
    event.end = { dateTime: endDate.toDate() };
    event.guestsCanInviteOthers = false;
    event.guestsCanSeeOtherGuests = false;
    if (candidate.email)
      event.attendees = [ { email: candidate.email } ];

    // no event id, so create new
    if (!visit[type].eventId) {
      if (startDate.isBefore()) {
        return Bluebird.resolve('null');
      } else {
        return this.eventsApi.insertAsync({
            auth: this.oauth2Client,
            calendarId: config.calendar.id,
            resource: event,
            sendNotifications: true
          })
          .then(event => {
            this.emit('interviewAdded', {
              type: type,
              candidate: candidate,
              visit: visit,
              newDateTime: event.start.dateTime
            });
            visit[type].eventId = event.id;
            return event;
          });
      }
    // update existing event
    } else {
      return this.eventsApi.getAsync({
        auth: this.oauth2Client,
        calendarId: config.calendar.id,
        eventId: visit[type].eventId
      })
        .then(oldEvent => {
          let oldEventTime = moment(oldEvent.start.dateTime);

          if (!oldEventTime.isSame(startDate) && !startDate.isBefore()) {
            this.emit('interviewChanged', {
              type: type,
              candidate: candidate,
              visit: visit,
              newDateTime: startDate.toDate(),
              oldDateTime: oldEventTime.toDate()
            });
          }
          return oldEvent;
        })
        .then(oldEvent => {
          return this.eventsApi.updateAsync({
            auth: this.oauth2Client,
            calendarId: config.calendar.id,
            eventId: oldEvent.id,
            resource: event,
            sendNotifications: true
          });
        })
    }
  }
}

export default new GCalendar();
