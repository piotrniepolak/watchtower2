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

import type { Conflict, Stock } from "@shared/schema";

export default function Navigation() {
  const [location] = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated, logout } = useAuth();

  const { data: conflicts } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const { data: stocks } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const isActive = (path: string) => location === path;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const searchResults = searchQuery.length > 0 ? [
    ...(conflicts as Conflict[] || [])
      .filter(conflict => 
        conflict.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conflict.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 3)
      .map(conflict => ({
        type: 'conflict' as const,
        title: conflict.name,
        subtitle: conflict.region,
        href: '/conflicts'
      })),
    ...(stocks as Stock[] || [])
      .filter(stock => 
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 3)
      .map(stock => ({
        type: 'stock' as const,
        title: `${stock.symbol} - ${stock.name}`,
        subtitle: `$${stock.price?.toFixed(2) || 'N/A'}`,
        href: '/markets'
      }))
  ] : [];

  // Generate notifications
  const notifications = [
    {
      id: 1,
      title: "New High-Severity Conflict Alert",
      message: "Ukraine-Russia conflict intensity increased",
      time: "2 hours ago",
      type: "alert" as const,
      unread: true
    },
    {
      id: 2,
      title: "Market Update",
      message: "Defense stocks up 3.2% following regional tensions",
      time: "4 hours ago",
      type: "market" as const,
      unread: true
    },
    {
      id: 3,
      title: "Analysis Complete",
      message: "Q4 correlation analysis report ready",
      time: "1 day ago",
      type: "info" as const,
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
                  AI Analysis
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
                      <div className="flex items-center space-x-2 mb-3">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search conflicts, stocks, regions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="border-0 p-0 focus-visible:ring-0"
                          autoFocus
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowSearch(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
            <div className="relative" ref={notificationRef}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 z-50">
                  <Card className="shadow-lg border">
                    <CardContent className="p-0">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Notifications</h3>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowNotifications(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-4 border-b hover:bg-slate-50 cursor-pointer ${
                              notification.unread ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <div className="font-medium text-sm">{notification.title}</div>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">
                                  {notification.message}
                                </div>
                                <div className="text-xs text-slate-400 mt-2">
                                  {notification.time}
                                </div>
                              </div>
                              <Badge 
                                variant={notification.type === 'alert' ? 'destructive' : 'outline'}
                                className="text-xs"
                              >
                                {notification.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t">
                        <Button variant="link" className="w-full text-sm">
                          View all notifications
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Account */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <div className="font-medium text-sm">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-slate-600">{user?.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/watchlist" className="flex items-center cursor-pointer">
                      <Star className="mr-2 h-4 w-4" />
                      My Watchlists
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
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
