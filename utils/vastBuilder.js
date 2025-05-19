const xmlbuilder = require('xmlbuilder');

function buildVASTResponse(bid) {
  // Jika ada adm, handle versi VAST
  if (bid.adm) {
    if (bid.adm.trim().startsWith('<VAST')) {
      // Convert VAST 4.0 to 3.0 if needed
      return bid.adm.replace('version="4.0"', 'version="3.0"');
    }
    // Jika adm bukan VAST, bangun wrapper VAST 3.0
    return buildVASTWrapper(bid);
  }

  // VAST kosong versi 3.0 jika tidak ada adm
  return '<VAST version="3.0"></VAST>';
}

function buildVASTWrapper(bid) {
  const vast = xmlbuilder.create('VAST', { version: '1.0', encoding: 'UTF-8' })
    .att('version', '3.0')
    .ele('Ad', { id: bid.id || '1' })
      .ele('Wrapper')
        .ele('AdSystem').txt('Adtelligent-Server').up()
        .ele('VASTAdTagURI').txt(bid.adm).up() // Gunakan adm sebagai URI tag
        .ele('Impression').txt(bid.nurl || 'https://example.com/impression').up()
        .ele('Creatives')
          .ele('Creative', { id: '1', sequence: '1' })
            .ele('Linear')
              .ele('Duration').txt('00:00:30').up()
            .up()
          .up()
        .up()
      .up()
    .up();

  return vast.end({ pretty: true });
}

module.exports = {
  buildVASTResponse
};