import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

interface ChatMessage {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  sector?: string;
}

export function CommunityChat() {
  const [newMessage, setNewMessage] = useState("");
  const [selectedSector, setSelectedSector] = useState("general");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sectors = [
    { key: "general", name: "General", color: "bg-blue-100 text-blue-800" },
    { key: "defense", name: "Defense", color: "bg-red-100 text-red-800" },
    { key: "health", name: "Health", color: "bg-green-100 text-green-800" },
    { key: "energy", name: "Energy", color: "bg-orange-100 text-orange-800" }
  ];

  // Query for chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", selectedSector],
    queryFn: async () => {
      const response = await fetch(`/api/chat/messages?sector=${selectedSector}&limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; sector?: string }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageData.content,
          category: messageData.sector,
          tempUsername: user?.username || "Anonymous"
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setNewMessage("");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate({
      content: newMessage,
      sector: selectedSector === "general" ? undefined : selectedSector
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-[400px] flex flex-col">
      {/* Sector Selection */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {sectors.map((sector) => (
          <Badge
            key={sector.key}
            variant={selectedSector === sector.key ? "default" : "outline"}
            className={`cursor-pointer hover:opacity-80 ${
              selectedSector === sector.key ? sector.color : ""
            }`}
            onClick={() => setSelectedSector(sector.key)}
          >
            {sector.name}
          </Badge>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 rounded-lg p-4 mb-4 min-h-[250px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <MessageCircle className="h-6 w-6 mr-2" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Users className="h-8 w-8 mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-slate-900">
                    {message.username}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${sectors.find(s => s.key === selectedSector)?.name} chat...`}
          disabled={sendMessageMutation.isPending}
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}