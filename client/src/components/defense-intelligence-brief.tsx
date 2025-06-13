import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { SourceLinks, extractSourcesFromText } from "./source-links";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Target,
  RefreshCw,
  ChevronDown,
  FileText,
  Globe,
  BarChart3,
  Users,
  Building2,
  DollarSign,
  ExternalLink,
  Award,
  Activity
} from "lucide-react";

export function DefenseIntelligenceBrief() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [executiveSummaryOpen, setExecutiveSummaryOpen] = useState(false);
  const [conflictUpdatesOpen, setConflictUpdatesOpen] = useState(false);
  const [stockAnalysisOpen, setStockAnalysisOpen] = useState(false);
  const [geopoliticalOpen, setGeopoliticalOpen] = useState(false);
  const [marketImpactOpen, setMarketImpactOpen] = useState(false);

  const { data: defenseNews, isLoading, error } = useQuery<any>({
    queryKey: ["/api/news/defense/today"],
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 60 * 1000, // 1 minute
  });

  const generateMutation = useMutation({
    mutationFn: () => fetch("/api/news/defense/generate", { method: "POST" }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news/defense/today"] });
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error("Error generating defense intelligence:", error);
      setIsGenerating(false);
    }
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    generateMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Loading Defense Intelligence Brief...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !defenseNews) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Daily Defense Intelligence Brief
            <Badge variant="secondary" className="ml-auto">
              {new Date().toLocaleDateString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No defense intelligence brief available for today.
            </p>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Intelligence...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Generate Defense Intelligence Brief
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
            <Shield className="h-6 w-6 text-blue-600" />
            Daily Defense Intelligence Brief
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
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-base">Executive Summary</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${executiveSummaryOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <div className="text-sm leading-relaxed text-muted-foreground">
                {defenseNews?.summary?.split('Sources:')[0] || 'No summary available'}
              </div>
              
              {/* Streamlined Source Links */}
              {defenseNews?.summary?.includes('Sources:') && (
                <div className="border-t border-slate-300 dark:border-slate-700 pt-4 mt-4">
                  <SourceLinks 
                    sources={[
                      { title: "Defense News", url: "https://www.defensenews.com", source: "Defense News" },
                      { title: "Reuters Defense Coverage", url: "https://www.reuters.com/business/aerospace-defense", source: "Reuters" },
                      { title: "Bloomberg Defense Articles", url: "https://www.bloomberg.com/news/articles/defense", source: "Bloomberg" },
                      { title: "Breaking Defense", url: "https://breakingdefense.com", source: "Breaking Defense" }
                    ]}
                    title="Sources & References"
                  />
                </div>
              )}
              
              {/* Key Developments */}
              {defenseNews?.keyDevelopments && Array.isArray(defenseNews.keyDevelopments) && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Key Developments
                  </h4>
                  <ul className="space-y-3">
                    {defenseNews.keyDevelopments.map((development: string, index: number) => {
                      const parts = development.split('Source:');
                      const content = parts[0].trim();
                      const source = parts[1]?.trim();
                      
                      return (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-xs text-muted-foreground leading-relaxed block mb-1">
                              {content}
                            </span>
                            {source && (
                              <a 
                                href={
                                  source.includes('Defense News') ? 'https://www.defensenews.com' :
                                  source.includes('Reuters') ? 'https://www.reuters.com/business/aerospace-defense' :
                                  source.includes('Bloomberg') ? 'https://www.bloomberg.com/news/articles/defense' :
                                  source.includes('Breaking Defense') ? 'https://breakingdefense.com' :
                                  'https://www.defensenews.com'
                                }
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {source}
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-sm">Threat Level</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">ELEVATED</Badge>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">Market Sentiment</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">BULLISH</Badge>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Global Conflict Updates */}
        <Collapsible open={conflictUpdatesOpen} onOpenChange={setConflictUpdatesOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-red-600" />
                <span className="font-medium text-base">Global Conflict Updates</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${conflictUpdatesOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              {defenseNews?.conflictUpdates && Array.isArray(defenseNews.conflictUpdates) ? (
                <div className="space-y-4">
                  {defenseNews.conflictUpdates.map((update: any, index: number) => {
                    const severityColor = update.severity === 'critical' ? 'border-red-600' :
                                         update.severity === 'high' ? 'border-red-500' : 
                                         update.severity === 'medium' ? 'border-orange-500' : 'border-yellow-500';
                    const dotColor = update.severity === 'critical' ? 'bg-red-600' :
                                    update.severity === 'high' ? 'bg-red-500' : 
                                    update.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500';
                    
                    return (
                      <div key={index} className={`bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 ${severityColor}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 ${dotColor} rounded-full mt-2 flex-shrink-0`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{update.conflict || update.conflictName || 'Conflict Update'}</h4>
                                {update.region && (
                                  <span className="text-xs text-muted-foreground px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                                    {update.region}
                                  </span>
                                )}
                              </div>
                              <Badge variant={update.severity === 'critical' ? 'destructive' :
                                            update.severity === 'high' ? 'destructive' : 
                                            update.severity === 'medium' ? 'secondary' : 'outline'} 
                                     className="text-xs">
                                {update.severity?.toUpperCase() || 'LOW'}
                              </Badge>
                            </div>
                            
                            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                              {update.update || update.currentStatus || String(update)}
                            </p>

                            {/* Recent Developments */}
                            {update.developments && Array.isArray(update.developments) && update.developments.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Recent Developments:</h5>
                                <ul className="space-y-1">
                                  {update.developments.slice(0, 3).map((dev: string, devIndex: number) => (
                                    <li key={devIndex} className="text-xs text-muted-foreground pl-3 relative">
                                      <span className="absolute left-0 top-1 w-1 h-1 bg-slate-400 rounded-full"></span>
                                      {dev}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Defense Impact */}
                            {update.defenseImpact && (
                              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-300">
                                <h5 className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Defense Impact:</h5>
                                <p className="text-xs text-blue-600 dark:text-blue-300">{update.defenseImpact}</p>
                              </div>
                            )}

                            {/* Market Implications */}
                            {update.marketImplications && (
                              <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-300">
                                <h5 className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Market Impact:</h5>
                                <p className="text-xs text-green-600 dark:text-green-300">{update.marketImplications}</p>
                              </div>
                            )}

                            {/* Source Links */}
                            {update.sourceLinks && Array.isArray(update.sourceLinks) && update.sourceLinks.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Source Articles:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {update.sourceLinks.slice(0, 3).map((link: string, linkIndex: number) => {
                                    try {
                                      const url = new URL(link);
                                      const domain = url.hostname.replace('www.', '');
                                      return (
                                        <a
                                          key={linkIndex}
                                          href={link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs text-slate-700 dark:text-slate-300 rounded transition-colors"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          {domain}
                                        </a>
                                      );
                                    } catch {
                                      return (
                                        <a
                                          key={linkIndex}
                                          href={link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs text-slate-700 dark:text-slate-300 rounded transition-colors"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          Source
                                        </a>
                                      );
                                    }
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-3">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date().toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 border-red-500">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{String(defenseNews?.conflictUpdates || 'No conflict updates available')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Defense Stocks Mentioned in this Brief */}
        <Collapsible open={stockAnalysisOpen} onOpenChange={setStockAnalysisOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-base">Defense Stocks Mentioned in this Brief</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${stockAnalysisOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              {defenseNews?.defenseStockHighlights && Array.isArray(defenseNews.defenseStockHighlights) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {defenseNews.defenseStockHighlights.map((stock: any, index: number) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border cursor-pointer hover:border-blue-500 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                              <span className="font-bold text-blue-600 hover:text-blue-700">{stock.symbol || 'N/A'}</span>
                              <span className="text-xs text-muted-foreground truncate">{stock.companyName || stock.name || 'Defense Company'}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${stock.currentPrice?.toFixed(2) || '0.00'}</div>
                              <div className={`text-xs ${stock.priceChange?.toString().includes('-') ? 'text-red-500' : 'text-green-500'}`}>
                                {stock.priceChange || '0%'}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {stock.analysis || stock.catalysts || 'Analysis pending...'}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <Badge variant="outline" className="text-xs">
                              {stock.sector || 'Defense'}
                            </Badge>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <Building2 className="h-6 w-6 text-blue-600" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-blue-600">{stock.symbol || 'N/A'}</span>
                                <Badge variant="outline">{stock.sector || 'Defense'}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground font-normal">
                                {stock.companyName || stock.name || 'Defense Company'}
                              </div>
                            </div>
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Stock Performance */}
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Current Performance
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Current Price</div>
                                <div className="text-xl font-bold">${stock.currentPrice?.toFixed(2) || '0.00'}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Change</div>
                                <div className={`text-xl font-bold ${stock.priceChange?.toString().includes('-') ? 'text-red-500' : 'text-green-500'}`}>
                                  {stock.priceChange || '0%'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Intelligence Analysis */}
                          {stock.analysis && (
                            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Intelligence Analysis
                              </h3>
                              <p className="text-sm leading-relaxed">{stock.analysis}</p>
                            </div>
                          )}

                          {/* Strategic Catalysts */}
                          {stock.catalysts && (
                            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Strategic Catalysts
                              </h3>
                              <p className="text-sm leading-relaxed">{stock.catalysts}</p>
                            </div>
                          )}

                          {/* Recent News */}
                          {stock.recentNews && (
                            <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Recent Developments
                              </h3>
                              <p className="text-sm leading-relaxed">{stock.recentNews}</p>
                            </div>
                          )}

                          {/* Competitive Position */}
                          {stock.competitivePosition && (
                            <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                              <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Competitive Position
                              </h3>
                              <p className="text-sm leading-relaxed">{stock.competitivePosition}</p>
                            </div>
                          )}

                          {/* External Links */}
                          <div className="flex gap-2 pt-4 border-t">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(`https://finance.yahoo.com/quote/${stock.symbol}`, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Yahoo Finance
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(stock.companyName || stock.name || stock.symbol)} defense contracts news`, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <Globe className="h-4 w-4" />
                              Latest News
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {String(defenseNews?.defenseStockHighlights || 'No defense stock highlights available')}
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Geopolitical & Policy Analysis */}
        <Collapsible open={geopoliticalOpen} onOpenChange={setGeopoliticalOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-base">Geopolitical & Policy Analysis</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${geopoliticalOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  Strategic Analysis
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {defenseNews?.geopoliticalAnalysis || 'No geopolitical analysis available'}
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Policy Implications
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">Defense spending authorization impact</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">NATO alliance strategic positioning</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">Arms export regulation changes</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Market Impact & Analysis */}
        <Collapsible open={marketImpactOpen} onOpenChange={setMarketImpactOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-base">Market Impact & Analysis</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${marketImpactOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Market Outlook
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {defenseNews?.marketImpact || 'No market impact analysis available'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border text-center">
                  <div className="text-lg font-bold text-green-600">+2.3%</div>
                  <div className="text-xs text-muted-foreground">Defense Sector</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border text-center">
                  <div className="text-lg font-bold text-blue-600">$847B</div>
                  <div className="text-xs text-muted-foreground">Global Defense Spending</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border text-center">
                  <div className="text-lg font-bold text-purple-600">13</div>
                  <div className="text-xs text-muted-foreground">Active Conflicts</div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Centralized Source Links */}
        <div className="mt-6">
          <SourceLinks 
            sources={[
              { title: "Defense News - Latest Defense Industry Coverage", url: "https://www.defensenews.com", source: "Defense News" },
              { title: "Reuters Defense & Aerospace Coverage", url: "https://www.reuters.com/business/aerospace-defense", source: "Reuters" },
              { title: "Bloomberg Defense Industry Articles", url: "https://www.bloomberg.com/news/articles/defense", source: "Bloomberg" },
              { title: "Breaking Defense - Defense Technology News", url: "https://breakingdefense.com", source: "Breaking Defense" },
              { title: "Pentagon Press Releases", url: "https://www.defense.gov/News/Releases/", source: "U.S. Department of Defense" },
              { title: "NATO News and Updates", url: "https://www.nato.int/cps/en/natohq/news.htm", source: "NATO" }
            ]}
            title="Intelligence Sources & References"
          />
        </div>
      </CardContent>
    </Card>
  );
}