import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Flower, Apple, Bot, Gamepad2, Users, Plus, TrendingUp } from "lucide-react";
import type { Child } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
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

  const { data: children, isLoading: childrenLoading, error } = useQuery<Child[]>({
    queryKey: ['/api/children'],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
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
  }, [error, toast]);

  if (isLoading || childrenLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" data-testid="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const services = [
    {
      title: 'Assessments',
      description: 'Comprehensive behavioral and cognitive testing',
      icon: Brain,
      link: '/assessments',
      color: 'primary'
    },
    {
      title: 'Yoga Programs',
      description: 'Specialized sessions for stress management',
      icon: Flower,
      link: '/yoga',
      color: 'secondary'
    },
    {
      title: 'Nutrition Plans',
      description: 'Weekly meal plans for optimal growth',
      icon: Apple,
      link: '/nutrition',
      color: 'accent'
    },
    {
      title: 'Robotics Learning',
      description: 'Interactive technology education',
      icon: Bot,
      link: '/robotics',
      color: 'primary'
    },
    {
      title: 'Educational Games',
      description: 'Fun learning through interactive play',
      icon: Gamepad2,
      link: '/games',
      color: 'secondary'
    },
    {
      title: 'Parent Support',
      description: 'Expert guidance and progress tracking',
      icon: Users,
      link: '/dashboard',
      color: 'accent'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="text-welcome">
            Welcome back, {(user as any)?.firstName || 'Parent'}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            Ready to continue your child's development journey?
          </p>
        </div>

        {/* Children Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-children-header">Your Children</h2>
            <Link href="/dashboard">
              <Button variant="outline" data-testid="button-add-child">
                <Plus className="mr-2 h-4 w-4" />
                Add Child Profile
              </Button>
            </Link>
          </div>
          
          {!children || children.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2" data-testid="card-no-children">
              <CardContent>
                <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No child profiles yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating a profile for your child to access personalized assessments and programs.
                </p>
                <Link href="/dashboard">
                  <Button data-testid="button-create-first-child">
                    Create Your First Child Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <Card key={child.id} className="hover:shadow-lg transition-shadow" data-testid={`card-child-${child.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg" data-testid={`text-child-name-${child.id}`}>
                          {child.name}
                        </CardTitle>
                        <CardDescription data-testid={`text-child-age-${child.id}`}>
                          Age {child.age}
                        </CardDescription>
                      </div>
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: child.profileColor || '#4F46E5' }}
                        data-testid={`avatar-child-${child.id}`}
                      >
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" data-testid={`badge-active-${child.id}`}>
                        Active Profile
                      </Badge>
                      <Link href="/dashboard">
                        <Button size="sm" data-testid={`button-view-progress-${child.id}`}>
                          <TrendingUp className="mr-1 h-4 w-4" />
                          View Progress
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Services Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-services-header">
            Available Programs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Link key={index} href={service.link}>
                  <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer" data-testid={`card-service-${index}`}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg bg-${service.color}/10`}>
                          <IconComponent className={`h-6 w-6 text-${service.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid={`text-service-title-${index}`}>
                            {service.title}
                          </CardTitle>
                          <CardDescription data-testid={`text-service-description-${index}`}>
                            {service.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="gradient-bg text-white" data-testid="card-quick-assessment">
            <CardHeader>
              <CardTitle className="text-white">Quick Assessment</CardTitle>
              <CardDescription className="text-white/80">
                Start a behavioral assessment for your child in just a few minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/assessments">
                <Button variant="secondary" data-testid="button-start-assessment">
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card data-testid="card-progress-overview">
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>
                View detailed analytics and reports for all your children
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="outline" data-testid="button-view-dashboard">
                  View Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
