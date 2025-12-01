import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface RiddleChallengeProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Riddle {
  question: string;
  answer: string;
  options: string[];
  hint: string;
  category: string;
}

const RIDDLES: Riddle[] = [
  { question: 'I have hands but I cannot clap. What am I?', answer: 'Clock', options: ['Clock', 'Gloves', 'Puppet', 'Tree'], hint: 'I show time', category: 'Objects' },
  { question: 'What has keys but no locks?', answer: 'Piano', options: ['Door', 'Piano', 'Computer', 'Safe'], hint: 'Makes music', category: 'Objects' },
  { question: 'What has a head and a tail but no body?', answer: 'Coin', options: ['Snake', 'Coin', 'Kite', 'Arrow'], hint: 'Found in your pocket', category: 'Objects' },
  { question: 'What gets wetter the more it dries?', answer: 'Towel', options: ['Sponge', 'Paper', 'Towel', 'Cloth'], hint: 'In the bathroom', category: 'Objects' },
  { question: 'I have ears but cannot hear. What am I?', answer: 'Corn', options: ['Corn', 'Rabbit', 'Phone', 'Wall'], hint: 'You can eat it', category: 'Food' },
  { question: 'What can you catch but not throw?', answer: 'Cold', options: ['Ball', 'Fish', 'Cold', 'Butterfly'], hint: 'Makes you sneeze', category: 'Concept' },
  { question: 'What has legs but cannot walk?', answer: 'Table', options: ['Spider', 'Table', 'Horse', 'Robot'], hint: 'In every room', category: 'Furniture' },
  { question: 'What can travel around the world while staying in a corner?', answer: 'Stamp', options: ['Letter', 'Stamp', 'Picture', 'Map'], hint: 'On an envelope', category: 'Objects' },
  { question: 'I have teeth but cannot bite. What am I?', answer: 'Comb', options: ['Shark', 'Comb', 'Saw', 'Zipper'], hint: 'For your hair', category: 'Objects' },
  { question: 'What has a neck but no head?', answer: 'Bottle', options: ['Giraffe', 'Bottle', 'Guitar', 'Vase'], hint: 'Holds liquid', category: 'Objects' },
  { question: 'What is full of holes but still holds water?', answer: 'Sponge', options: ['Net', 'Sponge', 'Basket', 'Strainer'], hint: 'In the kitchen', category: 'Objects' },
  { question: 'What goes up but never comes down?', answer: 'Age', options: ['Balloon', 'Age', 'Smoke', 'Bird'], hint: 'Time-related', category: 'Concept' },
  { question: 'What can you break without touching?', answer: 'Promise', options: ['Glass', 'Promise', 'Record', 'Silence'], hint: 'Made with words', category: 'Concept' },
  { question: 'What has words but never speaks?', answer: 'Book', options: ['Book', 'Radio', 'Phone', 'TV'], hint: 'You read it', category: 'Objects' },
  { question: 'What runs but never walks?', answer: 'Water', options: ['Athlete', 'Water', 'Time', 'Horse'], hint: 'In rivers', category: 'Nature' },
];

export default function RiddleChallenge({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: RiddleChallengeProps) {
  const riddleCounts = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8 };
  const showHints = { 1: true, 2: true, 3: true, 4: false, 5: false };
  
  const riddleCount = riddleCounts[level];
  const showHint = showHints[level];
  
  const [currentRiddle, setCurrentRiddle] = useState<Riddle | null>(null);
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [usedRiddles, setUsedRiddles] = useState<number[]>([]);
  const [revealHint, setRevealHint] = useState(false);

  const generateRiddle = useCallback(() => {
    const availableIndices = RIDDLES.map((_, i) => i).filter(i => !usedRiddles.includes(i));
    if (availableIndices.length === 0) {
      setUsedRiddles([]);
      return RIDDLES[0];
    }
    
    const index = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedRiddles(prev => [...prev, index]);
    return RIDDLES[index];
  }, [usedRiddles]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      setCurrentRiddle(generateRiddle());
      setSelectedAnswer(null);
      setFeedback(null);
      setRevealHint(false);
    }
  }, [isPlaying, riddleIndex]);

  const handleAnswer = (answer: string) => {
    if (feedback || isPaused || !currentRiddle) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentRiddle.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      const basePoints = 20 * level;
      const hintPenalty = revealHint ? 5 : 0;
      addScore(basePoints - hintPenalty + streak * 3);
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
      if (riddleIndex + 1 >= riddleCount) {
        setGameOver(true);
      } else {
        setRiddleIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const progress = ((riddleIndex + 1) / riddleCount) * 100;

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Riddle</p>
          <p className="text-2xl font-bold text-lime-600">{riddleIndex + 1}/{riddleCount}</p>
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
          className="h-full bg-gradient-to-r from-lime-400 to-green-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentRiddle && (
        <>
          <div className="w-full bg-gradient-to-r from-lime-50 to-emerald-50 p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">❓</span>
              <span className="text-sm font-medium text-lime-700">{currentRiddle.category}</span>
            </div>
            <p className="text-lg font-medium text-gray-700 italic">"{currentRiddle.question}"</p>
            
            {showHint && (
              <button
                onClick={() => setRevealHint(true)}
                disabled={revealHint || !!feedback}
                className="mt-4 text-sm text-lime-600 hover:text-lime-700 underline disabled:opacity-50"
              >
                {revealHint ? `💡 Hint: ${currentRiddle.hint}` : '💡 Need a hint?'}
              </button>
            )}
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mb-6">
            {currentRiddle.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={!!feedback || isPaused}
                className={`
                  px-4 py-4 rounded-xl text-lg font-medium transition-all
                  ${feedback && option === currentRiddle.answer ? 'bg-green-500 text-white ring-4 ring-green-300' : ''}
                  ${feedback === 'wrong' && selectedAnswer === option ? 'bg-red-500 text-white' : ''}
                  ${!feedback ? 'bg-white border-2 border-lime-200 hover:border-lime-400 hover:bg-lime-50' : ''}
                  ${feedback && option !== currentRiddle.answer && option !== selectedAnswer ? 'opacity-50' : ''}
                `}
              >
                {option}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`text-center text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback === 'correct' ? '🎉 Brilliant!' : `❌ The answer was: ${currentRiddle.answer}`}
            </div>
          )}
        </>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {riddleCount} riddles{showHint ? ' with hints' : ' (no hints)'}
      </p>
    </div>
  );
}
