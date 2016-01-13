import googleapis from 'googleapis';
import fs from 'fs';
import path from 'path';
import config from '../../config/environment';
import syncFor from '../../components/syncFor';
import arrayDiff from 'diff-array-objs';

class GCalendar {
  constructor(cb, jsonKeyFile = 'privateSettings.json') {
    this.cb = cb;

    fs.readFile(config.root + '/.credentials/' + jsonKeyFile, (err, content) => {
      if (err) {
        throw 'Error loading client secret file: ' + err;
      }
      this.authorize(JSON.parse(content));
    });
  }

  authorize(credentials) {
    var OAuth2 = googleapis.auth.OAuth2;
    this.oauth2Client = new OAuth2();

    var jwt = new googleapis.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/calendar']);
        jwt.authorize((err, result) => {
          this.oauth2Client.setCredentials({
            access_token: result.access_token
          });

          this.cb();
        });
  }

  handleSkypeInterviews(candidate, cb) {
    if (!candidate.visits.length)
      return cb(null, candidate);

    syncFor(0, candidate.visits.length, "start", (i, status, call) => {
      if (status === "done") {
        return cb(null, candidate)
      } else {
        var event = {
          summary: 'Skype interview with ' + candidate.firstName + ' ' + candidate.lastName + ' (' + (candidate.skypeId ? candidate.skypeId : 'unknown') + ')'
        }
        this.handleInterview(candidate, candidate.visits[i], event, 'skype', (err, event) => {
          if (err) {
            return cb(err, candidate)
          }
          call('next');
        });
      }
    })
  }

  handleOfficeInterviews(candidate, cb) {
    if (!candidate.visits.length)
      return cb(null, candidate);

    syncFor(0, candidate.visits.length, "start", (i, status, call) => {
      if (status === "done") {
        return cb(null, candidate)
      } else {
        var event = {
          summary: 'Office interview with ' + candidate.firstName + ' ' + candidate.lastName
        }
        this.handleInterview(candidate, candidate.visits[i], event, 'office', (err, event) => {
          if (err) {
            return cb(err, candidate)
          }
          call('next');
        });
      }
    })
  }

  removeInterviews(visit) {
    var calendar = googleapis.calendar('v3');

    if (visit.skype.eventId) {
      calendar.events.delete({
        auth: this.oauth2Client,
        calendarId: config.calendar.id,
        eventId: visit.skype.eventId,
      });
    }

    if (visit.office.eventId) {
      calendar.events.delete({
        auth: this.oauth2Client,
        calendarId: config.calendar.id,
        eventId: visit.office.eventId,
      });
    }
  }

  handleRemovedVisits(oldVists, newVisits) {
    var diff = arrayDiff(oldVists, newVisits, '_id');
    for (var i = 0; i < diff.removed.length; i++) {
      this.removeInterviews(diff.removed[i]);
    }
  }

  handleInterview(candidate, visit, event, type, cb) {
    var calendar = googleapis.calendar('v3');

    if (visit.closed || !visit[type] || (!visit[type].planned && !visit[type].eventId)) {
      return cb(null, null);
    }

    if (!visit[type])
      visit[type] = {};

    if (!visit[type].planned && visit[type].eventId) {
      calendar.events.delete({
        auth: this.oauth2Client,
        calendarId: config.calendar.id,
        eventId: visit[type].eventId,
        sendNotifications: true,
      }, (err) => {
        visit[type].eventId = null;
        if (err) {
          console.error('There was an error contacting the Calendar service: ' + err);
          return cb(err, null);
        }
        return cb(null, null);
      });

      return;
    }
    var milliseconds = Date.parse(visit[type].dateTime);
    var startDate =  new Date(milliseconds);
    var endDate = new Date(startDate.getTime());
    endDate.setMinutes(endDate.getMinutes() + config.calendar.interviewDuration[type]);

    if (startDate < Date.now())
      return cb(null, null);

    event.start = { dateTime: startDate };
    event.end = { dateTime: endDate };

    if (candidate.email)
      event.attendees = [ { email: candidate.email } ];

    // no event id, so create new
    if (!visit[type].eventId) {
      calendar.events.insert({
        auth: this.oauth2Client,
        calendarId: config.calendar.id,
        resource: event,
        sendNotifications: true,
      }, (err, event) => {
        if (err) {
          console.error('There was an error contacting the Calendar service: ' + err);
          return cb(err, null);
        }
        visit[type].eventId = event.id;
        return cb(null, event);
      });
    // update existing event
    } else {
      calendar.events.update({
        auth: this.oauth2Client,
        calendarId: config.calendar.id,
        eventId: visit[type].eventId,
        resource: event,
        sendNotifications: true,
      }, (err, event) => {
        if (err) {
          console.error('There was an error contacting the Calendar service: ' + err);
          return cb(err, null);
        }
        return cb(null, event);
      });
    }
  }

}

export default GCalendar;
