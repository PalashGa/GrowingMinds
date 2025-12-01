import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Apple, Calendar, User, Utensils, Droplets, Flame, 
  ChefHat, Camera, TrendingUp, ArrowRight, Plus,
  Beef, Salad, Cookie, CheckCircle, Heart, Brain,
  CalendarDays, BookOpen, Settings
} from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import type { Child } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

interface DayMeal {
  day: string;
  date: string;
  breakfast: { name: string; calories: number; consumed?: boolean };
  lunch: { name: string; calories: number; consumed?: boolean };
  dinner: { name: string; calories: number; consumed?: boolean };
  snacks: { name: string; calories: number; consumed?: boolean }[];
}

interface NutritionalGoal {
  name: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
}

export default function Nutrition() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChildId, setSelectedChildId] = useState<string>("");

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

  useEffect(() => {
    if (childrenError && isUnauthorizedError(childrenError)) {
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
  }, [childrenError, toast]);

  useEffect(() => {
    if (children && children.length === 1 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children?.find(child => child.id === selectedChildId);
  
  const calculateNutritionalGoals = (child: Child | undefined): NutritionalGoal[] => {
    if (!child) return [];
    const age = child.age;
    const weight = child.weight || 30;
    
    const calorieTarget = age < 8 ? 1400 : age < 12 ? 1800 : 2200;
    const proteinTarget = Math.round(weight * 1.2);
    const carbsTarget = age < 8 ? 150 : age < 12 ? 200 : 250;
    const fatsTarget = age < 8 ? 50 : age < 12 ? 65 : 75;
    const waterTarget = age < 8 ? 1500 : age < 12 ? 2000 : 2500;
    
    return [
      { name: "Calories", current: Math.round(calorieTarget * 0.65), target: calorieTarget, unit: "kcal", icon: "🔥", color: "bg-orange-500" },
      { name: "Protein", current: Math.round(proteinTarget * 0.7), target: proteinTarget, unit: "g", icon: "🥩", color: "bg-red-500" },
      { name: "Carbs", current: Math.round(carbsTarget * 0.6), target: carbsTarget, unit: "g", icon: "🍞", color: "bg-amber-500" },
      { name: "Fats", current: Math.round(fatsTarget * 0.55), target: fatsTarget, unit: "g", icon: "🥑", color: "bg-green-500" },
      { name: "Water", current: Math.round(waterTarget * 0.5), target: waterTarget, unit: "ml", icon: "💧", color: "bg-blue-500" },
      { name: "Fiber", current: 15, target: age < 8 ? 20 : 25, unit: "g", icon: "🥬", color: "bg-emerald-500" },
    ];
  };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyMeals: DayMeal[] = [
    {
      day: "Monday",
      date: format(addDays(weekStart, 0), "MMM d"),
      breakfast: { name: "Oatmeal with Berries & Honey", calories: 320, consumed: true },
      lunch: { name: "Paneer Tikka Wrap", calories: 450, consumed: true },
      dinner: { name: "Dal Tadka with Rice", calories: 520, consumed: false },
      snacks: [{ name: "Apple Slices", calories: 80, consumed: true }, { name: "Milk", calories: 120, consumed: false }]
    },
    {
      day: "Tuesday",
      date: format(addDays(weekStart, 1), "MMM d"),
      breakfast: { name: "Masala Dosa with Chutney", calories: 380, consumed: true },
      lunch: { name: "Rajma Chawal", calories: 480, consumed: true },
      dinner: { name: "Vegetable Khichdi", calories: 400, consumed: false },
      snacks: [{ name: "Banana", calories: 100 }, { name: "Buttermilk", calories: 60 }]
    },
    {
      day: "Wednesday",
      date: format(addDays(weekStart, 2), "MMM d"),
      breakfast: { name: "Upma with Vegetables", calories: 290, consumed: false },
      lunch: { name: "Chole with Bhature", calories: 550, consumed: false },
      dinner: { name: "Mixed Veg Curry with Roti", calories: 480, consumed: false },
      snacks: [{ name: "Mango Lassi", calories: 150 }, { name: "Almonds", calories: 90 }]
    },
    {
      day: "Thursday",
      date: format(addDays(weekStart, 3), "MMM d"),
      breakfast: { name: "Paratha with Curd", calories: 350, consumed: false },
      lunch: { name: "Palak Paneer with Naan", calories: 520, consumed: false },
      dinner: { name: "Sambar Rice", calories: 450, consumed: false },
      snacks: [{ name: "Fruit Chaat", calories: 120 }, { name: "Coconut Water", calories: 50 }]
    },
    {
      day: "Friday",
      date: format(addDays(weekStart, 4), "MMM d"),
      breakfast: { name: "Poha with Peanuts", calories: 280, consumed: false },
      lunch: { name: "Biryani (Veg/Non-veg)", calories: 580, consumed: false },
      dinner: { name: "Kadai Paneer with Roti", calories: 500, consumed: false },
      snacks: [{ name: "Sprout Salad", calories: 100 }, { name: "Fresh Juice", calories: 130 }]
    },
  ];

  const quickRecipes = [
    { name: "Paneer Butter Masala", time: "30 min", difficulty: "Easy", category: "lunch", emoji: "🧀" },
    { name: "Vegetable Pulao", time: "25 min", difficulty: "Easy", category: "dinner", emoji: "🍚" },
    { name: "Masala Omelette", time: "10 min", difficulty: "Easy", category: "breakfast", emoji: "🍳" },
    { name: "Dal Makhani", time: "45 min", difficulty: "Medium", category: "dinner", emoji: "🍲" },
    { name: "Fruit Smoothie", time: "5 min", difficulty: "Easy", category: "snack", emoji: "🥤" },
    { name: "Aloo Paratha", time: "20 min", difficulty: "Easy", category: "breakfast", emoji: "🫓" },
  ];

  const nutritionalGoals = calculateNutritionalGoals(selectedChild);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-white">
              <Apple className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nutrition Dashboard</h1>
              <p className="text-muted-foreground">Track meals, goals & healthy eating habits</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/nutrition/planner">
              <Button variant="outline" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Meal Planner
              </Button>
            </Link>
            <Link href="/nutrition/recipes">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Recipe Library
              </Button>
            </Link>
          </div>
        </div>

        {/* Child Selection */}
        <Card className="mb-6 border-green-200 bg-green-50/30">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                <span className="font-medium">Select Child:</span>
              </div>
              {!children || children.length === 0 ? (
                <div className="text-muted-foreground">
                  No child profiles found. <Link href="/dashboard" className="text-primary hover:underline">Create one</Link>
                </div>
              ) : (
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger className="w-64 bg-white">
                    <SelectValue placeholder="Choose a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: child.profileColor || '#22c55e' }}
                          />
                          <span>{child.name}</span>
                          <span className="text-muted-foreground text-sm">
                            (Age {child.age}, {child.weight || '—'}kg)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedChildId && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="meals" className="gap-2">
                <Utensils className="h-4 w-4" />
                <span className="hidden sm:inline">This Week</span>
              </TabsTrigger>
              <TabsTrigger value="recipes" className="gap-2">
                <ChefHat className="h-4 w-4" />
                <span className="hidden sm:inline">Recipes</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Nutritional Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Today's Nutritional Goals
                  </CardTitle>
                  <CardDescription>
                    Track {selectedChild?.name}'s daily nutrition intake based on age and weight
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nutritionalGoals.map((goal) => (
                      <div key={goal.name} className="p-4 rounded-xl bg-muted/30 border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{goal.icon}</span>
                            <span className="font-medium">{goal.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {goal.current}/{goal.target} {goal.unit}
                          </span>
                        </div>
                        <Progress 
                          value={(goal.current / goal.target) * 100} 
                          className={`h-2 ${goal.color}`}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((goal.current / goal.target) * 100)}% of daily goal
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Today's Meals Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Today's Meals
                    </CardTitle>
                    <CardDescription>{format(new Date(), "EEEE, MMMM d, yyyy")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {weeklyMeals[0] && (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🌅</span>
                            <div>
                              <p className="font-medium">Breakfast</p>
                              <p className="text-sm text-muted-foreground">{weeklyMeals[0].breakfast.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={weeklyMeals[0].breakfast.consumed ? "default" : "outline"}>
                              {weeklyMeals[0].breakfast.consumed ? "✓ Done" : "Pending"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{weeklyMeals[0].breakfast.calories} kcal</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">☀️</span>
                            <div>
                              <p className="font-medium">Lunch</p>
                              <p className="text-sm text-muted-foreground">{weeklyMeals[0].lunch.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={weeklyMeals[0].lunch.consumed ? "default" : "outline"}>
                              {weeklyMeals[0].lunch.consumed ? "✓ Done" : "Pending"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{weeklyMeals[0].lunch.calories} kcal</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🌙</span>
                            <div>
                              <p className="font-medium">Dinner</p>
                              <p className="text-sm text-muted-foreground">{weeklyMeals[0].dinner.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={weeklyMeals[0].dinner.consumed ? "default" : "outline"}>
                              {weeklyMeals[0].dinner.consumed ? "✓ Done" : "Pending"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{weeklyMeals[0].dinner.calories} kcal</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🍎</span>
                            <div>
                              <p className="font-medium">Snacks</p>
                              <p className="text-sm text-muted-foreground">
                                {weeklyMeals[0].snacks.map(s => s.name).join(", ")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {weeklyMeals[0].snacks.reduce((a, b) => a + b.calories, 0)} kcal
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Hydration Tracker */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      Hydration Tracker
                    </CardTitle>
                    <CardDescription>Daily water intake goal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="relative w-32 h-32 mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#3b82f6"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${(50 / 100) * 352} 352`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl">💧</span>
                          <span className="text-lg font-bold">50%</span>
                        </div>
                      </div>
                      <p className="text-lg font-medium">1000 / 2000 ml</p>
                      <p className="text-sm text-muted-foreground">5 glasses of 8</p>
                      <div className="flex gap-2 mt-4">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-6 h-8 rounded-b-lg border-2 ${
                              i < 5 ? 'bg-blue-400 border-blue-500' : 'bg-gray-100 border-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links */}
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/nutrition/planner">
                  <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-500 text-white">
                        <CalendarDays className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Meal Planner</h3>
                        <p className="text-sm text-muted-foreground">Plan weekly meals</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-blue-500" />
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/nutrition/recipes">
                  <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-orange-500 text-white">
                        <ChefHat className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Recipe Library</h3>
                        <p className="text-sm text-muted-foreground">Browse healthy recipes</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-orange-500" />
                    </CardContent>
                  </Card>
                </Link>
                <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500 text-white">
                      <Settings className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Preferences</h3>
                      <p className="text-sm text-muted-foreground">Set diet preferences</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-purple-500" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Weekly Meals Tab */}
            <TabsContent value="meals" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>This Week's Meal Plan</CardTitle>
                      <CardDescription>
                        Week of {format(weekStart, "MMMM d")} - {format(addDays(weekStart, 4), "MMMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Link href="/nutrition/planner">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Edit Plan
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyMeals.map((day, index) => (
                      <div key={index} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {day.day.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{day.day}</p>
                              <p className="text-sm text-muted-foreground">{day.date}</p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {day.breakfast.calories + day.lunch.calories + day.dinner.calories + 
                             day.snacks.reduce((a, b) => a + b.calories, 0)} kcal
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                            <p className="text-xs text-amber-600 font-medium mb-1">Breakfast</p>
                            <p className="line-clamp-1">{day.breakfast.name}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-orange-50 border border-orange-100">
                            <p className="text-xs text-orange-600 font-medium mb-1">Lunch</p>
                            <p className="line-clamp-1">{day.lunch.name}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                            <p className="text-xs text-indigo-600 font-medium mb-1">Dinner</p>
                            <p className="line-clamp-1">{day.dinner.name}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-green-50 border border-green-100">
                            <p className="text-xs text-green-600 font-medium mb-1">Snacks</p>
                            <p className="line-clamp-1">{day.snacks.map(s => s.name).join(", ")}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quick Recipes Tab */}
            <TabsContent value="recipes" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Quick Recipes</CardTitle>
                      <CardDescription>Easy-to-make healthy meals for your child</CardDescription>
                    </div>
                    <Link href="/nutrition/recipes">
                      <Button variant="outline" className="gap-2">
                        View All Recipes
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickRecipes.map((recipe, index) => (
                      <Link href="/nutrition/recipes" key={index}>
                        <div className="p-4 rounded-xl border bg-card hover:shadow-lg transition-all cursor-pointer group">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-4xl">{recipe.emoji}</span>
                            <Badge variant="outline" className="capitalize">{recipe.category}</Badge>
                          </div>
                          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                            {recipe.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>⏱️ {recipe.time}</span>
                            <span>📊 {recipe.difficulty}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Photos Tab */}
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-purple-500" />
                    Growth Progress Photos
                  </CardTitle>
                  <CardDescription>
                    Upload weekly photos to track {selectedChild?.name}'s growth and health improvement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Upload Progress Photo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track your child's growth by uploading weekly photos
                    </p>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Recent Photos</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                          <Camera className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      No photos uploaded yet. Start tracking {selectedChild?.name}'s progress today!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold">{selectedChild?.height || '—'} cm</p>
                    <p className="text-sm text-muted-foreground">Current Height</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <Beef className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold">{selectedChild?.weight || '—'} kg</p>
                    <p className="text-sm text-muted-foreground">Current Weight</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                      <Heart className="h-6 w-6 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold">{selectedChild?.age || '—'} yrs</p>
                    <p className="text-sm text-muted-foreground">Age</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {!selectedChildId && children && children.length > 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Child</h3>
              <p className="text-muted-foreground">
                Choose a child profile above to view their nutrition dashboard
              </p>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <div className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Why Nutrition Matters for Child Development 🌱
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Brain Development</h3>
              <p className="text-sm text-muted-foreground">
                Proper nutrition supports cognitive function, memory, and learning abilities.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-semibold mb-2">Physical Growth</h3>
              <p className="text-sm text-muted-foreground">
                Balanced meals provide essential nutrients for healthy growth and development.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
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
