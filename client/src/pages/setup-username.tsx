import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserCheck, AlertCircle } from "lucide-react";

export default function SetupUsername() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const setupUsernameMutation = useMutation({
    mutationFn: async (usernameData: { username: string }) => {
      return await apiRequest("POST", "/api/auth/setup-username", usernameData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Username created!",
        description: "Welcome to ConflictWatch Intelligence Platform",
      });
      window.location.href = "/"; // Redirect to home
    },
    onError: (error: any) => {
      setError(error.message || "Failed to create username");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }
    
    setupUsernameMutation.mutate({ username: username.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Choose Your Username</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Create a unique username to complete your registration
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                disabled={setupUsernameMutation.isPending}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                3+ characters, letters, numbers, and underscores only
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={setupUsernameMutation.isPending}
            >
              {setupUsernameMutation.isPending ? "Creating..." : "Create Username"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}