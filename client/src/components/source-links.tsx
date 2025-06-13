
import { ExternalLink, Globe, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SourceLink {
  title: string;
  url: string;
  source?: string;
  category?: 'news' | 'government' | 'research' | 'intelligence' | 'financial';
}

interface SourceLinksProps {
  sources: SourceLink[];
  title?: string;
  compact?: boolean;
}

// Enhanced domain mapping with categories
const domainCategories: Record<string, { category: 'news' | 'government' | 'research' | 'intelligence' | 'financial', displayName: string }> = {
  'defensenews.com': { category: 'news', displayName: 'Defense News' },
  'reuters.com': { category: 'news', displayName: 'Reuters' },
  'bloomberg.com': { category: 'financial', displayName: 'Bloomberg' },
  'breakingdefense.com': { category: 'news', displayName: 'Breaking Defense' },
  'defense.gov': { category: 'government', displayName: 'U.S. Department of Defense' },
  'nato.int': { category: 'government', displayName: 'NATO' },
  'fda.gov': { category: 'government', displayName: 'FDA' },
  'biopharmadive.com': { category: 'news', displayName: 'BioPharma Dive' },
  'statnews.com': { category: 'news', displayName: 'STAT News' },
  'fiercepharma.com': { category: 'news', displayName: 'Fierce Pharma' },
  'who.int': { category: 'government', displayName: 'World Health Organization' },
  'finance.yahoo.com': { category: 'financial', displayName: 'Yahoo Finance' },
  'sec.gov': { category: 'government', displayName: 'SEC' },
  'energy.gov': { category: 'government', displayName: 'Department of Energy' },
  'eia.gov': { category: 'government', displayName: 'Energy Information Administration' },
  'cnbc.com': { category: 'financial', displayName: 'CNBC' },
  'wsj.com': { category: 'financial', displayName: 'Wall Street Journal' },
  'ft.com': { category: 'financial', displayName: 'Financial Times' }
};

// Extract domain from URL for cleaner display
const getDomainFromUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'External Source';
  }
};

// Generate favicon URL for visual enhancement
const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  } catch {
    return '';
  }
};

// Get category icon
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'government': return <FileText className="w-3 h-3" />;
    case 'research': return <BookOpen className="w-3 h-3" />;
    case 'financial': return <ExternalLink className="w-3 h-3" />;
    case 'intelligence': return <Globe className="w-3 h-3" />;
    default: return <ExternalLink className="w-3 h-3" />;
  }
};

