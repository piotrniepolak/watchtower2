/**
 * Data Sources Counter - Calculates authentic data source counts across the platform
 * Yahoo Finance counts as 1 source, each organization/company counts as 1 additional source
 */

interface DataSource {
  name: string;
  url: string;
  category: 'financial' | 'government' | 'news' | 'research' | 'industry';
}

// Core data sources used across the platform
const CORE_DATA_SOURCES: DataSource[] = [
  // Financial (Yahoo Finance as single source)
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com', category: 'financial' },
  
  // Government & Official Organizations
  { name: 'WHO', url: 'https://www.who.int', category: 'government' },
  { name: 'FDA', url: 'https://www.fda.gov', category: 'government' },
  { name: 'Department of Defense', url: 'https://www.defense.gov', category: 'government' },
  { name: 'NATO', url: 'https://www.nato.int', category: 'government' },
  
  // News & Media Organizations
  { name: 'Defense News', url: 'https://www.defensenews.com', category: 'news' },
  { name: 'Reuters', url: 'https://www.reuters.com', category: 'news' },
  { name: 'Bloomberg', url: 'https://www.bloomberg.com', category: 'news' },
  { name: 'STAT News', url: 'https://www.statnews.com', category: 'news' },
  { name: 'BioPharma Dive', url: 'https://www.biopharmadive.com', category: 'news' },
  { name: 'Fierce Pharma', url: 'https://www.fiercepharma.com', category: 'news' },
  { name: 'Jane\'s Defence Weekly', url: 'https://www.janes.com', category: 'news' },
  { name: 'Breaking Defense', url: 'https://breakingdefense.com', category: 'news' },
  { name: 'Defense One', url: 'https://www.defenseone.com', category: 'news' },
  { name: 'The War Zone', url: 'https://www.thedrive.com/the-war-zone', category: 'news' },
  { name: 'Military.com', url: 'https://www.military.com', category: 'news' },
  { name: 'C4ISRNET', url: 'https://www.c4isrnet.com', category: 'news' },
  
  // Industry Publications
  { name: 'PharmaLive', url: 'https://www.pharmalive.com', category: 'industry' },
  { name: 'Pharmaceutical Technology', url: 'https://www.pharmaceutical-technology.com', category: 'industry' },
  { name: 'Drug Discovery & Development', url: 'https://www.drugdiscoverytrends.com', category: 'industry' },
  { name: 'National Defense Magazine', url: 'https://www.nationaldefensemagazine.org', category: 'industry' },
  { name: 'Defense Daily', url: 'https://www.defensedaily.com', category: 'industry' },
  
  // Research & Academic
  { name: 'Nature Biotechnology', url: 'https://www.nature.com/nbt', category: 'research' },
  { name: 'Science Translational Medicine', url: 'https://www.science.org/journal/stm', category: 'research' },
  { name: 'The Lancet', url: 'https://www.thelancet.com', category: 'research' },
  { name: 'New England Journal of Medicine', url: 'https://www.nejm.org', category: 'research' }
];

/**
 * Get total count of authentic data sources used by the platform
 * Yahoo Finance counts as 1, each organization/company counts as 1 additional
 */
export function getDataSourcesCount(): number {
  return CORE_DATA_SOURCES.length;
}

/**
 * Get data sources by category
 */
export function getDataSourcesByCategory(): Record<string, DataSource[]> {
  const grouped: Record<string, DataSource[]> = {};
  
  for (const source of CORE_DATA_SOURCES) {
    if (!grouped[source.category]) {
      grouped[source.category] = [];
    }
    grouped[source.category].push(source);
  }
  
  return grouped;
}

/**
 * Get all data sources
 */
export function getAllDataSources(): DataSource[] {
  return CORE_DATA_SOURCES;
}

/**
 * Get data sources count by category
 */
export function getDataSourcesCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const source of CORE_DATA_SOURCES) {
    counts[source.category] = (counts[source.category] || 0) + 1;
  }
  
  return counts;
}