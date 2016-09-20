'use strict';

const fs = require('fs');
const path = require('path');

// Certificates of GeoTrust Global CA and GeoTrust DV SSL CA
const CERT_PATH = path.join(__dirname,  '../asset/certs/Certificates.pem');
const CERT_FILE = fs.readFileSync(CERT_PATH, 'utf8');

// Split individual cert into an array to pass into agentOptions.ca
const CERTS = CERT_FILE.match(/(-----BEGIN CERTIFICATE-----(?:[\s\S]*?)-----END CERTIFICATE-----)/g);

const UA_STRING = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.89 Safari/537.36';

/**
 * Common options for use in every requests.
 *
 * Extend this object with method, url, form data, etc.
 * @type {Object}
 */
module.exports = {
  agentOptions: {
    ca: CERTS
  },
  header: {
    'Connection': 'keep-alive',
    'User-Agent': UA_STRING
  },
  gzip: true,
  jar: true

  // transform: (body, response, resolve) => {
  //   return { body, response };
  // }
};
