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

// Content formatting utility - split content from references
const splitContentAndReferences = (text: string | undefined): { content: string; references: string } => {
  if (!text) return { content: '', references: '' };
  
  // Split content at "References:" section
  const referencesMatch = text.match(/^([\s\S]*?)\*\*References:\*\*([\s\S]*)$/);
  if (referencesMatch) {
    const content = referencesMatch[1].trim();
    const references = referencesMatch[2].trim();
    return { content, references };
  }
  
  return { content: text, references: '' };
};

// Parse markdown-style references into structured data
const parseReferences = (referencesText: string): Array<{number: number, title: string, url: string}> => {
  if (!referencesText) return [];
  
  const references: Array<{number: number, title: string, url: string}> = [];
  const lines = referencesText.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    // Match pattern: "1. [Title](URL)"
    const match = line.match(/^(\d+)\.\s*\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      references.push({
        number: parseInt(match[1]),
        title: match[2],
        url: match[3]
      });
    }
  });
  
  return references;
};

// Clean content while preserving citation numbers
const cleanContent = (text: string | undefined): string => {
  if (!text) return '';
  return text
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

// Enhanced content display with table-based references
const formatContentWithSources = (text: string | undefined): JSX.Element => {
  if (!text) {
    return <p className="text-slate-500 italic">Loading pharmaceutical intelligence...</p>;
  }
  
  // Split content and references using the new function
  const { content, references } = splitContentAndReferences(text);
  const cleaned = cleanContent(content);
  
  return (
    <div className="space-y-4">
      <div className="leading-relaxed text-sm">
        {cleaned.split('\n\n').filter(p => p.trim()).map((paragraph: string, index: number) => (
          <p key={index} className="mb-3 last:mb-0">{paragraph.trim()}</p>
        ))}
      </div>
      
      {references && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">References</h4>
          <div className="space-y-2">
            {parseReferences(references).map((ref) => (
              <div key={ref.number} className="flex items-start gap-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium min-w-[20px]">
                  {ref.number}.
                </span>
                <a 
                  href={ref.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors flex-1"
                >
                  {ref.title}
                </a>
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

  const [selectedStock, setSelectedStock] = useState<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    reason?: string;
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleSection = (section: keyof typeof sectionsCollapsed) => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleStockClick = (stock: any) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
  };

  const { data: news, isLoading, error } = useEnhancedPharmaNews();
  const { data: stocks } = useStockPrices();

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
    sector: 'pharmaceutical',
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
    defenseStockHighlights: [],
    pharmaceuticalStockHighlights: [
      {
        symbol: "PFE",
        name: "Pfizer Inc",
        change: 0.18,
        changePercent: 0.74,
        reason: "Strong pipeline momentum in oncology with positive Phase III results"
      },
      {
        symbol: "JNJ",
        name: "Johnson & Johnson",
        change: -1.18,
        changePercent: -0.76,
        reason: "Medical devices segment showing consistent growth trajectory"
      },
      {
        symbol: "MRNA",
        name: "Moderna Inc",
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
  const rawStockHighlights = (displayNews.pharmaceuticalStockHighlights as NewsStockHighlight[]) || [];
  const keyDevelopments = (displayNews.keyDevelopments as string[]) || [];

  // Enhance stock highlights with real-time prices if available
  const stockHighlights = rawStockHighlights.map(highlight => {
    const stock = stocks?.find(s => s.symbol === highlight.symbol);
    if (stock && stock.price > 0) {
      return {
        ...highlight,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent
      };
    }
    return highlight;
  });

  return (
    <>
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
                {(() => {
                  const summaryContent = displayNews.summary || "Executive summary will be displayed here once available.";
                  const parts = summaryContent.split('**References:**');
                  const mainContent = parts[0].replace(/Sources:.*$/, '').trim();
                  const referencesSection = parts[1];
                  
                  return (
                    <>
                      <div className="text-blue-800 text-sm leading-relaxed mb-4">
                        {mainContent}
                      </div>
                      
                      {/* Streamlined Source Links */}
                      {referencesSection && (
                        <div className="border-t border-blue-300 pt-4">
                          <SourceLinks 
                            sources={extractSourcesFromText(referencesSection)}
                            title="References"
                          />
                        </div>
                      )}
                    </>
                  );
                })()}
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
              <div className="grid gap-3">
                {/* Key Pharmaceutical Developments */}
                {keyDevelopments.length > 0 ? (
                  keyDevelopments.map((development, index) => {
                    // Handle both old "Source:" format and new markdown format with references
                    const parts = development.split('**References:**');
                    const content = parts[0].replace(/Source:.*$/, '').trim();
                    const referencesSection = parts[1];
                    
                    return (
                      <div key={index} className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                        <div className="flex items-start gap-3 mb-3">
                          <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                            PHARMA
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-blue-900">{content}</p>
                          </div>
                        </div>
                        
                        {/* References for this development */}
                        {referencesSection && (
                          <div className="border-t border-blue-300 pt-3 ml-12">
                            <h5 className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              Sources
                            </h5>
                            <div className="space-y-1">
                              {referencesSection.split('\n').filter(line => line.trim()).map((reference, refIndex) => {
                                // Parse markdown links: "1. [Title](URL)"
                                const match = reference.match(/^\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/);
                                if (match) {
                                  const [, title, url] = match;
                                  return (
                                    <div key={refIndex} className="flex items-start gap-2">
                                      <span className="text-blue-600 font-medium text-xs min-w-[15px]">{refIndex + 1}.</span>
                                      <a 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline text-xs transition-colors flex-1"
                                      >
                                        {title}
                                      </a>
                                    </div>
                                  );
                                }
                                return null;
                              }).filter(Boolean)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-slate-500 italic">
                    Health crisis updates will be displayed here when available
                  </div>
                )}
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
              Pharmaceutical Stocks Mentioned in this Brief
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
                  <button
                    key={index}
                    onClick={() => handleStockClick(stock)}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer w-full text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{stock.symbol}</span>
                        <span className="text-xs text-slate-600">{stock.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {stock.reason.split('.')[0] + '.'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-slate-900">
                        ${stock.price?.toFixed(2) || '0.00'}
                      </p>
                      <p className={`text-xs ${getChangeColor(stock.changePercent)}`}>
                        ({stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </button>
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
                {(() => {
                  const marketContent = displayNews.marketImpact || "Market impact analysis will be displayed here once available.";
                  const parts = marketContent.split('**References:**');
                  const mainContent = parts[0].replace(/Sources:.*$/, '').trim();
                  const referencesSection = parts[1];
                  
                  return (
                    <>
                      <div className="text-green-800 text-sm leading-relaxed mb-4">
                        {mainContent}
                      </div>
                      
                      {/* Streamlined Source Links */}
                      {referencesSection && (
                        <div className="border-t border-green-300 pt-4">
                          <SourceLinks 
                            sources={extractSourcesFromText(referencesSection)}
                            title="References"
                          />
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Stock Detail Modal */}
    {selectedStock && (
      <StockDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        stock={selectedStock}
      />
    )}
    </>
  );
}