import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-slate-900">ConflictWatch</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <a href="#" className="text-primary border-b-2 border-primary px-3 py-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="#" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">
                  Conflicts
                </a>
                <a href="#" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">
                  Markets
                </a>
                <a href="#" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">
                  Analysis
                </a>
                <a href="#" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">
                  Reports
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </nav>
  );
}
