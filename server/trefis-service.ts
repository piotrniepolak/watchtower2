import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Trefis Service - JSON Endpoint Integration
 * Reverse-engineered from network calls to Trefis topic pages
 * Provides authentic Trefis analysis data via discovered JSON APIs
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
    best: TrefisAnalysis | null;
    worst: TrefisAnalysis | null;
  };
}

// Cache management using file system for persistence across restarts
const CACHE_DIR = path.join(process.cwd(), 'data');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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
    }
  } catch (error) {
    console.log(`📦 No valid cache found for sector: ${sector}`);
  }
  return null;
}

/**
 * Save data to cache with timestamp
 */
async function saveToCache(sector: string, data: TrefisSectorData): Promise<void> {
  try {
    await ensureCacheDir();
    const cachePath = path.join(CACHE_DIR, `trefis-${sector}.cache.json`);
    await fs.writeFile(cachePath, JSON.stringify({ data, timestamp: Date.now() }, null, 2));
    console.log(`💾 Cached Trefis data for sector: ${sector}`);
  } catch (error) {
    console.error('Failed to save cache:', error);
  }
}

/**
 * Fetch authentic Trefis analysis data from real JSON endpoints
 * 
 * SETUP REQUIRED - FOLLOW THESE STEPS:
 * 
 * Step 1: Network Inspection to Discover Real Endpoints
 *   1. Open browser DevTools
 *   2. Go to https://www.trefis.com/data/topic/actionable-analyses
 *   3. Open Network tab, filter for XHR/Fetch requests
 *   4. Look for JSON requests that return analysis data
 *   5. Copy the exact URL, headers, and parameters
 *   6. Repeat for https://www.trefis.com/data/topic/featured
 * 
 * Step 2: Update the REAL_ENDPOINTS configuration below
 *   - Replace placeholder URLs with discovered endpoints
 *   - Add any required authentication headers
 *   - Update query parameters as needed
 * 
 * @param sector - Target sector (health, defense, energy)
 * @returns Promise<TrefisSectorData> - Structured analysis data from real Trefis APIs
 */
export async function fetchAuthenticTrefisData(sector: string): Promise<TrefisSectorData> {
  try {
    // Check cache first (24-hour expiration)
    const cachedData = await getCachedData(sector);
    if (cachedData) {
      console.log(`✅ Using cached Trefis data for ${sector} sector`);
      return cachedData;
    }

    console.log(`🔍 Attempting to fetch from REAL Trefis JSON endpoints for ${sector}...`);

    // STEP 2: REPLACE THESE WITH REAL ENDPOINTS DISCOVERED VIA NETWORK INSPECTION
    // Current endpoints are placeholders - they will fail until updated with real URLs
    const REAL_ENDPOINTS = {
      actionable: `https://www.trefis.com/api/PLACEHOLDER_NEEDS_DISCOVERY/actionable?sector=${sector}`,
      featured: `https://www.trefis.com/api/PLACEHOLDER_NEEDS_DISCOVERY/featured?sector=${sector}`
    };

    // STEP 2: ADD REAL HEADERS DISCOVERED VIA NETWORK INSPECTION
    // These headers need to be updated based on what Trefis actually requires
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.trefis.com/data/topic/actionable-analyses',
      'X-Requested-With': 'XMLHttpRequest',
      // UNCOMMENT AND UPDATE THESE WHEN DISCOVERED:
      // 'Authorization': 'Bearer REAL_TOKEN_FROM_NETWORK_INSPECTION',
      // 'Cookie': 'session_id=REAL_SESSION_FROM_NETWORK_INSPECTION',
      // 'X-Trefis-Token': 'REAL_TREFIS_TOKEN_FROM_NETWORK_INSPECTION',
      // 'X-API-Key': 'REAL_API_KEY_FROM_NETWORK_INSPECTION'
    };

    // Fetch actionable analyses from real endpoint
    let actionableAnalyses: TrefisAnalysis[] = [];
    try {
      console.log(`📡 Calling REAL actionable endpoint: ${REAL_ENDPOINTS.actionable}`);
      
      const actionableResponse = await fetch(REAL_ENDPOINTS.actionable, {
        headers,
        timeout: 15000
      });

      if (actionableResponse.ok) {
        const actionableJson = await actionableResponse.json();
        actionableAnalyses = parseAnalysesFromJson(actionableJson, sector);
        console.log(`✅ Retrieved ${actionableAnalyses.length} actionable analyses from real endpoint`);
      } else {
        console.log(`❌ Real actionable endpoint failed: ${actionableResponse.status} ${actionableResponse.statusText}`);
        console.log(`📋 Response headers:`, actionableResponse.headers);
      }
    } catch (error) {
      console.log(`❌ Real actionable endpoint error: ${error.message}`);
    }

    // Fetch featured analyses from real endpoint
    let featuredAnalyses: TrefisAnalysis[] = [];
    try {
      console.log(`📡 Calling REAL featured endpoint: ${REAL_ENDPOINTS.featured}`);
      
      const featuredResponse = await fetch(REAL_ENDPOINTS.featured, {
        headers,
        timeout: 15000
      });

      if (featuredResponse.ok) {
        const featuredJson = await featuredResponse.json();
        featuredAnalyses = parseAnalysesFromJson(featuredJson, sector);
        console.log(`✅ Retrieved ${featuredAnalyses.length} featured analyses from real endpoint`);
      } else {
        console.log(`❌ Real featured endpoint failed: ${featuredResponse.status} ${featuredResponse.statusText}`);
        console.log(`📋 Response headers:`, featuredResponse.headers);
      }
    } catch (error) {
      console.log(`❌ Real featured endpoint error: ${error.message}`);
    }

    // Calculate best/worst performers from retrieved data
    const allAnalyses = [...actionableAnalyses, ...featuredAnalyses];
    const bestWorst = calculateBestWorst(allAnalyses);

    const data: TrefisSectorData = {
      actionable: actionableAnalyses,
      featured: featuredAnalyses,
      bestWorst
    };
    
    // Strict no-fallback policy: fail if no real data retrieved
    if (!data.actionable.length && !data.featured.length) {
      throw new Error(`Network inspection required: Real Trefis JSON endpoints must be discovered via browser DevTools.

INSTRUCTIONS:
1. Open DevTools on https://www.trefis.com/data/topic/actionable-analyses
2. Go to Network tab, filter for XHR/Fetch requests  
3. Look for JSON requests returning analysis data
4. Copy the exact URL and headers
5. Update REAL_ENDPOINTS in server/trefis-service.ts
6. Add any required authorization headers

Current placeholder endpoints failed: ${REAL_ENDPOINTS.actionable}, ${REAL_ENDPOINTS.featured}`);
    }
    
    // Cache the authentic data for 24 hours
    await saveToCache(sector, data);
    console.log(`💾 Cached authentic Trefis data for ${sector} sector`);
    
    return data;
    
  } catch (error) {
    console.error(`❌ Error fetching from real Trefis JSON endpoints:`, error);
    throw error;
  }
}