// Get category color
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'government': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'research': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'financial': return 'bg-green-100 text-green-800 border-green-200';
    case 'intelligence': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function SourceLinks({ sources, title = "Sources & References", compact = false }: SourceLinksProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  // Enhanced sources with categorization
  const enhancedSources = sources.map(source => {
    const domain = getDomainFromUrl(source.url);
    const domainInfo = domainCategories[domain];
    
    return {
      ...source,
      domain,
      category: source.category || domainInfo?.category || 'news',
      displayName: source.source || domainInfo?.displayName || domain
    };
  });

  // Group sources by category
  const groupedSources = enhancedSources.reduce((acc, source) => {
    const category = source.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(source);
    return acc;
  }, {} as Record<string, typeof enhancedSources>);

  if (compact) {
    return (
      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">{title}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {enhancedSources.slice(0, 6).map((source, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
            >
              <img 
                src={getFaviconUrl(source.url)} 
                alt="" 
                className="w-3 h-3 mr-1"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
              {source.displayName}
              <ExternalLink className="w-2 h-2 ml-1" />
            </Button>
          ))}
          {enhancedSources.length > 6 && (
            <Badge variant="secondary" className="text-xs">
              +{enhancedSources.length - 6} more
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-slate-200 bg-slate-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
          <Globe className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {Object.entries(groupedSources).map(([category, categorySources]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(category)}
              <span className="text-xs font-medium text-slate-600 capitalize">
                {category === 'news' ? 'News & Media' : 
                 category === 'government' ? 'Government & Official' :
                 category === 'financial' ? 'Financial & Markets' :
                 category === 'research' ? 'Research & Academic' :
                 'Intelligence Sources'}
              </span>
            </div>
            <div className="grid gap-1">
              {categorySources.map((source, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-auto p-2 justify-start hover:bg-white border border-slate-200 hover:border-slate-300 transition-all"
                  onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
                >
                  <div className="flex items-center gap-3 w-full text-left">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img 
                        src={getFaviconUrl(source.url)} 
                        alt="" 
                        className="w-4 h-4 flex-shrink-0"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-900 text-xs truncate">
                          {source.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {source.displayName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-1 py-0 ${getCategoryColor(source.category)}`}
                      >
                        {source.category}
                      </Badge>
                      <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Enhanced utility function to extract sources from various text formats
export function extractSourcesFromText(text: string): SourceLink[] {
  const sources: SourceLink[] = [];
  
  // Pattern 1: URLs with surrounding context
  const urlPattern = /https?:\/\/[^\s\)]+/g;
  const urls = text.match(urlPattern);
  if (urls) {
    urls.forEach(url => {
      const domain = getDomainFromUrl(url);
      const domainInfo = domainCategories[domain];
      
      sources.push({
        title: domainInfo?.displayName || domain,
        url: url.trim(),
        source: domainInfo?.displayName || domain,
        category: domainInfo?.category || 'news'
      });
    });
  }
  
  // Pattern 2: Markdown links [Title](URL)
  const markdownLinks = text.match(/\[([^\]]+)\]\(([^)]+)\)/g);
  if (markdownLinks) {
    markdownLinks.forEach(link => {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        const domain = getDomainFromUrl(match[2]);
        const domainInfo = domainCategories[domain];
        
        sources.push({
          title: match[1].trim(),
          url: match[2].trim(),
          source: domainInfo?.displayName || domain,
          category: domainInfo?.category || 'news'
        });
      }
    });
  }
  
  // Pattern 3: Citations format
  const citationPattern = /Source:\s*([^,\n]+)/gi;
  let citationMatch;
  while ((citationMatch = citationPattern.exec(text)) !== null) {
    const sourceName = citationMatch[1].trim();
    let url = '';
    
    // Generate URLs based on source name
    if (sourceName.includes('Defense News')) {
      url = 'https://www.defensenews.com';
    } else if (sourceName.includes('Reuters')) {
      url = 'https://www.reuters.com/business/aerospace-defense';
    } else if (sourceName.includes('Bloomberg')) {
      url = 'https://www.bloomberg.com';
    } else if (sourceName.includes('Pentagon') || sourceName.includes('DoD')) {
      url = 'https://www.defense.gov/News/Releases/';
    } else if (sourceName.includes('NATO')) {
      url = 'https://www.nato.int/cps/en/natohq/news.htm';
    } else if (sourceName.includes('FDA')) {
      url = 'https://www.fda.gov/news-events/press-announcements';
    } else if (sourceName.includes('WHO')) {
      url = 'https://www.who.int/news';
    }
    
    if (url) {
      const domain = getDomainFromUrl(url);
      const domainInfo = domainCategories[domain];
      
      sources.push({
        title: sourceName,
        url,
        source: sourceName,
        category: domainInfo?.category || 'government'
      });
    }
  }
  
  // Remove duplicates based on URL
  const uniqueSources = sources.filter((source, index, self) => 
    index === self.findIndex(s => s.url === source.url)
  );
  
  return uniqueSources;
}

// Generate comprehensive source links for different sectors
export function generateSectorSources(sector: 'defense' | 'pharma' | 'energy'): SourceLink[] {
  const baseSources = {
    defense: [
      { title: "Defense News - Latest Defense Industry Coverage", url: "https://www.defensenews.com", source: "Defense News", category: 'news' as const },
      { title: "Reuters Defense & Aerospace Coverage", url: "https://www.reuters.com/business/aerospace-defense", source: "Reuters", category: 'news' as const },
      { title: "Bloomberg Defense Industry Articles", url: "https://www.bloomberg.com/news/articles/defense", source: "Bloomberg", category: 'financial' as const },
      { title: "Breaking Defense - Defense Technology News", url: "https://breakingdefense.com", source: "Breaking Defense", category: 'news' as const },
      { title: "Pentagon Press Releases", url: "https://www.defense.gov/News/Releases/", source: "U.S. Department of Defense", category: 'government' as const },
      { title: "NATO News and Updates", url: "https://www.nato.int/cps/en/natohq/news.htm", source: "NATO", category: 'government' as const }
    ],
    pharma: [
      { title: "BioPharma Dive - Industry News", url: "https://www.biopharmadive.com", source: "BioPharma Dive", category: 'news' as const },
      { title: "STAT News - Health and Medicine", url: "https://www.statnews.com", source: "STAT News", category: 'news' as const },
      { title: "Fierce Pharma - Pharmaceutical News", url: "https://www.fiercepharma.com", source: "Fierce Pharma", category: 'news' as const },
      { title: "FDA News and Press Announcements", url: "https://www.fda.gov/news-events/press-announcements", source: "FDA", category: 'government' as const },
      { title: "WHO Health News", url: "https://www.who.int/news", source: "World Health Organization", category: 'government' as const },
      { title: "Reuters Healthcare Coverage", url: "https://www.reuters.com/business/healthcare-pharmaceuticals", source: "Reuters", category: 'news' as const }
    ],
    energy: [
      { title: "Energy Information Administration", url: "https://www.eia.gov", source: "EIA", category: 'government' as const },
      { title: "Department of Energy News", url: "https://www.energy.gov/news", source: "Department of Energy", category: 'government' as const },
      { title: "Reuters Energy Coverage", url: "https://www.reuters.com/business/energy", source: "Reuters", category: 'news' as const },
      { title: "Bloomberg Energy News", url: "https://www.bloomberg.com/energy", source: "Bloomberg", category: 'financial' as const },
      { title: "Oil & Gas Journal", url: "https://www.ogj.com", source: "Oil & Gas Journal", category: 'news' as const },
      { title: "Energy Intelligence", url: "https://www.energyintel.com", source: "Energy Intelligence", category: 'intelligence' as const }
    ]
  };
  
  return baseSources[sector] || [];
}
