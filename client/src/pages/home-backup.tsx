import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Shield, Pill, Zap, Globe, TrendingUp, BarChart3, Activity, Target, Users, AlertTriangle, Brain, DollarSign, User } from "lucide-react";
import { getActiveSectors } from "@shared/sectors";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Conflict, Stock } from "@shared/schema";
import { CommunityChat } from "@/components/community-chat";
import { LearningHub } from "../components/learning-hub";
import { GlobalIntelligenceCenter } from "@/components/global-intelligence-center";

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



  // Calculate authentic data sources count
  const { data: dataSourcesCount = 25 } = useQuery({
    queryKey: ["/api/data-sources/count"],
    queryFn: async () => {
      const response = await fetch('/api/data-sources/count');
      if (!response.ok) throw new Error('Failed to fetch data sources count');
      const data = await response.json();
      return data.count;
    }
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
      href: "/defense"
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
      href: "/health"
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
      value: dataSourcesCount,
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

        {/* Sector Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {sectors.map((sector) => {
            const IconComponent = sector.icon;
            return (
              <Link key={sector.key} href={sector.href}>
                <Card className={`${sector.borderColor} border-2 hover:shadow-lg transition-all duration-200 cursor-pointer h-full`}>
                  <CardHeader className="text-center">
                    <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${sector.color} rounded-xl flex items-center justify-center mb-4`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{sector.name}</CardTitle>
                    <CardDescription className="text-sm">{sector.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                        {sector.key === 'defense' && (
                          <>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">{conflicts.length}</span>
                              <span className="text-slate-600">Active Conflicts</span>
                            </div>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">{stocks.filter(s => s.sector === 'Defense').length}</span>
                              <span className="text-slate-600">Defense Stocks</span>
                            </div>
                          </>
                        )}
                        {sector.key === 'health' && (
                          <>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">195</span>
                              <span className="text-slate-600">Countries</span>
                            </div>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">{stocks.filter(s => s.sector === 'Healthcare').length}</span>
                              <span className="text-slate-600">Health Stocks</span>
                            </div>
                          </>
                        )}
                        {sector.key === 'energy' && (
                          <>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">8</span>
                              <span className="text-slate-600">Commodities</span>
                            </div>
                            <div className="text-center">
                              <span className="font-semibold text-slate-900 block text-lg">{stocks.filter(s => s.sector === 'Energy').length}</span>
                              <span className="text-slate-600">Energy Stocks</span>
                            </div>
                          </>
                        )}
                      </div>
                      <Button className={`w-full bg-gradient-to-r ${sector.color} text-white hover:opacity-90`}>
                        Enter {sector.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>


        {/* AI Analysis Section - Sector Selection */}
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Choose Your Intelligence Sector</h3>
              <p className="text-sm text-slate-600">Select a sector to access specialized analytics and intelligence</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sectors.map((sector) => {
                const IconComponent = sector.icon;
                return (
                  <Link key={sector.key} href={`${sector.href}/dashboard`}>
                    <Card className={`${sector.borderColor} border hover:shadow-md transition-shadow cursor-pointer`}>
                      <CardContent className="p-4 text-center">
                        <IconComponent className={`h-8 w-8 mx-auto mb-2 ${sector.textColor}`} />
                        <h4 className="font-medium text-sm">{sector.name}</h4>
                        <p className="text-xs text-slate-600 mt-1">AI-powered analytics</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
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

        {/* Global Intelligence Center */}
        <div className="mt-8">
          <GlobalIntelligenceCenter />
        </div>

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
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Szymon Kordyl</h3>
              <p className="text-orange-600 font-medium mb-3">Co-Founder and Director of EnergyWatch</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Currently completing his BSc in Economics & Business Economics at the University of Amsterdam, Szymon pairs rigorous economic training with a lifelong fascination for geography and geopolitics. His research focuses on how spatial dynamics shape markets a perspective showcased in his recent published paper on Warsaw's emerging Central Business District. At Watchtower, he channels this evidence-based approach into EnergyWatch, transforming global geopolitical trends into clear, actionable intelligence for investors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}