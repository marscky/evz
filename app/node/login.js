'use strict';

var _ = require('lodash');
var http = require('./http.js');

var LOGIN_URL = 'https://hkuportal.hku.hk/cas/servlet/edu.yale.its.tp.cas.'+
                'servlet.Login?service=https://www.imhse.hku.hk/intranet/'+
                'Evaluation/';
var loginOptions = _.extend({ url: LOGIN_URL }, http.options);

// URL to evaluation page, set to the URL obtained from doLogin()
var loggedInUrl = '';

/**
 * Returns loggedInUrl
 * @return {string}
 */
function getUrl () {
  return loggedInUrl;
}

/**
 * Check if we are currently logged in by going to the evaluation page.
 * @return {promise}
 */
function isLoggedIn () {
  if (loggedInUrl.length === 0) {
    return Promise.resolve(false);
  }

  return http.get(_.extend({ url: loggedInUrl }, http.options))
    .then(function (result) {
      // Check redirects by comparing final href
      // Or, check length of redirects array (result.response.request._redirect.redirects.length)
      console.log(result.response.request.uri.href);
      return result.response.request.uri.href !== loggedInUrl ? false : true;
    });
}

/**
 * Login to evaluation page.
 * @param  {string} uid
 * @param  {string} pin
 * @return {promise} resolves with url to evaluation page
 */
function doLogin (uid, pin) {
  var form = {
    keyid: getTimeStamp(),
    username: uid,
    password: pin,
    x: getRandomInt(0, 68),
    y: getRandomInt(0, 68),
  };

  // Ensures credentials supplied are strings, and that they are not empty
  if (!uid || !pin || typeof uid !== 'string' || typeof pin !== 'string' ) {
    return Promise.reject(new TypeError(`No or invalid credentials are supplied: ${typeof uid}, ${typeof pin}`));
  }

  return http.post(_.extend({ form: form }, loginOptions))
    .then(function (result) {
      var response = result.response;
      var body = result.body;
      var regex = /"(https:\/\/www\.imhse\.hku\.hk\/intranet\/Evaluation\/\?ticket=.+?)"/;

      if (response.statusCode === 200) {
        // Match URL to evaluation page
        var match = body.match(regex);
        return match ? (loggedInUrl = match[1]) : Promise.reject(new Error('Invalid credentials'));
      } else {
        return Promise.reject(new Error('Login error: '+response.statusCode));
      }
    });

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function getTimeStamp () {
    var time = new Date();
    return '' + time.getFullYear() + time.getMonth()+
                time.getDate()     + time.getHours()+
                time.getMinutes()  + time.getSeconds();
  }
}

exports.getUrl = getUrl;
exports.isLoggedIn = isLoggedIn;
exports.login = doLogin;
