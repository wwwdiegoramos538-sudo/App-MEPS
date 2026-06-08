import 'dotenv/config';

const body = { name: 'Test User', email: `test${Date.now()}@meps.com`, password: 'Test12345' };

try {
  const health = await fetch('http://localhost:4000/api/health');
  console.log('Health:', health.status, await health.text());

  const res = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log('Register status:', res.status);
  console.log('Register body:', text);
} catch (err) {
  console.error('Fetch error:', err.message);
}
