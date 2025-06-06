import { Search, Bell, X, User, Star, LogOut, LogIn, UserPlus, Info, ChevronDown, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/auth-modal";
import NotificationCenter from "@/components/notification-center";
import { useTheme } from "@/components/theme-provider";

import type { Conflict, Stock } from "@shared/schema";

export default function Navigation() {
  const [location] = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

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
            <div className="hidden md:block ml-8">
              <div className="flex items-center space-x-6">
                <Link href="/" className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive("/") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                  Dashboard
                </Link>
                <Link href="/conflicts" className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive("/conflicts") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                  Conflicts
                </Link>
                <Link href="/markets" className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive("/markets") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                  Markets
                </Link>
                <Link href="/analysis" className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive("/analysis") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                  AI Analysis
                </Link>
                <Link href="/reports" className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive("/reports") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                  Reports
                </Link>
                <Link href="/learning" className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive("/learning") 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                  Learning
                </Link>

                {isAuthenticated && (
                  <Link href="/watchlist" className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isActive("/watchlist") 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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

            {/* Dark Mode Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleTheme}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Profile/Auth */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-slate-100">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={`${user.firstName || 'User'}'s profile`}
                        className="w-8 h-8 rounded-full object-cover border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user?.firstName?.[0] || user?.email?.[0] || 'D'}
                      </div>
                    )}
                    <span className="hidden sm:inline font-medium text-slate-900">
                      {user?.username === 'demo_user' ? 'Demo User' : (user?.firstName || user?.username || user?.email?.split('@')[0] || 'Account')}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {user?.username === 'demo_user' ? (
                    // Demo user limited menu
                    <>
                      <div className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
                            D
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">Demo User</div>
                            <div className="text-sm text-slate-600">Limited access account</div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <div className="text-xs text-slate-500 mb-2">
                          This is a demo account with limited features. Create a real account for full access.
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Exit Demo
                      </DropdownMenuItem>
                    </>
                  ) : (
                    // Regular user full menu
                    <>
                      <div className="p-3">
                        <div className="flex items-center space-x-3">
                          {user?.profileImageUrl ? (
                            <img 
                              src={user.profileImageUrl} 
                              alt={`${user.firstName || 'User'}'s profile`}
                              className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
                              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-slate-900">
                              {user?.firstName && user?.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user?.firstName || user?.username || user?.email?.split('@')[0] || 'User'
                              }
                            </div>
                            <div className="text-sm text-slate-600">{user?.email}</div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/watchlist" className="flex items-center cursor-pointer">
                          <Star className="h-4 w-4 mr-2" />
                          My Watchlists
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-2 border-slate-300 hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/login'}
                    className="flex items-center cursor-pointer"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/register'}
                    className="flex items-center cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/landing'}
                    className="flex items-center cursor-pointer text-slate-600"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    About Platform
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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