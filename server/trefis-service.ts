import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Trefis Service - Handles extraction and caching of Trefis analysis data
 * Provides actionable analyses, featured analyses, and best/worst performers
 * for defense, health, and energy sectors
 */

export interface TrefisAnalysis {
  title: string;
  url: string;
}

export interface TrefisBestWorst {
  best: TrefisAnalysis;
  worst: TrefisAnalysis;
}

// Map sectors to Trefis URL parameters
const SECTOR_MAPPING = {
  defense: 'defense',
  health: 'healthcare', 
  energy: 'energy'
};

// Cache directory for storing Trefis data
const CACHE_DIR = path.join(process.cwd(), 'data', 'trefis-cache');

/**
 * Ensure cache directory exists
 */
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Get cache file path for sector
 */
function getCacheFilePath(sector: string): string {
  return path.join(CACHE_DIR, `trefis-${sector}.cache.json`);
}

/**
 * Check if cache is valid (created today)
 */
function isCacheValid(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  
  const stats = fs.statSync(filePath);
  const today = new Date().toDateString();
  const cacheDate = new Date(stats.mtime).toDateString();
  
  return today === cacheDate;
}

/**
 * Save data to cache
 */
function saveToCache(sector: string, data: any) {
  ensureCacheDir();
  const filePath = getCacheFilePath(sector);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Load data from cache
 */
function loadFromCache(sector: string): any | null {
  const filePath = getCacheFilePath(sector);
  if (!isCacheValid(filePath)) return null;
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
}

/**
 * Fetch and parse Trefis homepage for sector
 */
async function fetchTrefisData(sector: string): Promise<any> {
  try {
    const trefisSector = SECTOR_MAPPING[sector as keyof typeof SECTOR_MAPPING];
    if (!trefisSector) {
      throw new Error(`Invalid sector: ${sector}`);
    }

    // Fetch from the correct Trefis topic pages
    const actionableUrl = 'https://www.trefis.com/data/topic/actionable-analyses';
    const featuredUrl = 'https://www.trefis.com/data/topic/featured';
    
    console.log(`🔍 Fetching authentic Trefis data from topic pages for sector: ${sector}`);
    
    console.log('❌ Puppeteer browser automation not available in current environment');
    console.log('🔍 Attempting alternative approach to access Trefis topic pages...');
    
    // Since Puppeteer requires system dependencies not available in this environment,
    // we cannot properly scrape JavaScript-rendered content from Trefis topic pages.
    // According to user requirements: no fallback data allowed - system must fail cleanly.
    
    throw new Error('Browser automation not available for JavaScript-rendered content extraction. Trefis topic pages require headless browser access to retrieve authentic analysis data.');
  } catch (error) {
    console.error('Error fetching authentic Trefis data:', error);
    throw error;
  }
}









/**
 * Get Trefis data for sector and type
 */
export async function getTrefisData(sector: string, type: 'actionable' | 'featured' | 'bestWorst'): Promise<any> {
  // Check cache first
  let data = loadFromCache(sector);
  
  // If no valid cache, fetch fresh data
  if (!data) {
    data = await fetchTrefisData(sector);
  }
  
  return data[type];
}

/**
 * Clear cache for all sectors (used by cron job)
 */
export function clearTrefisCache(): void {
  ensureCacheDir();
  const files = fs.readdirSync(CACHE_DIR);
  files.forEach(file => {
    if (file.startsWith('trefis-') && file.endsWith('.cache.json')) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    }
  });
}