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
  DollarSign
} from "lucide-react";
import type { DailyNews, NewsConflictUpdate, NewsStockHighlight } from "@shared/schema";

export default function DailyNews() {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: news, isLoading, error } = useQuery<DailyNews>({
    queryKey: ["/api/news/today"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Daily Intelligence Brief</CardTitle>
          </div>
          <CardDescription>Loading today's geopolitical intelligence...</CardDescription>
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

  if (error) {
    return (
      <Card className="w-full border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-lg text-amber-800">Intelligence Brief Unavailable</CardTitle>
          </div>
          <CardDescription className="text-amber-700">
            Unable to load today's intelligence briefing. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!news) {
    return (
      <Card className="w-full border-slate-200 bg-slate-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-slate-600" />
            <CardTitle className="text-lg text-slate-800">No Intelligence Brief Available</CardTitle>
          </div>
          <CardDescription className="text-slate-700">
            Today's intelligence briefing is being prepared. Check back soon.
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

  const conflictUpdates = news.conflictUpdates as NewsConflictUpdate[];
  const stockHighlights = news.defenseStockHighlights as NewsStockHighlight[];
  const keyDevelopments = news.keyDevelopments as string[];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{news.title}</CardTitle>
              <CardDescription className="mt-1">
                Daily Geopolitical Intelligence Brief
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {new Date(news.createdAt || '').toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Executive Summary</h3>
          <p className="text-blue-800 text-sm leading-relaxed">{news.summary}</p>
        </div>

        {/* Key Developments */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-600" />
            Key Developments
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

        {/* Conflict Updates */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-600" />
            Conflict Updates
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

        {/* Defense Stock Highlights */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-600" />
            Defense Stock Highlights
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
                Market Impact
              </h4>
              <p className="text-green-800 text-sm leading-relaxed">{news.marketImpact}</p>
            </div>

            {/* Geopolitical Analysis */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Geopolitical Analysis
              </h4>
              <p className="text-purple-800 text-sm leading-relaxed">{news.geopoliticalAnalysis}</p>
            </div>

            {/* Additional Key Developments */}
            {keyDevelopments.length > 3 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Additional Developments</h4>
                <div className="grid gap-2">
                  {keyDevelopments.slice(3).map((development, index) => (
                    <div key={index + 3} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <p className="text-slate-700">{development}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Conflict Updates */}
            {conflictUpdates.length > 2 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Additional Conflict Updates</h4>
                <div className="grid gap-2">
                  {conflictUpdates.slice(2).map((update, index) => (
                    <div key={index + 2} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
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

            {/* Additional Stock Highlights */}
            {stockHighlights.length > 2 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Additional Stock Movements</h4>
                <div className="grid gap-2">
                  {stockHighlights.slice(2).map((stock, index) => (
                    <div key={index + 2} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
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
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}