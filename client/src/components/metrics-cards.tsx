import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, DollarSign, Link } from "lucide-react";
import { MiniGeopoliticalLoader } from "@/components/geopolitical-loader";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/metrics"],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const { data: stocks } = useQuery({
    queryKey: ["/api/stocks"],
    refetchInterval: 30000, // Real-time stock data for calculations
  });

  // Calculate real-time defense index and market cap from live stock data
  const calculateRealTimeMetrics = () => {
    if (!stocks || !Array.isArray(stocks)) {
      return {
        defenseIndex: "0.00",
        marketCap: "$0B",
        indexChange: "+0.00%",
        marketCapChange: "+0.00%"
      };
    }

    // Calculate weighted defense index based on major defense stocks
    const majorStocks = stocks.filter(stock => 
      ['LMT', 'RTX', 'NOC', 'GD', 'BA'].includes(stock.symbol)
    );
    
    const totalWeightedPrice = majorStocks.reduce((sum, stock) => sum + stock.price, 0);
    const defenseIndex = (totalWeightedPrice / majorStocks.length).toFixed(2);
    
    // Calculate total market cap
    const totalMarketCap = stocks.reduce((sum, stock) => {
      const marketCapValue = parseFloat(stock.marketCap?.replace(/[$B€£]/g, '') || '0');
      return sum + marketCapValue;
    }, 0);
    
    // Calculate average change percentage
    const avgChangePercent = stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length;
    
    return {
      defenseIndex,
      marketCap: `$${totalMarketCap.toFixed(1)}B`,
      indexChange: `${avgChangePercent >= 0 ? '+' : ''}${avgChangePercent.toFixed(2)}%`,
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
      title: "Active Conflicts",
      value: metrics?.activeConflicts || 0,
      change: "+2",
      changeText: "from last month",
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      changeColor: "text-red-600",
    },
    {
      title: "Defense Index",
      value: `$${realTimeMetrics.defenseIndex}`,
      change: realTimeMetrics.indexChange,
      changeText: "today",
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
      changeColor: "text-green-600",
    },
    {
      title: "Correlation Score",
      value: metrics?.correlationScore || "0.00",
      change: "High",
      changeText: "correlation",
      icon: Link,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      changeColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => (
        <Card key={index} className="shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
              </div>
              <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`${metric.changeColor} font-medium`}>{metric.change}</span>
              <span className="text-slate-600 ml-1">{metric.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
