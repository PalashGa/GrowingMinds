import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, BookOpen, Search, Filter, Clock, Users, 
  Flame, ChefHat, Heart, Star, X, Check
} from "lucide-react";

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dietaryType: 'vegetarian' | 'vegan' | 'non-veg' | 'jain';
  prepTime: number;
  cookTime: number;
  servings: number;
  ageMin: number;
  ageMax: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: { name: string; quantity: string; unit: string }[];
  instructions: string[];
  nutrition: NutritionInfo;
  tags: string[];
  emoji: string;
  imageUrl?: string;
}

const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Paneer Butter Masala',
    description: 'Creamy and delicious paneer curry that kids love. Rich in protein and calcium.',
    category: 'lunch',
    dietaryType: 'vegetarian',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    ageMin: 5,
    ageMax: 16,
    difficulty: 'medium',
    ingredients: [
      { name: 'Paneer', quantity: '250', unit: 'g' },
      { name: 'Tomatoes', quantity: '4', unit: 'medium' },
      { name: 'Butter', quantity: '3', unit: 'tbsp' },
      { name: 'Cream', quantity: '1/2', unit: 'cup' },
      { name: 'Kasuri methi', quantity: '1', unit: 'tsp' },
      { name: 'Garam masala', quantity: '1', unit: 'tsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    instructions: [
      'Blanch tomatoes and make a smooth puree',
      'Heat butter in a pan, add tomato puree and cook for 10 minutes',
      'Add spices - red chili powder, garam masala, and salt',
      'Add cream and kasuri methi, mix well',
      'Add paneer cubes and simmer for 5 minutes',
      'Serve hot with naan or rice'
    ],
    nutrition: { calories: 320, protein: 14, carbs: 12, fats: 24, fiber: 2 },
    tags: ['high-protein', 'calcium-rich', 'comfort-food'],
    emoji: '🧀'
  },
  {
    id: '2',
    name: 'Vegetable Pulao',
    description: 'Colorful and nutritious rice dish packed with vegetables. Perfect for growing children.',
    category: 'lunch',
    dietaryType: 'vegan',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    ageMin: 5,
    ageMax: 16,
    difficulty: 'easy',
    ingredients: [
      { name: 'Basmati rice', quantity: '2', unit: 'cups' },
      { name: 'Mixed vegetables', quantity: '1.5', unit: 'cups' },
      { name: 'Whole spices', quantity: '1', unit: 'tbsp' },
      { name: 'Onion', quantity: '1', unit: 'large' },
      { name: 'Ghee', quantity: '2', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    instructions: [
      'Wash and soak rice for 30 minutes',
      'Heat ghee and add whole spices',
      'Add sliced onions and sauté until golden',
      'Add vegetables and cook for 3 minutes',
      'Add rice, salt, and water (2:1 ratio)',
      'Cook on low heat until rice is done',
      'Fluff with fork and serve'
    ],
    nutrition: { calories: 280, protein: 6, carbs: 52, fats: 8, fiber: 4 },
    tags: ['fiber-rich', 'iron-rich', 'balanced'],
    emoji: '🍚'
  },
  {
    id: '3',
    name: 'Masala Dosa with Chutney',
    description: 'Crispy South Indian crepe filled with spiced potato. A breakfast favorite.',
    category: 'breakfast',
    dietaryType: 'vegan',
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    ageMin: 5,
    ageMax: 16,
    difficulty: 'medium',
    ingredients: [
      { name: 'Dosa batter', quantity: '3', unit: 'cups' },
      { name: 'Potatoes', quantity: '4', unit: 'medium' },
      { name: 'Onion', quantity: '2', unit: 'medium' },
      { name: 'Mustard seeds', quantity: '1', unit: 'tsp' },
      { name: 'Curry leaves', quantity: '10', unit: 'leaves' },
      { name: 'Turmeric', quantity: '1/2', unit: 'tsp' },
    ],
    instructions: [
      'Boil and mash potatoes roughly',
      'Temper mustard seeds and curry leaves in oil',
      'Add onions and sauté until translucent',
      'Add turmeric and mashed potatoes, mix well',
      'Spread dosa batter on hot tawa in circular motion',
      'Add potato filling and fold',
      'Serve with coconut chutney and sambar'
    ],
    nutrition: { calories: 380, protein: 8, carbs: 62, fats: 12, fiber: 5 },
    tags: ['fermented', 'probiotic', 'energy-rich'],
    emoji: '🫓'
  },
  {
    id: '4',
    name: 'Dal Tadka',
    description: 'Comforting yellow lentils tempered with aromatic spices. Excellent protein source.',
    category: 'dinner',
    dietaryType: 'vegan',
    prepTime: 10,
    cookTime: 30,
    servings: 4,
    ageMin: 5,
    ageMax: 16,
    difficulty: 'easy',
    ingredients: [
      { name: 'Toor dal', quantity: '1', unit: 'cup' },
      { name: 'Ghee', quantity: '2', unit: 'tbsp' },
      { name: 'Cumin seeds', quantity: '1', unit: 'tsp' },
      { name: 'Garlic', quantity: '4', unit: 'cloves' },
      { name: 'Tomato', quantity: '1', unit: 'medium' },
      { name: 'Red chili', quantity: '2', unit: 'dried' },
    ],
    instructions: [
      'Wash dal and pressure cook with turmeric',
      'Heat ghee, add cumin and dried red chilies',
      'Add crushed garlic and sauté until golden',
      'Add chopped tomatoes and cook until soft',
      'Pour the cooked dal and mix well',
      'Garnish with coriander leaves',
      'Serve hot with rice or roti'
    ],
    nutrition: { calories: 220, protein: 12, carbs: 28, fats: 8, fiber: 8 },
    tags: ['high-protein', 'iron-rich', 'comfort-food'],
    emoji: '🍲'
  },
  {
    id: '5',
    name: 'Oatmeal with Berries',
    description: 'Healthy breakfast bowl with oats, fresh berries, and honey. Great for brain power.',
    category: 'breakfast',
    dietaryType: 'vegetarian',
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    ageMin: 5,
    ageMax: 16,
    difficulty: 'easy',
    ingredients: [
      { name: 'Rolled oats', quantity: '1', unit: 'cup' },
      { name: 'Milk', quantity: '2', unit: 'cups' },
      { name: 'Mixed berries', quantity: '1/2', unit: 'cup' },
      { name: 'Honey', quantity: '2', unit: 'tbsp' },
      { name: 'Cinnamon', quantity: '1/4', unit: 'tsp' },
      { name: 'Nuts', quantity: '2', unit: 'tbsp' },
    ],
    instructions: [
      'Bring milk to a boil in a pan',
      'Add oats and reduce heat',
      'Stir frequently for 5-7 minutes until creamy',
      'Add cinnamon and mix well',
      'Transfer to bowls',
      'Top with fresh berries, honey, and nuts',
      'Serve warm'
    ],
    nutrition: { calories: 320, protein: 10, carbs: 48, fats: 10, fiber: 6 },
    tags: ['fiber-rich', 'brain-food', 'heart-healthy'],
    emoji: '🥣'
  },
  {
    id: '6',
    name: 'Fruit Smoothie',
    description: 'Refreshing blend of fruits and yogurt. Perfect for a quick nutritious snack.',
    category: 'snack',
    dietaryType: 'vegetarian',
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    ageMin: 5,
    ageMax: 16,
    difficulty: 'easy',
    ingredients: [
      { name: 'Banana', quantity: '1', unit: 'large' },
      { name: 'Mango', quantity: '1/2', unit: 'cup' },
      { name: 'Yogurt', quantity: '1', unit: 'cup' },
      { name: 'Milk', quantity: '1/2', unit: 'cup' },
      { name: 'Honey', quantity: '1', unit: 'tbsp' },
    ],
    instructions: [
      'Add all ingredients to a blender',
      'Blend until smooth and creamy',
      'Add ice cubes if desired',
      'Pour into glasses',
      'Serve immediately'
    ],
    nutrition: { calories: 180, protein: 6, carbs: 32, fats: 4, fiber: 3 },
    tags: ['vitamin-rich', 'probiotic', 'refreshing'],
    emoji: '🥤'
  },
  {
    id: '7',
    name: 'Palak Paneer',
    description: 'Creamy spinach curry with cottage cheese. Rich in iron and protein.',
    category: 'dinner',
    dietaryType: 'vegetarian',
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    ageMin: 6,
    ageMax: 16,
    difficulty: 'medium',
    ingredients: [
      { name: 'Spinach', quantity: '500', unit: 'g' },
      { name: 'Paneer', quantity: '200', unit: 'g' },
      { name: 'Onion', quantity: '1', unit: 'medium' },
      { name: 'Tomato', quantity: '1', unit: 'medium' },
      { name: 'Cream', quantity: '2', unit: 'tbsp' },
      { name: 'Green chilies', quantity: '2', unit: 'small' },
    ],
    instructions: [
      'Blanch spinach in boiling water for 2 minutes',
      'Immediately transfer to ice water, then blend to puree',
      'Sauté onions until golden, add tomatoes and spices',
      'Add spinach puree and cook for 5 minutes',
      'Add paneer cubes and cream',
      'Simmer for 5 minutes and serve with roti'
    ],
    nutrition: { calories: 280, protein: 16, carbs: 14, fats: 18, fiber: 5 },
    tags: ['iron-rich', 'high-protein', 'low-carb'],
    emoji: '🥬'
  },
  {
    id: '8',
    name: 'Aloo Paratha',
    description: 'Stuffed potato flatbread. A filling and delicious breakfast option.',
    category: 'breakfast',
    dietaryType: 'vegetarian',
    prepTime: 20,
    cookTime: 20,
    servings: 4,
    ageMin: 5,
    ageMax: 16,
    difficulty: 'medium',
    ingredients: [
      { name: 'Whole wheat flour', quantity: '2', unit: 'cups' },
      { name: 'Potatoes', quantity: '3', unit: 'medium' },
      { name: 'Green chilies', quantity: '2', unit: 'small' },
      { name: 'Coriander', quantity: '2', unit: 'tbsp' },
      { name: 'Ghee', quantity: '4', unit: 'tbsp' },
      { name: 'Salt', quantity: 'to taste', unit: '' },
    ],
    instructions: [
      'Knead soft dough with flour, salt, and water',
      'Boil and mash potatoes with spices and herbs',
      'Divide dough into balls, roll each and stuff with filling',
      'Roll again carefully and cook on tawa with ghee',
      'Flip and cook both sides until golden brown',
      'Serve hot with curd and pickle'
    ],
    nutrition: { calories: 350, protein: 8, carbs: 52, fats: 12, fiber: 6 },
    tags: ['energy-rich', 'filling', 'comfort-food'],
    emoji: '🫓'
  },
  {
    id: '9',
    name: 'Chicken Tikka',
    description: 'Grilled spiced chicken pieces. High in protein for growing children.',
    category: 'dinner',
    dietaryType: 'non-veg',
    prepTime: 30,
    cookTime: 20,
    servings: 4,
    ageMin: 6,
    ageMax: 16,
    difficulty: 'medium',
    ingredients: [
      { name: 'Chicken breast', quantity: '500', unit: 'g' },
      { name: 'Yogurt', quantity: '1', unit: 'cup' },
      { name: 'Tikka masala', quantity: '2', unit: 'tbsp' },
      { name: 'Lemon juice', quantity: '2', unit: 'tbsp' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Oil', quantity: '2', unit: 'tbsp' },
    ],
    instructions: [
      'Cut chicken into cubes',
      'Make marinade with yogurt, spices, and lemon juice',
      'Marinate chicken for at least 2 hours',
      'Thread on skewers or place on baking tray',
      'Grill or bake at 200°C for 15-20 minutes',
      'Serve with mint chutney and onion rings'
    ],
    nutrition: { calories: 260, protein: 32, carbs: 6, fats: 12, fiber: 1 },
    tags: ['high-protein', 'low-carb', 'grilled'],
    emoji: '🍗'
  },
  {
    id: '10',
    name: 'Mango Lassi',
    description: 'Creamy mango yogurt drink. Refreshing and nutritious snack.',
    category: 'snack',
    dietaryType: 'vegetarian',
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    ageMin: 5,
    ageMax: 16,
    difficulty: 'easy',
    ingredients: [
      { name: 'Mango pulp', quantity: '1', unit: 'cup' },
      { name: 'Yogurt', quantity: '1', unit: 'cup' },
      { name: 'Milk', quantity: '1/2', unit: 'cup' },
      { name: 'Sugar', quantity: '2', unit: 'tbsp' },
      { name: 'Cardamom', quantity: '1/4', unit: 'tsp' },
    ],
    instructions: [
      'Add mango pulp and yogurt to blender',
      'Add milk, sugar, and cardamom powder',
      'Blend until smooth and frothy',
      'Add ice cubes and blend briefly',
      'Pour into glasses and serve cold',
      'Garnish with chopped pistachios if desired'
    ],
    nutrition: { calories: 180, protein: 5, carbs: 34, fats: 4, fiber: 2 },
    tags: ['probiotic', 'vitamin-rich', 'refreshing'],
    emoji: '🥭'
  },
  {
    id: '11',
    name: 'Idli with Sambar',
    description: 'Steamed rice cakes with lentil soup. Light and easy to digest.',
    category: 'breakfast',
    dietaryType: 'vegan',
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    ageMin: 5,
    ageMax: 16,
    difficulty: 'easy',
    ingredients: [
      { name: 'Idli batter', quantity: '3', unit: 'cups' },
      { name: 'Toor dal', quantity: '1/2', unit: 'cup' },
      { name: 'Mixed vegetables', quantity: '1', unit: 'cup' },
      { name: 'Sambar powder', quantity: '2', unit: 'tbsp' },
      { name: 'Tamarind', quantity: '1', unit: 'small ball' },
    ],
    instructions: [
      'Pour batter into greased idli molds',
      'Steam for 12-15 minutes until done',
      'For sambar, cook dal until soft',
      'Cook vegetables with sambar powder and tamarind',
      'Add dal and bring to boil',
      'Temper with mustard and curry leaves',
      'Serve idlis hot with sambar and chutney'
    ],
    nutrition: { calories: 250, protein: 8, carbs: 45, fats: 4, fiber: 5 },
    tags: ['fermented', 'probiotic', 'light'],
    emoji: '🥮'
  },
  {
    id: '12',
    name: 'Rajma Chawal',
    description: 'Kidney bean curry with rice. Protein-packed North Indian comfort food.',
    category: 'lunch',
    dietaryType: 'vegan',
    prepTime: 15,
    cookTime: 40,
    servings: 4,
    ageMin: 5,
    ageMax: 16,
    difficulty: 'medium',
    ingredients: [
      { name: 'Rajma (kidney beans)', quantity: '1', unit: 'cup' },
      { name: 'Onion', quantity: '2', unit: 'medium' },
      { name: 'Tomatoes', quantity: '3', unit: 'medium' },
      { name: 'Ginger-garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Rajma masala', quantity: '2', unit: 'tbsp' },
      { name: 'Basmati rice', quantity: '2', unit: 'cups' },
    ],
    instructions: [
      'Soak rajma overnight and pressure cook until soft',
      'Sauté onions until brown in oil',
      'Add ginger-garlic paste and cook for a minute',
      'Add tomato puree and spices, cook for 10 minutes',
      'Add rajma with cooking liquid and simmer',
      'Mash some beans for thick gravy',
      'Serve with steamed basmati rice'
    ],
    nutrition: { calories: 380, protein: 14, carbs: 62, fats: 8, fiber: 12 },
    tags: ['high-protein', 'fiber-rich', 'iron-rich'],
    emoji: '🍛'
  },
];

export default function NutritionRecipes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dietaryFilter, setDietaryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

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

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter;
    const matchesDietary = dietaryFilter === 'all' || recipe.dietaryType === dietaryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDietary && matchesDifficulty;
  });

  const toggleFavorite = (recipeId: string) => {
    if (favorites.includes(recipeId)) {
      setFavorites(favorites.filter(id => id !== recipeId));
      toast({ title: "Removed from favorites" });
    } else {
      setFavorites([...favorites, recipeId]);
      toast({ title: "Added to favorites!" });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDietaryBadge = (type: string) => {
    switch (type) {
      case 'vegetarian': return { color: 'bg-green-500', label: '🥬 Veg' };
      case 'vegan': return { color: 'bg-emerald-500', label: '🌱 Vegan' };
      case 'non-veg': return { color: 'bg-red-500', label: '🍗 Non-Veg' };
      case 'jain': return { color: 'bg-amber-500', label: '🙏 Jain' };
      default: return { color: 'bg-gray-500', label: type };
    }
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Recipe Library</h1>
              <p className="text-muted-foreground">Healthy recipes for ages 5-16</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes or ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meals</SelectItem>
                    <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                    <SelectItem value="lunch">☀️ Lunch</SelectItem>
                    <SelectItem value="dinner">🌙 Dinner</SelectItem>
                    <SelectItem value="snack">🍎 Snack</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Dietary" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vegetarian">🥬 Vegetarian</SelectItem>
                    <SelectItem value="vegan">🌱 Vegan</SelectItem>
                    <SelectItem value="non-veg">🍗 Non-Veg</SelectItem>
                    <SelectItem value="jain">🙏 Jain</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(searchQuery || categoryFilter !== 'all' || dietaryFilter !== 'all' || difficultyFilter !== 'all') && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-muted-foreground">
                  {filteredRecipes.length} recipes found
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setDietaryFilter('all');
                    setDifficultyFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recipe Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['high-protein', 'iron-rich', 'fiber-rich', 'vitamin-rich', 'brain-food', 'comfort-food'].map(tag => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setSearchQuery(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Recipe Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <Card 
              key={recipe.id} 
              className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="relative h-40 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <span className="text-7xl">{recipe.emoji}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipe.id);
                  }}
                >
                  <Heart 
                    className={`h-5 w-5 ${favorites.includes(recipe.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                  />
                </Button>
                <Badge 
                  className={`absolute top-2 left-2 ${getDietaryBadge(recipe.dietaryType).color} text-white`}
                >
                  {getDietaryBadge(recipe.dietaryType).label}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {recipe.name}
                  </CardTitle>
                </div>
                <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                  <Badge variant="outline" className="capitalize">{recipe.category}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    <span>{recipe.nutrition.calories} kcal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <Card className="p-12 text-center">
            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find more recipes.
            </p>
          </Card>
        )}

        {/* Recipe Detail Dialog */}
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            {selectedRecipe && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl flex items-center gap-2">
                        <span>{selectedRecipe.emoji}</span>
                        {selectedRecipe.name}
                      </DialogTitle>
                      <DialogDescription className="mt-2">
                        {selectedRecipe.description}
                      </DialogDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(selectedRecipe.id)}
                    >
                      <Heart 
                        className={`h-5 w-5 ${favorites.includes(selectedRecipe.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                      />
                    </Button>
                  </div>
                </DialogHeader>
                
                <ScrollArea className="max-h-[60vh] pr-4">
                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getDietaryBadge(selectedRecipe.dietaryType).color + " text-white"}>
                      {getDietaryBadge(selectedRecipe.dietaryType).label}
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(selectedRecipe.difficulty)}>
                      {selectedRecipe.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {selectedRecipe.prepTime + selectedRecipe.cookTime} min
                    </Badge>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedRecipe.servings} servings
                    </Badge>
                    <Badge variant="outline">
                      Ages {selectedRecipe.ageMin}-{selectedRecipe.ageMax}
                    </Badge>
                  </div>

                  {/* Nutrition Info */}
                  <Card className="mb-4 bg-orange-50/50">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        Nutrition per Serving
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-5 gap-2 text-center text-sm">
                        <div>
                          <p className="font-bold text-orange-600">{selectedRecipe.nutrition.calories}</p>
                          <p className="text-xs text-muted-foreground">Calories</p>
                        </div>
                        <div>
                          <p className="font-bold text-red-600">{selectedRecipe.nutrition.protein}g</p>
                          <p className="text-xs text-muted-foreground">Protein</p>
                        </div>
                        <div>
                          <p className="font-bold text-amber-600">{selectedRecipe.nutrition.carbs}g</p>
                          <p className="text-xs text-muted-foreground">Carbs</p>
                        </div>
                        <div>
                          <p className="font-bold text-green-600">{selectedRecipe.nutrition.fats}g</p>
                          <p className="text-xs text-muted-foreground">Fats</p>
                        </div>
                        <div>
                          <p className="font-bold text-emerald-600">{selectedRecipe.nutrition.fiber}g</p>
                          <p className="text-xs text-muted-foreground">Fiber</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="ingredients">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                      <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ingredients" className="mt-4">
                      <div className="space-y-2">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span>
                            <span className="text-muted-foreground">{ingredient.name}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="instructions" className="mt-4">
                      <div className="space-y-3">
                        {selectedRecipe.instructions.map((step, index) => (
                          <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-sm">
                              {index + 1}
                            </div>
                            <p className="pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Tags */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
