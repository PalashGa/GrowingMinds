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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Play, Trophy, Star, User, Target, Brain, BookOpen, Calculator } from "lucide-react";
import type { EducationalGame, Child, GameScore } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Games() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedGame, setSelectedGame] = useState<EducationalGame | null>(null);
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameLevel, setGameLevel] = useState<number>(1);
  const [timeSpent, setTimeSpent] = useState<number>(5);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const { data: educationalGames, isLoading: gamesLoading, error: gamesError } = useQuery<EducationalGame[]>({
    queryKey: ['/api/games'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: gameScores, error: scoresError } = useQuery<GameScore[]>({
    queryKey: ['/api/children', selectedChildId, 'game-scores'],
    enabled: isAuthenticated && !!selectedChildId,
    retry: false,
  });

  useEffect(() => {
    if ((childrenError && isUnauthorizedError(childrenError)) || 
        (gamesError && isUnauthorizedError(gamesError)) ||
        (scoresError && isUnauthorizedError(scoresError))) {
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
  }, [childrenError, gamesError, scoresError, toast]);

  // Auto-select first child if only one exists
  useEffect(() => {
    if (children && children.length === 1 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const saveScoreMutation = useMutation({
    mutationFn: async (data: { childId: string; gameId: string; score: number; timeSpent: number; level: number }) => {
      const response = await apiRequest("POST", "/api/game-scores", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children', selectedChildId, 'game-scores'] });
      setIsGameDialogOpen(false);
      setGameScore(0);
      setGameLevel(1);
      setTimeSpent(5);
      setSelectedGame(null);
      toast({
        title: "Score Saved!",
        description: "Your game score has been recorded successfully.",
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
        description: "Failed to save game score. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedChild = children?.find(child => child.id === selectedChildId);
  const childAge = selectedChild?.age || 10;

  // Filter games by child's age and category
  const availableGames = educationalGames?.filter(game => {
    const ageMatch = childAge >= game.ageMin && childAge <= game.ageMax;
    const categoryMatch = selectedCategory === "all" || game.category === selectedCategory;
    return ageMatch && categoryMatch;
  }) || [];

  const categories = [
    { value: "all", label: "All Categories", icon: Gamepad2 },
    { value: "math", label: "Mathematics", icon: Calculator },
    { value: "science", label: "Science", icon: Brain },
    { value: "reading", label: "Reading", icon: BookOpen },
    { value: "logic", label: "Logic", icon: Target },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'math':
        return Calculator;
      case 'science':
        return Brain;
      case 'reading':
        return BookOpen;
      case 'logic':
        return Target;
      default:
        return Gamepad2;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'math':
        return 'primary';
      case 'science':
        return 'secondary';
      case 'reading':
        return 'accent';
      case 'logic':
        return 'destructive';
      default:
        return 'primary';
    }
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

  const handlePlayGame = (game: EducationalGame) => {
    if (!selectedChildId) {
      toast({
        title: "Select Child",
        description: "Please select a child before playing a game.",
        variant: "destructive",
      });
      return;
    }
    setSelectedGame(game);
    setIsGameDialogOpen(true);
  };

  const handleSaveScore = () => {
    if (!selectedGame || !selectedChildId) return;

    saveScoreMutation.mutate({
      childId: selectedChildId,
      gameId: selectedGame.id,
      score: gameScore,
      timeSpent,
      level: gameLevel,
    });
  };

  const getGameStats = (gameId: string) => {
    const scores = gameScores?.filter(score => score.gameId === gameId) || [];
    if (scores.length === 0) return null;
    
    const bestScore = Math.max(...scores.map(s => s.score));
    const totalPlays = scores.length;
    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / totalPlays;
    
    return { bestScore, totalPlays, avgScore };
  };

  if (isLoading || gamesLoading) {
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
            <Gamepad2 className="h-12 w-12 text-accent mr-4" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-games-title">
              Educational Games
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn through play with our collection of educational games designed to make learning fun and engaging for children.
          </p>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Child Selection */}
          <Card data-testid="card-child-selection">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Select Child
              </CardTitle>
              <CardDescription>
                Choose which child will be playing the games
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!children || children.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You need to create a child profile before accessing games.
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

          {/* Category Filter */}
          <Card data-testid="card-category-filter">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Category Filter
              </CardTitle>
              <CardDescription>
                Filter games by subject area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <TabsTrigger 
                        key={category.value} 
                        value={category.value}
                        className="flex flex-col items-center p-2"
                        data-testid={`tab-category-${category.value}`}
                      >
                        <IconComponent className="h-4 w-4 mb-1" />
                        <span className="text-xs">{category.label.split(' ')[0]}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {selectedChildId && (
          <>
            {/* Recent Scores */}
            {gameScores && gameScores.length > 0 && (
              <div className="mb-8">
                <Card data-testid="card-recent-scores">
                  <CardHeader>
                    <CardTitle>Recent Game Scores</CardTitle>
                    <CardDescription>
                      {selectedChild?.name}'s latest gaming achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {gameScores.slice(0, 4).map((score) => {
                        const game = availableGames.find(g => g.id === score.gameId);
                        if (!game) return null;
                        
                        return (
                          <div
                            key={score.id}
                            className="p-4 border rounded-lg"
                            data-testid={`score-${score.id}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm" data-testid={`score-game-${score.id}`}>
                                {game.title}
                              </h4>
                              <div className="flex items-center text-accent">
                                <Star className="h-3 w-3 mr-1" />
                                <span className="text-sm font-bold" data-testid={`score-value-${score.id}`}>
                                  {score.score}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1" data-testid={`score-date-${score.id}`}>
                              {new Date(score.playedAt!).toLocaleDateString()}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span data-testid={`score-level-${score.id}`}>Level {score.level}</span>
                              <span data-testid={`score-time-${score.id}`}>{score.timeSpent}m</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Available Games */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {selectedCategory === "all" ? "All Games" : categories.find(c => c.value === selectedCategory)?.label} for {selectedChild?.name}
              </h2>
              
              {availableGames.length === 0 ? (
                <Card className="text-center p-8" data-testid="card-no-games">
                  <CardContent>
                    <Gamepad2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No games available</h3>
                    <p className="text-muted-foreground">
                      No games found for the selected category and age group.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableGames.map((game) => {
                    const stats = getGameStats(game.id);
                    const IconComponent = getCategoryIcon(game.category);
                    
                    return (
                      <Card 
                        key={game.id} 
                        className="service-card hover:shadow-lg transition-all hover:scale-105"
                        data-testid={`card-game-${game.id}`}
                      >
                        <CardHeader>
                          <div className="relative">
                            {game.thumbnailUrl && (
                              <img 
                                src={game.thumbnailUrl} 
                                alt={game.title}
                                className="w-full h-32 object-cover rounded-lg mb-4"
                                data-testid={`img-game-${game.id}`}
                              />
                            )}
                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                              <Badge 
                                variant={getCategoryColor(game.category) as any}
                                className="text-xs"
                                data-testid={`badge-category-${game.id}`}
                              >
                                <IconComponent className="h-3 w-3 mr-1" />
                                {game.category}
                              </Badge>
                              <Badge 
                                variant={getDifficultyColor(game.difficulty) as any}
                                className="text-xs"
                                data-testid={`badge-difficulty-${game.id}`}
                              >
                                {game.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-lg" data-testid={`text-game-title-${game.id}`}>
                            {game.title}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs" data-testid={`badge-age-range-${game.id}`}>
                              Ages {game.ageMin}-{game.ageMax}
                            </Badge>
                            {stats && (
                              <div className="flex items-center">
                                <Trophy className="mr-1 h-3 w-3 text-accent" />
                                <span data-testid={`text-best-score-${game.id}`}>{stats.bestScore}</span>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4" data-testid={`text-game-description-${game.id}`}>
                            {game.description}
                          </CardDescription>
                          
                          {game.learningObjectives && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-2">Learning Goals:</h4>
                              <div className="flex flex-wrap gap-1">
                                {(game.learningObjectives as string[]).map((objective, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="secondary" 
                                    className="text-xs"
                                    data-testid={`badge-objective-${game.id}-${index}`}
                                  >
                                    {objective}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {stats && (
                            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground">
                                <div className="flex justify-between">
                                  <span>Games Played:</span>
                                  <span data-testid={`text-total-plays-${game.id}`}>{stats.totalPlays}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Average Score:</span>
                                  <span data-testid={`text-avg-score-${game.id}`}>{stats.avgScore.toFixed(0)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <Button 
                            onClick={() => handlePlayGame(game)}
                            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                            data-testid={`button-play-game-${game.id}`}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Play Game
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
        <div className="bg-muted/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Learning Through Play
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Math Skills</h3>
              <p className="text-sm text-muted-foreground">
                Build number sense and problem-solving abilities through engaging math challenges.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Science Discovery</h3>
              <p className="text-sm text-muted-foreground">
                Explore scientific concepts through interactive experiments and simulations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Reading Comprehension</h3>
              <p className="text-sm text-muted-foreground">
                Improve vocabulary and reading skills through word games and stories.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="font-semibold mb-2">Critical Thinking</h3>
              <p className="text-sm text-muted-foreground">
                Develop logical reasoning through puzzles and strategic challenges.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Play Dialog */}
      <Dialog open={isGameDialogOpen} onOpenChange={setIsGameDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-game-play">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Gamepad2 className="mr-2 h-6 w-6" />
              {selectedGame?.title}
            </DialogTitle>
            <DialogDescription>
              Record your game session results
            </DialogDescription>
          </DialogHeader>
          
          {selectedGame && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Play className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{selectedGame.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{selectedGame.description}</p>
                    <p className="text-xs text-muted-foreground">Game would be playable here</p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="score">Score Achieved</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="1000"
                    value={gameScore}
                    onChange={(e) => setGameScore(parseInt(e.target.value) || 0)}
                    className="mt-2"
                    data-testid="input-game-score"
                  />
                </div>
                
                <div>
                  <Label htmlFor="level">Level Reached</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="10"
                    value={gameLevel}
                    onChange={(e) => setGameLevel(parseInt(e.target.value) || 1)}
                    className="mt-2"
                    data-testid="input-game-level"
                  />
                </div>
                
                <div>
                  <Label htmlFor="time">Time Spent (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    min="1"
                    max="60"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(parseInt(e.target.value) || 1)}
                    className="mt-2"
                    data-testid="input-time-spent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsGameDialogOpen(false)}
                  data-testid="button-cancel-game"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveScore}
                  disabled={saveScoreMutation.isPending || gameScore === 0}
                  data-testid="button-save-score"
                >
                  {saveScoreMutation.isPending ? "Saving..." : "Save Score"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
