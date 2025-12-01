import { useState, useEffect, useCallback, useRef } from 'react';
import { DifficultyLevel } from './types';

interface MathArcadeProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface FallingProblem {
  id: number;
  question: string;
  answer: number;
  x: number;
  y: number;
  speed: number;
}

export default function MathArcade({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: MathArcadeProps) {
  const maxNumbers = { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30 };
  const speeds = { 1: 0.3, 2: 0.4, 3: 0.5, 4: 0.6, 5: 0.7 };
  
  const maxNum = maxNumbers[level];
  const baseSpeed = speeds[level];
  
  const [problems, setProblems] = useState<FallingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<FallingProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [streak, setStreak] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateProblem = useCallback((): FallingProblem => {
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;
    
    if (op === '+') {
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
    }
    
    return {
      id: nextId.current++,
      question: `${a} ${op} ${b}`,
      answer,
      x: Math.random() * 80 + 10,
      y: 0,
      speed: baseSpeed + Math.random() * 0.15
    };
  }, [maxNum, baseSpeed]);

  useEffect(() => {
    if (!isPlaying || isPaused) return;
    
    const spawnInterval = setInterval(() => {
      setProblems(prev => [...prev, generateProblem()]);
    }, 2500 - level * 300);
    
    return () => clearInterval(spawnInterval);
  }, [isPlaying, isPaused, generateProblem, level]);

  useEffect(() => {
    if (!isPlaying || isPaused) return;
    
    const moveInterval = setInterval(() => {
      setProblems(prev => {
        const updated = prev.map(p => ({
          ...p,
          y: p.y + p.speed
        }));
        
        const missed = updated.filter(p => p.y >= 90);
        if (missed.length > 0) {
          setMissedCount(c => {
            const newCount = c + missed.length;
            if (newCount >= 3) {
              setGameOver(true);
            }
            return newCount;
          });
          setCombo(0);
        }
        
        return updated.filter(p => p.y < 90);
      });
    }, 50);
    
    return () => clearInterval(moveInterval);
  }, [isPlaying, isPaused, setGameOver]);

  const handleProblemClick = (problem: FallingProblem) => {
    setSelectedProblem(problem);
    setUserAnswer('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem || !userAnswer) return;
    
    const answer = parseInt(userAnswer);
    if (answer === selectedProblem.answer) {
      const points = (10 + combo * 2) * level;
      addScore(points);
      setStreak(prev => prev + 1);
      setCombo(prev => prev + 1);
      setProblems(prev => prev.filter(p => p.id !== selectedProblem.id));
    } else {
      setCombo(0);
    }
    
    setSelectedProblem(null);
    setUserAnswer('');
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Solved</p>
          <p className="text-2xl font-bold text-cyan-600">{streak}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Combo</p>
          <p className="text-2xl font-bold text-orange-500">🔥 x{combo}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Missed</p>
          <p className="text-2xl font-bold text-red-500">
            {'💔'.repeat(missedCount)}{'❤️'.repeat(3 - missedCount)}
          </p>
        </div>
      </div>

      <div className="mb-4 text-center">
        <p className="text-lg font-medium">
          🎮 Click problems and type the answer!
        </p>
      </div>

      <div className="relative w-full max-w-md h-72 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 rounded-xl overflow-hidden mb-4">
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-red-600 to-transparent opacity-50" />
        
        {problems.map(problem => (
          <button
            key={problem.id}
            onClick={() => handleProblemClick(problem)}
            className={`
              absolute transform -translate-x-1/2 transition-all
              px-3 py-2 rounded-lg font-bold text-lg
              ${selectedProblem?.id === problem.id 
                ? 'bg-yellow-400 text-black ring-4 ring-yellow-300 scale-110 z-10' 
                : 'bg-white text-gray-800 hover:bg-yellow-100'}
              shadow-lg
            `}
            style={{
              left: `${problem.x}%`,
              top: `${problem.y}%`,
            }}
          >
            {problem.question}
          </button>
        ))}

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-3xl">
          🚀
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xs">
        <input
          ref={inputRef}
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder={selectedProblem ? selectedProblem.question : 'Click a problem'}
          className="flex-1 px-4 py-3 text-lg border-2 border-cyan-300 rounded-xl focus:border-cyan-500 focus:outline-none text-center"
          disabled={isPaused || !selectedProblem}
        />
        <button
          type="submit"
          disabled={isPaused || !selectedProblem || !userAnswer}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
        >
          ⏎
        </button>
      </form>

      {selectedProblem && (
        <div className="mt-4 text-center">
          <p className="text-lg font-bold text-cyan-600">
            Solving: {selectedProblem.question} = ?
          </p>
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: Numbers up to {maxNum} • Click to select, type to answer
      </p>
    </div>
  );
}
