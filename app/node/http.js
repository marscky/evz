'use strict';

var denodeify = require('denodeify');
var fs = require('fs');
var path = require('path');
var request = require('request');

var CERT_PATH = path.join(__dirname, '../assets/certs/Certificates.pem');
var UA_STR = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36';

// Read from CERT_PATH, which should contain multiple certifiates combined together, we split them into array using regex and feed it to request
var certFileStr = fs.readFileSync(CERT_PATH, 'utf8');
var certs = certFileStr.match(/(-----BEGIN CERTIFICATE-----(?:[\s\S]*?)-----END CERTIFICATE-----)/g);

function processData (error, response, body) {
  return [error, { response: response, body: body }];
}

exports.get = denodeify(request.get, processData);
exports.post = denodeify(request.post, processData);
exports.options = {
  agentOptions: {
    ca: certs
  },
  headers: {
    'Connection': 'keep-alive',
    'User-Agent': UA_STR
  },
  gzip: true,
  jar: true
};
