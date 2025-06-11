import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Pill, Zap, Globe, TrendingUp, BarChart3, Activity, AlertTriangle, Users, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Conflict, Stock } from "@shared/schema";
import { CommunityChat } from "@/components/community-chat";
import { LearningHub } from "../components/learning-hub";

export default function StreamlinedHome() {
  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ["/api/conflicts"],
  });

  const { data: stocks = [] } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
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
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
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

        {/* Streamlined Sector Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {sectors.map((sector) => {
            const IconComponent = sector.icon;
            return (
              <Card key={sector.key} className={`${sector.borderColor} border-2 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer`}>
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`bg-gradient-to-r ${sector.color} text-white p-4 rounded-xl`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-slate-900">{sector.name}</CardTitle>
                  <CardDescription className="text-slate-600">{sector.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Sector-specific stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {sector.key === 'defense' && (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{sector.stats.conflicts}</div>
                          <div className="text-xs text-slate-600">Conflicts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{sector.stats.stocks}</div>
                          <div className="text-xs text-slate-600">Defense Stocks</div>
                        </div>
                      </>
                    )}
                    {sector.key === 'health' && (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{sector.stats.countries}</div>
                          <div className="text-xs text-slate-600">Countries</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{sector.stats.stocks}</div>
                          <div className="text-xs text-slate-600">Pharma Stocks</div>
                        </div>
                      </>
                    )}
                    {sector.key === 'energy' && (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{sector.stats.commodities}</div>
                          <div className="text-xs text-slate-600">Commodities</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{sector.stats.stocks}</div>
                          <div className="text-xs text-slate-600">Energy Stocks</div>
                        </div>
                      </>
                    )}
                  </div>

                  <Link href={`/dashboard?sector=${sector.key}`}>
                    <Button size="lg" className={`w-full bg-gradient-to-r ${sector.color} text-white hover:opacity-90 text-sm font-semibold`}>
                      Explore {sector.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Community Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Community Chat */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg mr-4">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">Community Chat</CardTitle>
                  <CardDescription>
                    Connect with analysts and discuss market insights across all sectors
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CommunityChat />
            </CardContent>
          </Card>

          {/* Learning Hub */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-3 rounded-lg mr-4">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">Learning Hub</CardTitle>
                  <CardDescription>
                    Test your knowledge with daily quizzes and earn badges
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LearningHub />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}