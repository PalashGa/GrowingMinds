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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Gamepad2, Play, Trophy, Star, User, Brain, Heart, Puzzle, BookOpen, Target, Palette } from "lucide-react";
import type { Child, GameScore } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

import {
  GameWrapper,
  MemoryMatrix,
  LostInMigration,
  SpeedMatch,
  PetDetective,
  Raindrops,
  EmojiCharades,
  EmotionRecognition,
  CalmBreathing,
  ReflectionGame,
  MazeSolver,
  LogicPuzzles,
  BlockPuzzle,
  NumberSequence,
  QuickMath,
  WordBuilder,
  RiddleChallenge,
  MathPuzzles,
  MathArcade,
  CardMatch,
  PatternMatching,
  HiddenObject,
  RolePlay,
  RobotDesigner,
  HealthyChoices,
  ZenGarden,
  ALL_GAMES,
  GAME_CATEGORIES,
  getGameById,
  getGamesByCategory,
  GameCategory,
  GameResult,
  DifficultyLevel,
} from "@/components/games";

const CATEGORY_ICONS: Record<GameCategory, React.ComponentType<{ className?: string }>> = {
  cognitive: Brain,
  emotional: Heart,
  logic: Puzzle,
  academic: BookOpen,
  memory: Target,
  creative: Palette,
};

