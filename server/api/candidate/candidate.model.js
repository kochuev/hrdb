'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var CandidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true } ,
  lastName: { type: String, required: true },
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
    closed: mongoose.Schema.Types.Mixed,
    active: Boolean,
    general: {
      date: { type: Date, required: true },
      _agency: { type: String, ref: 'Agency' },
      company: String,
      desiredSalary: Number,
      rating: Number,
      _position: { type: String, ref: 'Position', required: true },
      _origin: { type: String, ref: 'Origin' },
      uploadedCvId: String,
      notes: String
    },
    skype:{
      planned: Boolean,
      dateTime: Date,
      rating: Number,
      notes: String
    },
    office:{
      planned: Boolean,
      dateTime: Date,
      rating: Number,
      notes: String
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

export default mongoose.model('Candidate', CandidateSchema);
