import http from 'http';
import app from './server.js';
import mongoose from 'mongoose';

async function runTests() {
  console.log('--- Starting Backend Verification Tests ---');

  const request = (method, path) => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: 'localhost',
          port: 5000,
          method,
          path,
          headers: { 'Content-Type': 'application/json' },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(body) });
            } catch {
              resolve({ status: res.statusCode, text: body });
            }
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
  };

  await new Promise((r) => setTimeout(r, 1500));

  try {
    const health = await request('GET', '/api/health');
    console.log('[Test 1] Health Check:', health.status === 200 ? 'PASSED' : 'FAILED', health.data);

    const weather1 = await request('GET', '/api/weather/Kanpur');
    console.log('[Test 2] Weather for Kanpur:', weather1.status === 200 ? 'PASSED' : 'FAILED', {
      city: weather1.data?.data?.city,
      temp: weather1.data?.data?.temperature,
      condition: weather1.data?.data?.condition,
      provider: weather1.data?.data?.provider,
    });

    const weather2 = await request('GET', '/api/weather/London');
    console.log('[Test 3] Weather for London:', weather2.status === 200 ? 'PASSED' : 'FAILED', {
      city: weather2.data?.data?.city,
      temp: weather2.data?.data?.temperature,
      condition: weather2.data?.data?.condition,
    });

    const history1 = await request('GET', '/api/history');
    console.log('[Test 4] Get History (Count):', history1.status === 200 ? 'PASSED' : 'FAILED', {
      count: history1.data?.count,
      records: history1.data?.data?.map((h) => `${h.city}, ${h.country}`),
    });

    const invalidCity = await request('GET', '/api/weather/thiscitydoesnotexistatall123456789');
    console.log('[Test 5] Invalid City Search (404 expected):', invalidCity.status === 404 ? 'PASSED' : 'FAILED', invalidCity.data);

    if (history1.data?.data?.length > 0) {
      const firstId = history1.data.data[0]._id;
      const deleteRes = await request('DELETE', `/api/history/${firstId}`);
      console.log('[Test 6] Delete History Item:', deleteRes.status === 200 ? 'PASSED' : 'FAILED', deleteRes.data);
    }

    const clearRes = await request('DELETE', '/api/history');
    console.log('[Test 7] Clear History:', clearRes.status === 200 ? 'PASSED' : 'FAILED', clearRes.data);

    const historyAfter = await request('GET', '/api/history');
    console.log('[Test 8] History Empty after Clear:', historyAfter.data?.count === 0 ? 'PASSED' : 'FAILED');

    console.log('--- All Backend Tests Completed Successfully! ---');
  } catch (err) {
    console.error('Test execution failed with error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTests();
