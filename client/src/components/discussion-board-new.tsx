import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { 
  MessageCircle, 
  Plus, 
  Search, 
  User, 
  Send,
  ArrowLeft,
  Clock
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



  const getAuthorName = (author?: Author) => {
    if (!author) return "Unknown User";
    return author.username || `${author.firstName || ""} ${author.lastName || ""}`.trim() || "Anonymous";
  };

  const formatSafeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "recently";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "recently";
    }
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
                    {formatSafeDate(selectedDiscussionData.createdAt)}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-3">{selectedDiscussionData.title}</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedDiscussionData.content}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {replies.length} replies
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Started {formatSafeDate(selectedDiscussionData.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Replies Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Replies ({replies.length})
            </h3>
            <div className="space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 border-2 border-gray-200 dark:border-gray-700">
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getAuthorName(reply.author)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatSafeDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Form */}
          {isAuthenticated && (
            <div className="border-t pt-6 mt-6">
              <h4 className="font-medium mb-4 text-gray-900 dark:text-gray-100">Add a Reply</h4>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts on this discussion..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="min-h-[120px] border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => replyMutation.mutate(newReply)}
                    disabled={!newReply.trim() || replyMutation.isPending}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                    {replyMutation.isPending ? "Posting..." : "Post Reply"}
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
                className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group"
                onClick={() => setSelectedDiscussion(discussion.id)}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-11 w-11 border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors">
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {getAuthorName(discussion.author)}
                      </span>
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                        {discussion.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {discussion.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {discussion.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {discussion.replyCount} {discussion.replyCount === 1 ? 'reply' : 'replies'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Last activity {formatSafeDate(discussion.lastActivityAt)}
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