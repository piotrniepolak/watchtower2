// services/trefis-service.js
// Browserless.io-based scraper for Trefis's JavaScript-rendered content
// Uses external cloud browser service to handle dynamic content rendering
import fetch from 'node-fetch';
import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';

// Hard-code the token temporarily since env vars aren't loading properly
const BROWSERLESS_TOKEN = "2SezILpKdgVB8oS1eda4f7dc755e4030931925fcd8ebcd6d8";
const TOPIC_URLS = {
  actionable: 'https://www.trefis.com/data/topic/actionable-analyses',
  featured: 'https://www.trefis.com/data/topic/featured'
};

/**
 * Check if cache file exists and is younger than 24 hours
 * @param {string} cachePath - Path to cache file
 * @returns {boolean} True if cache is valid
 */
function isCacheValid(cachePath) {
  try {
    if (!fs.existsSync(cachePath)) {
      return false;
    }
    const stats = fs.statSync(cachePath);
    const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
    return ageInHours < 24;
  } catch (error) {
    console.warn(`Error checking cache validity: ${error.message}`);
    return false;
  }
}

/**
 * Read cache file and return parsed JSON
 * @param {string} cachePath - Path to cache file
 * @returns {Array|null} Cached items or null if error
 */
function readCache(cachePath) {
  try {
    if (fs.existsSync(cachePath)) {
      const cacheData = fs.readFileSync(cachePath, 'utf8');
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.warn(`Error reading cache: ${error.message}`);
  }
  return null;
}

/**
 * Write items to cache file
 * @param {string} cachePath - Path to cache file
 * @param {Array} items - Items to cache
 */
function writeCache(cachePath, items) {
  try {
    const dataDir = path.dirname(cachePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(cachePath, JSON.stringify(items), 'utf8');
    console.log(`✅ Cache written to ${cachePath} with ${items.length} items`);
  } catch (error) {
    console.error(`Error writing cache: ${error.message}`);
  }
}

/**
 * Fetch fully rendered HTML from Browserless.io cloud service
 * @param {string} url - URL to render with JavaScript execution
 * @returns {string} Fully rendered HTML content
 */
async function fetchRenderedHTML(url) {
  console.log(`🌐 Fetching rendered HTML from Browserless.io for: ${url}`);
  
  if (!BROWSERLESS_TOKEN) {
    throw new Error('BROWSERLESS_TOKEN environment variable is required');
  }
  
  // Use Browserless.io function API to get fully rendered HTML
  const browserlessUrl = `https://production-sfo.browserless.io/function?token=${BROWSERLESS_TOKEN}`;
  
  const resp = await fetch(browserlessUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: `export default async ({ page }) => {
        await page.goto("${url}", { waitUntil: "networkidle0" });
        return await page.content();
      }`
    }),
    timeout: 45000
  });
  
  if (!resp.ok) {
    const errorMessage = `Browserless fetch failed: ${resp.status} ${resp.statusText}`;
    if (resp.status === 429) {
      throw new Error(`429 ${errorMessage}`);
    }
    throw new Error(errorMessage);
  }
  
  const html = await resp.text();
  console.log(`✅ Successfully fetched rendered HTML (${html.length} characters)`);
  
  return html;
}

/**
 * Get actionable analyses using improved scraping logic with caching
 * @param {string} sector - Optional sector filter (defense, health, energy)
 * @returns {Array} Array of actionable analysis items
 */
