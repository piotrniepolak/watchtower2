import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Shield, Pill, Zap, Globe, TrendingUp, BarChart3, Activity, Target, Users, AlertTriangle, Brain, Lightbulb, TrendingDown, Clock, DollarSign, User, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { Conflict, Stock } from "@shared/schema";
import { CommunityChat } from "@/components/community-chat";
import { LearningHub } from "../components/learning-hub";
import PharmaIntelligenceBrief from "@/components/pharma-intelligence-brief";
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

export default function Home() {
  // Get sector from URL parameters with proper initialization
  const [selectedSector, setSelectedSector] = useState("defense");
  const [selectedConflictId, setSelectedConflictId] = useState<number | null>(null);
  const [isAIAnalysisExpanded, setIsAIAnalysisExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Initialize sector from URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sectorFromUrl = urlParams.get('sector');
    if (sectorFromUrl && ['defense', 'health', 'energy'].includes(sectorFromUrl)) {
      setSelectedSector(sectorFromUrl);
      setIsAIAnalysisExpanded(true);
    }
  }, []);
  
  // Update URL when sector changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('sector', selectedSector);
    window.history.replaceState({}, '', url.toString());
  }, [selectedSector]);
  
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

  // Fetch AI analysis data based on selected sector
  const { data: predictions = [], isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/analysis/predictions", selectedSector],
    queryFn: async () => {
      console.log(`Frontend: Fetching predictions for sector: ${selectedSector}`);
      const response = await fetch(`/api/analysis/predictions?sector=${selectedSector}&cache=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch predictions');
      return response.json();
    },
    enabled: !!selectedSector && selectedSector !== '',
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: marketAnalysis, isLoading: marketLoading } = useQuery({
    queryKey: ["/api/analysis/market", selectedSector],
    queryFn: async () => {
      console.log(`Frontend: Fetching market analysis for sector: ${selectedSector}`);
      const response = await fetch(`/api/analysis/market?sector=${selectedSector}&cache=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch market analysis');
      return response.json();
    },
    enabled: !!selectedSector && selectedSector !== '',
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });



  // Fetch storylines for sector
  const { data: storylines = [], isLoading: storylinesLoading } = useQuery({
    queryKey: ["/api/analysis/storylines", selectedSector, selectedConflictId],
    queryFn: async () => {
      console.log(`Frontend: Fetching storylines for sector: ${selectedSector}`);
      let url = `/api/analysis/storylines?sector=${selectedSector}&cache=${Date.now()}`;
      if (selectedConflictId) {
        url += `&conflictId=${selectedConflictId}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch storylines');
      return response.json();
    },
    enabled: !!selectedSector && selectedSector !== '',
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
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
      features: [
        "Real-time conflict monitoring",
        "Defense stock analytics",
        "Geopolitical risk assessment",
        "AI-powered conflict prediction"
      ],
      stats: {
        conflicts: conflicts.length,
        stocks: stocks.filter(s => s.sector === 'Defense').length
      }
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
      features: [
        "Disease outbreak tracking",
        "WHO health data analytics",
        "Pharmaceutical market insights",
        "Global health score mapping"
      ],
      stats: {
        countries: 195,
        stocks: stocks.filter(s => s.sector === 'Healthcare').length
      }
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
      value: 12,
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

        {/* Sector Cards - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          {sectors.map((sector) => {
            const IconComponent = sector.icon;
            return (
              <Card key={sector.key} className={`${sector.borderColor} border-2 hover:shadow-lg transition-shadow`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    {/* Logo and Name */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className={`bg-gradient-to-r ${sector.color} text-white p-2 rounded-lg`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{sector.name}</h3>
                        <p className="text-xs text-slate-600">{sector.description}</p>
                      </div>
                    </div>
                    
                    {/* Compact metrics */}
                    <div className="flex items-center space-x-3 text-xs">
                      {sector.key === 'defense' && (
                        <>
                          <div className="text-center">
                            <span className="font-semibold text-slate-900 block">{sector.stats.conflicts}</span>
                            <span className="text-slate-600">Conflicts</span>
                          </div>
                          <div className="text-center">
                            <span className="font-semibold text-slate-900 block">{sector.stats.stocks}</span>
                            <span className="text-slate-600">Stocks</span>
                          </div>
                        </>
                      )}
                      {sector.key === 'health' && (
                        <>
                          <div className="text-center">
                            <span className="font-semibold text-slate-900 block">{sector.stats.countries}</span>
                            <span className="text-slate-600">Countries</span>
                          </div>
                          <div className="text-center">
                            <span className="font-semibold text-slate-900 block">{sector.stats.stocks}</span>
                            <span className="text-slate-600">Stocks</span>
                          </div>
                        </>
                      )}
                      {sector.key === 'energy' && (
                        <>
                          <div className="text-center">
                            <span className="font-semibold text-slate-900 block">{sector.stats.commodities}</span>
                            <span className="text-slate-600">Commodities</span>
                          </div>
                          <div className="text-center">
                            <span className="font-semibold text-slate-900 block">{sector.stats.stocks}</span>
                            <span className="text-slate-600">Stocks</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Link href={`/dashboard?sector=${sector.key}`}>
                    <Button size="sm" className={`w-full bg-gradient-to-r ${sector.color} text-white hover:opacity-90 text-xs`}>
                      Explore {sector.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>


        {/* AI Analysis Section */}
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
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAIAnalysisExpanded(!isAIAnalysisExpanded)}
                  className="p-2"
                >
                  {isAIAnalysisExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
                {isAIAnalysisExpanded && (
                  <>
                    <span className="text-sm font-medium text-slate-700">Sector:</span>
                    <Select value={selectedSector} onValueChange={(value) => {
                      console.log(`Frontend: Switching to sector: ${value}`);
                      
                      // Clear all existing cache for AI analysis
                      queryClient.removeQueries({ queryKey: ["/api/analysis/predictions"] });
                      queryClient.removeQueries({ queryKey: ["/api/analysis/market"] });
                      
                      setSelectedSector(value);
                    }}>
                  <SelectTrigger className="w-48">
                    <SelectValue>
                      <div className="flex items-center space-x-2">
                        {selectedSector === 'defense' && <Shield className="w-4 h-4" />}
                        {selectedSector === 'health' && <Pill className="w-4 h-4" />}
                        {selectedSector === 'energy' && <Zap className="w-4 h-4" />}
                        <span>
                          {selectedSector === 'defense' && 'ConflictWatch'}
                          {selectedSector === 'health' && 'PharmaWatch'}
                          {selectedSector === 'energy' && 'EnergyWatch'}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defense">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>ConflictWatch</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="health">
                      <div className="flex items-center space-x-2">
                        <Pill className="w-4 h-4" />
                        <span>PharmaWatch</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="energy">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>EnergyWatch</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          {isAIAnalysisExpanded && (
            <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Market Analysis */}
              <Card className="bg-white/70 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <CardTitle className="text-lg">Market Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {marketLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  ) : marketAnalysis ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Overall Sentiment</span>
                        <Badge 
                          variant={marketAnalysis.overallSentiment === 'bullish' ? 'default' : 
                                  marketAnalysis.overallSentiment === 'bearish' ? 'destructive' : 'secondary'}
                        >
                          {marketAnalysis.overallSentiment}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Sector Outlook</h4>
                        <p className="text-sm text-slate-600">{marketAnalysis.sectorOutlook}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Key Drivers</h4>
                        <div className="space-y-1">
                          {marketAnalysis.keyDrivers?.slice(0, 3).map((driver: string, index: number) => (
                            <div key={index} className="flex items-center text-sm text-slate-600">
                              <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
                              {driver}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No market analysis available</p>
                  )}
                </CardContent>
              </Card>

              {/* Comprehensive AI Analysis Hub */}
              <Card className="bg-white/70 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="h-5 w-5 text-indigo-600 mr-2" />
                      <CardTitle className="text-lg">AI Analysis Hub</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Real-time Analysis
                    </Badge>
                  </div>
                  <CardDescription>
                    Complete sector analysis with predictions, market insights, and strategic storylines
                  </CardDescription>
                  
                  {/* Confidence & Implications Explanation */}
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <div className="font-medium mb-1">Understanding Analysis Confidence</div>
                        <p className="mb-2">
                          <strong>Confidence Levels:</strong> 70-85% = High reliability based on current data | 
                          50-69% = Moderate certainty with evolving factors | 
                          30-49% = Lower confidence due to market volatility
                        </p>
                        <p>
                          <strong>Investment Implications:</strong> Consider confidence levels alongside your risk tolerance. 
                          Higher confidence predictions may warrant larger position sizes, while lower confidence scenarios 
                          suggest smaller, diversified positions with close monitoring.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px] overflow-hidden">
                  <Tabs defaultValue="predictions" className="h-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="predictions" className="text-xs">Predictions</TabsTrigger>
                      <TabsTrigger value="insights" className="text-xs">Market Insights</TabsTrigger>
                      <TabsTrigger value="storylines" className="text-xs">Storylines</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="predictions" className="h-[320px] overflow-y-auto space-y-4">
                      {predictionsLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : predictions?.length > 0 ? (
                        predictions.map((prediction: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-900 text-sm">{prediction.conflictName}</h4>
                              <Badge variant="outline" className="bg-white text-xs">
                                {prediction.probability}% confidence
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-700 mb-3">{prediction.narrative}</p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="font-medium text-slate-600">Timeframe:</span>
                                <p className="text-slate-800">{prediction.timeframe}</p>
                              </div>
                              <div>
                                <span className="font-medium text-slate-600">Impact:</span>
                                <p className="text-slate-800">{prediction.economicImpact}</p>
                              </div>
                            </div>
                            {prediction.keyFactors && prediction.keyFactors.length > 0 && (
                              <div className="mt-3">
                                <span className="font-medium text-slate-600 text-xs">Key Factors:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {prediction.keyFactors.slice(0, 3).map((factor: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{factor}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">No predictions available for {selectedSector} sector</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="insights" className="h-[320px] overflow-y-auto space-y-4">
                      {marketLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : marketAnalysis ? (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-900 text-sm">Market Sentiment</h4>
                              <Badge variant={marketAnalysis.overallSentiment === 'bullish' ? 'default' : 
                                           marketAnalysis.overallSentiment === 'bearish' ? 'destructive' : 'secondary'}
                                     className="text-xs">
                                {marketAnalysis.overallSentiment?.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-700">{marketAnalysis.sectorOutlook}</p>
                          </div>

                          <div className="border rounded-lg p-3">
                            <h5 className="font-medium text-slate-900 mb-2 text-sm flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Key Drivers
                            </h5>
                            <ul className="space-y-1">
                              {marketAnalysis.keyDrivers?.slice(0, 3).map((driver: string, i: number) => (
                                <li key={i} className="text-xs text-slate-600 flex items-center">
                                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                                  {driver}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="border rounded-lg p-3">
                            <h5 className="font-medium text-slate-900 mb-2 text-sm flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Risk Assessment
                            </h5>
                            <p className="text-xs text-slate-600">{marketAnalysis.riskAssessment}</p>
                          </div>

                          <div className="border rounded-lg p-3">
                            <h5 className="font-medium text-slate-900 mb-2 text-sm flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Investment Implications
                            </h5>
                            <ul className="space-y-1">
                              {marketAnalysis.investmentImplications?.slice(0, 3).map((implication: string, i: number) => (
                                <li key={i} className="text-xs text-slate-600 flex items-center">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                  {implication}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BarChart3 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">No market analysis available</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="storylines" className="h-[320px] overflow-y-auto space-y-4">
                      {/* Universal Dropdown Selection for All Sectors */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {selectedSector === 'defense' && <Shield className="h-4 w-4 text-blue-600 mr-2" />}
                            {selectedSector === 'health' && <Pill className="h-4 w-4 text-green-600 mr-2" />}
                            {selectedSector === 'energy' && <Zap className="h-4 w-4 text-orange-600 mr-2" />}
                            <span className="text-sm font-medium text-slate-800">
                              {selectedSector === 'defense' && 'Select Conflict for Analysis'}
                              {selectedSector === 'health' && 'Select Health Focus Area'}
                              {selectedSector === 'energy' && 'Select Energy Focus Area'}
                            </span>
                          </div>
                        </div>
                        
                        {selectedSector === 'defense' && conflicts && conflicts.length > 0 && (
                          <Select 
                            value={selectedConflictId?.toString() || conflicts.filter((c: any) => c.status === 'Active')[0]?.id.toString()} 
                            onValueChange={(value) => {
                              const newId = parseInt(value);
                              setSelectedConflictId(newId);
                              // Clear storylines cache when conflict changes
                              queryClient.removeQueries({ queryKey: ["/api/analysis/storylines"] });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue>
                                <div className="flex items-center space-x-2">
                                  <Shield className="w-4 h-4" />
                                  <span>
                                    {conflicts.find((c: any) => c.id === selectedConflictId)?.name || "Select Conflict"}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {conflicts.filter((c: any) => c.status === 'Active').map((conflict: any) => (
                                <SelectItem key={conflict.id} value={conflict.id.toString()}>
                                  <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>{conflict.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {selectedSector === 'health' && (
                          <Select 
                            value={selectedConflictId?.toString() || "global"} 
                            onValueChange={(value) => {
                              const newId = value === "global" ? null : parseInt(value);
                              setSelectedConflictId(newId);
                              queryClient.removeQueries({ queryKey: ["/api/analysis/storylines"] });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue>
                                <div className="flex items-center space-x-2">
                                  <Pill className="w-4 h-4" />
                                  <span>
                                    {selectedConflictId === null ? "Global Health Trends" : 
                                     selectedConflictId === 1 ? "Pandemic Preparedness" :
                                     selectedConflictId === 2 ? "Healthcare Innovation" :
                                     selectedConflictId === 3 ? "Drug Development" : "Select Focus Area"}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="global">
                                <div className="flex items-center space-x-2">
                                  <Globe className="w-4 h-4" />
                                  <span>Global Health Trends</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="1">
                                <div className="flex items-center space-x-2">
                                  <Shield className="w-4 h-4" />
                                  <span>Pandemic Preparedness</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="2">
                                <div className="flex items-center space-x-2">
                                  <Target className="w-4 h-4" />
                                  <span>Healthcare Innovation</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="3">
                                <div className="flex items-center space-x-2">
                                  <Activity className="w-4 h-4" />
                                  <span>Drug Development</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        
                        {selectedSector === 'energy' && (
                          <Select 
                            value={selectedConflictId?.toString() || "global"} 
                            onValueChange={(value) => {
                              const newId = value === "global" ? null : parseInt(value);
                              setSelectedConflictId(newId);
                              queryClient.removeQueries({ queryKey: ["/api/analysis/storylines"] });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue>
                                <div className="flex items-center space-x-2">
                                  <Zap className="w-4 h-4" />
                                  <span>
                                    {selectedConflictId === null ? "Global Energy Markets" : 
                                     selectedConflictId === 1 ? "Renewable Transition" :
                                     selectedConflictId === 2 ? "Oil & Gas Markets" :
                                     selectedConflictId === 3 ? "Energy Security" : "Select Focus Area"}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="global">
                                <div className="flex items-center space-x-2">
                                  <Globe className="w-4 h-4" />
                                  <span>Global Energy Markets</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="1">
                                <div className="flex items-center space-x-2">
                                  <Zap className="w-4 h-4" />
                                  <span>Renewable Transition</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="2">
                                <div className="flex items-center space-x-2">
                                  <BarChart3 className="w-4 h-4" />
                                  <span>Oil & Gas Markets</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="3">
                                <div className="flex items-center space-x-2">
                                  <Shield className="w-4 h-4" />
                                  <span>Energy Security</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {storylinesLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : storylines?.length > 0 ? (
                        storylines.map((storyline: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                            <h4 className="font-semibold text-slate-900 mb-2 text-sm">Current Situation</h4>
                            <p className="text-xs text-slate-700 mb-3">{storyline.currentSituation}</p>
                            
                            <h5 className="font-medium text-slate-900 mb-2 text-sm">Possible Outcomes</h5>
                            <div className="space-y-2">
                              {storyline.possibleOutcomes?.slice(0, 2).map((outcome: any, i: number) => (
                                <div key={i} className="bg-white rounded-lg p-2 border">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-xs text-slate-900">{outcome.scenario}</span>
                                    <div className="flex items-center">
                                      <Progress value={outcome.probability} className="w-8 h-1.5 mr-1" />
                                      <span className="text-xs text-slate-600">{outcome.probability}%</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 mb-1">{outcome.description}</p>
                                  <div className="flex items-center text-xs text-slate-500 mb-2">
                                    <Clock className="h-2.5 w-2.5 mr-1" />
                                    {outcome.timeline}
                                  </div>
                                  
                                  {/* Display Actual Implications */}
                                  {outcome.implications && outcome.implications.length > 0 && (
                                    <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                                      <h6 className="text-xs font-medium text-blue-800 mb-1">Key Implications:</h6>
                                      <ul className="space-y-1">
                                        {outcome.implications.map((implication: string, idx: number) => (
                                          <li key={idx} className="text-xs text-blue-700 flex items-start">
                                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                            {implication}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
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

                            {storyline.expertInsights && (
                              <div className="mt-3 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded border">
                                <h5 className="font-medium text-slate-900 mb-1 text-sm flex items-center">
                                  <Brain className="h-3 w-3 mr-1" />
                                  Expert Insights
                                </h5>
                                <p className="text-xs text-slate-700">{storyline.expertInsights}</p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Lightbulb className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">No storylines available for {selectedSector} sector</p>
                          {selectedSector === 'defense' && (
                            <p className="text-xs text-slate-400 mt-1">Try selecting a specific conflict above</p>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Quick Insights Bar */}
            {marketAnalysis && (
              <div className="mt-6 p-4 bg-white/70 backdrop-blur rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-900">Risk Level</div>
                      <div className="text-xs text-slate-600">{marketAnalysis.riskAssessment?.split(' ').slice(0, 2).join(' ')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-900">Horizon</div>
                      <div className="text-xs text-slate-600">{marketAnalysis.timeHorizon}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-900">Implications</div>
                      <div className="text-xs text-slate-600">{marketAnalysis.investmentImplications?.length || 0} factors</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled className="opacity-50">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Analysis Active
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          )}
        </Card>

        {/* Pharmaceutical Intelligence Brief - Health Sector Only */}
        {selectedSector === 'health' && (
          <div className="mt-6">
            <PharmaIntelligenceBrief />
          </div>
        )}

        {/* Community Chat Section */}
        <div className="mt-6">
          <CommunityChat />
        </div>

        {/* Learning Hub Section */}
        <div className="mt-6">
          <LearningHub />
        </div>

        {/* Meet the Team Section */}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Meet the Team</h2>
            <p className="text-slate-600">The experts behind Watchtower's intelligence platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Piotrek Polak */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-4 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-slate-500" />
                </div>
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
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>';
                      }
                    }}
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Atlas Loutfi</h3>
              <p className="text-green-600 font-medium mb-3">Co-Founder and Director of PharmaWatch</p>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                With two decades of geopolitical experience, Atlas developed a keen interest in the health challenges faced within the developed and developing world alike, and the potential for financial gain while addressing these key issues. Holding a bachelors degree in pharmaceutical sciences from the flagship Purdue University, he now heads the team responsible for curating the PharmaWatch portion of this website.
              </p>
              <a 
                href="https://www.linkedin.com/in/atlas-loutfi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                LinkedIn Profile
              </a>
            </div>

            {/* Third Team Member Placeholder */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-600 to-red-600 mx-auto mb-4 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-slate-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Coming Soon</h3>
              <p className="text-orange-600 font-medium mb-3">Director of EnergyWatch</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                We're expanding our team to include energy sector expertise. Stay tuned for updates on our newest team member who will lead our energy intelligence initiatives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}