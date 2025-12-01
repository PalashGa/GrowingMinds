import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "./pages/landing";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Assessments from "./pages/assessments";
import AssessmentTest from "./pages/assessment-test";
import Yoga from "./pages/yoga";
import Nutrition from "./pages/nutrition";
import Robotics from "./pages/robotics";
import Games from "./pages/games";
import Subscribe from "./pages/subscribe";
import NotFound from "./pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/assessments" component={Assessments} />
      <Route path="/assessment/:typeId" component={AssessmentTest} />
      <Route path="/yoga" component={Yoga} />
      <Route path="/nutrition" component={Nutrition} />
      <Route path="/robotics" component={Robotics} />
      <Route path="/games" component={Games} />
      <Route path="/subscribe" component={Subscribe} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
