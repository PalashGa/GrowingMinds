import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface SpeedMatchProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

const SYMBOLS = ['🌟', '🌙', '⭐', '☀️', '🔶', '🔷', '💎', '🎯', '🔮', '🎪'];

export default function SpeedMatch({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: SpeedMatchProps) {
  const symbolCounts = { 1: 4, 2: 5, 3: 6, 4: 8, 5: 10 };
  const matchBackCounts = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3 };
  
  const symbolCount = symbolCounts[level];
  const matchBack = matchBackCounts[level];
  const availableSymbols = SYMBOLS.slice(0, symbolCount);
  
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [waitingForInput, setWaitingForInput] = useState(false);

  const generateNextSymbol = useCallback(() => {
    const isMatch = round >= matchBack && Math.random() < 0.4;
    let newSymbol: string;
    
    if (isMatch && history.length >= matchBack) {
      newSymbol = history[history.length - matchBack];
    } else {
      const options = availableSymbols.filter(s => 
        history.length < matchBack || s !== history[history.length - matchBack]
      );
      newSymbol = options[Math.floor(Math.random() * options.length)];
    }
    
    return newSymbol;
  }, [round, matchBack, history, availableSymbols]);

  const nextRound = useCallback(() => {
    const symbol = generateNextSymbol();
    setCurrentSymbol(symbol);
    setWaitingForInput(true);
    setFeedback(null);
  }, [generateNextSymbol]);

  useEffect(() => {
    if (isPlaying && !isPaused && round === 0) {
      nextRound();
    }
  }, [isPlaying, isPaused]);

  const handleResponse = (isMatch: boolean) => {
    if (!waitingForInput || feedback || isPaused) return;
    
    const actualMatch = round >= matchBack && 
      history.length >= matchBack && 
      currentSymbol === history[history.length - matchBack];
    
    const correct = isMatch === actualMatch;
    
    setWaitingForInput(false);
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      const points = 10 * level + streak * 2;
      addScore(points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    setTimeout(() => {
      setHistory(prev => [...prev, currentSymbol]);
      setRound(prev => prev + 1);
      nextRound();
    }, 300);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Round</p>
          <p className="text-2xl font-bold text-indigo-600">{round}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Match Back</p>
          <p className="text-2xl font-bold text-purple-500">{matchBack}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-center text-lg font-medium">
          ⚡ Does this match {matchBack} symbol{matchBack > 1 ? 's' : ''} ago?
        </p>
      </div>

      <div className="relative mb-6">
        <div className={`
          w-32 h-32 rounded-2xl flex items-center justify-center text-6xl
          ${feedback === 'correct' ? 'bg-green-100 ring-4 ring-green-500' :
            feedback === 'wrong' ? 'bg-red-100 ring-4 ring-red-500' :
            'bg-gradient-to-br from-indigo-100 to-purple-100'}
          transition-all duration-200
        `}>
          {currentSymbol}
        </div>
        {feedback && (
          <div className="absolute -top-2 -right-2 text-2xl">
            {feedback === 'correct' ? '✅' : '❌'}
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => handleResponse(true)}
          disabled={!waitingForInput || !!feedback || isPaused}
          className={`
            px-8 py-4 rounded-xl text-lg font-bold transition-all
            ${waitingForInput && !feedback ? 
              'bg-green-500 hover:bg-green-600 text-white cursor-pointer' : 
              'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          ✓ Match!
        </button>
        <button
          onClick={() => handleResponse(false)}
          disabled={!waitingForInput || !!feedback || isPaused}
          className={`
            px-8 py-4 rounded-xl text-lg font-bold transition-all
            ${waitingForInput && !feedback ? 
              'bg-red-500 hover:bg-red-600 text-white cursor-pointer' : 
              'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          ✗ No Match
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-sm text-muted-foreground">Recent:</span>
        <div className="flex gap-1">
          {history.slice(-5).map((symbol, i) => (
            <div 
              key={i} 
              className={`
                w-8 h-8 rounded flex items-center justify-center text-lg
                ${i === history.slice(-5).length - matchBack ? 'bg-yellow-200 ring-2 ring-yellow-400' : 'bg-gray-100'}
              `}
            >
              {symbol}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: Match {matchBack}-back with {symbolCount} different symbols
      </p>
    </div>
  );
}
