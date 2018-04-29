'use strict';

var path = require('path');

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://hrdbmongo/hrdb-dev'
  },

  // Seed database on startup
  seedDB: false,

  calendar: {
    id: '7d16iecqpht25h0cnk8ol17cv0@group.calendar.google.com',
    keyFile:  path.normalize(__dirname + '/../../..' + '/.credentials/HRDB-test.json'),
  },

  skypeBot: {
    hrConversation: {id: '19:5353023a4c9a4412825f8200978f8834@thread.skype'}
  }

};