export default function Games() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | "all">("all");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const { data: gameScores, error: scoresError } = useQuery<GameScore[]>({
    queryKey: ['/api/children', selectedChildId, 'game-scores'],
    enabled: isAuthenticated && !!selectedChildId,
    retry: false,
  });

  useEffect(() => {
    if ((childrenError && isUnauthorizedError(childrenError)) || 
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
  }, [childrenError, scoresError, toast]);

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

  const filteredGames = selectedCategory === "all" 
    ? ALL_GAMES.filter(game => childAge >= game.ageMin && childAge <= game.ageMax)
    : getGamesByCategory(selectedCategory).filter(game => childAge >= game.ageMin && childAge <= game.ageMax);

  const selectedGame = selectedGameId ? getGameById(selectedGameId) : null;

  const handlePlayGame = (gameId: string) => {
    if (!selectedChildId) {
      toast({
        title: "Select Child",
        description: "Please select a child before playing a game.",
        variant: "destructive",
      });
      return;
    }
    setSelectedGameId(gameId);
    setIsPlaying(true);
  };

  const handleBackToGames = () => {
    setSelectedGameId(null);
    setIsPlaying(false);
  };

  const handleGameComplete = (result: GameResult) => {
    if (!selectedChildId || !selectedGameId) return;
    
    saveScoreMutation.mutate({
      childId: selectedChildId,
      gameId: selectedGameId,
      score: result.score,
      timeSpent: Math.round(result.timeSpent / 60),
      level: result.level,
    });
    
    setIsPlaying(false);
    setSelectedGameId(null);
  };

  const getGameStats = (gameId: string) => {
    const scores = gameScores?.filter(score => score.gameId === gameId) || [];
    if (scores.length === 0) return null;
    
    const bestScore = Math.max(...scores.map(s => s.score));
    const totalPlays = scores.length;
    
    return { bestScore, totalPlays };
  };

  const renderGameComponent = () => {
    if (!selectedGame) return null;
    
    const commonProps = {
      level: 1 as DifficultyLevel,
      isPlaying: true,
      isPaused: false,
      addScore: () => {},
      setGameOver: () => {},
    };

    const gameComponents: Record<string, React.ReactNode> = {
      'memory-matrix': <MemoryMatrix {...commonProps} />,
      'lost-in-migration': <LostInMigration {...commonProps} />,
      'speed-match': <SpeedMatch {...commonProps} />,
      'pet-detective': <PetDetective {...commonProps} />,
      'raindrops': <Raindrops {...commonProps} />,
      'emoji-charades': <EmojiCharades {...commonProps} />,
      'emotion-recognition': <EmotionRecognition {...commonProps} />,
      'calm-breathing': <CalmBreathing {...commonProps} />,
      'reflection-game': <ReflectionGame {...commonProps} />,
      'maze-solver': <MazeSolver {...commonProps} />,
      'logic-puzzles': <LogicPuzzles {...commonProps} />,
      'block-puzzle': <BlockPuzzle {...commonProps} />,
      'number-sequence': <NumberSequence {...commonProps} />,
      'quick-math': <QuickMath {...commonProps} />,
      'word-builder': <WordBuilder {...commonProps} />,
      'riddle-challenge': <RiddleChallenge {...commonProps} />,
      'math-puzzles': <MathPuzzles {...commonProps} />,
      'math-arcade': <MathArcade {...commonProps} />,
      'card-match': <CardMatch {...commonProps} />,
      'pattern-matching': <PatternMatching {...commonProps} />,
      'hidden-object': <HiddenObject {...commonProps} />,
      'role-play': <RolePlay {...commonProps} />,
      'robot-designer': <RobotDesigner {...commonProps} />,
      'healthy-choices': <HealthyChoices {...commonProps} />,
      'zen-garden': <ZenGarden {...commonProps} />,
    };

    return (
      <GameWrapper
        game={selectedGame}
        onBack={handleBackToGames}
        onComplete={handleGameComplete}
      >
        {(props) => {
          const GameComponent = {
            'memory-matrix': MemoryMatrix,
            'lost-in-migration': LostInMigration,
            'speed-match': SpeedMatch,
            'pet-detective': PetDetective,
            'raindrops': Raindrops,
            'emoji-charades': EmojiCharades,
            'emotion-recognition': EmotionRecognition,
            'calm-breathing': CalmBreathing,
            'reflection-game': ReflectionGame,
            'maze-solver': MazeSolver,
            'logic-puzzles': LogicPuzzles,
            'block-puzzle': BlockPuzzle,
            'number-sequence': NumberSequence,
            'quick-math': QuickMath,
            'word-builder': WordBuilder,
            'riddle-challenge': RiddleChallenge,
            'math-puzzles': MathPuzzles,
            'math-arcade': MathArcade,
            'card-match': CardMatch,
            'pattern-matching': PatternMatching,
            'hidden-object': HiddenObject,
            'role-play': RolePlay,
            'robot-designer': RobotDesigner,
            'healthy-choices': HealthyChoices,
            'zen-garden': ZenGarden,
          }[selectedGame.id];

          if (!GameComponent) return <div>Game not found</div>;

          return (
            <GameComponent
              level={props.level}
              isPlaying={props.isPlaying}
              isPaused={props.isPaused}
              addScore={props.addScore}
              setGameOver={props.setGameOver}
            />
          );
        }}
      </GameWrapper>
    );
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

  if (isPlaying && selectedGame) {
    return renderGameComponent();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Educational Games
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            26 interactive games across 6 categories designed to develop cognitive, emotional, and academic skills
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-2 border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-indigo-600" />
                Select Child
              </CardTitle>
              <CardDescription>
                Choose which child will be playing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!children || children.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Create a child profile to start playing games.
                  </p>
                  <Button variant="outline">Create Child Profile</Button>
                </div>
              ) : (
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
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

          {selectedChildId && gameScores && gameScores.length > 0 && (
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>
                  {selectedChild?.name}'s latest scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {gameScores.slice(0, 4).map((score) => {
                    const game = getGameById(score.gameId);
                    return (
                      <div key={score.id} className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                        <span>{game?.icon || '🎮'}</span>
                        <span className="font-bold text-purple-700">{score.score}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Game Categories</h2>
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              Show All ({ALL_GAMES.length})
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(Object.entries(GAME_CATEGORIES) as [GameCategory, typeof GAME_CATEGORIES[GameCategory]][]).map(([key, category]) => {
              const IconComponent = CATEGORY_ICONS[key];
              const gameCount = getGamesByCategory(key).length;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`
                    p-4 rounded-2xl transition-all duration-200 text-left
                    ${selectedCategory === key 
                      ? `${category.bgColor} ring-2 ring-offset-2 ring-${key === 'cognitive' ? 'blue' : key === 'emotional' ? 'green' : key === 'logic' ? 'orange' : key === 'academic' ? 'yellow' : key === 'memory' ? 'red' : 'purple'}-400 shadow-lg` 
                      : 'bg-white hover:shadow-md border border-gray-100'}
                  `}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <IconComponent className={`h-5 w-5 ${category.color}`} />
                  </div>
                  <h3 className={`font-bold ${category.color}`}>{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{gameCount} games</p>
                </button>
              );
            })}
          </div>
        </div>

        {selectedChildId && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {selectedCategory === "all" 
                ? `All Games for ${selectedChild?.name}` 
                : `${GAME_CATEGORIES[selectedCategory].name} Games`}
            </h2>
            
            {filteredGames.length === 0 ? (
              <Card className="text-center p-8">
                <CardContent>
                  <Gamepad2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No games available</h3>
                  <p className="text-muted-foreground">
                    No games found for the selected category and age group.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.map((game) => {
                  const stats = getGameStats(game.id);
                  const category = GAME_CATEGORIES[game.category];
                  
                  return (
                    <Card 
                      key={game.id} 
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0"
                    >
                      <div className={`h-2 ${game.color}`} />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <span className="text-3xl">{game.icon}</span>
                          <Badge className={category.bgColor + ' ' + category.color + ' border-0'}>
                            {category.icon} {game.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2">{game.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4 line-clamp-2">
                          {game.description}
                        </CardDescription>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {game.benefits.slice(0, 3).map((benefit, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="text-xs">
                            Ages {game.ageMin}-{game.ageMax}
                          </Badge>
                          {stats && (
                            <div className="flex items-center gap-1 text-sm">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="font-bold">{stats.bestScore}</span>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => handlePlayGame(game.id)}
                          className={`w-full ${game.color} hover:opacity-90 text-white`}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Play Now
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!selectedChildId && (
          <Card className="text-center p-12 border-2 border-dashed">
            <CardContent>
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Select a Child to Start</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choose a child from the dropdown above to see age-appropriate games and track their progress.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Why Educational Games Matter
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="font-bold mb-2">Cognitive Development</h3>
              <p className="text-sm text-white/80">
                Games that boost memory, attention, and problem-solving skills
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-bold mb-2">Emotional Intelligence</h3>
              <p className="text-sm text-white/80">
                Activities that help children understand and manage emotions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="font-bold mb-2">Academic Excellence</h3>
              <p className="text-sm text-white/80">
                Fun ways to strengthen math, reading, and language skills
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
