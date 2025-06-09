import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, BarChart3, DollarSign, Target, PieChart, Activity } from "lucide-react";
import MultiSectorNavigation from "@/components/multi-sector-navigation";

export default function MarketAnalysis() {
  const [currentSector, setCurrentSector] = useState("energy");

  const sectorAnalysis = {
    energy: {
      icon: "⚡",
      marketSize: "$6.8T",
      growth: "+4.2%",
      outlook: "Positive",
      keyMetrics: [
        { name: "Oil Price (WTI)", value: "$72.45", change: "+2.3%" },
        { name: "Natural Gas", value: "$2.89", change: "-1.8%" },
        { name: "Renewable Capacity", value: "3,064 GW", change: "+12.4%" },
        { name: "Global Investment", value: "$1.8T", change: "+8.1%" }
      ],
      topPerformers: [
        { symbol: "NEE", name: "NextEra Energy", performance: "+28.5%" },
        { symbol: "XOM", name: "Exxon Mobil", performance: "+19.2%" },
        { symbol: "CVX", name: "Chevron", performance: "+15.7%" }
      ],
      riskFactors: [
        "Regulatory uncertainty in carbon pricing",
        "Geopolitical tensions affecting supply chains",
        "Technology transition costs",
        "Weather dependency for renewables"
      ]
    },
    health: {
      icon: "💊",
      marketSize: "$1.8T",
      growth: "+6.1%",
      outlook: "Strong",
      keyMetrics: [
        { name: "R&D Investment", value: "$240B", change: "+7.8%" },
        { name: "Drug Approvals", value: "127", change: "+15.2%" },
        { name: "Patent Expirations", value: "$89B", change: "-12.1%" },
        { name: "M&A Activity", value: "$156B", change: "+23.4%" }
      ],
      topPerformers: [
        { symbol: "MRNA", name: "Moderna", performance: "+156.8%" },
        { symbol: "PFE", name: "Pfizer", performance: "+23.4%" },
        { symbol: "JNJ", name: "Johnson & Johnson", performance: "+12.7%" }
      ],
      riskFactors: [
        "Drug pricing pressure from regulators",
        "Patent cliff challenges",
        "Clinical trial failure rates",
        "Healthcare policy changes"
      ]
    }
  };

  const analysis = sectorAnalysis[currentSector as keyof typeof sectorAnalysis];

  const marketForces = [
    {
      category: "Supply & Demand",
      strength: 78,
      direction: "Bullish",
      description: currentSector === "energy" ? 
        "OPEC+ production cuts supporting oil prices while renewable demand accelerates" :
        "Aging population driving pharmaceutical demand while biosimilar competition intensifies"
    },
    {
      category: "Regulatory Environment",
      strength: 65,
      direction: "Mixed",
      description: currentSector === "energy" ? 
        "Carbon regulations creating transition pressure but also investment opportunities" :
        "FDA accelerated approvals offset by drug pricing reform initiatives"
    },
    {
      category: "Technology Innovation",
      strength: 89,
      direction: "Bullish",
      description: currentSector === "energy" ? 
        "Breakthrough in battery storage and carbon capture technologies" :
        "AI-driven drug discovery and personalized medicine advancing rapidly"
    },
    {
      category: "Investment Flows",
      strength: 72,
      direction: "Bullish",
      description: currentSector === "energy" ? 
        "ESG mandates driving capital towards clean energy infrastructure" :
        "Venture capital and private equity increasing biotech investments"
    }
  ];

  const valuationMetrics = currentSector === "energy" ? [
    { metric: "P/E Ratio", sector: "14.2x", benchmark: "18.5x", status: "Undervalued" },
    { metric: "EV/EBITDA", sector: "8.1x", benchmark: "11.3x", status: "Attractive" },
    { metric: "Price/Book", sector: "1.8x", benchmark: "2.4x", status: "Undervalued" },
    { metric: "Dividend Yield", sector: "5.2%", benchmark: "2.1%", status: "Premium" }
  ] : [
    { metric: "P/E Ratio", sector: "24.6x", benchmark: "18.5x", status: "Premium" },
    { metric: "EV/Sales", sector: "6.8x", benchmark: "4.2x", status: "Expensive" },
    { metric: "PEG Ratio", sector: "1.8x", benchmark: "2.0x", status: "Fair" },
    { metric: "Price/Book", sector: "4.2x", benchmark: "2.4x", status: "Premium" }
  ];

  return (
    <div className={`min-h-screen ${currentSector === "energy" ? 
      "bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100" : 
      "bg-gradient-to-br from-slate-50 via-green-50 to-teal-100"}`}>
      <MultiSectorNavigation currentSector={currentSector} onSectorChange={setCurrentSector} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-2">
                <span>{analysis.icon}</span>
                <span>Market Analysis</span>
              </h1>
              <p className="text-slate-600">
                {currentSector === "energy" ? 
                  "Comprehensive analysis of energy sector market dynamics and investment opportunities" :
                  "Deep dive into pharmaceutical market trends and healthcare investment landscape"
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className={`h-5 w-5 ${currentSector === "energy" ? "text-orange-500" : "text-green-500"}`} />
                  <div>
                    <div className="text-2xl font-bold">{analysis.marketSize}</div>
                    <div className="text-xs text-muted-foreground">Market Size</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{analysis.growth}</div>
                    <div className="text-xs text-muted-foreground">YoY Growth</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Market Overview</TabsTrigger>
              <TabsTrigger value="valuation">Valuation Analysis</TabsTrigger>
              <TabsTrigger value="forces">Market Forces</TabsTrigger>
              <TabsTrigger value="forecast">Forecast & Outlook</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className={`h-5 w-5 ${currentSector === "energy" ? "text-orange-600" : "text-green-600"}`} />
                      <span>Key Market Metrics</span>
                    </CardTitle>
                    <CardDescription>
                      Current performance indicators for {currentSector === "energy" ? "energy" : "healthcare"} sector
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.keyMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{metric.name}</div>
                            <div className="text-2xl font-bold">{metric.value}</div>
                          </div>
                          <Badge variant={metric.change.startsWith('+') ? "default" : "destructive"}>
                            {metric.change}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span>Top Performers</span>
                    </CardTitle>
                    <CardDescription>Leading companies driving sector performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.topPerformers.map((performer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <div className="font-medium">{performer.symbol}</div>
                            <div className="text-sm text-muted-foreground">{performer.name}</div>
                          </div>
                          <div className="text-lg font-bold text-green-600">{performer.performance}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-red-600" />
                      <span>Risk Assessment</span>
                    </CardTitle>
                    <CardDescription>Key risk factors impacting sector outlook</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investment Outlook</CardTitle>
                    <CardDescription>Overall sector investment recommendation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className={`text-4xl font-bold ${
                        analysis.outlook === "Strong" ? "text-green-600" :
                        analysis.outlook === "Positive" ? "text-blue-600" :
                        "text-yellow-600"
                      }`}>
                        {analysis.outlook}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {currentSector === "energy" ? 
                          "Energy transition creating both challenges and opportunities" :
                          "Healthcare innovation driving long-term growth potential"
                        }
                      </div>
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {currentSector === "energy" ? "MODERATE BUY" : "STRONG BUY"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="valuation">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className={`h-5 w-5 ${currentSector === "energy" ? "text-orange-600" : "text-green-600"}`} />
                      <span>Valuation Metrics</span>
                    </CardTitle>
                    <CardDescription>Sector valuation compared to market benchmarks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {valuationMetrics.map((metric, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="text-sm font-medium text-muted-foreground">{metric.metric}</div>
                          <div className="text-2xl font-bold">{metric.sector}</div>
                          <div className="text-sm text-muted-foreground">vs {metric.benchmark}</div>
                          <Badge className={`mt-2 ${
                            metric.status === "Undervalued" || metric.status === "Attractive" || metric.status === "Premium" && currentSector === "energy" ? 
                            "bg-green-100 text-green-800" :
                            metric.status === "Fair" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {metric.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sector Comparison</CardTitle>
                      <CardDescription>Performance vs other major sectors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{currentSector === "energy" ? "Energy" : "Healthcare"}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className={`${currentSector === "energy" ? "bg-orange-600" : "bg-green-600"} h-2 rounded-full`} 
                                   style={{width: currentSector === "energy" ? '65%' : '82%'}}></div>
                            </div>
                            <span className="text-sm font-medium">{currentSector === "energy" ? "+18.7%" : "+24.3%"}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Technology</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                            </div>
                            <span className="text-sm font-medium">+12.1%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Financial Services</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{width: '38%'}}></div>
                            </div>
                            <span className="text-sm font-medium">+8.9%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Consumer Goods</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div className="bg-indigo-600 h-2 rounded-full" style={{width: '25%'}}></div>
                            </div>
                            <span className="text-sm font-medium">+3.2%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Price Targets</CardTitle>
                      <CardDescription>Analyst consensus price targets</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {currentSector === "energy" ? "$78.50" : "$145.20"}
                          </div>
                          <div className="text-sm text-muted-foreground">12-Month Target</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {currentSector === "energy" ? "+8.4% upside" : "+12.7% upside"}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 border rounded">
                            <div className="font-bold text-green-600">
                              {currentSector === "energy" ? "$85.20" : "$158.90"}
                            </div>
                            <div className="text-xs text-muted-foreground">Bull Case</div>
                          </div>
                          <div className="p-2 border rounded">
                            <div className="font-bold">
                              {currentSector === "energy" ? "$78.50" : "$145.20"}
                            </div>
                            <div className="text-xs text-muted-foreground">Base Case</div>
                          </div>
                          <div className="p-2 border rounded">
                            <div className="font-bold text-red-600">
                              {currentSector === "energy" ? "$68.30" : "$125.40"}
                            </div>
                            <div className="text-xs text-muted-foreground">Bear Case</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forces">
              <div className="space-y-6">
                {marketForces.map((force, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{force.category}</CardTitle>
                        <Badge variant={force.direction === "Bullish" ? "default" : 
                                      force.direction === "Mixed" ? "secondary" : "destructive"}>
                          {force.direction}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Impact Strength</span>
                          <span>{force.strength}%</span>
                        </div>
                        <Progress value={force.strength} className="h-2" />
                      </div>
                      <p className="text-sm text-muted-foreground">{force.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="forecast">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>12-Month Outlook</CardTitle>
                    <CardDescription>
                      {currentSector === "energy" ? "Energy sector" : "Healthcare sector"} forecast and key catalysts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className={`text-3xl font-bold ${
                          currentSector === "energy" ? "text-orange-600" : "text-green-600"
                        }`}>
                          {currentSector === "energy" ? "Cautiously Optimistic" : "Strongly Positive"}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          {currentSector === "energy" ? 
                            "Energy transition creating selective opportunities" :
                            "Innovation pipeline driving sustained growth"
                          }
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-medium text-sm">Key Catalysts:</div>
                        {currentSector === "energy" ? [
                          "OPEC+ production discipline",
                          "Renewable energy adoption acceleration",
                          "Carbon pricing implementation",
                          "Energy storage breakthroughs"
                        ] : [
                          "FDA approval accelerations",
                          "AI-driven drug discovery",
                          "Aging population demographics",
                          "Personalized medicine adoption"
                        ].map((catalyst, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <span className="text-sm text-muted-foreground">{catalyst}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investment Strategy</CardTitle>
                    <CardDescription>Recommended approach for sector allocation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 border rounded-lg">
                          <div className="font-bold text-green-600">
                            {currentSector === "energy" ? "15%" : "25%"}
                          </div>
                          <div className="text-xs text-muted-foreground">Recommended Allocation</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-bold text-blue-600">
                            {currentSector === "energy" ? "3-5 years" : "5-10 years"}
                          </div>
                          <div className="text-xs text-muted-foreground">Time Horizon</div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="font-bold text-purple-600">
                            {currentSector === "energy" ? "Medium" : "Medium-High"}
                          </div>
                          <div className="text-xs text-muted-foreground">Risk Level</div>
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-sm mb-2">Strategy Focus:</div>
                        <div className="text-sm text-muted-foreground">
                          {currentSector === "energy" ? 
                            "Focus on energy transition leaders and established players with strong ESG commitments. Diversify across renewable energy, traditional energy, and energy infrastructure." :
                            "Prioritize large pharma with strong pipelines, biotech with late-stage assets, and healthcare technology companies. Focus on companies with pricing power and innovation capabilities."
                          }
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