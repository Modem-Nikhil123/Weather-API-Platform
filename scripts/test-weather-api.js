#!/usr/bin/env node

/**
 * Simple test script for Weather API
 * Run with: node scripts/test-weather-api.js YOUR_API_KEY
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error('Error: API_KEY is required');
  console.error('Usage: node scripts/test-weather-api.js YOUR_API_KEY');
  process.exit(1);
}

async function testWeatherAPI(city) {
  const url = `${API_BASE_URL}/api/weather/current?city=${encodeURIComponent(city)}`;
  console.log(`\nTesting: ${url}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    const headers = {};
    response.headers.forEach((value, key) => {
      if (key.startsWith('x-') || key === 'content-type') {
        headers[key] = value;
      }
    });
    console.log('Headers:', JSON.stringify(headers, null, 2));

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✓ Success!');
    } else {
      console.log('\n✗ Failed!');
    }

    return { status: response.status, data, headers };
  } catch (error) {
    console.error('Error:', error.message);
    return { status: 0, error: error.message };
  }
}

// Test with different cities
const cities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney'];

console.log('='.repeat(60));
console.log('Weather API Test Script');
console.log('='.repeat(60));

for (const city of cities) {
  await testWeatherAPI(city);
  // Add a small delay between requests
  await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log('\n' + '='.repeat(60));
console.log('Test completed!');
console.log('='.repeat(60));
console.log('\nCheck the server logs for detailed debugging information.');
console.log('The logs will show the exact steps being taken for each request.');
