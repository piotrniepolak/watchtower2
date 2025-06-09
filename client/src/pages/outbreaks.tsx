import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Activity, Globe, TrendingUp, Users, MapPin, Calendar, Pill } from "lucide-react";
import MultiSectorNavigation from "@/components/multi-sector-navigation";

export default function Outbreaks() {
  const [currentSector] = useState("health");

  const { data: healthEvents = [] } = useQuery({
    queryKey: ["/api/sectors/health/events"],
  });

  const { data: healthStocks = [] } = useQuery({
    queryKey: ["/api/sectors/health/stocks"],
  });

  const severityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityProgress = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 100;
      case 'high': return 75;
      case 'medium': return 50;
      case 'low': return 25;
      default: return 0;
    }
  };

  const mockOutbreaks = [
    {
      id: 1,
      name: "COVID-19 Variant JN.1",
      region: "Global",
      country: "Multiple",
      severity: "High",
      cases: 2400000,
      deaths: 12000,
      status: "Active",
      startDate: "2024-12-01",
      affectedStocks: ["PFE", "MRNA", "JNJ"],
      description: "New COVID-19 variant spreading globally with increased transmissibility"
    },
    {
      id: 2,
      name: "Avian Influenza H5N1",
      region: "North America",
      country: "United States",
      severity: "Medium",
      cases: 45000,
      deaths: 890,
      status: "Monitoring",
      startDate: "2024-11-15",
      affectedStocks: ["GILD", "REGN"],
      description: "H5N1 outbreak affecting poultry and some human cases reported"
    },
    {
      id: 3,
      name: "Mpox Outbreak",
      region: "Sub-Saharan Africa",
      country: "Democratic Republic of Congo",
      severity: "Medium",
      cases: 18500,
      deaths: 456,
      status: "Contained",
      startDate: "2024-10-20",
      affectedStocks: ["BAVARIAN", "EMERGENT"],
      description: "Mpox outbreak with improved containment measures in place"
    },
    {
      id: 4,
      name: "Dengue Fever Surge",
      region: "Southeast Asia",
      country: "Philippines",
      severity: "High",
      cases: 156000,
      deaths: 2340,
      status: "Active",
      startDate: "2024-09-10",
      affectedStocks: ["TAKEDA", "SANOFI"],
      description: "Severe dengue outbreak during monsoon season"
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
              <h1 className="text-3xl font-bold text-slate-900">Global Disease Outbreaks</h1>
              <p className="text-slate-600">Real-time monitoring of health emergencies and pharmaceutical market impact</p>
            </div>
            <div className="flex items-center space-x-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold">4</div>
                    <div className="text-xs text-muted-foreground">Active Outbreaks</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">2.6M</div>
                    <div className="text-xs text-muted-foreground">Total Cases</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="outbreaks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="outbreaks">Active Outbreaks</TabsTrigger>
              <TabsTrigger value="surveillance">Disease Surveillance</TabsTrigger>
              <TabsTrigger value="pharma-impact">Pharma Impact</TabsTrigger>
              <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="outbreaks">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockOutbreaks.map((outbreak) => (
                  <Card key={outbreak.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-green-600" />
                            <span>{outbreak.name}</span>
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{outbreak.region} - {outbreak.country}</span>
                          </CardDescription>
                        </div>
                        <Badge variant={severityColor(outbreak.severity) as any}>
                          {outbreak.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{outbreak.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium">Total Cases</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {outbreak.cases.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Deaths</div>
                          <div className="text-2xl font-bold text-red-600">
                            {outbreak.deaths.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Severity Level</span>
                          <span>{outbreak.severity}</span>
                        </div>
                        <Progress value={getSeverityProgress(outbreak.severity)} className="h-2" />
                      </div>

                      <Separator />

                      <div>
                        <div className="text-sm font-medium mb-2">Affected Pharmaceutical Stocks</div>
                        <div className="flex flex-wrap gap-2">
                          {outbreak.affectedStocks.map((stock) => (
                            <Badge key={stock} variant="outline" className="text-xs">
                              {stock}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Started: {outbreak.startDate}</span>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          outbreak.status === 'Active' ? 'border-red-200 text-red-700' :
                          outbreak.status === 'Monitoring' ? 'border-yellow-200 text-yellow-700' :
                          'border-green-200 text-green-700'
                        }`}>
                          {outbreak.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="surveillance">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>Global Surveillance Network</span>
                    </CardTitle>
                    <CardDescription>WHO and CDC monitoring systems</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">WHO GOARN Network</span>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">CDC Global Health Security</span>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">ECDC Epidemic Intelligence</span>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">ProMED-mail</span>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>Risk Assessment</span>
                    </CardTitle>
                    <CardDescription>Current global health risk levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Pandemic Preparedness</span>
                          <span>Medium</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Vaccine Readiness</span>
                          <span>High</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Supply Chain Resilience</span>
                          <span>Medium</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pharma-impact">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Pill className="h-5 w-5 text-green-600" />
                      <span>Top Performing Pharma Stocks</span>
                    </CardTitle>
                    <CardDescription>Stocks benefiting from health events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {healthStocks.slice(0, 5).map((stock: any, index: number) => (
                        <div key={stock.symbol || index} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{stock.symbol || 'PFE'}</div>
                            <div className="text-sm text-muted-foreground">{stock.name || 'Pfizer Inc.'}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${stock.price || '45.67'}</div>
                            <div className={`text-sm ${(stock.change || 2.3) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(stock.change || 2.3) >= 0 ? '+' : ''}{(stock.changePercent || 5.2).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Correlation Analysis</CardTitle>
                    <CardDescription>Correlation between outbreaks and stock performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Vaccine Manufacturers</span>
                        <Badge variant="outline" className="text-green-600">+0.78 correlation</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Antiviral Drug Companies</span>
                        <Badge variant="outline" className="text-green-600">+0.65 correlation</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Diagnostic Companies</span>
                        <Badge variant="outline" className="text-green-600">+0.72 correlation</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">PPE Manufacturers</span>
                        <Badge variant="outline" className="text-green-600">+0.58 correlation</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="regional">
              <Card>
                <CardHeader>
                  <CardTitle>Regional Outbreak Distribution</CardTitle>
                  <CardDescription>Geographic spread of current health emergencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">2</div>
                      <div className="text-sm text-muted-foreground">North America</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">1</div>
                      <div className="text-sm text-muted-foreground">Europe</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">3</div>
                      <div className="text-sm text-muted-foreground">Asia-Pacific</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">2</div>
                      <div className="text-sm text-muted-foreground">Africa</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}