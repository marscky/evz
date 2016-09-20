'use strict';

const _ = require('lodash');
const fs = require('fs');
const fsp = require('fs-promise');
const path = require('path');
const PromiseQueue = require('./promise-queue');

const SETTINGS_PATH = path.join(__dirname, '../.settings.json');

// In-memory object store for settings
let settings;

try {
  // Loads JSON from file into settings object
  // Throws error if file not found (flag: r)
  settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
} catch (e) {
  settings = {};
}

/**
 * Queued writeFile with promise
 *
 * As per the API, it is unsafe to use fs.writeFile multiple times on
 * the same file without waiting for the callback, so calls are queued.
 *
 * @param {data} JSON string of settings
 * @return {Promise}
 */
let writeFile = (() => {
  let pq = new PromiseQueue();

  return data => pq.add(fsp.writeFile.bind(fsp, SETTINGS_PATH, data));
})( SETTINGS_PATH );

/**
 * Get setting for a property named key.
 * If no argument are passed in, return the entire settings object.
 * @param  {string} key property name
 * @return {*}  any Javascript value
 * @return {object}  object
 * @throws {TypeError}  If key is not undefined or string
 */
function get(key) {
  if (typeof key === 'undefined') {
    return settings;
  } else if (typeof key === 'string') {
    return settings[key];
  } else {
    throw new TypeError('key is not string or undefined');
  }
}

/**
 * Set a key-value pair in settings object.
 * @param {string} key property name
 * @param {object} key every key-value pairs are added to the settings
 * @param {value} value any Javascript value
 * @return {Promise}
 */
function set(key, value) {
  if (typeof key === 'string') {
    settings[key] = value;
  } else if (typeof key === 'object')  {
    _.each(key, (_value, _key) => {
      settings[_key] = _value;
    });
  }

  return writeFile(JSON.stringify(settings));
}

module.exports = {
  get: get,
  set: set
};
