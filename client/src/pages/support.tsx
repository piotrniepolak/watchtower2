import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle, FileText, Database, TrendingUp, Shield, Clock } from "lucide-react";

export default function Support() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Support Center</h1>
          <p className="text-slate-600">
            Get help with ConflictWatch platform, data sources, and technical issues
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                
                <div>
                  <Label htmlFor="category">Issue Category</Label>
                  <select 
                    id="category" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical Issues</option>
                    <option value="data">Data Accuracy</option>
                    <option value="api">API Support</option>
                    <option value="account">Account Issues</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief description of your issue" />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    rows={6}
                    placeholder="Please provide detailed information about your issue, including any error messages and steps to reproduce the problem..."
                  />
                </div>
                
                <Button className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
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
                  <Clock className="w-5 h-5" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Technical Issues</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">2-4 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Data Questions</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">4-8 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">API Support</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">1-2 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">General Inquiries</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">24 hours</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Direct Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">General Support</p>
                    <a href="mailto:support@conflictwatch.com" className="text-blue-600 hover:text-blue-800 text-sm">
                      support@conflictwatch.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">API & Technical</p>
                    <a href="mailto:api@conflictwatch.com" className="text-blue-600 hover:text-blue-800 text-sm">
                      api@conflictwatch.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">Privacy & Security</p>
                    <a href="mailto:privacy@conflictwatch.com" className="text-blue-600 hover:text-blue-800 text-sm">
                      privacy@conflictwatch.com
                    </a>
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