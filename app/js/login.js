'use strict';

const _ = require('lodash');
const httpOptions = require('./httpOptions');
const request = require('request-promise-native');

// Eval page URL without the logged in ticket fragment
const EVAL_URL = 'https://www.bimhse.hku.hk/intranet/Evaluation/index.php';

// URL for logging in to eval page
const LOGIN_URL = 'https://hkuportal.hku.hk/cas/servlet/' +
                  'edu.yale.its.tp.cas.servlet.Login?service=' +
                  EVAL_URL;

// Url to evaluation page after succesful login
let loggedInUrl;
let ticket;

function getUrl() {
  return loggedInUrl;
}

function getTicket() {
  return ticket;
}

/**
 * Returns current timestamp string for POST login.
 * @return {string}
 */
function getTimestamp() {
  const time = new Date();
  return '' + time.getFullYear() + time.getMonth()+
              time.getDate()     + time.getHours()+
              time.getMinutes()  + time.getSeconds();
}

/**
 * Get a random number within the bounds of the login button [0, 68].
 * @return {number}
 */
function getRandomCoords() {
  return Math.floor(Math.random() * 68);
}

/**
 * Login to evaluation page.
 * @param  {string} uid
 * @param  {string} pin
 * @return {Promise.<string>} URL to evaluation page.
 */
function login(uid, pin) {
  const form = {
    keyid: getTimestamp(),
    service: EVAL_URL,
    username: uid,
    password: pin,
    x: getRandomCoords(),
    y: getRandomCoords()
  };

  // Ensure entered creds are not empty and are string
  if (!uid || !pin || typeof uid !== 'string' || typeof pin !== 'string') {
    return Promise.reject(new TypeError(`No or invalid credentials are supplied: {${uid}, ${pin}}`));
  }

  // Mock logged in
  if (process.env.NODE_ENV === 'ui') {
    loggedInUrl = 'https://www.bimhse.hku.hk/intranet/Evaluation/index.php?ticket=ST-118126-yCXDVd5cZqUWELOWpZ10';
    ticket = 'ST-118126-yCXDVd5cZqUWELOWpZ10';
    return Promise.resolve(loggedInUrl);
  }

  return request.post(_.extend({ url: LOGIN_URL, form }, httpOptions))
    .then(result => {
      // On successful login, the HTML will have the following inline JS
      //
      //  var url = "https://www.bimhse.hku.hk/intranet/Evaluation/index.php?ticket=ST-118126-yCXDVd5cZqUWELOWpZ10";
      //
      // Search for this url to determine if login is successful. There will be two url in the HTML, only search for the first one.
      //
      // The logged in url is in the captured group.
      // Note the escape of the backlash for a literal ? in the regex.
      const regex = new RegExp(`"(${_.escapeRegExp(EVAL_URL)}\\?ticket=.+?)"`);

      let match = result.match(regex);
      if (match) {
        // Second element of match result is the captured group
        loggedInUrl = match[1];

        // Save ticket
        ticket = loggedInUrl.substr(loggedInUrl.indexOf('='));
        return loggedInUrl;
      } else {
        return Promise.reject(new Error('Login failed'));
      }
    });
}

module.exports = {
  getUrl,
  getTicket,
  login
};
