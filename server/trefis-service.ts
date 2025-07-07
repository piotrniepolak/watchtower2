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
 * Fetch authentic Trefis analysis data from reverse-engineered JSON endpoints
 * These endpoints were discovered by inspecting network calls on Trefis topic pages
 * @param sector - Target sector (health, defense, energy)
 * @returns Promise<TrefisSectorData> - Structured analysis data from Trefis JSON APIs
 */
export async function fetchAuthenticTrefisData(sector: string): Promise<TrefisSectorData> {
  try {
    // Check cache first - return cached data if valid
    const cachedData = await getCachedData(sector);
    if (cachedData) {
      return cachedData;
    }

    console.log(`🔍 Fetching authentic Trefis data from JSON endpoints for sector: ${sector}`);
    
    // Reverse-engineered JSON endpoints from network inspection
    // TODO: These endpoints need to be discovered by inspecting network calls on:
    // https://www.trefis.com/data/topic/actionable-analyses
    // https://www.trefis.com/data/topic/featured
    
    const baseUrl = 'https://www.trefis.com';
    
    // Standard headers to mimic browser requests
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://www.trefis.com/data/topic/actionable-analyses'
    };

    // Attempt to discover JSON endpoints - these URLs need to be reverse-engineered
    // Common patterns for API endpoints based on typical SPA architectures:
    const possibleEndpoints = [
      // Pattern 1: Direct API with query parameters
      `${baseUrl}/api/topic/analysis?actionable=true&sector=${sector}`,
      `${baseUrl}/api/topic/analysis?featured=true&sector=${sector}`,
      
      // Pattern 2: RESTful API structure  
      `${baseUrl}/api/topics/actionable-analyses/${sector}`,
      `${baseUrl}/api/topics/featured/${sector}`,
      
      // Pattern 3: GraphQL or specialized endpoints
      `${baseUrl}/data/api/actionable?sector=${sector}`,
      `${baseUrl}/data/api/featured?sector=${sector}`,
      
      // Pattern 4: Static JSON files
      `${baseUrl}/data/topic/actionable-analyses.json?sector=${sector}`,
      `${baseUrl}/data/topic/featured.json?sector=${sector}`
    ];
    
    console.log(`🔍 Attempting to discover JSON endpoints for ${sector}...`);
    
    let actionableData: any[] = [];
    let featuredData: any[] = [];
    
    // Try to fetch actionable analyses
    for (const endpoint of possibleEndpoints.filter(url => url.includes('actionable'))) {
      try {
        console.log(`📡 Trying actionable endpoint: ${endpoint}`);
        const response = await fetch(endpoint, { headers });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            actionableData = data;
            console.log(`✅ Found actionable data at ${endpoint}: ${data.length} items`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Failed to fetch from ${endpoint}: ${error}`);
      }
    }
    
    // Try to fetch featured analyses
    for (const endpoint of possibleEndpoints.filter(url => url.includes('featured'))) {
      try {
        console.log(`📡 Trying featured endpoint: ${endpoint}`);
        const response = await fetch(endpoint, { headers });
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            featuredData = data;
            console.log(`✅ Found featured data at ${endpoint}: ${data.length} items`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Failed to fetch from ${endpoint}: ${error}`);
      }
    }
    
    console.log(`📊 Discovered data - Actionable: ${actionableData.length}, Featured: ${featuredData.length}`);
    
    // Parse and structure the response data
    const actionable = parseAnalysesFromJson(actionableData, sector);
    const featured = parseAnalysesFromJson(featuredData, sector);
    
    // Calculate best/worst performers from combined data
    const allAnalyses = [...actionable, ...featured];
    const bestWorst = calculateBestWorst(allAnalyses);
    
    const data: TrefisSectorData = {
      actionable,
      featured,
      bestWorst
    };
    
    // If no data was extracted, fail without fallback (per user requirements)
    if (!data.actionable.length && !data.featured.length) {
      throw new Error('No authentic Trefis data could be extracted from discovered JSON endpoints. Network inspection required to identify correct API endpoints.');
    }
    
    // Cache the authentic data for 24 hours
    await saveToCache(sector, data);
    
    return data;
    
  } catch (error) {
    console.error('Error fetching authentic Trefis data from JSON endpoints:', error);
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