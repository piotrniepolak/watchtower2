import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, Pill, DollarSign, BarChart3, Target, Award } from "lucide-react";
import MultiSectorNavigation from "@/components/multi-sector-navigation";

export default function Pharma() {
  const [currentSector] = useState("health");

  const { data: healthStocks = [] } = useQuery({
    queryKey: ["/api/sectors/health/stocks"],
  });

  // Type the pharmaceutical stocks data
  interface PharmStock {
    id: number;
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap?: string;
    lastUpdated?: string;
    sector: string;
  }

  const typedHealthStocks = healthStocks as PharmStock[];

  // Enhanced pharmaceutical data with industry insights
  const getPharmaSectorCategory = (symbol: string) => {
    const categories: { [key: string]: string } = {
      'JNJ': 'Large Cap Pharma',
      'PFE': 'Large Cap Pharma', 
      'MRK': 'Large Cap Pharma',
      'ABBV': 'Large Cap Pharma',
      'LLY': 'Large Cap Pharma',
      'NVS': 'Large Cap Pharma',
      'RHHBY': 'Large Cap Pharma',
      'SNY': 'Large Cap Pharma',
      'AZN': 'Large Cap Pharma',
      'GSK': 'Large Cap Pharma',
      'NVO': 'Large Cap Pharma',
      'BAYRY': 'Large Cap Pharma',
      'MRNA': 'Biotechnology',
      'BNTX': 'Biotechnology',
      'REGN': 'Biotechnology',
      'GILD': 'Biotechnology',
      'BIIB': 'Biotechnology',
      'VRTX': 'Biotechnology',
      'AMGN': 'Biotechnology',
      'RARE': 'Biotechnology',
      'SLDB': 'Biotechnology',
      'STOK': 'Biotechnology',
      'NUVB': 'Biotechnology',
      'NVAX': 'Vaccine Specialists'
    };
    return categories[symbol] || 'Biotechnology';
  };

  const getEstimatedPipeline = (symbol: string) => {
    const pipelines: { [key: string]: number } = {
      'JNJ': 114, 'PFE': 89, 'MRK': 95, 'ABBV': 78, 'LLY': 82,
      'NVS': 145, 'RHHBY': 134, 'SNY': 98, 'AZN': 156, 'GSK': 72,
      'NVO': 45, 'BAYRY': 87, 'MRNA': 48, 'BNTX': 35, 'REGN': 35,
      'GILD': 42, 'BIIB': 38, 'VRTX': 28, 'AMGN': 61, 'RARE': 15,
      'SLDB': 8, 'STOK': 12, 'NUVB': 18, 'NVAX': 25
    };
    return pipelines[symbol] || Math.floor(Math.random() * 30) + 10;
  };

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
                    <div className="text-2xl font-bold">{typedHealthStocks.length}</div>
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
                {typedHealthStocks.map((stock) => (
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
                        <Badge variant="outline">{getPharmaSectorCategory(stock.symbol)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">${stock.price.toFixed(2)}</div>
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
                          <div className="font-medium">{stock.marketCap || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Volume</div>
                          <div className="font-medium">{stock.volume ? (stock.volume / 1000000).toFixed(1) + 'M' : 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Pipeline</div>
                          <div className="font-medium">{getEstimatedPipeline(stock.symbol)} drugs</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Sector</div>
                          <div className="font-medium">{getPharmaSectorCategory(stock.symbol)}</div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="text-sm font-medium text-blue-600">
                          {stock.lastUpdated ? new Date(stock.lastUpdated).toLocaleTimeString() : 'Real-time'}
                        </div>
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