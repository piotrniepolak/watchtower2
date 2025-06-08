import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Send, 
  User, 
  TrendingUp,
  Globe,
  Sword
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Author {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
}

interface ChatMessage {
  id: number;
  content: string;
  authorId: string;
  category: string;
  createdAt: string;
  author?: Author;
}

export default function PublicChat() {
  const [activeTab, setActiveTab] = useState("general");
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState(() => {
    // Get username from localStorage or prompt for it
    const stored = localStorage.getItem('chat_username');
    return stored || '';
  });
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Effect to handle username when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // For authenticated users, we don't need a local username
      // The backend will use their authenticated identity
      setUsername('authenticated_user');
      setShowUsernamePrompt(false);
    } else if (!username) {
      // Show username prompt only for non-authenticated users
      setShowUsernamePrompt(true);
    }
  }, [isAuthenticated, user, username]);

  // Fetch messages for active category
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: [`/api/chat/${activeTab}`],
    refetchInterval: 2000,
    staleTime: 1000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/chat`, {
        content,
        category: activeTab,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/chat/${activeTab}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const getAuthorName = (message: ChatMessage) => {
    // If author exists, use their authentic database information
    if (message.author && message.author.id) {
      // Always prioritize username from database - this is the authentic user identifier
      if (message.author.username) {
        return message.author.username;
      }
      
      // If no username but has firstName, use that
      if (message.author.firstName) {
        return message.author.firstName;
      }
      
      // If no username or firstName, use email prefix (but only for real emails)
      if (message.author.email && message.author.email.includes('@') && !message.author.email.endsWith('@chat.local')) {
        return message.author.email.split('@')[0];
      }
      
      // If we have an ID but no other identifying info, show as authenticated user
      return `User ${message.author.id}`;
    }
    
    // For anonymous messages, check if username is stored in tags
    if (message.tags && message.tags.length > 0 && message.tags[0]) {
      return message.tags[0];
    }
    
    // Truly anonymous
    return "anonymous";
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "now";
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Only require username for anonymous (non-authenticated) users
    if (!isAuthenticated && !username) {
      setShowUsernamePrompt(true);
      return;
    }
    
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSetUsername = (newUsername: string) => {
    if (newUsername.trim()) {
      const trimmedUsername = newUsername.trim();
      setUsername(trimmedUsername);
      localStorage.setItem('chat_username', trimmedUsername);
      setShowUsernamePrompt(false);
    }
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Community Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="markets" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Markets
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="flex items-center gap-2">
              <Sword className="h-4 w-4" />
              Conflicts
            </TabsTrigger>
          </TabsList>

          {["general", "markets", "conflicts"].map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              {/* Messages Area */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto mb-4">
                {isLoading ? (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {getAuthorName(message)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  placeholder={`Message #${category}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  maxLength={500}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      {/* Username Prompt Dialog */}
      <Dialog open={showUsernamePrompt} onOpenChange={setShowUsernamePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Your Username</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter a username to identify yourself in the chat
            </p>
            <Input
              placeholder="Enter your username"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSetUsername(e.currentTarget.value);
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter your username"]') as HTMLInputElement;
                  if (input) handleSetUsername(input.value);
                }}
                className="flex-1"
              >
                Set Username
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}