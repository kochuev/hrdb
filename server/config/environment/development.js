'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://hrdbmongo/hrdb-dev'
  },

  uploadDir: '/data/uploads',

  // Seed database on startup
  seedDB: true

};
