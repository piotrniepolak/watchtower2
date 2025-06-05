import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-600">Last updated: June 5, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Data Sources</h3>
                <p className="text-slate-700">
                  ConflictWatch aggregates publicly available information from reliable sources including:
                </p>
                <ul className="list-disc list-inside mt-2 text-slate-700 space-y-1">
                  <li>Yahoo Finance API for real-time stock market data</li>
                  <li>Public conflict databases and news sources</li>
                  <li>Government and international organization reports</li>
                  <li>Defense industry public filings</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">User Data</h3>
                <p className="text-slate-700">
                  We collect minimal user data necessary for platform functionality:
                </p>
                <ul className="list-disc list-inside mt-2 text-slate-700 space-y-1">
                  <li>Watchlist preferences (stored locally in your browser)</li>
                  <li>Basic usage analytics for platform improvement</li>
                  <li>Session data for authentication if you choose to create an account</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                Information collected is used exclusively for:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Providing real-time conflict and market analysis</li>
                <li>Generating AI-powered insights and predictions</li>
                <li>Maintaining platform security and performance</li>
                <li>Improving user experience and platform features</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                We implement industry-standard security measures:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Encrypted data transmission using HTTPS</li>
                <li>Secure API endpoints with authentication</li>
                <li>Regular security audits and updates</li>
                <li>No storage of sensitive financial or personal data</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                We utilize the following third-party services:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li><strong>Yahoo Finance:</strong> Real-time stock market data</li>
                <li><strong>OpenAI:</strong> AI analysis and predictions</li>
                <li><strong>PostgreSQL:</strong> Secure data storage</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Each service operates under their respective privacy policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request data deletion</li>
                <li>Export your watchlist data</li>
                <li>Opt out of analytics tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">
                For privacy-related questions or concerns, contact us at:{" "}
                <a href="mailto:privacy@conflictwatch.com" className="text-blue-600 hover:text-blue-800">
                  privacy@conflictwatch.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}