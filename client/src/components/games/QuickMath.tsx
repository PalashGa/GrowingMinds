import { useState, useEffect, useCallback, useRef } from 'react';
import { DifficultyLevel } from './types';

interface QuickMathProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Problem {
  question: string;
  answer: number;
}

export default function QuickMath({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: QuickMathProps) {
  const maxNumbers = { 1: 10, 2: 20, 3: 50, 4: 100, 5: 100 };
  const operations = { 1: ['+'], 2: ['+', '-'], 3: ['+', '-', '×'], 4: ['+', '-', '×'], 5: ['+', '-', '×', '÷'] };
  
  const maxNum = maxNumbers[level];
  const ops = operations[level];
  
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateProblem = useCallback((): Problem => {
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, answer: number, question: string;
    
    switch (op) {
      case '+':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        answer = a + b;
        question = `${a} + ${b}`;
        break;
      case '-':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        question = `${a} - ${b}`;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        question = `${a} × ${b}`;
        break;
      case '÷':
        b = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        a = b * answer;
        question = `${a} ÷ ${b}`;
        break;
      default:
        a = 1; b = 1; answer = 2; question = '1 + 1';
    }
    
    return { question, answer };
  }, [maxNum, ops]);

  const nextProblem = useCallback(() => {
    setCurrentProblem(generateProblem());
    setUserAnswer('');
    setFeedback(null);
    inputRef.current?.focus();
  }, [generateProblem]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      nextProblem();
    }
  }, [isPlaying, isPaused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProblem || feedback || isPaused) return;
    
    const answer = parseInt(userAnswer);
    const correct = answer === currentProblem.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      const points = 10 * level + streak * 2;
      addScore(points);
      setSolved(prev => prev + 1);
      setStreak(prev => prev + 1);
      setTimeout(() => nextProblem(), 300);
    } else {
      setStreak(0);
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
        inputRef.current?.focus();
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Solved</p>
          <p className="text-2xl font-bold text-yellow-600">{solved}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-center text-lg font-medium">
          ➕ Solve as many as you can!
        </p>
      </div>

      {currentProblem && (
        <div 
          className={`
            bg-gradient-to-br from-yellow-100 to-amber-100 p-8 rounded-2xl mb-6 text-center
            transition-all duration-200
            ${feedback === 'correct' ? 'ring-4 ring-green-400' : ''}
            ${feedback === 'wrong' ? 'ring-4 ring-red-400 animate-shake' : ''}
          `}
        >
          <p className="text-5xl font-bold text-gray-800 mb-2">{currentProblem.question}</p>
          <p className="text-2xl text-yellow-600">= ?</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-xs">
        <input
          ref={inputRef}
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Answer"
          className={`
            flex-1 px-4 py-3 text-2xl border-2 rounded-xl text-center font-bold
            ${feedback === 'correct' ? 'border-green-400 bg-green-50' : ''}
            ${feedback === 'wrong' ? 'border-red-400 bg-red-50' : 'border-yellow-300'}
            focus:outline-none
          `}
          disabled={isPaused}
          autoFocus
        />
        <button
          type="submit"
          disabled={!userAnswer || isPaused}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-amber-600 disabled:opacity-50 text-xl"
        >
          ✓
        </button>
      </form>

      <div className="mt-6 flex gap-2">
        {ops.map((op, i) => (
          <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            {op}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: Numbers up to {maxNum}
      </p>
    </div>
  );
}
