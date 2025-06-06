import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  TrendingUp, 
  Globe, 
  Brain,
  X,
  Check,
  Filter,
  Eye,
  EyeOff,
  ExternalLink,
  Archive,
  Star,
  MessageSquare
} from "lucide-react";

interface Notification {
  id: number;
  type: "conflict_update" | "market_alert" | "ai_analysis" | "system";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
  expiresAt?: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [starredNotifications, setStarredNotifications] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem('starredNotifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [animatingNotifications, setAnimatingNotifications] = useState<Set<number>>(new Set());
  
  // Use localStorage for persistent read state
  const [readNotifications, setReadNotifications] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem('readNotifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleNotificationClick = (notificationId: number, action?: 'read' | 'star' | 'view') => {
    if (action === 'star') {
      setStarredNotifications(prev => {
        const newSet = new Set(prev);
        if (newSet.has(notificationId)) {
          newSet.delete(notificationId);
        } else {
          newSet.add(notificationId);
        }
        localStorage.setItem('starredNotifications', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      return;
    }

    // Add animation effect
    setAnimatingNotifications(prev => new Set(prev).add(notificationId));
    setTimeout(() => {
      setAnimatingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }, 300);

    setReadNotifications(prev => {
      const newSet = new Set(prev).add(notificationId);
      localStorage.setItem('readNotifications', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const handleMarkAllRead = () => {
    const allIds = (notifications as Notification[]).map((n: Notification) => n.id);
    const newSet = new Set(allIds);
    setReadNotifications(newSet);
    localStorage.setItem('readNotifications', JSON.stringify(Array.from(newSet)));
  };

  const handleNotificationAction = (notificationId: number, action: string) => {
    const notification = (notifications as Notification[]).find(n => n.id === notificationId);
    if (!notification) return;

    switch (action) {
      case 'view_details':
        // Navigate to relevant page based on notification type
        if (notification.type === 'conflict_update') {
          window.location.href = '/conflicts';
        } else if (notification.type === 'market_alert') {
          window.location.href = '/stocks';
        } else if (notification.type === 'ai_analysis') {
          window.location.href = '/news';
        }
        break;
      case 'dismiss':
        handleNotificationClick(notificationId);
        break;
    }
  };

  const isNotificationRead = (notification: Notification) => {
    return notification.read || readNotifications.has(notification.id);
  };

  const unreadCount = (notifications as Notification[]).filter((n: Notification) => !isNotificationRead(n)).length;
  const filteredNotifications = (notifications as Notification[]).filter((n: Notification) => {
    if (filter === "all") return true;
    if (filter === "starred") return starredNotifications.has(n.id);
    return n.type === filter;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "conflict_update":
        return <Globe className="w-4 h-4" />;
      case "market_alert":
        return <TrendingUp className="w-4 h-4" />;
      case "ai_analysis":
        return <Brain className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "normal":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    const now = new Date();
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) return 'Unknown';
    
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        {unreadCount > 0 ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-12 w-96 max-h-96 z-50 shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllRead}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={filter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="text-xs"
                >
                  All
                  {filter === "all" && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {filteredNotifications.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={filter === "conflict_update" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("conflict_update")}
                  className="text-xs"
                >
                  <Globe className="w-3 h-3 mr-1" />
                  Conflicts
                  {filter === "conflict_update" && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {(notifications as Notification[]).filter(n => n.type === "conflict_update").length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={filter === "market_alert" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("market_alert")}
                  className="text-xs"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Markets
                  {filter === "market_alert" && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {(notifications as Notification[]).filter(n => n.type === "market_alert").length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={filter === "starred" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter("starred")}
                  className="text-xs"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Starred
                  {filter === "starred" && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {starredNotifications.size}
                    </Badge>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                {isLoading ? (
                  <div className="p-4 text-center text-slate-500">
                    Loading notifications...
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    No notifications to display
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredNotifications.map((notification: Notification, index: number) => (
                      <div key={notification.id}>
                        <div 
                          className={`p-3 transition-all duration-200 cursor-pointer ${
                            animatingNotifications.has(notification.id) ? "scale-98 opacity-80" : ""
                          } ${
                            !isNotificationRead(notification) 
                              ? "bg-blue-50 border-l-4 border-l-blue-500 hover:bg-blue-100" 
                              : "hover:bg-slate-50"
                          } ${
                            starredNotifications.has(notification.id) ? "bg-yellow-50 border-l-4 border-l-yellow-500" : ""
                          }`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className={`text-sm font-medium ${
                                    !isNotificationRead(notification) ? "text-slate-900" : "text-slate-700"
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <Badge 
                                    variant={getPriorityColor(notification.priority) as any}
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    {notification.priority}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  {starredNotifications.has(notification.id) && (
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  )}
                                  {!isNotificationRead(notification) && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-yellow-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNotificationClick(notification.id, 'star');
                                    }}
                                  >
                                    <Star className={`w-3 h-3 ${
                                      starredNotifications.has(notification.id) ? "fill-current text-yellow-500" : "text-slate-400"
                                    }`} />
                                  </Button>
                                  
                                  {!isNotificationRead(notification) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 hover:bg-green-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleNotificationClick(notification.id);
                                      }}
                                    >
                                      <Check className="w-3 h-3 text-slate-400" />
                                    </Button>
                                  )}
                                </div>
                                
                                <span className="text-xs text-slate-400">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < filteredNotifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}