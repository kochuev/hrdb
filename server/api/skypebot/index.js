'use strict';

import {Router} from 'express';
import * as builder from 'botbuilder';
import config from '../../config/environment';
import calendar from '../../components/calendar';
import Candidate from '../candidate/candidate.model';
import Position from '../candidate/position.model';
import Bluebird from 'bluebird';
import SkypeHelper from './skype';
import moment from 'moment';
import schedule from 'node-schedule';
import _ from 'lodash';
import metaphone from '../../components/metaphone';


moment.locale('ru');

var router = new Router();

// Create chat bot
var connector = new builder.ChatConnector(config.skypeBot.connectorConfig);
var bot = new builder.UniversalBot(connector);
router.post('/', connector.listen());

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({version: 1.0, resetCommand: /^reset/i}));

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', new builder.IntentDialog()
  .matches(/(\s|^)(что|кто)\s+сегодня/i, '/today')
  .matches(/(\s|^)кто\s+(ждет|ждут)/i, '/decisions')
  .onDefault('/about')
);

bot.dialog('/about', [
  function (session) {
    let nameParts = _.words(session.message.text, /[\-\w\u0430-\u044f]+/ig);

    // first word @hrbot reference, so remove it
    if (nameParts[0] == config.skypeBot.botDisplayName) {
      nameParts.shift();
    }

    let nameMetaphoneRegExps = nameParts.map(elm => {
      return new RegExp('^' + metaphone(elm) + '$', 'i');
    });

    let messages = [];
    if (nameParts.length === 1) {
      messages.push(
        Candidate.findAsync({lastNameMfn: nameMetaphoneRegExps[0]})
          .then(SkypeHelper.formatAboutList)
      );

    }
    else if (nameParts.length === 2) {
      messages.push(
        Candidate.findAsync({firstNameMfn: nameMetaphoneRegExps[0], lastNameMfn: nameMetaphoneRegExps[1]})
          .then(SkypeHelper.formatAboutList)
      );
      messages.push(
        Candidate.findAsync({firstNameMfn: nameMetaphoneRegExps[1], lastNameMfn: nameMetaphoneRegExps[0]})
          .then(SkypeHelper.formatAboutList)
      );
    }

    Bluebird
      .all(messages)
      .then(messages => {
        return [].concat.apply([], messages);
      })
      .each(message => {
        session.send(message);
      })
      .then(messages => {
        if (messages.length === 0)
          session.beginDialog("/notfound");
        else
          session.endDialog();
      })
      .catch(err => {
        console.error('There was an error composing about candidates reply message: ' + err);
        throw err;
      })
  }
]);

bot.dialog('/notfound', [
  function (session) {
    session.endDialog('Ничего не знаю о таком кандидате');
  }
]);

bot.dialog('/today', [
  function (session) {
    Candidate.getTodayInterviews()
      .then(SkypeHelper.formatInterviewsList)
      .then(messages => {
        if (messages.length)
          session.send("Сегодня назначены такие собеседования:");
        return messages;
      })
      .each(message => {
        session.send(message);
      })
      .then(messages => {
        if (messages.length === 0)
          session.endDialog("Сегодня нет запланированных собеседований");
        else
          session.endDialog();
      })
      .catch(err => {
        console.error('There was an error composing today interviews reply message: ' + err);
        throw err;
      });
  }
]);

bot.dialog('/decisions', [
  function (session) {
    Candidate.getPendingDecisions()
      .then(SkypeHelper.formatDecisionsList)
      .then(messages => {
        if (messages.length)
          session.send("Следующие кандидаты ожидают нашего решения:");
        return messages;
      })
      .each(message => {
        session.send(message);
      })
      .then(messages => {
        if (messages.length === 0)
          session.endDialog("От нас никто ничего не ждет");
        else
          session.endDialog();
      })
      .catch(err => {
        console.error('There was an error composing pending decision visits reply message: ' + err);
        throw err;
      });
  }
]);


//=========================================================
// Bots Group Notification
//=========================================================

function sendMessageToGroupChat(text) {
  const hrChatGroupAddress = {
    channelId: 'skype',
    conversation: config.skypeBot.hrConversation,
    recipient: {id: '28:' + config.skypeBot.connectorConfig.appId, name: config.skypeBot.botDisplayName},
    serviceUrl: 'https://skype.botframework.com',
    useAuth: true
  };

  return new Bluebird((resolve, reject) => {
    var message = new builder.Message();
    message.address(hrChatGroupAddress);
    message.text(text);
    bot.send(message, () => {
      resolve();
    });
  });
}

function getPosition(_id) {
  return Position.findByIdAsync(_id)
    .then(position => position.name);
}


schedule.scheduleJob('30 9 * * 1-5', function() {
  Candidate.getPendingDecisions()
    .then(SkypeHelper.formatDecisionsList)
    .then(messages => {
      if (messages.length)
        return sendMessageToGroupChat("Следующие кандидаты ожидают нашего решения:").then(() => messages);
      return messages;
    })
    .each(message => {
      return sendMessageToGroupChat(message);
    })
    .then(()=> {
      return Candidate.getTodayInterviews();
    })
    .then(SkypeHelper.formatInterviewsList)
    .then(messages => {
      if (messages.length)
        return sendMessageToGroupChat("Сегодня назначены такие собеседования:").then(() => messages);
      return messages;
    })
    .each(message => {
      return sendMessageToGroupChat(message);
    })
    .catch(err => {
      console.error('There was an error composing pending decision visits reply message: ' + err);
      throw err;
    });
});

calendar.on('interviewAdded', data => {
  getPosition(data.visit.general._position)
    .then(position => {
      sendMessageToGroupChat(
        'У нас НОВОЕ ' + data.type + ' собеседование на позицию ' + position
        + ' с ' + data.candidate.firstName + ' ' + data.candidate.lastName
        + ', которое состоится ' + moment(data.newDateTime).calendar().toLowerCase(),
      );
    });
});

calendar.on('interviewChanged', data => {
  getPosition(data.visit.general._position)
    .then(position => {
      sendMessageToGroupChat(
        'Внимание! ПЕРЕНОС ' + data.type + ' собеседования на позицию ' + position
        + ' с ' + data.candidate.firstName + ' ' + data.candidate.lastName
        + '. Собеседование было состояться ' + moment(data.oldDateTime).calendar().toLowerCase()
        + ', но состоиться ' + moment(data.newDateTime).calendar().toLowerCase()
      );
    });
});

calendar.on('interviewCanceled', data => {
  getPosition(data.visit.general._position)
    .then(position => {
      sendMessageToGroupChat(
        'Отменяется ' + data.type + ' собеседование на позицию ' + position
        + ' с ' + data.candidate.firstName + ' ' + data.candidate.lastName
        + ', которое должно было состояться ' + moment(data.oldDateTime).calendar().toLowerCase()
      );
    });
});

module.exports = router;
