import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, DollarSign, Target, AlertCircle } from "lucide-react";

interface HealthOpportunityCountry {
  name: string;
  iso3: string;
  healthScore: number;
  gdpPerCapita: number;
  opportunityScore: number;
  marketPotential: string;
  keyFactors: string[];
  recommendedSectors: string[];
}

export default function WhoHealthOpportunityAnalysis() {
  const [selectedCountry, setSelectedCountry] = useState<HealthOpportunityCountry | null>(null);

  const { data: opportunities = [], isLoading } = useQuery<HealthOpportunityCountry[]>({
    queryKey: ['/api/health/opportunities'],
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });

  const getOpportunityColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getMarketPotentialBadge = (potential: string) => {
    const potentialLower = potential.toLowerCase();
    if (potentialLower.includes('very high') || potentialLower.includes('high')) {
      return <Badge variant="destructive">{potential}</Badge>;
    }
    if (potentialLower.includes('moderate')) {
      return <Badge variant="secondary">{potential}</Badge>;
    }
    return <Badge variant="outline">{potential}</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
            WHO Composite Health Score Opportunity Analysis
          </CardTitle>
          <CardDescription>Analyzing health investment opportunities using AI-driven insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Analysis Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            WHO Composite Health Score Opportunity Analysis
          </CardTitle>
          <CardDescription>
            Countries with low health scores relative to GDP per capita, indicating high demand for healthcare solutions among consumers with expendable income
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Countries Analyzed</p>
                  <p className="text-2xl font-bold text-blue-700">{opportunities.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-blue-600 mt-1">High-opportunity markets</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Avg GDP per Capita</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${opportunities.length > 0 ? Math.round(opportunities.reduce((sum, c) => sum + c.gdpPerCapita, 0) / opportunities.length).toLocaleString() : '0'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-green-600 mt-1">Consumer purchasing power</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Avg Health Gap</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {opportunities.length > 0 ? Math.round(100 - opportunities.reduce((sum, c) => sum + c.healthScore, 0) / opportunities.length) : 0}%
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-orange-600 mt-1">Health infrastructure gap</p>
            </div>
          </div>

          {/* Opportunity Countries List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Investment Opportunity Rankings</h4>
            <div className="grid gap-3">
              {opportunities.map((country, index) => (
                <div
                  key={country.iso3}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCountry?.iso3 === country.iso3 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCountry(selectedCountry?.iso3 === country.iso3 ? null : country)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-gray-500 w-6">
                        #{index + 1}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{country.name}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">
                            GDP: ${country.gdpPerCapita.toLocaleString()}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">
                            Health Score: {country.healthScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getMarketPotentialBadge(country.marketPotential)}
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded-full ${getOpportunityColor(country.opportunityScore)}`}
                          title={`Opportunity Score: ${country.opportunityScore}`}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {country.opportunityScore}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedCountry?.iso3 === country.iso3 && (
                    <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
                      <div>
                        <h6 className="font-medium text-gray-900 mb-2">Key Market Factors</h6>
                        <div className="flex flex-wrap gap-2">
                          {country.keyFactors.map((factor, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h6 className="font-medium text-gray-900 mb-2">Recommended Healthcare Sectors</h6>
                        <div className="flex flex-wrap gap-2">
                          {country.recommendedSectors.map((sector, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <h6 className="font-medium text-gray-900 mb-1">Investment Rationale</h6>
                        <p className="text-sm text-gray-600">
                          With a GDP per capita of ${country.gdpPerCapita.toLocaleString()} and health score of {country.healthScore.toFixed(1)}, 
                          {country.name} represents a {country.marketPotential.toLowerCase()} opportunity for healthcare companies. 
                          Consumers have significant purchasing power but face healthcare access challenges, creating strong market demand.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methodology Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Analysis Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>WHO Statistical Annex</strong>: 36 health indicators</li>
                <li>• <strong>World Bank</strong>: GDP per capita data</li>
                <li>• <strong>AI Analysis</strong>: Market opportunity assessment</li>
                <li>• <strong>Real-time Research</strong>: Current market conditions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Opportunity Calculation</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>GDP Weight (60%)</strong>: Consumer purchasing power</li>
                <li>• <strong>Health Gap (40%)</strong>: Infrastructure needs</li>
                <li>• <strong>Market Context</strong>: Regulatory environment</li>
                <li>• <strong>Growth Potential</strong>: Economic trajectory</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}