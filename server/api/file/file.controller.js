/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/things              ->  index
 * POST    /api/things              ->  create
 * GET     /api/things/:id          ->  show
 * PUT     /api/things/:id          ->  update
 * DELETE  /api/things/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import config from '../../config/environment';
import File from './file.model';
import multiparty from 'multiparty';
import fs from 'fs-extra';
import path from 'path';
import shortid from 'shortid';

var translit = require('translit')(config.translitMap);

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    if (err)
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

// Sends file
export function download(req, res) {
  if (fs.existsSync(path.join(config.uploadDir, req.params.id))) {
    var options = {
      root: config.uploadDir,
      dotfiles: 'deny',
      headers: {
        'Content-Disposition': 'attachment; filename=' + req.params.id
      }
    };
    res.sendFile(req.params.id, options, handleError(res));
  } else {
    res.status(404).end();
  }
}

// Handles file upload
export function upload(req, res) {
  var form = new multiparty.Form();

  var uploadedFile = null;
  var userPrefix = null;

  form.on('file', (name, uploaded) => {
    uploadedFile = uploaded;
  });

  form.on('field' ,(name, value) => {
    if (name == 'candidateName') {
      userPrefix = translit(value)
                    .replace(/\s+/, '-')
                    .replace(/[^a-zA-Z0-9\-]/ , '');
    }
  });

  form.on('close', () => {
    var newFilename = userPrefix + '-' + shortid.generate() + path.extname(uploadedFile.originalFilename);

    var newPath = path.join(config.uploadDir, newFilename);
    fs.copySync(uploadedFile.path, newPath);

    res.status(201).json({id: newFilename, path: newPath});

  })

  form.on('error', handleError(res));

  form.parse(req);
}

// Deletes a file
export function destroy(req, res) {
  fs.unlink(path.join(config.uploadDir, req.params.id), (err) => {
    if (err)
      handleError(res)(err);
    else
      res.status(204).end();
  });
}
