'use strict';

//import app from '../..';
import Bluebird from 'bluebird';
import Candidate from './candidate.model';
import calendar from '../../components/calendar';
import mongoose from 'mongoose';
import moment from 'moment';


var candidates;
var candidate;
var genCandidates = function() {
  var tpl = {
    firstName: 'FIRST_NAME',
    lastName: 'LAST_NAME',
    birthYear: 1985,
    email: 'email@test.com',
    visits: [
      {
        closed: true,
        general: {
          date: new Date(2010, 0, 1),
          _position: mongoose.Types.ObjectId()
        }
      },
      {
        closed: true,
        general: {
          date: new Date(2010, 0, 2),
          _position: mongoose.Types.ObjectId()
        }
      },
      {
        closed: true,
        general: {
          date: new Date(2010, 0, 3),
          _position: mongoose.Types.ObjectId()
        }
      }
    ]
  };

  candidates = ['John Doe', 'Max Musterman', 'Ivan Ivanov'].map(elm => {
    let names = elm.split(' ')
    let candidate = new Candidate(tpl);
    candidate.firstName = names[0];
    candidate.last = names[1];
    candidate.email = names[0].toLowerCase() +  '.' + names[1].toLowerCase() + '@test.com';
    return candidate;
  });
  candidate = candidates[0];

  return candidates;
};

