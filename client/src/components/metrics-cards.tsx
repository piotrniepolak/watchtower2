import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, DollarSign, Link } from "lucide-react";
import { useRealTimeStocks } from "@/hooks/useRealTimeStocks";
import type { Conflict } from "@shared/schema";

export default function MetricsCards() {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
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
  );
}
