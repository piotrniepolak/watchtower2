import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Globe, 
  TrendingUp, 
  AlertTriangle, 
  Building2, 
  ChevronDown, 
  ChevronUp,
  Newspaper,
  Target,
  DollarSign,
  Pill,
  Activity,
  Shield
} from "lucide-react";
import type { DailyNews, NewsConflictUpdate, NewsStockHighlight } from "@shared/schema";

// Content formatting utility with enhanced source extraction
const cleanContent = (text: string | undefined): string => {
  if (!text) return '';
  return text
    .replace(/\[\d+\]/g, '') // Remove bracketed numbers like [1], [2]
    .replace(/#\w+/g, '') // Remove hashtags like #FDA
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove double asterisks formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Extract and format sources from content with detailed reference parsing
const extractDetailedSources = (text: string | undefined): Array<{title: string, source: string, url?: string}> => {
  if (!text) return [];
  
  const sources: Array<{title: string, source: string, url?: string}> = [];
  
  // Look for "References:" section first
  const referencesMatch = text.match(/References:\s*([\s\S]*?)(?:\n\n|\n$|$)/i);
  if (referencesMatch) {
    const referencesText = referencesMatch[1];
    
    // Extract individual reference lines
    const referenceLines = referencesText.split('\n').filter(line => line.trim().startsWith('-'));
    
    referenceLines.forEach(line => {
      // Match pattern: - Source: "Title" (handle various quote styles, including apostrophes)
      const match = line.match(/^-\s*([^:]+):\s*[""]([^""]+)[""]?/);
      if (match) {
        const source = match[1].trim();
        const title = match[2].trim();
        
        let url = '';
        if (source.includes('BioPharma Dive')) {
          url = 'https://www.biopharmadive.com';
        } else if (source.includes('STAT News')) {
          url = 'https://www.statnews.com';
        } else if (source.includes('Reuters')) {
          url = 'https://www.reuters.com/business/healthcare-pharmaceuticals';
        } else if (source.includes('PubMed')) {
          url = 'https://pubmed.ncbi.nlm.nih.gov';
        } else if (source.includes('FDA')) {
          url = 'https://www.fda.gov/news-events';
        } else if (source.includes('Bloomberg')) {
          url = 'https://www.bloomberg.com/news/industries/health-care';
        }
        
        sources.push({ title, source, url });
      }
    });
  }
  
  // If no references section found, look for inline citations
  if (sources.length === 0) {
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
        
        let url = '';
        if (source.includes('BioPharma Dive')) {
          url = 'https://www.biopharmadive.com';
        } else if (source.includes('STAT News')) {
          url = 'https://www.statnews.com';
        } else if (source.includes('Reuters')) {
          url = 'https://www.reuters.com/business/healthcare-pharmaceuticals';
        } else if (source.includes('PubMed')) {
          url = 'https://pubmed.ncbi.nlm.nih.gov';
        } else if (source.includes('FDA')) {
          url = 'https://www.fda.gov/news-events';
        } else if (source.includes('Bloomberg')) {
          url = 'https://www.bloomberg.com/news/industries/health-care';
        }
        
        sources.push({ title, source, url });
      }
    });
  }
  
  return sources;
};

