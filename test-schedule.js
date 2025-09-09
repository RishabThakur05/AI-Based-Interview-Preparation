#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

async function testScheduling() {
  try {
    console.log('🧪 Testing Interview Scheduling...\n');
    
    // First, let's test if the server is running
    console.log('1. Testing server connection...');
    const healthCheck = await axios.get(`${API_BASE_URL}/api/interviews/test-auth`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    }).catch(err => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('   ✅ Server is running (authentication required as expected)');
        return { status: 'auth-required' };
      }
      throw err;
    });
    
    // Test user registration/login
    console.log('\n2. Testing user authentication...');
    
    // Try to register a test user
    let authResponse;
    try {
      authResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: 'testhost',
        email: 'testhost@example.com',
        password: 'password123',
        preferredPosition: 'Software Engineer',
        experienceLevel: 'Mid-level'
      });
      console.log('   ✅ Test user registered successfully');
    } catch (regError) {
      if (regError.response?.status === 400) {
        // User might already exist, try login
        console.log('   ℹ️  User already exists, trying login...');
        authResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: 'testhost@example.com',
          password: 'password123'
        });
        console.log('   ✅ Test user logged in successfully');
      } else {
        throw regError;
      }
    }
    
    const token = authResponse.data.token;
    const user = authResponse.data.user;
    console.log('   📝 User ID:', user.id);
    console.log('   📝 Username:', user.username);
    
    // Test authentication with the token
    console.log('\n3. Testing authentication with token...');
    const authTest = await axios.get(`${API_BASE_URL}/api/interviews/test-auth`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('   ✅ Authentication working');
    console.log('   📝 Auth test response:', authTest.data);
    
    // Register a guest user
    console.log('\n4. Registering guest user...');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: 'testguest',
        email: 'testguest@example.com',
        password: 'password123',
        preferredPosition: 'Frontend Developer',
        experienceLevel: 'Junior'
      });
      console.log('   ✅ Guest user registered successfully');
    } catch (guestRegError) {
      if (guestRegError.response?.status === 400) {
        console.log('   ℹ️  Guest user already exists');
      } else {
        throw guestRegError;
      }
    }
    
    // Test scheduling an interview
    console.log('\n5. Testing interview scheduling...');
    const scheduleData = {
      title: 'Test Interview',
      description: 'This is a test interview',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration: 60,
      guestEmail: 'testguest@example.com'
    };
    
    console.log('   📝 Schedule data:', scheduleData);
    
    const scheduleResponse = await axios.post(`${API_BASE_URL}/api/interviews/schedule`, scheduleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   ✅ Interview scheduled successfully!');
    console.log('   📝 Response:', scheduleResponse.data);
    
    // Test fetching scheduled interviews
    console.log('\n6. Testing fetching scheduled interviews...');
    const scheduledResponse = await axios.get(`${API_BASE_URL}/api/interviews/scheduled`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('   ✅ Scheduled interviews fetched successfully!');
    console.log('   📝 Found', scheduledResponse.data.length, 'interviews');
    
    console.log('\n🎉 All tests passed! Interview scheduling is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   📝 Status:', error.response.status);
      console.error('   📝 Response:', error.response.data);
    }
    process.exit(1);
  }
}

testScheduling();