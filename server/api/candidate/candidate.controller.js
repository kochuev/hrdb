'use strict';

import Bluebird from 'bluebird';
import Candidate from './candidate.model';
import _ from 'lodash';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity || entity.length === 0) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handlePermissions(res, req, statusCode) {
  statusCode = statusCode || 403;
  return function(candidate) {
    if (req.user.hasLimitedPositionAccess() && candidate.visits !== undefined) {
      let poisitionsOfPerson = candidate.visits.map(visit => {
        return visit.general !== undefined ? visit.general._position : undefined;
      })
      if (_.intersection(poisitionsOfPerson, req.user.positionsAccess).length == 0) {
        res.status(statusCode).end();
        return null;
      }
    }
    return candidate;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    //var updated = _.merge(entity, updates);
    var updated = updates;
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Candidate
export function index(req, res) {
  Bluebird
    .all([
      // list with visits
      Candidate.aggregateAsync([
        {
          $unwind: '$visits'
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            firstNameMfn: 1,
            lastNameMfn: 1,
            preferences: 1,
            pending: {
              $cond: { if: { $ne: ['$visits.closed', false] }, then: 0, else: 1 }
            },
            visitDate: '$visits.general.date',
            _position: '$visits.general._position',
            _agency: '$visits.general._agency',
            interviewStatus: {
              $cond: {
                if: { $eq: ['$visits.proposal.done', true] },
                then: ['proposal', '$visits.proposal.date'],
                else: {
                  $cond: {
                    if: { $eq: ['$visits.office.planned', true] },
                    then: ['office', '$visits.office.dateTime'],
                    else: {
                      $cond: {
                        if: { $eq: ['$visits.skype.planned', true] },
                        then: ['skype', '$visits.skype.dateTime'],
                        else: ['cv', '$visits.general.date']
                      }
                    }
                  }
                }
              }
            },
            canBeViewed: (req.user.role == 'admin' || req.user.positionsAccess === undefined || req.user.positionsAccess.length == 0) ? {$literal: 1} : {
              $cond: { if: { $setIsSubset: [['$visits.general._position'], req.user.positionsAccess] }, then: 1, else: 0 }
            }
          }
        },
        {
          $group:{
            _id:{
              _id: '$_id',
              firstName:'$firstName',
              lastName: '$lastName',
              firstNameMfn: '$firstNameMfn',
              lastNameMfn: '$lastNameMfn',
              preferences: '$preferences'
            },
            pending:{
              $max: '$pending'
            },
            lastVisitDate:{
              $last: '$visitDate'
            },
            _lastVisitPosition:{
              $last: '$_position'
            },
            _lastVisitAgency:{
              $last: '$_agency'
            },
            interviewStatus:{
              $last: '$interviewStatus'
            },
            canBeViewed: {
              $max: '$canBeViewed'
            }
          }
        },
        {
          $match: {
            'canBeViewed': 1
          }
        },
        {
          $project:{
            _id: '$_id._id',
            firstName: '$_id.firstName',
            lastName: '$_id.lastName',
            firstNameMfn: '$_id.firstNameMfn',
            lastNameMfn: '$_id.lastNameMfn',
            preferences: '$_id.preferences',
            pending: 1,
            lastVisitDate: 1,
            _lastVisitPosition: 1,
            _lastVisitAgency: 1,
            interviewStatus: 1,
          }
        }
      ]),
      // lists with empty visists
      Candidate.findAsync({
          visits: { $size: 0 }
        },
        {
          _id: 1,
          firstName: 1,
          lastName: 1,
          preferences: 1
      })
    ])
    .then(lists => {
      let combinedList = lists.reduce((a, b) => {
        return a.concat(b);
      });

      res.status(200).json(combinedList);
    })
    .catch(handleError(res));
}

// Gets a single Candidate from the DB
export function show(req, res) {
  Candidate.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(handlePermissions(res, req))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Creates a new Candidate in the DB
export function create(req, res) {
  Candidate.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Candidate in the DB
export function update(req, res) {
  var newCandidate = req.body;

  Candidate.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(handlePermissions(res, req))
    .then(res => Candidate.findByIdAndUpdateAsync(req.params.id, newCandidate, {overwrite: true}))
    .then(res => Candidate.findByIdAsync(req.params.id))
    .then(handlePermissions(res, req))
    .then(responseWithResult(res))
    .catch(handleError(res));

}

// Deletes a Candidate from the DB
export function destroy(req, res) {
  Candidate.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(handlePermissions(res, req))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Finds a Candidate from the DB
export function find(req, res) {
  Candidate.findAsync(req.body.query, '-visits')
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Return statistics by origin/agency for position
export function statsByPosition(req, res) {
  let positionId = req.params.id;

  if (req.user.hasLimitedPositionAccess()) {
    if (req.user.positionsAccess.indexOf(positionId) == -1) {
      res.send(403).end;
      return;
    }
  }

  let groupId;
  if (req.params.by == 'agency') {
    groupId = {agency: '$visits.general._agency'};
  } else {
    groupId = {origin: '$visits.general._origin'};
  }

  let aggregateQuery = [
    { $unwind : "$visits" },
    {
      $match: {
        'visits.general._position': positionId
      }
    },
    {
      $project: {
        visits: 1,
        skype: { $cond: ['$visits.skype.planned', 1, 0]},
        office: { $cond: ['$visits.office.planned', 1, 0]},
        proposal: { $cond: ['$visits.proposal.done', 1, 0]},
        hire: { $cond: [{ $eq: [ '$visits.closed', 'hired' ] }, 1, 0] },
      }
    },
    {
      $group : {
        _id: groupId,
        total: { $sum: 1 },
        skype: { $sum:  '$skype'},
        office: { $sum: '$office' },
        proposal: { $sum: '$proposal' },
        hire: { $sum: '$hire' },
      }
    },
    {
      $sort: {
        proposal : -1
      }
    }
  ];

  Candidate.aggregateAsync(aggregateQuery)
    .then(stats => {
      res.status(200).json(stats);
    })
    .catch(handleError(res));
}

// Return statistics by origin/agency for position
export function statsByMonth(req, res) {
  let positionId = req.params.id;

  if (req.user.hasLimitedPositionAccess()) {
    if (req.user.positionsAccess.indexOf(positionId) == -1) {
      res.send(403).end;
      return;
    }
  }

  let aggregateQuery = [
    { $unwind : "$visits" },
    {
      $match: {
      'visits.general._position': positionId
      }
    },
    {
      $project: {
        month: { $month: '$visits.general.date' },
        year: { $year: '$visits.general.date' },
      }
    },
    {
      $group : {
        _id: {year: '$year', month: '$month'},
        total: { $sum: 1 }
      }
    },
    {
      $sort: {
        '_id.year' : 1,
        '_id.month': 1
      }
    }
  ];

  Candidate.aggregateAsync(aggregateQuery)
    .then(stats => {
      let result1 = {};
      let result2 = [];
      let statsFromDate = null;

      stats.forEach(val => {
        let statDate = new Date();

        statDate.setMonth(val._id.month - 1, 1);
        statDate.setFullYear(val._id.year);
        statDate.setHours(0,0,0,0);

        result1[statDate] = val.total;

        if (statsFromDate === null) {
          statsFromDate = new Date(statDate.getTime());
        }
      });

      let now = new Date();
      while (statsFromDate <= now) {
        if (result1[statsFromDate] === undefined) {
          result2.push({date: new Date(statsFromDate.getTime()), total: 0});
        } else {
          result2.push({date: new Date(statsFromDate.getTime()), total: result1[statsFromDate]});
        }
        statsFromDate.setMonth(statsFromDate.getMonth()+1);
      }

      res.status(200).json(result2);
    })
    .catch(handleError(res));
}