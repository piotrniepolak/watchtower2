import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

// All URLs from the three briefs
const defenseUrls = [
  "https://www.defensenews.com/global/europe/2025/06/27/interview-safran-defense-boss-on-the-changing-battlefield-and-ai/",
  "https://breakingdefense.com/2025/06/nearly-one-in-10-tier-1-subcontractors-to-defense-primes-are-chinese-firms-report/",
  "https://breakingdefense.com/2025/06/evade-darpa-pivots-shipboard-drone-program-to-rapidly-field-tech-later-this-year/",
  "https://breakingdefense.com/2025/06/pentagon-formally-unveils-961-6-billion-budget-for-2026-with-reconciliation-help/",
  "https://breakingdefense.com/2025/06/darpas-draco-nuclear-propulsion-project-roars-no-more/",
  "https://www.defenseone.com/threats/2025/06/the-d-brief-june-27-2025/406372/",
  "https://www.defenseone.com/ideas/2025/06/how-restart-nuclear-diplomacy-iran/406347/",
  "https://defensecommunities.org/2025/06/dod-budget-request-stays-flat-leans-on-reconciliation-bill-for-extra-boost/",
  "https://thedebrief.org/beneath-the-trillion-dollar-price-tag-what-the-fy2026-defense-budget-really-says-about-americas-military-priorities/",
  "https://www.defensenews.com/land/2025/06/27/army-seeks-197-billion-fy26-budget-with-transformation-plan-at-center/",
  "https://www.military.com/daily-news/2025/06/27/irans-top-diplomat-says-talks-us-complicated-american-strike-nuclear-sites.html",
  "https://www.military.com/daily-news/2025/06/27/new-army-shaving-policy-will-allow-soldiers-skin-condition-affects-mostly-black-men-be-kicked-out.html",
  "https://www.defensenews.com/land/2025/06/27/us-army-tailoring-pacific-commands-for-multi-domain-force/",
  "https://www.airandspaceforces.com/daily-report/20250626/",
  "https://www.defensedaily.com/2025-06-26-dtra-scrutinized-fordow-for-more-than-16-years-before-june-21-b-2-strikes/",
  "https://www.defensedaily.com/army-seeks-2-4-billion-in-fy-26-to-flexibly-move-around-drones-c-uas-ew-portfolios/",
  "https://www.defensedaily.com/dod-says-budget-request-includes-13-billion-for-autonomy-and-related-systems/",
  "https://www.defensedaily.com/sda-requests-277-million-for-spacex-milnet-cancels-tranche-3-of-transport-layer/",
  "https://defensescoop.com/2025/06/27/dod-cyberspace-rules-of-engagement-limitations/",
  "https://defensescoop.com/2025/06/26/dod-fy26-budget-request-autonomy-unmanned-systems/",
  "https://defensescoop.com/2025/06/26/air-force-arrw-procurement-funding-fy26-budget-request/",
  "https://defensescoop.com/2025/06/27/army-swapping-leadership-aberdeen-program-executive-offices-iews-c3n/",
  "https://www.armytimes.com/land/2025/06/27/army-seeks-197-billion-fy26-budget-with-transformation-plan-at-center/",
  "https://www.navytimes.com/news/your-navy/2025/06/27/hegseth-reveals-new-name-for-usns-harvey-milk/",
  "https://www.navytimes.com/news/pentagon-congress/2025/06/26/navy-budget-seeks-to-boost-modernization-of-fleet-shipyards/",
  "https://www.twz.com/land/largest-patriot-salvo-in-u-s-military-history-launched-defending-al-udeid-air-base-against-iranian-missiles"
];

// Validate a single URL
async function validateUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      redirect: 'follow'
    });
    
    if (response.status === 404 || response.status === 403 || response.status === 500) {
      return { status: 'ERROR', code: response.status, url: url };
    }
    
    if (response.status >= 400) {
      return { status: 'ERROR', code: response.status, url: url };
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $('title').text() || '';
    const finalUrl = response.url || url;
    
    // Check if it's a homepage redirect
    if (finalUrl.endsWith('.com/') || finalUrl.endsWith('.com') || 
        finalUrl.includes('/index.html') || finalUrl.includes('/home') ||
        finalUrl === url.split('/').slice(0, 3).join('/') + '/') {
      return { status: 'HOMEPAGE', title: title.trim(), finalUrl, url: url };
    }
    
    // Check if page has actual article content
    const articleContent = $('article, .article, .content, .story, .post').text();
    if (articleContent.length < 100 && title.length < 20) {
      return { status: 'HOMEPAGE', title: title.trim(), finalUrl, url: url };
    }
    
    return { status: 'ARTICLE', title: title.trim(), finalUrl, url: url };
  } catch (error) {
    return { status: 'ERROR', reason: error.message, url: url };
  }
}

// Test first 5 defense URLs
async function testDefenseUrls() {
  console.log('=== DEFENSE URLS VALIDATION ===');
  for (let i = 0; i < Math.min(5, defenseUrls.length); i++) {
    const url = defenseUrls[i];
    const result = await validateUrl(url);
    console.log(`${result.status === 'ARTICLE' ? '✅' : result.status === 'HOMEPAGE' ? '🏠' : '❌'} ${result.status}: ${url}`);
    if (result.title) console.log(`   Title: ${result.title.substring(0, 80)}...`);
    if (result.reason) console.log(`   Error: ${result.reason}`);
    if (result.code) console.log(`   HTTP: ${result.code}`);
    console.log('');
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testDefenseUrls();