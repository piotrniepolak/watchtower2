import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Globe, 
  BarChart3, 
  Lightbulb,
  Clock,
  Users,
  DollarSign,
  Shield,
  Zap
} from "lucide-react";
import MultiSectorNavigation from "@/components/multi-sector-navigation";

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

export default function Analysis() {
  const [selectedConflictId, setSelectedConflictId] = useState<number | null>(null);
  const [selectedSector, setSelectedSector] = useState<'defense' | 'healthcare' | 'energy'>('defense');

  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/analysis/predictions"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: marketAnalysis, isLoading: marketLoading } = useQuery({
    queryKey: ["/api/analysis/market"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: conflicts } = useQuery({
    queryKey: ["/api/conflicts"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: storyline, isLoading: storylineLoading } = useQuery({
    queryKey: [`/api/analysis/storyline/${selectedConflictId}`],
    enabled: !!selectedConflictId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case "escalation": return "destructive";
      case "de-escalation": return "secondary";
      case "stalemate": return "default";
      case "resolution": return "default";
      default: return "outline";
    }
  };

  const getScenarioIcon = (scenario: string) => {
    switch (scenario) {
      case "escalation": return <TrendingUp className="w-4 h-4" />;
      case "de-escalation": return <TrendingDown className="w-4 h-4" />;
      case "stalemate": return <Target className="w-4 h-4" />;
      case "resolution": return <Shield className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish": return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "bearish": return <TrendingDown className="w-5 h-5 text-red-600" />;
      case "neutral": return <Target className="w-5 h-5 text-slate-600" />;
      default: return <BarChart3 className="w-5 h-5 text-slate-600" />;
    }
  };

  const getMagnitudeColor = (magnitude: string) => {
    switch (magnitude) {
      case "high": return "text-red-600";
      case "medium": return "text-orange-600";
      case "low": return "text-green-600";
      default: return "text-slate-600";
    }
  };

  // Check if API is available and has data
  const hasApiData = predictions && marketAnalysis && Array.isArray(predictions) && predictions.length > 0;
  const isApiUnavailable = !predictionsLoading && !marketLoading && !hasApiData;

  // Show full page loading only on initial load when both are loading
  if (predictionsLoading && marketLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MultiSectorNavigation 
          currentSector={selectedSector}
          onSectorChange={(sector) => setSelectedSector(sector as 'defense' | 'healthcare' | 'energy')}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Brain className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">AI Analysis in Progress</h2>
              <p className="text-slate-600 mb-2">Generating conflict predictions and market insights...</p>
              <p className="text-slate-500 text-sm">This process may take 30-60 seconds to complete.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MultiSectorNavigation 
        currentSector={selectedSector}
        onSectorChange={(sector) => setSelectedSector(sector as 'defense' | 'healthcare' | 'energy')}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Brain className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-slate-900">AI-Powered Conflict Analysis</h1>
          </div>
          <p className="text-slate-600">
            Advanced AI predictions and market insights based on current geopolitical developments
          </p>
        </div>

        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predictions">Conflict Predictions</TabsTrigger>
            <TabsTrigger value="market">Market Analysis</TabsTrigger>
            <TabsTrigger value="storylines">Storylines</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-6">
            {/* Loading Message */}
            {!isApiUnavailable && predictionsLoading && (
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <Brain className="w-5 h-5 mr-2 animate-pulse" />
                    AI Analysis in Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 text-sm">
                    Please wait while our AI system analyzes current conflicts and generates predictions. This process may take 30-60 seconds to complete.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* API Status Banner */}
            {isApiUnavailable && (
              <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    AI Analysis Service Configuration Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700 text-sm">
                    The AI-powered conflict prediction feature requires a valid OpenAI API key with available credits. 
                    Once configured, this system will generate real-time predictions, market analysis, and conflict storylines.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Market Overview Card */}
            {marketAnalysis && (
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getSentimentIcon((marketAnalysis as MarketAnalysis).overallSentiment)}
                    <span className="ml-2">Defense Sector Outlook</span>
                    <Badge variant="outline" className="ml-auto">
                      {(marketAnalysis as MarketAnalysis).timeHorizon}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Sector Assessment</h4>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {(marketAnalysis as MarketAnalysis).sectorOutlook}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Key Market Drivers</h4>
                      <ul className="space-y-1">
                        {(marketAnalysis as MarketAnalysis).keyDrivers.map((driver, index) => (
                          <li key={index} className="flex items-start text-sm text-slate-700">
                            <Zap className="w-3 h-3 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                            {driver}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feature Overview when API unavailable */}
            {isApiUnavailable && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <CardTitle className="text-lg">AI Conflict Prediction Capabilities</CardTitle>
                  <p className="text-slate-600 text-sm mt-2">
                    Once configured with a valid OpenAI API key, this system will analyze each conflict and generate:
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Lightbulb className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Intelligent Predictions</h4>
                          <p className="text-slate-600 text-sm">AI-generated scenarios for escalation, de-escalation, or resolution with probability assessments</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <DollarSign className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Economic Impact Analysis</h4>
                          <p className="text-slate-600 text-sm">Detailed analysis of how conflicts affect defense markets and specific stocks</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Globe className="w-5 h-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Geopolitical Implications</h4>
                          <p className="text-slate-600 text-sm">Analysis of broader regional and international consequences</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <TrendingUp className="w-5 h-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Defense Stock Impact</h4>
                          <p className="text-slate-600 text-sm">Predicted impact direction and magnitude on specific defense contractor stocks</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Risk Assessment</h4>
                          <p className="text-slate-600 text-sm">Identification of key risk factors and potential mitigation strategies</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-slate-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Timeline Predictions</h4>
                          <p className="text-slate-600 text-sm">Estimated timeframes for potential developments and outcomes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Predictions Grid */}
            <div className="grid gap-6">
              {(predictions as ConflictPrediction[] || []).map((prediction) => (
                <Card key={prediction.conflictId} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-2">{prediction.conflictName}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {prediction.timeframe}
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {prediction.probability}% probability
                          </div>
                        </div>
                      </div>
                      <Badge variant={getScenarioColor(prediction.scenario)} className="flex items-center">
                        {getScenarioIcon(prediction.scenario)}
                        <span className="ml-1 capitalize">{prediction.scenario}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Prediction Narrative
                          </h4>
                          <p className="text-slate-700 text-sm leading-relaxed">{prediction.narrative}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Key Factors
                          </h4>
                          <ul className="space-y-1">
                            {prediction.keyFactors.map((factor, index) => (
                              <li key={index} className="flex items-start text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Economic Impact
                          </h4>
                          <p className="text-slate-700 text-sm">{prediction.economicImpact}</p>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Defense Stock Impact
                          </h4>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Impact Direction:</span>
                              <Badge variant={prediction.defenseStockImpact.direction === "positive" ? "default" : 
                                prediction.defenseStockImpact.direction === "negative" ? "destructive" : "secondary"}>
                                {prediction.defenseStockImpact.direction}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Magnitude:</span>
                              <span className={`text-sm font-medium ${getMagnitudeColor(prediction.defenseStockImpact.magnitude)}`}>
                                {prediction.defenseStockImpact.magnitude}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Affected Stocks:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {prediction.defenseStockImpact.affected.map((stock, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {stock}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                            <Globe className="w-4 h-4 mr-2" />
                            Geopolitical Implications
                          </h4>
                          <ul className="space-y-1">
                            {prediction.geopoliticalImplications.map((implication, index) => (
                              <li key={index} className="flex items-start text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                {implication}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Risk Factors
                          </h4>
                          <ul className="space-y-1">
                            {prediction.riskFactors.map((risk, index) => (
                              <li key={index} className="flex items-start text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Probability Bar */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Prediction Confidence</span>
                        <span className="text-sm font-semibold text-slate-900">{prediction.probability}%</span>
                      </div>
                      <Progress value={prediction.probability} className="h-2" />
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <h5 className="text-xs font-semibold text-slate-700 mb-2">Understanding Prediction Confidence</h5>
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">
                          This percentage represents the AI's statistical confidence in the predicted scenario outcome. The confidence level is calculated by analyzing multiple data sources and risk factors:
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1">
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span><strong>Current Intelligence:</strong> Recent diplomatic activities, military movements, and political developments</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span><strong>Historical Analysis:</strong> Similar conflict patterns and their outcomes over the past decades</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span><strong>Economic Indicators:</strong> Defense spending trends, market volatility, and resource allocation patterns</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-1 h-1 bg-slate-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            <span><strong>Regional Stability:</strong> Alliance dynamics, neighboring country responses, and international pressure</span>
                          </li>
                        </ul>
                        <p className="text-xs text-slate-500 mt-2">
                          Higher percentages indicate greater certainty based on convergent evidence across multiple analytical frameworks. Lower percentages suggest higher uncertainty due to conflicting signals or limited data availability.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            {/* Loading Message */}
            {!isApiUnavailable && marketLoading && (
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <BarChart3 className="w-5 h-5 mr-2 animate-pulse" />
                    AI Market Analysis in Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 text-sm">
                    Our AI is analyzing market conditions and generating comprehensive sector insights. This detailed analysis may take 30-60 seconds to complete.
                  </p>
                </CardContent>
              </Card>
            )}

            {isApiUnavailable && (
              <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Market Analysis Service Configuration Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700 text-sm">
                    AI-powered market analysis requires OpenAI API configuration. This feature will provide comprehensive defense sector insights and investment implications.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  AI Market Analysis Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <TrendingUp className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Sector Sentiment Analysis</h4>
                        <p className="text-slate-600 text-sm">AI assessment of overall defense market sentiment (bullish, bearish, or neutral) based on current geopolitical conditions</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <DollarSign className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Investment Implications</h4>
                        <p className="text-slate-600 text-sm">Detailed recommendations for defense portfolio positioning based on conflict analysis</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Risk Assessment</h4>
                        <p className="text-slate-600 text-sm">Comprehensive analysis of market risks and volatility factors affecting defense stocks</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Zap className="w-5 h-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Key Market Drivers</h4>
                        <p className="text-slate-600 text-sm">Identification of primary factors influencing defense market movements and stock performance</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-slate-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Time Horizon Analysis</h4>
                        <p className="text-slate-600 text-sm">Short-term and long-term market outlook based on predicted conflict developments</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Target className="w-5 h-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Sector Outlook</h4>
                        <p className="text-slate-600 text-sm">Comprehensive assessment of defense industry prospects and growth potential</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {marketAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Comprehensive Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Risk Assessment</h4>
                      <p className="text-slate-700 text-sm leading-relaxed mb-4">
                        {(marketAnalysis as MarketAnalysis).riskAssessment}
                      </p>
                      
                      <h4 className="font-semibold text-slate-900 mb-3">Investment Implications</h4>
                      <ul className="space-y-2">
                        {(marketAnalysis as MarketAnalysis).investmentImplications.map((implication, index) => (
                          <li key={index} className="flex items-start text-sm text-slate-700">
                            <DollarSign className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                            {implication}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Sector Outlook</h4>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">Overall Sentiment:</span>
                          <div className="flex items-center">
                            {getSentimentIcon((marketAnalysis as MarketAnalysis).overallSentiment)}
                            <span className="ml-2 capitalize font-semibold">
                              {(marketAnalysis as MarketAnalysis).overallSentiment}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-700 text-sm">
                          {(marketAnalysis as MarketAnalysis).sectorOutlook}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="storylines" className="space-y-6">
            {/* Conflict Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Select Conflict for Storyline Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Select 
                    value={selectedConflictId?.toString() || ""} 
                    onValueChange={(value) => setSelectedConflictId(parseInt(value))}
                  >
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Choose a conflict to analyze..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(conflicts as any[] || []).map((conflict: any) => (
                        <SelectItem key={conflict.id} value={conflict.id.toString()}>
                          {conflict.name} - {conflict.region}
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

            {/* Storyline Display */}
            {selectedConflictId && (
              <>
                {storylineLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Brain className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          Generating Conflict Storyline
                        </h3>
                        <p className="text-slate-600">
                          AI is analyzing the conflict and creating detailed scenarios. This comprehensive analysis may take 30-60 seconds to complete.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : storyline ? (
                  <div className="space-y-6">
                    {/* Current Situation */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Lightbulb className="w-5 h-5 mr-2" />
                          Current Situation Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 leading-relaxed">
                          {(storyline as ConflictStoryline).currentSituation}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Outcome Visualization */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Target className="w-5 h-5 mr-2" />
                          Scenario Outcome Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Streamlined Venn Diagram */}
                        <div className="mb-8">
                          <h4 className="font-semibold text-slate-900 mb-4">Scenario Probability Overview</h4>
                          <div className="bg-slate-50 rounded-lg p-8">
                            <svg width="500" height="400" viewBox="0 0 500 400" className="w-full">
                              {/* Background */}
                              <rect width="500" height="400" fill="transparent" />
                              
                              {/* Circles for different outcome types */}
                              {(storyline as ConflictStoryline).possibleOutcomes.slice(0, 4).map((outcome, index) => {
                                const positions = [
                                  { cx: 200, cy: 140, labelX: 120, labelY: 80, color: "#3b82f6" }, // Blue - top left overlapping
                                  { cx: 300, cy: 140, labelX: 380, labelY: 80, color: "#ef4444" }, // Red - top right overlapping
                                  { cx: 200, cy: 200, labelX: 120, labelY: 260, color: "#10b981" }, // Green - bottom left overlapping
                                  { cx: 300, cy: 200, labelX: 380, labelY: 260, color: "#f59e0b" },  // Orange - bottom right overlapping
                                ];
                                const pos = positions[index];
                                const radius = Math.max(55, Math.min(85, outcome.probability * 1.2 + 20));
                                
                                // Helper function to wrap text
                                const wrapText = (text: string, maxWidth: number) => {
                                  const words = text.split(' ');
                                  const lines = [];
                                  let currentLine = '';
                                  
                                  for (const word of words) {
                                    if ((currentLine + word).length <= maxWidth) {
                                      currentLine += (currentLine ? ' ' : '') + word;
                                    } else {
                                      if (currentLine) lines.push(currentLine);
                                      currentLine = word;
                                    }
                                  }
                                  if (currentLine) lines.push(currentLine);
                                  return lines;
                                };
                                
                                const wrappedText = wrapText(outcome.scenario, 15);
                                
                                return (
                                  <g key={index}>
                                    {/* Circle */}
                                    <circle
                                      cx={pos.cx}
                                      cy={pos.cy}
                                      r={radius}
                                      fill={pos.color}
                                      fillOpacity="0.2"
                                      stroke={pos.color}
                                      strokeWidth="3"
                                    />
                                    
                                    {/* Probability percentage in center of circle */}
                                    <text
                                      x={pos.cx}
                                      y={pos.cy + 6}
                                      textAnchor="middle"
                                      className="text-xl font-bold fill-slate-800"
                                    >
                                      {outcome.probability}%
                                    </text>
                                    
                                    {/* Scenario name outside circle - wrapped text */}
                                    {wrappedText.map((line, lineIndex) => (
                                      <text
                                        key={lineIndex}
                                        x={pos.labelX}
                                        y={pos.labelY + (lineIndex * 12)}
                                        textAnchor="middle"
                                        className="text-xs font-semibold fill-slate-700"
                                      >
                                        {line}
                                      </text>
                                    ))}
                                    
                                    {/* Timeline below scenario name */}
                                    <text
                                      x={pos.labelX}
                                      y={pos.labelY + (wrappedText.length * 12) + 8}
                                      textAnchor="middle"
                                      className="text-xs fill-slate-500"
                                    >
                                      {outcome.timeline}
                                    </text>
                                  </g>
                                );
                              })}
                              
                              {/* Clean legend */}
                              <text x="50" y="380" className="text-xs fill-slate-600 font-medium">
                                Circle size = probability strength • Overlapping areas = related scenarios
                              </text>
                            </svg>
                          </div>
                          <p className="text-xs text-slate-500 mt-3 text-center max-w-2xl mx-auto">
                            Visual representation of scenario probabilities and their relationships. Larger circles indicate higher-confidence predictions, 
                            while overlapping areas suggest interconnected outcomes that may influence each other.
                          </p>
                        </div>

                        {/* Detailed Scenarios */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-900 mb-3">Detailed Scenario Analysis</h4>
                          {(storyline as ConflictStoryline).possibleOutcomes.map((outcome, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-slate-900">{outcome.scenario}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">
                                    {outcome.probability}% probability
                                  </Badge>
                                  <Badge variant="secondary">
                                    {outcome.timeline}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-slate-700 text-sm mb-3 leading-relaxed">
                                {outcome.description}
                              </p>
                              <div>
                                <h5 className="font-medium text-slate-900 mb-2">Key Implications:</h5>
                                <ul className="space-y-1">
                                  {outcome.implications.map((implication, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-slate-600">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                      {implication}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Watch Points & Expert Insights */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Key Watch Points
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {(storyline as ConflictStoryline).keyWatchPoints.map((point, index) => (
                              <li key={index} className="flex items-start text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Brain className="w-5 h-5 mr-2" />
                            Expert AI Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {(storyline as ConflictStoryline).expertInsights}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          Unable to Generate Storyline
                        </h3>
                        <p className="text-slate-600">
                          Please check the API configuration and try again.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  AI Storyline Generation Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Current Situation Analysis</h4>
                        <p className="text-slate-600 text-sm">AI-generated assessment of the present state of each conflict with key developments</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Target className="w-5 h-5 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Multiple Scenario Outcomes</h4>
                        <p className="text-slate-600 text-sm">Detailed exploration of possible conflict resolutions with probability assessments</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Timeline Projections</h4>
                        <p className="text-slate-600 text-sm">Estimated timeframes for each scenario with key milestone events</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Globe className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Geopolitical Implications</h4>
                        <p className="text-slate-600 text-sm">Analysis of broader regional and international consequences for each scenario</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Key Watch Points</h4>
                        <p className="text-slate-600 text-sm">Critical indicators and events that could signal scenario transitions</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Brain className="w-5 h-5 text-slate-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Expert AI Insights</h4>
                        <p className="text-slate-600 text-sm">AI-synthesized analysis combining multiple perspectives and historical patterns</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Interactive Storyline Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Conflict-Specific Analysis</h4>
                    <p className="text-blue-800 text-sm mb-3">
                      Once configured, select any conflict from the dashboard to generate detailed storylines with:
                    </p>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        Real-time situation assessment based on latest developments
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        Multiple probability-weighted outcome scenarios
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        Interactive timeline with key decision points
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        Economic and market impact projections
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}