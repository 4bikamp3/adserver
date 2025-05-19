const xmlbuilder = require('xmlbuilder');

function buildVASTResponse(bid) {
  const vast = xmlbuilder.create('VAST', { version: '1.0', encoding: 'UTF-8' })
    .att('version', '4.0')
    .ele('Ad', { id: bid.id || '1' })
      .ele('InLine')
        .ele('AdSystem').txt('Adtelligent-Server').up()
        .ele('AdTitle').txt('CTV Video Ad').up()
        .ele('Impression').txt(bid.nurl || 'https://example.com/impression').up()
        .ele('Creatives')
          .ele('Creative')
            .ele('Linear')
              .ele('Duration').txt('00:00:30').up()
              .ele('MediaFiles')
                .ele('MediaFile', {
                  delivery: 'progressive',
                  type: 'video/mp4',
                  width: bid.w || 1920,
                  height: bid.h || 1080,
                  scalable: 'true',
                  maintainAspectRatio: 'true'
                })
                .txt(bid.adm || 'https://example.com/default-video.mp4')
              .up()
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
