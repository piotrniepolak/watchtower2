// Test Yahoo Finance quote API endpoint
import fetch from 'node-fetch';

async function testQuoteAPI() {
  try {
    console.log('Testing quote API for GILD...');
    const response = await fetch('http://localhost:5000/api/stocks/GILD/quote');
    const status = response.status;
    console.log('Response status:', status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Quote data received:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testQuoteAPI();