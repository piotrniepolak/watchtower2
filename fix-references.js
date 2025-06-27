// Fix bad links in intelligence briefs References sections
import fetch from 'node-fetch';
import cheerio from 'cheerio';

// Defense URLs to validate
const defenseUrls = [
  "https://www.defensenews.com/global/europe/2025/06/27/interview-safran-defense-boss-on-the-changing-battlefield-and-ai/",
  "https://www.defense.gov/News/News-Stories/Article/Article/4227446/air-force-leaders-testify-on-expanding-air-space-dominance/",
  "https://breakingdefense.com/2025/06/nearly-one-in-10-tier-1-subcontractors-to-defense-primes-are-chinese-firms-report/",
  "https://breakingdefense.com/2025/06/evade-darpa-pivots-shipboard-drone-program-to-rapidly-field-tech-later-this-year/",
  "https://breakingdefense.com/2025/06/pentagon-formally-unveils-961-6-billion-budget-for-2026-with-reconciliation-help/",
  "https://breakingdefense.com/2025/06/darpas-draco-nuclear-propulsion-project-roars-no-more/",
  "https://www.defenseone.com/threats/2025/06/the-d-brief-june-27-2025/406372/",
  "https://www.defenseone.com/ideas/2025/06/how-restart-nuclear-diplomacy-iran/406347/",
  "https://defensecommunities.org/2025/06/dod-budget-request-stays-flat-leans-on-reconciliation-bill-for-extra-boost/",
  "https://thedebrief.org/beneath-the-trillion-dollar-price-tag-what-the-fy2026-defense-budget-really-says-about-americas-military-priorities/"
];

// Comprehensive URL validation
async function validateUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (response.status === 404 || response.status === 403) {
      return { valid: false, reason: `HTTP ${response.status}` };
    }
    
    if (response.status >= 400) {
      return { valid: false, reason: `HTTP ${response.status}` };
    }
    
    // Get the actual content to check if it's a real article
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $('title').text() || '';
    const bodyText = $('body').text().substring(0, 200);
    
    // Check if final URL suggests it's a homepage
    const finalUrl = response.url || url;
    if (finalUrl.endsWith('.com/') || finalUrl.endsWith('.com') || 
        finalUrl.includes('/index.html') || finalUrl.includes('/home')) {
      return { valid: false, reason: 'Homepage redirect' };
    }
    
    // Check if page contains actual article content
    if (title.toLowerCase().includes('page not found') || 
        title.toLowerCase().includes('404') ||
        bodyText.toLowerCase().includes('page not found') ||
        bodyText.length < 50) {
      return { valid: false, reason: 'No article content' };
    }
    
    return { valid: true, title: title.trim(), finalUrl };
  } catch (error) {
    return { valid: false, reason: error.message };
  }
}

// Test first 10 defense URLs
async function testDefenseUrls() {
  console.log('Testing Defense URLs...');
  for (const url of defenseUrls) {
    const result = await validateUrl(url);
    console.log(`${result.valid ? '✅' : '❌'} ${url}`);
    if (!result.valid) {
      console.log(`   Reason: ${result.reason}`);
    } else {
      console.log(`   Title: ${result.title.substring(0, 80)}...`);
    }
    console.log('');
  }
}

testDefenseUrls();