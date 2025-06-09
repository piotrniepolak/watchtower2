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
  
  // Filter to only defense stocks for ConflictWatch
  const getDefenseStockPerformance = () => {
    if (!stocks || !Array.isArray(stocks)) return { topPerformers: [], worstPerformers: [] };
    
    // Filter for defense-related stocks only
    const defenseStocks = stocks.filter(stock => 
      stock.sector === 'Defense' || 
      stock.hasDefense === true ||
      ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'LHX', 'LDOS', 'KTOS', 'AVAV', 'HII', 'ITA'].includes(stock.symbol)
    );
    
    const sorted = [...defenseStocks].sort((a, b) => b.changePercent - a.changePercent);
    return {
      topPerformers: sorted.slice(0, 3),
      worstPerformers: sorted.slice(-3).reverse()
    };
  };

  const { topPerformers, worstPerformers } = getDefenseStockPerformance();

  // Calculate defense market metrics only
  const calculateDefenseMarketMetrics = () => {
    if (!stocks || !Array.isArray(stocks)) return { totalGains: 0, totalLosses: 0, avgChange: 0 };
    
    // Filter for defense-related stocks only
    const defenseStocks = stocks.filter(stock => 
      stock.sector === 'Defense' || 
      stock.hasDefense === true ||
      ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'LHX', 'LDOS', 'KTOS', 'AVAV', 'HII', 'ITA'].includes(stock.symbol)
    );
    
    const gains = defenseStocks.filter(s => s.changePercent > 0).length;
    const losses = defenseStocks.filter(s => s.changePercent < 0).length;
    const avgChange = defenseStocks.length > 0 ? 
      defenseStocks.reduce((sum, s) => sum + s.changePercent, 0) / defenseStocks.length : 0;
    
    return { totalGains: gains, totalLosses: losses, avgChange };
  };

  const marketMetrics = calculateDefenseMarketMetrics();

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Market Overview */}
        <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-blue-600" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Advancing Stocks</span>
                <span className="font-semibold text-green-600">{marketMetrics.totalGains}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Declining Stocks</span>
                <span className="font-semibold text-red-600">{marketMetrics.totalLosses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 text-sm">Average Change</span>
                <span className={`font-semibold text-sm ${marketMetrics.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketMetrics.avgChange >= 0 ? '+' : ''}{marketMetrics.avgChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((stock: Stock, index: number) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg min-w-0">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-200 dark:bg-green-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <CompanyLogo symbol={stock.symbol} name={stock.name} size="sm" />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">{stock.symbol}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">${stock.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-green-600 dark:text-green-400 font-semibold text-sm">
                      +{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Underperformers */}
        <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
              Underperformers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {worstPerformers.map((stock: Stock, index: number) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg min-w-0">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-200 dark:bg-red-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <CompanyLogo symbol={stock.symbol} name={stock.name} size="sm" />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">{stock.symbol}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">${stock.price.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-red-600 dark:text-red-400 font-semibold text-sm">
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}