import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  RefreshCw, 
  Building2, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LobbyingData {
  company: string;
  symbol: string;
  totalSpending: number;
  recentQuarter: number;
  yearOverYearChange: number;
  keyIssues: string[];
  governmentContracts: number;
  influence: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

interface LobbyingAnalysis {
  totalIndustrySpending: number;
  topSpenders: LobbyingData[];
  trends: {
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
    timeframe: string;
  };
  keyInsights: string[];
  marketImpact: string;
  lastUpdated: string;
}

export default function ModernLobbyingAnalysis({ timeframe = "1Y" }: { timeframe?: string }) {
  const queryClient = useQueryClient();

  const { data: analysis, isLoading, error } = useQuery<LobbyingAnalysis>({
    queryKey: ["/api/lobbying/analysis", timeframe],
    queryFn: () => apiRequest(`/api/lobbying/analysis?timeframe=${timeframe}`),
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 180000, // Consider data stale after 3 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("/api/lobbying/refresh", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lobbying/analysis"] });
    },
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}B`;
    }
    return `$${amount.toFixed(1)}M`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <DollarSign className="h-4 w-4 text-blue-600" />;
    }
  };

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Unable to Load Lobbying Data</h3>
              <p className="text-sm text-red-700 mt-1">
                Real-time lobbying analysis is temporarily unavailable. Please try refreshing.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/lobbying/analysis"] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>AI-Powered Lobbying Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded"></div>
              ))}
            </div>
            <div className="h-48 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>AI-Powered Lobbying Analysis</span>
            <Badge variant="outline" className="ml-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              Live Data
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-slate-600">
              <Clock className="h-4 w-4 mr-1" />
              Updated {analysis ? formatTimestamp(analysis.lastUpdated) : 'recently'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Industry Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Industry Spending</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {analysis ? formatCurrency(analysis.totalIndustrySpending) : '$0M'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                2024 expenditures
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Industry Trend</p>
                  <div className="flex items-center space-x-2">
                    {analysis && getTrendIcon(analysis.trends.direction)}
                    <p className="text-2xl font-bold text-slate-900">
                      {analysis ? `${analysis.trends.percentage}%` : '0%'}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-600 capitalize">
                {analysis?.trends.direction || 'stable'} trend
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Top Spenders</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {analysis?.topSpenders.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                companies tracked
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Spending Companies */}
        {analysis?.topSpenders && analysis.topSpenders.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Top Lobbying Spenders</h4>
            <div className="space-y-3">
              {analysis.topSpenders.slice(0, 5).map((company, index) => (
                <div 
                  key={company.symbol} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-semibold text-slate-900">{company.company}</h5>
                        <Badge variant="outline">{company.symbol}</Badge>
                        <Badge className={`text-xs ${getInfluenceColor(company.influence)}`}>
                          {company.influence} influence
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                        <span>Q4: {formatCurrency(company.recentQuarter)}</span>
                        <span className={company.yearOverYearChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                          YoY: {company.yearOverYearChange >= 0 ? '+' : ''}{company.yearOverYearChange.toFixed(1)}%
                        </span>
                        {company.governmentContracts > 0 && (
                          <span>Contracts: {formatCurrency(company.governmentContracts)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">
                      {formatCurrency(company.totalSpending)}
                    </div>
                    <div className="text-sm text-slate-600">2024 total</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Insights */}
        {analysis?.keyInsights && analysis.keyInsights.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Key Market Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Impact */}
        {analysis?.marketImpact && (
          <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2">Market Impact Analysis</h4>
            <p className="text-slate-700">{analysis.marketImpact}</p>
          </div>
        )}

        <div className="text-xs text-slate-500 border-t pt-4">
          Analysis powered by Perplexity AI with real-time data from defense industry sources. 
          Data refreshes every 5 minutes during market hours.
        </div>
      </CardContent>
    </Card>
  );
}