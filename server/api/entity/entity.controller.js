'use strict';

import _ from 'lodash';
import EntitySchema from './entity.schema';
var mongoose = require('bluebird').promisifyAll(require('mongoose'));

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
    var updated = _.merge(entity, updates);
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

// Gets a list of Agencies
export function index(req, res) {
  var Entity = mongoose.model(req.params.entity, EntitySchema);
  Entity.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Gets a single Agency from the DB
export function show(req, res) {
  var Entity = mongoose.model(req.params.entity, EntitySchema);
  Entity.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Creates a new Agency in the DB
export function create(req, res) {
  var Entity = mongoose.model(req.params.entity, EntitySchema);
  Entity.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Agency in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  var Entity = mongoose.model(req.params.entity, EntitySchema);

  Entity.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Deletes a Agency from the DB
export function destroy(req, res) {
  var Entity = mongoose.model(req.params.entity, EntitySchema);

  Entity.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
