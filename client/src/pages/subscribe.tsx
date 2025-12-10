import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Sparkles } from "lucide-react";

export default function Subscribe() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const handleSubscribe = () => {
    toast({
      title: "Coming Soon!",
      description: "Payment integration will be available shortly. All features are currently free!",
    });
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-yellow-500 mr-4" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-subscription-title">
              Growing Mind Premium
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock your child's full potential with our complete development platform
          </p>
        </div>

        <Card className="border-2 border-primary shadow-xl bg-gradient-to-br from-white to-purple-50" data-testid="card-premium-plan">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm px-4 py-1">
                <Star className="h-4 w-4 mr-1 fill-current" />
                Complete Access
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold">All-in-One Plan</CardTitle>
            <CardDescription className="text-lg">
              Everything you need for your child's holistic development
            </CardDescription>
            <div className="mt-6">
              <span className="text-5xl font-bold text-primary">₹349</span>
              <span className="text-muted-foreground text-lg">/month</span>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">📊</span>
                  Assessments & Reports
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm" data-testid="feature-behavioral">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Child Behavioral Assessment
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-personality">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Personality Assessment
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-iq">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    IQ Assessment
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-career">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Career Assessment
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-strengths">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Strengths & Weakness Assessment
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-pdf">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    AI-Powered PDF Reports
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">🧘</span>
                  Wellness Programs
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm" data-testid="feature-yoga">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    21 Age-Appropriate Yoga Poses
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-nutrition">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Complete Nutrition Planning
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-recipes">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Healthy Recipe Library
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-meal">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Weekly Meal Planner
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center">
                  <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">🎮</span>
                  Educational Games
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm" data-testid="feature-games-count">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    26 Interactive Learning Games
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-cognitive">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Cognitive Skills Development
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-emotional">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Emotional Intelligence Training
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-academic">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Academic Skills Enhancement
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center">
                  <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2">🤖</span>
                  STEM Learning
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm" data-testid="feature-robotics">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    7 Robotics Learning Modules
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-coding">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Basics of Coding
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-activities">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Hands-on Mini Activities
                  </li>
                  <li className="flex items-center text-sm" data-testid="feature-parent">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    Parent Support Dashboard
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-6">
              <Button 
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg py-6"
                size="lg"
              >
                <Star className="mr-2 h-5 w-5" />
                Subscribe Now - ₹349/month
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Cancel anytime. No hidden fees. Full access to all features.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at support@growingmind.com
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
