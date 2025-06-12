import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Clock, Users, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { DailyNews, NewsConflictUpdate, NewsStockHighlight } from "@shared/schema";

interface DefenseIntelligenceBriefProps {
  className?: string;
}

export function DefenseIntelligenceBrief({ className }: DefenseIntelligenceBriefProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: defenseNews, isLoading, error } = useQuery<DailyNews>({
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatChangePercent = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Defense Intelligence Brief</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading defense intelligence...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !defenseNews) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Defense Intelligence Brief</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Unable to load today's defense intelligence brief
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
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
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">{defenseNews.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4" />
                  {new Date(defenseNews.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Intelligence
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {defenseNews.summary}
          </p>
        </CardContent>
      </Card>

      {/* Key Developments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Key Developments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {Array.isArray(defenseNews.keyDevelopments) ? defenseNews.keyDevelopments.map((development, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{development}</span>
              </li>
            )) : (
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{defenseNews.keyDevelopments}</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Market Impact Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Market Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {defenseNews.marketImpact}
          </p>
        </CardContent>
      </Card>

      {/* Conflict Status Updates */}
      {defenseNews.conflictUpdates && Array.isArray(defenseNews.conflictUpdates) && defenseNews.conflictUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Conflict Status Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {defenseNews.conflictUpdates.map((update: NewsConflictUpdate, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{update.conflict}</h4>
                    <Badge variant={getSeverityColor(update.severity)}>
                      {update.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{update.update}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Defense Stock Highlights */}
      {defenseNews.defenseStockHighlights && Array.isArray(defenseNews.defenseStockHighlights) && defenseNews.defenseStockHighlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Defense Stock Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {defenseNews.defenseStockHighlights.map((stock: NewsStockHighlight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{stock.symbol}</h4>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${
                        (stock.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(stock.changePercent || 0) >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {formatChangePercent(stock.changePercent || 0)}
                        </span>
                      </div>
                      {stock.change && (
                        <p className="text-sm text-muted-foreground">
                          ${stock.change.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{stock.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geopolitical Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Geopolitical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {defenseNews.geopoliticalAnalysis}
          </p>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Defense Intelligence Brief powered by real-time conflict monitoring and market analysis</p>
        <p className="mt-1">
          Last updated: {defenseNews.createdAt ? new Date(defenseNews.createdAt).toLocaleString() : 'Unknown'}
        </p>
      </div>
    </div>
  );
}