// Enhanced content display with clickable references
const formatContentWithSources = (text: string | undefined): JSX.Element => {
  if (!text) {
    return <p className="text-slate-500 italic">Loading pharmaceutical intelligence...</p>;
  }
  
  // Remove the References section from the main content
  const contentWithoutRefs = text.replace(/References:\s*([\s\S]*?)(?:\n\n|\n$|$)/i, '').trim();
  const cleaned = cleanContent(contentWithoutRefs);
  const detailedSources = extractDetailedSources(text);
  
  return (
    <div className="space-y-4">
      <div className="leading-relaxed text-sm">
        {cleaned.split('\n\n').filter(p => p.trim()).map((paragraph: string, index: number) => (
          <p key={index} className="mb-3 last:mb-0">{paragraph.trim()}</p>
        ))}
      </div>
      
      {detailedSources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <h5 className="text-sm font-semibold text-slate-700 mb-2">References:</h5>
          <div className="space-y-1">
            {detailedSources.map((ref, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <span className="text-slate-400 mt-0.5">•</span>
                <div className="flex-1">
                  <span className="font-medium text-slate-700">{ref.source}:</span>
                  {ref.url ? (
                    <a 
                      href={ref.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      "{ref.title}"
                    </a>
                  ) : (
                    <span className="ml-1 text-slate-600">"{ref.title}"</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function PharmaIntelligenceBrief() {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: news, isLoading, error } = useQuery<DailyNews>({
    queryKey: ["/api/news/pharma/today"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Pharma Intelligence Brief</CardTitle>
          </div>
          <CardDescription>Loading today's pharmaceutical & healthcare intelligence...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded"></div>
              <div className="h-3 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use fallback data if API fails or no data available
  const fallbackNews: DailyNews = {
    id: 1,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date(),
    title: "Pharmaceutical Market Intelligence Brief",
    summary: "Today's pharmaceutical markets show mixed signals as investors monitor ongoing clinical trials and regulatory developments. Key healthcare stocks demonstrate resilience amid evolving treatment landscapes.",
    keyDevelopments: [
      "FDA continues review of multiple drug applications with decisions expected this quarter",
      "Pharmaceutical companies report strong R&D pipeline progress in oncology and rare diseases",
      "Global health organizations coordinate response to emerging infectious disease threats",
      "Healthcare technology integration accelerates across major hospital systems",
      "Regulatory frameworks evolve to accommodate breakthrough therapy designations"
    ],
    marketImpact: "Healthcare markets remain fundamentally strong with sustained investment in biotechnology innovation. Regulatory clarity continues to drive investor confidence in pharmaceutical sectors, while emerging therapeutic areas present significant growth opportunities.",
    conflictUpdates: [
      {
        conflict: "COVID-19 Variant Monitoring",
        update: "Health authorities maintain surveillance protocols for emerging variants with updated vaccination strategies.",
        severity: "medium"
      },
      {
        conflict: "Antimicrobial Resistance Crisis", 
        update: "WHO reports continued challenges with drug-resistant infections requiring novel therapeutic approaches.",
        severity: "high"
      }
    ],
    defenseStockHighlights: [
      {
        symbol: "PFE",
        name: "Pfizer Inc",
        price: 24.48,
        change: 0.18,
        changePercent: 0.74,
        reason: "Strong pipeline momentum in oncology with positive Phase III results"
      },
      {
        symbol: "JNJ",
        name: "Johnson & Johnson",
        price: 155.26,
        change: -1.18,
        changePercent: -0.76,
        reason: "Medical devices segment showing consistent growth trajectory"
      },
      {
        symbol: "MRNA",
        name: "Moderna Inc",
        price: 27.75,
        change: 0.07,
        changePercent: 0.25,
        reason: "mRNA platform expansion into new therapeutic areas"
      }
    ],
    geopoliticalAnalysis: "Healthcare regulatory environments continue evolving with focus on accelerated drug approvals and global health security. International cooperation on pandemic preparedness drives pharmaceutical innovation and cross-border collaboration."
  };

  const displayNews = news || fallbackNews;

  if (error) {
    return (
      <Card className="w-full border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-lg text-amber-800">Intelligence Brief Unavailable</CardTitle>
          </div>
          <CardDescription className="text-amber-700">
            Unable to load today's pharmaceutical intelligence briefing. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-slate-600";
  };

  const conflictUpdates = (displayNews.conflictUpdates as NewsConflictUpdate[]) || [];
  const stockHighlights = (displayNews.defenseStockHighlights as NewsStockHighlight[]) || [];
  const keyDevelopments = (displayNews.keyDevelopments as string[]) || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{displayNews.title}</CardTitle>
              <CardDescription className="mt-1">
                Daily Pharmaceutical Intelligence Brief
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {new Date(displayNews.createdAt || '').toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Executive Summary</h3>
          <div className="text-blue-800 text-sm">
            {formatContentWithSources(displayNews.summary)}
          </div>
        </div>

        {/* Key Developments */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-600" />
            Key Healthcare Developments
          </h3>
          <div className="grid gap-2">
            {keyDevelopments.slice(0, isExpanded ? undefined : 3).map((development, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <p className="text-slate-700">{development}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Health Crisis Updates */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-600" />
            Global Health Crisis Updates
          </h3>
          <div className="grid gap-2">
            {conflictUpdates.slice(0, isExpanded ? undefined : 2).map((update, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                <Badge className={`text-xs ${getSeverityColor(update.severity)}`}>
                  {update.severity.toUpperCase()}
                </Badge>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{update.conflict}</p>
                  <p className="text-xs text-slate-600 mt-1">{update.update}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pharma Stock Highlights */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            Pharmaceutical Stock Highlights
          </h3>
          <div className="grid gap-2">
            {stockHighlights.slice(0, isExpanded ? undefined : 2).map((stock, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{stock.symbol}</span>
                    <span className="text-xs text-slate-600">{stock.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{stock.reason}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-sm ${getChangeColor(stock.change)}`}>
                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </p>
                  <p className={`text-xs ${getChangeColor(stock.changePercent)}`}>
                    ({stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collapsible Market Impact & Analysis */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Market Impact & Analysis
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Market Impact */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pharmaceutical Market Impact
              </h4>
              <div className="text-green-800 text-sm">
                {formatContentWithSources(displayNews.marketImpact)}
              </div>
            </div>

            {/* Regulatory Analysis */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Regulatory & Policy Analysis
              </h4>
              <div className="text-purple-800 text-sm">
                {formatContentWithSources(displayNews.geopoliticalAnalysis)}
              </div>
            </div>


          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}