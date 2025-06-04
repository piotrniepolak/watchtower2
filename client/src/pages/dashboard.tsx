import Navigation from "@/components/navigation";
import MetricsCards from "@/components/metrics-cards";
import ChartsSection from "@/components/charts-section";
import DataTables from "@/components/data-tables";
import ConflictHeatMap from "@/components/conflict-heat-map";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Global Conflict & Defense Market Overview
          </h2>
          <MetricsCards />
        </div>
        
        <ChartsSection />
        <DataTables />
        <ConflictHeatMap />
      </main>
      
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              © 2024 ConflictWatch. Data updated in real-time. Market analysis for informational purposes only.
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900">Privacy</a>
              <a href="#" className="hover:text-slate-900">Terms</a>
              <a href="#" className="hover:text-slate-900">API</a>
              <a href="#" className="hover:text-slate-900">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
