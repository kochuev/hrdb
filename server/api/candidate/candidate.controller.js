'use strict';

import Bluebird from 'bluebird';
import Candidate from './candidate.model';

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
                then: ['proposal'],
                else: {
                  $cond: {
                    if: { $eq: ['$visits.office.planned', true] },
                    then: ['office', '$visits.office.dateTime'],
                    else: {
                      $cond: {
                        if: { $eq: ['$visits.skype.planned', true] },
                        then: ['skype', '$visits.skype.dateTime'],
                        else: ['cv']
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          $group:{
            _id:{
              _id: '$_id',
              firstName:'$firstName',
              lastName: '$lastName',
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
            }
          }
        },
        {
          $project:{
            _id: '$_id._id',
            firstName: '$_id.firstName',
            lastName: '$_id.lastName',
            preferences: '$_id.preferences',
            pending: 1,
            lastVisitDate: 1,
            _lastVisitPosition: 1,
            _lastVisitAgency: 1,
            interviewStatus: 1
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

  Candidate.findByIdAndUpdateAsync(req.params.id, newCandidate, {overwrite: true})
    .then(handleEntityNotFound(res))
    .then(res => Candidate.findByIdAsync(req.params.id))
    .then(responseWithResult(res))
    .catch(handleError(res));

}

// Deletes a Candidate from the DB
export function destroy(req, res) {
  Candidate.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Finds a Candidate from the DB
export function find(req, res) {
  Candidate.findAsync(req.body.query)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}
