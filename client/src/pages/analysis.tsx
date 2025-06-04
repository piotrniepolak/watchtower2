import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
import Navigation from "@/components/navigation";

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
  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ["/api/ai/predictions"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: marketAnalysis, isLoading: marketLoading } = useQuery({
    queryKey: ["/api/ai/market-analysis"],
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

  if (predictionsLoading || marketLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Brain className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">AI Analysis in Progress</h2>
              <p className="text-slate-600">Generating conflict predictions and market insights...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            {marketAnalysis && (
              <>
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
              </>
            )}
          </TabsContent>

          <TabsContent value="storylines" className="space-y-6">
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Interactive Storylines</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Select a specific conflict from the predictions to explore detailed storyline scenarios and expert insights.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}