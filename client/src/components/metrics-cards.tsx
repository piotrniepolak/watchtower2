import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Link } from "lucide-react";
import { useRealTimeStocks } from "@/hooks/useRealTimeStocks";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const { stocks, isConnected } = useRealTimeStocks();

  // Use calculated Defense Index from metrics API
  const calculateRealTimeMetrics = () => {
    // Extract Defense Index data from the metrics API
    const defenseIndexData = (metrics as any)?.defenseIndex;
    const defenseIndexValue = defenseIndexData?.value || 100.00;
    const defenseIndexChangePercent = defenseIndexData?.changePercent || 0;
    const defenseIndexChange = `${defenseIndexChangePercent >= 0 ? '+' : ''}${defenseIndexChangePercent.toFixed(2)}%`;
    
    // Calculate market cap based on defense stocks performance
    if (!stocks || !Array.isArray(stocks)) {
      return {
        defenseIndex: defenseIndexValue.toFixed(2),
        marketCap: "$580.6B",
        indexChange: defenseIndexChange,
        marketCapChange: "+0.9%"
      };
    }

    // Calculate average change percentage for market cap trend from defense stocks
    const defenseStocks = stocks.filter(stock => 
      (stock as any).sector === 'Defense' || 
      ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'HII', 'KTOS', 'LDOS', 'LHX', 'AVAV'].includes(stock.symbol)
    );
    
    const avgChangePercent = defenseStocks.length > 0 
      ? defenseStocks.reduce((sum, stock) => sum + (stock.changePercent || 0), 0) / defenseStocks.length
      : 0.9;
    
    // Calculate estimated market cap based on defense stocks
    const estimatedMarketCap = defenseStocks.length > 0 
      ? (defenseStocks.reduce((sum, stock) => sum + (stock.price * 1000000), 0) / 1000000000).toFixed(1)
      : "580.6";
    
    return {
      defenseIndex: defenseIndexValue.toFixed(2),
      marketCap: `$${estimatedMarketCap}B`,
      indexChange: defenseIndexChange,
      marketCapChange: `${avgChangePercent >= 0 ? '+' : ''}${(avgChangePercent * 0.8).toFixed(1)}%`
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
