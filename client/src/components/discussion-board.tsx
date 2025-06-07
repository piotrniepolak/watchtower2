import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Users, TrendingUp, Globe, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface Author {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface ChatMessage {
  id: number;
  content: string;
  authorId: number;
  category: string;
  createdAt: string;
  author: Author;
}

export default function DiscussionBoard() {
  const [activeCategory, setActiveCategory] = useState<string>("conflicts");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/discussions", activeCategory],
    refetchInterval: 5000, // Refresh every 5 seconds for chat-like experience
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; category: string }) => {
      const response = await fetch("/api/discussions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions", activeCategory] });
      setNewMessage("");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAuthorName = (author: Author) => {
    if (author.firstName || author.lastName) {
      return `${author.firstName || ""} ${author.lastName || ""}`.trim();
    }
    return author.username;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "conflicts":
        return <Globe className="w-4 h-4" />;
      case "markets":
        return <TrendingUp className="w-4 h-4" />;
      case "general":
        return <Users className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isAuthenticated) {
      sendMessageMutation.mutate({
        content: newMessage,
        category: activeCategory
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const categories = [
    { id: "conflicts", label: "Conflicts", icon: Globe, color: "text-red-600" },
    { id: "markets", label: "Markets", icon: TrendingUp, color: "text-green-600" },
    { id: "general", label: "General", icon: Users, color: "text-blue-600" },
  ];

  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">Community Chat</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Real-time discussions for registered users</p>
            </div>
            {!isAuthenticated && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                Login required
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Tabs */}
          <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeCategory === category.id ? category.color : ""}`} />
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Chat Messages Area */}
          <div className="border rounded-lg bg-white">
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarFallback className="text-xs">
                        {getAuthorName(message.author).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {getAuthorName(message.author)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-700 mb-2">No messages yet</h4>
                  <p className="text-gray-500 text-sm">
                    Be the first to start the conversation about {activeCategory}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {isAuthenticated ? (
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder={`Message #${activeCategory}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendMessageMutation.isPending}
                    className="flex-1"
                  />
                  <Button 
                    type="submit"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="sm"
                    className="px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="border-t p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">Join the conversation</p>
                <Button
                  onClick={() => window.location.href = '/api/login'}
                  size="sm"
                  variant="outline"
                >
                  Sign In to Chat
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}