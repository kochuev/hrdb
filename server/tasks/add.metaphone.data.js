'use strict';

import mongoose from 'mongoose';
import config from '../config/environment';
import Candidate from '../api/candidate/candidate.model';

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

var cursor = Candidate.find({}).cursor();

cursor.on('error', function (err) {
  console.error('Mongoose stream error: ' + err);
  process.exit(-1);
});

cursor.eachAsync((candidate) => {
  console.log(candidate.saveAsync());
  return candidate.saveAsync();
}, () => {
  console.log('All documents have been processed');
  cursor.close();
  mongoose.connection.close();
})
