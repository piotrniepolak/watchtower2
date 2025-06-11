import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, ChevronDown, ChevronRight } from "lucide-react";
import type { Stock } from "@shared/schema";
import CompanyLogo from "./company-logo";
import GeopoliticalLoader from "@/components/geopolitical-loader";
import { useState } from "react";

interface EnhancedChartsSectionProps {
  sector?: string;
}

function EnhancedChartsSection({ sector = "defense" }: EnhancedChartsSectionProps) {
  const [expandedStock, setExpandedStock] = useState<string | null>(null);
  
  const { data: stocks, isLoading: stocksLoading } = useQuery({
    queryKey: ["/api/stocks"],
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  const toggleExpanded = (symbol: string) => {
    setExpandedStock(expandedStock === symbol ? null : symbol);
  };
  
  // Filter stocks by sector
  const getSectorStockPerformance = () => {
    if (!stocks || !Array.isArray(stocks)) return { topPerformers: [], worstPerformers: [] };
    
    // Define sector mappings
    const sectorMapping: Record<string, string> = {
      'defense': 'Defense',
      'health': 'Healthcare', 
      'energy': 'Energy'
    };
    
    const dbSectorName = sectorMapping[sector];
    const sectorStocks = stocks.filter(stock => stock.sector === dbSectorName);
    
    const sorted = [...sectorStocks].sort((a, b) => b.changePercent - a.changePercent);
    return {
      topPerformers: sorted.slice(0, 3),
      worstPerformers: sorted.slice(-3).reverse()
    };
  };

  const { topPerformers, worstPerformers } = getSectorStockPerformance();

  // Calculate sector market metrics
  const calculateSectorMarketMetrics = () => {
    if (!stocks || !Array.isArray(stocks)) return { totalGains: 0, totalLosses: 0, avgChange: 0 };
    
    // Define sector mappings
    const sectorMapping: Record<string, string> = {
      'defense': 'Defense',
      'health': 'Healthcare', 
      'energy': 'Energy'
    };
    
    const dbSectorName = sectorMapping[sector];
    const sectorStocks = stocks.filter(stock => stock.sector === dbSectorName);
    
    const gains = sectorStocks.filter(s => s.changePercent > 0).length;
    const losses = sectorStocks.filter(s => s.changePercent < 0).length;
    const avgChange = sectorStocks.length > 0 ? 
      sectorStocks.reduce((sum, s) => sum + s.changePercent, 0) / sectorStocks.length : 0;
    
    return { totalGains: gains, totalLosses: losses, avgChange };
  };

  const marketMetrics = calculateSectorMarketMetrics();

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
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {topPerformers.map((stock: Stock, index: number) => {
                const isExpanded = expandedStock === stock.symbol;
                return (
                  <div key={stock.symbol} className="bg-green-50 dark:bg-green-900/20 rounded-md">
                    <div 
                      className="flex items-center p-2 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      onClick={() => toggleExpanded(stock.symbol)}
                    >
                      <div className="flex items-center space-x-2 flex-1 overflow-hidden">
                        <span className="text-xs font-bold text-green-700 dark:text-green-400 bg-green-200 dark:bg-green-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{stock.symbol.slice(0, 2)}</span>
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-medium text-slate-900 dark:text-slate-100 text-xs truncate">
                            {isExpanded ? stock.name : stock.symbol}
                          </div>
                          {!isExpanded && (
                            <div className="text-xs text-slate-600 dark:text-slate-400">Click to expand</div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 min-w-[70px]">
                        <div className="text-green-600 dark:text-green-400 font-bold text-xs">
                          +{stock.changePercent.toFixed(2)}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          ${stock.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-2 border-t border-green-200 dark:border-green-800 mt-1 pt-2">
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          <strong>Full Name:</strong> {stock.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          <strong>Symbol:</strong> {stock.symbol}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Underperformers */}
        <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
              Underperformers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {worstPerformers.map((stock: Stock, index: number) => {
                const isExpanded = expandedStock === stock.symbol;
                return (
                  <div key={stock.symbol} className="bg-red-50 dark:bg-red-900/20 rounded-md">
                    <div 
                      className="flex items-center p-2 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      onClick={() => toggleExpanded(stock.symbol)}
                    >
                      <div className="flex items-center space-x-2 flex-1 overflow-hidden">
                        <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-200 dark:bg-red-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{stock.symbol.slice(0, 2)}</span>
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-medium text-slate-900 dark:text-slate-100 text-xs truncate">
                            {isExpanded ? stock.name : stock.symbol}
                          </div>
                          {!isExpanded && (
                            <div className="text-xs text-slate-600 dark:text-slate-400">Click to expand</div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 min-w-[70px]">
                        <div className="text-red-600 dark:text-red-400 font-bold text-xs">
                          {stock.changePercent.toFixed(2)}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          ${stock.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-2 border-t border-red-200 dark:border-red-800 mt-1 pt-2">
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          <strong>Full Name:</strong> {stock.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          <strong>Symbol:</strong> {stock.symbol}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

export default EnhancedChartsSection;