import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Shield, Pill, Zap, Globe, TrendingUp, BarChart3, Activity, Target, Users, AlertTriangle, Brain, DollarSign, User, Clock, Lightbulb, BookOpen } from "lucide-react";
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
      ) : (
        <div className="space-y-4">
          {storylines && storylines.length > 0 ? (
            storylines.map((storyline: ConflictStoryline & { conflictName?: string }, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-white">
                {storyline.conflictName && (
                  <h4 className="font-semibold text-slate-900 mb-2">{storyline.conflictName}</h4>
                )}
                <div className="mb-3">
                  <h5 className="font-medium text-slate-700 mb-1">Current Situation</h5>
                  <p className="text-sm text-slate-600">{storyline.currentSituation}</p>
                </div>
                {storyline.possibleOutcomes && storyline.possibleOutcomes.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-slate-700 mb-2">Possible Outcomes</h5>
                    <div className="space-y-2">
                      {storyline.possibleOutcomes.slice(0, 2).map((outcome, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-700">{outcome.scenario}</span>
                            <Badge variant="outline" className="text-xs">
                              {outcome.probability}%
                            </Badge>
                          </div>
                          <p className="text-slate-600">{outcome.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {storyline.keyWatchPoints && storyline.keyWatchPoints.length > 0 && (
                  <div>
                    <h5 className="font-medium text-slate-700 mb-1">Key Watch Points</h5>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {storyline.keyWatchPoints.slice(0, 3).map((point, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No storylines available for {selectedSector} sector</p>
            </div>
          )}
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
  });

  const activeSectors = getActiveSectors();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Watchtower
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Multi-Domain Intelligence Platform delivering comprehensive global insights through AI-powered predictive analytics across Defense, Health, and Energy sectors.
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Active Conflicts</p>
                  <p className="text-2xl font-bold text-blue-900">{globalMetrics?.activeConflicts || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Defense Index</p>
                  <p className="text-2xl font-bold text-green-900">{globalMetrics?.defenseIndex || "150.69"}</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Tracked Stocks</p>
                  <p className="text-2xl font-bold text-purple-900">{stocks.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Data Sources</p>
                  <p className="text-2xl font-bold text-amber-900">{dataSourcesCount}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sector Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeSectors.map((sector) => {
            const Icon = sector.icon;
            return (
              <Card key={sector.id} className={`border-2 ${sector.theme.border} ${sector.theme.background} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-center">
                    <div className={`${sector.theme.iconBg} text-white p-3 rounded-lg mr-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900">{sector.name}</CardTitle>
                      <CardDescription className="text-slate-600">
                        {sector.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-slate-900">
                          {sector.id === 'defense' ? globalMetrics?.activeConflicts || 0 : 
                           sector.id === 'health' ? '12' : '8'}
                        </div>
                        <div className="text-slate-600">
                          {sector.id === 'defense' ? 'Active Conflicts' : 
                           sector.id === 'health' ? 'Pharma Companies' : 'Energy Sources'}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-slate-900">
                          {sector.id === 'defense' ? globalMetrics?.defenseIndex || "150.69" : 
                           sector.id === 'health' ? '94.2' : '87.5'}
                        </div>
                        <div className="text-slate-600">
                          {sector.id === 'defense' ? 'Defense Index' : 
                           sector.id === 'health' ? 'Health Index' : 'Energy Index'}
                        </div>
                      </div>
                    </div>
                    <Link href={sector.href}>
                      <Button className={`w-full ${sector.theme.button} hover:opacity-90`}>
                        Access {sector.name}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI-Powered Analysis Widget */}
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <div className="flex items-center justify-between">
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
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Sector:</span>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defense">ConflictWatch</SelectItem>
                    <SelectItem value="health">PharmaWatch</SelectItem>
                    <SelectItem value="energy">EnergyWatch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Market Analysis */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Market Analysis</h3>
                </div>
                <AIAnalysisMarket selectedSector={selectedSector} />
              </div>
              
              {/* Right Side - AI Analysis Hub */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-900">AI Analysis Hub</h3>
                  </div>
                  <span className="text-sm text-indigo-600 font-medium">Real-time Analysis</span>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Complete sector analysis with AI predictions, market insights, and strategic storylines
                </p>
                
                <Tabs defaultValue="predictions" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="predictions">Predictions</TabsTrigger>
                    <TabsTrigger value="market">Market Insights</TabsTrigger>
                    <TabsTrigger value="storylines">Storylines</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="predictions" className="space-y-4">
                    <AIAnalysisPredictions selectedSector={selectedSector} />
                  </TabsContent>
                  
                  <TabsContent value="market" className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-medium text-slate-900 mb-2">Understanding Analysis Confidence</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Confidence Level: 50-85%</span>
                          <Badge variant="secondary">High reliability based on current data</Badge>
                        </div>
                        <div className="text-slate-600">
                          <span className="font-medium">Moderate certainty with evolving factors</span> | 30-49% = Lower confidence due to market volatility
                        </div>
                        <div className="text-slate-600">
                          <span className="font-medium">Investment Implications:</span> Consider confidence levels alongside your risk tolerance. Higher confidence predictions may warrant larger position sizes, while lower confidence scenarios suggest smaller, diversified positions with close monitoring.
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="storylines" className="space-y-4">
                    <AIAnalysisStorylines selectedSector={selectedSector} selectedConflictId={selectedConflictId} setSelectedConflictId={setSelectedConflictId} />
                  </TabsContent>
                </Tabs>
                
                <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">AI Analysis Active</span>
                  </div>
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

        {/* Meet the Team */}
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900 flex items-center">
              <Users className="h-6 w-6 mr-2" />
              Meet the Team
            </CardTitle>
            <CardDescription>
              The experts behind Watchtower's multi-domain intelligence platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Piotrek Polak */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">Piotrek Polak</h3>
                <p className="text-blue-600 font-medium mb-3">Co-Founder and Director of ConflictWatch</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A prominent figure in the Polish defense sector, Piotrek has had a longstanding fascination with the intersection of global safety and personal investment. Holding a bachelors degree in engineering from the flagship Purdue University, he now heads the team responsible for curating the ConflictWatch portion of this website.
                </p>
              </div>

              {/* Atlas Loutfi */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-600 to-teal-600 mx-auto mb-4 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src={atlasPhotoPath}
                      alt="Atlas Loutfi"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="h-16 w-16 text-white flex items-center justify-center"><svg class="h-16 w-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>';
                      }}
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">Atlas Loutfi</h3>
                <p className="text-green-600 font-medium mb-3">Co-Founder and Director of PharmaWatch</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  Atlas brings deep expertise in pharmaceutical markets and global health intelligence. With a background in biotech analysis and regulatory affairs, he leads our PharmaWatch division, providing critical insights into drug development pipelines, regulatory changes, and market dynamics affecting global health security.
                </p>
                <a 
                  href="https://www.linkedin.com/in/atlas-loutfi-4b8936225/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  Connect on LinkedIn →
                </a>
              </div>

              {/* Szymon Kordyl */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">Szymon Kordyl</h3>
                <p className="text-yellow-600 font-medium mb-3">Co-Founder and Director of EnergyWatch</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Szymon is an energy sector specialist with extensive experience in renewable energy markets, geopolitical energy security, and commodity trading. He spearheads our EnergyWatch intelligence, analyzing global energy transitions, supply chain vulnerabilities, and the intersection of energy policy with national security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Chat */}
        <div className="mt-8">
          <CommunityChat />
        </div>
      </div>
    </div>
  );
}