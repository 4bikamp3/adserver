const xmlbuilder = require('xmlbuilder');

function buildVASTResponse(bid) {
  const vast = xmlbuilder.create('VAST', { version: '1.0', encoding: 'UTF-8' })
    .att('version', '4.0');
  return vast.end({ pretty: true });
}

module.exports = {
  buildVASTResponse
};