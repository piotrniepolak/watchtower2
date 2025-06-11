import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Send, Users, ChevronDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  sector?: string;
  isSystem: boolean;
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

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { username: string; message: string; sector?: string }) => {
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
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      username,
      message: message.trim(),
      sector: chatSector,
    });
  };

  const handleUsernameChange = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      localStorage.setItem('chatUsername', tempUsername.trim());
      setShowUsernameInput(false);
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
      case 'health': return 'HealthWatch';
      case 'energy': return 'EnergyWatch';
      default: return 'General';
    }
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
            <span className="text-sm text-slate-500">{messages.length > 0 ? `${new Set(messages.map((m: ChatMessage) => m.username)).size} online` : '0 online'}</span>
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
                {messages.map((msg: ChatMessage) => (
                  <div key={msg.id} className="group">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {msg.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {msg.username}
                          </span>
                          {msg.username === username && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">you</span>
                          )}
                          <span className="text-xs text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed break-words">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Username Display/Edit */}
        <div className="mb-3">
          {showUsernameInput ? (
            <div className="flex items-center space-x-2">
              <Input
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                placeholder="Enter username"
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUsernameChange();
                  if (e.key === 'Escape') {
                    setTempUsername(username);
                    setShowUsernameInput(false);
                  }
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleUsernameChange} className="h-8 px-3">
                Save
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setTempUsername(username);
                  setShowUsernameInput(false);
                }}
                className="h-8 px-3"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowUsernameInput(true)}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Posting as: <span className="font-medium">{username}</span> (click to change)
            </button>
          )}
        </div>

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