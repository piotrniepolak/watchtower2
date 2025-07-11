// services/trefis-service.js
// Browser-based scraper for Trefis's JavaScript-rendered content
// Fallback from Playwright to Puppeteer for Replit compatibility
import puppeteer from 'puppeteer';

const TOPIC_URLS = {
  actionable: 'https://www.trefis.com/data/topic/actionable-analyses',
  featured: 'https://www.trefis.com/data/topic/featured'
};

/**
 * Scrapes a Trefis topic page using headless Playwright browser
 * @param {string} type - Either 'actionable' or 'featured'
 * @returns {Array} Array of analysis items with title and URL
 */
async function scrapeTopic(type) {
  console.log(`🎭 Starting Playwright scrape for ${type} analyses`);
  
  const url = TOPIC_URLS[type];
  if (!url) {
    throw new Error(`Unknown topic type: ${type}`);
  }

  let browser;
  try {
    // Launch headless Chromium browser using Puppeteer (better Replit compatibility)
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set reasonable timeouts and user agent
    await page.setDefaultNavigationTimeout(30000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`📄 Navigating to: ${url}`);
    
    // Navigate to the page and wait for DOM content to load
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for analysis items to appear - try multiple selectors
    console.log(`⏳ Waiting for analysis list to load...`);
    
    try {
      // Wait for either of these common selectors
      await page.waitForSelector('ul.analysis-list li a, .analysis-item a, [data-testid="analysis-item"] a', {
        timeout: 15000
      });
    } catch (error) {
      console.log(`⚠️ Primary selectors not found, trying fallback selectors...`);
      
      // Fallback: wait for any links that might be analysis items
      await page.waitForSelector('a[href*="/stock/"], a[href*="/company/"], .analysis a, .portfolio-item a', {
        timeout: 10000
      });
    }
    
    console.log(`🔍 Extracting analysis items from page...`);
    
    // Extract analysis items using multiple selector strategies
    const items = await page.evaluate(() => {
      const selectors = [
        'ul.analysis-list li a',
        '.analysis-item a',
        '[data-testid="analysis-item"] a',
        'a[href*="/stock/"]',
        'a[href*="/company/"]',
        '.analysis a',
        '.portfolio-item a'
      ];
      
      let elements = [];
      
      // Try each selector until we find items
      for (const selector of selectors) {
        elements = Array.from(document.querySelectorAll(selector));
        if (elements.length > 0) {
          console.log(`Found ${elements.length} items with selector: ${selector}`);
          break;
        }
      }
      
      // Extract data from found elements
      return elements
        .map(a => {
          const title = a.textContent?.trim();
          const url = a.href;
          
          // Filter out empty titles and non-analysis URLs
          if (!title || title.length < 5) return null;
          if (!url || (!url.includes('/stock/') && !url.includes('/company/') && !url.includes('trefis.com'))) return null;
          
          return { title, url };
        })
        .filter(Boolean) // Remove null entries
        .slice(0, 20); // Limit to 20 items for performance
    });
    
    console.log(`✅ Successfully extracted ${items.length} analysis items`);
    
    // Log first few items for debugging
    if (items.length > 0) {
      console.log(`📊 Sample items:`, items.slice(0, 3));
    }
    
    return items;
    
  } catch (error) {
    console.error(`❌ Error scraping ${type}:`, error.message);
    throw new Error(`Failed to scrape ${type} analyses: ${error.message}`);
  } finally {
    // Always close browser to prevent memory leaks
    if (browser) {
      await browser.close();
      console.log(`🔒 Browser closed for ${type} scrape`);
    }
  }
}

/**
 * Get actionable analyses, optionally filtered by sector
 * @param {string} sector - Optional sector filter (defense, health, energy)
 * @returns {Array} Array of actionable analysis items
 */
export async function getActionable(sector) {
  console.log(`🎯 Fetching actionable analyses for sector: ${sector || 'all'}`);
  
  const items = await scrapeTopic('actionable');
  
  // Optional: filter by sector keywords if needed
  if (sector && sector !== 'all') {
    const sectorKeywords = {
      defense: ['defense', 'military', 'aerospace', 'lockheed', 'boeing', 'raytheon', 'northrop'],
      health: ['pharma', 'biotech', 'healthcare', 'medical', 'drug', 'pfizer', 'johnson'],
      energy: ['energy', 'oil', 'gas', 'renewable', 'solar', 'exxon', 'chevron', 'bp']
    };
    
    const keywords = sectorKeywords[sector.toLowerCase()] || [];
    if (keywords.length > 0) {
      const filtered = items.filter(item => 
        keywords.some(keyword => 
          item.title.toLowerCase().includes(keyword) || 
          item.url.toLowerCase().includes(keyword)
        )
      );
      
      console.log(`🔍 Filtered ${items.length} → ${filtered.length} items for ${sector} sector`);
      return filtered;
    }
  }
  
  return items;
}

/**
 * Get featured analyses, optionally filtered by sector  
 * @param {string} sector - Optional sector filter (defense, health, energy)
 * @returns {Array} Array of featured analysis items
 */
export async function getFeatured(sector) {
  console.log(`⭐ Fetching featured analyses for sector: ${sector || 'all'}`);
  
  const items = await scrapeTopic('featured');
  
  // Optional: filter by sector keywords if needed
  if (sector && sector !== 'all') {
    const sectorKeywords = {
      defense: ['defense', 'military', 'aerospace', 'lockheed', 'boeing', 'raytheon', 'northrop'],
      health: ['pharma', 'biotech', 'healthcare', 'medical', 'drug', 'pfizer', 'johnson'],
      energy: ['energy', 'oil', 'gas', 'renewable', 'solar', 'exxon', 'chevron', 'bp']
    };
    
    const keywords = sectorKeywords[sector.toLowerCase()] || [];
    if (keywords.length > 0) {
      const filtered = items.filter(item => 
        keywords.some(keyword => 
          item.title.toLowerCase().includes(keyword) || 
          item.url.toLowerCase().includes(keyword)
        )
      );
      
      console.log(`🔍 Filtered ${items.length} → ${filtered.length} items for ${sector} sector`);
      return filtered;
    }
  }
  
  return items;
}