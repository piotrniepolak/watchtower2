import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Plus, Send, Users, TrendingUp, Globe } from "lucide-react";
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

export default function DiscussionBoard() {
  const [activeCategory, setActiveCategory] = useState<string>("conflicts");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    category: "conflicts",
  });

  const queryClient = useQueryClient();

  const { data: discussions, isLoading } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions"],
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async (data: typeof newDiscussion) => {
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
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      setNewDiscussion({ title: "", content: "", category: activeCategory });
      setShowCreateForm(false);
    },
  });

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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      conflicts: "bg-red-100 text-red-800",
      markets: "bg-green-100 text-green-800", 
      general: "bg-blue-100 text-blue-800",
    };
    return colors[category] || colors.general;
  };

  const filteredDiscussions = discussions?.filter(discussion => 
    discussion.category === activeCategory || 
    (activeCategory === "conflicts" && discussion.category === "geopolitical") ||
    (activeCategory === "markets" && discussion.category === "economic")
  ) || [];

  const handleCreateDiscussion = () => {
    if (newDiscussion.title.trim() && newDiscussion.content.trim()) {
      createDiscussionMutation.mutate({
        ...newDiscussion,
        category: activeCategory
      });
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
              <CardTitle className="text-xl font-bold">Community Discussions</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Join the conversation on geopolitical insights</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
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

          {/* Create Discussion Form */}
          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Start a new discussion</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Discussion title"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                />
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateDiscussion}
                    disabled={createDiscussionMutation.isPending}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    {createDiscussionMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Discussions List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
              ))}
            </div>
          ) : filteredDiscussions.length > 0 ? (
            <div className="space-y-3">
              {filteredDiscussions.slice(0, 5).map((discussion) => (
                <div
                  key={discussion.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getCategoryColor(discussion.category)} flex items-center gap-1`}>
                        {getCategoryIcon(discussion.category)}
                        {discussion.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {discussion.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {discussion.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {getAuthorName(discussion.author).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-700">
                        {getAuthorName(discussion.author)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs">{discussion.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-xs">{discussion.replyCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredDiscussions.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All {activeCategory} Discussions
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-700 mb-2">No discussions yet</h4>
              <p className="text-gray-500 text-sm mb-4">
                Be the first to start a conversation about {activeCategory}
              </p>
              <Button onClick={() => setShowCreateForm(true)} size="sm">
                Start Discussion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}