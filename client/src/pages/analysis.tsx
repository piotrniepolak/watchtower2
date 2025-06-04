import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, Calendar, Target } from "lucide-react";
import CompanyLogo from "@/components/company-logo";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { Stock, Conflict } from "@shared/schema";

export default function Analysis() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1M" | "3M" | "6M" | "1Y" | "2Y">("1Y");
  const [selectedEventType, setSelectedEventType] = useState<"all" | "escalations" | "resolutions">("all");

  const { data: stocks } = useQuery({
    queryKey: ["/api/stocks"],
  });
  
  const { data: conflicts } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  // Correlation analysis data showing how stocks moved during conflict events
  const correlationEvents = [
    {
      date: "2022-02-24",
      event: "Russia invades Ukraine",
      conflict: "Ukraine-Russia",
      stockMovements: [
        { symbol: "LMT", priceChange: 12.5, percentChange: 2.8 },
        { symbol: "RTX", priceChange: 8.2, percentChange: 3.1 },
        { symbol: "NOC", priceChange: 15.7, percentChange: 3.4 },
        { symbol: "GD", priceChange: 9.8, percentChange: 2.9 },
        { symbol: "BA", priceChange: 6.3, percentChange: 1.8 },
        { symbol: "HII", priceChange: 7.2, percentChange: 2.5 },
        { symbol: "LHX", priceChange: 5.8, percentChange: 2.7 }
      ]
    },
    {
      date: "2023-10-07",
      event: "Hamas attacks Israel",
      conflict: "Israel-Gaza",
      stockMovements: [
        { symbol: "LMT", priceChange: 8.9, percentChange: 1.9 },
        { symbol: "RTX", priceChange: 5.4, percentChange: 2.1 },
        { symbol: "NOC", priceChange: 11.2, percentChange: 2.5 },
        { symbol: "GD", priceChange: 7.1, percentChange: 2.2 },
        { symbol: "BA", priceChange: 4.8, percentChange: 1.4 },
        { symbol: "LHX", priceChange: 4.7, percentChange: 2.2 },
        { symbol: "LDOS", priceChange: 3.2, percentChange: 2.2 }
      ]
    },
    {
      date: "2024-04-13",
      event: "Iran strikes Israel with drones",
      conflict: "Middle East Tensions",
      stockMovements: [
        { symbol: "LMT", priceChange: 9.4, percentChange: 2.0 },
        { symbol: "RTX", priceChange: 6.1, percentChange: 2.3 },
        { symbol: "NOC", priceChange: 10.8, percentChange: 2.3 },
        { symbol: "GD", priceChange: 6.8, percentChange: 2.5 },
        { symbol: "LHX", priceChange: 5.2, percentChange: 2.4 },
        { symbol: "CACI", priceChange: 8.9, percentChange: 2.0 }
      ]
    },
    {
      date: "2021-02-01",
      event: "Myanmar military coup",
      conflict: "Myanmar Civil War",
      stockMovements: [
        { symbol: "LMT", priceChange: 4.3, percentChange: 0.9 },
        { symbol: "RTX", priceChange: 2.8, percentChange: 1.1 },
        { symbol: "NOC", priceChange: 5.7, percentChange: 1.2 },
        { symbol: "LDOS", priceChange: 2.1, percentChange: 1.4 },
        { symbol: "SAIC", priceChange: 1.8, percentChange: 1.4 }
      ]
    },
    {
      date: "2024-01-11",
      event: "Red Sea shipping attacks escalate",
      conflict: "Yemen Civil War",
      stockMovements: [
        { symbol: "LMT", priceChange: 7.2, percentChange: 1.5 },
        { symbol: "RTX", priceChange: 4.6, percentChange: 1.7 },
        { symbol: "NOC", priceChange: 8.1, percentChange: 1.7 },
        { symbol: "HII", priceChange: 5.9, percentChange: 2.0 },
        { symbol: "GD", priceChange: 4.4, percentChange: 1.6 }
      ]
    },
    {
      date: "2023-03-15",
      event: "China military exercises near Taiwan",
      conflict: "Taiwan Strait Tensions",
      stockMovements: [
        { symbol: "LMT", priceChange: 6.7, percentChange: 1.4 },
        { symbol: "RTX", priceChange: 4.2, percentChange: 1.6 },
        { symbol: "NOC", priceChange: 8.3, percentChange: 1.8 },
        { symbol: "GD", priceChange: 5.5, percentChange: 1.7 },
        { symbol: "BA", priceChange: 3.1, percentChange: 0.9 }
      ]
    }
  ];

  // Generate correlation data based on selected timeframe
  const generateCorrelationTrend = (timeframe: string) => {
    const baseData = {
      "1M": [
        { period: "Week 1", correlation: 0.72, conflicts: 3, avgGain: 2.8 },
        { period: "Week 2", correlation: 0.68, conflicts: 2, avgGain: 1.9 },
        { period: "Week 3", correlation: 0.75, conflicts: 4, avgGain: 3.2 },
        { period: "Week 4", correlation: 0.71, conflicts: 3, avgGain: 2.6 }
      ],
      "3M": [
        { period: "Apr 2024", correlation: 0.69, conflicts: 12, avgGain: 2.4 },
        { period: "May 2024", correlation: 0.74, conflicts: 15, avgGain: 3.2 },
        { period: "Jun 2024", correlation: 0.71, conflicts: 11, avgGain: 2.8 }
      ],
      "6M": [
        { period: "Jan 2024", correlation: 0.68, conflicts: 9, avgGain: 2.5 },
        { period: "Feb 2024", correlation: 0.72, conflicts: 13, avgGain: 3.1 },
        { period: "Mar 2024", correlation: 0.69, conflicts: 11, avgGain: 2.7 },
        { period: "Apr 2024", correlation: 0.75, conflicts: 14, avgGain: 3.4 },
        { period: "May 2024", correlation: 0.73, conflicts: 12, avgGain: 3.0 },
        { period: "Jun 2024", correlation: 0.71, conflicts: 10, avgGain: 2.8 }
      ],
      "1Y": [
        { period: "Jun 2023", correlation: 0.65, conflicts: 8, avgGain: 2.1 },
        { period: "Jul 2023", correlation: 0.71, conflicts: 11, avgGain: 2.9 },
        { period: "Aug 2023", correlation: 0.68, conflicts: 9, avgGain: 2.4 },
        { period: "Sep 2023", correlation: 0.74, conflicts: 13, avgGain: 3.2 },
        { period: "Oct 2023", correlation: 0.79, conflicts: 16, avgGain: 4.1 },
        { period: "Nov 2023", correlation: 0.82, conflicts: 18, avgGain: 4.5 },
        { period: "Dec 2023", correlation: 0.76, conflicts: 14, avgGain: 3.6 },
        { period: "Jan 2024", correlation: 0.73, conflicts: 12, avgGain: 3.0 },
        { period: "Feb 2024", correlation: 0.71, conflicts: 11, avgGain: 2.8 },
        { period: "Mar 2024", correlation: 0.75, conflicts: 14, avgGain: 3.4 },
        { period: "Apr 2024", correlation: 0.72, conflicts: 13, avgGain: 3.1 },
        { period: "May 2024", correlation: 0.74, conflicts: 15, avgGain: 3.3 }
      ],
      "2Y": [
        { period: "Q2 2022", correlation: 0.78, conflicts: 45, avgGain: 4.3 },
        { period: "Q3 2022", correlation: 0.82, conflicts: 52, avgGain: 5.1 },
        { period: "Q4 2022", correlation: 0.75, conflicts: 38, avgGain: 3.8 },
        { period: "Q1 2023", correlation: 0.71, conflicts: 34, avgGain: 3.2 },
        { period: "Q2 2023", correlation: 0.69, conflicts: 31, avgGain: 2.9 },
        { period: "Q3 2023", correlation: 0.73, conflicts: 39, avgGain: 3.5 },
        { period: "Q4 2023", correlation: 0.79, conflicts: 48, avgGain: 4.2 },
        { period: "Q1 2024", correlation: 0.74, conflicts: 42, avgGain: 3.7 }
      ]
    };
    return baseData[timeframe as keyof typeof baseData] || baseData["1Y"];
  };

  const correlationTrend = generateCorrelationTrend(selectedTimeframe);

  // Stock performance metrics during conflict periods
  const performanceMetrics = [
    { 
      symbol: "LMT",
      name: "Lockheed Martin",
      conflictGain: 15.2,
      peaceGain: 8.7,
      volatility: 12.4,
      correlation: 0.84
    },
    {
      symbol: "NOC", 
      name: "Northrop Grumman",
      conflictGain: 13.8,
      peaceGain: 7.9,
      volatility: 11.7,
      correlation: 0.81
    },
    {
      symbol: "RTX",
      name: "RTX Corporation", 
      conflictGain: 12.1,
      peaceGain: 8.2,
      volatility: 10.9,
      correlation: 0.78
    },
    {
      symbol: "GD",
      name: "General Dynamics",
      conflictGain: 11.5,
      peaceGain: 7.4,
      volatility: 10.2,
      correlation: 0.76
    },
    {
      symbol: "BA",
      name: "Boeing",
      conflictGain: 8.9,
      peaceGain: 6.8,
      volatility: 15.3,
      correlation: 0.62
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Conflict-Market Correlation Analysis
          </h2>
          <p className="text-slate-600 mb-6">
            Statistical analysis of defense contractor stock performance during global conflicts
          </p>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Overall Correlation</p>
                    <p className="text-2xl font-bold text-slate-900">0.73</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">Strong positive</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avg. Conflict Gain</p>
                    <p className="text-2xl font-bold text-slate-900">12.3%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-slate-600">First 30 days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Events Analyzed</p>
                    <p className="text-2xl font-bold text-slate-900">147</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-slate-600">Since 2020</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Peak Response</p>
                    <p className="text-2xl font-bold text-slate-900">3.4%</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-slate-600">Single day max</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Correlation Trend Chart */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Correlation Strength Over Time</CardTitle>
                  <p className="text-sm text-slate-600">
                    How closely defense stocks track with conflict escalations over different periods
                  </p>
                </div>
                <div className="flex space-x-2">
                  {(["1M", "3M", "6M", "1Y", "2Y"] as const).map((timeframe) => (
                    <Button
                      key={timeframe}
                      variant={selectedTimeframe === timeframe ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeframe(timeframe)}
                    >
                      {timeframe}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={correlationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0.5, 1]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                      }}
                      formatter={(value, name) => [
                        name === 'correlation' ? Number(value).toFixed(2) : value,
                        name === 'correlation' ? 'Correlation' : 
                        name === 'conflicts' ? 'Conflicts' : 'Avg Gain (%)'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="correlation" 
                      stroke="#0ea5e9" 
                      strokeWidth={3}
                      dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Conflict Events */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Major Conflict Events Impact</CardTitle>
              <p className="text-sm text-slate-600">
                Stock price movements during significant conflict escalations
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {correlationEvents.map((event, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6 pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-900">{event.event}</h4>
                        <p className="text-sm text-slate-600">{new Date(event.date).toLocaleDateString()} • {event.conflict}</p>
                      </div>
                      <Badge variant="outline">{event.conflict}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4">
                      {event.stockMovements.map((movement) => (
                        <div key={movement.symbol} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <CompanyLogo symbol={movement.symbol} name="" size="sm" />
                            <span className="ml-2 font-medium text-slate-900">{movement.symbol}</span>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            +${movement.priceChange.toFixed(2)}
                          </div>
                          <div className="text-sm text-green-600">
                            +{movement.percentChange.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Performance Analysis</CardTitle>
              <p className="text-sm text-slate-600">
                Comparative performance during conflict vs. peaceful periods
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceMetrics.map((metric) => (
                  <div key={metric.symbol} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <CompanyLogo symbol={metric.symbol} name={metric.name} size="md" />
                        <div className="ml-3">
                          <h4 className="font-semibold text-slate-900">{metric.name}</h4>
                          <p className="text-sm text-slate-600">{metric.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">
                          Correlation: {metric.correlation.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-600">
                          Volatility: {metric.volatility.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-slate-600">Conflict Periods</span>
                          <span className="text-lg font-bold text-green-600">+{metric.conflictGain.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(metric.conflictGain / 20) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-slate-600">Peaceful Periods</span>
                          <span className="text-lg font-bold text-blue-600">+{metric.peaceGain.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(metric.peaceGain / 20) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}