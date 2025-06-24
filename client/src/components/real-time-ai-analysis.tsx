import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Activity,
  DollarSign,
  BarChart3,
  Shield,
  Pill,
  Zap,
  Clock,
  RefreshCw
} from "lucide-react";
import { useState } from "react";

interface ConflictPrediction {
  conflictName: string;
  region: string;
  scenario: 'escalation' | 'de-escalation' | 'stalemate' | 'resolution';
  probability: number;
  timeframe: string;
  narrative: string;
  keyFactors: string[];
  marketImpact: 'positive' | 'negative' | 'neutral';
  affectedSectors: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface MarketAnalysis {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  sector: string;
  keyDrivers: string[];
  topStocks: Array<{
    symbol: string;
    prediction: 'buy' | 'sell' | 'hold';
    confidence: number;
    reasoning: string;
  }>;
  riskFactors: string[];
  opportunities: string[];
  timeHorizon: string;
  marketOutlook: string;
}

interface EconomicIndicators {
  inflationTrend: 'rising' | 'falling' | 'stable';
  gdpGrowth: number;
  unemploymentRate: number;
  interestRateDirection: 'up' | 'down' | 'stable';
  commodityPrices: {
    oil: { price: number; change: number };
    gold: { price: number; change: number };
  };
  currencyStrength: 'strong' | 'weak' | 'stable';
}

const sectorOptions = [
  { value: 'defense', label: 'ConflictWatch', icon: Shield },
  { value: 'health', label: 'PharmaWatch', icon: Pill },
  { value: 'energy', label: 'EnergyWatch', icon: Zap }
];

function ConflictPredictions() {
  const { data: conflicts, isLoading, error } = useQuery<ConflictPrediction[]>({
    queryKey: ['/api/ai-analysis/conflicts'],
    queryFn: async () => {
      const response = await fetch('/api/ai-analysis/conflicts');
      if (!response.ok) throw new Error('Failed to fetch conflict predictions');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider stale after 4 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
          <span className="text-sm text-slate-600">Analyzing global conflicts...</span>
        </div>
      </div>
    );
  }

  if (error || !conflicts || conflicts.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Unable to load conflict predictions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conflicts.slice(0, 3).map((conflict, index) => (
        <div key={index} className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-slate-500" />
              <h4 className="font-semibold text-slate-900">{conflict.conflictName}</h4>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={conflict.scenario === 'escalation' ? 'destructive' : 
                        conflict.scenario === 'resolution' ? 'default' : 'secondary'}
              >
                {conflict.scenario}
              </Badge>
              <Badge 
                variant={conflict.riskLevel === 'critical' ? 'destructive' :
                        conflict.riskLevel === 'high' ? 'destructive' : 'secondary'}
              >
                {conflict.riskLevel} risk
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center mb-3">
            <Progress value={conflict.probability} className="flex-1 mr-3" />
            <span className="text-sm font-medium text-slate-900">{conflict.probability}%</span>
          </div>
          
          <p className="text-sm text-slate-600 mb-3">{conflict.narrative}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-slate-700">Timeframe:</span>
              <p className="text-slate-600">{conflict.timeframe}</p>
            </div>
            <div>
              <span className="font-medium text-slate-700">Market Impact:</span>
              <div className="flex items-center space-x-1">
                {conflict.marketImpact === 'positive' ? 
                  <TrendingUp className="h-3 w-3 text-green-600" /> :
                  conflict.marketImpact === 'negative' ?
                  <TrendingDown className="h-3 w-3 text-red-600" /> :
                  <BarChart3 className="h-3 w-3 text-slate-500" />
                }
                <span className={`capitalize ${
                  conflict.marketImpact === 'positive' ? 'text-green-600' :
                  conflict.marketImpact === 'negative' ? 'text-red-600' : 'text-slate-600'
                }`}>
                  {conflict.marketImpact}
                </span>
              </div>
            </div>
          </div>
          
          {conflict.affectedSectors.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-xs font-medium text-slate-700">Affected Sectors: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {conflict.affectedSectors.map((sector, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MarketAnalysisTab({ sector }: { sector: string }) {
  const { data: analysis, isLoading, error } = useQuery<MarketAnalysis>({
    queryKey: ['/api/ai-analysis/market', sector],
    queryFn: async () => {
      const response = await fetch(`/api/ai-analysis/market/${sector}`);
      if (!response.ok) throw new Error('Failed to fetch market analysis');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
          <span className="text-sm text-slate-600">Analyzing market conditions...</span>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Unable to load market analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl mb-2">
            {analysis.overallSentiment === 'bullish' ? '📈' : 
             analysis.overallSentiment === 'bearish' ? '📉' : '➡️'}
          </div>
          <div className="text-sm font-medium text-slate-900 capitalize">{analysis.overallSentiment}</div>
          <div className="text-xs text-slate-600">Market Sentiment</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-2xl font-bold text-slate-900 mb-1">{analysis.keyDrivers?.length || 0}</div>
          <div className="text-sm font-medium text-slate-900">Key Drivers</div>
          <div className="text-xs text-slate-600">Identified</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-sm font-bold text-slate-900 mb-1">{analysis.timeHorizon}</div>
          <div className="text-sm font-medium text-slate-900">Time Horizon</div>
          <div className="text-xs text-slate-600">Analysis Period</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <h5 className="font-medium text-slate-900 mb-2">Market Outlook</h5>
        <p className="text-sm text-slate-600">{analysis.marketOutlook}</p>
      </div>
      
      {analysis.topStocks && analysis.topStocks.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h5 className="font-medium text-slate-900 mb-3">Top Stock Recommendations</h5>
          <div className="space-y-3">
            {analysis.topStocks.slice(0, 3).map((stock, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={stock.prediction === 'buy' ? 'default' :
                            stock.prediction === 'sell' ? 'destructive' : 'secondary'}
                  >
                    {stock.symbol}
                  </Badge>
                  <div>
                    <div className="text-sm font-medium text-slate-900 capitalize">{stock.prediction}</div>
                    <div className="text-xs text-slate-600">{stock.confidence}% confidence</div>
                  </div>
                </div>
                <div className="text-right max-w-xs">
                  <p className="text-xs text-slate-600">{stock.reasoning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {analysis.keyDrivers && analysis.keyDrivers.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h5 className="font-medium text-slate-900 mb-2">Key Market Drivers</h5>
          <ul className="space-y-1">
            {analysis.keyDrivers.map((driver, index) => (
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

function EconomicIndicatorsTab() {
  const { data: indicators, isLoading, error } = useQuery<EconomicIndicators>({
    queryKey: ['/api/ai-analysis/economics'],
    queryFn: async () => {
      const response = await fetch('/api/ai-analysis/economics');
      if (!response.ok) throw new Error('Failed to fetch economic indicators');
      return response.json();
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    staleTime: 8 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
          <span className="text-sm text-slate-600">Analyzing economic data...</span>
        </div>
      </div>
    );
  }

  if (error || !indicators) {
    return (
      <div className="text-center py-8">
        <DollarSign className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Unable to load economic indicators</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg border p-4">
        <h5 className="font-medium text-slate-900 mb-3">Economic Trends</h5>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Inflation</span>
            <Badge variant={indicators.inflationTrend === 'rising' ? 'destructive' : 'secondary'}>
              {indicators.inflationTrend}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Interest Rates</span>
            <Badge variant={indicators.interestRateDirection === 'up' ? 'destructive' : 'secondary'}>
              {indicators.interestRateDirection}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">USD Strength</span>
            <Badge variant={indicators.currencyStrength === 'strong' ? 'default' : 'secondary'}>
              {indicators.currencyStrength}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <h5 className="font-medium text-slate-900 mb-3">Key Metrics</h5>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">GDP Growth</span>
            <span className="text-sm font-medium text-slate-900">{indicators.gdpGrowth}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Unemployment</span>
            <span className="text-sm font-medium text-slate-900">{indicators.unemploymentRate}%</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <h5 className="font-medium text-slate-900 mb-3">Oil Prices</h5>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">${indicators.commodityPrices.oil.price}</span>
          <div className="flex items-center space-x-1">
            {indicators.commodityPrices.oil.change >= 0 ? 
              <TrendingUp className="h-4 w-4 text-green-600" /> :
              <TrendingDown className="h-4 w-4 text-red-600" />
            }
            <span className={`text-sm font-medium ${
              indicators.commodityPrices.oil.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {indicators.commodityPrices.oil.change >= 0 ? '+' : ''}{indicators.commodityPrices.oil.change}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <h5 className="font-medium text-slate-900 mb-3">Gold Prices</h5>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">${indicators.commodityPrices.gold.price}</span>
          <div className="flex items-center space-x-1">
            {indicators.commodityPrices.gold.change >= 0 ? 
              <TrendingUp className="h-4 w-4 text-green-600" /> :
              <TrendingDown className="h-4 w-4 text-red-600" />
            }
            <span className={`text-sm font-medium ${
              indicators.commodityPrices.gold.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {indicators.commodityPrices.gold.change >= 0 ? '+' : ''}{indicators.commodityPrices.gold.change}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RealTimeAIAnalysis() {
  const [selectedSector, setSelectedSector] = useState('defense');

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-lg mr-4">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">Real-Time AI Analysis</CardTitle>
              <p className="text-lg text-slate-600">
                Live predictions powered by Perplexity AI with internet access
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Live Data</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conflicts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conflicts" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Conflict Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="markets" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Market Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="economics" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Economic Indicators</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="conflicts" className="space-y-4">
            <ConflictPredictions />
          </TabsContent>
          
          <TabsContent value="markets" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Sector Analysis</h3>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-48">
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const option = sectorOptions.find(opt => opt.value === selectedSector);
                        const IconComponent = option?.icon || Shield;
                        return (
                          <>
                            <IconComponent className="w-4 h-4" />
                            <span>{option?.label}</span>
                          </>
                        );
                      })()}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sectorOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <MarketAnalysisTab sector={selectedSector} />
          </TabsContent>
          
          <TabsContent value="economics" className="space-y-4">
            <EconomicIndicatorsTab />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>Data refreshes every 5 minutes</span>
            </div>
            <span>Powered by Perplexity AI</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}