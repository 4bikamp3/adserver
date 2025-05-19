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

    const dspResponse = await axios.post('https://endpoint.adtelligent.com/bid', ortbRequest, {
      headers: {
        'Content-Type': 'application/json',
        'x-openrtb-version': '2.5'
      }
    });

    const seatbid = dspResponse.data?.seatbid?.[0]?.bid?.[0];
    const vastXML = buildVASTResponse(seatbid || {});

    res.set('Content-Type', 'application/xml');
    res.send(vastXML);
  } catch (err) {
    console.error(err);
    res.status(500).send('<VAST version="4.0"><Error>Internal Server Error</Error></VAST>');
  }
});

app.listen(PORT, () => console.log(`Ad server running on http://localhost:${PORT}`));
