import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Shield, Pill, Zap, Globe, TrendingUp, BarChart3, Activity, Target, Users, AlertTriangle, Brain, DollarSign, User, Clock, Lightbulb } from "lucide-react";
import { getActiveSectors } from "@shared/sectors";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Conflict, Stock } from "@shared/schema";
import { CommunityChat } from "@/components/community-chat";
import { LearningHub } from "../components/learning-hub";
import { GlobalIntelligenceCenter } from "@/components/global-intelligence-center";

import atlasPhotoPath from "@assets/atlas-beach-photo.jpg";

interface SectorMetrics {
  totalStocks: number;
  avgChange: number;
  marketCap: string;
  volatility: number;
}

interface ConflictPrediction {
  conflictId: number;
  conflictName: string;
  scenario: "escalation" | "de-escalation" | "stalemate" | "resolution";
  probability: number;
  timeframe: string;
  narrative: string;
  keyFactors: string[];
  economicImpact: string;
  defenseStockImpact: {
    affected: string[];
    direction: "positive" | "negative" | "neutral";
    magnitude: "low" | "medium" | "high";
  };
  geopoliticalImplications: string[];
  riskFactors: string[];
  mitigationStrategies: string[];
}

interface MarketAnalysis {
  overallSentiment: "bullish" | "bearish" | "neutral";
  sectorOutlook: string;
  keyDrivers: string[];
  riskAssessment: string;
  investmentImplications: string[];
  timeHorizon: string;
}

interface ConflictStoryline {
  currentSituation: string;
  possibleOutcomes: Array<{
    scenario: string;
    probability: number;
    description: string;
    timeline: string;
    implications: string[];
  }>;
  keyWatchPoints: string[];
  expertInsights: string;
}

// AI Analysis Components
function AIAnalysisPredictions({ selectedSector }: { selectedSector: string }) {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ["/api/analysis/predictions", selectedSector],
    queryFn: async () => {
      const response = await fetch(`/api/analysis/predictions?sector=${selectedSector}`);
      if (!response.ok) throw new Error('Failed to fetch predictions');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No predictions available for {selectedSector} sector</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {predictions.slice(0, 2).map((prediction: ConflictPrediction, index: number) => (
        <div key={index} className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900">{prediction.conflictName}</h4>
            <Badge variant={prediction.scenario === 'escalation' ? 'destructive' : 'secondary'}>
              {prediction.scenario}
            </Badge>
          </div>
          <div className="flex items-center mb-2">
            <Progress value={prediction.probability} className="flex-1 mr-2" />
            <span className="text-sm font-medium">{prediction.probability}%</span>
          </div>
          <p className="text-sm text-slate-600 mb-2">{prediction.narrative}</p>
          <div className="text-xs text-slate-500">
            <Clock className="h-3 w-3 inline mr-1" />
            {prediction.timeframe}
          </div>
        </div>
      ))}
    </div>
  );
}

