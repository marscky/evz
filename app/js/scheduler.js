'use strict';

const CronJob = require('cron').CronJob;
const moment = require('moment');
const settings = require('./settings.js');

// In-memory store of last run time as a moment instance
let lastRun;
let nextRun;
let singleton;

// Read last run time from file
try {
  lastRun = moment(Number(settings.get('lastRun')));

  if (!lastRun.isValid()) {
    throw new Error();
  }
} catch(e) {}

/**
 * Creates a new scheduler.
 * @param {object} mb Menubar instance.
 */
function Scheduler(mb) {
  let _this = this;

  let job = new CronJob({
    // Runs every minute at 0 second
    cronTime: '0 * * * * 1-7',
    onTick: function () {
      let current = moment();

      // By noon should have new available evaluation items
      let noon = moment('12', 'H');

      // Next run should be today 21:00
      nextRun = moment('21', 'H');

      // Condition for which we run evaluation
      let condition =
        !lastRun ||
        (lastRun.isBefore(noon) &&
        (current.isSame(nextRun, 'second') ||
         current.isAfter(nextRun, 'second')));

      if (condition) {
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
    let m = moment(ms);
    lastRun = m;
    settings.set('lastRun', m.valueOf());
  };

  this.start = function () {
    job.start();
  };
}

/**
 * Returns the scheduler singleton object.
 * @param  {menubar} mb Menubar instance
 * @return {object}     Scheduler singleton
 */
module.exports =  mb => {
  if (singleton) {
    return singleton;
  } else {
    singleton = new Scheduler(mb);
    return singleton;
  }
};
