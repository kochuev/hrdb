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
    session: process.env.SESSION_SECRET ||  'app-secret'
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
    id: '',
    keyFile:  '',
    interviewDuration: {
      skype: 30,
      office: 120
    }
  },

  skypeBot: {
    connectorConfig: {
      appId: process.env.MS_APP_ID,
      appPassword: process.env.MS_APP_PASSWORD
    },
    hrConversation: {id: ''},
    botId: 'hr_bot',
    botDisplayName: 'hrbot'
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {});
