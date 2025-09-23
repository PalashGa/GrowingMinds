import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Info, Users } from "lucide-react";

export default function Subscribe() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" data-testid="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-subscription-title">
              Subscription Plans
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome, {user?.firstName || 'User'}! All features are currently available in your account.
          </p>
        </div>

        {/* Information Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800" data-testid="card-notice">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Payment Features Currently Disabled
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  All premium features are currently available to all users while payment processing is being updated. 
                  You have full access to assessments, yoga sessions, nutrition plans, robotics modules, and educational games.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Features */}
        <Card data-testid="card-features">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
              Your Current Access
            </CardTitle>
            <CardDescription>
              All features included - no payment required at this time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Assessment & Analysis</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm" data-testid="feature-behavioral-assessment">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Complete Behavioral Assessments
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-progress-tracking">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Detailed Progress Tracking
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-insights">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Personalized Insights & Reports
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Development Programs</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm" data-testid="feature-yoga">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Age-Appropriate Yoga Sessions
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-nutrition">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Weekly Nutrition Planning
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-robotics">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Interactive Robotics Modules
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-games">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Educational Learning Games
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4" data-testid="badge-access-level">
                  Full Access Enabled
                </Badge>
                <p className="text-sm text-muted-foreground">
                  You can explore all features while we prepare our updated subscription options.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}