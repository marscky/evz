'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const fsp = require('fs-promise');
const path = require('path');
const request = require('request-promise-native');

const httpOptions = require('./httpOptions');
const login = require('./login');

/**
 * Get list of pending evaluation items.
 * @return {Promise}  Value returned from _getAllIds
 */
function getList() {
  let url = login.getUrl();

  if (!url) {
    return Promise.reject(new Error('Not logged in.'));
  }

  if (process.env.NODE_ENV === 'ui') {
    return fsp.readJSON(path.join(__dirname, '../asset/test-items.json'));
  }

  return request.get(_.extend({ url }, httpOptions))
    .then(html => _getAllIds(html));
}

/**
 * Get all available evaluation IDs from HTML.
 * @param  {string} html HTML of the logged in eval page
 * @return {object.<string, string>}  ID-title pairs
 */
function _getAllIds(html) {
  let $ = cheerio.load(html);
  let anchors = $('td > a');
  let hrefRegex = /id=(\d+)/;
  let links = [];

  /** Example HTML

      <td class="left padding" colspan="3">Lecture 57 (Dr YK Chan, Department of Orthopaedics and Traumatology)</td>
                                                                                <td class="padding">24-Sep-16</td>
                                                                                <td class="padding"><a href="./evaluate.php?id=90365&ticket=ST-77773-jjaN0c0KhKsnXWUSRaoD">Do It Now</a></td>

   */
  anchors.each(function () {
    let href, match;
    let id, title;

    if ((href = $(this).attr('href')) &&
        (match = href.match(hrefRegex))) {
      id = match[1];
      title = $(this).parent('td').prevAll('[colspan="3"]').text();

      links.push({ id, title });
    }
  });

  return links;
}

/**
 * Evalate the item with grading
 * @param  {integer} id Teacher id
 * @param  {integer} grading From 1-5 (3: neutral, 5: strongly agree)
 * @return {Promise}
 */
function evalItem(id, grading) {
  if (!id) {
    return Promise.reject(new Error('No id supplied'));
  }

  const form = {
    response_id: id,
    submit: 'Submit'
  };
  const itemPageUrl = `https://www.bimhse.hku.hk/intranet/Evaluation/evaluate.php?ticket=${login.getTicket()}&id=`;
  const doEvalUrl = 'https://www.bimhse.hku.hk/intranet/Evaluation/save.php';

  if (process.env.NODE_ENV === 'ui') {
    // More successes than fails
    if (new Date().getMilliseconds() > 300) {
      return Promise.resolve(true);
    } else {
      return Promise.reject(new Error());
    }
  }

  // All radios are required
  // Unique question num that are radios
  let radioNums = [];

  // Other non-inputs which should be textarea
  let textareaNums = [];

  return request.get(_.extend({ url: itemPageUrl + id }, httpOptions))
    .then(result => {
      let $ = cheerio.load(result);
      $('form input[type="radio"][name]').each((i, elem) => {
        let qname = $(elem).attr('name');
        if (radioNums.indexOf(qname) === -1) {
          radioNums.push(qname);
        }
      });

      $('form textarea[name]').each((i, elem) => {
        textareaNums.push($(elem).attr('name'));
      });
    })
    .then(() => {
      radioNums.forEach(qnum => {
        form[qnum] = grading || 3;
      });

      textareaNums.forEach(qnum => {
        form[qnum] = '';
      });

      return request.post(_.extend({ form, url: doEvalUrl }, httpOptions))
        .then(result => {
          if (result.indexOf('Your evaluation is saved. Below is a copy of your submission.') !== -1) {
            return true;
          } else {
            return Promise.reject(new Error('Already evaluated'));
          }
        });
    });
}

module.exports = {
  getList,
  evalItem
};
