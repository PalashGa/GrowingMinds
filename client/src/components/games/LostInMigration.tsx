import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface LostInMigrationProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

const BIRD_DIRECTIONS = ['←', '→', '↑', '↓'];

export default function LostInMigration({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: LostInMigrationProps) {
  const birdCounts = { 1: 5, 2: 7, 3: 9, 4: 12, 5: 16 };
  const distractorCounts = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
  
  const birdCount = birdCounts[level];
  const distractorCount = distractorCounts[level];
  
  const [birds, setBirds] = useState<{ direction: string; isOdd: boolean; color: string }[]>([]);
  const [oddBirdIndex, setOddBirdIndex] = useState(-1);
  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [lives, setLives] = useState(3);

  const colors = ['text-blue-500', 'text-green-500', 'text-purple-500', 'text-orange-500'];

  const generateBirds = useCallback(() => {
    const mainDirection = BIRD_DIRECTIONS[Math.floor(Math.random() * BIRD_DIRECTIONS.length)];
    const oddDirection = BIRD_DIRECTIONS.filter(d => d !== mainDirection)[Math.floor(Math.random() * 3)];
    const oddIndex = Math.floor(Math.random() * birdCount);
    const mainColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newBirds = Array.from({ length: birdCount }).map((_, i) => {
      let direction = mainDirection;
      let isOdd = false;
      let color = mainColor;
      
      if (i === oddIndex) {
        direction = oddDirection;
        isOdd = true;
      }
      
      if (i < distractorCount && i !== oddIndex) {
        color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      return { direction, isOdd, color };
    });
    
    setBirds(newBirds);
    setOddBirdIndex(oddIndex);
    setFeedback(null);
  }, [birdCount, distractorCount]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      generateBirds();
    }
  }, [isPlaying, round, generateBirds, isPaused]);

  const handleBirdClick = (index: number) => {
    if (feedback || isPaused) return;
    
    if (index === oddBirdIndex) {
      setFeedback('correct');
      const points = 10 * level + streak * 2;
      addScore(points);
      setStreak(prev => prev + 1);
      setTimeout(() => {
        setRound(prev => prev + 1);
      }, 500);
    } else {
      setFeedback('wrong');
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setGameOver(true), 1000);
      } else {
        setTimeout(() => {
          generateBirds();
        }, 1000);
      }
    }
  };

  const getBirdSize = () => {
    if (birdCount <= 7) return 'text-4xl';
    if (birdCount <= 12) return 'text-3xl';
    return 'text-2xl';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Round</p>
          <p className="text-2xl font-bold text-sky-600">{round}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Lives</p>
          <p className="text-2xl font-bold">
            {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-center text-lg font-medium">
          🐦 Find the bird flying the wrong way!
        </p>
      </div>

      <div className="relative bg-gradient-to-b from-sky-100 to-sky-200 p-8 rounded-xl min-w-[300px]">
        {feedback === 'correct' && (
          <div className="absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="absolute inset-0 bg-red-500/20 rounded-xl flex items-center justify-center">
            <span className="text-4xl">❌</span>
          </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-3">
          {birds.map((bird, index) => (
            <button
              key={index}
              onClick={() => handleBirdClick(index)}
              disabled={!!feedback || isPaused}
              className={`
                ${getBirdSize()} p-2 rounded-lg transition-all
                ${bird.color}
                ${feedback && bird.isOdd ? 'ring-4 ring-yellow-400 bg-yellow-100' : ''}
                ${!feedback ? 'hover:bg-white/50 cursor-pointer' : 'cursor-default'}
                transform hover:scale-110
              `}
              style={{
                transform: bird.direction === '→' ? 'scaleX(1)' :
                           bird.direction === '←' ? 'scaleX(-1)' :
                           bird.direction === '↑' ? 'rotate(-90deg)' : 'rotate(90deg)'
              }}
            >
              🐦
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {birdCount} birds with {distractorCount} color distractors
      </p>
    </div>
  );
}
