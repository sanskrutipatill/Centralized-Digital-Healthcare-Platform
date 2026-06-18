import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

async function test() {
  try {
    // Try to login as patient
    const loginRes = await api.post('/auth/login', {
      email: 'patient@hms.com',
      password: 'demo123'
    });
    console.log('Login successful');
    const token = loginRes.data.token;
    console.log('Token:', token.substring(0, 50) + '...');

    // Set token for subsequent requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Test appointments endpoint
    console.log('\nTesting /api/appointments...');
    const apptRes = await api.get('/appointments');
    console.log('Appointments response:', apptRes.data);
    console.log('Count:', apptRes.data.length);
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
