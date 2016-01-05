'use strict';

var CronJob = require('cron').CronJob;
var moment = require('moment');
var settings = require('./settings.js');

// In-memory store of last run time as a moment instance
var lastRun;

// Read last run time from file
try {
  lastRun = moment( Number(settings.get('lastRun')) );

  if (!lastRun.isValid()) { throw new Error(); }
} catch(e) {}

var nextRun;

var singleton;

function Scheduler (mb) {
  var _this = this;

  var job = new CronJob({
    // Runs every minute at 0 second
    cronTime: '0 * * * * 1-7',
    onTick: function () {
      var current = moment();

      // By noon should have new available evaluation items
      var noon = moment('12', 'H');

      // Next run should be today 21:00
      nextRun = moment('21', 'H');

      // Condition for which we run evaluation
      var condition =
        !lastRun ||
        (lastRun.isBefore(noon) &&
          (current.isSame(nextRun, 'second') ||
           current.isAfter(nextRun, 'second'))
        );

      if (condition) {
        console.log('node-cron onTick');

        // Update lastRun
        _this.setLastRun(current);

        // Do evaluation
        mb.window.webContents.send('do-eval');
      }
    }
  });

  /**
   * Set last run time.
   * @param {integer} ms unix offset
   */
  this.setLastRun = function (ms) {
    var m = moment(ms);
    console.log('Set last run', m.format());
    lastRun = m;
    settings.set('lastRun', m.valueOf());
  };

  this.start = function () {
    console.log('Cron job started.');
    job.start();
  };
}

// mb: menubar instances
module.exports = function (mb) {
  if (singleton) {
    console.log('Return singleton');
    return singleton;
  } else {
    console.log('Create singleton');
    singleton = new Scheduler(mb);
    return singleton;
  }
};
