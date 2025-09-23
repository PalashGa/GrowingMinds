import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Play, Clock, User, Trophy, BookOpen, Wrench, CheckCircle, ArrowRight } from "lucide-react";
import type { RoboticsModule, Child, RoboticsProgress } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Robotics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<RoboticsModule | null>(null);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);

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

  const { data: roboticsModules, isLoading: modulesLoading, error: modulesError } = useQuery<RoboticsModule[]>({
    queryKey: ['/api/robotics/modules'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: progressData, error: progressError } = useQuery<RoboticsProgress[]>({
    queryKey: ['/api/children', selectedChildId, 'robotics-progress'],
    enabled: isAuthenticated && !!selectedChildId,
    retry: false,
  });

  useEffect(() => {
    if ((childrenError && isUnauthorizedError(childrenError)) || 
        (modulesError && isUnauthorizedError(modulesError)) ||
        (progressError && isUnauthorizedError(progressError))) {
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
  }, [childrenError, modulesError, progressError, toast]);

  // Auto-select first child if only one exists
  useEffect(() => {
    if (children && children.length === 1 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { childId: string; moduleId: string; progress: number; status: string }) => {
      const response = await apiRequest("PUT", "/api/robotics-progress", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children', selectedChildId, 'robotics-progress'] });
      toast({
        title: "Progress Updated!",
        description: "Module progress has been saved successfully.",
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
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedChild = children?.find(child => child.id === selectedChildId);
  const childAge = selectedChild?.age || 10;

  // Filter modules by child's age
  const availableModules = roboticsModules?.filter(module => 
    childAge >= module.ageMin && childAge <= module.ageMax
  ) || [];

  // Get progress for each module
  const getModuleProgress = (moduleId: string) => {
    return progressData?.find(p => p.moduleId === moduleId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'secondary';
      case 'intermediate':
        return 'accent';
      case 'advanced':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleStartModule = (module: RoboticsModule) => {
    if (!selectedChildId) {
      toast({
        title: "Select Child",
        description: "Please select a child before starting a robotics module.",
        variant: "destructive",
      });
      return;
    }
    setSelectedModule(module);
    setIsModuleDialogOpen(true);
  };

  const handleUpdateProgress = (progress: number, status: string) => {
    if (!selectedModule || !selectedChildId) return;

    updateProgressMutation.mutate({
      childId: selectedChildId,
      moduleId: selectedModule.id,
      progress,
      status,
    });
  };

  const calculateOverallProgress = () => {
    if (!progressData || !availableModules.length) return 0;
    const totalProgress = progressData.reduce((sum, p) => sum + parseFloat(p.progress || '0'), 0);
    return Math.round(totalProgress / availableModules.length);
  };

  if (isLoading || modulesLoading) {
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-robotics-title">
              Robotics Learning
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Introduce your child to the exciting world of robotics and technology through hands-on projects and interactive lessons.
          </p>
        </div>

        {/* Child Selection */}
        <div className="mb-8">
          <Card data-testid="card-child-selection">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Select Child
              </CardTitle>
              <CardDescription>
                Choose which child will be learning robotics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!children || children.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You need to create a child profile before accessing robotics modules.
                  </p>
                  <Button data-testid="button-create-child">Create Child Profile</Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                    <SelectTrigger className="w-full sm:w-80" data-testid="select-child">
                      <SelectValue placeholder="Choose a child" />
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
                  
                  {selectedChildId && (
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary" data-testid="text-overall-progress">
                          {calculateOverallProgress()}%
                        </div>
                        <div className="text-sm text-muted-foreground">Overall Progress</div>
                      </div>
                      <Trophy className="h-8 w-8 text-accent" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedChildId && (
          <>
            {/* Progress Overview */}
            {progressData && progressData.length > 0 && (
              <div className="mb-8">
                <Card data-testid="card-progress-overview">
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                    <CardDescription>
                      {selectedChild?.name}'s robotics learning journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {progressData.map((progress) => {
                        const module = availableModules.find(m => m.id === progress.moduleId);
                        if (!module) return null;
                        
                        return (
                          <div
                            key={progress.id}
                            className="p-4 border rounded-lg"
                            data-testid={`progress-${progress.moduleId}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm" data-testid={`progress-title-${progress.moduleId}`}>
                                {module.title}
                              </h4>
                              <Badge 
                                variant={progress.status === 'completed' ? 'default' : 'secondary'}
                                data-testid={`progress-status-${progress.moduleId}`}
                              >
                                {progress.status}
                              </Badge>
                            </div>
                            <Progress value={parseFloat(progress.progress || '0')} className="h-2 mb-2" />
                            <p className="text-xs text-muted-foreground" data-testid={`progress-percentage-${progress.moduleId}`}>
                              {parseFloat(progress.progress || '0').toFixed(0)}% complete
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Available Modules */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Available Modules for {selectedChild?.name}
              </h2>
              
              {availableModules.length === 0 ? (
                <Card className="text-center p-8" data-testid="card-no-modules">
                  <CardContent>
                    <Bot className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No modules available</h3>
                    <p className="text-muted-foreground">
                      No robotics modules are currently available for {selectedChild?.name}'s age group ({childAge} years).
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableModules.map((module) => {
                    const progress = getModuleProgress(module.id);
                    const progressPercentage = progress ? parseFloat(progress.progress || '0') : 0;
                    
                    return (
                      <Card 
                        key={module.id} 
                        className="service-card hover:shadow-lg transition-all hover:scale-105"
                        data-testid={`card-module-${module.id}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-3 rounded-lg bg-primary/10">
                                <Bot className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                    data-testid={`badge-order-${module.id}`}
                                  >
                                    Module {module.orderIndex}
                                  </Badge>
                                  <Badge 
                                    variant={getDifficultyColor(module.difficulty) as any}
                                    className="text-xs"
                                    data-testid={`badge-difficulty-${module.id}`}
                                  >
                                    {module.difficulty}
                                  </Badge>
                                </div>
                                <Badge variant="outline" className="text-xs" data-testid={`badge-age-range-${module.id}`}>
                                  Ages {module.ageMin}-{module.ageMax}
                                </Badge>
                              </div>
                            </div>
                            {progress && (
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary" data-testid={`text-progress-${module.id}`}>
                                  {progressPercentage.toFixed(0)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Complete</div>
                              </div>
                            )}
                          </div>
                          <CardTitle className="text-lg" data-testid={`text-module-title-${module.id}`}>
                            {module.title}
                          </CardTitle>
                          <CardDescription data-testid={`text-module-description-${module.id}`}>
                            {module.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {progress && progressPercentage > 0 && (
                            <div className="mb-4">
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          )}
                          
                          {module.content && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-2">What you'll learn:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {((module.content as any)?.lessons as string[] || []).map((lesson: string, index: number) => (
                                  <li key={index} className="flex items-center" data-testid={`lesson-${module.id}-${index}`}>
                                    <CheckCircle className="mr-2 h-3 w-3 text-secondary" />
                                    {lesson}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <Button 
                            onClick={() => handleStartModule(module)}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            data-testid={`button-start-module-${module.id}`}
                          >
                            {progress?.status === 'completed' ? (
                              <>
                                <Trophy className="mr-2 h-4 w-4" />
                                Review Module
                              </>
                            ) : progress?.status === 'in_progress' ? (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Continue Learning
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Start Module
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Benefits Section */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Why Learn Robotics?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">STEM Skills</h3>
              <p className="text-sm text-muted-foreground">
                Build foundation in Science, Technology, Engineering, and Mathematics through hands-on projects.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Problem Solving</h3>
              <p className="text-sm text-muted-foreground">
                Develop critical thinking and problem-solving skills through engineering challenges.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Future Ready</h3>
              <p className="text-sm text-muted-foreground">
                Prepare for future careers in technology and engineering fields.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Learning Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-module-learning">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bot className="mr-2 h-6 w-6" />
              {selectedModule?.title}
            </DialogTitle>
            <DialogDescription>
              Module {selectedModule?.orderIndex} • {selectedModule?.difficulty} level
            </DialogDescription>
          </DialogHeader>
          
          {selectedModule && (
            <Tabs defaultValue="content" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
                <TabsTrigger value="project" data-testid="tab-project">Project</TabsTrigger>
                <TabsTrigger value="progress" data-testid="tab-progress">Progress</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground">{selectedModule.description}</p>
                  
                  {selectedModule.videoUrl && (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Video content would load here</p>
                        <p className="text-xs text-muted-foreground">{selectedModule.videoUrl}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedModule.content && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Lessons:</h4>
                        <ul className="space-y-2">
                          {((selectedModule.content as any)?.lessons as string[] || []).map((lesson: string, index: number) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckCircle className="mr-2 h-4 w-4 text-secondary" />
                              {lesson}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Activities:</h4>
                        <ul className="space-y-2">
                          {((selectedModule.content as any)?.activities as string[] || []).map((activity: string, index: number) => (
                            <li key={index} className="flex items-center text-sm">
                              <ArrowRight className="mr-2 h-4 w-4 text-accent" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="project" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Project Instructions:</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedModule.projectInstructions}
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Materials needed:</h5>
                    <p className="text-sm text-muted-foreground">
                      Basic household items, cardboard, LED lights (as mentioned in project instructions)
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="progress" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Update Your Progress:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleUpdateProgress(50, 'in_progress')}
                      disabled={updateProgressMutation.isPending}
                      variant="outline"
                      data-testid="button-progress-50"
                    >
                      50% Complete
                    </Button>
                    <Button 
                      onClick={() => handleUpdateProgress(100, 'completed')}
                      disabled={updateProgressMutation.isPending}
                      data-testid="button-progress-100"
                    >
                      Mark as Complete
                    </Button>
                  </div>
                  {updateProgressMutation.isPending && (
                    <p className="text-sm text-muted-foreground">Updating progress...</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
