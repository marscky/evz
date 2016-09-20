'use strict';

const keytar = require('keytar');
const settings = require('./settings');

/**
 * Get UID and PIN.
 * @return {false} No credentials are found.
 * @return {Object.<string, string>}
 */
function get() {
  let uid = settings.get('uid');
  let pin;

  if (uid) {
    pin = keytar.getPassword('EVZ', uid);

    if (pin) {
      return { uid, pin };
    }
  }

  return false;
}

function set(uid, pin) {
  if (uid && pin) {
    settings.set('uid', uid);
    if (keytar.replacePassword('EVZ', uid, pin)) {
      return true;
    } else {
      return new Error('Failed to set credentials');
    }
  } else {
    return new Error('Missing credentials');
  }
}

function remove() {
  let uid = settings.get('uid');
  settings.set('uid', '');
  if (uid) {
    keytar.deletePassword('EVZ', uid);
  }
}

module.exports = {
  get: get,
  set: set,
  remove: remove
};
