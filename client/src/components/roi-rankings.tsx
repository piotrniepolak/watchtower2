import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Trophy, Target, BarChart3, Info } from "lucide-react";
import { useState } from "react";
import CompanyLogo from "@/components/company-logo";
import type { ROIAnalysis } from "@shared/schema";

export default function ROIRankings() {
  const [timeframe, setTimeframe] = useState("1Y");
  
  const { data: roiData, isLoading, error } = useQuery({
    queryKey: ["/api/roi-rankings", timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/roi-rankings?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch ROI data');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-black";
    if (rank === 3) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
    if (rank <= 5) return "bg-green-500";
    if (rank <= 10) return "bg-blue-500";
    return "bg-gray-500";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className="w-4 h-4" />;
    if (rank <= 5) return <Target className="w-4 h-4" />;
    return <BarChart3 className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(1)}M`;
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-800">
            <Info className="w-5 h-5 mr-2" />
            ROI Analysis Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 text-sm">
            Unable to load lobbying ROI data. This feature requires database configuration with lobbying expenditure tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-slate-800">
            <DollarSign className="w-6 h-6 mr-2 text-green-600" />
            Lobbying ROI Rankings
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="2Y">2Y</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Companies ranked by stock price gains relative to lobbying expenditures
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span className="text-slate-600">Calculating ROI rankings...</span>
            </div>
          </div>
        ) : roiData && roiData.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-3 p-4 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Company</div>
              <div className="col-span-2 text-center">Price Gain</div>
              <div className="col-span-2 text-center">Lobbying Spent</div>
              <div className="col-span-2 text-center">ROI Ratio</div>
              <div className="col-span-1 text-center">Score</div>
            </div>
            
            {roiData.map((item: ROIAnalysis) => (
              <div 
                key={item.stockSymbol}
                className="grid grid-cols-12 gap-3 p-4 hover:bg-slate-50 transition-colors"
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center justify-center">
                  <Badge 
                    className={`${getRankBadgeColor(item.rank)} flex items-center space-x-1 px-2 py-1`}
                  >
                    {getRankIcon(item.rank)}
                    <span className="font-bold">#{item.rank}</span>
                  </Badge>
                </div>
                
                {/* Company */}
                <div className="col-span-4 flex items-center space-x-3">
                  <CompanyLogo symbol={item.stockSymbol} name={item.companyName} />
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{item.companyName}</h3>
                    <p className="text-xs text-slate-500">{item.stockSymbol}</p>
                  </div>
                </div>
                
                {/* Price Gain */}
                <div className="col-span-2 flex items-center justify-center">
                  <div className="flex items-center space-x-1">
                    {item.priceGainPercent >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span 
                      className={`font-semibold ${
                        item.priceGainPercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.priceGainPercent >= 0 ? '+' : ''}{item.priceGainPercent}%
                    </span>
                  </div>
                </div>
                
                {/* Lobbying Spent */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="font-medium text-slate-700">
                    {formatCurrency(item.lobbyingSpent)}
                  </span>
                </div>
                
                {/* ROI Ratio */}
                <div className="col-span-2 flex items-center justify-center">
                  <Badge 
                    variant={item.roiRatio > 5 ? "default" : item.roiRatio > 2 ? "secondary" : "outline"}
                    className="font-bold"
                  >
                    {item.roiRatio}x
                  </Badge>
                </div>
                
                {/* Performance Score */}
                <div className="col-span-1 flex items-center justify-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    item.rank <= 3 ? 'bg-green-500' : 
                    item.rank <= 7 ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}>
                    {item.rank <= 3 ? 'A' : item.rank <= 7 ? 'B' : 'C'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No ROI Data Available</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              ROI analysis requires both stock price history and lobbying expenditure data. 
              Data will appear once sufficient information is collected.
            </p>
          </div>
        )}
        
        {roiData && roiData.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="text-xs text-slate-600">
              <p className="mb-1">
                <strong>ROI Ratio:</strong> Stock price gain percentage divided by lobbying expenditure (millions USD)
              </p>
              <p className="mb-1">
                <strong>Higher ratios indicate better returns per lobbying dollar spent</strong>
              </p>
              <p>
                Data sources: Real-time stock prices, lobbying expenditure reports from OpenSecrets.org
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}