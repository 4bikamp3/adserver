const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { buildOpenRTBRequest } = require('./utils/ortbBuilder');
const { buildVASTResponse } = require('./utils/vastBuilder');

const app = express();
const PORT = process.env.PORT || 3000;

function logBidEvent(data) {
  const logDir = path.join(__dirname, 'logs');
  const logFile = path.join(logDir, 'bid.log');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`;
  fs.appendFile(logFile, logEntry, err => {
    if (err) console.error('Logging error:', err);
  });
}

app.get('/api/vast', async (req, res) => {
  const query = req.query;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  let geoData = {};
  try {
    const geoResp = await axios.get(`https://ipwho.is/${clientIp}`);
    if (geoResp.data.success) {
      geoData = {
        country: geoResp.data.country_code || '',
        regionName: geoResp.data.region || '',
        city: geoResp.data.city || '',
        zip: geoResp.data.postal || '',
        lat: geoResp.data.latitude,
        lon: geoResp.data.longitude
      };
    }
  } catch (geoErr) {
    console.warn('Geo lookup failed:', geoErr.message);
  }

  const ortbRequest = buildOpenRTBRequest({ ...query, ip: clientIp, ua: userAgent, geo: geoData });

  let logData = {
    timestamp: new Date().toISOString(),
    query: query,
    ortb: ortbRequest,
    response: null,
    status: ''
  };

  try {
    let dspResponse;
    try {
      dspResponse = await axios.post('http://940570.ortb.adtelligent.com/', ortbRequest, {
        headers: {
          'Content-Type': 'application/json',
          'x-openrtb-version': '2.6'
        },
        timeout: 1000,
        maxRedirects: 0
      });

      const seatbid = dspResponse.data?.seatbid?.[0]?.bid?.[0];
      logData.response = seatbid;

      if (seatbid?.adm) {
        let adm = seatbid.adm;
        const price = seatbid.price || 0;
        if (adm.includes('${AUCTION_PRICE}')) {
          adm = adm.replace(/\$\{AUCTION_PRICE\}/g, price.toFixed(2));
        }
        logData.status = 'ADM_FOUND';
        logBidEvent(logData);
        res.set('Content-Type', 'application/xml');
        return res.send(adm);
      }

      logData.status = 'NO_ADM';
      logBidEvent(logData);
      const vastXML = buildVASTResponse({});
      res.set('Content-Type', 'application/xml');
      return res.send(vastXML);
    } catch (axiosErr) {
      logData.status = 'DSP_ERROR';
      logData.response = { error: axiosErr.message };
      logBidEvent(logData);
      res.set('Content-Type', 'application/xml');
      return res.send('<?xml version="1.0" encoding="UTF-8"?><VAST version="4.0"></VAST>');
    }
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><VAST version="4.0"></VAST>');
  }
});

app.listen(PORT, () => console.log(`Ad server running on http://localhost:${PORT}`));
