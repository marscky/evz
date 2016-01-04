'use strict';

var _ = require('lodash');
var cheerio = require('cheerio');
var http = require('./http.js');
var login = require('./login.js');

/**
 * Get the list of pending evaluation items.
 * @return {promise} resolves with value returned from _getAllId()
 */
function getList () {
  var url = login.getUrl();

  if (!url) { return Promise.reject(new Error('Not logged in')); }

  console.log('eval url', url);

  return http.get(_.extend({ url: url }, http.options))
    .then(function (result) {
      console.log('resolve');
      if (result.response.statusCode === 200) {
        return _getIds(result.body);
      } else {
        return Promise.reject(new Error('Error: status code ' + result.response.statusCode));
      }
    });
}

/**
 * Get all available evaluation IDs from HTML.
 * @param  {string} html HTML
 * @return {array} object with id and title
 */
function _getIds (html) {
  var $ = cheerio.load(html);
  var anchors = $('td > a');
  var links = [];
  var regex = /id=(\d+)/;

  anchors.each(function () {
    var href, match;
    var id, title;

    if ( (href = $(this).attr('href')) && (match = href.match(regex)) ) {
      if (match) {
        id = match[1];
        title = $(this).parent('td').prevAll('[colspan="3"]').text();

        links.push({ id: id, title: title });
      }
    }
  });

  return links;
}

/**
 * Evaluates the item
 * @param  {integer} id teacher id
 * @param  {integer} grading 1-5 (3: neutral, 5: strongly agree)
 * @return {promise}
 */
function evalItem (id, grading) {
  if (!id) { return Promise.reject(new Error('No id supplied')); }

  var form = {
    'response_id': id,
    'Q72': grading || 3,
    'Q73': '',
    'submit': 'Submit'
  };
  var url = 'https://www.imhse.hku.hk/intranet/Evaluation/save.php';

  return http.post(_.extend({ form: form, url: url }, http.options))
    .then(function (result) {
      var response = result.response;
      var body = result.body;
      var $;

      if (response.statusCode === 200) {
        $ = cheerio.load(body);

        // An h2 tag with "Your evaluation is saved. Below is a copy of your submission." is present on successful evaluation.
        if ($('h2')) {
          return true;
        } else {
          return Promise.reject(new Error('Already evaluated. ' + body));
        }
      } else {
        return Promise.reject(new Error('Eval error: status code ' + response.statusCode));
      }
    });
}

exports.getList = getList;
exports.evalItem = evalItem;
