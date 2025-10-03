import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import CommandPalette from "@/components/CommandPalette";
import Dashboard from "@/pages/Dashboard";
import Landing from "@/pages/Landing";
import LeadsProjects from "@/pages/LeadsProjects";
import SalesPipeline from "@/pages/SalesPipeline";
import AIAgents from "@/pages/AIAgents";
import Marketing from "@/pages/Marketing";
import Analytics from "@/pages/Analytics";
import Documents from "@/pages/Documents";
import SocialMediaScheduler from "@/pages/SocialMediaScheduler";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/leads-projects" component={LeadsProjects} />
          <Route path="/sales-pipeline" component={SalesPipeline} />
          <Route path="/ai-agents" component={AIAgents} />
          <Route path="/marketing" component={Marketing} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/documents" component={Documents} />
          <Route path="/social-scheduler" component={SocialMediaScheduler} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-background text-foreground">
          <Toaster />
          <CommandPalette />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
