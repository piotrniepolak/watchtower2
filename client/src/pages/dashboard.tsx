import Navigation from "@/components/navigation";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import original ConflictWatch dashboard components
import MetricsCards from "@/components/metrics-cards";
import ActiveConflictsList from "@/components/active-conflicts-list";
import ConflictSeverityMap from "@/components/conflict-severity-map";
import CorrelationAnalysis from "@/components/correlation-analysis";
import EnhancedChartsSection from "@/components/enhanced-charts-section";
import DailyNews from "@/components/daily-news";
import RoiRankings from "@/components/roi-rankings";
import ConflictTimeline from "@/components/conflict-timeline";
import WorldHealthMapSimple from "@/components/world-health-map-simple";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              ConflictWatch
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Global conflict monitoring and defense market intelligence
            </p>
          </div>

          {/* Top Metrics Row */}
          <MetricsCards />

          {/* Global Health Map Section */}
          <div className="w-full mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Global Health Intelligence
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                WHO Statistical Annex Data - Real-time global health monitoring and pharmaceutical market insights
              </p>
            </div>
            <Tabs defaultValue="health-map" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="health-map">Global Health Map</TabsTrigger>
                <TabsTrigger value="who-dashboard">WHO Statistical Dashboard</TabsTrigger>
              </TabsList>

              <TabsContent value="health-map">
                <WorldHealthMapSimple />
              </TabsContent>

              <TabsContent value="who-dashboard">
                <WorldHealthMapSimple />
              </TabsContent>
            </Tabs>
          </div>

          {/* Active Conflicts Section - Priority Display */}
          <div className="w-full mb-8">
            <ActiveConflictsList />
          </div>

          {/* Defense Market Performance Section */}
          <div className="w-full mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Defense Market Performance
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Real-time performance of defense and aerospace stocks
              </p>
            </div>
            <EnhancedChartsSection />
          </div>

          {/* Analytics Section */}
          <div className="space-y-6">
            <ConflictSeverityMap />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CorrelationAnalysis />
              <DailyNews />
            </div>
          </div>

          {/* Bottom Full Width Widgets */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            <div className="order-1">
              <RoiRankings />
            </div>
            <div className="order-2">
              <ConflictTimeline />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              © 2024 Intelligence Platform. Data updated in real-time. Market analysis for informational purposes only.
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <Link to="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link to="/terms" className="hover:text-slate-900">Terms</Link>
              <Link to="/api" className="hover:text-slate-900">API</Link>
              <Link to="/support" className="hover:text-slate-900">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
