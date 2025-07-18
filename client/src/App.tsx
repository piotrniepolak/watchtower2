import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import Dashboard from "@/pages/dashboard";
import EnhancedMultiSectorDashboard from "@/components/enhanced-multi-sector-dashboard";
import SectorDashboardWrapper from "@/components/sector-dashboard-wrapper";
import Conflicts from "@/pages/conflicts";
import Markets from "@/pages/markets";

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
import Settings from "@/pages/settings";
import Discussions from "@/pages/discussions";
import SetupUsername from "@/pages/setup-username";
import Outbreaks from "@/pages/outbreaks";
import Pharma from "@/pages/pharma";
import Regulations from "@/pages/regulations";
import Commodities from "@/pages/commodities";
import ResearchIntel from "@/pages/research-intel";
import CaseStudies from "@/pages/case-studies";
import Trends from "@/pages/trends";
import MarketAnalysis from "@/pages/market-analysis";
import Home from "@/pages/home";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Sector-specific routes with equal treatment */}
      <Route path="/defense" component={SectorDashboardWrapper} />
      <Route path="/defense/dashboard" component={SectorDashboardWrapper} />
      <Route path="/defense/conflicts" component={Conflicts} />
      <Route path="/defense/markets" component={Markets} />
      <Route path="/defense/reports" component={Reports} />
      <Route path="/defense/learning" component={Learning} />
      
      <Route path="/health" component={SectorDashboardWrapper} />
      <Route path="/health/dashboard" component={SectorDashboardWrapper} />
      <Route path="/health/outbreaks" component={Outbreaks} />
      <Route path="/health/pharma" component={Pharma} />
      <Route path="/health/research" component={ResearchIntel} />
      <Route path="/health/case-studies" component={CaseStudies} />
      
      <Route path="/energy" component={SectorDashboardWrapper} />
      <Route path="/energy/dashboard" component={SectorDashboardWrapper} />
      <Route path="/energy/regulations" component={Regulations} />
      <Route path="/energy/commodities" component={Commodities} />
      <Route path="/energy/trends" component={Trends} />
      <Route path="/energy/market-analysis" component={MarketAnalysis} />

      {/* Legacy dashboard route redirects to home */}
      <Route path="/dashboard" component={Home} />
      
      {/* Global/shared routes */}
      <Route path="/watchlist" component={DedicatedWatchlist} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/setup-username" component={SetupUsername} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/api" component={ApiDocs} />
      <Route path="/support" component={Support} />
      <Route path="/discussions" component={Discussions} />
      
      <Route path="*" component={NotFound} />
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
