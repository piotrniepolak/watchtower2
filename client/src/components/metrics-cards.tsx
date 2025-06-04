import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, DollarSign, Link } from "lucide-react";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/metrics"],
  });

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
      value: `$${metrics?.defenseIndex || "0.00"}`,
      change: "+3.2%",
      changeText: "today",
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-green-600",
    },
    {
      title: "Market Cap",
      value: metrics?.marketCap || "$0B",
      change: "+1.8%",
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
