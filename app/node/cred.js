'use strict';

var keytar = require('keytar');
var settings = require('./settings.js');

/**
 * Get credentials
 * @return {boolean} false when no uid is found
 * @return {string} when only uid is found
 * @return {object} when both uid and pin are present
 */
function getCredentials () {
  var uid = settings.get('uid');
  var pin;

  if (uid) {
    pin = keytar.getPassword('EVZ', uid);

    if (pin) {
      return { uid: uid, pin: pin };
    } else {
      return uid;
    }
  }

  return false;
}

/**
 * Set credntials
 * @param {string} uid UID
 * @param {string} pin PIN
 */
function setCredentials (uid, pin) {
  if (uid && pin) {
    settings.set('uid', uid);
    if (keytar.replacePassword('EVZ', uid, pin)) {
      return true;
    } else {
      return new Error('keytar failure');
    }
  } else {
    return Error('Missing credentials');
  }
}

function removeCredentials () {
  var uid = settings.get('uid');

  settings.set('uid', '');
  if (uid) {
    keytar.deletePassword('EVZ', uid);
  }
}

exports.getCredentials = getCredentials;
exports.removeCredentials = removeCredentials;
exports.setCredentials = setCredentials;