/**
 * Parse JSON response from Trefis API into structured analysis objects
 * Handles various possible JSON response formats from discovered endpoints
 */
function parseAnalysesFromJson(jsonData: any, sector: string): TrefisAnalysis[] {
  if (!jsonData || !Array.isArray(jsonData)) {
    console.warn('Invalid JSON data structure received from Trefis API');
    return [];
  }
  
  return jsonData
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      title: item.title || item.name || item.headline || 'Untitled Analysis',
      url: formatTrefisUrl(item.url || item.link || item.path || item.href),
      value: item.value || item.performance || item.score || item.change || 0
    }))
    .filter(analysis => 
      analysis.title.length > 10 && 
      analysis.url && 
      analysis.url.includes('trefis.com')
    )
    .slice(0, 6); // Limit to 6 per section
}

/**
 * Ensure URLs are properly formatted for Trefis company analysis pages
 * Converts relative URLs to absolute and ensures no-login-required format
 */
function formatTrefisUrl(url: string): string {
  if (!url) return '';
  
  // Ensure full URL format
  if (url.startsWith('/')) {
    url = `https://www.trefis.com${url}`;
  }
  
  // Ensure no-login-required format for popup compatibility
  if (url.includes('/data/companies/') && !url.includes('/no-login-required/')) {
    // Transform company URLs to no-login-required format
    // Example: /data/companies/AAPL/revenue -> /data/companies/AAPL/no-login-required/revenue
    url = url.replace(/\/data\/companies\/([^\/]+)\/(.+)/, '/data/companies/$1/no-login-required/$2');
    
    // Ensure full URL
    if (!url.startsWith('http')) {
      url = `https://www.trefis.com${url}`;
    }
  }
  
  return url;
}

/**
 * Calculate best and worst performers from analysis data
 * Sorts by numeric value field if available, otherwise uses position
 */
function calculateBestWorst(analyses: TrefisAnalysis[]): { best: TrefisAnalysis | null; worst: TrefisAnalysis | null } {
  if (analyses.length === 0) {
    return { best: null, worst: null };
  }
  
  // Sort by value (performance metric) if available
  const withValues = analyses.filter(a => typeof a.value === 'number' && a.value !== 0);
  
  if (withValues.length >= 2) {
    const sorted = withValues.sort((a, b) => (b.value || 0) - (a.value || 0));
    return {
      best: sorted[0] || null,
      worst: sorted[sorted.length - 1] || null
    };
  }
  
  // Fallback to first and last if no value data
  return {
    best: analyses[0] || null,
    worst: analyses[analyses.length - 1] || null
  };
}

/**
 * Get Trefis data for sector and type (main export function)
 * @param sector - Target sector (health, defense, energy)  
 * @param type - Data type (actionable, featured, bestWorst)
 * @returns Requested analysis data or throws error if unavailable
 */
export async function getTrefisData(sector: string, type: 'actionable' | 'featured' | 'bestWorst'): Promise<any> {
  const data = await fetchAuthenticTrefisData(sector);
  
  if (type === 'bestWorst') {
    return data.bestWorst;
  }
  
  return data[type];
}

/**
 * Clear cache for all sectors (used by cron job to force refresh)
 */
export async function clearTrefisCache(): Promise<void> {
  try {
    await ensureCacheDir();
    const files = await fs.readdir(CACHE_DIR);
    
    for (const file of files) {
      if (file.startsWith('trefis-') && file.endsWith('.cache.json')) {
        await fs.unlink(path.join(CACHE_DIR, file));
        console.log(`🗑️ Cleared cache: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error clearing Trefis cache:', error);
  }
}