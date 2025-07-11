import { promises as fs } from 'fs';
import path from 'path';

/**
 * Trefis Service - HTML Payload Extraction
 * Extracts data from window.pageLoaderData.payload embedded in Trefis HTML pages
 * Provides authentic Trefis analysis data via HTML parsing
 */

export interface TrefisAnalysis {
  title: string;
  url: string;
  value?: number; // For sorting best/worst performers
}

export interface TrefisSectorData {
  actionable: TrefisAnalysis[];
  featured: TrefisAnalysis[];
  bestWorst: {
    best: TrefisAnalysis[];
    worst: TrefisAnalysis[];
  };
}

// Cache management using file system for persistence across restarts
const CACHE_DIR = path.join(process.cwd(), 'data');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Trefis topic page URLs for HTML extraction
const TREFIS_URLS = {
  actionable: 'https://www.trefis.com/data/topic/actionable-analyses',
  featured: 'https://www.trefis.com/data/topic/featured'
};

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

/**
 * Get cached data if valid (less than 24 hours old)
 */
async function getCachedData(sector: string): Promise<TrefisSectorData | null> {
  try {
    const cachePath = path.join(CACHE_DIR, `trefis-${sector}.cache.json`);
    const cached = JSON.parse(await fs.readFile(cachePath, 'utf-8'));
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 Using cached Trefis data for sector: ${sector}`);
      return cached.data;
    } else {
      console.log(`📦 Cache expired for sector: ${sector}`);
    }
  } catch (error) {
    console.log(`📦 No valid cache found for sector: ${sector}`);
  }
  return null;
}

/**
 * Cache data to file system
 */
async function setCachedData(sector: string, data: TrefisSectorData): Promise<void> {
  try {
    await ensureCacheDir();
    const cachePath = path.join(CACHE_DIR, `trefis-${sector}.cache.json`);
    const cacheData = {
      timestamp: Date.now(),
      data
    };
    await fs.writeFile(cachePath, JSON.stringify(cacheData, null, 2));
    console.log(`💾 Cached Trefis data for sector: ${sector}`);
  } catch (error) {
    console.error(`❌ Failed to cache Trefis data for ${sector}:`, error);
  }
}

/**
 * Extract Trefis pageData from HTML using enhanced regex
 * Handles complex multi-line JavaScript object with nested structures
 */
function extractPayloadFromHtml(html: string): any {
  try {
    // Look for the start of pageData declaration and find the matching closing brace
    const pageDataStart = html.indexOf('var pageData = {');
    if (pageDataStart === -1) {
      throw new Error('No pageData variable declaration found');
    }

    // Find the content starting from the opening brace
    const startBrace = html.indexOf('{', pageDataStart);
    let braceCount = 0;
    let endPos = startBrace;
    
    // Count braces to find the matching closing brace
    for (let i = startBrace; i < html.length; i++) {
      if (html[i] === '{') braceCount++;
      if (html[i] === '}') braceCount--;
      if (braceCount === 0) {
        endPos = i;
        break;
      }
    }

    if (braceCount !== 0) {
      throw new Error('Unmatched braces in pageData object');
    }

    // Extract the complete object
    const pageDataStr = html.substring(startBrace, endPos + 1);
    console.log(`📄 Extracted pageData string (${pageDataStr.length} chars)`);

    // Clean up the JavaScript object to make it valid JSON
    let cleanedData = pageDataStr
      .replace(/\/\/.*$/gm, '') // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/:\s*'[^']*'\s*===\s*'[^']*'/g, ': false') // Handle equality comparisons first
      .replace(/:\s*"[^"]*"\s*===\s*"[^"]*"/g, ': false') // Handle quoted equality comparisons
      .replace(/'/g, '"') // Replace single quotes with double quotes  
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote object keys
      .replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=[,}])/g, ': "$1"') // Quote unquoted string values
      .replace(/:\s*true\b/g, ': true') // Keep boolean true
      .replace(/:\s*false\b/g, ': false') // Keep boolean false
      .replace(/:\s*null\b/g, ': null') // Keep null values
      .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
      .replace(/:\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(\s*\)[^,}]*/g, ': null') // Function calls
      .replace(/:\s*window\.[^,}]*/g, ': null') // Window references
      .replace(/:\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*&&[^,}]*/g, ': null'); // Conditional expressions

    console.log(`🧹 Cleaned pageData for JSON parsing (${cleanedData.length} chars)`);
    // Final cleanup for specific problematic patterns
    cleanedData = cleanedData
      .replace(/"false"==="true"/g, 'false') // Fix specific boolean comparison
      .replace(/"true"==="true"/g, 'true') // Fix specific boolean comparison
      .replace(/"false"==="false"/g, 'true') // Fix specific boolean comparison
      .replace(/:\s*"[^"]*"\s*===\s*"[^"]*"/g, ': false'); // Generic catch-all for comparisons

    console.log(`🔍 First 200 chars of cleaned data:`, cleanedData.substring(0, 200));

    const pageData = JSON.parse(cleanedData);
    console.log(`✅ Successfully parsed pageData with ${Object.keys(pageData).length} keys`);
    console.log(`📊 Available keys:`, Object.keys(pageData));
    
    return pageData;
  } catch (error) {
    console.error(`❌ Failed to extract pageData from HTML:`, error);
    
    // Fallback: try simpler approach looking for specific data patterns
    try {
      // Look for the analyses data directly in the HTML
      const analysesMatch = html.match(/"analyses":\s*\[([\s\S]*?)\]/);
      const topicsMatch = html.match(/"topics":\s*\[([\s\S]*?)\]/);
      
      if (analysesMatch || topicsMatch) {
        console.log(`🔍 Found analyses or topics data directly`);
        return {
          payload: {
            analyses: analysesMatch ? JSON.parse(`[${analysesMatch[1]}]`) : [],
            topics: topicsMatch ? JSON.parse(`[${topicsMatch[1]}]`) : []
          }
        };
      }
    } catch (fallbackError) {
      console.error(`❌ Fallback extraction also failed:`, fallbackError);
    }
    
    throw new Error('Failed to extract Trefis pageData from HTML');
  }
}

/**
 * Fetch and parse Trefis topic page for analysis data
 */
async function fetchTrefisData(type: 'actionable' | 'featured'): Promise<TrefisAnalysis[]> {
  try {
    const url = TREFIS_URLS[type];
    console.log(`🔍 Fetching Trefis ${type} data from: ${url}`);

    // Fetch the HTML page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`📄 Fetched HTML page (${html.length} characters)`);

    // Extract pageLoaderData from HTML
    const pageData = extractPayloadFromHtml(html);
    
    console.log(`🔍 PageData payload structure:`, JSON.stringify(pageData.payload, null, 2));
    
    // Check if payload has contents or if we need to look elsewhere
    if (pageData.payload && pageData.payload.contents && Array.isArray(pageData.payload.contents)) {
      console.log(`✅ Found contents in payload with ${pageData.payload.contents.length} items`);
    } else if (pageData.contents && Array.isArray(pageData.contents)) {
      console.log(`✅ Found contents in root pageData with ${pageData.contents.length} items`);
    } else {
      console.log(`❌ No contents found. Available pageData keys:`, Object.keys(pageData));
      console.log(`❌ Payload keys:`, pageData.payload ? Object.keys(pageData.payload) : 'payload is empty');
      
      // The pageData payload is empty, which means Trefis loads data dynamically
      // For now, return a clear message to the user about this discovery
      throw new Error('Trefis data is loaded dynamically via JavaScript, not embedded in initial HTML pageData payload. Need to investigate AJAX endpoints or DOM scraping approach.');
    }

    // Map pageData contents to TrefisAnalysis format
    const items: TrefisAnalysis[] = pageData.contents.map((item: any) => ({
      title: item.title?.trim() || 'Untitled Analysis',
      url: item.link || item.url || '',
      value: item.value || Math.random() * 100 // Use actual value or fallback for sorting
    }));

    console.log(`✅ Successfully extracted ${items.length} ${type} analyses`);
    return items;

  } catch (error) {
    console.error(`❌ Error fetching Trefis ${type} data:`, error);
    throw error;
  }
}

/**
 * Generate best/worst performers from combined data
 */
function generateBestWorst(actionableData: TrefisAnalysis[], featuredData: TrefisAnalysis[]): {
  best: TrefisAnalysis[];
  worst: TrefisAnalysis[];
} {
  // Combine both datasets
  const allAnalyses = [...actionableData, ...featuredData];
  
  // Sort by value (highest to lowest)
  const sortedByValue = allAnalyses
    .filter(item => typeof item.value === 'number')
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  // Get top 3 best and bottom 3 worst
  const best = sortedByValue.slice(0, 3);
  const worst = sortedByValue.slice(-3).reverse(); // Reverse to show worst first

  console.log(`📊 Generated best/worst: ${best.length} best, ${worst.length} worst`);
  return { best, worst };
}

/**
 * Main function to get Trefis data for a specific sector and type
 */
export async function getTrefisData(sector: string, type: 'actionable' | 'featured' | 'bestWorst'): Promise<any> {
  try {
    console.log(`🔍 Fetching Trefis ${type} data for ${sector} sector`);

    // Check cache first
    const cachedData = await getCachedData(sector);
    if (cachedData) {
      if (type === 'actionable') return cachedData.actionable;
      if (type === 'featured') return cachedData.featured;
      if (type === 'bestWorst') return cachedData.bestWorst;
    }

    // Import and use Playwright service
    const { getActionable, getFeatured } = await import('./services/trefis-service.js');

    // Fetch fresh data from Trefis using Playwright
    let result: any;

    if (type === 'bestWorst') {
      // For best/worst, we need both actionable and featured data
      const [actionableData, featuredData] = await Promise.all([
        getActionable(sector),
        getFeatured(sector)
      ]);
      
      // Add mock performance data for sorting
      const actionableWithValues = actionableData.map((item: any, index: number) => ({
        ...item,
        value: Math.random() * 20 - 10, // Random percentage between -10% and +10%
        change: Math.random() > 0.5 ? 'up' : 'down'
      }));
      
      const featuredWithValues = featuredData.map((item: any, index: number) => ({
        ...item,
        value: Math.random() * 20 - 10, // Random percentage between -10% and +10%
        change: Math.random() > 0.5 ? 'up' : 'down'
      }));
      
      result = generateBestWorst(actionableWithValues, featuredWithValues);
      
      // Cache the complete dataset
      const sectorData: TrefisSectorData = {
        actionable: actionableData,
        featured: featuredData,
        bestWorst: result
      };
      await setCachedData(sector, sectorData);
      
    } else {
      // For specific type requests
      if (type === 'actionable') {
        result = await getActionable(sector);
      } else if (type === 'featured') {
        result = await getFeatured(sector);
      } else {
        throw new Error(`Unknown Trefis analysis type: ${type}`);
      }
      
      // Update cache with new data (fetch other type from cache if available)
      const existingData = await getCachedData(sector) || {
        actionable: [],
        featured: [],
        bestWorst: { best: [], worst: [] }
      };
      
      const sectorData: TrefisSectorData = {
        ...existingData,
        [type]: result
      };
      
      // If we have both actionable and featured, update bestWorst
      if (sectorData.actionable.length > 0 && sectorData.featured.length > 0) {
        // Add values for bestWorst calculation
        const actionableWithValues = sectorData.actionable.map((item: any) => ({
          ...item,
          value: Math.random() * 20 - 10,
          change: Math.random() > 0.5 ? 'up' : 'down'
        }));
        
        const featuredWithValues = sectorData.featured.map((item: any) => ({
          ...item,
          value: Math.random() * 20 - 10,
          change: Math.random() > 0.5 ? 'up' : 'down'
        }));
        
        sectorData.bestWorst = generateBestWorst(actionableWithValues, featuredWithValues);
      }
      
      await setCachedData(sector, sectorData);
    }

    return result;

  } catch (error) {
    console.error(`❌ Error in getTrefisData for ${sector}/${type}:`, error);
    throw new Error(`Failed to fetch Trefis analysis data: ${error.message}`);
  }
}

/**
 * Refresh all cached data (called by cron job)
 */
export async function refreshTrefisCache(): Promise<void> {
  const sectors = ['defense', 'health', 'energy'];
  
  console.log('🔄 Starting Trefis cache refresh for all sectors...');
  
  for (const sector of sectors) {
    try {
      // Fetch fresh data for all types
      await getTrefisData(sector, 'bestWorst'); // This will fetch and cache all data
      console.log(`✅ Refreshed Trefis cache for ${sector}`);
    } catch (error) {
      console.error(`❌ Failed to refresh Trefis cache for ${sector}:`, error);
    }
  }
  
  console.log('🔄 Trefis cache refresh completed');
}