'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
import calendar from '../../components/calendar';

var CandidateSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
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
    var cal = new calendar( () => {
      cal.handleSkypeInterviews(this, (err, candidate) => {
        cal.handleOfficeInterviews(this, (err, candidate) => {
          next();
        });
      });
    });
  });

CandidateSchema
  .pre('remove', function(next) {
    var cal = new calendar( () => {
      if (this.visits) {
        for (var i = 0; i < this.visits.length; i++) {
          cal.removeInterviews(this.visits[i]);
        }
      }
    });

    next();
  });

CandidateSchema
  .pre('findOneAndUpdate', function(next) {
    var newCandidate = this.getUpdate();

    var cal = new calendar( () => {
      cal.handleSkypeInterviews(newCandidate, (err, candidate) => {
        cal.handleOfficeInterviews(newCandidate, (err, candidate) => {
          this.findOneAndUpdate({}, newCandidate);
          next();
        });
      });
    });
  });

CandidateSchema
  .post('findOneAndUpdate', function(oldCandidate) {
    var newCandidate = this.getUpdate();

    var cal = new calendar( () => {
      if (oldCandidate && oldCandidate.visits)
        cal.handleRemovedVisits(oldCandidate.visits, newCandidate.visits);
    });
  });

export default mongoose.model('Candidate', CandidateSchema);
