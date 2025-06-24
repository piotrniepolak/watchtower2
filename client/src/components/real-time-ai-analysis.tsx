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
  const [selectedConflictIndex, setSelectedConflictIndex] = useState<string | null>(null);
  
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
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-900">Select Conflict for Analysis</h4>
            <Badge variant="outline">{analysis.conflicts.length} Active Conflicts</Badge>
          </div>
          <Select value={selectedConflictIndex || ""} onValueChange={setSelectedConflictIndex}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a conflict to analyze..." />
            </SelectTrigger>
            <SelectContent>
              {analysis.conflicts.map((conflict: any, index: number) => (
                <SelectItem key={index} value={index.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{conflict.name}</span>
                    <Badge variant={conflict.escalationRisk > 75 ? 'destructive' : conflict.escalationRisk > 50 ? 'secondary' : 'default'} className="ml-2">
                      {conflict.escalationRisk}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedConflictIndex !== null ? (
          // Show only selected conflict
          (() => {
            const conflict = analysis.conflicts[parseInt(selectedConflictIndex)];
            return (
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-slate-500" />
                    <h4 className="font-semibold text-slate-900">{conflict.name}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={conflict.escalationRisk > 75 ? 'destructive' : conflict.escalationRisk > 50 ? 'secondary' : 'default'}>
                      {conflict.escalationRisk}% Risk
                    </Badge>
                    <Badge variant="outline">
                      {conflict.probability}% Probability
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded">
                    <p className="text-sm text-slate-600 mb-1"><strong>📍 Region:</strong> {conflict.region}</p>
                    <p className="text-sm text-slate-600 mb-1"><strong>⏱️ Timeframe:</strong> {conflict.timeframe}</p>
                    <p className="text-sm text-slate-700">{conflict.defenseImpact}</p>
                  </div>

                  {conflict.lastUpdate && (
                    <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                      <h6 className="text-sm font-medium text-green-800 mb-1">Latest Developments (48 Hours)</h6>
                      <p className="text-sm text-green-700">{conflict.lastUpdate}</p>
                    </div>
                  )}

                  {conflict.recentDevelopments && (
                    <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                      <h6 className="text-sm font-medium text-purple-800 mb-1">Recent Developments Analysis</h6>
                      <p className="text-sm text-purple-700">{conflict.recentDevelopments}</p>
                    </div>
                  )}

                  <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                    <h6 className="text-sm font-medium text-amber-800 mb-1">Risk Assessment Explanation</h6>
                    <p className="text-sm text-amber-700">{conflict.riskExplanation}</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <h6 className="text-sm font-medium text-blue-800 mb-1">Probability Analysis</h6>
                    <p className="text-sm text-blue-700">{conflict.probabilityExplanation}</p>
                  </div>

                  <div>
                    <h6 className="text-sm font-medium text-slate-900 mb-2">Key Developments</h6>
                    <div className="flex flex-wrap gap-1">
                      {conflict.keyDevelopments?.map((dev: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">{dev}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          // Show message when no conflict selected
          <div className="bg-slate-50 border rounded-lg p-8 text-center">
            <Globe className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h4 className="font-medium text-slate-900 mb-2">Select a Conflict for Detailed Analysis</h4>
            <p className="text-sm text-slate-600">
              Choose a conflict from the dropdown above to view real-time intelligence, risk assessments, and latest developments.
            </p>
          </div>
        )}
        
        {analysis.emergingThreats && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-medium mb-2">Emerging Threats</h5>
            <div className="flex flex-wrap gap-2">
              {analysis.emergingThreats?.map((threat: string, idx: number) => (
                <Badge key={idx} variant="secondary">{threat}</Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.globalTensions && (
          <div className="bg-blue-50 border rounded-lg p-4 border-l-4 border-blue-400">
            <h5 className="font-medium text-blue-900 mb-2">Global Security Assessment</h5>
            <p className="text-sm text-blue-800">{analysis.globalTensions}</p>
          </div>
        )}
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
              <div className="flex items-center space-x-2">
                <Badge variant={threat.severity === 'High' ? 'destructive' : threat.severity === 'Medium' ? 'secondary' : 'default'}>
                  {threat.severity} Severity
                </Badge>
                <Badge variant="outline">
                  {threat.riskLevel}% Risk
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-sm text-slate-600 mb-1"><strong>🌍 Affected Regions:</strong> {threat.regions?.join(', ')}</p>
                <p className="text-sm text-slate-600 mb-1"><strong>⏱️ Timeframe:</strong> {threat.timeframe}</p>
                <p className="text-sm text-slate-600"><strong>💥 Impact Potential:</strong> {threat.impactPotential}</p>
              </div>

              <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                <h6 className="text-sm font-medium text-red-800 mb-1">Risk Assessment Explanation</h6>
                <p className="text-sm text-red-700">{threat.riskExplanation}</p>
              </div>

              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                <h6 className="text-sm font-medium text-blue-800 mb-1">Preparedness Status</h6>
                <p className="text-sm text-blue-700 mb-2">{threat.preparedness}</p>
                <p className="text-sm text-blue-600">{threat.preparednessDetails}</p>
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
        <div className="space-y-4">
          {analysis.topStocks?.slice(0, 3).map((stock, index) => (
            <div key={index} className="border rounded p-3 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-slate-900">{stock.symbol}</span>
                  <Badge variant={stock.prediction === 'buy' ? 'default' : 
                                 stock.prediction === 'sell' ? 'destructive' : 'secondary'}>
                    {stock.prediction.toUpperCase()}
                  </Badge>
                </div>
                <Badge variant="outline">{stock.confidence}% Confidence</Badge>
              </div>
              <div className="bg-white p-2 rounded border-l-4 border-blue-400">
                <h6 className="text-xs font-medium text-blue-800 mb-1">Investment Reasoning</h6>
                <p className="text-xs text-blue-700">{stock.reasoning}</p>
                {stock.confidence > 70 && (
                  <p className="text-xs text-green-600 mt-1">
                    <strong>High Confidence:</strong> Multiple positive indicators align with this recommendation
                  </p>
                )}
                {stock.confidence < 60 && (
                  <p className="text-xs text-amber-600 mt-1">
                    <strong>Moderate Confidence:</strong> Mixed signals require careful monitoring
                  </p>
                )}
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
          <h4 className="font-semibold text-slate-900 mb-3">Contract Activity Analysis</h4>
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-800">Total Contract Value</span>
                <Badge variant="default">${indicators.contractActivity?.totalValue}B</Badge>
              </div>
              <p className="text-xs text-green-700">{indicators.contractActivity?.totalValueExplanation}</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-800">Market Trend</span>
                <Badge variant="outline">{indicators.contractActivity?.trend}</Badge>
              </div>
              <p className="text-xs text-blue-700">{indicators.contractActivity?.trendExplanation}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 md:col-span-2">
          <h4 className="font-semibold text-slate-900 mb-3">Major Defense Contracts</h4>
          <div className="space-y-3">
            {indicators.contractActivity?.majorContracts?.map((contract: any, idx: number) => (
              <div key={idx} className="border rounded p-3 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-slate-900">{contract.name}</h6>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">{contract.value}</Badge>
                    <Badge variant="outline" className="text-xs">{contract.timeframe}</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-700 mb-2">{contract.explanation}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Prime Contractor: {contract.contractor}</span>
                </div>
              </div>
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
          <h4 className="font-semibold text-slate-900 mb-3">Drug Pipeline Analysis</h4>
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-green-800">New Drug Approvals</span>
                <Badge variant="default">{indicators.pharmaceuticalPipeline?.newDrugs} drugs</Badge>
              </div>
              <p className="text-xs text-green-700">{indicators.pharmaceuticalPipeline?.newDrugsExplanation}</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-800">Approval Success Rate</span>
                <Badge variant="outline">{indicators.pharmaceuticalPipeline?.approvalRate}%</Badge>
              </div>
              <p className="text-xs text-blue-700">{indicators.pharmaceuticalPipeline?.approvalRateExplanation}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 md:col-span-2">
          <h4 className="font-semibold text-slate-900 mb-3">Therapeutic Areas Analysis</h4>
          <div className="space-y-3">
            {indicators.pharmaceuticalPipeline?.majorAreas?.map((areaData: any, idx: number) => (
              <div key={idx} className="border rounded p-3 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-slate-900">{areaData.area}</h6>
                  <Badge variant="outline" className="text-xs">Active Development</Badge>
                </div>
                <p className="text-sm text-slate-700">{areaData.details}</p>
              </div>
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