import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [location, setLocation] = useLocation();

  // Check current user status
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/current-user"],
    retry: false,
  });

  useEffect(() => {
    // Skip redirect logic if still loading
    if (isLoading) return;

    // Skip redirect if on setup page already
    if (location === "/setup-username") return;

    // Skip redirect for public pages
    const publicPaths = ["/login", "/register", "/landing", "/privacy", "/terms"];
    if (publicPaths.includes(location)) return;

    // If user is logged in but has no username, redirect to setup
    if (user && user.id && !user.username) {
      setLocation("/setup-username");
      return;
    }

    // If user is not logged in, redirect to landing
    if (!user && !error) {
      setLocation("/landing");
      return;
    }
  }, [user, isLoading, error, location, setLocation]);

  return <>{children}</>;
}