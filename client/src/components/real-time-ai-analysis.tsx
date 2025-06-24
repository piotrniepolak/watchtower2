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

// Helper functions for sector-specific tabs
function getDefaultTab(sector: string): string {
  return getTabKey(sector, 'analysis');
}

function getTabKey(sector: string, type: 'analysis' | 'indicators'): string {
  if (type === 'analysis') {
    switch (sector) {
      case 'defense': return 'conflicts';
      case 'health': return 'threats';
      case 'energy': return 'disruptions';
      default: return 'conflicts';
    }
  } else {
    return 'indicators';
  }
}

function getAnalysisTabName(sector: string): string {
  switch (sector) {
    case 'defense': return 'Conflict Predictions';
    case 'health': return 'Health Threats';
    case 'energy': return 'Supply Disruptions';
    default: return 'Conflict Predictions';
  }
}

function getIndicatorsTabName(sector: string): string {
  switch (sector) {
    case 'defense': return 'Defense Metrics';
    case 'health': return 'Health Indicators';
    case 'energy': return 'Energy Outlook';
    default: return 'Defense Metrics';
  }
}

function SectorAnalysisTab({ sector }: { sector: string }) {
  const { data: analysis, isLoading, error } = useQuery<any>({
    queryKey: ['/api/ai-analysis/sector-analysis', sector],
    queryFn: async () => {
      console.log(`Fetching sector analysis for: ${sector}`);
      const response = await fetch(`/api/ai-analysis/sector-analysis/${sector}`);
      if (!response.ok) throw new Error(`Failed to fetch ${sector} analysis`);
      const data = await response.json();
      console.log(`Sector analysis for ${sector}:`, data);
      return data;
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
          <span className="text-sm text-slate-600">Analyzing {sector} sector...</span>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Unable to load {sector} analysis</p>
      </div>
    );
  }

  // Render different content based on sector
  if (sector === 'defense' && analysis.conflicts) {
    return (
      <div className="space-y-4">
        {analysis.conflicts.map((conflict: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-slate-500" />
                <h4 className="font-semibold text-slate-900">{conflict.name}</h4>
              </div>
              <Badge variant={conflict.escalationRisk > 75 ? 'destructive' : conflict.escalationRisk > 50 ? 'secondary' : 'default'}>
                {conflict.escalationRisk}% Risk
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">📍 {conflict.region}</p>
              <p className="text-sm text-slate-700">{conflict.defenseImpact}</p>
              <div className="flex flex-wrap gap-1">
                {conflict.keyDevelopments?.map((dev: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">{dev}</Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="bg-slate-50 rounded-lg p-4">
          <h5 className="font-medium mb-2">Emerging Threats</h5>
          <div className="flex flex-wrap gap-2">
            {analysis.emergingThreats?.map((threat: string, idx: number) => (
              <Badge key={idx} variant="secondary">{threat}</Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sector === 'health' && analysis.healthThreats) {
    return (
      <div className="space-y-4">
        {analysis.healthThreats.map((threat: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-900">{threat.name}</h4>
              <Badge variant={threat.severity === 'High' ? 'destructive' : threat.severity === 'Medium' ? 'secondary' : 'default'}>
                {threat.severity}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">🌍 {threat.regions?.join(', ')}</p>
              <p className="text-sm text-slate-700">{threat.preparedness}</p>
              <div className="bg-red-50 p-2 rounded">
                <span className="text-sm font-medium text-red-800">Risk Level: {threat.riskLevel}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sector === 'energy' && analysis.supplyDisruptions) {
    return (
      <div className="space-y-4">
        {analysis.supplyDisruptions.map((disruption: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-900">{disruption.source}</h4>
              <Badge variant={disruption.severity > 75 ? 'destructive' : 'secondary'}>
                {disruption.severity}% Impact
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-700">{disruption.impact}</p>
              <p className="text-sm text-slate-600">⏱️ Duration: {disruption.duration}</p>
              <p className="text-sm text-slate-600">🌍 Affected: {disruption.affectedRegions?.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-sm text-slate-500">No analysis data available</p>
    </div>
  );
}

function MarketAnalysisTab({ sector }: { sector: string }) {
  const { data: analysis, isLoading, error } = useQuery<MarketAnalysis>({
    queryKey: ['/api/ai-analysis/market', sector],
    queryFn: async () => {
      console.log(`Fetching market analysis for sector: ${sector}`);
      const response = await fetch(`/api/ai-analysis/market/${sector}`);
      if (!response.ok) throw new Error('Failed to fetch market analysis');
      const data = await response.json();
      console.log(`Market analysis for ${sector}:`, data);
      return data;
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
          <span className="text-sm text-slate-600">Analyzing {sector} markets...</span>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Unable to load market analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-900">Market Sentiment</h4>
          <Badge variant={analysis.overallSentiment === 'bullish' ? 'default' : 
                         analysis.overallSentiment === 'bearish' ? 'destructive' : 'secondary'}>
            {analysis.overallSentiment}
          </Badge>
        </div>
        <p className="text-sm text-slate-700 mb-3">{analysis.marketOutlook}</p>
        
        <div className="space-y-2">
          <div>
            <h5 className="text-xs font-medium text-slate-900 mb-1">Key Drivers:</h5>
            <div className="flex flex-wrap gap-1">
              {analysis.keyDrivers?.map((driver, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">{driver}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-semibold text-slate-900 mb-3">Top Stock Recommendations</h4>
        <div className="space-y-3">
          {analysis.topStocks?.slice(0, 3).map((stock, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-900">{stock.symbol}</span>
                <Badge variant={stock.prediction === 'buy' ? 'default' : 
                               stock.prediction === 'sell' ? 'destructive' : 'secondary'}>
                  {stock.prediction}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{stock.confidence}% confidence</div>
                <div className="text-xs text-slate-600">{stock.reasoning}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectorIndicatorsTab({ sector }: { sector: string }) {
  const { data: indicators, isLoading, error } = useQuery<any>({
    queryKey: ['/api/ai-analysis/sector-indicators', sector],
    queryFn: async () => {
      console.log(`Fetching sector indicators for: ${sector}`);
      const response = await fetch(`/api/ai-analysis/sector-indicators/${sector}`);
      if (!response.ok) throw new Error(`Failed to fetch ${sector} indicators`);
      const data = await response.json();
      console.log(`Sector indicators for ${sector}:`, data);
      return data;
    },
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
          <span className="text-sm text-slate-600">Analyzing {sector} indicators...</span>
        </div>
      </div>
    );
  }

  if (error || !indicators) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Unable to load {sector} indicators</p>
      </div>
    );
  }

  // Render different indicators based on sector
  if (sector === 'defense' && indicators.globalDefenseSpending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3">Global Defense Spending</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Total ($B)</span>
              <span className="text-sm font-medium">{indicators.globalDefenseSpending.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Growth</span>
              <span className="text-sm font-medium text-green-600">+{indicators.globalDefenseSpending.growth}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3">Contract Activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Total Value ($B)</span>
              <span className="text-sm font-medium">{indicators.contractActivity?.totalValue}</span>
            </div>
            <Badge variant="default">{indicators.contractActivity?.trend}</Badge>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 md:col-span-2">
          <h4 className="font-semibold text-slate-900 mb-3">Technology Focus</h4>
          <div className="flex flex-wrap gap-2">
            {indicators.technologyFocus?.map((tech: string, idx: number) => (
              <Badge key={idx} variant="outline">{tech}</Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sector === 'health' && indicators.globalHealthSpending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3">Global Health Spending</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">% of GDP</span>
              <span className="text-sm font-medium">{indicators.globalHealthSpending.gdpPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Growth</span>
              <span className="text-sm font-medium text-green-600">+{indicators.globalHealthSpending.growth}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3">Drug Pipeline</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">New Drugs</span>
              <span className="text-sm font-medium">{indicators.pharmaceuticalPipeline?.newDrugs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Approval Rate</span>
              <span className="text-sm font-medium">{indicators.pharmaceuticalPipeline?.approvalRate}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 md:col-span-2">
          <h4 className="font-semibold text-slate-900 mb-3">Major Areas</h4>
          <div className="flex flex-wrap gap-2">
            {indicators.pharmaceuticalPipeline?.majorAreas?.map((area: string, idx: number) => (
              <Badge key={idx} variant="outline">{area}</Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sector === 'energy' && indicators.globalEnergyDemand) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3">Energy Demand</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Total (EJ)</span>
              <span className="text-sm font-medium">{indicators.globalEnergyDemand.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Renewable Share</span>
              <span className="text-sm font-medium text-green-600">{indicators.globalEnergyDemand.renewableShare}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3">Oil Markets</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Price ($/barrel)</span>
              <span className="text-sm font-medium">${indicators.oilMarkets?.price}</span>
            </div>
            <Badge variant="destructive">{indicators.oilMarkets?.volatility} volatility</Badge>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 md:col-span-2">
          <h4 className="font-semibold text-slate-900 mb-3">Renewable Capacity (GW)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{indicators.renewableCapacity?.solar}</div>
              <div className="text-xs text-slate-600">Solar</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{indicators.renewableCapacity?.wind}</div>
              <div className="text-xs text-slate-600">Wind</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-600">{indicators.renewableCapacity?.additions}</div>
              <div className="text-xs text-slate-600">Total Additions</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-sm text-slate-500">No indicators data available</p>
    </div>
  );
}

const sectorOptions = [
  { value: 'defense', label: 'ConflictWatch', icon: Shield },
  { value: 'health', label: 'PharmaWatch', icon: Pill },
  { value: 'energy', label: 'EnergyWatch', icon: Zap }
];

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
          <div className="flex items-center space-x-4">
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
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Live Data</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={getDefaultTab(selectedSector)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value={getTabKey(selectedSector, 'analysis')} className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>{getAnalysisTabName(selectedSector)}</span>
            </TabsTrigger>
            <TabsTrigger value="markets" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Market Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="indicators" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>{getIndicatorsTabName(selectedSector)}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={getTabKey(selectedSector, 'analysis')} className="space-y-4">
            <SectorAnalysisTab sector={selectedSector} />
          </TabsContent>
          
          <TabsContent value="markets" className="space-y-4">
            <MarketAnalysisTab sector={selectedSector} />
          </TabsContent>
          
          <TabsContent value="indicators" className="space-y-4">
            <SectorIndicatorsTab sector={selectedSector} />
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