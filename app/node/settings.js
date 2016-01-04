'use strict';

var _ = require('lodash');
var denodeify = require('denodeify');
var fs = require('fs');
var path = require('path');
var PromiseQueue = require('./promise_queue.js');

var SETTINGS_PATH = path.join(__dirname, '../assets/settings.json');

// In-memory object store for settings
var settings;

try {
  // Loads JSON from file into settings object
  // Throws error if file not found (flag: r)
  settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
} catch (e) {
  settings = {};
}

/**
 * Promisified fs.writeFile
 * As per the API, it is unsafe to use fs.writeFile multiple times on
 * the same file without waiting for the callback, so calls are queued.
 *
 * @param  {data} JSON string of settings
 * @return {Promise}
 */
var writeFile = (function () {
  var _writeFile = denodeify(fs.writeFile);
  var pq = new PromiseQueue();

  /**
   * writeFile
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  return function (data) {
    return pq.add(_writeFile.bind(fs, SETTINGS_PATH, data));
  };
})( SETTINGS_PATH );

/**
 * Get setting for a property named key.
 * If no argument are passed in, return the entire settings object.
 * @param  {string} key property name
 * @return {value}  any Javascript value
 * @return {object} settings object
 * @throws {TypeError} If key is not undefined or string
 */
function get (key) {
  if (typeof key === 'undefined') {
    return settings;
  } else if (typeof key === 'string') {
    return settings[key];
  } else {
    throw new TypeError('key is not string or undefined');
  }
}

/**
 * Set property with a name key as value.
 * @param {string} key property name
 * @param {object} key every key-value pairs are added to the settings
 * @param {value} value any Javascript value
 * @return {Promise}
 */
function set (key, value) {
  if (typeof key === 'string') {
    settings[key] = value;
  } else if (typeof key === 'object')  {
    _.each(key, function (_value, _key) {
      settings[_key] = _value;
    });
  }

  return writeFile(JSON.stringify(settings));
}

exports.get = get;
exports.set = set;
