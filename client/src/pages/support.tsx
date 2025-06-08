import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Database, TrendingUp, Shield, Clock, Zap, MessageSquare } from "lucide-react";
import AISupportChat from "@/components/ai-support-chat";

export default function Support() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">AI Support Assistant</h1>
          </div>
          <p className="text-slate-600">
            Get instant help with ConflictWatch platform questions, powered by advanced AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Support Chat */}
          <div className="space-y-6">
            <AISupportChat />
          </div>

          {/* Support Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 mt-1 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Data Issues</h4>
                    <p className="text-sm text-slate-600">
                      Stock data refreshes every 30 seconds. Conflict data updates in real-time from verified sources.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 mt-1 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Market Data</h4>
                    <p className="text-sm text-slate-600">
                      All stock prices sourced from Yahoo Finance. Volume data reflects authentic trading activity.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-1 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Privacy & Security</h4>
                    <p className="text-sm text-slate-600">
                      Watchlists stored locally. No sensitive data transmitted. HTTPS encryption throughout.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI Assistant Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Response Time</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Instant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Platform Help</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">24/7</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Data Explanations</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Technical Support</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">GPT-4 Powered</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  AI Assistant Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Bot className="w-4 h-4 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">Platform Navigation</p>
                    <p className="text-sm text-slate-600">Get help using features, understanding dashboards, and accessing data</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Database className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">Data Interpretation</p>
                    <p className="text-sm text-slate-600">Understand stock correlations, conflict analysis, and market predictions</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium text-slate-900">Technical Troubleshooting</p>
                    <p className="text-sm text-slate-600">Resolve issues with loading, performance, or feature access</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <details className="group">
                  <summary className="cursor-pointer font-medium text-slate-900 group-open:text-blue-600">
                    Why is stock data not updating?
                  </summary>
                  <p className="text-sm text-slate-600 mt-2">
                    Stock data refreshes every 30 seconds from Yahoo Finance. Check your internet connection and refresh the page.
                  </p>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer font-medium text-slate-900 group-open:text-blue-600">
                    How accurate is the conflict data?
                  </summary>
                  <p className="text-sm text-slate-600 mt-2">
                    Conflict information is sourced from verified public databases and government reports. Data is cross-referenced for accuracy.
                  </p>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer font-medium text-slate-900 group-open:text-blue-600">
                    Can I export my watchlist?
                  </summary>
                  <p className="text-sm text-slate-600 mt-2">
                    Watchlists are stored locally in your browser. Use browser export tools or contact support for assistance.
                  </p>
                </details>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}