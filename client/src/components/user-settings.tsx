import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, User, Edit, Check, X } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export default function UserSettings() {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const usernameUpdateMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest('PATCH', '/api/auth/username', { username });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
      setIsEditingUsername(false);
      setNewUsername("");
      // Update the user data in the cache
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to update username";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleEditUsername = () => {
    setNewUsername(user?.username || "");
    setIsEditingUsername(true);
  };

  const handleSaveUsername = () => {
    if (newUsername.trim() && newUsername !== user?.username) {
      usernameUpdateMutation.mutate(newUsername.trim());
    } else {
      setIsEditingUsername(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingUsername(false);
    setNewUsername("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            User Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            User Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Please log in to view settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          User Settings
        </CardTitle>
        <p className="text-sm text-slate-600">
          Manage your account settings and preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Username Setting */}
        <div className="space-y-3">
          <Label htmlFor="username" className="text-sm font-medium">
            Username
          </Label>
          {isEditingUsername ? (
            <div className="flex items-center space-x-2">
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                className="flex-1"
                minLength={3}
                maxLength={20}
                pattern="^[a-zA-Z0-9_-]+$"
              />
              <Button
                size="sm"
                onClick={handleSaveUsername}
                disabled={usernameUpdateMutation.isPending || !newUsername.trim()}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={usernameUpdateMutation.isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-slate-500" />
                <span className="font-medium">{user.username}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEditUsername}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}
          <p className="text-xs text-slate-500">
            Username must be 3-20 characters and can contain letters, numbers, underscores, and hyphens.
          </p>
        </div>

        {/* Account Information */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Account Information</Label>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            {user.firstName && (
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">First Name</span>
                <span className="font-medium">{user.firstName}</span>
              </div>
            )}
            {user.lastName && (
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Last Name</span>
                <span className="font-medium">{user.lastName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Usage Information */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quiz Leaderboard</Label>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Your username <strong>{user.username}</strong> will appear on the daily quiz leaderboard when you complete quizzes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}