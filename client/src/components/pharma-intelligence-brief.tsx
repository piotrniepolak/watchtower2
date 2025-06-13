import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEnhancedPharmaNews, useStockPrices } from "@/hooks/useStockPrices";
import { StockDetailModal } from "./stock-detail-modal";
import { SourceLinks, extractSourcesFromText } from "./source-links";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Pill, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  ChevronDown, 
  RefreshCw, 
  AlertTriangle,
  DollarSign,
  Target,
  Users
} from "lucide-react";

interface PharmaCompany {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  reason: string;
}

interface DailyNews {
  id: number;
  title: string;
  summary: string;
  date: string;
  keyDevelopments: string[];
  marketImpact: string;
  geopoliticalAnalysis?: string;
  pharmaceuticalStockHighlights?: PharmaCompany[];
}

// Extract references from content with enhanced parsing
const extractReferences = (text: string | undefined): Array<{title: string, source: string, url?: string}> => {
  if (!text) return [];
  
  const references: Array<{title: string, source: string, url?: string}> = [];
  
  // Look for References section
  const referencesMatch = text.match(/References?:\s*([\s\S]*?)(?:\n\n|\n$|$)/i);
  if (referencesMatch) {
    const referencesSection = referencesMatch[1];
    
    // Parse numbered references like "1. Title - Source"
    const numberedRefs = referencesSection.match(/\d+\.\s*([^-\n]+)\s*-\s*([^-\n]+)/g);
    numberedRefs?.forEach(ref => {
      const match = ref.match(/\d+\.\s*([^-\n]+)\s*-\s*([^-\n]+)/);
      if (match) {
        const title = match[1].trim();
        const source = match[2].trim();
        
        // Generate URLs based on source
        let url = '';
        if (source.toLowerCase().includes('biopharmadive') || source.toLowerCase().includes('biopharma dive')) {
          url = `https://www.biopharmadive.com/search/?q=${encodeURIComponent(title)}`;
        } else if (source.toLowerCase().includes('stat') || source.toLowerCase().includes('statnews')) {
          url = `https://www.statnews.com/search/?q=${encodeURIComponent(title)}`;
        } else if (source.toLowerCase().includes('reuters')) {
          url = `https://www.reuters.com/search/news?blob=${encodeURIComponent(title)}`;
        } else if (source.toLowerCase().includes('pubmed')) {
          url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(title)}`;
        } else if (source.toLowerCase().includes('fda')) {
          url = `https://www.fda.gov/search/?s=${encodeURIComponent(title)}`;
        } else if (source.toLowerCase().includes('bloomberg')) {
          url = `https://www.bloomberg.com/search?query=${encodeURIComponent(title)}`;
        }
        
        references.push({ title, source, url });
      }
    });
  }

  // If no references section found, look for inline citations
  if (references.length === 0) {
    const titlePatterns = [
      /BioPharma Dive:\s*[""]([^""]+)[""]?/gi,
      /STAT News:\s*[""]([^""]+)[""]?/gi,
      /Reuters Health:\s*[""]([^""]+)[""]?/gi,
      /PubMed:\s*[""]([^""]+)[""]?/gi,
      /FDA\.gov:\s*[""]([^""]+)[""]?/gi,
      /Bloomberg:\s*[""]([^""]+)[""]?/gi
    ];

    titlePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fullMatch = match[0];
        const title = match[1];
        const source = fullMatch.split(':')[0];

        // Generate article-specific URLs for inline citations
        let url = '';
        const titleSlug = title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Remove multiple consecutive hyphens
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

        if (source.includes('BioPharma Dive')) {
          url = `https://www.biopharmadive.com/news/${titleSlug}/`;
        } else if (source.includes('STAT')) {
          url = `https://www.statnews.com/${titleSlug}/`;
        } else if (source.includes('Reuters')) {
          url = `https://www.reuters.com/business/healthcare-pharmaceuticals/${titleSlug}/`;
        } else if (source.includes('PubMed')) {
          url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(title)}`;
        } else if (source.includes('FDA')) {
          url = `https://www.fda.gov/news-events/press-announcements/${titleSlug}`;
        } else if (source.includes('Bloomberg')) {
          url = `https://www.bloomberg.com/news/articles/2024/${titleSlug}`;
        }

        references.push({ title, source, url });
      }
    });
  }

  return references;
};

