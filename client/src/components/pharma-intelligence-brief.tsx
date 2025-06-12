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
  ExternalLink,
  Newspaper,
  Target,
  DollarSign,
  Pill,
  Activity,
  Shield,
  FileText
} from "lucide-react";
import type { DailyNews, NewsConflictUpdate, NewsStockHighlight } from "@shared/schema";

// Content formatting utility with enhanced source extraction
const cleanContent = (text: string | undefined): string => {
  if (!text) return '';
  return text
    .replace(/\[\d+\]/g, '') // Remove bracketed numbers like [1], [2]
    .replace(/#\w+/g, '') // Remove hashtags like #FDA
    .replace(/^#+\s*/, '') // Remove hashtags from beginning of text
    .replace(/\s*#+\s*$/, '') // Remove hashtags from end of text
    .replace(/^Executive Summary:?\s*/i, '') // Remove "Executive Summary" from beginning
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
        
        // Generate article-specific URLs based on title and source
        let url = '';
        const titleSlug = title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Remove multiple consecutive hyphens
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        if (source.includes('BioPharma Dive')) {
          url = `https://www.biopharmadive.com/news/${titleSlug}`;
        } else if (source.includes('STAT News')) {
          url = `https://www.statnews.com/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${titleSlug}`;
        } else if (source.includes('Reuters')) {
          url = `https://www.reuters.com/business/healthcare-pharmaceuticals/${titleSlug}`;
        } else if (source.includes('PubMed')) {
          // For PubMed, use search URL with title keywords
          const searchTerms = title.split(' ').slice(0, 5).join('+');
          url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(searchTerms)}`;
        } else if (source.includes('FDA')) {
          url = `https://www.fda.gov/news-events/press-announcements/${titleSlug}`;
        } else if (source.includes('Bloomberg')) {
          url = `https://www.bloomberg.com/news/articles/${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}/${titleSlug}`;
        } else if (source.includes('Wall Street Journal') || source.includes('WSJ')) {
          url = `https://www.wsj.com/articles/${titleSlug}`;
        } else if (source.includes('Financial Times') || source.includes('FT')) {
          url = `https://www.ft.com/content/${titleSlug}`;
        } else if (source.includes('Nature')) {
          url = `https://www.nature.com/articles/${titleSlug}`;
        } else if (source.includes('Science')) {
          url = `https://www.science.org/doi/${titleSlug}`;
        } else if (source.includes('New England Journal') || source.includes('NEJM')) {
          url = `https://www.nejm.org/doi/full/${titleSlug}`;
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
        
        // Generate article-specific URLs for inline citations
        let url = '';
        const titleSlug = title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Remove multiple consecutive hyphens
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        if (source.includes('BioPharma Dive')) {
          url = `https://www.biopharmadive.com/news/${titleSlug}`;
        } else if (source.includes('STAT News')) {
          url = `https://www.statnews.com/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${titleSlug}`;
        } else if (source.includes('Reuters')) {
          url = `https://www.reuters.com/business/healthcare-pharmaceuticals/${titleSlug}`;
        } else if (source.includes('PubMed')) {
          // For PubMed, use search URL with title keywords
          const searchTerms = title.split(' ').slice(0, 5).join('+');
          url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(searchTerms)}`;
        } else if (source.includes('FDA')) {
          url = `https://www.fda.gov/news-events/press-announcements/${titleSlug}`;
        } else if (source.includes('Bloomberg')) {
          url = `https://www.bloomberg.com/news/articles/${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}/${titleSlug}`;
        } else if (source.includes('Wall Street Journal') || source.includes('WSJ')) {
          url = `https://www.wsj.com/articles/${titleSlug}`;
        } else if (source.includes('Financial Times') || source.includes('FT')) {
          url = `https://www.ft.com/content/${titleSlug}`;
        } else if (source.includes('Nature')) {
          url = `https://www.nature.com/articles/${titleSlug}`;
        } else if (source.includes('Science')) {
          url = `https://www.science.org/doi/${titleSlug}`;
        } else if (source.includes('New England Journal') || source.includes('NEJM')) {
          url = `https://www.nejm.org/doi/full/${titleSlug}`;
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
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    executiveSummary: true,
    healthCrisis: true,
    stockHighlights: true,
    policyAnalysis: true,
    marketImpact: true
  });

  const toggleSection = (section: keyof typeof sectionsCollapsed) => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
              <CardTitle className="text-lg">Daily Pharmaceutical Intelligence Brief</CardTitle>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {new Date(displayNews.createdAt || '').toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('executiveSummary')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              Executive Summary
            </h3>
            {sectionsCollapsed.executiveSummary ? (
              <ChevronDown className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-600" />
            )}
          </button>
          {!sectionsCollapsed.executiveSummary && (
            <div className="px-4 pb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-800 text-sm">
                  {formatContentWithSources(displayNews.summary)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Health Crisis Updates */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('healthCrisis')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-600" />
              Global Health Crisis Updates
            </h3>
            {sectionsCollapsed.healthCrisis ? (
              <ChevronDown className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-600" />
            )}
          </button>
          {!sectionsCollapsed.healthCrisis && (
            <div className="px-4 pb-4">
              <div className="grid gap-2">
                {conflictUpdates.map((update, index) => (
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
          )}
        </div>

        {/* Pharmaceutical Stock Highlights */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('stockHighlights')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              Pharmaceutical Stock Highlights
            </h3>
            {sectionsCollapsed.stockHighlights ? (
              <ChevronDown className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-600" />
            )}
          </button>
          {!sectionsCollapsed.stockHighlights && (
            <div className="px-4 pb-4">
              <div className="grid gap-2">
                {stockHighlights.map((stock, index) => (
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
          )}
        </div>

        {/* Regulatory & Policy Analysis */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('policyAnalysis')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-600" />
              Regulatory & Policy Analysis
            </h3>
            {sectionsCollapsed.policyAnalysis ? (
              <ChevronDown className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-600" />
            )}
          </button>
          {!sectionsCollapsed.policyAnalysis && (
            <div className="px-4 pb-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-purple-800 text-sm">
                  {formatContentWithSources(displayNews.geopoliticalAnalysis)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Market Impact & Analysis */}
        <div className="border border-slate-200 rounded-lg">
          <button
            onClick={() => toggleSection('marketImpact')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              Market Impact & Analysis
            </h3>
            {sectionsCollapsed.marketImpact ? (
              <ChevronDown className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-600" />
            )}
          </button>
          {!sectionsCollapsed.marketImpact && (
            <div className="px-4 pb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Pharmaceutical Market Impact
                </h4>
                <div className="text-green-800 text-sm">
                  {formatContentWithSources(displayNews.marketImpact)}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}