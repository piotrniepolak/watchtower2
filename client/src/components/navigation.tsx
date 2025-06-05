import { Search, Bell, X, User, Star, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useSimpleAuth";
import AuthModal from "@/components/auth-modal";
import NotificationCenter from "@/components/notification-center";

import type { Conflict, Stock } from "@shared/schema";

export default function Navigation() {
  const [location] = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated, logout } = useAuth();

  const { data: conflicts = [] } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const { data: stocks = [] } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const isActive = (path: string) => location === path;

  // Search functionality
  const searchResults = searchQuery.length > 0 ? [
    ...(conflicts as Conflict[])
      .filter((conflict: Conflict) => 
        conflict.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conflict.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((conflict: Conflict) => ({
        title: conflict.name,
        subtitle: conflict.region,
        type: "Conflict",
        href: "/conflicts"
      })),
    ...(stocks as Stock[])
      .filter((stock: Stock) => 
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((stock: Stock) => ({
        title: stock.name,
        subtitle: stock.symbol,
        type: "Stock",
        href: "/markets"
      }))
  ].slice(0, 8) : [];

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg mr-3">
                <Search className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900">ConflictWatch</h1>
                <p className="text-xs text-slate-600">Defense & Conflict Analytics</p>
              </div>
            </Link>

            {/* Navigation links */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-8">
                <Link href="/" className={`px-3 py-2 text-sm font-medium ${
                  isActive("/") 
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
                  AI Analysis
                </Link>
                <Link href="/reports" className={`px-3 py-2 text-sm font-medium ${
                  isActive("/reports") 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                  Reports
                </Link>
                <Link href="/learning" className={`px-3 py-2 text-sm font-medium ${
                  isActive("/learning") 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                  Learning
                </Link>
                <Link href="/timeline" className={`px-3 py-2 text-sm font-medium ${
                  isActive("/timeline") 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-slate-600 hover:text-slate-900"
                }`}>
                  Timeline
                </Link>
                {isAuthenticated && (
                  <Link href="/watchlist" className={`px-3 py-2 text-sm font-medium ${
                    isActive("/watchlist") 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}>
                    Watchlist
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-4 w-4" />
              </Button>
              {showSearch && (
                <div className="absolute right-0 mt-2 w-80 z-50">
                  <Card className="shadow-lg border">
                    <CardContent className="p-4">
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          type="search"
                          placeholder="Search conflicts, stocks..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                      {searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((result, index) => (
                            <Link 
                              key={index}
                              href={result.href}
                              onClick={() => setShowSearch(false)}
                            >
                              <div className="p-2 hover:bg-slate-50 rounded cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium">{result.title}</div>
                                    <div className="text-xs text-slate-600">{result.subtitle}</div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {result.type}
                                  </Badge>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : searchQuery.length > 0 ? (
                        <div className="text-sm text-slate-600 text-center py-4">
                          No results found for "{searchQuery}"
                        </div>
                      ) : (
                        <div className="text-sm text-slate-600 text-center py-4">
                          Start typing to search conflicts, stocks, and regions
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* Profile/Auth */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.firstName || user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/watchlist" className="flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Watchlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAuthModal(true)}
                className="flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
            )}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </nav>
  );
}