export async function getActionable(sector) {
  console.log(`🎯 Fetching actionable analyses for sector: ${sector || 'all'}`);
  
  const cachePath = path.join(process.cwd(), 'data', `trefis-${sector || 'all'}-actionable.json`);
  
  if (isCacheValid(cachePath)) {
    const cachedItems = readCache(cachePath);
    if (cachedItems) {
      console.log(`📋 Using cached actionable data for ${sector || 'all'} (${cachedItems.length} items)`);
      return cachedItems;
    }
  }
  
  try {
    // Fetch fully rendered HTML from Browserless.io
    const html = await fetchRenderedHTML(TOPIC_URLS.actionable);
    
    // Parse HTML with Cheerio
    const $ = load(html);
    
    console.log(`🔍 Parsing analysis items using refined pattern matching...`);
    
    // Extract analysis items using the specific pattern: TICKER "[MM/DD/YYYY] Title"
    let items = [];
    
    // Look for all text nodes matching the pattern: TICKER "[date]" followed by analysis title
    const allTextNodes = $('p, div').map((_, el) => $(el).text().trim()).get();
    
    for (const text of allTextNodes) {
      // Match pattern: 2-5 capital letters + space + "[date]" + title
      const tickerMatch = text.match(/^([A-Z]{2,5})\s+"\[(\d{1,2}\/\d{1,2}\/\d{4})\]\s*(.+)"/);
      if (tickerMatch) {
        const [, ticker, date, title] = tickerMatch;
        
        // Create clean title by removing any extra formatting
        const cleanTitle = title.trim();
        
        // Generate Trefis URL with slugified title for direct access
        const slugifiedTitle = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        const analysisUrl = `https://www.trefis.com/data/companies/${ticker}/no-login-required/${slugifiedTitle}`;
        
        items.push({
          ticker,
          title: cleanTitle,
          url: analysisUrl,
          date
        });
      }
    }
    
    console.log(`📊 Found ${items.length} analysis items before sector filtering`);
    
    // Sector-specific filtering based on ticker lists
    if (sector && sector !== 'all') {
      const sectorTickers = {
        defense: ['LMT', 'NOC', 'RTX', 'GD', 'BA', 'KTOS', 'AVAV', 'LDOS', 'TXT', 'CW'],
        health: ['JNJ', 'MRK', 'PFE', 'ABBV', 'LLY', 'BMY', 'AMRX', 'BHC', 'GILD', 'BIIB'],
        energy: ['XOM', 'CVX', 'BP', 'COP', 'EOG', 'PSX', 'VLO', 'MPC', 'HAL', 'SLB']
      };
      
      const allowedTickers = sectorTickers[sector.toLowerCase()] || [];
      if (allowedTickers.length > 0) {
        const filtered = items.filter(item => allowedTickers.includes(item.ticker));
        console.log(`🔍 Filtered ${items.length} → ${filtered.length} items for ${sector} sector`);
        items = filtered;
      }
    }
    
    writeCache(cachePath, items);
    
    console.log(`📊 Successfully extracted ${items.length} actionable analyses`);
    return items;
    
  } catch (error) {
    console.error(`❌ Error fetching actionable analyses:`, error.message);
    
    const staleCache = readCache(cachePath);
    if (staleCache && (error.message.includes('429') || error.message.includes('rate limit'))) {
      console.warn(`⚠️ Using stale cache due to rate limiting (${staleCache.length} items)`);
      return staleCache;
    }
    
    throw new Error(`Failed to fetch actionable analyses: ${error.message}`);
  }
}

/**
 * Get featured analyses using improved scraping logic with caching
 * @param {string} sector - Optional sector filter (defense, health, energy)
 * @returns {Array} Array of featured analysis items
 */
