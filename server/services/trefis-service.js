// services/trefis-service.js
// Browserless.io-based scraper for Trefis's JavaScript-rendered content
// Uses external cloud browser service to handle dynamic content rendering
import fetch from 'node-fetch';
import { load } from 'cheerio';

// Hard-code the token temporarily since env vars aren't loading properly
const BROWSERLESS_TOKEN = "2SezILpKdgVB8oS1eda4f7dc755e4030931925fcd8ebcd6d8";
const TOPIC_URLS = {
  actionable: 'https://www.trefis.com/data/topic/actionable-analyses',
  featured: 'https://www.trefis.com/data/topic/featured'
};

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
    throw new Error(`Browserless fetch failed: ${resp.status} ${resp.statusText}`);
  }
  
  const html = await resp.text();
  console.log(`✅ Successfully fetched rendered HTML (${html.length} characters)`);
  
  return html;
}

/**
 * Get actionable analyses using Browserless.io and Cheerio parsing
 * @param {string} sector - Optional sector filter (defense, health, energy)
 * @returns {Array} Array of actionable analysis items
 */
export async function getActionable(sector) {
  console.log(`🎯 Fetching actionable analyses for sector: ${sector || 'all'}`);
  
  try {
    // Fetch fully rendered HTML from Browserless.io
    const html = await fetchRenderedHTML(TOPIC_URLS.actionable);
    
    // Parse HTML with Cheerio
    const $ = load(html);
    
    console.log(`🔍 Parsing analysis items from rendered HTML...`);
    
    // Extract analysis items by looking for the specific pattern in Trefis content
    let items = [];
    
    // First try to parse using text content structure since links may not be standard
    const bodyText = $.text();
    const lines = bodyText.split('\n').map(line => line.trim()).filter(Boolean);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for stock ticker patterns (1-5 capital letters)
      const tickerMatch = line.match(/^([A-Z]{1,5})$/);
      if (tickerMatch && i + 1 < lines.length) {
        const ticker = tickerMatch[1];
        const nextLine = lines[i + 1];
        
        // Check if next line contains analysis content
        if (nextLine && nextLine.length > 20 && 
            (nextLine.includes('Better Bet') || 
             nextLine.includes('Stock:') || 
             nextLine.includes('Analysis') ||
             nextLine.includes('Pay Less') ||
             nextLine.includes('Get More'))) {
          
          // Create a synthetic URL for the analysis
          const analysisUrl = `https://www.trefis.com/stock/${ticker.toLowerCase()}/analysis`;
          items.push({
            title: `${ticker}: ${nextLine.replace(/^\[[\d\/]+\]\s*/, '')}`, // Remove date prefix
            url: analysisUrl
          });
        }
      }
    }
    
    // Fallback: also check for traditional link extraction
    $('a').each((_, element) => {
      const $el = $(element);
      const title = $el.text().trim();
      const url = $el.attr('href') || element.attribs?.href;
      
      // Filter for meaningful analysis links
      if (!url || !title) return;
      if (title.length < 20) return; // Longer threshold for links
      
      // Look for stock/company analysis indicators
      const isAnalysisLink = (
        url.includes('/stock/') ||
        url.includes('/company/') ||
        title.includes('Better Bet') ||
        title.includes('Stock:') ||
        title.match(/\b[A-Z]{1,5}\b.*Stock/i) // Ticker + "Stock" pattern
      );
      
      if (isAnalysisLink) {
        // Ensure full URL
        const fullUrl = url.startsWith('http') ? url : `https://www.trefis.com${url}`;
        items.push({ title, url: fullUrl });
      }
    });
    
    // Remove duplicates and limit
    items = items.filter((item, index, self) => 
      index === self.findIndex(t => t.url === item.url)
    ).slice(0, 20);
    
    console.log(`📊 Found ${items.length} potential analysis items before sector filtering`);
    
    // Optional: filter by sector keywords
    if (sector && sector !== 'all') {
      const sectorKeywords = {
        defense: ['defense', 'military', 'aerospace', 'lockheed', 'boeing', 'raytheon', 'northrop', 'lmt', 'ba', 'rtx', 'noc', 'gd'],
        health: ['pharma', 'biotech', 'healthcare', 'medical', 'drug', 'pfizer', 'johnson', 'jnj', 'pfe', 'mrk', 'abbv'],
        energy: ['energy', 'oil', 'gas', 'renewable', 'solar', 'exxon', 'chevron', 'xom', 'cvx', 'cop', 'hal']
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
    
    console.log(`📊 Successfully extracted ${items.length} actionable analyses`);
    return items;
    
  } catch (error) {
    console.error(`❌ Error fetching actionable analyses:`, error.message);
    throw new Error(`Failed to fetch actionable analyses: ${error.message}`);
  }
}

/**
 * Get featured analyses using Browserless.io and Cheerio parsing  
 * @param {string} sector - Optional sector filter (defense, health, energy)
 * @returns {Array} Array of featured analysis items
 */
export async function getFeatured(sector) {
  console.log(`⭐ Fetching featured analyses for sector: ${sector || 'all'}`);
  
  try {
    // Fetch fully rendered HTML from Browserless.io
    const html = await fetchRenderedHTML(TOPIC_URLS.featured);
    
    // Parse HTML with Cheerio
    const $ = load(html);
    
    console.log(`🔍 Parsing analysis items from rendered HTML...`);
    
    // Extract analysis items by looking for the specific pattern in Trefis content
    let items = [];
    
    // First try to parse using text content structure since links may not be standard
    const bodyText = $.text();
    const lines = bodyText.split('\n').map(line => line.trim()).filter(Boolean);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for stock ticker patterns (1-5 capital letters)
      const tickerMatch = line.match(/^([A-Z]{1,5})$/);
      if (tickerMatch && i + 1 < lines.length) {
        const ticker = tickerMatch[1];
        const nextLine = lines[i + 1];
        
        // Check if next line contains analysis content
        if (nextLine && nextLine.length > 20 && 
            (nextLine.includes('Better Bet') || 
             nextLine.includes('Stock:') || 
             nextLine.includes('Analysis') ||
             nextLine.includes('Pay Less') ||
             nextLine.includes('Get More'))) {
          
          // Create a synthetic URL for the analysis
          const analysisUrl = `https://www.trefis.com/stock/${ticker.toLowerCase()}/analysis`;
          items.push({
            title: `${ticker}: ${nextLine.replace(/^\[[\d\/]+\]\s*/, '')}`, // Remove date prefix
            url: analysisUrl
          });
        }
      }
    }
    
    // Fallback: also check for traditional link extraction
    $('a').each((_, element) => {
      const $el = $(element);
      const title = $el.text().trim();
      const url = $el.attr('href') || element.attribs?.href;
      
      // Filter for meaningful analysis links
      if (!url || !title) return;
      if (title.length < 20) return; // Longer threshold for links
      
      // Look for stock/company analysis indicators
      const isAnalysisLink = (
        url.includes('/stock/') ||
        url.includes('/company/') ||
        title.includes('Better Bet') ||
        title.includes('Stock:') ||
        title.match(/\b[A-Z]{1,5}\b.*Stock/i) // Ticker + "Stock" pattern
      );
      
      if (isAnalysisLink) {
        // Ensure full URL
        const fullUrl = url.startsWith('http') ? url : `https://www.trefis.com${url}`;
        items.push({ title, url: fullUrl });
      }
    });
    
    // Remove duplicates and limit
    items = items.filter((item, index, self) => 
      index === self.findIndex(t => t.url === item.url)
    ).slice(0, 20);
    
    console.log(`📊 Found ${items.length} potential analysis items before sector filtering`);
    
    // Optional: filter by sector keywords
    if (sector && sector !== 'all') {
      const sectorKeywords = {
        defense: ['defense', 'military', 'aerospace', 'lockheed', 'boeing', 'raytheon', 'northrop', 'lmt', 'ba', 'rtx', 'noc', 'gd'],
        health: ['pharma', 'biotech', 'healthcare', 'medical', 'drug', 'pfizer', 'johnson', 'jnj', 'pfe', 'mrk', 'abbv'],
        energy: ['energy', 'oil', 'gas', 'renewable', 'solar', 'exxon', 'chevron', 'xom', 'cvx', 'cop', 'hal']
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
    
    console.log(`📊 Successfully extracted ${items.length} featured analyses`);
    return items;
    
  } catch (error) {
    console.error(`❌ Error fetching featured analyses:`, error.message);
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
    
    // Combine and merge on value attribute if available
    const allItems = [...actionable, ...featured];
    
    // Sort by value if available (placeholder logic - would need actual value extraction)
    const sortedItems = allItems.sort((a, b) => {
      // For now, sort alphabetically by title as placeholder
      // In real implementation, would extract and sort by actual performance values
      return a.title.localeCompare(b.title);
    });
    
    const mid = Math.floor(sortedItems.length / 2);
    
    return {
      best: sortedItems.slice(0, mid),
      worst: sortedItems.slice(mid)
    };
    
  } catch (error) {
    console.error(`❌ Error fetching best/worst analyses:`, error.message);
    throw new Error(`Failed to fetch best/worst analyses: ${error.message}`);
  }
}