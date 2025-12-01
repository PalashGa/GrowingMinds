import { useEffect, useState, useRef, useCallback } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Flower, Play, Clock, Star, User, Heart, Target, Brain, Sparkles, Activity, 
  BookOpen, Users, Zap, Eye, Scale, Lightbulb, MessageSquare, Calculator, 
  HandHeart, Check, Info, Pause, RotateCcw, Timer, Award, ChevronRight,
  ArrowLeft, ArrowRight, Volume2, VolumeX, CheckCircle2
} from "lucide-react";
import type { YogaProgram, Child, YogaSession, YogaPose } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

const toStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(item => String(item));
  return [];
};

const developmentCategories = [
  { key: "All", label: "All Poses", icon: Flower, color: "from-gray-400 to-gray-600", bgColor: "bg-gradient-to-br from-gray-100 to-gray-200" },
  { key: "Openness", label: "Openness", icon: Sparkles, color: "from-purple-400 to-purple-600", bgColor: "bg-gradient-to-br from-purple-100 to-purple-200" },
  { key: "Conscientiousness", label: "Conscientiousness", icon: Target, color: "from-blue-400 to-blue-600", bgColor: "bg-gradient-to-br from-blue-100 to-blue-200" },
  { key: "Extraversion", label: "Extraversion", icon: Users, color: "from-orange-400 to-orange-600", bgColor: "bg-gradient-to-br from-orange-100 to-orange-200" },
  { key: "Agreeableness", label: "Agreeableness", icon: HandHeart, color: "from-pink-400 to-pink-600", bgColor: "bg-gradient-to-br from-pink-100 to-pink-200" },
  { key: "Emotional Stability", label: "Emotional Stability", icon: Heart, color: "from-green-400 to-green-600", bgColor: "bg-gradient-to-br from-green-100 to-green-200" },
  { key: "Logical Reasoning", label: "Logical Reasoning", icon: Brain, color: "from-indigo-400 to-indigo-600", bgColor: "bg-gradient-to-br from-indigo-100 to-indigo-200" },
  { key: "Problem-Solving", label: "Problem-Solving", icon: Lightbulb, color: "from-yellow-400 to-yellow-600", bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200" },
  { key: "Verbal Comprehension", label: "Verbal Comprehension", icon: MessageSquare, color: "from-teal-400 to-teal-600", bgColor: "bg-gradient-to-br from-teal-100 to-teal-200" },
  { key: "Mathematical Skills", label: "Mathematical Skills", icon: Calculator, color: "from-cyan-400 to-cyan-600", bgColor: "bg-gradient-to-br from-cyan-100 to-cyan-200" },
  { key: "Working Memory", label: "Working Memory", icon: Activity, color: "from-red-400 to-red-600", bgColor: "bg-gradient-to-br from-red-100 to-red-200" },
];

const getCategoryData = (category: string) => {
  return developmentCategories.find(c => c.key === category) || developmentCategories[0];
};

const getCategoryIcon = (category: string) => {
  const found = developmentCategories.find(c => c.key === category);
  return found ? found.icon : Flower;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Openness": "bg-purple-100 text-purple-800 border-purple-300",
    "Conscientiousness": "bg-blue-100 text-blue-800 border-blue-300",
    "Extraversion": "bg-orange-100 text-orange-800 border-orange-300",
    "Agreeableness": "bg-pink-100 text-pink-800 border-pink-300",
    "Emotional Stability": "bg-green-100 text-green-800 border-green-300",
    "Logical Reasoning": "bg-indigo-100 text-indigo-800 border-indigo-300",
    "Problem-Solving": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Verbal Comprehension": "bg-teal-100 text-teal-800 border-teal-300",
    "Mathematical Skills": "bg-cyan-100 text-cyan-800 border-cyan-300",
    "Working Memory": "bg-red-100 text-red-800 border-red-300",
  };
  return colors[category] || "bg-gray-100 text-gray-800 border-gray-300";
};

