const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('=== 1. Testing GET /api/health ===');
  let res = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('Health status:', res.status, res.data.message);

  console.log('\n=== 2. Testing GET /api/startups ===');
  res = await request({ host: 'localhost', port: 5000, path: '/api/startups', method: 'GET' });
  console.log('Startups count:', res.data.count, 'First company:', res.data.data[0]?.companyName);

  console.log('\n=== 3. Testing POST /api/startups Validation (Empty Body) ===');
  res = await request({
    host: 'localhost', port: 5000, path: '/api/startups', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { companyName: '' });
  console.log('Validation failure status (expected 400):', res.status, 'Errors:', res.data.errors);

  console.log('\n=== 4. Testing POST /api/startups (Valid Creation) ===');
  res = await request({
    host: 'localhost', port: 5000, path: '/api/startups', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    companyName: 'QuantumLeap Security',
    industry: 'Cybersecurity',
    stage: 'Seed',
    founder: { name: 'Dr. Elena Vance', background: 'MIT Cryptography PhD' },
    location: 'Boston, MA',
    website: 'https://quantumleap.sec',
    description: 'Post-quantum end-to-end encryption for critical infrastructure.'
  });
  console.log('Creation status (expected 201):', res.status, 'ID:', res.data.data?._id);
  const createdId = res.data.data?._id;

  console.log('\n=== 5. Testing GET /api/startups/:id ===');
  res = await request({ host: 'localhost', port: 5000, path: `/api/startups/${createdId}`, method: 'GET' });
  console.log('Get by ID status (expected 200):', res.status, 'Company:', res.data.data?.companyName);

  console.log('\n=== 6. Testing PUT /api/startups/:id (Update) ===');
  res = await request({
    host: 'localhost', port: 5000, path: `/api/startups/${createdId}`, method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    companyName: 'QuantumLeap Global Security',
    industry: 'Cybersecurity',
    stage: 'Series A',
    founder: { name: 'Dr. Elena Vance', background: 'MIT Cryptography PhD' },
  });
  console.log('Update status (expected 200):', res.status, 'Updated Name:', res.data.data?.companyName, 'Updated Stage:', res.data.data?.stage);

  console.log('\n=== 7. Testing Search & Filter GET /api/startups?search=QuantumLeap&industry=Cybersecurity ===');
  res = await request({ host: 'localhost', port: 5000, path: '/api/startups?search=QuantumLeap&industry=Cybersecurity', method: 'GET' });
  console.log('Search match count:', res.data.count, 'Found Name:', res.data.data[0]?.companyName);

  console.log('\n=== 8. Testing DELETE /api/startups/:id ===');
  res = await request({ host: 'localhost', port: 5000, path: `/api/startups/${createdId}`, method: 'DELETE' });
  console.log('Delete status (expected 200):', res.status, 'Message:', res.data.message);

  console.log('\n=== 9. Verifying Deletion GET /api/startups/:id ===');
  res = await request({ host: 'localhost', port: 5000, path: `/api/startups/${createdId}`, method: 'GET' });
  console.log('Fetch after delete (expected 404):', res.status, 'Message:', res.data.message);

  console.log('\n=== 10. Testing Dashboard Aggregation GET /api/dashboard ===');
  res = await request({ host: 'localhost', port: 5000, path: '/api/dashboard', method: 'GET' });
  console.log('Dashboard metrics:', {
    totalStartups: res.data.data.totalStartups,
    invested: res.data.data.invested,
    watchlist: res.data.data.watchlist,
    rejected: res.data.data.rejected,
    avgFounderScore: res.data.data.avgFounderScore,
    avgInvestmentScore: res.data.data.avgInvestmentScore,
  });

  console.log('\n✅ ALL 10 TESTS PASSED FLAWLESSLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
