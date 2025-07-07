#!/usr/bin/env node

async function testTrefisDirectly() {
  try {
    const { default: fetch } = await import('node-fetch');
    const cheerio = await import('cheerio');
    
    console.log('🔍 Testing Trefis direct access...');
    
    const actionableUrl = 'https://www.trefis.com/data/topic/actionable-analyses';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    const response = await fetch(actionableUrl, { headers });
    console.log(`📊 Response status: ${response.status}`);
    
    const html = await response.text();
    console.log(`📄 HTML length: ${html.length}`);
    
    const $ = cheerio.load(html);
    
    let totalLinks = 0;
    let companyLinks = 0;
    let noLoginLinks = 0;
    let validAnalyses = 0;
    const foundAnalyses = [];
    
    $('a').each((_, a) => {
      totalLinks++;
      const $a = $(a);
      const href = $a.attr('href');
      const text = $a.text().trim();
      
      if (href && href.includes('/data/companies/')) {
        companyLinks++;
        if (href.includes('/no-login-required/')) {
          noLoginLinks++;
          if (text.length > 15) {
            validAnalyses++;
            const url = href.startsWith('http') ? href : `https://www.trefis.com${href}`;
            foundAnalyses.push({ title: text, url });
          }
        }
      }
    });
    
    console.log(`📈 Analysis results:`);
    console.log(`   Total links: ${totalLinks}`);
    console.log(`   Company links: ${companyLinks}`);
    console.log(`   No-login links: ${noLoginLinks}`);
    console.log(`   Valid analyses: ${validAnalyses}`);
    
    if (foundAnalyses.length > 0) {
      console.log(`\n📋 Found ${foundAnalyses.length} analyses:`);
      foundAnalyses.slice(0, 3).forEach((analysis, i) => {
        console.log(`${i + 1}. "${analysis.title.substring(0, 80)}..."`);
        console.log(`   URL: ${analysis.url.substring(0, 100)}...`);
      });
    } else {
      console.log('❌ No valid analyses found');
      
      // Debug: Look for any company-related content
      console.log('\n🔍 Looking for any company-related content...');
      const anyCompanyLinks = [];
      $('a').each((_, a) => {
        const href = $(a).attr('href');
        const text = $(a).text().trim();
        if (href && href.includes('companies') && text.length > 5) {
          anyCompanyLinks.push({ href, text: text.substring(0, 50) });
        }
      });
      
      console.log(`Found ${anyCompanyLinks.length} links with 'companies':`);
      anyCompanyLinks.slice(0, 5).forEach((link, i) => {
        console.log(`${i + 1}. "${link.text}" -> ${link.href}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTrefisDirectly();