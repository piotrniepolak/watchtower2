import Navigation from "@/components/navigation";
import { Link } from "wouter";

// Import original ConflictWatch dashboard components
import MetricsCards from "@/components/metrics-cards";
import ActiveConflictsList from "@/components/active-conflicts-list";
import ConflictSeverityMap from "@/components/conflict-severity-map";
import CorrelationAnalysis from "@/components/correlation-analysis";
import EnhancedChartsSection from "@/components/enhanced-charts-section";
import DailyNews from "@/components/daily-news";
import RoiRankings from "@/components/roi-rankings";
import ConflictTimeline from "@/components/conflict-timeline";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              ConflictWatch Intelligence
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Advanced geopolitical conflict monitoring and defense market analysis. 
              Track global conflicts, market correlations, and defense sector performance in real-time.
            </p>
          </div>

          {/* Top Metrics Row */}
          <MetricsCards />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ActiveConflictsList />
              <ConflictSeverityMap />
              <CorrelationAnalysis />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <EnhancedChartsSection />
              <DailyNews />
            </div>
          </div>

          {/* Bottom Full Width Widgets */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RoiRankings />
            <ConflictTimeline />
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
