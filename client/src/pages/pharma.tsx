import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, Pill, DollarSign, BarChart3, Target, Award } from "lucide-react";
import MultiSectorNavigation from "@/components/multi-sector-navigation";
import WorldHealthMap from "@/components/world-health-map";

export default function Pharma() {
  const [currentSector] = useState("health");

  const { data: healthStocks = [] } = useQuery({
    queryKey: ["/api/sectors/health/stocks"],
  });

  const mockPharmaData = [
    {
      symbol: "PFE",
      name: "Pfizer Inc.",
      price: 45.67,
      change: 2.34,
      changePercent: 5.4,
      volume: 15600000,
      marketCap: "258.2B",
      sector: "Pharmaceuticals",
      pipeline: 89,
      revenue: "81.3B",
      rd_spending: "11.4B"
    },
    {
      symbol: "JNJ",
      name: "Johnson & Johnson",
      price: 162.45,
      change: -1.23,
      changePercent: -0.75,
      volume: 8900000,
      marketCap: "425.8B",
      sector: "Pharmaceuticals",
      pipeline: 114,
      revenue: "94.9B",
      rd_spending: "14.7B"
    },
    {
      symbol: "MRNA",
      name: "Moderna Inc.",
      price: 89.12,
      change: 4.56,
      changePercent: 5.4,
      volume: 12300000,
      marketCap: "33.2B",
      sector: "Biotechnology",
      pipeline: 48,
      revenue: "18.4B",
      rd_spending: "4.2B"
    },
    {
      symbol: "GILD",
      name: "Gilead Sciences",
      price: 78.90,
      change: 1.45,
      changePercent: 1.87,
      volume: 6700000,
      marketCap: "98.7B",
      sector: "Biotechnology",
      pipeline: 42,
      revenue: "27.1B",
      rd_spending: "5.9B"
    },
    {
      symbol: "REGN",
      name: "Regeneron Pharmaceuticals",
      price: 756.23,
      change: 8.90,
      changePercent: 1.19,
      volume: 890000,
      marketCap: "82.4B",
      sector: "Biotechnology",
      pipeline: 35,
      revenue: "16.1B",
      rd_spending: "3.8B"
    }
  ];

  const researchPipeline = [
    {
      company: "Pfizer",
      drug: "PF-07321332",
      indication: "COVID-19 Treatment",
      phase: "Phase III",
      status: "Completed",
      marketPotential: "$15B"
    },
    {
      company: "Moderna",
      drug: "mRNA-1273.214",
      indication: "COVID-19 Booster",
      phase: "Phase III",
      status: "Active",
      marketPotential: "$8B"
    },
    {
      company: "Johnson & Johnson",
      drug: "JNJ-4528",
      indication: "Multiple Myeloma",
      phase: "Phase II",
      status: "Active",
      marketPotential: "$3.2B"
    },
    {
      company: "Gilead",
      drug: "GS-6207",
      indication: "HIV Treatment",
      phase: "Phase III",
      status: "Active",
      marketPotential: "$4.5B"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-100">
      <MultiSectorNavigation currentSector={currentSector} onSectorChange={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Pharmaceutical Markets</h1>
              <p className="text-slate-600">Real-time pharmaceutical stock analysis and research pipeline tracking</p>
            </div>
            <div className="flex items-center space-x-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">10</div>
                    <div className="text-xs text-muted-foreground">Tracked Companies</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">$1.2T</div>
                    <div className="text-xs text-muted-foreground">Market Cap</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="stocks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stocks">Stock Performance</TabsTrigger>
              <TabsTrigger value="pipeline">R&D Pipeline</TabsTrigger>
              <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
              <TabsTrigger value="correlations">Event Correlations</TabsTrigger>
            </TabsList>

            <TabsContent value="stocks">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockPharmaData.map((stock) => (
                  <Card key={stock.symbol} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Pill className="h-5 w-5 text-green-600" />
                            <span>{stock.symbol}</span>
                          </CardTitle>
                          <CardDescription>{stock.name}</CardDescription>
                        </div>
                        <Badge variant="outline">{stock.sector}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">${stock.price}</div>
                        <div className={`flex items-center space-x-1 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span className="font-medium">
                            {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Market Cap</div>
                          <div className="font-medium">{stock.marketCap}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Volume</div>
                          <div className="font-medium">{(stock.volume / 1000000).toFixed(1)}M</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Pipeline</div>
                          <div className="font-medium">{stock.pipeline} drugs</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">R&D Spend</div>
                          <div className="font-medium">{stock.rd_spending}</div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="text-sm text-muted-foreground">Annual Revenue</div>
                        <div className="text-lg font-bold text-blue-600">{stock.revenue}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pipeline">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span>Active Research Pipeline</span>
                    </CardTitle>
                    <CardDescription>Late-stage drug development programs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {researchPipeline.map((drug, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-semibold text-lg">{drug.drug}</div>
                              <div className="text-sm text-muted-foreground">{drug.company}</div>
                            </div>
                            <div className="text-right">
                              <Badge variant={drug.status === 'Completed' ? 'default' : 'secondary'}>
                                {drug.phase}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm font-medium">Indication</div>
                              <div className="text-sm text-muted-foreground">{drug.indication}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Status</div>
                              <div className={`text-sm ${drug.status === 'Completed' ? 'text-green-600' : 'text-blue-600'}`}>
                                {drug.status}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Market Potential</div>
                              <div className="text-sm font-bold text-green-600">{drug.marketPotential}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span>Sector Performance</span>
                    </CardTitle>
                    <CardDescription>Year-to-date performance by pharmaceutical subsector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Large Cap Pharma</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '68%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-green-600">+12.4%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Biotech</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-blue-600">+8.7%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vaccine Specialists</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-orange-600">+18.2%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Generic Drugs</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{width: '25%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-red-600">-3.2%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span>Key Market Drivers</span>
                    </CardTitle>
                    <CardDescription>Factors influencing pharmaceutical markets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Aging Population</span>
                        <Badge variant="outline" className="text-green-600">Positive</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Drug Price Regulations</span>
                        <Badge variant="outline" className="text-red-600">Negative</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AI Drug Discovery</span>
                        <Badge variant="outline" className="text-green-600">Positive</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Patent Expirations</span>
                        <Badge variant="outline" className="text-red-600">Negative</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pandemic Preparedness</span>
                        <Badge variant="outline" className="text-green-600">Positive</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Biosimilar Competition</span>
                        <Badge variant="outline" className="text-yellow-600">Mixed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="correlations">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span>Disease Outbreak Correlations</span>
                    </CardTitle>
                    <CardDescription>Stock performance correlation with health events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">COVID-19 Variants</span>
                        <Badge variant="outline" className="text-green-600">+0.78 correlation</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Influenza Outbreaks</span>
                        <Badge variant="outline" className="text-green-600">+0.65 correlation</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mpox Cases</span>
                        <Badge variant="outline" className="text-blue-600">+0.42 correlation</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Dengue Fever</span>
                        <Badge variant="outline" className="text-green-600">+0.58 correlation</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Regulatory Impact</CardTitle>
                    <CardDescription>FDA approvals and regulatory decisions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Drug Approvals</span>
                        <Badge variant="outline" className="text-green-600">+0.85 correlation</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Clinical Trial Results</span>
                        <Badge variant="outline" className="text-green-600">+0.72 correlation</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Safety Warnings</span>
                        <Badge variant="outline" className="text-red-600">-0.68 correlation</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Price Regulations</span>
                        <Badge variant="outline" className="text-red-600">-0.45 correlation</Badge>
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