function AIAnalysisMarket({ selectedSector }: { selectedSector: string }) {
  const { data: marketAnalysis, isLoading } = useQuery({
    queryKey: ["/api/analysis/market", selectedSector],
    queryFn: async () => {
      const response = await fetch(`/api/analysis/market?sector=${selectedSector}`);
      if (!response.ok) throw new Error('Failed to fetch market analysis');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!marketAnalysis) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No market analysis available for {selectedSector} sector</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-lg font-bold text-slate-900 mb-1">
            {marketAnalysis.overallSentiment === 'bullish' ? '📈' : 
             marketAnalysis.overallSentiment === 'bearish' ? '📉' : '➡️'}
          </div>
          <div className="text-sm font-medium text-slate-900 capitalize">{marketAnalysis.overallSentiment}</div>
          <div className="text-xs text-slate-600">Market Sentiment</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-lg font-bold text-slate-900 mb-1">{marketAnalysis.keyDrivers?.length || 0}</div>
          <div className="text-sm font-medium text-slate-900">Key Drivers</div>
          <div className="text-xs text-slate-600">Identified</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-lg font-bold text-slate-900 mb-1">{marketAnalysis.timeHorizon}</div>
          <div className="text-sm font-medium text-slate-900">Time Horizon</div>
          <div className="text-xs text-slate-600">Analysis Period</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <h5 className="font-medium text-slate-900 mb-2">Sector Outlook</h5>
        <p className="text-sm text-slate-600">{marketAnalysis.sectorOutlook}</p>
      </div>
      
      {marketAnalysis.keyDrivers && marketAnalysis.keyDrivers.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h5 className="font-medium text-slate-900 mb-2">Key Market Drivers</h5>
          <ul className="space-y-1">
            {marketAnalysis.keyDrivers.map((driver: string, index: number) => (
              <li key={index} className="text-sm text-slate-600 flex items-start">
                <div className="w-1 h-1 bg-indigo-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                {driver}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AIAnalysisStorylines({ selectedSector, selectedConflictId, setSelectedConflictId }: { 
  selectedSector: string; 
  selectedConflictId: number | null; 
  setSelectedConflictId: (id: number | null) => void;
}) {
  const { data: storylines, isLoading: storylinesLoading } = useQuery({
    queryKey: ["/api/analysis/storylines", selectedSector, selectedConflictId],
    queryFn: async () => {
      const response = await fetch(`/api/analysis/storylines?sector=${selectedSector}${selectedConflictId ? `&conflictId=${selectedConflictId}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch storylines');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-4">
      {selectedSector === 'defense' && (
        <Select 
          value={selectedConflictId?.toString() || "global"} 
          onValueChange={(value) => {
            const newId = value === "global" ? null : parseInt(value);
            setSelectedConflictId(newId);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>
                  {selectedConflictId === null ? "Global Defense Analysis" : 
                   `Conflict ID: ${selectedConflictId}`}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Global Defense Analysis</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )}

      {storylinesLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      ) : storylines?.length > 0 ? (
        storylines.map((storyline: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <h4 className="font-semibold text-slate-900 mb-2 text-sm">Current Situation</h4>
            <p className="text-xs text-slate-700 mb-3">{storyline.currentSituation}</p>
            
            <h5 className="font-medium text-slate-900 mb-2 text-sm">Possible Outcomes</h5>
            <div className="space-y-2">
              {storyline.possibleOutcomes?.slice(0, 2).map((outcome: any, i: number) => (
                <div key={i} className="bg-slate-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs text-slate-900">{outcome.scenario}</span>
                    <div className="flex items-center">
                      <Progress value={outcome.probability} className="w-8 h-1.5 mr-1" />
                      <span className="text-xs text-slate-600">{outcome.probability}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{outcome.description}</p>
                </div>
              ))}
            </div>

            {storyline.keyWatchPoints && storyline.keyWatchPoints.length > 0 && (
              <div className="mt-3">
                <h5 className="font-medium text-slate-900 mb-1 text-sm">Key Watch Points</h5>
                <div className="flex flex-wrap gap-1">
                  {storyline.keyWatchPoints.slice(0, 3).map((point: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">{point}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <Lightbulb className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No storylines available for {selectedSector} sector</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const [selectedSector, setSelectedSector] = useState<string>('defense');
  const [selectedConflictId, setSelectedConflictId] = useState<number | null>(null);
  
  // Fetch global metrics for overview
  const { data: globalMetrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ["/api/conflicts"],
  });

  const { data: stocks = [] } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });



  // Calculate authentic data sources count
  const { data: dataSourcesCount = 25 } = useQuery({
    queryKey: ["/api/data-sources/count"],
    queryFn: async () => {
      const response = await fetch('/api/data-sources/count');
      if (!response.ok) throw new Error('Failed to fetch data sources count');
      const data = await response.json();
      return data.count;
    }
  });

  const sectors = [
    {
      key: "defense",
      name: "ConflictWatch",
      description: "Defense & Conflict Analytics",
      icon: Shield,
      color: "from-blue-600 to-purple-600",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      href: "/defense"
    },
    {
      key: "health",
      name: "PharmaWatch", 
      description: "Global Health Intelligence",
      icon: Pill,
      color: "from-green-600 to-teal-600",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      href: "/health"
    },
    {
      key: "energy",
      name: "EnergyWatch",
      description: "Energy Market Intelligence", 
      icon: Zap,
      color: "from-orange-600 to-red-600",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
      features: [
        "Energy regulation monitoring",
        "Commodity price tracking",
        "Market trend analysis",
        "Environmental impact assessment"
      ],
      stats: {
        commodities: 15,
        stocks: stocks.filter(s => s.sector === 'Energy').length
      }
    }
  ];

  const globalStats = [
    {
      label: "Active Conflicts",
      value: conflicts.length,
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      label: "Tracked Stocks",
      value: stocks.length,
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      label: "Countries Monitored",
      value: 195,
      icon: Globe,
      color: "text-green-600"
    },
    {
      label: "Data Sources",
      value: dataSourcesCount,
      icon: BarChart3,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl">
              <Activity className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Watchtower
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Multi-Sector Intelligence Platform transforming complex global data into actionable insights through AI-driven analysis 
            across defense, health, and energy sectors
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {globalStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-2">
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sector Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {sectors.map((sector) => {
            const IconComponent = sector.icon;
            return (
              <Link key={sector.key} href={sector.href}>
                <Card className={`${sector.borderColor} border-2 hover:shadow-lg transition-all duration-200 cursor-pointer h-full`}>
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${sector.color} rounded-xl flex items-center justify-center mb-4`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{sector.name}</CardTitle>
                    <CardDescription className="text-sm">{sector.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                        {sector.key === 'defense' && (
                          <>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">{conflicts.length}</span>
                              <span className="text-slate-600">Active Conflicts</span>
                            </div>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">{stocks.filter(s => s.sector === 'Defense').length}</span>
                              <span className="text-slate-600">Defense Stocks</span>
                            </div>
                          </>
                        )}
                        {sector.key === 'health' && (
                          <>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">195</span>
                              <span className="text-slate-600">Countries</span>
                            </div>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">{stocks.filter(s => s.sector === 'Healthcare').length}</span>
                              <span className="text-slate-600">Health Stocks</span>
                            </div>
                          </>
                        )}
                        {sector.key === 'energy' && (
                          <>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">8</span>
                              <span className="text-slate-600">Commodities</span>
                            </div>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">{stocks.filter(s => s.sector === 'Energy').length}</span>
                              <span className="text-slate-600">Energy Stocks</span>
                            </div>
                          </>
                        )}
                      </div>
                      <Button className={`w-full bg-gradient-to-r ${sector.color} text-white hover:opacity-90`}>
                        Enter {sector.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>


        {/* AI Analysis Section - Full Interactive Widget */}
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg mr-4">
                  <Brain className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900">AI-Powered Analysis</CardTitle>
                  <CardDescription className="text-lg">
                    Real-time predictions and market insights powered by advanced AI
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defense">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Defense</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="health">
                      <div className="flex items-center space-x-2">
                        <Pill className="w-4 h-4" />
                        <span>Health</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="energy">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Energy</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="predictions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="predictions">Predictions</TabsTrigger>
                <TabsTrigger value="market">Market Analysis</TabsTrigger>
                <TabsTrigger value="storylines">Storylines</TabsTrigger>
              </TabsList>
              
              <TabsContent value="predictions" className="space-y-4">
                <AIAnalysisPredictions selectedSector={selectedSector} />
              </TabsContent>
              
              <TabsContent value="market" className="space-y-4">
                <AIAnalysisMarket selectedSector={selectedSector} />
              </TabsContent>
              
              <TabsContent value="storylines" className="space-y-4">
                <AIAnalysisStorylines selectedSector={selectedSector} selectedConflictId={selectedConflictId} setSelectedConflictId={setSelectedConflictId} />
              </TabsContent>
            </Tabs>

            {/* Quick Access Links */}
            <div className="mt-6 pt-4 border-t">
              <div className="text-center mb-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Quick Access to Full Analytics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {sectors.map((sector) => {
                    const IconComponent = sector.icon;
                    return (
                      <Link key={sector.key} href={`${sector.href}/dashboard`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <IconComponent className="h-4 w-4 mr-2" />
                          {sector.name} Dashboard
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Hub */}
        <div className="mt-8">
          <LearningHub />
        </div>

        {/* Global Intelligence Center */}
        <div className="mt-8">
          <GlobalIntelligenceCenter />
        </div>

        {/* Community Chat Section */}
        <div className="mt-8">
          <CommunityChat />
        </div>

        {/* Team Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet the Team</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our team combines expertise in geopolitics, economics, and technology to deliver cutting-edge intelligence solutions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* First Team Member */}
            <div className="text-center">
              <div className="relative mb-6">
                <img 
                  src={atlasPhotoPath} 
                  alt="Atlas Schindler" 
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-200"
                />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Atlas Schindler</h3>
              <p className="text-blue-600 font-medium mb-3">Founder and CEO</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Atlas founded Watchtower with a vision to democratize geopolitical intelligence. With a background in international relations and data science, he leads our mission to transform complex global events into actionable insights for investors and analysts worldwide.
              </p>
            </div>

            {/* Second Team Member Placeholder */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-600 to-teal-600 mx-auto mb-4 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-slate-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Dr. Sarah Chen</h3>
              <p className="text-green-600 font-medium mb-3">Chief Medical Officer and Director of PharmaWatch</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dr. Chen brings over 15 years of pharmaceutical industry experience to Watchtower. With her MD/PhD background and former roles at major biotech companies, she leads our health intelligence initiatives, ensuring our PharmaWatch platform delivers accurate, actionable insights for healthcare investors and policy makers.
              </p>
            </div>

            {/* Third Team Member Placeholder */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-600 to-red-600 mx-auto mb-4 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-slate-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Szymon Kordyl</h3>
              <p className="text-orange-600 font-medium mb-3">Co-Founder and Director of EnergyWatch</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Currently completing his BSc in Economics & Business Economics at the University of Amsterdam, Szymon pairs rigorous economic training with a lifelong fascination for geography and geopolitics. His research focuses on how spatial dynamics shape markets a perspective showcased in his recent published paper on Warsaw's emerging Central Business District. At Watchtower, he channels this evidence-based approach into EnergyWatch, transforming global geopolitical trends into clear, actionable intelligence for investors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}