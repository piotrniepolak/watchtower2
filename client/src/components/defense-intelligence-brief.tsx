import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Building2
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
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
              <p className="text-sm leading-relaxed text-muted-foreground">
                {defenseNews?.summary || 'No summary available'}
              </p>
              
              {/* Key Developments */}
              {defenseNews?.keyDevelopments && Array.isArray(defenseNews.keyDevelopments) && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Key Developments
                  </h4>
                  <ul className="space-y-2">
                    {defenseNews.keyDevelopments.map((development: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground leading-relaxed">{development}</span>
                      </li>
                    ))}
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
                    const severityColor = update.severity === 'high' ? 'border-red-500' : 
                                         update.severity === 'medium' ? 'border-orange-500' : 'border-yellow-500';
                    const dotColor = update.severity === 'high' ? 'bg-red-500' : 
                                    update.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500';
                    
                    return (
                      <div key={index} className={`bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 ${severityColor}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 ${dotColor} rounded-full mt-2 flex-shrink-0`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{update.conflict || 'Conflict Update'}</h4>
                              <Badge variant={update.severity === 'high' ? 'destructive' : 
                                            update.severity === 'medium' ? 'secondary' : 'outline'} 
                                     className="text-xs">
                                {update.severity?.toUpperCase() || 'LOW'}
                              </Badge>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {update.update || String(update)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
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
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{stock.symbol}</span>
                          <span className="text-xs text-muted-foreground">{stock.name}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge variant={stock.change > 0 ? "default" : "destructive"} className="text-xs">
                            {stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2) || 'N/A'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {stock.changePercent > 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {stock.reason || String(stock)}
                      </p>
                    </div>
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
      </CardContent>
    </Card>
  );
}