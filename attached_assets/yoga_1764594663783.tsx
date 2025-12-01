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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flower, Play, Clock, Star, User, Heart, Target } from "lucide-react";
import type { YogaProgram, Child, YogaSession } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Yoga() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<YogaProgram | null>(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionRating, setSessionRating] = useState<number>(0);

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

  const { data: yogaPrograms, isLoading: programsLoading, error: programsError } = useQuery<YogaProgram[]>({
    queryKey: ['/api/yoga/programs'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: yogaSessions, error: sessionsError } = useQuery<YogaSession[]>({
    queryKey: ['/api/children', selectedChildId, 'yoga-sessions'],
    enabled: isAuthenticated && !!selectedChildId,
    retry: false,
  });

  useEffect(() => {
    if ((childrenError && isUnauthorizedError(childrenError)) || 
        (programsError && isUnauthorizedError(programsError)) ||
        (sessionsError && isUnauthorizedError(sessionsError))) {
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
  }, [childrenError, programsError, sessionsError, toast]);

  // Auto-select first child if only one exists
  useEffect(() => {
    if (children && children.length === 1 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const startSessionMutation = useMutation({
    mutationFn: async (data: { childId: string; yogaProgramId: string; notes?: string; rating?: number }) => {
      const response = await apiRequest("POST", "/api/yoga/sessions", {
        childId: data.childId,
        yogaProgramId: data.yogaProgramId,
        completedAt: new Date(),
        duration: selectedProgram?.duration || 20,
        notes: data.notes,
        rating: data.rating,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children', selectedChildId, 'yoga-sessions'] });
      setIsSessionDialogOpen(false);
      setSessionNotes("");
      setSessionRating(0);
      setSelectedProgram(null);
      toast({
        title: "Session Completed!",
        description: "Your yoga session has been recorded successfully.",
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
        description: "Failed to record yoga session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedChild = children?.find(child => child.id === selectedChildId);
  const childAge = selectedChild?.age || 10;

  // Filter programs by child's age
  const availablePrograms = yogaPrograms?.filter(program => 
    childAge >= program.ageMin && childAge <= program.ageMax
  ) || [];

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

  const handleStartSession = (program: YogaProgram) => {
    if (!selectedChildId) {
      toast({
        title: "Select Child",
        description: "Please select a child before starting a yoga session.",
        variant: "destructive",
      });
      return;
    }
    setSelectedProgram(program);
    setIsSessionDialogOpen(true);
  };

  const handleCompleteSession = () => {
    if (!selectedProgram || !selectedChildId) return;

    startSessionMutation.mutate({
      childId: selectedChildId,
      yogaProgramId: selectedProgram.id,
      notes: sessionNotes,
      rating: sessionRating,
    });
  };

  if (isLoading || programsLoading) {
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
            <Flower className="h-12 w-12 text-secondary mr-4" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-yoga-title">
              Kids Yoga Programs
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Help your child develop mindfulness, flexibility, and emotional balance through our specialized yoga programs designed for young minds and bodies.
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
                Choose which child will be participating in the yoga program
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!children || children.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You need to create a child profile before accessing yoga programs.
                  </p>
                  <Button data-testid="button-create-child">Create Child Profile</Button>
                </div>
              ) : (
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger data-testid="select-child">
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
              )}
            </CardContent>
          </Card>
        </div>

        {selectedChildId && (
          <>
            {/* Recent Sessions */}
            {yogaSessions && yogaSessions.length > 0 && (
              <div className="mb-8">
                <Card data-testid="card-recent-sessions">
                  <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>
                      {selectedChild?.name}'s latest yoga practice
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {yogaSessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="p-4 border rounded-lg"
                          data-testid={`session-${session.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" data-testid={`badge-completed-${session.id}`}>
                              Completed
                            </Badge>
                            {session.rating && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Star className="mr-1 h-3 w-3 fill-current text-accent" />
                                <span data-testid={`rating-${session.id}`}>{session.rating}/5</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-medium mb-1" data-testid={`session-date-${session.id}`}>
                            {new Date(session.startedAt!).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid={`session-duration-${session.id}`}>
                            {session.duration} minutes
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Available Programs */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Available Programs for {selectedChild?.name}
              </h2>
              
              {availablePrograms.length === 0 ? (
                <Card className="text-center p-8" data-testid="card-no-programs">
                  <CardContent>
                    <Flower className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No programs available</h3>
                    <p className="text-muted-foreground">
                      No yoga programs are currently available for {selectedChild?.name}'s age group ({childAge} years).
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availablePrograms.map((program) => (
                    <Card 
                      key={program.id} 
                      className="service-card hover:shadow-lg transition-all hover:scale-105"
                      data-testid={`card-program-${program.id}`}
                    >
                      <CardHeader>
                        <div className="relative">
                          {program.thumbnailUrl && (
                            <img 
                              src={program.thumbnailUrl} 
                              alt={program.title}
                              className="w-full h-32 object-cover rounded-lg mb-4"
                              data-testid={`img-program-${program.id}`}
                            />
                          )}
                          <Badge 
                            variant={getDifficultyColor(program.difficulty) as any}
                            className="absolute top-2 right-2"
                            data-testid={`badge-difficulty-${program.id}`}
                          >
                            {program.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg" data-testid={`text-program-title-${program.id}`}>
                          {program.title}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            <span data-testid={`text-duration-${program.id}`}>{program.duration} min</span>
                          </div>
                          <Badge variant="outline" className="text-xs" data-testid={`badge-age-range-${program.id}`}>
                            Ages {program.ageMin}-{program.ageMax}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4" data-testid={`text-description-${program.id}`}>
                          {program.description}
                        </CardDescription>
                        
                        {program.benefits && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-sm mb-2">Benefits:</h4>
                            <div className="flex flex-wrap gap-1">
                              {(program.benefits as string[]).map((benefit, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  className="text-xs"
                                  data-testid={`badge-benefit-${program.id}-${index}`}
                                >
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => handleStartSession(program)}
                          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                          data-testid={`button-start-session-${program.id}`}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Session
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Benefits Section */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Benefits of Kids Yoga
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Emotional Well-being</h3>
              <p className="text-sm text-muted-foreground">
                Helps children manage stress, anxiety, and develop emotional regulation skills.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Focus & Concentration</h3>
              <p className="text-sm text-muted-foreground">
                Improves attention span and concentration through mindful movement and breathing.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flower className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Physical Health</h3>
              <p className="text-sm text-muted-foreground">
                Enhances flexibility, strength, balance, and overall physical well-being.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Completion Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent data-testid="dialog-complete-session">
          <DialogHeader>
            <DialogTitle>Complete Yoga Session</DialogTitle>
            <DialogDescription>
              How was {selectedChild?.name}'s yoga session with "{selectedProgram?.title}"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating">Session Rating</Label>
              <div className="flex items-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSessionRating(star)}
                    className={`p-1 ${star <= sessionRating ? 'text-accent' : 'text-muted-foreground'}`}
                    data-testid={`star-${star}`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Session Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="How did the session go? Any observations about your child's experience..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="mt-2"
                data-testid="textarea-session-notes"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button 
                onClick={handleCompleteSession}
                disabled={startSessionMutation.isPending}
                data-testid="button-complete-session"
              >
                {startSessionMutation.isPending ? "Saving..." : "Complete Session"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
