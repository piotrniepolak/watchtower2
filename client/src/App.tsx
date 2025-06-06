import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/components/auth-provider";
import Dashboard from "@/pages/dashboard";
import Conflicts from "@/pages/conflicts";
import Markets from "@/pages/markets";
import Analysis from "@/pages/analysis";
import Reports from "@/pages/reports";
import DedicatedWatchlist from "@/pages/dedicated-watchlist";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import ApiDocs from "@/pages/api-docs";
import Support from "@/pages/support";
import Learning from "@/pages/learning";
import Profile from "@/pages/profile";
import Landing from "@/pages/landing";
import Register from "@/pages/register";
import { useAuth } from "@/hooks/useAuth";

import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/register" component={Register} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/conflicts" component={Conflicts} />
          <Route path="/markets" component={Markets} />
          <Route path="/analysis" component={Analysis} />
          <Route path="/reports" component={Reports} />
          <Route path="/watchlist" component={DedicatedWatchlist} />
          <Route path="/learning" component={Learning} />
          <Route path="/profile" component={Profile} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/api" component={ApiDocs} />
          <Route path="/support" component={Support} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
