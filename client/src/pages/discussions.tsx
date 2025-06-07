import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, ThumbsDown, Plus, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Author {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface Discussion {
  id: number;
  title: string;
  content: string;
  authorId: number;
  category: string;
  tags: string[] | null;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
}

interface Reply {
  id: number;
  discussionId: number;
  content: string;
  authorId: number;
  parentReplyId: number | null;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  author: Author;
}

export default function Discussions() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<number | null>(null);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    category: "general",
  });
  const [newReply, setNewReply] = useState("");

  const queryClient = useQueryClient();

  // Fetch discussions
  const { data: discussions, isLoading } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
  });

  // Fetch selected discussion details and replies
  const { data: selectedDiscussionData } = useQuery<Discussion>({
    queryKey: ["/api/discussions", selectedDiscussion],
    enabled: !!selectedDiscussion,
  });

  const { data: replies } = useQuery<Reply[]>({
    queryKey: ["/api/discussions", selectedDiscussion, "replies"],
    enabled: !!selectedDiscussion,
  });

  // Create discussion mutation
  const createDiscussionMutation = useMutation({
    mutationFn: async (data: typeof newDiscussion) => {
      return await apiRequest("/api/discussions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      setNewDiscussion({ title: "", content: "", category: "general" });
      setShowCreateForm(false);
    },
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (data: { content: string; parentReplyId?: number }) => {
      return await apiRequest(`/api/discussions/${selectedDiscussion}/replies`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions", selectedDiscussion, "replies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      setNewReply("");
    },
  });

  // Vote on discussion mutation
  const voteMutation = useMutation({
    mutationFn: async ({ discussionId, voteType }: { discussionId: number; voteType: 'up' | 'down' }) => {
      return await apiRequest(`/api/discussions/${discussionId}/vote`, {
        method: "POST",
        body: JSON.stringify({ voteType }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      if (selectedDiscussion) {
        queryClient.invalidateQueries({ queryKey: ["/api/discussions", selectedDiscussion] });
      }
    },
  });

  const handleCreateDiscussion = () => {
    if (newDiscussion.title.trim() && newDiscussion.content.trim()) {
      createDiscussionMutation.mutate(newDiscussion);
    }
  };

  const handleCreateReply = () => {
    if (newReply.trim() && selectedDiscussion) {
      createReplyMutation.mutate({ content: newReply });
    }
  };

  const getAuthorName = (author: Author) => {
    if (author.firstName || author.lastName) {
      return `${author.firstName || ""} ${author.lastName || ""}`.trim();
    }
    return author.username;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "bg-blue-100 text-blue-800",
      geopolitical: "bg-red-100 text-red-800",
      economic: "bg-green-100 text-green-800",
      defense: "bg-purple-100 text-purple-800",
      analysis: "bg-orange-100 text-orange-800",
    };
    return colors[category] || colors.general;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discussion Board</h1>
          <p className="text-gray-600 mt-2">Engage in geopolitical discussions and share insights</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Discussion
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Discussion title"
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
            />
            <select
              className="w-full p-2 border rounded-md"
              value={newDiscussion.category}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
            >
              <option value="general">General</option>
              <option value="geopolitical">Geopolitical</option>
              <option value="economic">Economic</option>
              <option value="defense">Defense</option>
              <option value="analysis">Analysis</option>
            </select>
            <Textarea
              placeholder="Share your thoughts..."
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
              rows={4}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateDiscussion}
                disabled={createDiscussionMutation.isPending}
              >
                {createDiscussionMutation.isPending ? "Creating..." : "Create Discussion"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discussions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Discussions</h2>
          {discussions && discussions.length > 0 ? (
            discussions.map((discussion) => (
              <Card 
                key={discussion.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDiscussion === discussion.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedDiscussion(discussion.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(discussion.category)}>
                      {discussion.category}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{discussion.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{discussion.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {getAuthorName(discussion.author).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-700">
                        {getAuthorName(discussion.author)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{discussion.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{discussion.replyCount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No discussions yet</h3>
                <p className="text-gray-500 mb-4">Be the first to start a geopolitical discussion!</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  Start Discussion
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Selected Discussion Detail */}
        <div>
          {selectedDiscussion && selectedDiscussionData ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge className={getCategoryColor(selectedDiscussionData.category)}>
                    {selectedDiscussionData.category}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(selectedDiscussionData.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <CardTitle className="text-xl">{selectedDiscussionData.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {getAuthorName(selectedDiscussionData.author).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700">
                    {getAuthorName(selectedDiscussionData.author)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{selectedDiscussionData.content}</p>
                
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => voteMutation.mutate({ discussionId: selectedDiscussion, voteType: 'up' })}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {selectedDiscussionData.upvotes}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => voteMutation.mutate({ discussionId: selectedDiscussion, voteType: 'down' })}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    {selectedDiscussionData.downvotes}
                  </Button>
                </div>

                {/* Replies Section */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Replies ({selectedDiscussionData.replyCount})</h4>
                  
                  {/* Reply Form */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      rows={3}
                      className="mb-2"
                    />
                    <Button 
                      onClick={handleCreateReply}
                      disabled={createReplyMutation.isPending}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Send className="w-4 h-4" />
                      {createReplyMutation.isPending ? "Posting..." : "Reply"}
                    </Button>
                  </div>

                  {/* Replies List */}
                  <div className="space-y-3">
                    {replies && replies.length > 0 ? (
                      replies.map((reply) => (
                        <div key={reply.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {getAuthorName(reply.author).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {getAuthorName(reply.author)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{reply.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No replies yet. Be the first to reply!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Discussion</h3>
                <p className="text-gray-500">Choose a discussion from the left to view details and replies</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}