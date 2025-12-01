import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Play, Pause, RotateCcw, Trophy, Clock, Star, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { GameConfig, DifficultyLevel, GameResult, getLevelConfig } from './types';

interface GameWrapperProps {
  game: GameConfig;
  onBack: () => void;
  onComplete: (result: GameResult) => void;
  children: (props: {
    level: DifficultyLevel;
    isPlaying: boolean;
    isPaused: boolean;
    score: number;
    setScore: (score: number) => void;
    addScore: (points: number) => void;
    timeLeft: number;
    gameOver: boolean;
    setGameOver: (over: boolean) => void;
    startGame: () => void;
    levelConfig: ReturnType<typeof getLevelConfig>;
  }) => React.ReactNode;
  maxTime?: number;
  showTimer?: boolean;
}

export default function GameWrapper({ 
  game, 
  onBack, 
  onComplete, 
  children,
  maxTime = 60,
  showTimer = true
}: GameWrapperProps) {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(0);

  const levelConfig = getLevelConfig(level);
  const adjustedMaxTime = Math.round(maxTime * levelConfig.timeMultiplier);

  useEffect(() => {
    const saved = localStorage.getItem(`highscore-${game.id}-${level}`);
    if (saved) setHighScore(parseInt(saved));
  }, [game.id, level]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isPaused && !gameOver && showTimer) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isPaused, gameOver, showTimer]);

  useEffect(() => {
    if (gameOver && !showResults) {
      setShowResults(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem(`highscore-${game.id}-${level}`, score.toString());
      }
    }
  }, [gameOver, showResults, score, highScore, game.id, level]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setIsPaused(false);
    setScore(0);
    setTimeLeft(adjustedMaxTime);
    setTimeElapsed(0);
    setGameOver(false);
    setShowResults(false);
  }, [adjustedMaxTime]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setScore(0);
    setTimeLeft(adjustedMaxTime);
    setTimeElapsed(0);
    setGameOver(false);
    setShowResults(false);
  };

  const addScore = (points: number) => {
    setScore(prev => prev + points);
  };

  const handleComplete = () => {
    onComplete({
      score,
      level,
      timeSpent: timeElapsed,
    });
    resetGame();
  };

  const handleNextLevel = () => {
    if (level < 5) {
      setLevel((level + 1) as DifficultyLevel);
    }
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Card className="mb-6 overflow-hidden">
          <div className={`h-2 ${game.color}`} />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{game.icon}</span>
                <div>
                  <CardTitle className="text-xl">{game.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Best: {highScore}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Level:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((l) => (
                    <Button
                      key={l}
                      variant={level === l ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (!isPlaying) setLevel(l as DifficultyLevel);
                      }}
                      disabled={isPlaying}
                      className="w-8 h-8 p-0"
                    >
                      {l}
                    </Button>
                  ))}
                </div>
                <Badge className={levelConfig.color}>{levelConfig.name}</Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">{score}</span>
                </div>
                {showTimer && (
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-bold">{timeLeft}s</span>
                  </div>
                )}
              </div>
            </div>

            {showTimer && isPlaying && (
              <Progress 
                value={(timeLeft / adjustedMaxTime) * 100} 
                className="h-2 mb-4"
              />
            )}

            {!isPlaying ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
                <span className="text-6xl mb-4">{game.icon}</span>
                <h3 className="text-xl font-bold mb-2">Ready to Play?</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  Level {level} - {levelConfig.name}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {game.benefits.map((benefit, i) => (
                    <Badge key={i} variant="secondary">{benefit}</Badge>
                  ))}
                </div>
                <Button onClick={startGame} size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Start Game
                </Button>
              </div>
            ) : (
              <div className="relative">
                {isPaused && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                    <div className="text-center">
                      <Pause className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <h3 className="text-xl font-bold mb-4">Game Paused</h3>
                      <Button onClick={togglePause}>Resume</Button>
                    </div>
                  </div>
                )}
                
                <div className="min-h-[400px]">
                  {children({
                    level,
                    isPlaying,
                    isPaused,
                    score,
                    setScore,
                    addScore,
                    timeLeft,
                    gameOver,
                    setGameOver,
                    startGame,
                    levelConfig,
                  })}
                </div>

                {!gameOver && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button variant="outline" onClick={togglePause}>
                      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" onClick={resetGame}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                {score > highScore ? '🎉 New High Score!' : '🏆 Game Complete!'}
              </DialogTitle>
              <DialogDescription className="text-center">
                You finished Level {level} - {levelConfig.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="text-center mb-6">
                <span className="text-5xl">{game.icon}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-xl text-center">
                  <Star className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                  <p className="text-2xl font-bold">{score}</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-xl text-center">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-2xl font-bold">{timeElapsed}s</p>
                  <p className="text-sm text-muted-foreground">Time</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleComplete} className="w-full">
                  Save Score & Exit
                </Button>
                <Button variant="outline" onClick={startGame} className="w-full">
                  Play Again
                </Button>
                {level < 5 && (
                  <Button variant="secondary" onClick={handleNextLevel} className="w-full">
                    Try Level {level + 1}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
