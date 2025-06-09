import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Zap, FileText, Globe, Building, Calendar, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import MultiSectorNavigation from "@/components/multi-sector-navigation";

export default function Regulations() {
  const [currentSector] = useState("energy");

  const { data: energyEvents = [] } = useQuery({
    queryKey: ["/api/sectors/energy/events"],
  });

  const { data: energyStocks = [] } = useQuery({
    queryKey: ["/api/sectors/energy/stocks"],
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getImpactProgress = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 75;
      case 'medium': return 50;
      case 'low': return 25;
      default: return 0;
    }
  };

  const mockRegulations = [
    {
      id: 1,
      title: "EU Carbon Border Adjustment Mechanism (CBAM)",
      region: "European Union",
      regulator: "European Commission",
      type: "Carbon Tax",
      status: "Active",
      effectiveDate: "2024-10-01",
      impact: "High",
      description: "Carbon tariffs on imports of carbon-intensive goods including oil and gas products",
      affectedCompanies: ["Shell", "BP", "TotalEnergies", "Equinor"],
      complianceCost: "$2.1B",
      sector: "Oil & Gas"
    },
    {
      id: 2,
      title: "US Offshore Wind Development Regulations",
      region: "United States",
      regulator: "Bureau of Ocean Energy Management",
      type: "Environmental",
      status: "Pending",
      effectiveDate: "2025-01-15",
      impact: "Medium",
      description: "New environmental assessment requirements for offshore wind projects",
      affectedCompanies: ["Orsted", "Equinor", "RWE", "Avangrid"],
      complianceCost: "$850M",
      sector: "Renewable Energy"
    },
    {
      id: 3,
      title: "Canada Oil Sands Emission Standards",
      region: "Canada",
      regulator: "Environment and Climate Change Canada",
      type: "Emission Standards",
      status: "Draft",
      effectiveDate: "2025-06-01",
      impact: "High",
      description: "Stricter emission limits for oil sands operations",
      affectedCompanies: ["Suncor Energy", "Canadian Natural", "Imperial Oil"],
      complianceCost: "$1.3B",
      sector: "Oil Sands"
    },
    {
      id: 4,
      title: "UK North Sea Decommissioning Fund",
      region: "United Kingdom",
      regulator: "UK Oil & Gas Authority",
      type: "Financial",
      status: "Active",
      effectiveDate: "2024-04-01",
      impact: "Medium",
      description: "Mandatory fund contributions for offshore platform decommissioning",
      affectedCompanies: ["BP", "Shell", "Harbour Energy", "Ithaca Energy"],
      complianceCost: "$650M",
      sector: "Offshore Oil & Gas"
    }
  ];

  const regulatoryTrends = [
    {
      trend: "Carbon Pricing Expansion",
      description: "More jurisdictions implementing carbon taxes and cap-and-trade systems",
      impact: "High",
      timeline: "2024-2026",
      affectedRegions: ["EU", "North America", "Asia-Pacific"]
    },
    {
      trend: "Methane Emission Regulations",
      description: "Stricter monitoring and reduction requirements for methane leaks",
      impact: "Medium",
      timeline: "2024-2025",
      affectedRegions: ["US", "Canada", "EU"]
    },
    {
      trend: "ESG Disclosure Requirements",
      description: "Mandatory environmental and climate risk reporting",
      impact: "Medium",
      timeline: "2024-2025",
      affectedRegions: ["Global"]
    },
    {
      trend: "Renewable Energy Mandates",
      description: "Increased renewable energy portfolio standards",
      impact: "High",
      timeline: "2024-2030",
      affectedRegions: ["Global"]
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
              <h1 className="text-3xl font-bold text-slate-900">Energy Regulations</h1>
              <p className="text-slate-600">Comprehensive tracking of oil & gas regulatory developments and market impact</p>
            </div>
            <div className="flex items-center space-x-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">14</div>
                    <div className="text-xs text-muted-foreground">Active Regulations</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold">$5.4B</div>
                    <div className="text-xs text-muted-foreground">Compliance Cost</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="regulations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="regulations">Current Regulations</TabsTrigger>
              <TabsTrigger value="trends">Regulatory Trends</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Impact</TabsTrigger>
              <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="regulations">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockRegulations.map((regulation) => (
                  <Card key={regulation.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Zap className="h-5 w-5 text-orange-600" />
                            <span className="text-sm">{regulation.title}</span>
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-2 mt-1">
                            <Globe className="h-4 w-4" />
                            <span>{regulation.region}</span>
                          </CardDescription>
                        </div>
                        <Badge variant={getSeverityColor(regulation.impact) as any}>
                          {regulation.impact} Impact
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{regulation.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Regulator</div>
                          <div className="font-medium">{regulation.regulator}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <div className="font-medium">{regulation.type}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Effective Date</div>
                          <div className="font-medium">{regulation.effectiveDate}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Compliance Cost</div>
                          <div className="font-medium text-red-600">{regulation.complianceCost}</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Market Impact</span>
                          <span>{regulation.impact}</span>
                        </div>
                        <Progress value={getImpactProgress(regulation.impact)} className="h-2" />
                      </div>

                      <Separator />

                      <div>
                        <div className="text-sm font-medium mb-2">Affected Companies</div>
                        <div className="flex flex-wrap gap-2">
                          {regulation.affectedCompanies.map((company) => (
                            <Badge key={company} variant="outline" className="text-xs">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Building className="h-3 w-3" />
                          <span>Sector: {regulation.sector}</span>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          regulation.status === 'Active' ? 'border-green-200 text-green-700' :
                          regulation.status === 'Pending' ? 'border-yellow-200 text-yellow-700' :
                          'border-blue-200 text-blue-700'
                        }`}>
                          {regulation.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <span>Emerging Regulatory Trends</span>
                    </CardTitle>
                    <CardDescription>Key regulatory developments shaping the energy sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {regulatoryTrends.map((trend, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-semibold text-lg">{trend.trend}</div>
                              <div className="text-sm text-muted-foreground mt-1">{trend.description}</div>
                            </div>
                            <Badge variant={getSeverityColor(trend.impact) as any}>
                              {trend.impact} Impact
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium">Timeline</div>
                              <div className="text-sm text-muted-foreground">{trend.timeline}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Affected Regions</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {trend.affectedRegions.map((region) => (
                                  <Badge key={region} variant="outline" className="text-xs">
                                    {region}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-red-600" />
                      <span>Compliance Cost Analysis</span>
                    </CardTitle>
                    <CardDescription>Financial impact of regulatory compliance by sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Oil & Gas Operations</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-red-600">$3.4B</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Renewable Energy</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-orange-600">$1.2B</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Utilities</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full" style={{width: '30%'}}></div>
                          </div>
                          <span className="text-sm font-medium text-yellow-600">$800M</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span>Compliance Risk Factors</span>
                    </CardTitle>
                    <CardDescription>Key risk areas for energy companies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Carbon Emissions</span>
                        <Badge variant="outline" className="text-red-600">High Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Methane Leaks</span>
                        <Badge variant="outline" className="text-orange-600">Medium Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Water Usage</span>
                        <Badge variant="outline" className="text-orange-600">Medium Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Waste Management</span>
                        <Badge variant="outline" className="text-yellow-600">Low Risk</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Supply Chain</span>
                        <Badge variant="outline" className="text-orange-600">Medium Risk</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="regional">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>North America</CardTitle>
                    <CardDescription>US, Canada, Mexico</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Active Regulations</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Compliance Cost</span>
                        <span className="font-medium text-red-600">$2.8B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Risk Level</span>
                        <Badge variant="outline" className="text-red-600">High</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Europe</CardTitle>
                    <CardDescription>EU, UK, Norway</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Active Regulations</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Compliance Cost</span>
                        <span className="font-medium text-red-600">$1.9B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Risk Level</span>
                        <Badge variant="outline" className="text-red-600">High</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Asia-Pacific</CardTitle>
                    <CardDescription>China, Japan, Australia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Active Regulations</span>
                        <span className="font-medium">6</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Compliance Cost</span>
                        <span className="font-medium text-orange-600">$700M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Risk Level</span>
                        <Badge variant="outline" className="text-orange-600">Medium</Badge>
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