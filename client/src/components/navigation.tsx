import { Search, Bell, X, User, Star, LogOut, Globe } from "lucide-react";
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

  // Mock notifications for demo
  const notifications = [
    {
      id: 1,
      title: "New Conflict Alert",
      message: "Escalation detected in Middle East region",
      time: "5 min ago",
      type: "alert" as const,
      unread: true
    },
    {
      id: 2,
      title: "Market Update",
      message: "Defense stocks showing 2.3% uptick",
      time: "15 min ago",
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

  // Filter search results
  const searchResults = searchQuery ? [
    ...(Array.isArray(conflicts) ? conflicts : []).filter((c: any) => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    ...(Array.isArray(stocks) ? stocks : []).filter((s: any) => 
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3)
  ] : [];

  // Close search/notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation items
  const navItems = [
    { name: "Dashboard", href: "/", current: location === "/" },
    { name: "Markets", href: "/markets", current: location === "/markets" },
    { name: "Conflicts", href: "/conflicts", current: location === "/conflicts" },
    { name: "Health", href: "/health", current: location === "/health" },
    { name: "Analysis", href: "/analysis", current: location === "/analysis" },
    { name: "Discussion", href: "/discussion", current: location === "/discussion" }
  ];

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
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
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
                className="relative"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              {showSearch && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search conflicts, stocks..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="border-0 focus-visible:ring-0 p-0"
                          autoFocus
                        />
                      </div>
                      
                      {searchResults.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {searchResults.map((result) => (
                            <Link
                              key={'name' in result ? result.name : result.symbol}
                              href={'region' in result ? `/conflicts/${result.id}` : `/stocks/${result.symbol}`}
                              className="block p-2 hover:bg-slate-50 rounded border"
                              onClick={() => {
                                setShowSearch(false);
                                setSearchQuery("");
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                {'region' in result ? (
                                  <Globe className="h-4 w-4 text-red-500" />
                                ) : (
                                  <div className="w-4 h-4 bg-primary rounded text-xs text-white flex items-center justify-center">
                                    $
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-sm">
                                    {'name' in result ? result.name : `${result.symbol} - ${result.name}`}
                                  </div>
                                  {'region' in result && (
                                    <div className="text-xs text-slate-600">{result.region}</div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      {searchQuery && searchResults.length === 0 && (
                        <div className="text-sm text-slate-600 text-center py-4">
                          No results found for "{searchQuery}"
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
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-red-500">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                  <Card>
                    <CardContent className="p-0">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Notifications</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowNotifications(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b last:border-b-0 hover:bg-slate-50 ${
                              notification.unread ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'alert'
                                    ? 'bg-red-500'
                                    : notification.type === 'market'
                                    ? 'bg-green-500'
                                    : 'bg-blue-500'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm">{notification.title}</p>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                              </div>
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