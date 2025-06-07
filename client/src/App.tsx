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
import Login from "@/pages/login";
import Quiz from "@/pages/quiz";
import Leaderboard from "@/pages/leaderboard";
import { useAuth } from "@/hooks/useAuth";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/conflicts" component={Conflicts} />
      <Route path="/markets" component={Markets} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/reports" component={Reports} />
      <Route path="/watchlist" component={DedicatedWatchlist} />
      <Route path="/learning" component={Learning} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/api" component={ApiDocs} />
      <Route path="/support" component={Support} />
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