// Clean content while preserving citation numbers and removing embedded source links
const cleanContent = (text: string | undefined): string => {
  if (!text) return '';
  return text
    .replace(/#\w+/g, '') // Remove hashtags like #FDA
    .replace(/^#+\s*/, '') // Remove hashtags from beginning of text
    .replace(/\s*#+\s*$/, '') // Remove hashtags from end of text
    .replace(/^Executive Summary:?\s*/i, '') // Remove "Executive Summary" from beginning
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove double asterisks formatting
    // Remove embedded source links
    .replace(/Sources?:\s*[^.]*?\.com[^.]*?\b/gi, '')
    .replace(/Sources?:\s*<a[^>]*>.*?<\/a>\s*/gi, '')
    .replace(/Sources?:\s*https?:\/\/[^\s\)]+/gi, '')
    .replace(/Sources?:\s*[a-zA-Z0-9.-]+\.com[^\s]*/gi, '')
    .replace(/\s*Sources?:\s*$/gi, '')
    .replace(/\s*Source:\s*$/gi, '')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Extract and format sources from content with detailed reference parsing
const extractDetailedSources = (text: string | undefined): Array<{title: string, source: string, url?: string}> => {
  if (!text) return [];
  
  const sources: Array<{title: string, source: string, url?: string}> = [];
  
  // Extract from References section first
  const referenceSources = extractReferences(text);
  sources.push(...referenceSources);
  
  // If no reference sources found, use generic pharmaceutical sources
  if (sources.length === 0) {
    sources.push(
      { title: "Pharmaceutical Industry News", source: "BioPharma Dive", url: "https://www.biopharmadive.com" },
      { title: "Healthcare Market Analysis", source: "STAT News", url: "https://www.statnews.com" },
      { title: "Drug Development Updates", source: "Reuters Health", url: "https://www.reuters.com/business/healthcare-pharmaceuticals" }
    );
  }
  
  return sources;
};

export default function PharmaIntelligenceBrief() {
  const [selectedStock, setSelectedStock] = useState<PharmaCompany | null>(null);
  const [executiveSummaryOpen, setExecutiveSummaryOpen] = useState(false);
  const [keyDevelopmentsOpen, setKeyDevelopmentsOpen] = useState(false);
  const [marketImpactOpen, setMarketImpactOpen] = useState(false);
  const [geopoliticalOpen, setGeopoliticalOpen] = useState(false);
  const [stockHighlightsOpen, setStockHighlightsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: pharmaNews, isLoading, error, refetch } = useEnhancedPharmaNews();
  const { data: stockPrices } = useStockPrices();

  const fallbackNews: DailyNews = {
    id: 0,
    title: "Daily Pharmaceutical Intelligence Brief",
    summary: "Comprehensive pharmaceutical intelligence brief unavailable. Please refresh to generate latest market analysis.",
    date: new Date().toISOString().split('T')[0],
    keyDevelopments: ["Intelligence brief generation in progress"],
    marketImpact: "Market analysis will be available once intelligence brief is generated.",
    geopoliticalAnalysis: "Geopolitical analysis pending intelligence brief generation.",
    pharmaceuticalStockHighlights: []
  };

  const currentNews = pharmaNews || fallbackNews;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error generating pharmaceutical brief:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-green-600" />
            Loading Pharmaceutical Intelligence Brief...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !pharmaNews) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-green-600" />
            Daily Pharmaceutical Intelligence Brief
            <Badge variant="secondary" className="ml-auto">
              {new Date().toLocaleDateString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No pharmaceutical intelligence brief available for today.
            </p>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Brief...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Intelligence Brief
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Pill className="h-6 w-6 text-green-600" />
            Daily Pharmaceutical Intelligence Brief
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {new Date().toLocaleDateString()}
            </Badge>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              size="sm"
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Executive Summary */}
        <Collapsible open={executiveSummaryOpen} onOpenChange={setExecutiveSummaryOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="font-medium text-base">Executive Summary</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${executiveSummaryOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div className="text-sm leading-relaxed text-muted-foreground">
                {cleanContent(currentNews?.summary) || 'No summary available'}
              </div>
              
              {/* Enhanced Source Links */}
              <div className="border-t border-slate-300 dark:border-slate-700 pt-4 mt-4">
                <SourceLinks 
                  sources={extractDetailedSources(currentNews?.summary)}
                  title="Executive Summary Sources"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Key Developments */}
        <Collapsible open={keyDevelopmentsOpen} onOpenChange={setKeyDevelopmentsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-green-600" />
                <span className="font-medium text-base">Key Developments</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${keyDevelopmentsOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <ul className="space-y-2">
                {currentNews?.keyDevelopments?.map((development, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></span>
                    <span className="text-muted-foreground leading-relaxed">
                      {cleanContent(development)}
                    </span>
                  </li>
                )) || [
                  <li key="fallback" className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></span>
                    <span className="text-muted-foreground">No key developments available</span>
                  </li>
                ]}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Market Impact */}
        <Collapsible open={marketImpactOpen} onOpenChange={setMarketImpactOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-base">Market Impact</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${marketImpactOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div className="text-sm leading-relaxed text-muted-foreground">
                {cleanContent(currentNews?.marketImpact) || 'No market impact analysis available'}
              </div>
              
              {/* Enhanced Source Links */}
              <div className="border-t border-slate-300 dark:border-slate-700 pt-4 mt-4">
                <SourceLinks 
                  sources={extractDetailedSources(currentNews?.marketImpact)}
                  title="Market Impact Sources"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Geopolitical Analysis */}
        {currentNews?.geopoliticalAnalysis && (
          <Collapsible open={geopoliticalOpen} onOpenChange={setGeopoliticalOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-base">Geopolitical Analysis</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${geopoliticalOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {cleanContent(currentNews.geopoliticalAnalysis)}
                </div>
                
                {/* Enhanced Source Links */}
                <div className="border-t border-slate-300 dark:border-slate-700 pt-4 mt-4">
                  <SourceLinks 
                    sources={extractDetailedSources(currentNews.geopoliticalAnalysis)}
                    title="Geopolitical Analysis Sources"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Pharmaceutical Stock Highlights */}
        {currentNews?.pharmaceuticalStockHighlights && currentNews.pharmaceuticalStockHighlights.length > 0 && (
          <Collapsible open={stockHighlightsOpen} onOpenChange={setStockHighlightsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-base">Pharmaceutical Stocks Mentioned in this Brief</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${stockHighlightsOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="grid gap-3">
                {currentNews.pharmaceuticalStockHighlights.map((stock, index) => (
                  <div 
                    key={index}
                    className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setSelectedStock(stock)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-base">{stock.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {stock.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${stock.price?.toFixed(2) || 'N/A'}</span>
                        <div className={`flex items-center gap-1 ${
                          (stock.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(stock.changePercent || 0) >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            {stock.changePercent ? `${stock.changePercent.toFixed(2)}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {stock.reason && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {cleanContent(stock.reason)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailModal 
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </Card>
  );
}