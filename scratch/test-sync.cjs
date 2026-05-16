const https = require('https');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: body }));
    });

    req.on('error', (e) => reject(e));
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  const leadData = {
    name: "AutoMode Dummy Test",
    phone: "7249108474",
    loanType: "Business Loan",
    amount: "1000000",
    email: "test@avanifinserv.com",
    source: "AutoMode_Verification_Script"
  };

  console.log('--- STARTING AUTO MODE TEST CYCLE ---');

  // 1. Test Make.com Webhook Directly
  console.log('Testing Make.com Webhook...');
  try {
    const res = await post('https://hook.eu1.make.com/n46s2vx5oil7ptwdhhgsnn9rpm6ck5j0', leadData);
    console.log('✅ Make.com Webhook Response:', res.status, res.data);
  } catch (error) {
    console.error('❌ Make.com Webhook Failed:', error.message);
  }

  // 2. Test Google Sheets App Script Directly
  console.log('\nTesting Google Sheets App Script...');
  try {
    const res = await post('https://script.google.com/macros/s/AKfycbwadPvvLiVgLOUbIcnQm7ZeLEOsh1bamEYVJKi11ub8fZc-EAVugAv2WvgfTc5Izg7A4w/exec', leadData);
    console.log('✅ Google Sheets Response:', res.status);
  } catch (error) {
    console.error('❌ Google Sheets Failed:', error.message);
  }

  // 3. Test Backend Sync Route
  console.log('\nTesting Backend /api/save-lead (Localhost)...');
  try {
    const res = await post('http://localhost:5000/api/save-lead', leadData);
    console.log('✅ Local Backend Response:', res.status, res.data);
  } catch (error) {
    console.error('❌ Local Backend Failed:', error.message);
  }

  // 4. Test Backend Sync Route (Live)
  console.log('\nTesting Backend /api/save-lead (Live)...');
  try {
    const res = await post('https://www.avanifinserv.com/api/save-lead', leadData);
    console.log('✅ Live Backend Response:', res.status, res.data);
  } catch (error) {
    console.error('❌ Live Backend Failed:', error.message);
  }

  console.log('\n--- TEST CYCLE COMPLETE ---');
}

runTest();
