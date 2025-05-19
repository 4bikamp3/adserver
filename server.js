const express = require('express');
const axios = require('axios');
const { buildOpenRTBRequest } = require('./utils/ortbBuilder');
const { buildVASTResponse } = require('./utils/vastBuilder');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/vast', async (req, res) => {
  try {
    const query = req.query;
    const ortbRequest = buildOpenRTBRequest(query);

    // Ambil header penting dari client request
    const clientHeaders = {
      'User-Agent': req.get('User-Agent'),
      'X-Forwarded-For': req.get('X-Forwarded-For') || req.ip
    };

    let dspResponse;
    try {
      dspResponse = await axios.post('http://940570.ortb.adtelligent.com/bid', ortbRequest, {
        headers: {
          'Content-Type': 'application/json',
          'x-openrtb-version': '2.6',
          ...clientHeaders // Forward client headers to DSP
        },
        timeout: 1000
      });
    } catch (err) {
      console.error('DSP request failed:', err.message);
      return res.status(200)
        .set('Content-Type', 'application/xml')
        .set('X-Ad-Error', 'DSP request failed')
        .send('<VAST version="3.0"></VAST>');
    }

    const seatbid = dspResponse.data?.seatbid?.[0]?.bid?.[0];
    
    // Hanya membangun VAST jika ada adm
    let vastXML;
    if (seatbid?.adm) {
      // Jika adm sudah VAST, modifikasi versi jika perlu
      if (seatbid.adm.includes('version="4.0"')) {
        vastXML = seatbid.adm.replace('version="4.0"', 'version="3.0"');
      } else if (!seatbid.adm.includes('version="3.0"')) {
        vastXML = seatbid.adm.replace('<VAST>', '<VAST version="3.0">');
      } else {
        vastXML = seatbid.adm;
      }
    } else {
      vastXML = '<VAST version="3.0"></VAST>';
    }

    // Set response headers
    res.set({
      'Content-Type': 'application/xml',
      'X-Ad-Request-Id': ortbRequest.id,
      'X-Ad-Status': seatbid ? 'success' : 'no-bid'
    });

    // Forward some DSP headers if available
    if (dspResponse.headers) {
      const dspHeadersToForward = ['x-advertiser-id', 'x-campaign-id', 'x-creative-id'];
      dspHeadersToForward.forEach(header => {
        if (dspResponse.headers[header]) {
          res.set(header, dspResponse.headers[header]);
        }
      });
    }

    res.send(vastXML);
  } catch (err) {
    console.error('Server error:', err);
    res.status(200)
      .set('Content-Type', 'application/xml')
      .set('X-Ad-Error', 'Internal server error')
      .send('<VAST version="3.0"></VAST>');
  }
});

app.listen(PORT, () => console.log(`Ad server running on http://localhost:${PORT}`));
