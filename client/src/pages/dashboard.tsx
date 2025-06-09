import Navigation from "@/components/navigation";
import MultiSectorDashboard from "@/components/multi-sector-dashboard";
import { Link } from "wouter";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MultiSectorDashboard />
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
