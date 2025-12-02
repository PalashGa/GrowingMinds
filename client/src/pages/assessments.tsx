import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Users, CheckCircle } from "lucide-react";
import type { AssessmentType, Child } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Assessments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: children, error: childrenError } = useQuery<Child[]>({
    queryKey: ['/api/children'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: assessmentTypes, isLoading: assessmentsLoading, error: assessmentsError } = useQuery<AssessmentType[]>({
    queryKey: ['/api/assessments/types'],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if ((childrenError && isUnauthorizedError(childrenError)) || (assessmentsError && isUnauthorizedError(assessmentsError))) {
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
  }, [childrenError, assessmentsError, toast]);

  if (isLoading || assessmentsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" data-testid="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const getAssessmentIcon = (name: string) => {
    switch (name) {
      case 'behavioral':
      case 'child_behavioral':
        return Brain;
      case 'personality':
        return Users;
      case 'iq':
        return Brain;
      case 'career':
        return CheckCircle;
      case 'strengths_weakness':
        return CheckCircle;
      default:
        return Brain;
    }
  };

  const getAssessmentColor = (name: string) => {
    switch (name) {
      case 'behavioral':
      case 'child_behavioral':
        return 'primary';
      case 'personality':
        return 'secondary';
      case 'iq':
        return 'accent';
      case 'career':
        return 'primary';
      case 'strengths_weakness':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="text-assessments-title">
            Child Development Assessments
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover your child's unique strengths, personality traits, and developmental needs through our comprehensive assessment suite.
          </p>
        </div>

        {/* No Children Warning */}
        {!children || children.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 mb-8" data-testid="card-no-children">
            <CardContent>
              <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No child profiles found</h3>
              <p className="text-muted-foreground mb-4">
                You need to create a child profile before taking assessments.
              </p>
              <Link href="/dashboard">
                <Button data-testid="button-create-child-profile">
                  Create Child Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {/* Assessment Types Grid */}
        {assessmentTypes && assessmentTypes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
            {assessmentTypes.map((assessment) => {
              const IconComponent = getAssessmentIcon(assessment.name);
              const colorClass = getAssessmentColor(assessment.name);
              
              return (
                <Card 
                  key={assessment.id} 
                  className="service-card hover:shadow-lg transition-all hover:scale-105"
                  data-testid={`card-assessment-${assessment.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-${colorClass}/10`}>
                        <IconComponent className={`h-8 w-8 text-${colorClass}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2" data-testid={`text-assessment-title-${assessment.id}`}>
                          {assessment.displayName}
                        </CardTitle>
                        <div className="flex items-center space-x-4 mb-3">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-age-range-${assessment.id}`}>
                            Ages {assessment.ageMin}-{assessment.ageMax}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            <span data-testid={`text-duration-${assessment.id}`}>{assessment.duration} min</span>
                          </div>
                        </div>
                        <CardDescription data-testid={`text-assessment-description-${assessment.id}`}>
                          {assessment.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <strong>What you'll discover:</strong>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {(assessment.name === 'behavioral' || assessment.name === 'child_behavioral') && (
                          <>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Emotional & behavioral patterns</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Social skills & peer relationships</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Self-esteem & confidence levels</li>
                          </>
                        )}
                        {assessment.name === 'personality' && (
                          <>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Core personality traits</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Emotional expression patterns</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Learning and play preferences</li>
                          </>
                        )}
                        {assessment.name === 'iq' && (
                          <>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Cognitive abilities assessment</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Problem-solving skills</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Learning capacity evaluation</li>
                          </>
                        )}
                        {assessment.name === 'career' && (
                          <>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Interest and aptitude mapping</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Potential career paths</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Educational recommendations</li>
                          </>
                        )}
                        {assessment.name === 'strengths_weakness' && (
                          <>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Personal strengths identification</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Areas for improvement</li>
                            <li className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-secondary" />Learning style preferences</li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    <div className="mt-6">
                      {children && children.length > 0 ? (
                        <Link href={`/assessment/${assessment.id}`}>
                          <Button 
                            className={`w-full bg-${colorClass} text-${colorClass}-foreground hover:bg-${colorClass}/90`}
                            data-testid={`button-start-assessment-${assessment.id}`}
                          >
                            Start Assessment
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          disabled 
                          className="w-full"
                          data-testid={`button-start-assessment-disabled-${assessment.id}`}
                        >
                          Create Child Profile First
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Brain className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assessments available</h3>
            <p className="text-muted-foreground">
              Assessment types will be available once the system is configured.
            </p>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            How Our Assessments Work
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Select the assessment type that best fits your child's age and your goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary-foreground">2</span>
              </div>
              <h3 className="font-semibold mb-2">Complete Questions</h3>
              <p className="text-sm text-muted-foreground">
                Answer thoughtfully designed questions about your child's behavior and preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent-foreground">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Results</h3>
              <p className="text-sm text-muted-foreground">
                Receive a detailed report with insights and personalized recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Discover Your Child's Potential?
          </h2>
          <p className="text-muted-foreground mb-6">
            Start with any assessment that matches your child's age range and interests.
          </p>
          {children && children.length > 0 ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="outline" data-testid="button-view-dashboard">
                  View Dashboard
                </Button>
              </Link>
              {assessmentTypes && assessmentTypes.length > 0 && (
                <Link href={`/assessment/${assessmentTypes[0].id}`}>
                  <Button data-testid="button-start-first-assessment">
                    Start First Assessment
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Link href="/dashboard">
              <Button data-testid="button-setup-profile">
                Set Up Child Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
