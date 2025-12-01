import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface MathPuzzlesProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface MathPuzzle {
  question: string;
  answer: number;
  options: number[];
  explanation: string;
  type: string;
}

const generatePuzzle = (level: DifficultyLevel): MathPuzzle => {
  const puzzleTypes = [
    () => {
      const a = Math.floor(Math.random() * 10 * level) + 1;
      const b = Math.floor(Math.random() * 10 * level) + 1;
      const answer = a + b;
      return {
        question: `🍎 If you have ${a} apples and get ${b} more, how many apples do you have?`,
        answer,
        options: generateOptions(answer),
        explanation: `${a} + ${b} = ${answer}`,
        type: 'Word Problem'
      };
    },
    () => {
      const blank = Math.floor(Math.random() * 10) + 1;
      const result = blank + Math.floor(Math.random() * 10) + 1;
      const other = result - blank;
      return {
        question: `🔢 What number goes in the blank? ___ + ${other} = ${result}`,
        answer: blank,
        options: generateOptions(blank),
        explanation: `${blank} + ${other} = ${result}`,
        type: 'Missing Number'
      };
    },
    () => {
      const total = Math.floor(Math.random() * 20 * level) + 10;
      const part = Math.floor(Math.random() * total);
      const answer = total - part;
      return {
        question: `🎈 You had ${total} balloons. ${part} flew away. How many are left?`,
        answer,
        options: generateOptions(answer),
        explanation: `${total} - ${part} = ${answer}`,
        type: 'Subtraction'
      };
    },
    () => {
      const groups = Math.floor(Math.random() * 5) + 2;
      const perGroup = Math.floor(Math.random() * 5 * level) + 1;
      const answer = groups * perGroup;
      return {
        question: `🍪 If you have ${groups} bags with ${perGroup} cookies each, how many cookies total?`,
        answer,
        options: generateOptions(answer),
        explanation: `${groups} × ${perGroup} = ${answer}`,
        type: 'Multiplication'
      };
    },
    () => {
      const divisor = Math.floor(Math.random() * 5) + 2;
      const quotient = Math.floor(Math.random() * 5 * level) + 1;
      const total = divisor * quotient;
      return {
        question: `🍬 Share ${total} candies equally among ${divisor} friends. How many does each get?`,
        answer: quotient,
        options: generateOptions(quotient),
        explanation: `${total} ÷ ${divisor} = ${quotient}`,
        type: 'Division'
      };
    },
  ];

  const easyTypes = [0, 1, 2];
  const medTypes = [0, 1, 2, 3];
  const hardTypes = [0, 1, 2, 3, 4];
  
  let availableTypes;
  if (level <= 2) availableTypes = easyTypes;
  else if (level <= 3) availableTypes = medTypes;
  else availableTypes = hardTypes;
  
  const typeIndex = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  return puzzleTypes[typeIndex]();
};

const generateOptions = (correct: number): number[] => {
  const options = new Set<number>([correct]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const option = Math.max(0, correct + offset);
    if (option !== correct) options.add(option);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

export default function MathPuzzles({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: MathPuzzlesProps) {
  const puzzleCounts = { 1: 5, 2: 6, 3: 7, 4: 8, 5: 10 };
  const puzzleCount = puzzleCounts[level];
  
  const [currentPuzzle, setCurrentPuzzle] = useState<MathPuzzle | null>(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);

  const nextPuzzle = useCallback(() => {
    setCurrentPuzzle(generatePuzzle(level));
    setSelectedAnswer(null);
    setFeedback(null);
  }, [level]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      nextPuzzle();
    }
  }, [isPlaying, puzzleIndex]);

  const handleAnswer = (answer: number) => {
    if (feedback || isPaused || !currentPuzzle) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentPuzzle.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      addScore(15 * level + streak * 3);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setGameOver(true), 1500);
        return;
      }
    }
    
    setTimeout(() => {
      if (puzzleIndex + 1 >= puzzleCount) {
        setGameOver(true);
      } else {
        setPuzzleIndex(prev => prev + 1);
      }
    }, 2000);
  };

  const progress = ((puzzleIndex + 1) / puzzleCount) * 100;

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Puzzle</p>
          <p className="text-2xl font-bold text-emerald-600">{puzzleIndex + 1}/{puzzleCount}</p>
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

      <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentPuzzle && (
        <>
          <div className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔣</span>
              <span className="text-sm font-medium text-emerald-700">{currentPuzzle.type}</span>
            </div>
            <p className="text-lg font-medium text-gray-700">{currentPuzzle.question}</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mb-6">
            {currentPuzzle.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={!!feedback || isPaused}
                className={`
                  px-6 py-4 rounded-xl text-2xl font-bold transition-all
                  ${feedback && option === currentPuzzle.answer ? 'bg-green-500 text-white ring-4 ring-green-300' : ''}
                  ${feedback === 'wrong' && selectedAnswer === option ? 'bg-red-500 text-white' : ''}
                  ${!feedback ? 'bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50' : ''}
                  ${feedback && option !== currentPuzzle.answer && option !== selectedAnswer ? 'opacity-50' : ''}
                `}
              >
                {option}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`w-full p-4 rounded-xl text-center ${feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                {feedback === 'correct' ? '🎉 Correct!' : '❌ Not quite!'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                💡 {currentPuzzle.explanation}
              </p>
            </div>
          )}
        </>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {puzzleCount} puzzles
      </p>
    </div>
  );
}
