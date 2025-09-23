import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Apple, Calendar as CalendarIcon, User, Plus, CheckCircle, Utensils, Heart, Brain } from "lucide-react";
import { format } from "date-fns";
import type { Child, NutritionPlan } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

interface MealPlan {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string[];
}

export default function Nutrition() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

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

  const { data: nutritionPlan, isLoading: planLoading, error: planError } = useQuery<NutritionPlan>({
    queryKey: ['/api/children', selectedChildId, 'nutrition-plan', selectedWeek.toISOString()],
    enabled: isAuthenticated && !!selectedChildId,
    retry: false,
  });

  useEffect(() => {
    if ((childrenError && isUnauthorizedError(childrenError)) || 
        (planError && isUnauthorizedError(planError))) {
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
  }, [childrenError, planError, toast]);

  // Auto-select first child if only one exists
  useEffect(() => {
    if (children && children.length === 1 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const generatePlanMutation = useMutation({
    mutationFn: async (data: { childId: string; weekOf: Date }) => {
      const child = children?.find(c => c.id === data.childId);
      if (!child) throw new Error('Child not found');

      // Generate a sample meal plan based on child's age
      const sampleMealPlan: MealPlan[] = [
        {
          day: "Monday",
          breakfast: child.age < 10 ? "Whole grain cereal with milk and banana slices" : "Overnight oats with berries and nuts",
          lunch: "Turkey and avocado wrap with whole wheat tortilla",
          dinner: "Grilled chicken with sweet potato and steamed broccoli",
          snacks: ["Apple slices with peanut butter", "Greek yogurt with honey"]
        },
        {
          day: "Tuesday", 
          breakfast: "Scrambled eggs with whole grain toast",
          lunch: "Quinoa salad with vegetables and chickpeas",
          dinner: "Baked salmon with brown rice and green beans",
          snacks: ["Carrot sticks with hummus", "Mixed berries"]
        },
        {
          day: "Wednesday",
          breakfast: "Smoothie bowl with spinach, banana, and granola",
          lunch: "Lentil soup with whole grain bread",
          dinner: "Lean beef with roasted vegetables and quinoa",
          snacks: ["Cheese and whole grain crackers", "Orange slices"]
        },
        {
          day: "Thursday",
          breakfast: "Greek yogurt parfait with fruits and granola",
          lunch: "Grilled chicken salad with mixed greens",
          dinner: "Vegetable stir-fry with tofu and brown rice",
          snacks: ["Trail mix with nuts and dried fruit", "Celery with almond butter"]
        },
        {
          day: "Friday",
          breakfast: "Whole grain pancakes with fresh berries",
          lunch: "Bean and vegetable quesadilla",
          dinner: "Baked cod with sweet potato fries and asparagus",
          snacks: ["Homemade energy balls", "Cucumber slices"]
        },
        {
          day: "Saturday",
          breakfast: "Avocado toast with poached egg",
          lunch: "Homemade pizza with whole wheat crust and vegetables",
          dinner: "Turkey meatballs with zucchini noodles",
          snacks: ["Frozen fruit popsicle", "Roasted chickpeas"]
        },
        {
          day: "Sunday",
          breakfast: "Chia seed pudding with mango",
          lunch: "Grilled vegetable and hummus wrap",
          dinner: "Herb-crusted chicken with mashed cauliflower",
          snacks: ["Baked sweet potato chips", "Smoothie with spinach and fruit"]
        }
      ];

      const nutritionalGoals = {
        calories: child.age < 10 ? "1400-1600 calories" : "1800-2000 calories",
        protein: "Include protein at every meal",
        vegetables: "5-7 servings of fruits and vegetables daily",
        wholegrains: "Choose whole grains over refined grains",
        hydration: "6-8 glasses of water daily",
        omega3: "Include fish twice per week for brain development"
      };

      const response = await apiRequest("POST", "/api/nutrition-plans", {
        childId: data.childId,
        weekOf: data.weekOf,
        meals: sampleMealPlan,
        goals: nutritionalGoals,
        notes: `Personalized nutrition plan for ${child.name} (age ${child.age}). Focus on brain development and growth.`
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children', selectedChildId, 'nutrition-plan'] });
      setIsGenerateDialogOpen(false);
      toast({
        title: "Nutrition Plan Generated!",
        description: "Your personalized weekly meal plan has been created successfully.",
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
        description: "Failed to generate nutrition plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedChild = children?.find(child => child.id === selectedChildId);
  const weekStart = new Date(selectedWeek);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

  const handleGeneratePlan = () => {
    if (!selectedChildId) {
      toast({
        title: "Select Child",
        description: "Please select a child before generating a nutrition plan.",
        variant: "destructive",
      });
      return;
    }
    generatePlanMutation.mutate({
      childId: selectedChildId,
      weekOf: weekStart,
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Apple className="h-12 w-12 text-accent mr-4" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-nutrition-title">
              Nutrition Planning
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Personalized weekly meal plans designed to support your child's growth, brain development, and overall health.
          </p>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Child Selection */}
          <Card data-testid="card-child-selection">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="mr-2 h-5 w-5" />
                Select Child
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!children || children.length === 0 ? (
                <div className="text-center p-4">
                  <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">No child profiles found</p>
                  <Button size="sm" data-testid="button-create-child">Create Profile</Button>
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

          {/* Week Selection */}
          <Card data-testid="card-week-selection">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Select Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" data-testid="button-select-week">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(weekStart, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" data-testid="popover-calendar">
                  <Calendar
                    mode="single"
                    selected={selectedWeek}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedWeek(date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Generate Plan */}
          <Card data-testid="card-generate-plan">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Plus className="mr-2 h-5 w-5" />
                New Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    disabled={!selectedChildId}
                    data-testid="button-generate-plan"
                  >
                    Generate Plan
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-generate-plan">
                  <DialogHeader>
                    <DialogTitle>Generate Nutrition Plan</DialogTitle>
                    <DialogDescription>
                      Create a personalized weekly meal plan for {selectedChild?.name} starting {format(weekStart, "MMM d, yyyy")}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Plan Details:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Age-appropriate portions and ingredients</li>
                        <li>• Focus on brain development and growth</li>
                        <li>• Balanced nutrition across all meals</li>
                        <li>• Healthy snack options included</li>
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)} data-testid="button-cancel">
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleGeneratePlan}
                        disabled={generatePlanMutation.isPending}
                        data-testid="button-confirm-generate"
                      >
                        {generatePlanMutation.isPending ? "Generating..." : "Generate Plan"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {selectedChildId && (
          <>
            {planLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !nutritionPlan ? (
              <Card className="text-center p-8" data-testid="card-no-plan">
                <CardContent>
                  <Utensils className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No nutrition plan found</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate a personalized meal plan for {selectedChild?.name} for the week of {format(weekStart, "MMM d, yyyy")}.
                  </p>
                  <Button onClick={() => setIsGenerateDialogOpen(true)} data-testid="button-create-first-plan">
                    Create Your First Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Plan Overview */}
                <Card className="mb-8" data-testid="card-plan-overview">
                  <CardHeader>
                    <CardTitle>Nutrition Plan for {selectedChild?.name}</CardTitle>
                    <CardDescription>
                      Week of {format(weekStart, "MMMM d, yyyy")} • {nutritionPlan.notes || 'No notes'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {nutritionPlan.goals && (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries((nutritionPlan.goals as Record<string, string>) || {}).map(([key, value]) => (
                          <div key={key} className="flex items-start space-x-2" data-testid={`goal-${key}`}>
                            <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                              <p className="text-xs text-muted-foreground">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Weekly Meal Plan */}
                <div className="grid gap-6 mb-8">
                  {nutritionPlan.meals && ((nutritionPlan.meals as MealPlan[]) || []).map((dayPlan, index) => (
                    <Card key={index} data-testid={`card-day-${dayPlan.day.toLowerCase()}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{dayPlan.day}</span>
                          <Badge variant="outline" data-testid={`badge-day-${index}`}>Day {index + 1}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div data-testid={`breakfast-${index}`}>
                            <h4 className="font-semibold text-sm mb-2 flex items-center">
                              <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                              Breakfast
                            </h4>
                            <p className="text-sm text-muted-foreground">{dayPlan.breakfast}</p>
                          </div>
                          <div data-testid={`lunch-${index}`}>
                            <h4 className="font-semibold text-sm mb-2 flex items-center">
                              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                              Lunch
                            </h4>
                            <p className="text-sm text-muted-foreground">{dayPlan.lunch}</p>
                          </div>
                          <div data-testid={`dinner-${index}`}>
                            <h4 className="font-semibold text-sm mb-2 flex items-center">
                              <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                              Dinner
                            </h4>
                            <p className="text-sm text-muted-foreground">{dayPlan.dinner}</p>
                          </div>
                          <div data-testid={`snacks-${index}`}>
                            <h4 className="font-semibold text-sm mb-2 flex items-center">
                              <span className="w-2 h-2 bg-accent/60 rounded-full mr-2"></span>
                              Snacks
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {dayPlan.snacks.map((snack, snackIndex) => (
                                <li key={snackIndex}>• {snack}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Benefits Section */}
        <div className="bg-muted/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Why Nutrition Matters for Development
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Brain Development</h3>
              <p className="text-sm text-muted-foreground">
                Proper nutrition supports cognitive function, memory, and learning abilities.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Physical Growth</h3>
              <p className="text-sm text-muted-foreground">
                Balanced meals provide essential nutrients for healthy growth and development.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Healthy Habits</h3>
              <p className="text-sm text-muted-foreground">
                Early nutrition education creates lifelong healthy eating patterns.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
