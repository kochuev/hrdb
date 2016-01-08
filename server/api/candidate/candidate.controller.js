'use strict';

import _ from 'lodash';
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
    if (!entity) {
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
          $cond: { if: { $eq: ['$visits.closed', false] }, then: true, else: false }
        }
      }
    },
    {
      $group:
      {
        _id:
        {
          _id: '$_id',
          firstName:'$firstName',
          lastName: '$lastName',
          preferences: '$preferences'
        },
        pending:
        {
          $max: '$pending'
        }
      }
    },
    {
      $project:
      {
        _id: '$_id._id',
        firstName: '$_id.firstName',
        lastName: '$_id.lastName',
        preferences: '$_id.preferences',
        pending: 1
      }
    }
  ])
    .then(responseWithResult(res))
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
  //if (req.body._id) {
  //  delete req.body._id;
  //}
  Candidate.findByIdAndUpdateAsync(req.params.id, req.body , {overwrite: true})
    .then(handleEntityNotFound(res))
    //.then(saveUpdates(req.body))
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
