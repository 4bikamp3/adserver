# 📺 Node.js CTV Ad Server with Adtelligent Integration

This project is a simplified Connected TV (CTV) ad server using Node.js that integrates with the real-world DSP: **Adtelligent**.

## 🔧 Features
- Accepts VAST ad requests via HTTP GET
- Converts query macros into OpenRTB 2.5 format
- Sends request to Adtelligent DSP endpoint
- Converts bid response into VAST 4.0 XML

## 🚀 How to Use

```bash
npm install
node server.js
```

Then access:
```
http://localhost:3000/api/vast?sid=31xx&w=1920&h=1080
```

## 📦 Dependencies

```bash
npm install express axios xmlbuilder faker uuid
```

## 📌 Notes
- Replace Adtelligent DSP endpoint with your valid authenticated one if necessary
- Make sure to test with Postman/cURL before integrating with SSAI/players
# adserver
# adserver
