import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Send, Users, ChevronDown, Crown, Shield, Pill, Reply, Star, GraduationCap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  sector?: string;
  isSystem: boolean;
  replyToId?: number;
  replyToUser?: string;
  replyCount?: number;
  isDailyQuestionReply?: boolean;
  dailyQuestionId?: number;
}

interface DailyQuestion {
  id: number;
  sector: string;
  question: string;
  context: string;
  generatedDate: string;
  discussionId: number;
  isActive: boolean;
}

interface Badge {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface CommunityChatProps {}

export function CommunityChat() {
  const [message, setMessage] = useState("");
  const [chatSector, setChatSector] = useState<string>("general");
  const [username, setUsername] = useState(() => {
    // Get username from localStorage or generate a random one
    const stored = localStorage.getItem('chatUsername');
    if (stored) return stored;
    
    const randomUsername = `Analyst${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('chatUsername', randomUsername);
    return randomUsername;
  });
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [usernameError, setUsernameError] = useState<string>("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<{ id: number; username: string } | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<number>>(new Set());
  const [replies, setReplies] = useState<{ [messageId: number]: ChatMessage[] }>({});
  const [dailyQuestionReplies, setDailyQuestionReplies] = useState<ChatMessage[]>([]);
  const [showDailyQuestionReplies, setShowDailyQuestionReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat/messages", chatSector],
    queryFn: async () => {
      const url = `/api/chat/messages?sector=${chatSector}&limit=30`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds for new messages
    staleTime: 0,
  });

  // Fetch daily question for current sector
  const { data: dailyQuestion } = useQuery({
    queryKey: ["/api/daily-questions", chatSector],
    queryFn: async () => {
      if (chatSector === "general") return null;
      // Map frontend sector names to backend sector names
      const sectorMapping: { [key: string]: string } = {
        'health': 'healthcare',
        'defense': 'defense',
        'energy': 'energy'
      };
      const backendSector = sectorMapping[chatSector] || chatSector;
      const response = await fetch(`/api/daily-questions/${backendSector}`);
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 60000, // Cache for 1 minute
  });

  // Simple badge fetcher function that returns badges based on username
  const getBadgesForUser = (targetUsername: string) => {
    // Default badges for specific users
    const badges = [];
    
    // Check for Atlas, Piotrek, and polakp (including variations)
    if (targetUsername === 'Atlas' || targetUsername === 'Atlas Loutfi' || 
        targetUsername === 'Piotrek' || targetUsername === 'polakp') {
      badges.push(
        { type: 'early_supporter', name: 'Early Supporter', icon: 'Star', color: 'text-rose-600' },
        { type: 'learning_completionist', name: 'Learning Completionist', icon: 'GraduationCap', color: 'text-purple-600' }
      );
    }
    
    // Add sector-specific badges based on co-founder status
    const coFounderInfo = getCoFounderInfo(targetUsername);
    if (coFounderInfo.isCoFounder) {
      badges.push({
        type: 'sector_director',
        name: coFounderInfo.sector === 'health' ? 'PharmaWatch Director' : 'ConflictWatch Director',
        icon: coFounderInfo.icon,
        color: coFounderInfo.color
      });
    }
    return badges;
  };

  // Track user visit on component mount
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch(`/api/users/${username}/visit`, {
          method: "POST"
        });
      } catch (error) {
        console.error("Failed to track user visit:", error);
      }
    };
    
    trackVisit();
  }, [username]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { 
      username: string; 
      message: string; 
      sector?: string;
      replyToId?: number;
      replyToUser?: string;
    }) => {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: async () => {
      const wasReplyingToQuestion = replyingTo?.username === "Daily Question";
      
      setMessage("");
      setReplyingTo(null);
      // Clear replies cache to force refresh
      setReplies({});
      setExpandedThreads(new Set());
      
      // If this was a daily question reply, refetch the daily question replies
      if (wasReplyingToQuestion && dailyQuestion?.id) {
        try {
          const response = await fetch(`/api/daily-questions/${dailyQuestion.id}/replies?sector=${chatSector}`);
          if (response.ok) {
            const updatedReplies = await response.json();
            setDailyQuestionReplies(updatedReplies);
            // Keep the thread expanded to show the new reply
            setShowDailyQuestionReplies(true);
          }
        } catch (error) {
          console.error('Failed to refetch daily question replies:', error);
        }
      } else {
        // Clear daily question replies for regular messages
        setDailyQuestionReplies([]);
        setShowDailyQuestionReplies(false);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch daily question replies when daily question or sector changes
  useEffect(() => {
    const fetchDailyQuestionReplies = async () => {
      if (dailyQuestion?.id) {
        try {
          const response = await fetch(`/api/daily-questions/${dailyQuestion.id}/replies?sector=${chatSector}`);
          if (response.ok) {
            const replies = await response.json();
            setDailyQuestionReplies(replies);
          }
        } catch (error) {
          console.error('Failed to fetch daily question replies:', error);
        }
      }
    };

    fetchDailyQuestionReplies();
  }, [dailyQuestion?.id, chatSector]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'online_count') {
          setOnlineCount(data.count);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      username,
      message: message.trim(),
      sector: chatSector,
      replyToId: replyingTo?.id,
      replyToUser: replyingTo?.username,
    });
  };

  const toggleThread = async (messageId: number) => {
    const newExpandedThreads = new Set(expandedThreads);
    
    if (expandedThreads.has(messageId)) {
      newExpandedThreads.delete(messageId);
    } else {
      newExpandedThreads.add(messageId);
      
      // Fetch replies if not already loaded
      if (!replies[messageId]) {
        try {
          const response = await fetch(`/api/chat/messages/${messageId}/replies`);
          if (response.ok) {
            const messageReplies = await response.json();
            setReplies(prev => ({ ...prev, [messageId]: messageReplies }));
          }
        } catch (error) {
          console.error('Failed to fetch replies:', error);
        }
      }
    }
    
    setExpandedThreads(newExpandedThreads);
  };

  const replyToDailyQuestion = (questionId: number) => {
    setReplyingTo({ id: questionId, username: "Daily Question" });
  };

  const toggleDailyQuestionReplies = async () => {
    if (!dailyQuestion) return;
    
    if (!showDailyQuestionReplies) {
      // Fetch daily question replies filtered by current sector
      try {
        const response = await fetch(`/api/daily-questions/${dailyQuestion.id}/replies?sector=${chatSector}`);
        if (response.ok) {
          const replies = await response.json();
          setDailyQuestionReplies(replies);
        }
      } catch (error) {
        console.error('Failed to fetch daily question replies:', error);
      }
    }
    
    setShowDailyQuestionReplies(!showDailyQuestionReplies);
  };

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck.trim() || usernameToCheck.length < 2 || usernameToCheck.length > 30) {
      return { available: false, reason: 'Username must be 2-30 characters' };
    }
    
    try {
      const response = await fetch(`/api/chat/username/${encodeURIComponent(usernameToCheck.trim())}/available`);
      if (!response.ok) throw new Error('Failed to check username availability');
      return response.json();
    } catch (error) {
      return { available: false, reason: 'Error checking username availability' };
    }
  };

  const registerUsername = async (usernameToRegister: string) => {
    try {
      const response = await fetch('/api/chat/username/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: usernameToRegister.trim() }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register username');
      }
      
      return response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleUsernameChange = async () => {
    const trimmedUsername = tempUsername.trim();
    
    if (!trimmedUsername) {
      setUsernameError('Username cannot be empty');
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError('');

    try {
      // Check if username is available
      const availability = await checkUsernameAvailability(trimmedUsername);
      
      if (!availability.available) {
        setUsernameError(availability.reason || 'Username is not available');
        setIsCheckingUsername(false);
        return;
      }

      // Register the username
      await registerUsername(trimmedUsername);
      
      // Update local state
      setUsername(trimmedUsername);
      localStorage.setItem('chatUsername', trimmedUsername);
      setShowUsernameInput(false);
      setUsernameError('');
    } catch (error: any) {
      setUsernameError(error.message || 'Failed to update username');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getSectorLabel = (sector: string) => {
    switch (sector) {
      case 'defense': return 'ConflictWatch';
      case 'health': return 'PharmaWatch';
      case 'healthcare': return 'PharmaWatch';
      case 'energy': return 'EnergyWatch';
      default: return 'General';
    }
  };

  const getCoFounderInfo = (username: string) => {
    const normalizedUsername = username.toLowerCase().trim();
    
    if (normalizedUsername === 'atlas loutfi' || normalizedUsername === 'atlas' || normalizedUsername === 'atloutfi') {
      return {
        isCoFounder: true,
        title: 'Co-Founder & Director of PharmaWatch',
        sector: 'health',
        icon: Pill,
        color: 'text-green-600'
      };
    }
    
    if (normalizedUsername === 'piotrek polak' || normalizedUsername === 'piotrek' || normalizedUsername === 'polakp') {
      return {
        isCoFounder: true,
        title: 'Co-Founder & Director of ConflictWatch',
        sector: 'defense',
        icon: Shield,
        color: 'text-blue-600'
      };
    }
    
    return { isCoFounder: false };
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Community Chat
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-500">{onlineCount} online</span>
          </div>
        </CardTitle>
        
        {/* Independent Sector Selector */}
        <div className="mt-3">
          <Select value={chatSector} onValueChange={setChatSector}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select chat channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Discussion</SelectItem>
              <SelectItem value="defense">ConflictWatch</SelectItem>
              <SelectItem value="health">PharmaWatch</SelectItem>
              <SelectItem value="energy">EnergyWatch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
        {/* Sticky Daily Question Display */}
        {dailyQuestion && chatSector !== "general" && (
          <div className="sticky top-0 z-10 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Daily Discussion</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full">
                      {getSectorLabel(chatSector)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => replyToDailyQuestion(dailyQuestion.id)}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {dailyQuestion.question}
                </p>
                
                {/* Thread Toggle - Similar to regular messages */}
                {dailyQuestionReplies.length > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={toggleDailyQuestionReplies}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {dailyQuestionReplies.length} {dailyQuestionReplies.length === 1 ? 'reply' : 'replies'}
                      <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showDailyQuestionReplies ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Collapsible Thread Replies - Same style as regular message threads */}
            {showDailyQuestionReplies && dailyQuestionReplies.length > 0 && (
              <div className="ml-11 mt-2 border-l-2 border-slate-200 dark:border-slate-700 pl-4 space-y-3">
                {dailyQuestionReplies.map((reply) => {
                  const replyCoFounderInfo = getCoFounderInfo(reply.username);
                  return (
                    <div key={reply.id} className="group">
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
                          replyCoFounderInfo.isCoFounder 
                            ? replyCoFounderInfo.sector === 'health' 
                              ? 'bg-gradient-to-br from-green-500 to-teal-600' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}>
                          {reply.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                              {reply.username}
                            </span>
                            {replyCoFounderInfo.isCoFounder && (
                              <div className="flex items-center space-x-1">
                                {/* Co-Founder Badge - Collapsed by default */}
                                <div className="group/badge relative">
                                  <div className="flex items-center bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 px-1 py-0.5 rounded-full border border-amber-200 dark:border-amber-700 cursor-pointer transition-all duration-200 group-hover/badge:px-2">
                                    <Crown className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300 opacity-0 max-w-0 overflow-hidden transition-all duration-200 group-hover/badge:opacity-100 group-hover/badge:max-w-[80px] group-hover/badge:ml-1">
                                      Co-Founder
                                    </span>
                                  </div>
                                </div>
                                {/* Sector Badge - Collapsed by default */}
                                <div className="group/sector relative">
                                  <div className={`flex items-center px-1 py-0.5 rounded-full border cursor-pointer transition-all duration-200 group-hover/sector:px-2 ${
                                    replyCoFounderInfo.sector === 'health' 
                                      ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' 
                                      : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                                  }`}>
                                    {replyCoFounderInfo.icon && (
                                      <replyCoFounderInfo.icon className={`w-2.5 h-2.5 ${replyCoFounderInfo.color} dark:${replyCoFounderInfo.color?.replace('text-', 'text-').replace('-600', '-400')}`} />
                                    )}
                                    <span className={`text-xs font-medium opacity-0 max-w-0 overflow-hidden transition-all duration-200 group-hover/sector:opacity-100 group-hover/sector:max-w-[80px] group-hover/sector:ml-1 ${replyCoFounderInfo.color} dark:${replyCoFounderInfo.color?.replace('text-', 'text-').replace('-600', '-400')}`}>
                                      {replyCoFounderInfo.sector === 'health' ? 'PharmaWatch' : 'ConflictWatch'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            <span className="text-xs text-slate-500">
                              {formatTimestamp(reply.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 min-h-0 mb-4">
          <ScrollArea className="h-full pr-4">

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-slate-500">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center text-slate-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.filter(msg => !msg.replyToId).map((msg: ChatMessage) => {
                  const coFounderInfo = getCoFounderInfo(msg.username);
                  const messageReplies = replies[msg.id] || [];
                  const isExpanded = expandedThreads.has(msg.id);
                  const totalReplies = msg.replyCount || 0;
                  
                  // Get badges for this message's user
                  const messageBadges = getBadgesForUser(msg.username);
                  
                  return (
                    <div key={msg.id} className="group">
                      {/* Main Message */}
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
                          coFounderInfo.isCoFounder 
                            ? coFounderInfo.sector === 'health' 
                              ? 'bg-gradient-to-br from-green-500 to-teal-600' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}>
                          {msg.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1 flex-wrap">
                            <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                              {msg.username}
                            </span>
                            {/* Badges Container */}
                            <div className="flex items-center space-x-1">
                              {/* Co-Founder Badge */}
                              {coFounderInfo.isCoFounder && (
                                <>
                                  <div className="relative">
                                    <div className="flex items-center bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">
                                      <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300 ml-1">
                                        Co-Founder
                                      </span>
                                    </div>
                                  </div>
                                  {/* Sector Badge - Collapsible */}
                                  <div className="group/sector relative">
                                    <div className={`flex items-center px-1 py-0.5 rounded-full border cursor-pointer transition-all duration-200 group-hover/sector:px-2 ${
                                      coFounderInfo.sector === 'health' 
                                        ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' 
                                        : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                                    }`}>
                                      {coFounderInfo.icon && React.createElement(coFounderInfo.icon, { className: `w-3 h-3 ${coFounderInfo.color} dark:${coFounderInfo.color?.replace('text-', 'text-').replace('-600', '-400')}` })}
                                      <span className={`text-xs font-medium opacity-0 max-w-0 overflow-hidden transition-all duration-200 group-hover/sector:opacity-100 group-hover/sector:max-w-[120px] group-hover/sector:ml-1 ${coFounderInfo.color} dark:${coFounderInfo.color?.replace('text-', 'text-').replace('-600', '-400')}`}>
                                        {coFounderInfo.sector === 'health' ? 'PharmaWatch Director' : 'ConflictWatch Director'}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )}
                              
                              {/* Dynamic Badge Rendering */}
                              {messageBadges.map((badge: any, badgeIndex: number) => {
                                if (badge.type === 'early_supporter') {
                                  return (
                                    <div key={badgeIndex} className="group/supporter relative">
                                      <div className="flex items-center bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 px-1 py-0.5 rounded-full border border-rose-200 dark:border-rose-700 cursor-pointer transition-all duration-200 group-hover/supporter:px-2">
                                        <Star className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                        <span className="text-xs font-medium text-rose-700 dark:text-rose-300 opacity-0 max-w-0 overflow-hidden transition-all duration-200 group-hover/supporter:opacity-100 group-hover/supporter:max-w-[80px] group-hover/supporter:ml-1 leading-tight">
                                          Early<br />Supporter
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                                
                                if (badge.type === 'learning_completionist') {
                                  return (
                                    <div key={badgeIndex} className="group/learner relative">
                                      <div className="flex items-center bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 px-1 py-0.5 rounded-full border border-purple-200 dark:border-purple-700 cursor-pointer transition-all duration-200 group-hover/learner:px-2">
                                        <GraduationCap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                        <span className="text-xs font-medium text-purple-700 dark:text-purple-300 opacity-0 max-w-0 overflow-hidden transition-all duration-200 group-hover/learner:opacity-100 group-hover/learner:max-w-[130px] group-hover/learner:ml-1">
                                          Learning Completionist
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                                
                                return null;
                              })}
                            </div>
                            {msg.username === username && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">you</span>
                            )}
                            <span className="text-xs text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400">
                              {formatTimestamp(msg.timestamp)}
                            </span>
                          </div>
                          {msg.replyToId && (
                            <div className="mb-2 p-2 bg-slate-100 dark:bg-slate-800 rounded border-l-2 border-blue-400">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                Replying to @{msg.replyToUser}
                              </span>
                            </div>
                          )}
                          <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed break-words">
                            {msg.message}
                          </div>
                          <div className="flex items-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                              onClick={() => setReplyingTo({ id: msg.id, username: msg.username })}
                            >
                              <Reply className="w-3 h-3 mr-1" />
                              Reply
                            </Button>
                            {totalReplies > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                onClick={() => toggleThread(msg.id)}
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
                                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Threaded Replies */}
                      {totalReplies > 0 && isExpanded && (
                        <div className="ml-11 mt-3 space-y-3 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                          {messageReplies.map((reply: ChatMessage) => {
                            const replyCoFounderInfo = getCoFounderInfo(reply.username);
                            return (
                              <div key={reply.id} className="group">
                                <div className="flex items-start space-x-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
                                    replyCoFounderInfo.isCoFounder 
                                      ? replyCoFounderInfo.sector === 'health' 
                                        ? 'bg-gradient-to-br from-green-500 to-teal-600' 
                                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                                      : 'bg-gradient-to-br from-slate-400 to-slate-600'
                                  }`}>
                                    {reply.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                                      <span className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                                        {reply.username}
                                      </span>
                                      {replyCoFounderInfo.isCoFounder && (
                                        <div className="flex items-center space-x-1">
                                          <Crown className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Co-Founder</span>
                                        </div>
                                      )}
                                      {reply.username === username && (
                                        <span className="text-xs text-blue-600 dark:text-blue-400">you</span>
                                      )}
                                      <span className="text-xs text-slate-500">
                                        {formatTimestamp(reply.timestamp)}
                                      </span>
                                    </div>
                                    <div className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed break-words">
                                      {reply.message}
                                    </div>
                                    <div className="flex items-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                        onClick={() => setReplyingTo({ id: msg.id, username: reply.username })}
                                      >
                                        <Reply className="w-2.5 h-2.5 mr-1" />
                                        Reply
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Username Display/Edit */}
        <div className="mb-3">
          {showUsernameInput ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  value={tempUsername}
                  onChange={(e) => {
                    setTempUsername(e.target.value);
                    setUsernameError(''); // Clear error when typing
                  }}
                  placeholder="Enter username (2-30 characters)"
                  className={`flex-1 h-8 text-sm ${usernameError ? 'border-red-500' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isCheckingUsername) handleUsernameChange();
                    if (e.key === 'Escape') {
                      setTempUsername(username);
                      setShowUsernameInput(false);
                      setUsernameError('');
                    }
                  }}
                  disabled={isCheckingUsername}
                  autoFocus
                />
                <Button 
                  size="sm" 
                  onClick={handleUsernameChange} 
                  className="h-8 px-3"
                  disabled={isCheckingUsername || !tempUsername.trim()}
                >
                  {isCheckingUsername ? 'Checking...' : 'Save'}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setTempUsername(username);
                    setShowUsernameInput(false);
                    setUsernameError('');
                  }}
                  className="h-8 px-3"
                  disabled={isCheckingUsername}
                >
                  Cancel
                </Button>
              </div>
              {usernameError && (
                <div className="text-xs text-red-500 px-1">
                  {usernameError}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setShowUsernameInput(true);
                setUsernameError('');
              }}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Posting as: <span className="font-medium">{username}</span> (click to change)
            </button>
          )}
        </div>

        {/* Reply Indicator */}
        {replyingTo && (
          <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Reply className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Replying to @{replyingTo.username}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                onClick={() => setReplyingTo(null)}
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Share your ${chatSector !== 'general' ? getSectorLabel(chatSector) : 'market'} insights...`}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}