describe('Candidate Model', function() {
  var sandbox;
  var handleSkypeInterviewsStub;
  var handleOfficeInterviewsStub;
  var handleRemovedVisitsStub;
  var removeInterviewsStub;

  before(function() {
    // Clear users before testing
    return Candidate.removeAsync();
  });

  beforeEach(function() {
    genCandidates();

    sandbox = sinon.sandbox.create();
    sandbox.stub(calendar, 'authorize', function() {return Bluebird.resolve({})});
    handleSkypeInterviewsStub = sandbox.stub(calendar, 'handleSkypeInterviews');
    handleOfficeInterviewsStub = sandbox.stub(calendar, 'handleOfficeInterviews');
    handleRemovedVisitsStub = sandbox.stub(calendar, 'handleRemovedVisits');
    removeInterviewsStub = sandbox.stub(calendar, 'removeInterviews');
  });

  afterEach(function() {
    sandbox.restore();
    return Candidate.removeAsync();
  });

  it('should begin with no candidates', function() {
    return Candidate.findAsync({}).should
      .eventually.have.length(0);
  });

  it('should check for new interviews to be added to calendar on saving candidate', function() {
    return candidate.saveAsync()
      .then(candidateSaved => {
        handleSkypeInterviewsStub.calledOnce.should.equal(true);
        handleSkypeInterviewsStub.calledWith(sinon.match({_id: candidate._id})).should.equal(true);

        handleOfficeInterviewsStub.calledOnce.should.equal(true);
        handleOfficeInterviewsStub.calledWith(sinon.match({_id: candidate._id})).should.equal(true);
      })
  });

  it('should check for new interviews to be added to calendar on updating candidate', function() {
    return candidate.saveAsync()
      .then(candidateSaved => {
        handleSkypeInterviewsStub.reset()
        handleOfficeInterviewsStub.reset();
        return candidateSaved;
      })
      .then(candidateSaved => {
        return Candidate.findByIdAndUpdateAsync(candidateSaved._id, candidateSaved.toJSON(), {overwrite: true});
      })
      .then(candidateFound => {
        handleSkypeInterviewsStub.calledOnce.should.equal(true);
        handleSkypeInterviewsStub.calledWith(sinon.match({_id: candidate._id})).should.equal(true);

        handleOfficeInterviewsStub.calledOnce.should.equal(true);
        handleOfficeInterviewsStub.calledWith(sinon.match({_id: candidate._id})).should.equal(true);
      })
  });

  it('should go through all the visits to remove interviews from calendar on removing candidate', function() {
    return candidate.saveAsync()
      .then(candidateSaved => {
        return candidate.removeAsync();
      })
      .then(() => {
        removeInterviewsStub.callCount.should.equal(3);
        removeInterviewsStub.calledWith(sinon.match({_id: candidate.visits[0]}));
        removeInterviewsStub.calledWith(sinon.match({_id: candidate.visits[1]}));
        removeInterviewsStub.calledWith(sinon.match({_id: candidate.visits[2]}));
      })
  });

  it('should check for removed visits on updating candidate', function() {
    return candidate.saveAsync()
      .then(candidateSaved => {
        candidateSaved.visits.$pop();
        return Candidate.findByIdAndUpdateAsync(candidateSaved._id, candidateSaved.toJSON(), {overwrite: true});
      })
      .then(candidateFound => {
        return new Promise((resolve, reject) => {
          process.nextTick(()=> {
            handleRemovedVisitsStub.calledOnce.should.equal(true);
            handleRemovedVisitsStub.getCall(0).args[0].should.have.length(3);
            handleRemovedVisitsStub.getCall(0).args[1].should.have.length(2);
            resolve();
          });
        });
      })
  });

  it('should return list of today interviews when any exists on getTodayInterviews', function(){
    candidates[0].visits[0].closed = false;
    candidates[0].visits[0].office = {
      planned: true,
      dateTime: moment().subtract(1, 'day')
    };


    candidates[1].visits[0].closed = false;
    candidates[1].visits[0].skype = {
      planned: true,
      dateTime: moment().hour(23).minute(59).second(59)
    };

    candidates[2].visits[0].closed = false;
    candidates[2].visits[0].skype = {
      planned: true,
      dateTime: moment().add(2, 'days')
    };

    return Bluebird.resolve(candidates)
      .map(candidate => {
        return candidate.saveAsync();
      })
      .all()
      .then(candidatesSaved => {
        return Candidate.getTodayInterviews();
      })
      .then(todayInterviews => {
        todayInterviews.should.be.a('Array');
        todayInterviews.should.have.length(1);

        todayInterviews[0].should.have.property('firstName', candidates[1].firstName);
        todayInterviews[0].should.have.property('lastName', candidates[1].lastName);

        todayInterviews[0].should.have.property('interviewType', 'skype');
        todayInterviews[0].should.have.property('_position', candidates[1].visits[0].general._position);
        todayInterviews[0].should.have.deep.property('skype.dateTime');
      });
  });

  it('should return empty array of today interviews when none exists on getTodayInterviews', function(){
    return candidate.saveAsync()
      .then(candidateSaved => {
        return Candidate.getTodayInterviews();
      })
      .then(todayInterviews => {
        todayInterviews.should.be.a('Array');
        todayInterviews.should.be.empty;
      })
  });

  it('should return list of pending decisions when any exists on getPendingDecisions', function(){
    candidates[0].visits[0].closed = false;
    candidates[0].visits[0].skype = {
      planned: true,
      dateTime: moment().subtract(1, 'day')
    };


    candidates[1].visits[0].closed = false;
    candidates[1].visits[0].office = {
      planned: true,
      dateTime: moment().subtract(1, 'minute')
    };

    candidates[2].visits[0].closed = false;
    candidates[2].visits[0].proposal = {
      done: true,
      dateTime: moment().add(2, 'days')
    };

    return Bluebird.resolve(candidates)
      .map(candidate => {
        return candidate.saveAsync();
      })
      .all()
      .then(candidatesSaved => {
        return Candidate.getPendingDecisions();
      })
      .then(todayInterviews => {
        todayInterviews.should.be.a('Array');
        todayInterviews.should.have.length(1);

        todayInterviews[0].should.have.property('firstName', candidates[0].firstName);
        todayInterviews[0].should.have.property('lastName', candidates[0].lastName);
        todayInterviews[0].should.have.property('_position', candidates[0].visits[0].general._position);

        todayInterviews[0].should.have.deep.property('pending.skype');
        moment(todayInterviews[0].pending.skype).isSame(candidates[0].visits[0].skype.dateTime).should.be.true;
        todayInterviews[0].should.have.deep.property('pending.office', false);
        todayInterviews[0].should.have.deep.property('pending.proposal', false);
      });
  });
});
