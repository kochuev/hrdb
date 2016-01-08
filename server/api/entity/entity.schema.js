'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var EntitySchema = new mongoose.Schema({
  name: String
});

export default EntitySchema;
