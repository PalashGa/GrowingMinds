import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface NumberSequenceProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Sequence {
  numbers: number[];
  answer: number;
  pattern: string;
  hint: string;
}

const generateSequence = (level: DifficultyLevel): Sequence => {
  const patterns = [
    () => {
      const start = Math.floor(Math.random() * 10) + 1;
      const step = Math.floor(Math.random() * 5) + 1;
      const nums = Array.from({ length: 5 }, (_, i) => start + step * i);
      return { numbers: nums.slice(0, 4), answer: nums[4], pattern: `Add ${step}`, hint: `+${step}` };
    },
    () => {
      const start = Math.floor(Math.random() * 5) + 2;
      const nums = Array.from({ length: 5 }, (_, i) => start * Math.pow(2, i));
      return { numbers: nums.slice(0, 4), answer: nums[4], pattern: 'Double each time', hint: '×2' };
    },
    () => {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      const nums = [a, b];
      for (let i = 2; i < 6; i++) {
        nums.push(nums[i - 1] + nums[i - 2]);
      }
      return { numbers: nums.slice(0, 5), answer: nums[5], pattern: 'Fibonacci-like', hint: 'sum of prev 2' };
    },
    () => {
      const base = Math.floor(Math.random() * 3) + 1;
      const nums = Array.from({ length: 5 }, (_, i) => base * (i + 1) * (i + 1));
      return { numbers: nums.slice(0, 4), answer: nums[4], pattern: 'Squares', hint: 'n²' };
    },
    () => {
      const start = Math.floor(Math.random() * 50) + 50;
      const step = Math.floor(Math.random() * 5) + 3;
      const nums = Array.from({ length: 5 }, (_, i) => start - step * i);
      return { numbers: nums.slice(0, 4), answer: nums[4], pattern: `Subtract ${step}`, hint: `-${step}` };
    },
  ];
  
  const easyPatterns = [0, 4];
  const medPatterns = [0, 1, 4];
  const hardPatterns = [0, 1, 2, 3, 4];
  
  let availablePatterns;
  if (level <= 2) availablePatterns = easyPatterns;
  else if (level <= 3) availablePatterns = medPatterns;
  else availablePatterns = hardPatterns;
  
  const patternIndex = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
  return patterns[patternIndex]();
};

export default function NumberSequence({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: NumberSequenceProps) {
  const questionCounts = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8 };
  const showHints = { 1: true, 2: true, 3: false, 4: false, 5: false };
  
  const questionCount = questionCounts[level];
  const showHint = showHints[level];
  
  const [currentSequence, setCurrentSequence] = useState<Sequence | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);

  const nextQuestion = useCallback(() => {
    setCurrentSequence(generateSequence(level));
    setUserAnswer('');
    setFeedback(null);
  }, [level]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      nextQuestion();
    }
  }, [isPlaying, questionIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSequence || feedback || isPaused) return;
    
    const answer = parseInt(userAnswer);
    const correct = answer === currentSequence.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      addScore(15 * level + streak * 5);
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
      if (questionIndex + 1 >= questionCount) {
        setGameOver(true);
      } else {
        setQuestionIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const progress = ((questionIndex + 1) / questionCount) * 100;

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Question</p>
          <p className="text-2xl font-bold text-pink-600">{questionIndex + 1}/{questionCount}</p>
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
          className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-4">
        <p className="text-center text-lg font-medium">
          🔢 What number comes next?
        </p>
      </div>

      {currentSequence && (
        <>
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            {currentSequence.numbers.map((num, i) => (
              <div 
                key={i}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center text-xl font-bold shadow-lg"
              >
                {num}
              </div>
            ))}
            <div 
              className={`
                w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold
                ${feedback === 'correct' ? 'bg-green-500 text-white' : 
                  feedback === 'wrong' ? 'bg-red-500 text-white' : 
                  'border-4 border-dashed border-pink-300 text-pink-400'}
              `}
            >
              {feedback ? currentSequence.answer : '?'}
            </div>
          </div>

          {showHint && !feedback && (
            <p className="text-sm text-muted-foreground mb-4 text-center">
              💡 Hint: {currentSequence.hint}
            </p>
          )}

          <form onSubmit={handleSubmit} className="w-full flex gap-3">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer"
              className="flex-1 px-4 py-3 text-lg border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none text-center"
              disabled={!!feedback || isPaused}
              autoFocus
            />
            <button
              type="submit"
              disabled={!userAnswer || !!feedback || isPaused}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
            >
              Check
            </button>
          </form>

          {feedback && (
            <div className={`mt-6 p-4 rounded-xl w-full text-center ${feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className={`font-bold ${feedback === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                {feedback === 'correct' ? '🎉 Correct!' : `❌ The answer was ${currentSequence.answer}`}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Pattern: {currentSequence.pattern}
              </p>
            </div>
          )}
        </>
      )}

      <p className="mt-6 text-sm text-muted-foreground text-center">
        Level {level}: {questionCount} sequences{showHint ? ' with hints' : ' (no hints)'}
      </p>
    </div>
  );
}
