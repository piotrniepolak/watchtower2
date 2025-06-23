import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Pill, 
  Zap, 
  Brain,
  Globe,
  TrendingUp,
  BarChart3,
  Users,
  User,
  LinkedinIcon as LinkedIn
} from "lucide-react";
import { Link } from "wouter";

interface SectorMetrics {
  totalStocks: number;
  avgChange: number;
  marketCap: string;
  volatility: number;
}

export default function Home() {
  
  // Fetch global metrics for overview
  const { data: globalMetrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  // Fetch data for sector metrics
  const { data: conflicts = [] } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const { data: stocks = [] } = useQuery({
    queryKey: ["/api/stocks"],
  });

  // Sector configuration with updated paths
  const sectors = [
    {
      key: 'defense',
      name: 'ConflictWatch',
      description: 'Defense & Geopolitical Intelligence',
      icon: Shield,
      color: 'from-blue-600 to-indigo-600',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      href: '/defense'
    },
    {
      key: 'health', 
      name: 'PharmaWatch',
      description: 'Global Health Intelligence',
      icon: Pill,
      color: 'from-green-600 to-emerald-600',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      href: '/health'
    },
    {
      key: 'energy',
      name: 'EnergyWatch', 
      description: 'Energy & Climate Intelligence',
      icon: Zap,
      color: 'from-orange-600 to-yellow-600',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600',
      href: '/energy'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-6">
            Watchtower
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Multi-Domain Intelligence Platform delivering comprehensive global insights through AI-powered predictive analytics across defense, health, and energy sectors.
          </p>
          
          {/* Global Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/70 backdrop-blur border-slate-200">
              <CardContent className="p-6 text-center">
                <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{conflicts.length}</div>
                <div className="text-sm text-slate-600">Active Conflicts</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur border-slate-200">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">195</div>
                <div className="text-sm text-slate-600">Countries Monitored</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur border-slate-200">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{stocks.length}</div>
                <div className="text-sm text-slate-600">Tracked Stocks</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur border-slate-200">
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">24/7</div>
                <div className="text-sm text-slate-600">AI Analysis</div>
              </CardContent>
            </Card>
          </div>
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

        {/* Team Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Team</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Meet the experts behind Watchtower's multi-domain intelligence platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* First Team Member */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-4 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/attached_assets/L'INTENDANCE BEACH129_1749661292456.JPG"
                    alt="Louis Magzoub"
                    className="w-full h-full object-cover"
                    onError={(e) => {
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
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Louis Magzoub</h3>
              <p className="text-blue-600 font-medium mb-3">Co-Founder and Director of ConflictWatch</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Louis brings extensive expertise in conflict analysis and geopolitical intelligence. His deep understanding of global security dynamics and strategic foresight drives ConflictWatch's comprehensive defense sector insights.
              </p>
            </div>

            {/* Second Team Member */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 mx-auto mb-4 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/attached_assets/atlas-beach-photo.jpg"
                    alt="Atlas Loutfi"
                    className="w-full h-full object-cover"
                    onError={(e) => {
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

            {/* Third Team Member */}
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