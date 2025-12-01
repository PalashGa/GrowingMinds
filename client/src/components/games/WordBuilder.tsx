import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface WordBuilderProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

const WORD_LISTS: Record<number, string[]> = {
  1: ['CAT', 'DOG', 'SUN', 'HAT', 'BIG', 'RUN', 'RED', 'TOP', 'CUP', 'PEN'],
  2: ['TREE', 'BOOK', 'FISH', 'BIRD', 'PLAY', 'JUMP', 'RAIN', 'STAR', 'MOON', 'FROG'],
  3: ['HAPPY', 'WATER', 'APPLE', 'HOUSE', 'SMILE', 'BEACH', 'CLOUD', 'MUSIC', 'PLANT', 'TIGER'],
  4: ['FRIEND', 'GARDEN', 'PURPLE', 'ORANGE', 'BUTTER', 'MONKEY', 'SCHOOL', 'SUMMER', 'WINTER', 'FLOWER'],
  5: ['RAINBOW', 'BUTTERFLY', 'ELEPHANT', 'DOLPHIN', 'MORNING', 'THUNDER', 'PRINCESS', 'MOUNTAIN', 'TREASURE', 'ADVENTURE']
};

export default function WordBuilder({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: WordBuilderProps) {
  const words = WORD_LISTS[level];
  
  const [targetWord, setTargetWord] = useState('');
  const [scrambledLetters, setScrambledLetters] = useState<{ letter: string; id: number; used: boolean }[]>([]);
  const [builtWord, setBuiltWord] = useState<{ letter: string; id: number }[]>([]);
  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [usedWords, setUsedWords] = useState<number[]>([]);

  const generatePuzzle = useCallback(() => {
    const availableIndices = words.map((_, i) => i).filter(i => !usedWords.includes(i));
    if (availableIndices.length === 0) {
      setUsedWords([]);
      return;
    }
    
    const wordIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const word = words[wordIndex];
    
    const scrambled = word.split('').map((letter, i) => ({ letter, id: i, used: false }));
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    
    setTargetWord(word);
    setScrambledLetters(scrambled);
    setBuiltWord([]);
    setUsedWords(prev => [...prev, wordIndex]);
    setFeedback(null);
    setShowHint(false);
  }, [words, usedWords]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      generatePuzzle();
    }
  }, [isPlaying, round]);

  const handleLetterClick = (letterObj: { letter: string; id: number }) => {
    if (feedback || isPaused) return;
    
    setScrambledLetters(prev => prev.map(l => 
      l.id === letterObj.id ? { ...l, used: true } : l
    ));
    setBuiltWord(prev => [...prev, letterObj]);
  };

  const handleBuiltLetterClick = (letterObj: { letter: string; id: number }) => {
    if (feedback || isPaused) return;
    
    setBuiltWord(prev => prev.filter(l => l.id !== letterObj.id));
    setScrambledLetters(prev => prev.map(l => 
      l.id === letterObj.id ? { ...l, used: false } : l
    ));
  };

  const handleSubmit = () => {
    if (builtWord.length !== targetWord.length || feedback || isPaused) return;
    
    const built = builtWord.map(l => l.letter).join('');
    const correct = built === targetWord;
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      const basePoints = targetWord.length * 5 * level;
      const hintPenalty = hintsUsed * 5;
      const points = Math.max(basePoints - hintPenalty, 10);
      addScore(points);
      setStreak(prev => prev + 1);
      
      setTimeout(() => {
        if (round >= 5 + level) {
          setGameOver(true);
        } else {
          setRound(prev => prev + 1);
          setHintsUsed(0);
        }
      }, 1000);
    } else {
      setStreak(0);
      setTimeout(() => {
        setBuiltWord([]);
        setScrambledLetters(prev => prev.map(l => ({ ...l, used: false })));
        setFeedback(null);
      }, 500);
    }
  };

  const handleHint = () => {
    if (showHint || builtWord.length >= targetWord.length) return;
    
    const nextCorrectLetter = targetWord[builtWord.length];
    const availableLetter = scrambledLetters.find(l => !l.used && l.letter === nextCorrectLetter);
    
    if (availableLetter) {
      setShowHint(true);
      setHintsUsed(prev => prev + 1);
      setTimeout(() => setShowHint(false), 2000);
    }
  };

  const getHintLetter = () => {
    if (!showHint) return null;
    return targetWord[builtWord.length];
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Word</p>
          <p className="text-2xl font-bold text-emerald-600">{round}/{5 + level}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Letters</p>
          <p className="text-2xl font-bold text-purple-600">{targetWord.length}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-center text-lg font-medium">
          📝 Unscramble the letters to make a word!
        </p>
      </div>

      <div className="min-h-16 flex items-center justify-center gap-2 mb-6 p-4 bg-gray-100 rounded-xl w-full max-w-md">
        {builtWord.length === 0 ? (
          <p className="text-gray-400">Click letters below to build the word</p>
        ) : (
          builtWord.map((letterObj, i) => (
            <button
              key={letterObj.id}
              onClick={() => handleBuiltLetterClick(letterObj)}
              className={`
                w-12 h-12 rounded-lg text-xl font-bold transition-all
                ${feedback === 'correct' ? 'bg-green-500 text-white' : 
                  feedback === 'wrong' ? 'bg-red-500 text-white' : 
                  'bg-emerald-500 text-white hover:bg-emerald-600'}
              `}
            >
              {letterObj.letter}
            </button>
          ))
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        {scrambledLetters.map((letterObj) => {
          const isHintLetter = showHint && letterObj.letter === getHintLetter() && !letterObj.used;
          return (
            <button
              key={letterObj.id}
              onClick={() => handleLetterClick(letterObj)}
              disabled={letterObj.used || !!feedback || isPaused}
              className={`
                w-12 h-12 rounded-lg text-xl font-bold transition-all
                ${letterObj.used ? 'opacity-30 cursor-not-allowed bg-gray-300' : 
                  isHintLetter ? 'bg-yellow-400 text-black ring-4 ring-yellow-300 animate-pulse' :
                  'bg-white border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50'}
              `}
            >
              {letterObj.letter}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleHint}
          disabled={showHint || !!feedback || isPaused || hintsUsed >= 3}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50"
        >
          💡 Hint ({3 - hintsUsed} left)
        </button>
        <button
          onClick={handleSubmit}
          disabled={builtWord.length !== targetWord.length || !!feedback || isPaused}
          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-bold hover:from-emerald-600 hover:to-green-600 disabled:opacity-50"
        >
          Check Word ✓
        </button>
      </div>

      {feedback && (
        <div className={`mt-6 text-center text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
          {feedback === 'correct' ? '🎉 Correct!' : '❌ Try again!'}
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {targetWord.length}-letter words
      </p>
    </div>
  );
}
