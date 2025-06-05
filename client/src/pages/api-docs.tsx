import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Database, TrendingUp, Globe, Zap } from "lucide-react";

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">API Documentation</h1>
          <p className="text-slate-600">
            Access real-time conflict and defense market data through our RESTful API
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                ConflictWatch API provides programmatic access to our geopolitical intelligence platform.
                All endpoints return JSON data and use standard HTTP response codes.
              </p>
              <div className="bg-slate-100 rounded-lg p-4">
                <p className="text-sm font-mono text-slate-800">
                  Base URL: <span className="text-blue-600">https://your-domain.com/api</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Conflicts API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">GET</Badge>
                  <code className="text-sm font-mono">/api/conflicts</code>
                </div>
                <p className="text-slate-700 text-sm mb-3">Retrieve all global conflicts with current status and details</p>
                <div className="bg-slate-900 rounded-lg p-4 text-sm">
                  <pre className="text-green-400">
{`{
  "conflicts": [
    {
      "id": 1,
      "name": "Ukraine-Russia Conflict",
      "region": "Eastern Europe",
      "status": "Active",
      "severity": "High",
      "startDate": "2022-02-24",
      "casualties": 500000,
      "description": "Ongoing military conflict...",
      "keyPlayers": ["Ukraine", "Russia", "NATO"],
      "economicImpact": "Global supply chains affected"
    }
  ]
}`}
                  </pre>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">GET</Badge>
                  <code className="text-sm font-mono">/api/conflicts/{id}</code>
                </div>
                <p className="text-slate-700 text-sm">Get detailed information about a specific conflict</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Stocks API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">GET</Badge>
                  <code className="text-sm font-mono">/api/stocks</code>
                </div>
                <p className="text-slate-700 text-sm mb-3">Real-time defense contractor stock data from Yahoo Finance</p>
                <div className="bg-slate-900 rounded-lg p-4 text-sm">
                  <pre className="text-green-400">
{`{
  "stocks": [
    {
      "symbol": "LMT",
      "name": "Lockheed Martin Corporation",
      "price": 476.18,
      "change": -6.05,
      "changePercent": -1.26,
      "volume": 1250000,
      "marketCap": "$120.5B",
      "lastUpdated": "2025-06-05T17:46:54.000Z"
    }
  ]
}`}
                  </pre>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">GET</Badge>
                  <code className="text-sm font-mono">/api/stocks/{symbol}</code>
                </div>
                <p className="text-slate-700 text-sm">Get detailed data for a specific stock symbol</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Metrics API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">GET</Badge>
                  <code className="text-sm font-mono">/api/metrics</code>
                </div>
                <p className="text-slate-700 text-sm mb-3">Global platform metrics and defense index calculations</p>
                <div className="bg-slate-900 rounded-lg p-4 text-sm">
                  <pre className="text-green-400">
{`{
  "activeConflicts": 15,
  "totalConflicts": 17,
  "defenseIndex": 319.07,
  "defenseIndexChange": 2.34,
  "totalMarketCap": "766.1B",
  "averageVolatility": 1.8,
  "lastUpdated": "2025-06-05T17:46:54.000Z"
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Response Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700">200</Badge>
                  <span className="text-slate-700">Success - Request completed successfully</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">304</Badge>
                  <span className="text-slate-700">Not Modified - Data unchanged since last request</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-red-50 text-red-700">404</Badge>
                  <span className="text-slate-700">Not Found - Resource does not exist</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-red-50 text-red-700">500</Badge>
                  <span className="text-slate-700">Server Error - Internal server error</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                API requests are subject to rate limiting to ensure fair usage:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>100 requests per minute for public endpoints</li>
                <li>Data refreshes every 30 seconds for real-time accuracy</li>
                <li>Use HTTP caching headers to minimize redundant requests</li>
                <li>Contact support for higher rate limits if needed</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                Our API aggregates data from reliable, authentic sources:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li><strong>Yahoo Finance:</strong> Real-time stock market data</li>
                <li><strong>Public Databases:</strong> Conflict information and casualties</li>
                <li><strong>Government Sources:</strong> Official reports and statements</li>
                <li><strong>OpenAI:</strong> AI-powered analysis and predictions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">JavaScript/Node.js</h4>
                  <div className="bg-slate-900 rounded-lg p-4 text-sm">
                    <pre className="text-blue-400">
{`const response = await fetch('/api/stocks');
const data = await response.json();
console.log(data.stocks);`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Python</h4>
                  <div className="bg-slate-900 rounded-lg p-4 text-sm">
                    <pre className="text-blue-400">
{`import requests

response = requests.get('https://your-domain.com/api/conflicts')
data = response.json()
print(data['conflicts'])`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">cURL</h4>
                  <div className="bg-slate-900 rounded-lg p-4 text-sm">
                    <pre className="text-green-400">
{`curl -X GET "https://your-domain.com/api/metrics" \\
     -H "Accept: application/json"`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">
                Need help with the API? Contact our technical team at:{" "}
                <a href="mailto:api@conflictwatch.com" className="text-blue-600 hover:text-blue-800">
                  api@conflictwatch.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}