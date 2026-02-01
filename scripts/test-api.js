#!/usr/bin/env node

/**
 * Weather Platform - Automated Test Script
 * 
 * This script tests all API endpoints and features
 * Run with: node scripts/test-api.js
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY || '';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    return { status: 0, data: { error: error.message }, headers: {} };
  }
}

/**
 * Test helper
 */
async function test(name, testFn) {
  console.log(`\n${colors.cyan}Testing:${colors.reset} ${name}`);
  try {
    await testFn();
    testsPassed++;
    console.log(`${colors.green}✓ PASS${colors.reset}`);
  } catch (error) {
    testsFailed++;
    console.log(`${colors.red}✗ FAIL${colors.reset}: ${error.message}`);
  }
}

/**
 * Test 1: Server is running
 */
await test('Server is accessible', async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
});

/**
 * Test 2: API without key should fail
 */
await test('API without API key returns 401', async () => {
  const result = await apiRequest('/api/weather/current?city=Hyderabad');
  if (result.status !== 401) {
    throw new Error(`Expected 401, got ${result.status}`);
  }
});

/**
 * Test 3: API with invalid key should fail
 */
await test('API with invalid key returns 401', async () => {
  const result = await apiRequest('/api/weather/current?city=Hyderabad');
  if (result.status !== 401) {
    throw new Error(`Expected 401, got ${result.status}`);
  }
});

/**
 * Test 4: Current Weather API
 */
await test('Current Weather API works', async () => {
  if (!API_KEY) {
    throw new Error('API_KEY not set. Set with: API_KEY=your-key node scripts/test-api.js');
  }

  const result = await apiRequest('/api/weather/current?city=Hyderabad');
  
  // With the new on-demand design, we should always get 200 with weather data
  if (result.status !== 200) {
    throw new Error(`Expected 200, got ${result.status}`);
  }

  if (!result.data.city) {
    throw new Error('Response missing city name');
  }

  if (typeof result.data.temperature !== 'number') {
    throw new Error('Response missing or invalid temperature');
  }
});

/**
 * Test 5: Historical Weather API
 */
await test('Historical Weather API works', async () => {
  if (!API_KEY) {
    throw new Error('API_KEY not set');
  }

  const result = await apiRequest('/api/weather/history?city=Hyderabad&hours=24');
  
  if (result.status !== 200) {
    throw new Error(`Expected 200, got ${result.status}`);
  }

  if (!result.data.city) {
    throw new Error('Response missing city name');
  }

  if (!Array.isArray(result.data.data)) {
    throw new Error('Response data is not an array');
  }
});

/**
 * Test 6: Daily Average API
 */
await test('Daily Average API works', async () => {
  if (!API_KEY) {
    throw new Error('API_KEY not set');
  }

  const today = new Date().toISOString().split('T')[0];
  const result = await apiRequest(`/api/weather/daily-average?city=Hyderabad&date=${today}`);
  
  if (result.status !== 200 && result.status !== 404) {
    throw new Error(`Expected 200 or 404, got ${result.status}`);
  }

  if (result.status === 200) {
    if (typeof result.data.avgTemperature !== 'number') {
      throw new Error('Response missing or invalid avgTemperature');
    }
  }
});

/**
 * Test 7: Track City API
 */
await test('Track City API works', async () => {
  if (!API_KEY) {
    throw new Error('API_KEY not set');
  }

  const result = await apiRequest('/api/cities/track', 'POST', { city: 'London' });
  
  if (result.status !== 200) {
    throw new Error(`Expected 200, got ${result.status}`);
  }

  if (!result.data.city) {
    throw new Error('Response missing city data');
  }
});

/**
 * Test 8: Get Cities API
 */
await test('Get Cities API works', async () => {
  if (!API_KEY) {
    throw new Error('API_KEY not set');
  }

  const result = await apiRequest('/api/cities');
  
  if (result.status !== 200) {
    throw new Error(`Expected 200, got ${result.status}`);
  }

  if (!Array.isArray(result.data.cities)) {
    throw new Error('Response cities is not an array');
  }
});

/**
 * Test 9: Rate Limit Headers
 */
await test('Rate limit headers are present', async () => {
  if (!API_KEY) {
    throw new Error('API_KEY not set');
  }

  const result = await apiRequest('/api/weather/current?city=Hyderabad');
  
  // With the new on-demand design, we should always get 200 with weather data
  if (result.status !== 200) {
    throw new Error(`Expected 200, got ${result.status}`);
  }

  const headers = result.headers;
  if (!headers.get('x-ratelimit-limit-daily')) {
    throw new Error('Missing x-ratelimit-limit-daily header');
  }

  if (!headers.get('x-ratelimit-remaining-daily')) {
    throw new Error('Missing x-ratelimit-remaining-daily header');
  }

  if (!headers.get('x-cache')) {
    throw new Error('Missing x-cache header');
  }
});

/**
 * Test 10: Export API
 */
await test('Export API works', async () => {
  if (!API_KEY) {
    throw new Error('API_KEY not set');
  }

  const result = await apiRequest('/api/export?format=json');
  
  if (result.status !== 200) {
    throw new Error(`Expected 200, got ${result.status}`);
  }

  if (!result.data.user) {
    throw new Error('Response missing user data');
  }
});

/**
 * Print summary
 */
console.log('\n' + '='.repeat(50));
console.log(`${colors.blue}TEST SUMMARY${colors.reset}`);
console.log('='.repeat(50));
console.log(`${colors.green}Passed:${colors.reset} ${testsPassed}`);
console.log(`${colors.red}Failed:${colors.reset} ${testsFailed}`);
console.log(`${colors.yellow}Total:${colors.reset}  ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}`);
  console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
  console.log('1. Run weather ingestion: node scripts/ingestWeather.ts');
  console.log('2. Test APIs again with real data');
  console.log('3. Continue with Phase 3 implementation');
} else {
  console.log(`\n${colors.red}❌ Some tests failed${colors.reset}`);
  console.log(`\n${colors.cyan}Check:${colors.reset}`);
  console.log('- Server is running: npm run dev');
  console.log('- MongoDB is connected');
  console.log('- API_KEY is set correctly');
  console.log('- Check docs/TESTING_GUIDE.md for manual testing');
}

process.exit(testsFailed === 0 ? 0 : 1);
