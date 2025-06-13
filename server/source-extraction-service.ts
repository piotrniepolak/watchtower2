
interface SourceLink {
  title: string;
  url: string;
  source: string;
  category: 'news' | 'government' | 'research' | 'intelligence' | 'financial';
}

interface SourceDatabase {
  [domain: string]: {
    displayName: string;
    category: 'news' | 'government' | 'research' | 'intelligence' | 'financial';
    baseUrl: string;
  };
}

export class SourceExtractionService {
  private static sourceDatabase: SourceDatabase = {
    // Defense Sources
    'defensenews.com': { displayName: 'Defense News', category: 'news', baseUrl: 'https://www.defensenews.com' },
    'breakingdefense.com': { displayName: 'Breaking Defense', category: 'news', baseUrl: 'https://breakingdefense.com' },
    'defense.gov': { displayName: 'U.S. Department of Defense', category: 'government', baseUrl: 'https://www.defense.gov' },
    'nato.int': { displayName: 'NATO', category: 'government', baseUrl: 'https://www.nato.int' },
    
    // Pharmaceutical Sources
    'biopharmadive.com': { displayName: 'BioPharma Dive', category: 'news', baseUrl: 'https://www.biopharmadive.com' },
    'statnews.com': { displayName: 'STAT News', category: 'news', baseUrl: 'https://www.statnews.com' },
    'fiercepharma.com': { displayName: 'Fierce Pharma', category: 'news', baseUrl: 'https://www.fiercepharma.com' },
    'fda.gov': { displayName: 'FDA', category: 'government', baseUrl: 'https://www.fda.gov' },
    'who.int': { displayName: 'World Health Organization', category: 'government', baseUrl: 'https://www.who.int' },
    'clinicaltrials.gov': { displayName: 'ClinicalTrials.gov', category: 'government', baseUrl: 'https://clinicaltrials.gov' },
    
    // Energy Sources
    'eia.gov': { displayName: 'Energy Information Administration', category: 'government', baseUrl: 'https://www.eia.gov' },
    'energy.gov': { displayName: 'Department of Energy', category: 'government', baseUrl: 'https://www.energy.gov' },
    'ogj.com': { displayName: 'Oil & Gas Journal', category: 'news', baseUrl: 'https://www.ogj.com' },
    
    // Financial & General News Sources
    'reuters.com': { displayName: 'Reuters', category: 'news', baseUrl: 'https://www.reuters.com' },
    'bloomberg.com': { displayName: 'Bloomberg', category: 'financial', baseUrl: 'https://www.bloomberg.com' },
    'cnbc.com': { displayName: 'CNBC', category: 'financial', baseUrl: 'https://www.cnbc.com' },
    'wsj.com': { displayName: 'Wall Street Journal', category: 'financial', baseUrl: 'https://www.wsj.com' },
    'ft.com': { displayName: 'Financial Times', category: 'financial', baseUrl: 'https://www.ft.com' },
    'finance.yahoo.com': { displayName: 'Yahoo Finance', category: 'financial', baseUrl: 'https://finance.yahoo.com' },
    'sec.gov': { displayName: 'SEC', category: 'government', baseUrl: 'https://www.sec.gov' }
  };

  /**
   * Extract and format source links from intelligence brief content
   */
  static extractSourcesFromContent(content: string, sector?: 'defense' | 'pharma' | 'energy'): SourceLink[] {
    const sources: SourceLink[] = [];
    const seenUrls = new Set<string>();

    // Pattern 1: Extract URLs directly from content
    const urlPattern = /https?:\/\/[^\s\)]+/g;
    const urls = content.match(urlPattern);
    
