// Fix bad links in intelligence briefs References sections
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Test a few URLs to identify the bad ones
async function validateUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Check if it redirects to homepage or returns 404
    if (response.status === 404) return false;
    if (response.status >= 400) return false;
    
    // Check if final URL suggests it's a homepage
    const finalUrl = response.url || url;
    if (finalUrl.endsWith('.com/') || finalUrl.endsWith('.com')) return false;
    
    return true;
  } catch (error) {
    return false;
  }
}

// Test sample URLs from each sector
const sampleUrls = [
  "https://www.defensenews.com/global/europe/2025/06/27/interview-safran-defense-boss-on-the-changing-battlefield-and-ai/",
  "https://www.statnews.com/2025/06/27/biotechnology-federal-funding-cuts-ceos-board-chairs-letter-to-congress/",
  "https://www.oilprice.com",
  "https://www.janes.com",
  "https://www.fiercepharma.com"
];

async function testUrls() {
  console.log('Testing sample URLs...');
  for (const url of sampleUrls) {
    const isValid = await validateUrl(url);
    console.log(`${isValid ? '✅' : '❌'} ${url}`);
  }
}

testUrls();