import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Send, 
  User, 
  TrendingUp,
  Globe,
  Sword
} from "lucide-react";
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
  tags?: string[];
  tempUsername?: string;
}

export default function PublicChat() {
  const [activeTab, setActiveTab] = useState("general");
  const [newMessage, setNewMessage] = useState("");
  const [chatUsername, setChatUsername] = useState("");
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Check if user has a chat username in localStorage
  useEffect(() => {
    const storedChatUsername = localStorage.getItem('chatUsername');
    if (storedChatUsername) {
      setChatUsername(storedChatUsername);
    }
  }, []);

  // Fetch messages for the active tab
  const { data: messages = [], isLoading } = useQuery({
    queryKey: [`/api/chat/${activeTab}`],
    refetchInterval: 3000,
  });

  // Send message mutation - requires chat username
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/chat`, {
        content,
        category: activeTab,
        tempUsername: chatUsername,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/chat/${activeTab}`] });
      queryClient.refetchQueries({ queryKey: [`/api/chat/${activeTab}`], type: 'active' });
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
    // Check if message has temporary username in tags (new system)
    if (message.tags && message.tags.length > 0 && message.tags[0]) {
      return message.tags[0];
    }
    
    // Check if message has temporary username property (backup)
    if (message.tempUsername) {
      return message.tempUsername;
    }
    
    // Fallback to authenticated user data
    if (message.author) {
      if (message.author.username) {
        return message.author.username;
      }
      if (message.author.firstName) {
        return message.author.firstName;
      }
      return "User";
    }
    
    return "Anonymous";
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Check if user has set a chat username
    if (!chatUsername.trim()) {
      setShowUsernamePrompt(true);
      return;
    }
    
    await sendMessageMutation.mutateAsync(newMessage);
  };

  const handleUsernameSubmit = (username: string) => {
    setChatUsername(username);
    localStorage.setItem('chatUsername', username);
    setShowUsernamePrompt(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

              {/* Message Input - Anyone can chat with username */}
              <div className="flex gap-2">
                <Input
                  placeholder={chatUsername ? `Message #${category} as ${chatUsername}` : `Choose username to message #${category}`}
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
            <DialogTitle>Choose Your Chat Username</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose a display name for chat. This will be saved locally and used for all your messages.
            </p>
            <UsernamePrompt onSubmit={handleUsernameSubmit} />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Username prompt component
function UsernamePrompt({ onSubmit }: { onSubmit: (username: string) => void }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && username.length >= 2) {
      onSubmit(username.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Enter your username (2-20 characters)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        maxLength={20}
        minLength={2}
        autoFocus
      />
      <div className="flex gap-2">
        <Button 
          type="submit" 
          disabled={!username.trim() || username.length < 2}
          className="flex-1"
        >
          Set Username
        </Button>
      </div>
    </form>
  );
}