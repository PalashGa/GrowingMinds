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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flower, Play, Clock, Star, User, Heart, Target, Brain, Sparkles, Activity, BookOpen, Users, Zap, Eye, Scale, Lightbulb, MessageSquare, Calculator, HandHeart, Check, Info } from "lucide-react";
import type { YogaProgram, Child, YogaSession, YogaPose } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

const toStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(item => String(item));
  return [];
};

const developmentCategories = [
  { key: "All", label: "All Poses", icon: Flower },
  { key: "Openness", label: "Openness", icon: Sparkles },
  { key: "Conscientiousness", label: "Conscientiousness", icon: Target },
  { key: "Extraversion", label: "Extraversion", icon: Users },
  { key: "Agreeableness", label: "Agreeableness", icon: HandHeart },
  { key: "Emotional Stability", label: "Emotional Stability", icon: Heart },
  { key: "Logical Reasoning", label: "Logical Reasoning", icon: Brain },
  { key: "Problem-Solving", label: "Problem-Solving", icon: Lightbulb },
  { key: "Verbal Comprehension", label: "Verbal Comprehension", icon: MessageSquare },
  { key: "Mathematical Skills", label: "Mathematical Skills", icon: Calculator },
  { key: "Working Memory", label: "Working Memory", icon: Activity },
];

const getCategoryIcon = (category: string) => {
  const found = developmentCategories.find(c => c.key === category);
  return found ? found.icon : Flower;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Openness": "bg-purple-100 text-purple-800 border-purple-200",
    "Conscientiousness": "bg-blue-100 text-blue-800 border-blue-200",
    "Extraversion": "bg-orange-100 text-orange-800 border-orange-200",
    "Agreeableness": "bg-pink-100 text-pink-800 border-pink-200",
    "Emotional Stability": "bg-green-100 text-green-800 border-green-200",
    "Logical Reasoning": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Problem-Solving": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Verbal Comprehension": "bg-teal-100 text-teal-800 border-teal-200",
    "Mathematical Skills": "bg-cyan-100 text-cyan-800 border-cyan-200",
    "Working Memory": "bg-red-100 text-red-800 border-red-200",
  };
  return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
};

