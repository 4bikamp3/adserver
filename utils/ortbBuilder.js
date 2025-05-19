const { v4: uuidv4 } = require('uuid');
const faker = require('faker');

function buildOpenRTBRequest(params) {
  const requestId = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();
  const impId = uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase();

  const fallbackIp = faker.internet.ip();
  const fallbackUa = faker.internet.userAgent();
  const fallbackLat = parseFloat(faker.address.latitude());
  const fallbackLon = parseFloat(faker.address.longitude());
  const fallbackCountry = faker.address.countryCode();
  const fallbackCity = faker.address.city();
  const fallbackDeviceMake = faker.company.companyName();
  const fallbackDeviceModel = faker.commerce.productName();

  return {
    id: requestId,
    imp: [
      {
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
          api: [1, 2],
        },
        bidfloor: 2,
        bidfloorcur: 'USD'
      }
    ],
    app: {
      id: params.sid || 'default_app_id',
      name: params.app_name || 'Unknown App',
      bundle: params.app_bundle || 'unknown.bundle',
      publisher: {
        id: params.sid || 'default_pub_id'
      },
      storeurl: params.app_store_url || ''
    },
    device: {
      ua: params.ua || fallbackUa,
      ip: params.ip || fallbackIp,
      geo: {
        lat: parseFloat(params.lat) || fallbackLat,
        lon: parseFloat(params.lon) || fallbackLon,
        country: params.country_code || fallbackCountry,
        city: params.city || fallbackCity
      },
      os: params.os || 'Unknown OS',
      devicetype: 3,
      ifa: params.ifa || uuidv4(),
      make: params.device_make || fallbackDeviceMake,
      model: params.device_model || fallbackDeviceModel,
      ext: {
        ifa_type: 'afai'
      }
    },
    regs: {
      coppa: 0,
      ext: {
        gdpr: parseInt(params.gdpr) || 0,
        us_privacy: params.us_privacy || ''
      }
    },
    user: {
      id: uuidv4().replace(/-/g, ''),
      ext: {
        consent: params.consent || ''
      }
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
          nodes: [
            {
              asi: 'example.com',
              sid: params.sid || 'default_sid',
              rid: requestId,
              hp: 1
            }
          ],
          ver: '1.0'
        }
      }
    },
    ext: {}
  };
}

module.exports = {
  buildOpenRTBRequest
};
