const { v4: uuidv4 } = require('uuid');

function buildOpenRTBRequest(params) {
  const requestId = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
  const impId = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();

  const geo = params.geo || {};

  return {
    id: requestId,
    imp: [{
      id: impId,
      video: {
        mimes: ['video/mp4'],
        linearity: 1,
        minduration: 3,
        maxduration: 300,
        protocols: [1, 2, 3, 4, 5, 6],
        w: parseInt(params.w) || 1920,
        h: parseInt(params.h) || 1080,
        startdelay: 0,
        sequence: 1,
        boxingallowed: 1,
        api: [1, 2]
      },
      bidfloor: 5.75,
      bidfloorcur: 'USD'
    }],
    app: {
      id: params.sid || 'default_app_id',
      name: params.app_name || 'CTV App',
      bundle: params.app_bundle || 'com.ctv.app',
      publisher: {
        id: params.sid || 'default_pub_id'
      },
      storeurl: params.app_store_url || ''
    },
    device: {
      ua: params.ua || '',
      ip: params.ip || '',
      geo: {
        lat: geo.lat || 0,
        lon: geo.lon || 0,
        country: geo.country || '',
        region: geo.regionName || '',
        city: geo.city || '',
        zip: geo.zip || '',
        type: 2,
        accuracy: 5,
        ipservice: 3
      },
      os: params.os || 'Android',
      osv: params.osv || '7.1.2',
      devicetype: 3,
      ifa: params.ifa || uuidv4(),
      carrier: 'Spectrum',
      ext: {
        ifa_type: 'afai'
      }
    },
    user: {
      id: uuidv4().replace(/-/g, ''),
      ext: {}
    },
    regs: {
      coppa: 0,
      ext: {}
    },
    at: 1,
    tmax: 1500,
    allimps: 0,
    cur: ['USD'],
    bcat: ['IAB26'],
    source: {
      ext: {
        schain: {
          complete: 1,
          nodes: [{
            asi: 'adtelligent.com',
            sid: params.sid || 'default_sid',
            rid: requestId,
            hp: 1
          }],
          ver: '1.0'
        }
      }
    },
    ext: {
      vistar: {}
    }
  };
}

module.exports = {
  buildOpenRTBRequest
};