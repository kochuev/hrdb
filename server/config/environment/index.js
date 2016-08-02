'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // upload dir
  uploadDir: path.normalize(__dirname + '/../../..' + '/uploads'),

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'app-secret'
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  // Calendar configuration
  calendar: {
    id: 'n6uv2beh9186bq34n20rmb4gro@group.calendar.google.com',
    keyFile:  path.normalize(__dirname + '/../../..' + '/.credentials/privateSettings.json'),
    interviewDuration: {
      skype: 30,
      office: 120
    }
  },

  skypeBot: {
    connectorConfig: {
      appId: 'bcba5945-be5a-41ab-b64b-674a9f8a42d0',
      appPassword: 'mTtsRNiEG9bhMe5cn5EkDfi'
    },
    botId: 'hr_bot',
    hrConversation: {id: '19:3504f8beb7234337a29ef21d66e2a3c3@thread.skype'},
    botDisplayName: 'hrbot'
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {});
