import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-600">Last updated: June 5, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">
                By accessing and using ConflictWatch, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                ConflictWatch is a geopolitical intelligence platform that provides:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Real-time conflict monitoring and analysis</li>
                <li>Defense contractor stock market data and trends</li>
                <li>AI-powered predictions and market correlations</li>
                <li>Interactive data visualizations and reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sources and Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                Our platform aggregates data from publicly available sources including Yahoo Finance, 
                government reports, and international organizations. While we strive for accuracy:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Information is provided for analytical purposes only</li>
                <li>Data accuracy cannot be guaranteed</li>
                <li>Users should verify information independently</li>
                <li>Platform updates may cause temporary data inconsistencies</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 font-semibold">
                  IMPORTANT: ConflictWatch is NOT investment advice.
                </p>
              </div>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>All content is for informational and educational purposes only</li>
                <li>Stock analysis and predictions do not constitute financial advice</li>
                <li>Users should consult qualified financial advisors before making investment decisions</li>
                <li>Past performance does not indicate future results</li>
                <li>Investment in securities involves risk of financial loss</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">Users agree not to:</p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Use the platform for illegal activities</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Interfere with platform operations or other users</li>
                <li>Reverse engineer or copy platform technology</li>
                <li>Use automated tools to scrape data beyond normal usage</li>
                <li>Redistribute data without proper attribution</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                ConflictWatch platform design, analysis algorithms, and original content are protected by copyright. 
                Raw data may be subject to third-party terms:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Yahoo Finance data subject to their terms of use</li>
                <li>OpenAI-generated analysis subject to AI usage policies</li>
                <li>Users retain rights to their watchlist preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">
                We strive to maintain platform availability but cannot guarantee:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Uninterrupted service access</li>
                <li>Real-time data accuracy during market volatility</li>
                <li>Availability during system maintenance</li>
                <li>Protection against force majeure events</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">
                ConflictWatch and its operators shall not be liable for any direct, indirect, incidental, 
                or consequential damages arising from platform use, including but not limited to investment 
                losses, data inaccuracies, or service interruptions. Maximum liability is limited to 
                the amount paid for platform access, if any.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">
                Questions about these terms? Contact us at:{" "}
                <a href="mailto:legal@conflictwatch.com" className="text-blue-600 hover:text-blue-800">
                  legal@conflictwatch.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}