"use strict";

import Candidate from '../candidate/candidate.model';
import Position from '../candidate/position.model';
import Agency from '../candidate/agency.model';
import Bluebird from 'bluebird';
import moment from 'moment';

/**
 *
 * @param {Object[]} candidates
 * @returns {Promise}
 */
function formatAboutList(candidates) {
  return Bluebird.resolve(candidates)
    .map(candidate => {
      candidate.visits.splice(0, candidate.visits.length-1);
      return candidate
        .populate('visits.general._position')
        .populate('visits.general._agency')
        .execPopulate();
    })
    .map(candidate => {
      let message = candidate.firstName + ' ' + candidate.lastName;
      let lastVisit = candidate.visits.pop();
      if (lastVisit) {
        message += ' был(а) у нас ' + moment(lastVisit.general.date).format('L');
        message += ' на вакансию ' + lastVisit.general._position.name;

        if (lastVisit.general._agency) {
          message += ' от агенства ' + lastVisit.general._agency.name;
        } else {
          message += ' без агенства';
        }
      } else {
        message += ' никогда у нас не был(а), но мы откуда-то знаем об этом кандидате'
      }

      message += '\n ' + process.env.DOMAIN + '/candidate/' + candidate._id;

      return message;
    });
}

/**
 *
 * @param {Object[]} candidates
 * @returns {Promise}
 */
function formatInterviewsList(candidates) {
  return Bluebird.resolve(candidates)
    .map(candidate => {
        return Candidate.populateAsync(candidate, {path: '_position', model: 'Position'});
    })
    .map(candidate => {
      return "- " + candidate.interviewType + ' собеседование на позицию ' + candidate._position.name
        + ' с ' + candidate.firstName + ' ' + candidate.lastName
        + ' на ' + moment(candidate[candidate.interviewType].dateTime).format('LTS');
    });
}

/**
 *
 * @param {Object[]} candidates
 * @returns {Promise}
 */
function formatDecisionsList(candidates) {
  return Bluebird.resolve(candidates)
    .map(candidate => {
      return Candidate.populateAsync(candidate, {path: '_position', model: 'Position'});
    })
    .map(candidate => {
      let message = "- " + candidate.firstName + ' ' + candidate.lastName + ' на позицию ' + candidate._position.name;
      if (candidate.pending.proposal) {
        message += ' должен что-то ответить по нашему офферу, сделанному ' + moment(candidate.pending.proposal).calendar().toLowerCase();
      } else if (candidate.pending.office) {
        message += ' ждет офера или отказа по результатам собеседования в офисе, проведенного ' + moment(candidate.pending.office).calendar().toLowerCase();
      } else if (candidate.pending.skype) {
        message += ' ждет приглашения в офис или отказа по результатам собеседования в скайпе, проведенного ' + moment(candidate.pending.skype).calendar().toLowerCase();
      } else {
        message += ' ждет решения по его резюме';
      }
      return message;
    });
}

module.exports.formatAboutList = formatAboutList;
module.exports.formatDecisionsList = formatDecisionsList;
module.exports.formatInterviewsList = formatInterviewsList;
