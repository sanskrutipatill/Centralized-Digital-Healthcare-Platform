import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

async function test() {
  try {
    // Login as admin
    const loginRes = await api.post('/auth/login', {
      email: 'admin@hms.com',
      password: 'demo123'
    });
    console.log('Admin login successful');
    const token = loginRes.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Test analytics endpoint
    console.log('\nTesting /api/analytics...');
    const analyticsRes = await api.get('/analytics');
    console.log('Analytics response:', analyticsRes.data);

    // Test users endpoint
    console.log('\nTesting /api/users...');
    const usersRes = await api.get('/users');
    console.log('Users count:', usersRes.data.length);
    console.log('First user:', usersRes.data[0]);
  } catch (error) {
    console.error('\nError:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

test();
