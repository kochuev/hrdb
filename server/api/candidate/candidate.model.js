'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
import metaphone from '../../components/metaphone';
import fs from 'fs';
import calendar from '../../components/calendar';
import Bluebird from 'bluebird';

var CandidateSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  firstNameMfn: String,
  lastNameMfn: String,
  birthYear: Number,
  email: String,
  skypeId: String,
  phone1: String,
  phone2: String,
  linkedinUrl: String,
  address: String,
  preferences: String,
  notes: String,
  visits: [{
    closed: {
      type: mongoose.Schema.Types.Mixed,
      default: false,
    },
    active: {
      type: Boolean,
      default: false
    },
    general: {
      date: {
        type: Date,
        required: true
      },
      _agency: {
        type: String,
        ref: 'Agency'
      },
      company: String,
      desiredSalary: Number,
      rating: Number,
      _position: {
        type: String,
        ref: 'Position',
        required: true
      },
      _origin: {
        type: String,
        ref: 'Origin'
      },
      uploadedCvId: String,
      notes: String
    },
    skype:{
      planned: Boolean,
      dateTime: Date,
      rating: Number,
      notes: String,
      eventId: String,
    },
    office:{
      planned: Boolean,
      dateTime: Date,
      rating: Number,
      notes: String,
      eventId: String,
    },
    proposal:{
      done: Boolean,
      date: Date,
      probationSalary: Number,
      salary: Number,
      probationDuration: Number,
      notes: String
    }
  }]

});

CandidateSchema
  .pre('save', function(next) {
    this.firstNameMfn = metaphone(this.firstName);
    this.lastNameMfn = metaphone(this.lastName);

    next();
  });

CandidateSchema
  .pre('findOneAndUpdate', function(next) {
    var newCandidate = this.getUpdate();
    newCandidate.firstNameMfn = metaphone(newCandidate.firstName);
    newCandidate.lastNameMfn = metaphone(newCandidate.lastName);

    next();
  });

CandidateSchema
  .pre('save', function(next) {
    calendar.authorize()
      .then(() => {
        return calendar.handleSkypeInterviews(this.toJSON());
      })
      .then(() => {
        return calendar.handleOfficeInterviews(this.toJSON());
      })
      .then(next)
      .catch(err => {
        throw new Error(err);
      });
  });

CandidateSchema
  .pre('remove', function(next) {
    calendar.authorize()
      .then(() => {
        if (this.visits) {
          for (var i = 0; i < this.visits.length; i++) {
            calendar.removeInterviews(this.visits[i]);
          }
        }
      })
      .then(next)
      .catch(err => {
        next(err);
      });
  });

CandidateSchema
  .pre('findOneAndUpdate', function(next) {
    var newCandidate = this.getUpdate();

    calendar.authorize()
      .then(() => {
        return calendar.handleSkypeInterviews(newCandidate);
      })
      .then(() => {
        return calendar.handleOfficeInterviews(newCandidate);
      })
      .then(() => {
        //this.findOneAndUpdate({}, newCandidate);
        next();
      })
      .catch(err => {
        next(err);
      });
  });

CandidateSchema
  .post('findOneAndUpdate', function(oldCandidate, next) {
    var newCandidate = this.getUpdate();

    calendar.authorize()
      .then(() => {
        if (oldCandidate && oldCandidate.visits)
          return calendar.handleRemovedVisits(oldCandidate.visits, newCandidate.visits);
        else
          return null;
      })
      .then(removedVisits => {
        next();
      })
      .catch(err => {
        next(err);
      });
  });

CandidateSchema.statics.random = function() {
  return this.count()
    .then(count => {
      return Math.floor(Math.random() * count)
    })
    .then(rand => {
      return this.findOne().skip(rand);
    })
};

CandidateSchema.statics.getPendingDecisions = function() {
  let dateUntil = new Date();
  dateUntil.setHours(0,0,0,0);

  return this.aggregateAsync([
    {
      $unwind: "$visits"
    },
    {
      $match: {
        "visits.closed": false,
        $or: [
          {
            $and: [
              {
                "visits.proposal.date": {
                  $lt: dateUntil
                }
              },
              {"visits.proposal.done": true}
            ]
          },
          {
            $and: [
              {
                "visits.office.dateTime": {
                  $lt: dateUntil
                }
              },
              {"visits.proposal.done": {$ne: true}},
              {"visits.office.planned": true}
            ]
          },
          {
            $and: [
              {
                "visits.skype.dateTime": {
                  $lt: dateUntil
                }
              },
              {"visits.proposal.done": {$ne: true}},
              {"visits.office.planned": {$ne: true}},
              {"visits.skype.planned": true}
            ]
          },
          {
            $and: [
              {"visits.proposal.done": {$ne: true}},
              {"visits.office.planned": {$ne: true}},
              {"visits.skype.planned": {$ne: true}}
            ]
          }
        ]
      }
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        _position: '$visits.general._position',
        'pending.proposal': {
          $cond: {
            if: {$eq: ['$visits.proposal.done', true]},
            then: '$visits.proposal.dateTime',
            else: {$literal: false}
          }
        },
        'pending.office': {
          $cond: {
            if: {$eq: ['$visits.office.planned', true]},
            then: '$visits.office.dateTime',
            else: {$literal: false}
          }
        },
        'pending.skype': {
          $cond: {
            if: {$eq: ['$visits.skype.planned', true]},
            then: '$visits.skype.dateTime',
            else: {$literal: false}
          }
        }
      }
    }
  ]);
}

CandidateSchema.statics.getTodayInterviews = function() {
  let dateFrom = new Date();
  dateFrom.setHours(0,0,0,0);
  var dateTo = new Date();
  dateTo.setHours(24,0,0,0);

  return this.aggregateAsync([
    {
      $unwind: "$visits"
    },
    {
      $match: {
        "visits.closed": false,
        $or: [
          {
            $and: [
              {
                "visits.office.dateTime": {
                  $gte: dateFrom,
                  $lt: dateTo
                }
              },
              {"visits.office.planned": true}
            ]
          },
          {
            $and: [
              {
                "visits.skype.dateTime": {
                  $gte: dateFrom,
                  $lt: dateTo
                }
              },
              {"visits.skype.planned": true}
            ]
          }
        ]
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        _position: '$visits.general._position',
        'skype.dateTime': '$visits.skype.dateTime',
        'office.dateTime': '$visits.office.dateTime',
        interviewType: {
          $cond: {
            if: { $eq: ['$visits.office.planned', true] },
            then: {$literal: 'office'},
            else: {$literal: 'skype'}
          }
        }
      }
    }
  ]);
}


export default mongoose.model('Candidate', CandidateSchema);
