import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, DollarSign, Link, ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { useRealTimeStocks } from "@/hooks/useRealTimeStocks";
import { useState } from "react";
import type { Conflict } from "@shared/schema";

export default function MetricsCards() {
  const [isDefenseIndexExpanded, setIsDefenseIndexExpanded] = useState(false);
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const { stocks, isConnected } = useRealTimeStocks();

  const { data: conflicts } = useQuery({
    queryKey: ["/api/conflicts"],
    refetchInterval: 30000, // Real-time conflict data
  });

  // Calculate real-time metrics using Yahoo Finance data
  const calculateRealTimeMetrics = () => {
    // Extract Defense Index data from the metrics API
    const defenseIndexData = (metrics as any)?.defenseIndex;
    const defenseIndexValue = defenseIndexData?.value || 100.00;
    const defenseIndexChangePercent = defenseIndexData?.changePercent || 0;
    const defenseIndexChange = `${defenseIndexChangePercent >= 0 ? '+' : ''}${defenseIndexChangePercent.toFixed(2)}%`;
    
    // Calculate combined market cap from all tracked stocks
    if (!stocks || !Array.isArray(stocks)) {
      return {
        defenseIndex: defenseIndexValue.toFixed(2),
        marketCap: "Loading...",
        indexChange: defenseIndexChange,
        marketCapChange: "..."
      };
    }

    // Calculate total market cap from all tracked companies
    let totalMarketCap = 0;
    let totalChangePercent = 0;
    let validStocks = 0;

    stocks.forEach(stock => {
      const changePercent = stock.changePercent !== undefined ? stock.changePercent : (stock as any).change_percent;
      const marketCap = stock.marketCap || (stock as any).market_cap;
      let marketCapValue = 0;
      
      // Parse market cap from API (e.g., "125.4B", "45.2M", "1.2T")
      if (marketCap && typeof marketCap === 'string' && marketCap !== 'null' && marketCap !== null) {
        const marketCapStr = marketCap.replace('$', '');
        if (marketCapStr.includes('T')) {
          marketCapValue = parseFloat(marketCapStr.replace('T', '')) * 1000; // Convert trillions to billions
        } else if (marketCapStr.includes('B')) {
          marketCapValue = parseFloat(marketCapStr.replace('B', ''));
        } else if (marketCapStr.includes('M')) {
          marketCapValue = parseFloat(marketCapStr.replace('M', '')) / 1000; // Convert millions to billions
        } else if (!isNaN(parseFloat(marketCapStr))) {
          // Handle plain numbers (assume they're in billions)
          marketCapValue = parseFloat(marketCapStr);
        }
      }
      
      if (marketCapValue > 0) {
        totalMarketCap += marketCapValue;
      }
      
      if (changePercent !== undefined && changePercent !== null) {
        totalChangePercent += changePercent;
        validStocks++;
      }
    });

    // Calculate average change percentage
    const avgChangePercent = validStocks > 0 ? totalChangePercent / validStocks : 0;
    
    // Format market cap display
    let marketCapDisplay = "";
    if (totalMarketCap >= 1000) {
      marketCapDisplay = `$${(totalMarketCap / 1000).toFixed(2)}T`;
    } else {
      marketCapDisplay = `$${totalMarketCap.toFixed(1)}B`;
    }
    
    return {
      defenseIndex: defenseIndexValue.toFixed(2),
      marketCap: marketCapDisplay,
      indexChange: defenseIndexChange,
      marketCapChange: `${avgChangePercent >= 0 ? '+' : ''}${avgChangePercent.toFixed(2)}%`
    };
  };

  const realTimeMetrics = calculateRealTimeMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Defense Index",
      value: `$${realTimeMetrics.defenseIndex}`,
      change: realTimeMetrics.indexChange,
      changeText: "weighted portfolio today",
      icon: TrendingUp,
      iconBg: realTimeMetrics.indexChange.startsWith('+') ? "bg-green-100" : "bg-red-100",
      iconColor: realTimeMetrics.indexChange.startsWith('+') ? "text-green-600" : "text-red-600",
      changeColor: realTimeMetrics.indexChange.startsWith('+') ? "text-green-600" : "text-red-600",
    },
    {
      title: "Market Cap",
      value: realTimeMetrics.marketCap,
      change: realTimeMetrics.marketCapChange,
      changeText: "this week",
      icon: DollarSign,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: realTimeMetrics.marketCapChange.startsWith('+') ? "text-green-600" : "text-red-600",
    },
    {
      title: "Correlation Score",
      value: (metrics as any)?.correlationScore || "0.00",
      change: "High",
      changeText: "correlation",
      icon: Link,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      changeColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {metricCards.map((metric, index) => (
            <Card key={index} className="shadow-sm border border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-tight break-words">
                      {metric.title}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 leading-tight break-all">
                      {metric.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 ${metric.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                  </div>
                </div>
                <div className="flex items-start text-xs gap-1">
                  <span className={`${metric.changeColor} font-medium break-words`}>
                    {metric.change}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 break-words">
                    {metric.changeText}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Defense Index Calculation Explanation */}
      <Collapsible open={isDefenseIndexExpanded} onOpenChange={setIsDefenseIndexExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full text-xs">
            <Calculator className="w-4 h-4 mr-2" />
            How Defense Index is Calculated
            {isDefenseIndexExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Real-Time Yahoo Finance Data</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    The Defense Index updates every 30 seconds using live stock prices from Yahoo Finance API for accurate market tracking.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Weighted Portfolio Calculation</h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Major Defense Stocks (Market Cap Weighted):</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>• LMT (Lockheed Martin): 20%</div>
                      <div>• RTX (Raytheon): 18%</div>
                      <div>• NOC (Northrop Grumman): 15%</div>
                      <div>• BA (Boeing Defense): 15%</div>
                      <div>• GD (General Dynamics): 12%</div>
                      <div>• LHX (L3Harris): 8%</div>
                      <div>• HII (Huntington Ingalls): 6%</div>
                      <div>• LDOS (Leidos): 3%</div>
                      <div>• KTOS (Kratos): 2%</div>
                      <div>• AVAV (AeroVironment): 1%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Formula</h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg font-mono text-xs">
                    Index Value = Σ (Normalized Stock Price × Weight) / Total Weight
                    <br />
                    Change % = Σ (Stock Change % × Weight) / Total Weight
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {isConnected ? 'Live data connected' : 'Connecting to live data...'}
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
