import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Send, User, Plus, Search, Heart, MessageCircle, ThumbsUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Author {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

interface Discussion {
  id: number;
  title: string;
  content: string;
  authorId: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  replyCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  author?: Author;
}

interface Reply {
  id: number;
  discussionId: number;
  content: string;
  authorId: string;
  parentReplyId: number | null;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  author?: Author;
}

export default function DiscussionBoard() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<number | null>(null);
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", content: "" });
  const [newReply, setNewReply] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: discussions, isLoading } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
    refetchInterval: 5000, // Real-time updates
  });

  const { data: selectedDiscussionData } = useQuery<Discussion>({
    queryKey: ["/api/discussions", selectedDiscussion],
    enabled: !!selectedDiscussion,
    refetchInterval: 5000,
  });

  const { data: replies } = useQuery<Reply[]>({
    queryKey: ["/api/discussions", selectedDiscussion, "replies"],
    enabled: !!selectedDiscussion,
    refetchInterval: 5000,
  });

  const createThreadMutation = useMutation({
    mutationFn: async (threadData: { title: string; content: string; category: string }) => {
      return await apiRequest("POST", "/api/discussions", threadData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      queryClient.refetchQueries({ queryKey: ["/api/discussions"] });
      setNewThread({ title: "", content: "" });
      setShowCreateThread(false);
      toast({
        title: "Thread created",
        description: "Your discussion thread has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create thread",
        variant: "destructive",
      });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async (replyData: { discussionId: number; content: string }) => {
      return await apiRequest("POST", `/api/discussions/${replyData.discussionId}/replies`, { content: replyData.content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discussions", selectedDiscussion, "replies"] });
      queryClient.refetchQueries({ queryKey: ["/api/discussions"] });
      setNewReply("");
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async ({ discussionId, replyId }: { discussionId?: number; replyId?: number }) => {
      const endpoint = replyId 
        ? `/api/discussions/replies/${replyId}/like` 
        : `/api/discussions/${discussionId}/like`;
      return await apiRequest("POST", endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      if (selectedDiscussion) {
        queryClient.invalidateQueries({ queryKey: ["/api/discussions", selectedDiscussion, "replies"] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to like",
        variant: "destructive",
      });
    },
  });

  const handleCreateThread = () => {
    if (!newThread.title.trim() || !newThread.content.trim()) return;
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create threads.",
        variant: "destructive",
      });
      return;
    }

    createThreadMutation.mutate({
      ...newThread,
      category: activeCategory,
    });
  };

  const handleReply = () => {
    if (!newReply.trim() || !selectedDiscussion) return;
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to reply.",
        variant: "destructive",
      });
      return;
    }

    createReplyMutation.mutate({
      discussionId: selectedDiscussion,
      content: newReply,
    });
  };

  const handleLike = (discussionId?: number, replyId?: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts.",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate({ discussionId, replyId });
  };

  const filteredDiscussions = discussions?.filter(discussion => {
    const matchesCategory = discussion.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discussion.author?.username?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }) || [];

  const getAuthorName = (author?: Author) => {
    if (author?.username) return author.username;
    if (author?.firstName && author?.lastName) return `${author.firstName} ${author.lastName}`;
    if (author?.firstName) return author.firstName;
    return `User ${author?.id || 'Unknown'}`;
  };

  if (selectedDiscussion && selectedDiscussionData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedDiscussion(null)}>
              ← Back
            </Button>
            <CardTitle className="flex-1">{selectedDiscussionData.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Original Post */}
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{getAuthorName(selectedDiscussionData.author)}</span>
                  <Badge variant="outline">{selectedDiscussionData.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedDiscussionData.createdAt ? formatDistanceToNow(new Date(selectedDiscussionData.createdAt), { addSuffix: true }) : 'Unknown time'}
                  </span>
                </div>
                <p className="text-sm mb-3">{selectedDiscussionData.content}</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(selectedDiscussionData.id)}
                    disabled={!isAuthenticated}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {selectedDiscussionData.upvotes}
                  </Button>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    {selectedDiscussionData.replyCount} replies
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="space-y-3 mb-4">
            {replies?.map((reply) => (
              <div key={reply.id} className="border rounded-lg p-3 ml-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{getAuthorName(reply.author)}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{reply.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(undefined, reply.id)}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {reply.upvotes}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          {isAuthenticated && (
            <div className="border rounded-lg p-3">
              <Textarea
                placeholder="Write your reply..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                className="mb-2"
              />
              <Button onClick={handleReply} disabled={!newReply.trim() || createReplyMutation.isPending}>
                <Send className="h-4 w-4 mr-1" />
                Reply
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Community Discussions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            {/* Search and Create */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search threads by title, content, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={showCreateThread} onOpenChange={setShowCreateThread}>
                <DialogTrigger asChild>
                  <Button disabled={!isAuthenticated}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Thread
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Thread</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Thread title..."
                      value={newThread.title}
                      onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Thread content..."
                      value={newThread.content}
                      onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateThread(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateThread}
                        disabled={!newThread.title.trim() || !newThread.content.trim() || createThreadMutation.isPending}
                      >
                        Create Thread
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Thread List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">Loading discussions...</div>
              ) : filteredDiscussions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No threads found. {searchQuery ? "Try a different search." : "Be the first to start a discussion!"}</p>
                </div>
              ) : (
                filteredDiscussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDiscussion(discussion.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{getAuthorName(discussion.author)}</span>
                          <Badge variant="outline">{discussion.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {discussion.createdAt ? formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true }) : 'Unknown time'}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-1">{discussion.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{discussion.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {discussion.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {discussion.replyCount} replies
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}