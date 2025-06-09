import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp, TrendingDown, BarChart3, Gauge, Calendar } from "lucide-react";
import MultiSectorNavigation from "@/components/multi-sector-navigation";

export default function Trends() {
  const [currentSector] = useState("energy");

  const { data: energyStocks = [] } = useQuery({
    queryKey: ["/api/sectors/energy/stocks"],
  });

  const energyTrends = [
    {
      category: "Renewable Energy Transition",
      timeframe: "2024-2025",
      direction: "up",
      strength: 85,
      description: "Accelerating shift towards solar, wind, and energy storage solutions",
      keyDrivers: ["Government incentives", "Cost competitiveness", "Corporate sustainability goals"],
      affectedCompanies: ["NextEra Energy", "Southern Company", "Exxon Mobil"],
      marketImpact: "+23% sector growth"
    },
    {
      category: "Carbon Capture Technology",
      timeframe: "2024-2026",
      direction: "up",
      strength: 72,
      description: "Growing investment in carbon capture, utilization, and storage (CCUS)",
      keyDrivers: ["Climate regulations", "Tax incentives", "Technology maturity"],
      affectedCompanies: ["Exxon Mobil", "Chevron", "SLB"],
      marketImpact: "+$180B investment pipeline"
    },
    {
      category: "Natural Gas Infrastructure",
      timeframe: "2024-2025",
      direction: "down",
      strength: 45,
      description: "Declining investment in new natural gas pipeline projects",
      keyDrivers: ["Regulatory uncertainty", "ESG pressure", "Alternative energy growth"],
      affectedCompanies: ["Kinder Morgan", "ONEOK", "Phillips 66"],
      marketImpact: "-15% infrastructure spending"
    },
    {
      category: "Electric Vehicle Integration",
      timeframe: "2024-2030",
      direction: "up",
      strength: 78,
      description: "Grid integration challenges and opportunities from EV adoption",
      keyDrivers: ["EV mandates", "Charging infrastructure", "Grid modernization"],
      affectedCompanies: ["NextEra Energy", "Southern Company", "ConocoPhillips"],
      marketImpact: "+$45B grid investment"
    }
  ];

  const priceVolatility = [
    { commodity: "Crude Oil (WTI)", current: "$72.45", change: "+2.3%", volatility: "High", driver: "OPEC+ production cuts" },
    { commodity: "Natural Gas", current: "$2.89", change: "-1.8%", volatility: "Medium", driver: "Mild winter demand" },
    { commodity: "Gasoline", current: "$3.12", change: "+0.9%", volatility: "Medium", driver: "Refinery maintenance" },
    { commodity: "Heating Oil", current: "$2.87", change: "+1.4%", volatility: "Low", driver: "Seasonal demand" }
  ];

  const regulatoryTimeline = [
    { date: "Q1 2025", event: "EPA Methane Emissions Standards", impact: "High", sector: "Oil & Gas Production" },
    { date: "Q2 2025", event: "Renewable Portfolio Standards Updates", impact: "Medium", sector: "Utilities" },
    { date: "Q3 2025", event: "Carbon Border Adjustment Mechanism", impact: "High", sector: "Energy Trading" },
    { date: "Q4 2025", event: "Electric Vehicle Infrastructure Requirements", impact: "Medium", sector: "Utilities" }
  ];

  const getTrendIcon = (direction: string) => {
    return direction === "up" ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100">
      <MultiSectorNavigation currentSector={currentSector} onSectorChange={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Energy Market Trends</h1>
              <p className="text-slate-600">Real-time analysis of energy sector trends, commodity pricing, and regulatory developments</p>
            </div>
            <div className="flex items-center space-x-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">4</div>
                    <div className="text-xs text-muted-foreground">Active Trends</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">72%</div>
                    <div className="text-xs text-muted-foreground">Trend Accuracy</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="sector-trends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sector-trends">Sector Trends</TabsTrigger>
              <TabsTrigger value="commodity-pricing">Commodity Pricing</TabsTrigger>
              <TabsTrigger value="regulatory-timeline">Regulatory Timeline</TabsTrigger>
              <TabsTrigger value="market-analysis">Market Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="sector-trends">
              <div className="space-y-6">
                {energyTrends.map((trend, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Zap className="h-5 w-5 text-orange-600" />
                            <span>{trend.category}</span>
                          </CardTitle>
                          <CardDescription>{trend.timeframe} • {trend.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(trend.direction)}
                          <Badge variant={trend.direction === "up" ? "default" : "destructive"}>
                            {trend.direction === "up" ? "Bullish" : "Bearish"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm font-medium mb-2">Trend Strength</div>
                          <div className="flex items-center space-x-2">
                            <Progress value={trend.strength} className="flex-1" />
                            <span className="text-sm font-medium">{trend.strength}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Market Impact</div>
                          <div className="text-lg font-bold text-orange-600">{trend.marketImpact}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Key Drivers</div>
                        <div className="flex flex-wrap gap-2">
                          {trend.keyDrivers.map((driver, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {driver}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Affected Companies</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {trend.affectedCompanies.map((company, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground p-2 bg-slate-50 rounded">
                              {company}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="commodity-pricing">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Commodity Prices</CardTitle>
                    <CardDescription>Real-time energy commodity pricing and volatility</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {priceVolatility.map((commodity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{commodity.commodity}</div>
                            <div className="text-sm text-muted-foreground">{commodity.driver}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{commodity.current}</div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm ${commodity.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {commodity.change}
                              </span>
                              <Badge className={getVolatilityColor(commodity.volatility)} variant="outline">
                                {commodity.volatility}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Price Movement Indicators</CardTitle>
                    <CardDescription>Technical analysis and price momentum</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold text-green-600">Bullish</div>
                        <div className="text-sm text-muted-foreground">Oil Price Outlook</div>
                        <div className="text-xs text-muted-foreground mt-1">Based on supply constraints</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold text-yellow-600">Neutral</div>
                        <div className="text-sm text-muted-foreground">Natural Gas Outlook</div>
                        <div className="text-xs text-muted-foreground mt-1">Weather-dependent demand</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">Stable</div>
                        <div className="text-sm text-muted-foreground">Renewable Pricing</div>
                        <div className="text-xs text-muted-foreground mt-1">Technology cost reductions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="regulatory-timeline">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>Regulatory Calendar</span>
                  </CardTitle>
                  <CardDescription>Upcoming regulatory changes affecting energy markets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regulatoryTimeline.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.event}</div>
                          <div className="text-sm text-muted-foreground">{item.sector}</div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">{item.date}</Badge>
                          <Badge className={
                            item.impact === 'High' ? 'bg-red-100 text-red-800' :
                            item.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {item.impact} Impact
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market-analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sector Performance</CardTitle>
                    <CardDescription>YTD performance by energy subsector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Renewable Energy</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '78%'}}></div>
                          </div>
                          <span className="text-sm font-medium">+23.4%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Oil & Gas Exploration</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                          </div>
                          <span className="text-sm font-medium">+18.7%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pipeline & Midstream</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{width: '55%'}}></div>
                          </div>
                          <span className="text-sm font-medium">+12.3%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Refining</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{width: '35%'}}></div>
                          </div>
                          <span className="text-sm font-medium">-4.2%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investment Flows</CardTitle>
                    <CardDescription>Capital allocation trends in energy sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-3xl font-bold text-green-600">$1.8T</div>
                        <div className="text-sm text-muted-foreground">Global Energy Investment 2024</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-xl font-bold text-blue-600">65%</div>
                          <div className="text-xs text-muted-foreground">Clean Energy</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <div className="text-xl font-bold text-orange-600">35%</div>
                          <div className="text-xs text-muted-foreground">Fossil Fuels</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}