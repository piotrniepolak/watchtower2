import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Globe, 
  Users, 
  Zap,
  ArrowRight,
  Star,
  Play
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg mr-3">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ConflictWatch</h1>
                <p className="text-xs text-slate-600">Defense & Conflict Analytics</p>
              </div>
            </div>
            <Button onClick={handleLogin} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              Real-time Intelligence Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Transform Geopolitical
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Intelligence
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Advanced analytics platform that transforms complex global conflict data into actionable insights 
              through AI-driven analysis and real-time market intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Analyzing
              </Button>
              <Button size="lg" variant="outline">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Comprehensive Intelligence Suite
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to understand global conflicts and their market implications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Real-time Market Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Live defense stock tracking with iShares US Aerospace & Defense ETF integration 
                  and authentic Yahoo Finance data feeds.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                    15+ Defense contractors
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                    30-second updates
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                    Global market coverage
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Conflict Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Comprehensive tracking of 12+ active global conflicts with AI-powered 
                  prediction and correlation analysis.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                    AI conflict predictions
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                    Real-time updates
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                    Interactive mapping
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Learning & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Daily AI-generated quizzes, news briefings, and competitive 
                  leaderboards for continuous learning.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                    Daily quizzes
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                    News briefings
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                    Leaderboards
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">12+</div>
              <div className="text-slate-600">Active Conflicts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">15+</div>
              <div className="text-slate-600">Defense Stocks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-slate-600">Correlation Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-slate-600">Real-time Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Intelligence Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the platform that's revolutionizing geopolitical and market analysis
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="bg-white text-blue-600 hover:bg-slate-50"
          >
            <Users className="mr-2 h-5 w-5" />
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg mr-3">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="font-bold text-white">ConflictWatch</span>
              </div>
              <p className="text-sm">
                Advanced geopolitical intelligence platform for modern decision makers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li>Dashboard</li>
                <li>Conflicts</li>
                <li>Markets</li>
                <li>AI Analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Features</h3>
              <ul className="space-y-2 text-sm">
                <li>Real-time Data</li>
                <li>AI Predictions</li>
                <li>Learning Hub</li>
                <li>Watchlists</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Contact</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 ConflictWatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}