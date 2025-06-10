import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Pill, Zap, Globe, TrendingUp, BarChart3, Activity, Target, Users, AlertTriangle, Brain, Lightbulb, TrendingDown, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { Conflict, Stock } from "@shared/schema";
import MetricsCards from "@/components/metrics-cards";
import EnhancedMultiSectorDashboard from "@/components/enhanced-multi-sector-dashboard";

interface SectorMetrics {
  totalStocks: number;
  avgChange: number;
  marketCap: string;
  volatility: number;
}

export default function Home() {
  const [selectedSector, setSelectedSector] = useState("defense");
  const queryClient = useQueryClient();
  
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
      description: "Global Health & Disease Intelligence",
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
      description: "Oil & Gas Regulation Intelligence", 
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

  // Helper functions for AI analysis
  const getSectorScenarios = (sector: string) => {
    switch (sector) {
      case 'health':
        return [
          { id: 100, name: 'Global Pandemic Preparedness', region: 'Global Health' },
          { id: 101, name: 'Pharmaceutical Supply Chain Crisis', region: 'Global Healthcare' },
          { id: 102, name: 'Antimicrobial Resistance Surge', region: 'Global Health Security' },
          { id: 103, name: 'Vaccine Distribution Inequality', region: 'Public Health' },
          { id: 104, name: 'Healthcare Worker Shortage Crisis', region: 'Healthcare Infrastructure' }
        ];
      case 'energy':
        return [
          { id: 200, name: 'Oil Price Volatility', region: 'Global Energy Markets' },
          { id: 201, name: 'Renewable Energy Transition Disruption', region: 'Energy Infrastructure' },
          { id: 202, name: 'Natural Gas Supply Chain Crisis', region: 'Energy Security' },
          { id: 203, name: 'Grid Modernization Challenges', region: 'Energy Infrastructure' },
          { id: 204, name: 'Carbon Pricing Policy Shifts', region: 'Energy Policy' }
        ];
      default:
        return conflicts || [];
    }
  };

  const [selectedConflictId, setSelectedConflictId] = useState<number | null>(null);

  // Reset storyline selection when sector changes
  useEffect(() => {
    setSelectedConflictId(null);
  }, [selectedSector]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Sector Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Brain className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-slate-900">Multi-Sector Intelligence Platform</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-700">Sector:</span>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-64">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    {selectedSector === 'defense' && <Shield className="w-4 h-4" />}
                    {selectedSector === 'health' && <Pill className="w-4 h-4" />}
                    {selectedSector === 'energy' && <Zap className="w-4 h-4" />}
                    <span>
                      {selectedSector === 'defense' && 'ConflictWatch - Defense Analytics'}
                      {selectedSector === 'health' && 'PharmaWatch - Global Health Intelligence'}
                      {selectedSector === 'energy' && 'EnergyWatch - Oil & Gas Analytics'}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defense">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>ConflictWatch - Defense & Conflict Analytics</span>
                  </div>
                </SelectItem>
                <SelectItem value="health">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-4 h-4" />
                    <span>PharmaWatch - Global Health Intelligence</span>
                  </div>
                </SelectItem>
                <SelectItem value="energy">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>EnergyWatch - Oil & Gas Analytics</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-slate-600 mb-8">
          {selectedSector === 'defense' && 'Advanced AI predictions and market insights based on current geopolitical developments'}
          {selectedSector === 'health' && 'Comprehensive health analytics and pharmaceutical market intelligence powered by authentic WHO data'}
          {selectedSector === 'energy' && 'Real-time energy market analysis and regulatory intelligence for oil & gas sectors'}
        </p>

        {/* Real-Time Metrics */}
        <MetricsCards />
        
        {/* Multi-Sector Dashboard */}
        <EnhancedMultiSectorDashboard defaultSector={selectedSector} />

        {/* Complete AI Analysis Integration */}
        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predictions">
              {selectedSector === 'defense' ? 'Conflict Predictions' : 
               selectedSector === 'health' ? 'Health Crisis Predictions' : 
               'Energy Market Predictions'}
            </TabsTrigger>
            <TabsTrigger value="market">Market Analysis</TabsTrigger>
            <TabsTrigger value="storylines">
              {selectedSector === 'defense' ? 'Conflict Storylines' : 
               selectedSector === 'health' ? 'Health Crisis Storylines' : 
               'Energy Market Storylines'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-6">
            {/* Predictions Loading */}
            {predictionsLoading && (
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    AI Analysis in Progress
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    {selectedSector === 'defense' && 'Generating conflict predictions and market insights...'}
                    {selectedSector === 'health' && 'Analyzing global health data and pharmaceutical markets...'}
                    {selectedSector === 'energy' && 'Processing energy market trends and regulatory impacts...'}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Predictions Grid */}
            {predictions && predictions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predictions.map((prediction: any, index: number) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">
                          {prediction.conflictName || prediction.title}
                        </CardTitle>
                        <Badge 
                          variant={prediction.scenario === 'escalation' ? 'destructive' : 
                                 prediction.scenario === 'de-escalation' ? 'secondary' : 'outline'}
                        >
                          {prediction.scenario}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-4">
                        {prediction.prediction}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Confidence:</span>
                          <span className="font-medium">{prediction.confidence}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Timeline:</span>
                          <span className="font-medium">{prediction.timeframe}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Impact:</span>
                          <span className={`font-medium ${
                            prediction.impact === 'High' ? 'text-red-600' : 
                            prediction.impact === 'Medium' ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {prediction.impact}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            {/* Market Analysis Loading */}
            {marketLoading && (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Market Analysis Loading
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Processing real-time market data and generating insights...
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Market Analysis Content */}
            {marketAnalysis && (
              <div className="space-y-6">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                      Market Overview
                    </CardTitle>
                    <CardDescription>
                      Current sentiment: <Badge variant={marketAnalysis.overallSentiment === 'bullish' ? 'default' : 
                                                        marketAnalysis.overallSentiment === 'bearish' ? 'destructive' : 'secondary'}>
                        {marketAnalysis.overallSentiment}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{marketAnalysis.summary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Key Factors</h4>
                        <ul className="space-y-1">
                          {marketAnalysis.keyFactors?.map((factor: string, index: number) => (
                            <li key={index} className="text-sm text-slate-600 flex items-start">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Market Outlook</h4>
                        <p className="text-sm text-slate-600">{marketAnalysis.outlook}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="storylines" className="space-y-6">
            <Card className="shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  {selectedSector === 'defense' ? 'Conflict Storylines' : 
                   selectedSector === 'health' ? 'Health Crisis Storylines' : 
                   'Energy Market Storylines'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Select 
                    value={selectedConflictId?.toString() || ""} 
                    onValueChange={(value) => setSelectedConflictId(parseInt(value))}
                  >
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder={
                        selectedSector === 'health' ? 'Choose a health crisis to analyze...' : 
                        selectedSector === 'energy' ? 'Choose an energy scenario to analyze...' : 
                        'Choose a conflict to analyze...'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {getSectorScenarios(selectedSector).map((scenario: any) => (
                        <SelectItem key={scenario.id} value={scenario.id.toString()}>
                          {scenario.name} - {scenario.region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedConflictId && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedConflictId(null)}
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selected Storyline Details */}
            {selectedConflictId && (
              <Card className="shadow-sm border border-slate-200">
                <CardHeader>
                  <CardTitle>Scenario Analysis</CardTitle>
                  <CardDescription>
                    Detailed analysis for the selected scenario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">
                      AI-powered scenario analysis will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-blue-600" />
              <span>Platform Capabilities</span>
            </CardTitle>
            <CardDescription>
              Advanced analytics and intelligence across multiple sectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-sm text-slate-600">Live data processing and visualization from multiple sources</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-slate-600">Machine learning algorithms for predictive analysis</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Global Coverage</h3>
                <p className="text-sm text-slate-600">Comprehensive data from 195+ countries worldwide</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to explore sector-specific intelligence?
          </h2>
          <p className="text-slate-600 mb-6">
            Choose a sector above to dive into detailed analytics and insights
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/?sector=defense">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <Shield className="h-4 w-4 mr-2" />
                Defense Analytics
              </Button>
            </Link>
            <Link href="/?sector=health">
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                <Pill className="h-4 w-4 mr-2" />
                Health Intelligence
              </Button>
            </Link>
            <Link href="/?sector=energy">
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                <Zap className="h-4 w-4 mr-2" />
                Energy Insights
              </Button>
            </Link>
          </div>
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
              </div>
            </div>
          </CardHeader>
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

              {/* AI Predictions */}
              <Card className="bg-white/70 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center">
                    <Lightbulb className="h-5 w-5 text-amber-600 mr-2" />
                    <CardTitle className="text-lg">AI Predictions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {predictionsLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  ) : predictions && predictions.length > 0 ? (
                    <div className="space-y-4">
                      {predictions.slice(0, 2).map((prediction: any, index: number) => (
                        <div key={index} className="border-l-4 border-indigo-500 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900 text-sm">{prediction.conflictName}</h4>
                            <Badge variant="outline" className="text-xs">
                              {prediction.probability}% probability
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{prediction.narrative}</p>
                          <div className="flex items-center text-xs text-slate-500">
                            <span className="font-medium mr-2">Timeframe:</span>
                            {prediction.timeframe}
                          </div>
                        </div>
                      ))}
                      {predictions.length > 2 && (
                        <div className="text-center pt-2">
                          <Link href="/analysis">
                            <Button variant="outline" size="sm">
                              View All Predictions
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No predictions available</p>
                  )}
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
                  <Link href="/analysis">
                    <Button variant="outline" size="sm">
                      <Brain className="h-4 w-4 mr-2" />
                      Full Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}