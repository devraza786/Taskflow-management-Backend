const https = require('https');

const data = JSON.stringify({
  name: 'Test Org Context',
  orgName: 'My Context Org',
  email: 'test555@email.com',
  password: 'password123'
});

const options = {
  hostname: 'taskflow-management-backend-api.vercel.app',
  port: 443,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let chunks = '';
  res.on('data', d => {
    chunks += d;
  });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response: ', chunks);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
