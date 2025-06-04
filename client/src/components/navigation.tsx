import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl font-bold text-slate-900 cursor-pointer">ConflictWatch</h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <Link href="/" className={`px-3 py-2 text-sm font-medium ${
                  isActive("/") || isActive("/dashboard") 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                  Dashboard
                </Link>
                <Link href="/conflicts" className={`px-3 py-2 text-sm font-medium ${
                  isActive("/conflicts") 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                  Conflicts
                </Link>
                <Link href="/markets" className={`px-3 py-2 text-sm font-medium ${
                  isActive("/markets") 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                  Markets
                </Link>
                <Link href="/analysis" className={`px-3 py-2 text-sm font-medium ${
                  isActive("/analysis") 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                  Analysis
                </Link>
                <Link href="/reports" className={`px-3 py-2 text-sm font-medium ${
                  isActive("/reports") 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                  Reports
                </Link>
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
