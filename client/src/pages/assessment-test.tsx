import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AssessmentForm from "@/components/assessment-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, User, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { AssessmentType, AssessmentQuestion, Child } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AssessmentTest() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, params] = useRoute("/assessment/:typeId");
  const typeId = params?.typeId;
  const queryClient = useQueryClient();
  
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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

  const { data: assessmentType, error: typeError } = useQuery<AssessmentType>({
    queryKey: ['/api/assessments/types', typeId],
    enabled: isAuthenticated && !!typeId,
    retry: false,
  });

  const { data: questions, error: questionsError } = useQuery<AssessmentQuestion[]>({
    queryKey: ['/api/assessments', typeId, 'questions'],
    enabled: isAuthenticated && !!typeId,
    retry: false,
  });

  const saveResultMutation = useMutation({
    mutationFn: async (resultData: any) => {
      const response = await apiRequest("POST", "/api/assessments/results", resultData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      setIsCompleted(true);
      toast({
        title: "Assessment Complete!",
        description: "Your results have been saved and will be available in your dashboard.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to save assessment results. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if ((childrenError && isUnauthorizedError(childrenError)) || 
        (typeError && isUnauthorizedError(typeError)) || 
        (questionsError && isUnauthorizedError(questionsError))) {
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
  }, [childrenError, typeError, questionsError, toast]);

  // Auto-select first child if only one exists
  useEffect(() => {
    if (children && children.length === 1 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!selectedChildId || !typeId) return;

    // Calculate basic scores (this would be more sophisticated in a real app)
    const scores = {
      totalQuestions: questions?.length || 0,
      answeredQuestions: Object.keys(answers).length,
      completionRate: ((Object.keys(answers).length / (questions?.length || 1)) * 100).toFixed(1)
    };

    const resultData = {
      childId: selectedChildId,
      assessmentTypeId: typeId,
      answers,
      scores,
      insights: {
        summary: "Assessment completed successfully. Detailed analysis available in full report."
      },
      recommendations: "Based on this assessment, we recommend continuing with regular development activities."
    };

    saveResultMutation.mutate(resultData);
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

  if (!assessmentType) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center p-8">
            <CardContent>
              <h1 className="text-2xl font-bold mb-4">Assessment Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The assessment you're looking for doesn't exist or isn't available.
              </p>
              <Link href="/assessments">
                <Button>Back to Assessments</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const selectedChild = children?.find(child => child.id === selectedChildId);
  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/assessments">
            <Button variant="ghost" size="sm" className="mr-4" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-assessment-title">
              {assessmentType.displayName}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <Badge variant="outline" data-testid="badge-age-range">
                Ages {assessmentType.ageMin}-{assessmentType.ageMax}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                <span data-testid="text-duration">{assessmentType.duration} minutes</span>
              </div>
            </div>
          </div>
        </div>

        {isCompleted ? (
          /* Completion Screen */
          <Card className="text-center p-8" data-testid="card-completion">
            <CardContent>
              <CheckCircle className="mx-auto h-16 w-16 text-secondary mb-6" />
              <h2 className="text-2xl font-bold mb-4">Assessment Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for completing the {assessmentType.displayName}. Your results have been saved and are being processed.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You can view detailed results and recommendations in your dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button data-testid="button-view-dashboard">
                      View Dashboard
                    </Button>
                  </Link>
                  <Link href="/assessments">
                    <Button variant="outline" data-testid="button-more-assessments">
                      Take Another Assessment
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !isStarted ? (
          /* Setup Screen */
          <Card data-testid="card-setup">
            <CardHeader>
              <CardTitle>Before We Begin</CardTitle>
              <CardDescription>
                {assessmentType.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Child Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Child</label>
                {!children || children.length === 0 ? (
                  <div className="text-center p-6 border border-dashed rounded-lg">
                    <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You need to create a child profile before taking assessments.
                    </p>
                    <Link href="/dashboard">
                      <Button data-testid="button-create-child">Create Child Profile</Button>
                    </Link>
                  </div>
                ) : (
                  <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                    <SelectTrigger data-testid="select-child">
                      <SelectValue placeholder="Choose which child this assessment is for" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id} data-testid={`option-child-${child.id}`}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: child.profileColor || '#4F46E5' }}
                            />
                            <span>{child.name} (Age {child.age})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Assessment Info */}
              {selectedChild && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Assessment Details:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Estimated time: {assessmentType.duration} minutes</li>
                    <li>• Questions: {questions?.length || 0} total</li>
                    <li>• For: {selectedChild.name} (Age {selectedChild.age})</li>
                    <li>• All responses are confidential and secure</li>
                  </ul>
                </div>
              )}

              <div className="flex justify-center">
                <Button 
                  onClick={() => setIsStarted(true)}
                  disabled={!selectedChildId || !questions || questions.length === 0}
                  className="px-8"
                  data-testid="button-start-assessment"
                >
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Assessment Form */
          <div className="space-y-6">
            {/* Question */}
            {currentQuestion && (
              <AssessmentForm
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                onNext={handleNext}
                onPrevious={handlePrevious}
                canGoNext={!!answers[currentQuestion.id]}
                canGoPrevious={currentQuestionIndex > 0}
                isLastQuestion={currentQuestionIndex === (questions?.length || 0) - 1}
                isSubmitting={saveResultMutation.isPending}
                currentIndex={currentQuestionIndex}
                totalQuestions={questions?.length || 0}
              />
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
