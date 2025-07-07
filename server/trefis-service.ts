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
    
    // Import cheerio dynamically
    const cheerio = await import('cheerio');
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    // Fetch both actionable and featured analyses pages
    const [actionableResponse, featuredResponse] = await Promise.all([
      fetch(actionableUrl, { headers }),
      fetch(featuredUrl, { headers })
    ]);
    
    if (!actionableResponse.ok || !featuredResponse.ok) {
      throw new Error(`Failed to fetch Trefis data. Actionable: ${actionableResponse.status}, Featured: ${featuredResponse.status}`);
    }
    
    const actionableHtml = await actionableResponse.text();
    const featuredHtml = await featuredResponse.text();
    
    const $actionable = cheerio.load(actionableHtml);
    const $featured = cheerio.load(featuredHtml);

    // Helper to extract analysis items from specific Trefis topic pages
    const extractSectorAnalyses = ($: any, sector: string) => {
      const analyses: Array<{title: string, url: string}> = [];
      let totalLinks = 0;
      let companyLinks = 0;
      let noLoginLinks = 0;
      let validAnalyses = 0;
      
      // Look for analysis items with sector tags or company links
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
              analyses.push({ title: text, url });
            }
          }
        }
      });
      
      console.log(`🔍 Trefis extraction debug: ${totalLinks} total links, ${companyLinks} company links, ${noLoginLinks} no-login links, ${validAnalyses} valid analyses`);
      if (analyses.length > 0) {
        console.log(`📊 Sample analysis: "${analyses[0].title.substring(0, 80)}..."`);
      }
      
      return analyses.slice(0, 6); // Limit to 6 per section
    };

    // Helper to check if analysis is relevant to the requested sector
    const checkSectorRelevance = (title: string, sector: string): boolean => {
      const titleLower = title.toLowerCase();
      
      if (sector === 'health') {
        return titleLower.includes('jnj') || titleLower.includes('johnson') || 
               titleLower.includes('pfizer') || titleLower.includes('mrk') || 
               titleLower.includes('pharma') || titleLower.includes('healthcare') ||
               titleLower.includes('drug') || titleLower.includes('medical') ||
               titleLower.includes('biotech') || titleLower.includes('amrx') ||
               titleLower.includes('bhc') || titleLower.includes('merck') ||
               titleLower.includes('abbv') || titleLower.includes('abbvie') ||
               titleLower.includes('biogen') || titleLower.includes('gilead') ||
               titleLower.includes('roche') || titleLower.includes('novartis') ||
               titleLower.includes('sanofi') || titleLower.includes('gsk') ||
               titleLower.includes('lilly') || titleLower.includes('eli') ||
               titleLower.includes('bristol') || titleLower.includes('bmy');
      } else if (sector === 'defense') {
        return titleLower.includes('lockheed') || titleLower.includes('boeing') || 
               titleLower.includes('raytheon') || titleLower.includes('defense') ||
               titleLower.includes('aerospace') || titleLower.includes('military') ||
               titleLower.includes('weapons') || titleLower.includes('contractor');
      } else if (sector === 'energy') {
        return titleLower.includes('exxon') || titleLower.includes('chevron') || 
               titleLower.includes('energy') || titleLower.includes('oil') ||
               titleLower.includes('gas') || titleLower.includes('renewable') ||
               titleLower.includes('utilities') || titleLower.includes('petroleum');
      }
      return true; // Include all if no specific filtering
    };

    // Extract best/worst performers from both actionable and featured pages
    const extractBestWorst = ($actionable: any, $featured: any, sector: string) => {
      const stockLinks: any[] = [];
      
      // Combine analyses from both pages
      const allAnalyses = [
        ...extractSectorAnalyses($actionable, sector),
        ...extractSectorAnalyses($featured, sector)
      ];
      
      // Since we don't have actual performance data from Trefis topic pages,
      // we'll use the first and last analyses as best/worst for display
      if (allAnalyses.length === 0) {
        return { best: null, worst: null };
      }
      
      // Return first and last as best/worst since we don't have performance data
      // This will be replaced with actual stock performance lookup in production
      return {
        best: allAnalyses[0] || null,
        worst: allAnalyses[allAnalyses.length - 1] || null
      };
    };

    const data = {
      actionable: extractSectorAnalyses($actionable, sector),
      featured: extractSectorAnalyses($featured, sector),
      bestWorst: extractBestWorst($actionable, $featured, sector)
    };

    // If no data was extracted, fall back to error
    if (!data.actionable.length && !data.featured.length) {
      throw new Error('No authentic Trefis data could be extracted');
    }

    // Cache the authentic data
    saveToCache(sector, data);
    
    return data;
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