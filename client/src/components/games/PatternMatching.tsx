import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface PatternMatchingProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Pattern {
  colors: string[];
  shapes: string[];
}

const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-cyan-500'];
const SHAPES = ['●', '■', '▲', '◆', '★', '♥', '♦', '♠'];

export default function PatternMatching({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: PatternMatchingProps) {
  const patternLengths = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7 };
  const optionCounts = { 1: 3, 2: 4, 3: 4, 4: 5, 5: 6 };
  
  const patternLength = patternLengths[level];
  const optionCount = optionCounts[level];
  
  const [targetPattern, setTargetPattern] = useState<Pattern | null>(null);
  const [options, setOptions] = useState<Pattern[]>([]);
  const [round, setRound] = useState(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);

  const generatePattern = useCallback((): Pattern => {
    const colors = Array.from({ length: patternLength }, () => 
      COLORS[Math.floor(Math.random() * COLORS.length)]
    );
    const shapes = Array.from({ length: patternLength }, () => 
      SHAPES[Math.floor(Math.random() * SHAPES.length)]
    );
    return { colors, shapes };
  }, [patternLength]);

  const generateSimilarPattern = useCallback((original: Pattern): Pattern => {
    const changesCount = Math.floor(Math.random() * 2) + 1;
    const colors = [...original.colors];
    const shapes = [...original.shapes];
    
    for (let i = 0; i < changesCount; i++) {
      const pos = Math.floor(Math.random() * patternLength);
      if (Math.random() > 0.5) {
        colors[pos] = COLORS[Math.floor(Math.random() * COLORS.length)];
      } else {
        shapes[pos] = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      }
    }
    
    return { colors, shapes };
  }, [patternLength]);

  const generateRound = useCallback(() => {
    const target = generatePattern();
    const correctIndex = Math.floor(Math.random() * optionCount);
    
    const newOptions: Pattern[] = [];
    for (let i = 0; i < optionCount; i++) {
      if (i === correctIndex) {
        newOptions.push(target);
      } else {
        newOptions.push(generateSimilarPattern(target));
      }
    }
    
    setTargetPattern(target);
    setOptions(newOptions);
    setSelectedOption(null);
    setFeedback(null);
  }, [generatePattern, generateSimilarPattern, optionCount]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      generateRound();
    }
  }, [isPlaying, round]);

  const handleOptionClick = (index: number) => {
    if (feedback || isPaused || !targetPattern) return;
    
    setSelectedOption(index);
    const selected = options[index];
    const correct = 
      JSON.stringify(selected.colors) === JSON.stringify(targetPattern.colors) &&
      JSON.stringify(selected.shapes) === JSON.stringify(targetPattern.shapes);
    
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      addScore(15 * level + streak * 3);
      setStreak(prev => prev + 1);
      setTimeout(() => setRound(prev => prev + 1), 800);
    } else {
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setGameOver(true), 1000);
      } else {
        setTimeout(() => setRound(prev => prev + 1), 1500);
      }
    }
  };

  const renderPattern = (pattern: Pattern, size: 'large' | 'small' = 'small') => {
    const cellSize = size === 'large' ? 'w-10 h-10' : 'w-7 h-7';
    const textSize = size === 'large' ? 'text-xl' : 'text-sm';
    
    return (
      <div className="flex gap-1">
        {pattern.colors.map((color, i) => (
          <div 
            key={i}
            className={`${cellSize} ${color} rounded-lg flex items-center justify-center ${textSize} text-white font-bold`}
          >
            {pattern.shapes[i]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Round</p>
          <p className="text-2xl font-bold text-rose-600">{round}</p>
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
          🎨 Find the matching pattern!
        </p>
      </div>

      {targetPattern && (
        <>
          <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-6 rounded-2xl mb-6">
            <p className="text-sm text-rose-600 font-medium mb-3 text-center">Target Pattern:</p>
            {renderPattern(targetPattern, 'large')}
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {options.map((pattern, index) => {
              const isCorrect = 
                JSON.stringify(pattern.colors) === JSON.stringify(targetPattern.colors) &&
                JSON.stringify(pattern.shapes) === JSON.stringify(targetPattern.shapes);
              
              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  disabled={!!feedback || isPaused}
                  className={`
                    p-4 rounded-xl transition-all flex flex-col items-center gap-2
                    ${feedback && isCorrect ? 'bg-green-100 ring-4 ring-green-400' : ''}
                    ${feedback === 'wrong' && selectedOption === index ? 'bg-red-100 ring-4 ring-red-400' : ''}
                    ${!feedback ? 'bg-white border-2 border-rose-200 hover:border-rose-400' : ''}
                    ${feedback && !isCorrect && selectedOption !== index ? 'opacity-50' : ''}
                  `}
                >
                  <span className="text-sm text-muted-foreground">Option {index + 1}</span>
                  {renderPattern(pattern)}
                </button>
              );
            })}
          </div>
        </>
      )}

      {feedback && (
        <div className={`mt-6 text-center text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
          {feedback === 'correct' ? '🎉 Perfect match!' : '❌ Look more carefully!'}
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {patternLength} elements, {optionCount} options
      </p>
    </div>
  );
}
