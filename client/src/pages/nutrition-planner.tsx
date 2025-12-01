import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, CalendarDays, User, Plus, GripVertical, 
  Trash2, Edit2, Save, ChefHat, Utensils, Settings,
  ChevronLeft, ChevronRight, Info
} from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import type { Child } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Meal {
  id: string;
  name: string;
  calories: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  emoji?: string;
}

interface DayPlan {
  day: string;
  date: Date;
  breakfast: Meal | null;
  lunch: Meal | null;
  dinner: Meal | null;
  snacks: Meal[];
}

const sampleMeals: Meal[] = [
  { id: '1', name: 'Oatmeal with Berries', calories: 320, category: 'breakfast', emoji: '🥣' },
  { id: '2', name: 'Masala Dosa', calories: 380, category: 'breakfast', emoji: '🫓' },
  { id: '3', name: 'Upma with Vegetables', calories: 290, category: 'breakfast', emoji: '🍲' },
  { id: '4', name: 'Paratha with Curd', calories: 350, category: 'breakfast', emoji: '🫓' },
  { id: '5', name: 'Poha with Peanuts', calories: 280, category: 'breakfast', emoji: '🍚' },
  { id: '6', name: 'Idli Sambar', calories: 250, category: 'breakfast', emoji: '🥮' },
  { id: '7', name: 'Paneer Tikka Wrap', calories: 450, category: 'lunch', emoji: '🌯' },
  { id: '8', name: 'Rajma Chawal', calories: 480, category: 'lunch', emoji: '🍛' },
  { id: '9', name: 'Chole Bhature', calories: 550, category: 'lunch', emoji: '🍛' },
  { id: '10', name: 'Palak Paneer with Naan', calories: 520, category: 'lunch', emoji: '🍛' },
  { id: '11', name: 'Vegetable Biryani', calories: 480, category: 'lunch', emoji: '🍚' },
  { id: '12', name: 'Dal Tadka with Rice', calories: 520, category: 'dinner', emoji: '🍛' },
  { id: '13', name: 'Vegetable Khichdi', calories: 400, category: 'dinner', emoji: '🍲' },
  { id: '14', name: 'Mixed Veg Curry with Roti', calories: 480, category: 'dinner', emoji: '🍛' },
  { id: '15', name: 'Sambar Rice', calories: 450, category: 'dinner', emoji: '🍚' },
  { id: '16', name: 'Kadai Paneer with Roti', calories: 500, category: 'dinner', emoji: '🍛' },
  { id: '17', name: 'Apple Slices', calories: 80, category: 'snack', emoji: '🍎' },
  { id: '18', name: 'Banana', calories: 100, category: 'snack', emoji: '🍌' },
  { id: '19', name: 'Mango Lassi', calories: 150, category: 'snack', emoji: '🥤' },
  { id: '20', name: 'Almonds', calories: 90, category: 'snack', emoji: '🥜' },
  { id: '21', name: 'Fruit Chaat', calories: 120, category: 'snack', emoji: '🍇' },
  { id: '22', name: 'Milk', calories: 120, category: 'snack', emoji: '🥛' },
];