const getPoseEmoji = (category: string) => {
  const emojis: Record<string, string> = {
    "Openness": "🌟",
    "Conscientiousness": "🎯",
    "Extraversion": "☀️",
    "Agreeableness": "💖",
    "Emotional Stability": "🍃",
    "Logical Reasoning": "🧩",
    "Problem-Solving": "💡",
    "Verbal Comprehension": "💬",
    "Mathematical Skills": "🔢",
    "Working Memory": "🧠",
  };
  return emojis[category] || "🧘";
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
  
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceTime, setPracticeTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (isPracticing && !isPaused) {
      timerRef.current = setInterval(() => {
        setPracticeTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPracticing, isPaused]);

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
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'advanced':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      default: return '🌱';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    setCurrentStep(0);
    setPracticeTime(0);
    setIsPracticing(false);
    setIsPaused(false);
    setIsPoseDialogOpen(true);
  };

  const handleStartPractice = () => {
    setIsPracticing(true);
    setIsPaused(false);
    setPracticeTime(0);
    setCurrentStep(0);
  };

  const handlePausePractice = () => {
    setIsPaused(!isPaused);
  };

  const handleResetPractice = () => {
    setIsPracticing(false);
    setIsPaused(false);
    setPracticeTime(0);
    setCurrentStep(0);
  };

  const handleCompletePractice = () => {
    setIsPracticing(false);
    if (timerRef.current) clearInterval(timerRef.current);
    toast({
      title: "🎉 Great Job!",
      description: `You practiced ${selectedPose?.name} for ${formatTime(practiceTime)}!`,
    });
  };

  const handleNextStep = () => {
    if (selectedPose) {
      const instructions = toStringArray(selectedPose.instructions);
      if (currentStep < instructions.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (isLoading || programsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-bounce text-6xl mb-4">🧘</div>
            <div className="animate-pulse text-lg text-purple-600 font-medium">Loading Yoga Poses...</div>
          </div>
        </div>
      </div>
    );
  }

  const recommendedPoses = getRecommendedPoses();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-4 shadow-lg">
                <Flower className="h-12 w-12 text-purple-600" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4" data-testid="text-yoga-title">
            Kids Yoga Adventure
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover <span className="font-bold text-purple-600">21 amazing yoga poses</span> designed to help your child grow stronger, calmer, and happier! 🌈
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-medium">10 Development Areas</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
              <span className="text-2xl">⏱️</span>
              <span className="text-sm font-medium">Practice Timer</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
              <span className="text-2xl">📚</span>
              <span className="text-sm font-medium">Step-by-Step Guide</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <Card className="border-2 border-purple-200 bg-white/80 backdrop-blur shadow-xl" data-testid="card-child-selection">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
              <CardTitle className="flex items-center text-purple-800">
                <div className="bg-purple-200 rounded-full p-2 mr-3">
                  <User className="h-5 w-5 text-purple-700" />
                </div>
                Select Your Little Yogi
              </CardTitle>
              <CardDescription className="text-purple-600">
                Choose which child will be practicing yoga today 🧘‍♀️
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!children || children.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/50">
                  <div className="text-5xl mb-4">👶</div>
                  <p className="text-gray-600 mb-4">
                    Create a child profile to start your yoga adventure!
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" data-testid="button-create-child">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Child Profile
                  </Button>
                </div>
              ) : (
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400" data-testid="select-child">
                    <SelectValue placeholder="🧒 Choose a child to begin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id} data-testid={`option-child-${child.id}`}>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: child.profileColor || '#8B5CF6' }}
                          >
                            {child.name.charAt(0)}
                          </div>
                          <span className="font-medium">{child.name}</span>
                          <Badge variant="outline" className="text-xs">Age {child.age}</Badge>
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
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur p-1 rounded-xl shadow-lg border-2 border-purple-100">
            <TabsTrigger value="poses" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all">
              <Flower className="h-4 w-4" />
              <span className="hidden sm:inline">Pose Library</span>
              <span className="sm:hidden">Poses</span>
            </TabsTrigger>
            <TabsTrigger value="personalized" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">For You</span>
              <span className="sm:hidden">For You</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Programs</span>
              <span className="sm:hidden">Programs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="poses">
            <div className="space-y-6">
              <Card className="border-2 border-purple-200 bg-white/90 backdrop-blur shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="bg-white/20 rounded-full p-2">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        21 Yoga Poses for Kids
                      </CardTitle>
                      <CardDescription className="text-white/90 mt-2">
                        Each pose is designed to help with specific developmental skills - tap any pose to learn more! 🌟
                      </CardDescription>
                    </div>
                    <div className="hidden md:block text-6xl">🧘‍♂️</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Filter by Development Area</h3>
                    <ScrollArea className="w-full">
                      <div className="flex gap-2 pb-2">
                        {developmentCategories.map((category) => {
                          const Icon = category.icon;
                          const isSelected = selectedCategory === category.key;
                          return (
                            <Button
                              key={category.key}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedCategory(category.key)}
                              className={`flex items-center gap-2 whitespace-nowrap transition-all ${
                                isSelected 
                                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105` 
                                  : 'hover:scale-105'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {category.label}
                              {category.key !== "All" && (
                                <span className="ml-1">{getPoseEmoji(category.key)}</span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  {posesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin text-4xl mb-4">🌸</div>
                        <p className="text-purple-600 font-medium">Loading poses...</p>
                      </div>
                    </div>
                  ) : filteredPoses.length === 0 ? (
                    <div className="text-center py-12 bg-purple-50 rounded-xl">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-lg font-semibold mb-2 text-purple-800">No poses found</h3>
                      <p className="text-gray-600">
                        Try selecting a different category{selectedChild ? ` or age-appropriate poses for ${selectedChild.name}` : ''}.
                      </p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredPoses.map((pose) => {
                        const CategoryIcon = getCategoryIcon(pose.developmentCategory);
                        const categoryData = getCategoryData(pose.developmentCategory);
                        return (
                          <Card 
                            key={pose.id} 
                            className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.03] border-2 overflow-hidden group ${categoryData.bgColor}`}
                            onClick={() => handlePoseClick(pose)}
                          >
                            <div className={`h-2 bg-gradient-to-r ${categoryData.color}`}></div>
                            <CardHeader className="pb-2 pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg group-hover:text-purple-700 transition-colors flex items-center gap-2">
                                    <span>{getPoseEmoji(pose.developmentCategory)}</span>
                                    {pose.name}
                                  </CardTitle>
                                  <p className="text-xs text-gray-500 italic mt-1">{pose.sanskritName}</p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge className={`${getDifficultyColor(pose.difficulty)} border`}>
                                  {getDifficultyEmoji(pose.difficulty)} {pose.difficulty}
                                </Badge>
                                <Badge variant="outline" className={`${getCategoryColor(pose.developmentCategory)} border`}>
                                  <CategoryIcon className="h-3 w-3 mr-1" />
                                  {pose.developmentCategory}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {pose.description}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {pose.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Ages {pose.ageMin}-{pose.ageMax}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm" className="w-full mt-3 bg-white/50 hover:bg-white group-hover:bg-purple-100">
                                <Play className="mr-2 h-4 w-4" />
                                Practice This Pose
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
                <Card className="border-2 border-dashed border-purple-300 bg-purple-50/50">
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">👆</div>
                    <h3 className="text-xl font-semibold mb-2 text-purple-800">Select a Child First</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Choose a child from the selector above to see personalized yoga recommendations based on their age, height, and weight.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 text-9xl opacity-10">🌟</div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl text-purple-800">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3 text-white">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        Personalized for {selectedChild.name}
                      </CardTitle>
                      <CardDescription className="text-purple-600">
                        Yoga poses selected specifically for your child's development
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/70 backdrop-blur rounded-xl p-4 text-center shadow-md border border-purple-200">
                          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {selectedChild.age}
                          </div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Years Old</div>
                          <div className="text-2xl mt-2">🎂</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur rounded-xl p-4 text-center shadow-md border border-purple-200">
                          <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                            {selectedChild.height || "—"}
                          </div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Height (cm)</div>
                          <div className="text-2xl mt-2">📏</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur rounded-xl p-4 text-center shadow-md border border-purple-200">
                          <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            {selectedChild.weight || "—"}
                          </div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Weight (kg)</div>
                          <div className="text-2xl mt-2">⚖️</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200 bg-white/90 backdrop-blur shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-full p-2">
                          <Target className="h-6 w-6" />
                        </div>
                        Top 5 Recommended Poses
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Selected for balanced development across key areas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {recommendedPoses.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <div className="text-5xl mb-4">🧘</div>
                          <p className="text-gray-600">
                            No poses available for {selectedChild.name}'s age group at this time.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recommendedPoses.map((pose, index) => {
                            const CategoryIcon = getCategoryIcon(pose.developmentCategory);
                            const categoryData = getCategoryData(pose.developmentCategory);
                            return (
                              <div 
                                key={pose.id}
                                className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:shadow-lg cursor-pointer transition-all group"
                                onClick={() => handlePoseClick(pose)}
                              >
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${categoryData.color} text-white flex items-center justify-center font-bold text-xl shadow-lg`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-lg group-hover:text-purple-700 transition-colors">
                                      {getPoseEmoji(pose.developmentCategory)} {pose.name}
                                    </h4>
                                    <Badge className={`${getDifficultyColor(pose.difficulty)} border`}>
                                      {pose.difficulty}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-500 italic">{pose.sanskritName}</p>
                                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mt-2 ${getCategoryColor(pose.developmentCategory)} border`}>
                                    <CategoryIcon className="h-3 w-3" />
                                    {pose.developmentCategory}
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <Button variant="ghost" size="icon" className="rounded-full bg-purple-100 hover:bg-purple-200 group-hover:scale-110 transition-transform">
                                    <ChevronRight className="h-5 w-5 text-purple-600" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200 bg-white/90 backdrop-blur shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <Flower className="h-5 w-5" />
                        All Age-Appropriate Poses for {selectedChild.name}
                      </CardTitle>
                      <CardDescription>
                        {yogaPoses?.filter(p => childAge >= p.ageMin && childAge <= p.ageMax).length || 0} poses suitable for age {selectedChild.age}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {yogaPoses?.filter(p => childAge >= p.ageMin && childAge <= p.ageMax).map((pose) => {
                          const CategoryIcon = getCategoryIcon(pose.developmentCategory);
                          return (
                            <div 
                              key={pose.id}
                              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer transition-all"
                              onClick={() => handlePoseClick(pose)}
                            >
                              <span className="text-2xl">{getPoseEmoji(pose.developmentCategory)}</span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{pose.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <CategoryIcon className="h-3 w-3" />
                                  {pose.developmentCategory}
                                </div>
                              </div>
                              <Badge className={`${getDifficultyColor(pose.difficulty)} text-xs`}>
                                {getDifficultyEmoji(pose.difficulty)}
                              </Badge>
                            </div>
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
            {selectedChildId ? (
              <div className="space-y-6">
                {yogaSessions && yogaSessions.length > 0 && (
                  <Card className="border-2 border-purple-200 bg-white/90 backdrop-blur shadow-xl" data-testid="card-recent-sessions">
                    <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        {selectedChild?.name}'s Recent Practice
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Keep up the great work! 🌟
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        {yogaSessions.slice(0, 3).map((session) => (
                          <div
                            key={session.id}
                            className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl"
                            data-testid={`session-${session.id}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="bg-green-100 text-green-800 border-green-300" data-testid={`badge-completed-${session.id}`}>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Done
                              </Badge>
                              {session.rating && (
                                <div className="flex items-center text-amber-600">
                                  {[...Array(session.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-800" data-testid={`session-date-${session.id}`}>
                              {new Date(session.startedAt!).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1" data-testid={`session-duration-${session.id}`}>
                              <Clock className="h-3 w-3" />
                              {session.duration} minutes
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-2 border-purple-200 bg-white/90 backdrop-blur shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Yoga Programs for {selectedChild?.name}
                    </CardTitle>
                    <CardDescription className="text-white/90">
                      Structured programs designed for age {childAge}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {availablePrograms.length === 0 ? (
                      <div className="text-center py-12 bg-blue-50 rounded-xl" data-testid="card-no-programs">
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-lg font-semibold mb-2 text-blue-800">Coming Soon!</h3>
                        <p className="text-gray-600">
                          Structured yoga programs for {selectedChild?.name}'s age group ({childAge} years) will be available soon.
                          <br />In the meantime, explore our 21 individual poses!
                        </p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availablePrograms.map((program) => (
                          <Card 
                            key={program.id} 
                            className="hover:shadow-lg transition-all hover:scale-[1.02] border-2 border-blue-100"
                            data-testid={`card-program-${program.id}`}
                          >
                            <CardHeader>
                              <CardTitle className="text-lg">{program.title}</CardTitle>
                              <CardDescription>{program.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {program.duration} min
                                </span>
                                <Badge className={getDifficultyColor(program.difficulty)}>
                                  {program.difficulty}
                                </Badge>
                              </div>
                              <Button 
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                onClick={() => handleStartSession(program)}
                                data-testid={`button-start-${program.id}`}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Start Session
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-2 border-dashed border-purple-300 bg-purple-50/50">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">👆</div>
                  <h3 className="text-xl font-semibold mb-2 text-purple-800">Select a Child First</h3>
                  <p className="text-gray-600">
                    Choose a child from the selector above to see available yoga programs.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isPoseDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleResetPractice();
        }
        setIsPoseDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPose && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <span className="text-3xl">{getPoseEmoji(selectedPose.developmentCategory)}</span>
                      {selectedPose.name}
                    </DialogTitle>
                    <DialogDescription className="text-lg italic mt-1">
                      {selectedPose.sanskritName}
                    </DialogDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={`${getDifficultyColor(selectedPose.difficulty)} border`}>
                      {getDifficultyEmoji(selectedPose.difficulty)} {selectedPose.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Ages {selectedPose.ageMin}-{selectedPose.ageMax}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className={`p-4 rounded-xl ${getCategoryColor(selectedPose.developmentCategory)} border-2`}>
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const CategoryIcon = getCategoryIcon(selectedPose.developmentCategory);
                      return <CategoryIcon className="h-5 w-5" />;
                    })()}
                    <span className="font-semibold">Development Focus: {selectedPose.developmentCategory}</span>
                  </div>
                  <p className="text-sm">{selectedPose.description}</p>
                </div>

                {isPracticing && (
                  <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white overflow-hidden">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="text-5xl font-mono font-bold mb-2">
                          {formatTime(practiceTime)}
                        </div>
                        <p className="text-white/80">Practice Timer</p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <Button 
                          variant="secondary" 
                          size="lg"
                          onClick={handlePausePractice}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                          {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="lg"
                          onClick={handleResetPractice}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          <RotateCcw className="h-5 w-5 mr-2" />
                          Reset
                        </Button>
                        <Button 
                          size="lg"
                          onClick={handleCompletePractice}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <h4 className="font-semibold text-lg flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    Step-by-Step Instructions
                  </h4>
                  <div className="space-y-3">
                    {toStringArray(selectedPose.instructions).map((instruction, index) => (
                      <div 
                        key={index}
                        className={`flex gap-3 p-3 rounded-lg transition-all ${
                          isPracticing && currentStep === index 
                            ? 'bg-purple-100 border-2 border-purple-400 shadow-md' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isPracticing && currentStep === index
                            ? 'bg-purple-600 text-white'
                            : isPracticing && currentStep > index
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isPracticing && currentStep > index ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                        <p className={`text-sm ${isPracticing && currentStep === index ? 'font-medium text-purple-900' : 'text-gray-700'}`}>
                          {instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {isPracticing && (
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="outline" 
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <div className="text-sm text-gray-500">
                        Step {currentStep + 1} of {toStringArray(selectedPose.instructions).length}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleNextStep}
                        disabled={currentStep === toStringArray(selectedPose.instructions).length - 1}
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-lg flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-pink-600" />
                    Benefits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {toStringArray(selectedPose.benefits).map((benefit, index) => (
                      <Badge key={index} variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 py-1.5 px-3">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedPose.practiceDescription && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-blue-800">
                      <Sparkles className="h-4 w-4" />
                      Practice Tip
                    </h4>
                    <p className="text-sm text-blue-700">{selectedPose.practiceDescription}</p>
                  </div>
                )}

                {!isPracticing && (
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
                    onClick={handleStartPractice}
                  >
                    <Timer className="mr-2 h-5 w-5" />
                    Start Practice Session
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Complete Yoga Session
            </DialogTitle>
            <DialogDescription>
              Rate your experience and add any notes about {selectedChild?.name}'s session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rating" className="text-sm font-medium">How was the session?</Label>
              <div className="flex items-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSessionRating(star)}
                    className={`p-1 transition-transform hover:scale-110 ${star <= sessionRating ? 'text-amber-400' : 'text-gray-300'}`}
                    data-testid={`star-${star}`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Session Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="How did the session go? Any observations..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="mt-2"
                data-testid="textarea-session-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteSession}
              disabled={startSessionMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              data-testid="button-complete-session"
            >
              {startSessionMutation.isPending ? "Saving..." : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
