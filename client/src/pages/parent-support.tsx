import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, User, Calendar, FileText, TrendingUp, Brain, 
  Utensils, Dumbbell, Gamepad2, Bot, ArrowRight, 
  ClipboardCheck, Activity, Target, Star, ChevronRight,
  Heart, Clock, Award, BarChart3
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Child, type AssessmentResult, type AssessmentType } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const createChildSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(5, "Age must be at least 5").max(16, "Age must be at most 16"),
  height: z.number().min(50, "Height must be at least 50 cm").max(200, "Height must be at most 200 cm").optional(),
  weight: z.number().min(10, "Weight must be at least 10 kg").max(100, "Weight must be at most 100 kg").optional(),
  profileColor: z.string().optional(),
});

const profileColors = [
  "#4F46E5", "#7C3AED", "#EC4899", "#EF4444", "#F97316",
  "#EAB308", "#22C55E", "#14B8A6", "#0EA5E9", "#6366F1"
];

export default function ParentSupport() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(() => {
    return localStorage.getItem('selectedChildId');
  });

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
    localStorage.setItem('selectedChildId', childId);
  };

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
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: children, isLoading: childrenLoading } = useQuery<Child[]>({
    queryKey: ['/api/children'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: assessmentTypes } = useQuery<AssessmentType[]>({
    queryKey: ['/api/assessments/types'],
    enabled: isAuthenticated,
  });

  const selectedChild = children?.find(c => c.id === selectedChildId) || children?.[0];

  const { data: assessmentResults } = useQuery<AssessmentResult[]>({
    queryKey: ['/api/children', selectedChild?.id, 'assessments'],
    enabled: isAuthenticated && !!selectedChild?.id,
  });

  const { data: yogaSessions } = useQuery({
    queryKey: ['/api/children', selectedChild?.id, 'yoga-pose-sessions'],
    enabled: isAuthenticated && !!selectedChild?.id,
  });

  const { data: nutritionPlan } = useQuery({
    queryKey: ['/api/children', selectedChild?.id, 'nutrition-plan'],
    enabled: isAuthenticated && !!selectedChild?.id,
  });

  const { data: gameScores } = useQuery({
    queryKey: ['/api/children', selectedChild?.id, 'game-scores'],
    enabled: isAuthenticated && !!selectedChild?.id,
  });

  const { data: roboticsProgress } = useQuery({
    queryKey: ['/api/children', selectedChild?.id, 'robotics-progress'],
    enabled: isAuthenticated && !!selectedChild?.id,
  });

  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      const savedChildId = localStorage.getItem('selectedChildId');
      if (savedChildId && children.find(c => c.id === savedChildId)) {
        setSelectedChildId(savedChildId);
      } else {
        handleChildSelect(children[0].id);
      }
    }
  }, [children, selectedChildId]);

  const form = useForm<z.infer<typeof createChildSchema>>({
    resolver: zodResolver(createChildSchema),
    defaultValues: {
      name: "",
      age: 8,
      height: undefined,
      weight: undefined,
      profileColor: "#4F46E5",
    },
  });

  const createChildMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createChildSchema>) => {
      const response = await apiRequest("POST", "/api/children", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      setIsAddChildOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Child profile created successfully!",
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
        description: "Failed to create child profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof createChildSchema>) => {
    createChildMutation.mutate(data);
  };

  if (isLoading || childrenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const completedAssessments = assessmentResults?.length || 0;
  const yogaSessionsCount = Array.isArray(yogaSessions) ? yogaSessions.length : 0;
  const gameScoresCount = Array.isArray(gameScores) ? gameScores.length : 0;
  const roboticsModulesCount = Array.isArray(roboticsProgress) ? roboticsProgress.filter((p: any) => p.status === 'completed').length : 0;

  const quickActions = [
    { 
      icon: Brain, 
      label: "Start Assessment", 
      description: "Behavioral, IQ, Personality tests",
      color: "from-purple-500 to-indigo-600", 
      path: "/assessments" 
    },
    { 
      icon: Dumbbell, 
      label: "Yoga Session", 
      description: "21 poses for development",
      color: "from-green-500 to-teal-600", 
      path: "/yoga" 
    },
    { 
      icon: Utensils, 
      label: "Nutrition Plan", 
      description: "Healthy meal planning",
      color: "from-orange-500 to-red-500", 
      path: "/nutrition" 
    },
    { 
      icon: Gamepad2, 
      label: "Educational Games", 
      description: "26 interactive games",
      color: "from-pink-500 to-rose-600", 
      path: "/games" 
    },
    { 
      icon: Bot, 
      label: "Robotics Learning", 
      description: "7 educational modules",
      color: "from-blue-500 to-cyan-600", 
      path: "/robotics" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Parent Support Hub
          </h1>
          <p className="text-gray-600 text-lg">
            Your central dashboard for managing all child development activities
          </p>
        </div>

        {/* Child Profile Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="h-6 w-6 text-purple-600" />
              Child Profiles
            </h2>
            <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Child
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Child Profile</DialogTitle>
                  <DialogDescription>
                    Create a profile to access personalized activities
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="5" 
                                max="16"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="cm"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="kg"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="profileColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Color</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {profileColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => field.onChange(color)}
                                className={`w-8 h-8 rounded-full transition-transform ${
                                  field.value === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                      disabled={createChildMutation.isPending}
                    >
                      {createChildMutation.isPending ? "Creating..." : "Create Profile"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {!children || children.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 bg-white/50">
              <CardContent>
                <User className="mx-auto h-16 w-16 text-purple-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No child profiles yet</h3>
                <p className="text-gray-500 mb-4">
                  Create a profile to get started with assessments and activities
                </p>
                <Button 
                  onClick={() => setIsAddChildOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Create First Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <Card 
                  key={child.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedChild?.id === child.id 
                      ? 'ring-2 ring-purple-500 shadow-lg' 
                      : 'hover:scale-[1.02]'
                  }`}
                  onClick={() => handleChildSelect(child.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                        style={{ backgroundColor: child.profileColor || '#4F46E5' }}
                      >
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{child.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {child.age} years
                          </span>
                          {child.height && (
                            <span>{child.height} cm</span>
                          )}
                          {child.weight && (
                            <span>{child.weight} kg</span>
                          )}
                        </div>
                      </div>
                      {selectedChild?.id === child.id && (
                        <Badge className="bg-purple-100 text-purple-700">Selected</Badge>
                      )}
                    </div>

                    {selectedChild?.id === child.id && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{completedAssessments}</div>
                          <div className="text-xs text-gray-500">Assessments</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{yogaSessionsCount}</div>
                          <div className="text-xs text-gray-500">Yoga Sessions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">{gameScoresCount}</div>
                          <div className="text-xs text-gray-500">Games Played</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{roboticsModulesCount}</div>
                          <div className="text-xs text-gray-500">Robotics Modules</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedChild && (
          <>
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Assessments</p>
                      <p className="text-3xl font-bold">{completedAssessments}</p>
                    </div>
                    <ClipboardCheck className="h-10 w-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Yoga Sessions</p>
                      <p className="text-3xl font-bold">{yogaSessionsCount}</p>
                    </div>
                    <Heart className="h-10 w-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-sm">Games Played</p>
                      <p className="text-3xl font-bold">{gameScoresCount}</p>
                    </div>
                    <Gamepad2 className="h-10 w-10 text-pink-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Robotics</p>
                      <p className="text-3xl font-bold">{roboticsModulesCount}</p>
                    </div>
                    <Bot className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Nutrition</p>
                      <p className="text-3xl font-bold">{nutritionPlan ? 'Active' : 'Setup'}</p>
                    </div>
                    <Utensils className="h-10 w-10 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-600" />
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                {quickActions.map((action) => (
                  <Card 
                    key={action.path}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] overflow-hidden group"
                    onClick={() => navigate(action.path)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${action.color}`} />
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-3`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{action.label}</h3>
                      <p className="text-xs text-gray-500">{action.description}</p>
                      <ChevronRight className="h-5 w-5 mx-auto mt-2 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Assessment Results */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Recent Assessment Results
                  </CardTitle>
                  <CardDescription>Latest completed assessments for {selectedChild.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {!assessmentResults || assessmentResults.length === 0 ? (
                    <div className="text-center py-6">
                      <Brain className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 mb-3">No assessments completed yet</p>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                        onClick={() => navigate('/assessments')}
                      >
                        Start First Assessment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assessmentResults.slice(0, 4).map((result) => {
                        const assessmentType = assessmentTypes?.find(t => t.id === result.assessmentTypeId);
                        return (
                          <div 
                            key={result.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <ClipboardCheck className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {assessmentType?.name?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Assessment'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'In Progress'}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                              Completed
                            </Badge>
                          </div>
                        );
                      })}
                      {assessmentResults.length > 4 && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-purple-600"
                          onClick={() => navigate('/assessments')}
                        >
                          View All Results <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Progress Analytics
                  </CardTitle>
                  <CardDescription>Development progress overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Assessments Completed</span>
                        <span className="text-sm text-gray-500">{completedAssessments}/5</span>
                      </div>
                      <Progress value={(completedAssessments / 5) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Yoga Practice</span>
                        <span className="text-sm text-gray-500">{yogaSessionsCount} sessions</span>
                      </div>
                      <Progress value={Math.min(yogaSessionsCount * 10, 100)} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Games Played</span>
                        <span className="text-sm text-gray-500">{gameScoresCount}/26</span>
                      </div>
                      <Progress value={(gameScoresCount / 26) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Robotics Modules</span>
                        <span className="text-sm text-gray-500">{roboticsModulesCount}/7</span>
                      </div>
                      <Progress value={(roboticsModulesCount / 7) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Nutrition Plan</span>
                        <span className="text-sm text-gray-500">{nutritionPlan ? 'Active' : 'Not Set'}</span>
                      </div>
                      <Progress value={nutritionPlan ? 100 : 0} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="font-semibold text-gray-800">Overall Progress</p>
                        <p className="text-sm text-gray-600">
                          {Math.round(((completedAssessments * 20) + (yogaSessionsCount * 5) + (gameScoresCount * 2) + (roboticsModulesCount * 10) + (nutritionPlan ? 20 : 0)) / 120 * 100)}% development activities completed
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Sections */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Upcoming Yoga Sessions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Dumbbell className="h-5 w-5 text-green-600" />
                    Yoga Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-800">21 Poses Available</p>
                        <p className="text-xs text-gray-500">{yogaSessionsCount} sessions completed</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Practice yoga poses designed for {selectedChild.name}'s age group to improve flexibility, focus, and emotional well-being.
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-teal-600"
                      onClick={() => navigate('/yoga')}
                    >
                      Start Yoga Session
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Robotics Learning */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5 text-blue-600" />
                    Robotics Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">7 Modules Available</p>
                        <p className="text-xs text-gray-500">{roboticsModulesCount} modules completed</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Learn about robots, sensors, coding basics, and real-world applications through fun interactive modules.
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600"
                      onClick={() => navigate('/robotics')}
                    >
                      Start Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition Plan Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Utensils className="h-5 w-5 text-orange-600" />
                    Nutrition Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <Activity className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {nutritionPlan ? 'Plan Active' : 'Setup Needed'}
                        </p>
                        <p className="text-xs text-gray-500">Weekly meal planning</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Create healthy meal plans tailored to {selectedChild.name}'s nutritional needs and preferences.
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500"
                      onClick={() => navigate('/nutrition')}
                    >
                      {nutritionPlan ? 'View Plan' : 'Create Plan'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Games */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gamepad2 className="h-5 w-5 text-pink-600" />
                    Educational Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                      <Star className="h-5 w-5 text-pink-600" />
                      <div>
                        <p className="font-medium text-gray-800">26 Games Available</p>
                        <p className="text-xs text-gray-500">6 skill categories</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Fun learning games to develop cognitive skills, memory, creativity, and emotional intelligence.
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-600"
                      onClick={() => navigate('/games')}
                    >
                      Play Games
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
