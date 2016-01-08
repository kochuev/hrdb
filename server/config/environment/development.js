'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://hrdbmongo/app-dev'
  },

  uploadDir: '/vol/app/uploads',

  // Seed database on startup
  seedDB: true

};
