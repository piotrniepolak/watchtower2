import { useState, useEffect } from "react";

// Simple mock authentication for the daily quiz functionality
// This provides a basic user session without requiring full authentication infrastructure
export function useAuth() {
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and create a mock user session
    const timer = setTimeout(() => {
      // Create a mock user for testing the quiz functionality
      setUser({
        id: 1,
        email: "demo@conflictwatch.com"
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}