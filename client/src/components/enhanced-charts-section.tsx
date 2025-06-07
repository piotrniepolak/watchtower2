import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { Stock } from "@shared/schema";
import CompanyLogo from "./company-logo";
import GeopoliticalLoader from "@/components/geopolitical-loader";

export default function EnhancedChartsSection() {
  const { data: stocks, isLoading: stocksLoading } = useQuery({
    queryKey: ["/api/stocks"],
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });
  
  // Get top performing and worst performing stocks
  const getStockPerformance = () => {
    if (!stocks || !Array.isArray(stocks)) return { topPerformers: [], worstPerformers: [] };
    
    const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    return {
      topPerformers: sorted.slice(0, 3),
      worstPerformers: sorted.slice(-3).reverse()
    };
  };

  const { topPerformers, worstPerformers } = getStockPerformance();

  // Calculate market metrics
  const calculateMarketMetrics = () => {
    if (!stocks || !Array.isArray(stocks)) return { totalGains: 0, totalLosses: 0, avgChange: 0 };
    
    const gains = stocks.filter(s => s.changePercent > 0).length;
    const losses = stocks.filter(s => s.changePercent < 0).length;
    const avgChange = stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length;
    
    return { totalGains: gains, totalLosses: losses, avgChange };
  };

  const marketMetrics = calculateMarketMetrics();

  if (stocksLoading) {
    return (
      <div className="space-y-6 mb-8">
        <Card className="shadow-sm border border-slate-200">
          <CardContent className="p-6 flex flex-col items-center justify-center h-80">
            <GeopoliticalLoader 
              type="market" 
              size="lg"
              message="Loading real-time defense market data..."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Overview */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-600" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Advancing Stocks</span>
                <span className="font-semibold text-green-600">{marketMetrics.totalGains}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Declining Stocks</span>
                <span className="font-semibold text-red-600">{marketMetrics.totalLosses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Average Change</span>
                <span className={`font-semibold ${marketMetrics.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketMetrics.avgChange >= 0 ? '+' : ''}{marketMetrics.avgChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((stock, index) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-green-700 bg-green-200 rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <CompanyLogo symbol={stock.symbol} name={stock.name} size="sm" />
                    <div>
                      <div className="font-medium text-slate-900 text-sm">{stock.symbol}</div>
                      <div className="text-xs text-slate-600">${stock.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-semibold text-sm">
                      +{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Underperformers */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
              Underperformers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {worstPerformers.map((stock, index) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-red-700 bg-red-200 rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <CompanyLogo symbol={stock.symbol} name={stock.name} size="sm" />
                    <div>
                      <div className="font-medium text-slate-900 text-sm">{stock.symbol}</div>
                      <div className="text-xs text-slate-600">${stock.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-semibold text-sm">
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}