export default function Yoga() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<YogaProgram | null>(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionRating, setSessionRating] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPose, setSelectedPose] = useState<YogaPose | null>(null);
  const [isPoseDialogOpen, setIsPoseDialogOpen] = useState(false);

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

  const { data: yogaPoses, isLoading: posesLoading } = useQuery<YogaPose[]>({
    queryKey: ['/api/yoga/poses'],
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

  const availablePrograms = yogaPrograms?.filter(program => 
    childAge >= program.ageMin && childAge <= program.ageMax
  ) || [];

  const filteredPoses = yogaPoses?.filter(pose => {
    const matchesCategory = selectedCategory === "All" || pose.developmentCategory === selectedCategory;
    const matchesAge = !selectedChild || (childAge >= pose.ageMin && childAge <= pose.ageMax);
    return matchesCategory && matchesAge;
  }) || [];

  const personalizedPoses = yogaPoses?.filter(pose => {
    if (!selectedChild) return false;
    const matchesAge = childAge >= pose.ageMin && childAge <= pose.ageMax;
    return matchesAge;
  }) || [];

  const getRecommendedPoses = () => {
    if (!selectedChild || !yogaPoses) return [];
    
    const categories = [
      "Emotional Stability",
      "Conscientiousness", 
      "Logical Reasoning",
      "Problem-Solving",
      "Working Memory"
    ];
    
    const recommended: YogaPose[] = [];
    categories.forEach(category => {
      const categoryPoses = yogaPoses.filter(pose => 
        pose.developmentCategory === category && 
        childAge >= pose.ageMin && 
        childAge <= pose.ageMax
      );
      if (categoryPoses.length > 0) {
        recommended.push(categoryPoses[0]);
      }
    });
    
    return recommended.slice(0, 5);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handlePoseClick = (pose: YogaPose) => {
    setSelectedPose(pose);
    setIsPoseDialogOpen(true);
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

  const recommendedPoses = getRecommendedPoses();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Flower className="h-12 w-12 text-secondary mr-4" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-yoga-title">
              Kids Yoga Programs
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Help your child develop mindfulness, flexibility, and emotional balance through our specialized yoga programs and 21 comprehensive poses designed for young minds and bodies.
          </p>
        </div>

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

        <Tabs defaultValue="poses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="poses" className="flex items-center gap-2">
              <Flower className="h-4 w-4" />
              Yoga Poses Library
            </TabsTrigger>
            <TabsTrigger value="personalized" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Personalized Recommendations
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Programs & Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="poses">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    21 Comprehensive Yoga Poses
                  </CardTitle>
                  <CardDescription>
                    Organized by developmental benefits - each pose supports specific areas of your child's growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {developmentCategories.map((category) => {
                      const Icon = category.icon;
                      const isSelected = selectedCategory === category.key;
                      return (
                        <Button
                          key={category.key}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.key)}
                          className="flex items-center gap-1"
                        >
                          <Icon className="h-3 w-3" />
                          {category.label}
                        </Button>
                      );
                    })}
                  </div>

                  {posesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredPoses.length === 0 ? (
                    <div className="text-center py-12">
                      <Flower className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No poses found</h3>
                      <p className="text-muted-foreground">
                        No yoga poses match the selected category{selectedChild ? ` for ${selectedChild.name}'s age` : ''}.
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPoses.map((pose) => {
                        const CategoryIcon = getCategoryIcon(pose.developmentCategory);
                        return (
                          <Card 
                            key={pose.id} 
                            className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2"
                            onClick={() => handlePoseClick(pose)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">{pose.name}</CardTitle>
                                  <p className="text-sm text-muted-foreground italic">{pose.sanskritName}</p>
                                </div>
                                <Badge className={getDifficultyColor(pose.difficulty)}>
                                  {pose.difficulty}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getCategoryColor(pose.developmentCategory)}`}>
                                <CategoryIcon className="h-3 w-3" />
                                {pose.developmentCategory}
                              </div>
                              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                {pose.description}
                              </p>
                              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {pose.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Ages {pose.ageMin}-{pose.ageMax}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm" className="w-full mt-3">
                                <Info className="mr-2 h-4 w-4" />
                                View Details
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="personalized">
            <div className="space-y-6">
              {!selectedChild ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Child First</h3>
                    <p className="text-muted-foreground">
                      Please select a child above to see personalized yoga recommendations based on their age, height, and weight.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Personalized for {selectedChild.name}
                      </CardTitle>
                      <CardDescription>
                        Based on age ({selectedChild.age} years)
                        {selectedChild.height && `, height (${selectedChild.height} cm)`}
                        {selectedChild.weight && `, weight (${selectedChild.weight} kg)`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{selectedChild.age}</div>
                          <div className="text-xs text-muted-foreground">Years Old</div>
                        </div>
                        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="text-2xl font-bold text-pink-600">{selectedChild.height || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">Height (cm)</div>
                        </div>
                        <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{selectedChild.weight || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">Weight (kg)</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Recommended Poses for {selectedChild.name}
                      </CardTitle>
                      <CardDescription>
                        Top 5 poses selected for balanced development across key areas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recommendedPoses.length === 0 ? (
                        <div className="text-center py-8">
                          <Flower className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            No poses available for {selectedChild.name}'s age group at this time.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recommendedPoses.map((pose, index) => {
                            const CategoryIcon = getCategoryIcon(pose.developmentCategory);
                            return (
                              <div 
                                key={pose.id}
                                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => handlePoseClick(pose)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{pose.name}</h4>
                                    <Badge className={getDifficultyColor(pose.difficulty)} variant="outline">
                                      {pose.difficulty}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1">{pose.description}</p>
                                </div>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${getCategoryColor(pose.developmentCategory)}`}>
                                  <CategoryIcon className="h-3 w-3" />
                                  {pose.developmentCategory}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        All Age-Appropriate Poses ({personalizedPoses.length})
                      </CardTitle>
                      <CardDescription>
                        Complete list of poses suitable for {selectedChild.name}'s age group
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {personalizedPoses.map((pose) => {
                          const CategoryIcon = getCategoryIcon(pose.developmentCategory);
                          return (
                            <Card 
                              key={pose.id} 
                              className="cursor-pointer hover:shadow-md transition-all"
                              onClick={() => handlePoseClick(pose)}
                            >
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-sm">{pose.name}</h4>
                                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getCategoryColor(pose.developmentCategory)}`}>
                                    <CategoryIcon className="h-2.5 w-2.5" />
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{pose.description}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="programs">
            {selectedChildId && (
              <>
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
                                className={`absolute top-2 right-2 ${getDifficultyColor(program.difficulty)}`}
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
                            
                            {toStringArray(program.benefits).length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-semibold text-sm mb-2">Benefits:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {toStringArray(program.benefits).map((benefit, index) => (
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

            {!selectedChildId && (
              <Card>
                <CardContent className="text-center py-12">
                  <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Child First</h3>
                  <p className="text-muted-foreground">
                    Please select a child above to view available programs and sessions.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="bg-muted/30 rounded-2xl p-8 mt-8">
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

      <Dialog open={isPoseDialogOpen} onOpenChange={setIsPoseDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedPose && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedPose.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground italic mt-1">{selectedPose.sanskritName}</p>
                  </div>
                  <Badge className={getDifficultyColor(selectedPose.difficulty)}>
                    {selectedPose.difficulty}
                  </Badge>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getCategoryColor(selectedPose.developmentCategory)}`}>
                  {(() => {
                    const CategoryIcon = getCategoryIcon(selectedPose.developmentCategory);
                    return <CategoryIcon className="h-4 w-4" />;
                  })()}
                  <span className="font-medium">{selectedPose.developmentCategory}</span>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedPose.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Instructions</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {toStringArray(selectedPose.instructions).map((instruction, index) => (
                      <li key={index} className="text-muted-foreground">{instruction}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {toStringArray(selectedPose.benefits).map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedPose.duration} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Ages {selectedPose.ageMin}-{selectedPose.ageMax}
                    </span>
                  </div>
                  <Button onClick={() => setIsPoseDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