export async function getFeatured(sector) {
  console.log(`⭐ Fetching featured analyses for sector: ${sector || 'all'}`);
  
  const cachePath = path.join(process.cwd(), 'data', `trefis-${sector || 'all'}-featured.json`);
  
  if (isCacheValid(cachePath)) {
    const cachedItems = readCache(cachePath);
    if (cachedItems) {
      console.log(`📋 Using cached featured data for ${sector || 'all'} (${cachedItems.length} items)`);
      return cachedItems;
    }
  }
  
  try {
    // Fetch fully rendered HTML from Browserless.io
    const html = await fetchRenderedHTML(TOPIC_URLS.featured);
    
    // Parse HTML with Cheerio
    const $ = load(html);
    
    console.log(`🔍 Parsing analysis items using refined pattern matching...`);
    
    // Extract analysis items using the specific pattern: TICKER "[MM/DD/YYYY] Title"
    let items = [];
    
    // Look for all text nodes matching the pattern: TICKER "[date]" followed by analysis title
    const allTextNodes = $('p, div').map((_, el) => $(el).text().trim()).get();
    
    for (const text of allTextNodes) {
      // Match pattern: 2-5 capital letters + space + "[date]" + title
      const tickerMatch = text.match(/^([A-Z]{2,5})\s+"\[(\d{1,2}\/\d{1,2}\/\d{4})\]\s*(.+)"/);
      if (tickerMatch) {
        const [, ticker, date, title] = tickerMatch;
        
        // Create clean title by removing any extra formatting
        const cleanTitle = title.trim();
        
        // Generate Trefis URL with slugified title for direct access
        const slugifiedTitle = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        const analysisUrl = `https://www.trefis.com/data/companies/${ticker}/no-login-required/${slugifiedTitle}`;
        
        items.push({
          ticker,
          title: cleanTitle,
          url: analysisUrl,
          date
        });
      }
    }
    
    console.log(`📊 Found ${items.length} analysis items before sector filtering`);
    
    // Sector-specific filtering based on ticker lists
    if (sector && sector !== 'all') {
      const sectorTickers = {
        defense: ['LMT', 'NOC', 'RTX', 'GD', 'BA', 'KTOS', 'AVAV', 'LDOS', 'TXT', 'CW'],
        health: ['JNJ', 'MRK', 'PFE', 'ABBV', 'LLY', 'BMY', 'AMRX', 'BHC', 'GILD', 'BIIB'],
        energy: ['XOM', 'CVX', 'BP', 'COP', 'EOG', 'PSX', 'VLO', 'MPC', 'HAL', 'SLB']
      };
      
      const allowedTickers = sectorTickers[sector.toLowerCase()] || [];
      if (allowedTickers.length > 0) {
        const filtered = items.filter(item => allowedTickers.includes(item.ticker));
        console.log(`🔍 Filtered ${items.length} → ${filtered.length} items for ${sector} sector`);
        items = filtered;
      }
    }
    
    writeCache(cachePath, items);
    
    console.log(`📊 Successfully extracted ${items.length} featured analyses`);
    return items;
    
  } catch (error) {
    console.error(`❌ Error fetching featured analyses:`, error.message);
    
    const staleCache = readCache(cachePath);
    if (staleCache && (error.message.includes('429') || error.message.includes('rate limit'))) {
      console.warn(`⚠️ Using stale cache due to rate limiting (${staleCache.length} items)`);
      return staleCache;
    }
    
    throw new Error(`Failed to fetch featured analyses: ${error.message}`);
  }
}

/**
 * Get best and worst performing analyses for overview
 * Combines actionable and featured analyses and sorts by value if available
 * @param {string} sector - Optional sector filter (defense, health, energy)
 * @returns {Object} Object with {best: Array, worst: Array} analysis items
 */
export async function getBestWorst(sector) {
  console.log(`📈 Fetching best/worst analyses for sector: ${sector || 'all'}`);
  
  try {
    // Fetch both actionable and featured analyses
    const [actionable, featured] = await Promise.all([
      getActionable(sector),
      getFeatured(sector)
    ]);
    
    // Combine analyses and remove duplicates based on ticker
    const allItems = [...actionable, ...featured];
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(t => t.ticker === item.ticker)
    );
    
    // Add mock performance values for sorting (in real implementation would extract from content)
    const itemsWithValues = uniqueItems.map(item => ({
      ...item,
      value: Math.random() * 100 // Mock value for sorting - replace with actual extraction
    }));
    
    // Sort by value for best/worst determination
    const sortedItems = itemsWithValues.sort((a, b) => b.value - a.value);
    
    const mid = Math.floor(sortedItems.length / 2);
    
    return {
      best: sortedItems.slice(0, mid),
      worst: sortedItems.slice(mid).reverse() // Reverse worst to show lowest first
    };
    
  } catch (error) {
    console.error(`❌ Error fetching best/worst analyses:`, error.message);
    throw new Error(`Failed to fetch best/worst analyses: ${error.message}`);
  }
}
