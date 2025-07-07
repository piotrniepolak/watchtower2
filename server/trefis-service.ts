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

    // For demo purposes, we'll create structured mock data that represents
    // what would be extracted from Trefis. In production, this would
    // fetch from https://www.trefis.com/data/home?sector=${trefisSector}
    const mockData = {
      actionable: generateMockActionableAnalyses(sector),
      featured: generateMockFeaturedAnalyses(sector),
      bestWorst: generateMockBestWorst(sector)
    };

    // Cache the data
    saveToCache(sector, mockData);
    
    return mockData;
  } catch (error) {
    console.error('Error fetching Trefis data:', error);
    throw error;
  }
}

/**
 * Generate mock actionable analyses for sector
 */
function generateMockActionableAnalyses(sector: string): TrefisAnalysis[] {
  const analyses: Record<string, TrefisAnalysis[]> = {
    defense: [
      { title: "Lockheed Martin: F-35 Program Impact Analysis", url: "https://www.trefis.com/stock/lmt/analysis/f35-program" },
      { title: "Raytheon Technologies: Defense Spending Outlook", url: "https://www.trefis.com/stock/rtx/analysis/defense-spending" },
      { title: "General Dynamics: Naval Contracts Revenue Forecast", url: "https://www.trefis.com/stock/gd/analysis/naval-contracts" },
      { title: "Northrop Grumman: Space Systems Growth Potential", url: "https://www.trefis.com/stock/noc/analysis/space-systems" },
      { title: "Boeing Defense: Military Aircraft Demand Analysis", url: "https://www.trefis.com/stock/ba/analysis/military-aircraft" }
    ],
    health: [
      { title: "Pfizer: Post-COVID Revenue Diversification Strategy", url: "https://www.trefis.com/stock/pfe/analysis/revenue-diversification" },
      { title: "Johnson & Johnson: Pharmaceutical Pipeline Value", url: "https://www.trefis.com/stock/jnj/analysis/pharma-pipeline" },
      { title: "Moderna: mRNA Platform Expansion Opportunities", url: "https://www.trefis.com/stock/mrna/analysis/mrna-platform" },
      { title: "AbbVie: Humira Patent Cliff Impact Assessment", url: "https://www.trefis.com/stock/abbv/analysis/humira-patent" },
      { title: "Gilead Sciences: Oncology Portfolio Growth", url: "https://www.trefis.com/stock/gild/analysis/oncology-growth" }
    ],
    energy: [
      { title: "ExxonMobil: Carbon Capture Investment Returns", url: "https://www.trefis.com/stock/xom/analysis/carbon-capture" },
      { title: "Chevron: Permian Basin Production Optimization", url: "https://www.trefis.com/stock/cvx/analysis/permian-basin" },
      { title: "NextEra Energy: Renewable Capacity Expansion", url: "https://www.trefis.com/stock/nee/analysis/renewable-expansion" },
      { title: "Kinder Morgan: Pipeline Infrastructure Valuation", url: "https://www.trefis.com/stock/kmi/analysis/pipeline-infrastructure" },
      { title: "Phillips 66: Refining Margin Outlook", url: "https://www.trefis.com/stock/psx/analysis/refining-margins" }
    ]
  };
  
  return analyses[sector] || [];
}

/**
 * Generate mock featured analyses for sector
 */
function generateMockFeaturedAnalyses(sector: string): TrefisAnalysis[] {
  const analyses: Record<string, TrefisAnalysis[]> = {
    defense: [
      { title: "Defense Sector: Geopolitical Tensions Drive Growth", url: "https://www.trefis.com/analysis/defense-geopolitical-growth" },
      { title: "Military AI: The Next Frontier in Defense Technology", url: "https://www.trefis.com/analysis/military-ai-frontier" },
      { title: "NATO Spending: 2% GDP Target Impact on Defense Stocks", url: "https://www.trefis.com/analysis/nato-spending-impact" },
      { title: "Hypersonic Weapons: Market Leaders and Valuations", url: "https://www.trefis.com/analysis/hypersonic-weapons-market" }
    ],
    health: [
      { title: "GLP-1 Drugs: Transforming Diabetes and Obesity Treatment", url: "https://www.trefis.com/analysis/glp1-drugs-transformation" },
      { title: "Biosimilars Impact: Patent Cliff Challenges for Big Pharma", url: "https://www.trefis.com/analysis/biosimilars-patent-cliff" },
      { title: "Gene Therapy: Commercial Breakthrough or Overhyped?", url: "https://www.trefis.com/analysis/gene-therapy-breakthrough" },
      { title: "Healthcare AI: Diagnostic Revolution Investment Themes", url: "https://www.trefis.com/analysis/healthcare-ai-diagnostics" }
    ],
    energy: [
      { title: "Energy Transition: Winners and Losers in Clean Tech", url: "https://www.trefis.com/analysis/energy-transition-winners" },
      { title: "LNG Exports: US Dominance in Global Gas Markets", url: "https://www.trefis.com/analysis/lng-exports-dominance" },
      { title: "Battery Technology: Supply Chain and Investment Outlook", url: "https://www.trefis.com/analysis/battery-technology-outlook" },
      { title: "OPEC+ Strategy: Oil Price Impact on Energy Valuations", url: "https://www.trefis.com/analysis/opec-strategy-valuations" }
    ]
  };
  
  return analyses[sector] || [];
}

/**
 * Generate mock best/worst performers for sector
 */
function generateMockBestWorst(sector: string): TrefisBestWorst {
  const performers: Record<string, TrefisBestWorst> = {
    defense: {
      best: { title: "Lockheed Martin (LMT) - Strong F-35 Orders", url: "https://www.trefis.com/stock/lmt" },
      worst: { title: "Boeing Defense (BA) - Production Challenges", url: "https://www.trefis.com/stock/ba" }
    },
    health: {
      best: { title: "Eli Lilly (LLY) - GLP-1 Drug Success", url: "https://www.trefis.com/stock/lly" },
      worst: { title: "Moderna (MRNA) - Post-Pandemic Decline", url: "https://www.trefis.com/stock/mrna" }
    },
    energy: {
      best: { title: "NextEra Energy (NEE) - Renewable Leadership", url: "https://www.trefis.com/stock/nee" },
      worst: { title: "Halliburton (HAL) - Drilling Activity Slowdown", url: "https://www.trefis.com/stock/hal" }
    }
  };
  
  return performers[sector] || { best: { title: "", url: "" }, worst: { title: "", url: "" } };
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