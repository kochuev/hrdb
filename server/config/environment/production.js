'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:     process.env.OPENSHIFT_NODEJS_IP ||
          process.env.IP ||
          undefined,

  // Server port
  port:   process.env.OPENSHIFT_NODEJS_PORT ||
          process.env.PORT ||
          8080,

  // MongoDB connection options
  mongo: {
    uri:  process.env.MONGOLAB_URI ||
          process.env.MONGOHQ_URL ||
          process.env.OPENSHIFT_MONGODB_DB_URL +
          process.env.OPENSHIFT_APP_NAME ||
          process.env.MONGO_URL ||
          'mongodb://hrdbmongo/hrdb'
  },

  uploadDir: process.env.UPLOAD_DIR,

  calendar: {
    id: process.env.GOOGLE_CALENDAR_ID,
    keyFile: process.env.GOOGLE_KEY_FILE
  },

  skypeBot: {
    hrConversation: {id: '19:3504f8beb7234337a29ef21d66e2a3c3@thread.skype'}
  }
};
