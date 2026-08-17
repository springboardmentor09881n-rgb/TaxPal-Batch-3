const http = require('http');

const request = (method, path, body, token) => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    }
  }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }));
  });
  req.on('error', reject);
  if (body) req.write(JSON.stringify(body));
  req.end();
});

(async () => {
  try {
    const email = 'test_' + Date.now() + '@example.com';
    const regRes = await request('POST', '/api/auth/register', { name: 'Test User', email, password: 'password123', country: 'US' });
    let token = regRes.data.token;
    
    console.log('Token:', token);
    
    const addRes = await request('POST', '/api/categories', { name: 'TestCat2', type: 'expense' }, token);
    console.log('Add Category:', addRes);
    
    if (addRes.data.category) {
      const editRes = await request('PUT', `/api/categories/${addRes.data.category._id}`, { name: 'TestCatEdited2', type: 'expense' }, token);
      console.log('Edit Category:', editRes);
    }
  } catch (err) {
    console.error(err);
  }
})();
