import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok && !isCancelled) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else if (!isCancelled) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (!isCancelled) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}