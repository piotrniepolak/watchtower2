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
      </div>
    </div>
  );
}