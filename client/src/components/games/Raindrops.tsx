import { useState, useEffect, useCallback, useRef } from 'react';
import { DifficultyLevel } from './types';

interface RaindropsProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Raindrop {
  id: number;
  problem: string;
  answer: number;
  x: number;
  y: number;
  speed: number;
}

export default function Raindrops({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: RaindropsProps) {
  const maxNumbers = { 1: 10, 2: 20, 3: 50, 4: 100, 5: 100 };
  const operations = { 1: ['+'], 2: ['+', '-'], 3: ['+', '-'], 4: ['+', '-', '×'], 5: ['+', '-', '×', '÷'] };
  const speeds = { 1: 0.3, 2: 0.4, 3: 0.5, 4: 0.6, 5: 0.8 };
  
  const maxNum = maxNumbers[level];
  const ops = operations[level];
  const baseSpeed = speeds[level];
  
  const [raindrops, setRaindrops] = useState<Raindrop[]>([]);
  const [input, setInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const generateProblem = useCallback(() => {
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, answer: number, problem: string;
    
    switch (op) {
      case '+':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        answer = a + b;
        problem = `${a} + ${b}`;
        break;
      case '-':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        problem = `${a} - ${b}`;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        problem = `${a} × ${b}`;
        break;
      case '÷':
        b = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        a = b * answer;
        problem = `${a} ÷ ${b}`;
        break;
      default:
        a = 1; b = 1; answer = 2; problem = '1 + 1';
    }
    
    return { problem, answer };
  }, [maxNum, ops]);

  const spawnRaindrop = useCallback(() => {
    const { problem, answer } = generateProblem();
    const raindrop: Raindrop = {
      id: nextId.current++,
      problem,
      answer,
      x: Math.random() * 80 + 10,
      y: 0,
      speed: baseSpeed + Math.random() * 0.2
    };
    setRaindrops(prev => [...prev, raindrop]);
  }, [generateProblem, baseSpeed]);

  useEffect(() => {
    if (!isPlaying || isPaused) return;
    
    const spawnInterval = setInterval(() => {
      spawnRaindrop();
    }, 3000 - level * 400);
    
    return () => clearInterval(spawnInterval);
  }, [isPlaying, isPaused, spawnRaindrop, level]);

  useEffect(() => {
    if (!isPlaying || isPaused) return;
    
    const moveInterval = setInterval(() => {
      setRaindrops(prev => {
        const updated = prev.map(drop => ({
          ...drop,
          y: drop.y + drop.speed
        }));
        
        const missed = updated.filter(drop => drop.y >= 100);
        if (missed.length > 0) {
          setMissedCount(prev => {
            const newCount = prev + missed.length;
            if (newCount >= 3) {
              setGameOver(true);
            }
            return newCount;
          });
          setStreak(0);
        }
        
        return updated.filter(drop => drop.y < 100);
      });
    }, 50);
    
    return () => clearInterval(moveInterval);
  }, [isPlaying, isPaused, setGameOver]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const answer = parseInt(input);
    const matchingDrop = raindrops.find(drop => drop.answer === answer);
    
    if (matchingDrop) {
      const points = Math.max(10, 20 - Math.floor(matchingDrop.y / 5)) * level;
      addScore(points);
      setStreak(prev => prev + 1);
      setRaindrops(prev => prev.filter(drop => drop.id !== matchingDrop.id));
    }
    
    setInput('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (isPlaying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Missed</p>
          <p className="text-2xl font-bold text-red-500">
            {'💧'.repeat(3 - missedCount)}{'💨'.repeat(missedCount)}
          </p>
        </div>
      </div>

      <div 
        ref={gameAreaRef}
        className="relative w-full max-w-md h-80 bg-gradient-to-b from-sky-300 via-sky-200 to-green-300 rounded-xl overflow-hidden mb-4"
      >
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-500" />
        
        {raindrops.map(drop => (
          <div
            key={drop.id}
            className="absolute transform -translate-x-1/2 transition-none"
            style={{ 
              left: `${drop.x}%`, 
              top: `${drop.y}%`,
            }}
          >
            <div className="relative">
              <div className="text-4xl">💧</div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded text-sm font-bold shadow whitespace-nowrap">
                {drop.problem}
              </div>
            </div>
          </div>
        ))}
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-4xl">
          🏠
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xs">
        <input
          ref={inputRef}
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type answer..."
          className="flex-1 px-4 py-3 text-lg border-2 rounded-xl focus:border-cyan-500 focus:outline-none text-center"
          disabled={isPaused}
        />
        <button
          type="submit"
          disabled={isPaused || !input}
          className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 disabled:opacity-50"
        >
          ⏎
        </button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {ops.join(', ')} with numbers up to {maxNum}
      </p>
    </div>
  );
}
