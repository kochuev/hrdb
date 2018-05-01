'use strict';

import Candidate from "../candidate/candidate.model";
import moment from 'moment';


export function visitsByMonth(req, res) {

  let timezoneOffset = moment().format('ZZ');

  let aggregateQuery = [
    {$unwind: "$visits"},
    {
      $match: getAggregateQueryMatch(req)
    },
    {
      $project: {
        month: {$month: {date: '$visits.general.date', timezone: timezoneOffset}},
        year: {$year: {date: '$visits.general.date', timezone: timezoneOffset}},
      }
    },
    {
      $group: {
        _id: {year: '$year', month: '$month'},
        total: {$sum: 1}
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    }
  ];

  Candidate.aggregate(aggregateQuery)
      .then(stats => {

        if (stats.length === 0) {
          res.status(200).json([])
          return;
        }

        let result1 = {};
        let result2 = [];
        let statsFromDate = null;
        let statsTillDate = null;

        stats.forEach(val => {
          let statDate = new Date();

          statDate.setMonth(val._id.month - 1, 1);
          statDate.setFullYear(val._id.year);
          statDate.setHours(0, 0, 0, 0);

          result1[statDate] = val.total;

          if (statsFromDate === null) {
            statsFromDate = new Date(statDate.getTime());
          }

          if (statDate.getTime() > statsTillDate) {
            statsTillDate = new Date(statDate.getTime());
          }

        });

        while (statsFromDate <= statsTillDate) {
          if (result1[statsFromDate] === undefined) {
            result2.push({date: new Date(statsFromDate.getTime()), total: 0});
          } else {
            result2.push({date: new Date(statsFromDate.getTime()), total: result1[statsFromDate]});
          }
          statsFromDate.setMonth(statsFromDate.getMonth() + 1);
        }

        res.status(200).json(result2);
      })
      .catch(handleError(res));
}

export function visitsByGroup(req, res) {

  let aggregateQueryGroup = {
    _id: undefined,
    total: {$sum: 1},
    skype: {$sum: '$skype'},
    office: {$sum: '$office'},
    proposal: {$sum: '$proposal'},
    hire: {$sum: '$hire'},
  };

  switch (req.params.group) {
    case 'agency':
      aggregateQueryGroup._id = {agency: '$visits.general._agency'};
      break;
    case 'position':
      aggregateQueryGroup._id = {position: '$visits.general._position'};
      break;
    case 'origin':
      aggregateQueryGroup._id = {origin: '$visits.general._origin'};
      break;
    default:
      //TODO: throw an error or send 404 and return?
  }

  let aggregateQuery = [
    {$unwind: "$visits"},
    {
      $match: getAggregateQueryMatch(req)
    },
    {
      $project: {
        visits: 1,
        skype: {$cond: ['$visits.skype.planned', 1, 0]},
        office: {$cond: ['$visits.office.planned', 1, 0]},
        proposal: {$cond: ['$visits.proposal.done', 1, 0]},
        hire: {$cond: [{$eq: ['$visits.closed', 'hired']}, 1, 0]},
      }
    },
    {
      $group: aggregateQueryGroup
    },
    {
      $sort: {
        proposal: -1
      }
    }
  ];

  Candidate.aggregate(aggregateQuery)
      .then(stats => {
        res.status(200).json(stats);
      })
      .catch(handleError(res));
}

function getAggregateQueryMatch(req) {

  let startDate,
      endDate,
      positions;

  let aggregateQueryMatch = {};

  if (req.query.startDate) {
    startDate = new Date(req.query.startDate);
  }

  if (req.query.endDate) {
    endDate = new Date(req.query.endDate);
  }

  if (req.query.positions) {
    positions = Array.isArray(req.query.positions) ? req.query.positions : [req.query.positions];
  } else if (req.user.hasLimitedPositionAccess()) {
    positions = req.user.positionsAccess;
  }

  // For now positions is required parameter, but we check it anyway
  if (positions) {
    aggregateQueryMatch['visits.general._position'] = {$in: positions};
  }

  if (startDate || endDate) {
    aggregateQueryMatch['visits.general.date'] = {};
  }

  if (startDate) {
    aggregateQueryMatch['visits.general.date'].$gte = startDate;
  }

  if (endDate) {
    aggregateQueryMatch['visits.general.date'].$lt = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
  }

  return aggregateQueryMatch;
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}