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

    const trefisUrl = `https://www.trefis.com/data/home?sector=${trefisSector}`;
    
    // Import cheerio dynamically
    const cheerio = await import('cheerio');
    
    // Fetch the Trefis page
    const response = await fetch(trefisUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Trefis data: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // Helper to extract analysis list - updated for actual Trefis structure
    const extractList = (sectionTitle: string) => {
      // Try multiple selector patterns for real Trefis website
      const analyses: Array<{title: string, url: string}> = [];
      
      // Look for any links containing stock analysis patterns
      $('a').each((_, a) => {
        const $a = $(a);
        const href = $a.attr('href');
        const text = $a.text().trim();
        
        // Extract stock analysis links
        if (href && href.includes('/stock/') && text.length > 10) {
          const url = href.startsWith('http') ? href : `https://www.trefis.com${href}`;
          analyses.push({ title: text, url });
        }
      });
      
      return analyses.slice(0, 5); // Limit to 5 per section
    };

    // Extract best/worst performers from actual Trefis structure
    const extractBestWorst = () => {
      const stockLinks: any[] = [];
      
      // Look for stock links with performance indicators
      $('a').each((_, a) => {
        const $a = $(a);
        const href = $a.attr('href');
        const text = $a.text().trim();
        
        if (href && href.includes('/stock/') && text.length > 5) {
          // Look for percentage indicators near the link
          const parent = $a.parent();
          const percentageText = parent.text().match(/[+-]?\d+\.?\d*%/) || [];
          if (percentageText.length === 0) {
            return; // Skip entries without performance data
          }
          const percentage = parseFloat(percentageText[0].replace('%', '').replace('+', ''));
          
          const url = href.startsWith('http') ? href : `https://www.trefis.com${href}`;
          stockLinks.push({
            title: text,
            url,
            value: percentage
          });
        }
      });
      
      if (!stockLinks.length) {
        throw new Error('No stock performance data found on Trefis page');
      }
      
      stockLinks.sort((a, b) => a.value - b.value);
      return {
        best: stockLinks[stockLinks.length - 1],
        worst: stockLinks[0]
      };
    };

    const data = {
      actionable: extractList('Actionable Analyses'),
      featured: extractList('Featured Analyses'),
      bestWorst: extractBestWorst()
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