export default function NutritionPlanner() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [draggedMeal, setDraggedMeal] = useState<Meal | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [customMeal, setCustomMeal] = useState({ name: '', calories: '', category: 'breakfast' as Meal['category'] });
  const [preferences, setPreferences] = useState({
    dietaryType: 'vegetarian',
    allergies: [] as string[],
    dislikedFoods: '',
  });

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
    }
  }, [childrenError, toast]);

  useEffect(() => {
    if (children && children.length === 1 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  useEffect(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const plan: DayPlan[] = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      plan.push({
        day: days[i],
        date,
        breakfast: sampleMeals.find(m => m.category === 'breakfast' && Math.random() > 0.5) || null,
        lunch: sampleMeals.find(m => m.category === 'lunch' && Math.random() > 0.5) || null,
        dinner: sampleMeals.find(m => m.category === 'dinner' && Math.random() > 0.5) || null,
        snacks: sampleMeals.filter(m => m.category === 'snack').slice(0, 2),
      });
    }
    setWeeklyPlan(plan);
  }, [currentWeek]);

  const selectedChild = children?.find(child => child.id === selectedChildId);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });

  const handleDragStart = (meal: Meal) => {
    setDraggedMeal(meal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (!draggedMeal) return;

    setWeeklyPlan(prev => {
      const newPlan = [...prev];
      if (mealType === 'snack') {
        if (!newPlan[dayIndex].snacks.find(s => s.id === draggedMeal.id)) {
          newPlan[dayIndex].snacks = [...newPlan[dayIndex].snacks, draggedMeal];
        }
      } else {
        newPlan[dayIndex][mealType] = draggedMeal;
      }
      return newPlan;
    });
    setDraggedMeal(null);
    toast({
      title: "Meal Added!",
      description: `${draggedMeal.name} has been added to the plan.`,
    });
  };

  const handleRemoveMeal = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', snackIndex?: number) => {
    setWeeklyPlan(prev => {
      const newPlan = [...prev];
      if (mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner') {
        newPlan[dayIndex][mealType] = null;
      }
      return newPlan;
    });
  };

  const handleRemoveSnack = (dayIndex: number, snackIndex: number) => {
    setWeeklyPlan(prev => {
      const newPlan = [...prev];
      newPlan[dayIndex].snacks = newPlan[dayIndex].snacks.filter((_, i) => i !== snackIndex);
      return newPlan;
    });
  };

  const handleAddCustomMeal = () => {
    if (!customMeal.name || !customMeal.calories) {
      toast({
        title: "Missing Information",
        description: "Please enter meal name and calories.",
        variant: "destructive",
      });
      return;
    }
    
    const newMeal: Meal = {
      id: `custom-${Date.now()}`,
      name: customMeal.name,
      calories: parseInt(customMeal.calories),
      category: customMeal.category,
      emoji: '🍽️',
    };
    
    sampleMeals.push(newMeal);
    setCustomMeal({ name: '', calories: '', category: 'breakfast' });
    setIsAddMealOpen(false);
    toast({
      title: "Meal Added!",
      description: `${newMeal.name} has been added to your meal library.`,
    });
  };

  const getTotalCalories = (day: DayPlan) => {
    let total = 0;
    if (day.breakfast) total += day.breakfast.calories;
    if (day.lunch) total += day.lunch.calories;
    if (day.dinner) total += day.dinner.calories;
    day.snacks.forEach(s => total += s.calories);
    return total;
  };

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/nutrition">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white">
              <CalendarDays className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Weekly Meal Planner</h1>
              <p className="text-muted-foreground">Drag and drop meals to plan the week</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Preferences
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dietary Preferences</DialogTitle>
                  <DialogDescription>
                    Set dietary preferences for {selectedChild?.name || 'your child'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Dietary Type</Label>
                    <Select 
                      value={preferences.dietaryType} 
                      onValueChange={(v) => setPreferences({...preferences, dietaryType: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetarian">🥬 Vegetarian</SelectItem>
                        <SelectItem value="vegan">🌱 Vegan</SelectItem>
                        <SelectItem value="non-veg">🍗 Non-Vegetarian</SelectItem>
                        <SelectItem value="jain">🙏 Jain</SelectItem>
                        <SelectItem value="eggetarian">🥚 Eggetarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Allergies</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Shellfish'].map(allergy => (
                        <Badge 
                          key={allergy}
                          variant={preferences.allergies.includes(allergy) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (preferences.allergies.includes(allergy)) {
                              setPreferences({
                                ...preferences,
                                allergies: preferences.allergies.filter(a => a !== allergy)
                              });
                            } else {
                              setPreferences({
                                ...preferences,
                                allergies: [...preferences.allergies, allergy]
                              });
                            }
                          }}
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Disliked Foods</Label>
                    <Textarea 
                      placeholder="Enter foods your child doesn't like (comma separated)"
                      value={preferences.dislikedFoods}
                      onChange={(e) => setPreferences({...preferences, dislikedFoods: e.target.value})}
                    />
                  </div>
                  <Button className="w-full" onClick={() => {
                    setIsPreferencesOpen(false);
                    toast({ title: "Preferences Saved!", description: "Dietary preferences have been updated." });
                  }}>
                    Save Preferences
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Custom Meal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Meal</DialogTitle>
                  <DialogDescription>
                    Add a meal that your child usually eats
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Meal Name</Label>
                    <Input 
                      placeholder="e.g., Homemade Pasta"
                      value={customMeal.name}
                      onChange={(e) => setCustomMeal({...customMeal, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Calories</Label>
                    <Input 
                      type="number"
                      placeholder="e.g., 350"
                      value={customMeal.calories}
                      onChange={(e) => setCustomMeal({...customMeal, calories: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={customMeal.category} 
                      onValueChange={(v: Meal['category']) => setCustomMeal({...customMeal, category: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                        <SelectItem value="lunch">☀️ Lunch</SelectItem>
                        <SelectItem value="dinner">🌙 Dinner</SelectItem>
                        <SelectItem value="snack">🍎 Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleAddCustomMeal}>
                    Add Meal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Child Selection */}
        <Card className="mb-6 border-blue-200 bg-blue-50/30">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Planning for:</span>
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
                            style={{ backgroundColor: child.profileColor || '#3b82f6' }}
                          />
                          <span>{child.name}</span>
                          <span className="text-muted-foreground text-sm">(Age {child.age})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous Week
          </Button>
          <h2 className="text-xl font-semibold">
            Week of {format(weekStart, "MMMM d")} - {format(addDays(weekStart, 6), "MMMM d, yyyy")}
          </h2>
          <Button variant="outline" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            Next Week
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Meal Library Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ChefHat className="h-5 w-5" />
                Meal Library
              </CardTitle>
              <CardDescription>Drag meals to add to your plan</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map(category => (
                    <div key={category}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2 capitalize flex items-center gap-2">
                        {category === 'breakfast' && '🌅'}
                        {category === 'lunch' && '☀️'}
                        {category === 'dinner' && '🌙'}
                        {category === 'snack' && '🍎'}
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {sampleMeals.filter(m => m.category === category).map(meal => (
                          <div
                            key={meal.id}
                            draggable
                            onDragStart={() => handleDragStart(meal)}
                            className="p-2 rounded-lg border bg-white hover:bg-muted/50 cursor-grab active:cursor-grabbing flex items-center gap-2 text-sm transition-colors"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span>{meal.emoji}</span>
                            <div className="flex-1">
                              <p className="font-medium line-clamp-1">{meal.name}</p>
                              <p className="text-xs text-muted-foreground">{meal.calories} kcal</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Weekly Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Weekly Plan
                </CardTitle>
                <CardDescription>
                  Drop meals in the boxes below to plan each day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyPlan.map((day, dayIndex) => (
                    <div key={dayIndex} className="p-4 rounded-xl border bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">{day.day.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{day.day}</p>
                            <p className="text-sm text-muted-foreground">{format(day.date, "MMM d")}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{getTotalCalories(day)} kcal</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Breakfast */}
                        <div
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(dayIndex, 'breakfast')}
                          className={`p-3 rounded-lg border-2 border-dashed min-h-[80px] transition-colors ${
                            draggedMeal?.category === 'breakfast' 
                              ? 'border-amber-400 bg-amber-50' 
                              : 'border-muted-foreground/20 bg-amber-50/30'
                          }`}
                        >
                          <p className="text-xs font-medium text-amber-600 mb-2">🌅 Breakfast</p>
                          {day.breakfast ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium line-clamp-1">{day.breakfast.name}</p>
                                <p className="text-xs text-muted-foreground">{day.breakfast.calories} kcal</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleRemoveMeal(dayIndex, 'breakfast')}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Drop meal here</p>
                          )}
                        </div>

                        {/* Lunch */}
                        <div
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(dayIndex, 'lunch')}
                          className={`p-3 rounded-lg border-2 border-dashed min-h-[80px] transition-colors ${
                            draggedMeal?.category === 'lunch' 
                              ? 'border-orange-400 bg-orange-50' 
                              : 'border-muted-foreground/20 bg-orange-50/30'
                          }`}
                        >
                          <p className="text-xs font-medium text-orange-600 mb-2">☀️ Lunch</p>
                          {day.lunch ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium line-clamp-1">{day.lunch.name}</p>
                                <p className="text-xs text-muted-foreground">{day.lunch.calories} kcal</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleRemoveMeal(dayIndex, 'lunch')}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Drop meal here</p>
                          )}
                        </div>

                        {/* Dinner */}
                        <div
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(dayIndex, 'dinner')}
                          className={`p-3 rounded-lg border-2 border-dashed min-h-[80px] transition-colors ${
                            draggedMeal?.category === 'dinner' 
                              ? 'border-indigo-400 bg-indigo-50' 
                              : 'border-muted-foreground/20 bg-indigo-50/30'
                          }`}
                        >
                          <p className="text-xs font-medium text-indigo-600 mb-2">🌙 Dinner</p>
                          {day.dinner ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium line-clamp-1">{day.dinner.name}</p>
                                <p className="text-xs text-muted-foreground">{day.dinner.calories} kcal</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => handleRemoveMeal(dayIndex, 'dinner')}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Drop meal here</p>
                          )}
                        </div>

                        {/* Snacks */}
                        <div
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(dayIndex, 'snack')}
                          className={`p-3 rounded-lg border-2 border-dashed min-h-[80px] transition-colors ${
                            draggedMeal?.category === 'snack' 
                              ? 'border-green-400 bg-green-50' 
                              : 'border-muted-foreground/20 bg-green-50/30'
                          }`}
                        >
                          <p className="text-xs font-medium text-green-600 mb-2">🍎 Snacks</p>
                          {day.snacks.length > 0 ? (
                            <div className="space-y-1">
                              {day.snacks.map((snack, snackIndex) => (
                                <div key={snackIndex} className="flex items-center justify-between text-xs">
                                  <span className="line-clamp-1">{snack.name}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-4 w-4"
                                    onClick={() => handleRemoveSnack(dayIndex, snackIndex)}
                                  >
                                    <Trash2 className="h-2 w-2" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Drop snacks here</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <Card className="mt-6 bg-blue-50/50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Tip: How to use the planner</h4>
                <p className="text-sm text-blue-700">
                  Drag meals from the library on the left and drop them into the day's meal slots. 
                  You can add custom meals using the "Add Custom Meal" button, and set dietary 
                  preferences in the settings. Click the trash icon to remove a meal from the plan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
