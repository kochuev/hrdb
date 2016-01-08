'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var FileSchema = new mongoose.Schema({
  originalName: String,
  path: String,
  name: String
});

export default mongoose.model('File', FileSchema);
