/**
 * Test script for Login Validation
 * Tests various login scenarios to ensure validation works correctly
 */

const axios = require('axios');

const API_URL = 'http://localhost:4009/auth';

// Test cases for login validation
const testCases = [
  {
    name: 'Valid login',
    data: { email: 'test@example.com', password: 'password123' },
    expectedStatus: [200, 401] // 200 if user exists, 401 if invalid credentials
  },
  {
    name: 'Missing email',
    data: { password: 'password123' },
    expectedStatus: 400,
    expectedMessage: /Email address is required/i
  },
  {
    name: 'Missing password',
    data: { email: 'test@example.com' },
    expectedStatus: 400,
    expectedMessage: /Password is required/i
  },
  {
    name: 'Empty email',
    data: { email: '', password: 'password123' },
    expectedStatus: 400,
    expectedMessage: /Email address cannot be empty/i
  },
  {
    name: 'Empty password',
    data: { email: 'test@example.com', password: '' },
    expectedStatus: 400,
    expectedMessage: /Password cannot be empty/i
  },
  {
    name: 'Invalid email format',
    data: { email: 'invalid-email', password: 'password123' },
    expectedStatus: 400,
    expectedMessage: /Please enter a valid email address/i
  },
  {
    name: 'Email without domain',
    data: { email: 'test@', password: 'password123' },
    expectedStatus: 400,
    expectedMessage: /Please enter a valid email address with a proper domain/i
  },
  {
    name: 'Password too short',
    data: { email: 'test@example.com', password: '123' },
    expectedStatus: 400,
    expectedMessage: /Password must be at least 6 characters long/i
  },
  {
    name: 'Password with spaces',
    data: { email: 'test@example.com', password: 'pass word' },
    expectedStatus: 400,
    expectedMessage: /Password cannot contain spaces/i
  }
];

async function testLoginValidation() {
  console.log('🧪 Testing Login Validation...\n');

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`   Data: ${JSON.stringify(testCase.data)}`);

    try {
      const response = await axios.post(`${API_URL}/login`, testCase.data);
      
      if (testCase.expectedStatus.includes(response.status)) {
        console.log(`   ✅ Status: ${response.status} (Expected: ${testCase.expectedStatus})`);
        if (response.data.message) {
          console.log(`   📝 Message: ${response.data.message}`);
        }
      } else {
        console.log(`   ❌ Status: ${response.status} (Expected: ${testCase.expectedStatus})`);
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;
        
        if (status === testCase.expectedStatus) {
          console.log(`   ✅ Status: ${status} (Expected: ${testCase.expectedStatus})`);
          if (message && testCase.expectedMessage) {
            if (testCase.expectedMessage.test(message)) {
              console.log(`   ✅ Message: "${message}" (Matches expected pattern)`);
            } else {
              console.log(`   ❌ Message: "${message}" (Expected pattern: ${testCase.expectedMessage})`);
            }
          } else if (message) {
            console.log(`   📝 Message: "${message}"`);
          }
        } else {
          console.log(`   ❌ Status: ${status} (Expected: ${testCase.expectedStatus})`);
          if (message) {
            console.log(`   📝 Message: "${message}"`);
          }
        }
      } else {
        console.log(`   ❌ Network Error: ${error.message}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }
}

// Run the tests
testLoginValidation().catch(console.error);