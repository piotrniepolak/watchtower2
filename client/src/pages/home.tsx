import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Pill, Zap, Globe, TrendingUp, BarChart3, Activity, Target, Users, AlertTriangle, Brain, Lightbulb, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Conflict, Stock } from "@shared/schema";

interface SectorMetrics {
  totalStocks: number;
  avgChange: number;
  marketCap: string;
  volatility: number;
}

export default function Home() {
  const [selectedSector, setSelectedSector] = useState("defense");
  
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
    queryFn: () => fetch(`/api/analysis/predictions?sector=${selectedSector}`).then(res => res.json()),
  });

  const { data: marketAnalysis, isLoading: marketLoading } = useQuery({
    queryKey: ["/api/analysis/market", selectedSector],
    queryFn: () => fetch(`/api/analysis/market?sector=${selectedSector}`).then(res => res.json()),
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
            Multi-Sector Intelligence Platform
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transforming complex global data into actionable insights through AI-driven analysis 
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

        {/* Sector Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {sectors.map((sector) => {
            const IconComponent = sector.icon;
            return (
              <Card key={sector.key} className={`${sector.borderColor} border-2 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-r ${sector.color} text-white p-3 rounded-lg`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <Badge variant="outline" className={sector.textColor}>
                      {sector.key.charAt(0).toUpperCase() + sector.key.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{sector.name}</CardTitle>
                  <CardDescription className="text-base">
                    {sector.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {sector.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${sector.color}`}></div>
                        <span className="text-sm text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`${sector.bgColor} p-3 rounded-lg mb-4`}>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      {sector.key === 'defense' && (
                        <>
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{sector.stats.conflicts}</div>
                            <div className="text-xs text-slate-600">Active Conflicts</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{sector.stats.stocks}</div>
                            <div className="text-xs text-slate-600">Defense Stocks</div>
                          </div>
                        </>
                      )}
                      {sector.key === 'health' && (
                        <>
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{sector.stats.countries}</div>
                            <div className="text-xs text-slate-600">Countries</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{sector.stats.stocks}</div>
                            <div className="text-xs text-slate-600">Health Stocks</div>
                          </div>
                        </>
                      )}
                      {sector.key === 'energy' && (
                        <>
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{sector.stats.commodities}</div>
                            <div className="text-xs text-slate-600">Commodities</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{sector.stats.stocks}</div>
                            <div className="text-xs text-slate-600">Energy Stocks</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Link href={sector.key === 'defense' ? '/' : sector.key === 'health' ? '/?sector=health' : '/?sector=energy'}>
                    <Button className={`w-full bg-gradient-to-r ${sector.color} text-white hover:opacity-90`}>
                      Explore {sector.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
                <Select value={selectedSector} onValueChange={setSelectedSector}>
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
                          {marketAnalysis.keyDrivers?.slice(0, 3).map((driver, index) => (
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
                      {predictions.slice(0, 2).map((prediction, index) => (
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