    if (urls) {
      urls.forEach(url => {
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          const sourceInfo = this.getSourceInfo(url);
          sources.push({
            title: sourceInfo.title,
            url: url.trim(),
            source: sourceInfo.source,
            category: sourceInfo.category
          });
        }
      });
    }

    // Pattern 2: Extract from citation patterns
    const citationPatterns = [
      /Source:\s*([^,\n]+)/gi,
      /\[([^\]]+)\]\(([^)]+)\)/g,
      /According to ([^,\n]+)/gi,
      /Reports from ([^,\n]+)/gi
    ];

    citationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match.length >= 2) {
          const sourceName = match[1].trim();
          const url = match[2] || this.generateUrlFromSourceName(sourceName);
          
          if (url && !seenUrls.has(url)) {
            seenUrls.add(url);
            const sourceInfo = this.getSourceInfo(url);
            sources.push({
              title: sourceName,
              url,
              source: sourceInfo.source,
              category: sourceInfo.category
            });
          }
        }
      }
    });

    // Add default sector sources if none found
    if (sources.length === 0 && sector) {
      return this.getDefaultSectorSources(sector);
    }

    return sources;
  }

  /**
   * Get source information from URL
   */
  private static getSourceInfo(url: string): { title: string; source: string; category: 'news' | 'government' | 'research' | 'intelligence' | 'financial' } {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      const sourceInfo = this.sourceDatabase[domain];
      
      if (sourceInfo) {
        return {
          title: sourceInfo.displayName,
          source: sourceInfo.displayName,
          category: sourceInfo.category
        };
      }
    } catch (error) {
      // Invalid URL
    }

    return {
      title: 'External Source',
      source: 'External Source',
      category: 'news'
    };
  }

  /**
   * Generate URL from source name
   */
  private static generateUrlFromSourceName(sourceName: string): string {
    const lowerSource = sourceName.toLowerCase();
    
    // Defense sources
    if (lowerSource.includes('defense news')) return 'https://www.defensenews.com';
    if (lowerSource.includes('pentagon') || lowerSource.includes('dod')) return 'https://www.defense.gov/News/Releases/';
    if (lowerSource.includes('nato')) return 'https://www.nato.int/cps/en/natohq/news.htm';
    if (lowerSource.includes('breaking defense')) return 'https://breakingdefense.com';
    
    // Pharmaceutical sources
    if (lowerSource.includes('fda')) return 'https://www.fda.gov/news-events/press-announcements';
    if (lowerSource.includes('who')) return 'https://www.who.int/news';
    if (lowerSource.includes('stat news')) return 'https://www.statnews.com';
    if (lowerSource.includes('biopharma dive')) return 'https://www.biopharmadive.com';
    if (lowerSource.includes('fierce pharma')) return 'https://www.fiercepharma.com';
    
    // Energy sources
    if (lowerSource.includes('eia')) return 'https://www.eia.gov';
    if (lowerSource.includes('department of energy')) return 'https://www.energy.gov/news';
    
    // Financial sources
    if (lowerSource.includes('reuters')) return 'https://www.reuters.com';
    if (lowerSource.includes('bloomberg')) return 'https://www.bloomberg.com';
    if (lowerSource.includes('cnbc')) return 'https://www.cnbc.com';
    if (lowerSource.includes('yahoo finance')) return 'https://finance.yahoo.com';
    
    return '';
  }

  /**
   * Get default sources for a sector
   */
  private static getDefaultSectorSources(sector: 'defense' | 'pharma' | 'energy'): SourceLink[] {
    const sectorSources = {
      defense: [
        { title: 'Defense News', url: 'https://www.defensenews.com', source: 'Defense News', category: 'news' as const },
        { title: 'Pentagon Press Releases', url: 'https://www.defense.gov/News/Releases/', source: 'U.S. Department of Defense', category: 'government' as const },
        { title: 'Reuters Defense Coverage', url: 'https://www.reuters.com/business/aerospace-defense', source: 'Reuters', category: 'news' as const },
        { title: 'Breaking Defense', url: 'https://breakingdefense.com', source: 'Breaking Defense', category: 'news' as const }
      ],
      pharma: [
        { title: 'BioPharma Dive', url: 'https://www.biopharmadive.com', source: 'BioPharma Dive', category: 'news' as const },
        { title: 'FDA Press Announcements', url: 'https://www.fda.gov/news-events/press-announcements', source: 'FDA', category: 'government' as const },
        { title: 'STAT News', url: 'https://www.statnews.com', source: 'STAT News', category: 'news' as const },
        { title: 'WHO Health News', url: 'https://www.who.int/news', source: 'World Health Organization', category: 'government' as const }
      ],
      energy: [
        { title: 'Energy Information Administration', url: 'https://www.eia.gov', source: 'EIA', category: 'government' as const },
        { title: 'Department of Energy News', url: 'https://www.energy.gov/news', source: 'Department of Energy', category: 'government' as const },
        { title: 'Reuters Energy Coverage', url: 'https://www.reuters.com/business/energy', source: 'Reuters', category: 'news' as const },
        { title: 'Bloomberg Energy', url: 'https://www.bloomberg.com/energy', source: 'Bloomberg', category: 'financial' as const }
      ]
    };

    return sectorSources[sector] || [];
  }

  /**
   * Format sources for frontend consumption
   */
  static formatSourcesForFrontend(sources: SourceLink[]): any[] {
    return sources.map(source => ({
      title: source.title,
      url: source.url,
      source: source.source,
      category: source.category
    }));
  }
}
