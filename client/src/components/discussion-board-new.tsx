import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { 
  ThumbsUp, 
  MessageCircle, 
  Plus, 
  Search, 
  User, 
  Send,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

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
  const [selectedDiscussion, setSelectedDiscussion] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [newThread, setNewThread] = useState({
    title: "",
    content: "",
    category: "general"
  });

  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all discussions with optimized caching
  const { data: discussions = [], isLoading } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
    staleTime: 1000, // 1 second
    refetchInterval: 3000,
  });

  // Fetch selected discussion details
  const { data: selectedDiscussionData } = useQuery<Discussion>({
    queryKey: ["/api/discussions", selectedDiscussion],
    enabled: !!selectedDiscussion,
    staleTime: 0,
  });

  // Fetch replies for selected discussion
  const { data: replies = [] } = useQuery<Reply[]>({
    queryKey: ["/api/discussions", selectedDiscussion, "replies"],
    enabled: !!selectedDiscussion,
    staleTime: 0,
  });

  // Create new discussion
  const createMutation = useMutation({
    mutationFn: async (data: typeof newThread) => {
      return await apiRequest("POST", "/api/discussions", data);
    },
    onSuccess: () => {
      setNewThread({ title: "", content: "", category: "general" });
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      toast({ title: "Success", description: "Discussion created successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create new reply
  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/discussions/${selectedDiscussion}/replies`, { content });
    },
    onSuccess: () => {
      setNewReply("");
      queryClient.invalidateQueries({ queryKey: ["/api/discussions", selectedDiscussion, "replies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      toast({ title: "Success", description: "Reply posted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Like discussion or reply
  const likeMutation = useMutation({
    mutationFn: async ({ discussionId, replyId }: { discussionId?: number; replyId?: number }) => {
      const endpoint = replyId 
        ? `/api/discussions/replies/${replyId}/like` 
        : `/api/discussions/${discussionId}/like`;
      return await apiRequest("POST", endpoint);
    },
    onSuccess: () => {
      // Invalidate all related queries for instant updates
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      if (selectedDiscussion) {
        queryClient.invalidateQueries({ queryKey: ["/api/discussions", selectedDiscussion] });
        queryClient.invalidateQueries({ queryKey: ["/api/discussions", selectedDiscussion, "replies"] });
      }
      toast({ title: "Success", description: "Like recorded!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getAuthorName = (author?: Author) => {
    if (!author) return "Unknown User";
    return author.username || `${author.firstName || ""} ${author.lastName || ""}`.trim() || "Anonymous";
  };

  const filteredDiscussions = discussions.filter(discussion => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      discussion.title.toLowerCase().includes(query) ||
      discussion.content.toLowerCase().includes(query) ||
      getAuthorName(discussion.author).toLowerCase().includes(query)
    );
  });

  // Detail view for selected discussion
  if (selectedDiscussion && selectedDiscussionData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedDiscussion(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Discussions
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Original Post */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{getAuthorName(selectedDiscussionData.author)}</span>
                  <Badge variant="outline">{selectedDiscussionData.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(selectedDiscussionData.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2">{selectedDiscussionData.title}</h2>
                <p className="text-sm mb-3">{selectedDiscussionData.content}</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeMutation.mutate({ discussionId: selectedDiscussion })}
                    disabled={!isAuthenticated || likeMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {selectedDiscussionData.upvotes}
                  </Button>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    {replies.length} replies
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Replies ({replies.length})</h3>
            {replies.map((reply) => (
              <div key={reply.id} className="border rounded-lg p-4 ml-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{getAuthorName(reply.author)}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{reply.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeMutation.mutate({ replyId: reply.id })}
                      disabled={!isAuthenticated || likeMutation.isPending}
                      className="flex items-center gap-1"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {reply.upvotes}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          {isAuthenticated && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Add a Reply</h4>
              <div className="space-y-3">
                <Textarea
                  placeholder="Write your reply..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => replyMutation.mutate(newReply)}
                    disabled={!newReply.trim() || replyMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Post Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Main discussion list view
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Community Discussions</CardTitle>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {isAuthenticated && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Create Form */}
        {showCreateForm && isAuthenticated && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold mb-3">Start a New Discussion</h3>
            <div className="space-y-3">
              <Input
                placeholder="Discussion title..."
                value={newThread.title}
                onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
              />
              <Textarea
                placeholder="What would you like to discuss?"
                value={newThread.content}
                onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                className="min-h-[120px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createMutation.mutate(newThread)}
                  disabled={!newThread.title.trim() || !newThread.content.trim() || createMutation.isPending}
                >
                  Create Discussion
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Discussion List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">Loading discussions...</div>
          ) : filteredDiscussions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No discussions found. {searchQuery ? "Try a different search." : "Start the conversation!"}</p>
            </div>
          ) : (
            filteredDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelectedDiscussion(discussion.id)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{getAuthorName(discussion.author)}</span>
                      <Badge variant="outline" className="text-xs">{discussion.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1 truncate">{discussion.title}</h3>
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
      </CardContent>
    </Card>
  );
}