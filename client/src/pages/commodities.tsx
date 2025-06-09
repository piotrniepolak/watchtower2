import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Zap, BarChart3, DollarSign, Globe, Fuel, Gauge } from "lucide-react";
import MultiSectorNavigation from "@/components/multi-sector-navigation";

export default function Commodities() {
  const [currentSector] = useState("energy");

  const { data: energyStocks = [] } = useQuery({
    queryKey: ["/api/sectors/energy/stocks"],
  });

  const commodityData = [
    {
      name: "Crude Oil (WTI)",
      symbol: "CL",
      price: 78.45,
      change: 1.23,
      changePercent: 1.59,
      volume: "567K",
      high52w: 95.03,
      low52w: 64.78,
      marketCap: "-",
      unit: "$/barrel"
    },
    {
      name: "Brent Crude Oil",
      symbol: "BZ",
      price: 82.67,
      change: 0.89,
      changePercent: 1.09,
      volume: "423K",
      high52w: 98.15,
      low52w: 69.45,
      marketCap: "-",
      unit: "$/barrel"
    },
    {
      name: "Natural Gas",
      symbol: "NG",
      price: 2.84,
      change: -0.12,
      changePercent: -4.05,
      volume: "892K",
      high52w: 4.52,
      low52w: 1.98,
      marketCap: "-",
      unit: "$/MMBtu"
    },
    {
      name: "Heating Oil",
      symbol: "HO",
      price: 2.45,
      change: 0.03,
      changePercent: 1.24,
      volume: "156K",
      high52w: 3.21,
      low52w: 2.12,
      marketCap: "-",
      unit: "$/gallon"
    },
    {
      name: "Gasoline (RBOB)",
      symbol: "RB",
      price: 2.31,
      change: 0.02,
      changePercent: 0.87,
      volume: "234K",
      high52w: 2.89,
      low52w: 1.95,
      marketCap: "-",
      unit: "$/gallon"
    },
    {
      name: "Propane",
      symbol: "PN",
      price: 0.85,
      change: -0.01,
      changePercent: -1.16,
      volume: "45K",
      high52w: 1.24,
      low52w: 0.72,
      marketCap: "-",
      unit: "$/gallon"
    }
  ];

  const energyCompanies = [
    {
      symbol: "XOM",
      name: "Exxon Mobil Corporation",
      price: 118.45,
      change: 2.34,
      changePercent: 2.02,
      volume: 12500000,
      marketCap: "483.2B",
      sector: "Oil & Gas",
      revenue: "365.8B",
      operations: "Global Oil & Gas"
    },
    {
      symbol: "CVX",
      name: "Chevron Corporation",
      price: 154.67,
      change: 1.89,
      changePercent: 1.24,
      volume: 8900000,
      marketCap: "298.7B",
      sector: "Oil & Gas",
      revenue: "200.5B",
      operations: "Integrated Oil & Gas"
    },
    {
      symbol: "COP",
      name: "ConocoPhillips",
      price: 112.34,
      change: 3.45,
      changePercent: 3.17,
      volume: 7600000,
      marketCap: "142.8B",
      sector: "Oil & Gas",
      revenue: "54.4B",
      operations: "E&P Operations"
    },
    {
      symbol: "SLB",
      name: "SLB (Schlumberger)",
      price: 45.78,
      change: 0.89,
      changePercent: 1.98,
      volume: 15600000,
      marketCap: "65.2B",
      sector: "Oilfield Services",
      revenue: "28.1B",
      operations: "Oilfield Technology"
    }
  ];

  const marketIndicators = [
    {
      name: "Oil Volatility Index",
      value: 28.5,
      change: 2.1,
      status: "Elevated"
    },
    {
      name: "Refining Margin",
      value: 15.2,
      change: -1.8,
      status: "Normal"
    },
    {
      name: "Storage Utilization",
      value: 67.8,
      change: 0.5,
      status: "Normal"
    },
    {
      name: "Drilling Activity",
      value: 742,
      change: 12,
      status: "Increasing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-100">
      <MultiSectorNavigation currentSector={currentSector} onSectorChange={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Energy Commodities</h1>
              <p className="text-slate-600">Real-time oil, gas, and energy commodity prices with market analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Fuel className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">$78.45</div>
                    <div className="text-xs text-muted-foreground">WTI Crude</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">$2.84</div>
                    <div className="text-xs text-muted-foreground">Natural Gas</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="commodities" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="commodities">Commodity Prices</TabsTrigger>
              <TabsTrigger value="companies">Energy Companies</TabsTrigger>
              <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
              <TabsTrigger value="indicators">Market Indicators</TabsTrigger>
            </TabsList>

            <TabsContent value="commodities">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {commodityData.map((commodity) => (
                  <Card key={commodity.symbol} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Zap className="h-5 w-5 text-orange-600" />
                            <span>{commodity.symbol}</span>
                          </CardTitle>
                          <CardDescription>{commodity.name}</CardDescription>
                        </div>
                        <Badge variant="outline">{commodity.unit}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">${commodity.price}</div>
                        <div className={`flex items-center space-x-1 ${commodity.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {commodity.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span className="font-medium">
                            {commodity.change >= 0 ? '+' : ''}{commodity.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Volume</div>
                          <div className="font-medium">{commodity.volume}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Change</div>
                          <div className={`font-medium ${commodity.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {commodity.change >= 0 ? '+' : ''}{commodity.change}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">52W High</div>
                          <div className="font-medium">${commodity.high52w}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">52W Low</div>
                          <div className="font-medium">${commodity.low52w}</div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="text-sm text-muted-foreground">Price Range</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{
                              width: `${((commodity.price - commodity.low52w) / (commodity.high52w - commodity.low52w)) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="companies">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {energyCompanies.map((company) => (
                  <Card key={company.symbol} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Fuel className="h-5 w-5 text-orange-600" />
                            <span>{company.symbol}</span>
                          </CardTitle>
                          <CardDescription>{company.name}</CardDescription>
                        </div>
                        <Badge variant="outline">{company.sector}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">${company.price}</div>
                        <div className={`flex items-center space-x-1 ${company.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {company.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span className="font-medium">
                            {company.change >= 0 ? '+' : ''}{company.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Market Cap</div>
                          <div className="font-medium">{company.marketCap}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Volume</div>
                          <div className="font-medium">{(company.volume / 1000000).toFixed(1)}M</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Revenue</div>
                          <div className="font-medium">{company.revenue}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Operations</div>
                          <div className="font-medium">{company.operations}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                      <span>Oil Market Fundamentals</span>
                    </CardTitle>
                    <CardDescription>Key supply and demand factors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Global Oil Demand</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '78%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-green-600">102.1M bpd</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">OPEC+ Production</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{width: '65%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-orange-600">42.8M bpd</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">US Shale Production</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '72%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-blue-600">13.2M bpd</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Strategic Reserves</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-red-600">351M barrels</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <span>Regional Price Differentials</span>
                    </CardTitle>
                    <CardDescription>Price spreads across major oil benchmarks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Brent-WTI Spread</span>
                        <Badge variant="outline" className="text-green-600">$4.22</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Dubai-Brent Spread</span>
                        <Badge variant="outline" className="text-blue-600">-$1.15</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">WTI-Maya Spread</span>
                        <Badge variant="outline" className="text-orange-600">$8.45</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Henry Hub-NBP Spread</span>
                        <Badge variant="outline" className="text-red-600">$6.78</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="indicators">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {marketIndicators.map((indicator, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-sm">{indicator.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">{indicator.value}</div>
                        <div className={`flex items-center space-x-1 text-sm ${indicator.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {indicator.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{indicator.change >= 0 ? '+' : ''}{indicator.change}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {indicator.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}