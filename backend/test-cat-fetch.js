const test = async () => {
  try {
    const email = 'test_' + Date.now() + '@example.com';
    const password = 'password123';
    await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email, password, country: 'US' })
    });
    
    const logRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const logData = await logRes.json();
    const token = logData.token;
    
    if (!token) throw new Error('No token');

    const addRes = await fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ name: 'TestCat', type: 'expense' })
    });
    const addData = await addRes.json();
    console.log('Add Category:', addRes.status, addData);

    if (addData.category) {
      const editRes = await fetch(`http://localhost:5000/api/categories/${addData.category._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ name: 'TestCat2', type: 'expense' })
      });
      console.log('Edit Category:', editRes.status, await editRes.json());
    }
  } catch(e) {
    console.error(e);
  }
};
test();
