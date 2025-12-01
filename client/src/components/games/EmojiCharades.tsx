import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface EmojiCharadesProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Charade {
  emojis: string;
  answer: string;
  options: string[];
  hint: string;
}

const CHARADES: Charade[] = [
  { emojis: '😊👋', answer: 'Greeting', options: ['Greeting', 'Goodbye', 'Excited', 'Tired'], hint: 'When you meet someone' },
  { emojis: '😢💔', answer: 'Heartbroken', options: ['Happy', 'Heartbroken', 'Angry', 'Surprised'], hint: 'Feeling sad about love' },
  { emojis: '😡🌋', answer: 'Furious', options: ['Calm', 'Furious', 'Sleepy', 'Confused'], hint: 'Very very angry' },
  { emojis: '😱👻', answer: 'Scared', options: ['Brave', 'Scared', 'Happy', 'Bored'], hint: 'Feeling of fear' },
  { emojis: '🥳🎉', answer: 'Celebrating', options: ['Mourning', 'Celebrating', 'Working', 'Sleeping'], hint: 'Party time!' },
  { emojis: '😴💤', answer: 'Sleepy', options: ['Energetic', 'Sleepy', 'Hungry', 'Excited'], hint: 'Need rest' },
  { emojis: '🤔💭', answer: 'Thinking', options: ['Talking', 'Thinking', 'Eating', 'Running'], hint: 'Using your brain' },
  { emojis: '😮🎁', answer: 'Surprised', options: ['Bored', 'Surprised', 'Sad', 'Angry'], hint: 'Unexpected reaction' },
  { emojis: '🥰💕', answer: 'In Love', options: ['In Love', 'Hate', 'Fear', 'Disgust'], hint: 'Romantic feeling' },
  { emojis: '😤💨', answer: 'Frustrated', options: ['Relaxed', 'Frustrated', 'Joyful', 'Peaceful'], hint: 'Things not going well' },
  { emojis: '🙏😌', answer: 'Grateful', options: ['Angry', 'Grateful', 'Confused', 'Jealous'], hint: 'Thankful feeling' },
  { emojis: '😎🌟', answer: 'Confident', options: ['Shy', 'Confident', 'Worried', 'Lost'], hint: 'Feeling cool' },
  { emojis: '🤗🫂', answer: 'Comforting', options: ['Fighting', 'Comforting', 'Ignoring', 'Teasing'], hint: 'Helping someone feel better' },
  { emojis: '😔🌧️', answer: 'Gloomy', options: ['Cheerful', 'Gloomy', 'Excited', 'Proud'], hint: 'Feeling down like rainy day' },
  { emojis: '🥺👉👈', answer: 'Shy', options: ['Bold', 'Shy', 'Brave', 'Loud'], hint: 'Feeling timid' },
];

export default function EmojiCharades({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: EmojiCharadesProps) {
  const optionCounts = { 1: 2, 2: 3, 3: 4, 4: 4, 5: 4 };
  const showHints = { 1: true, 2: true, 3: true, 4: false, 5: false };
  
  const optionCount = optionCounts[level];
  const showHint = showHints[level];
  
  const [currentCharade, setCurrentCharade] = useState<Charade | null>(null);
  const [displayedOptions, setDisplayedOptions] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [usedCharades, setUsedCharades] = useState<number[]>([]);

  const generateRound = useCallback(() => {
    const availableIndices = CHARADES.map((_, i) => i).filter(i => !usedCharades.includes(i));
    if (availableIndices.length === 0) {
      setUsedCharades([]);
      return;
    }
    
    const charadeIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const charade = CHARADES[charadeIndex];
    
    let options = [charade.answer];
    const otherOptions = charade.options.filter(o => o !== charade.answer);
    while (options.length < optionCount && otherOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherOptions.length);
      options.push(otherOptions[randomIndex]);
      otherOptions.splice(randomIndex, 1);
    }
    
    options = options.sort(() => Math.random() - 0.5);
    
    setCurrentCharade(charade);
    setDisplayedOptions(options);
    setUsedCharades(prev => [...prev, charadeIndex]);
    setFeedback(null);
    setSelectedAnswer(null);
  }, [optionCount, usedCharades]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      generateRound();
    }
  }, [isPlaying, round]);

  const handleAnswer = (answer: string) => {
    if (feedback || isPaused || !currentCharade) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentCharade.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      addScore(15 * level + streak * 3);
      setStreak(prev => prev + 1);
      setTimeout(() => {
        setRound(prev => prev + 1);
      }, 1000);
    } else {
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setGameOver(true), 1500);
      } else {
        setTimeout(() => {
          setRound(prev => prev + 1);
        }, 1500);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Round</p>
          <p className="text-2xl font-bold text-green-600">{round}</p>
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
          😊 What emotion do these emojis show?
        </p>
      </div>

      {currentCharade && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-8 rounded-2xl text-center mb-4">
            <p className="text-6xl tracking-wider">{currentCharade.emojis}</p>
          </div>
          {showHint && (
            <p className="text-center text-sm text-muted-foreground italic">
              💡 Hint: {currentCharade.hint}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {displayedOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            disabled={!!feedback || isPaused}
            className={`
              px-4 py-4 rounded-xl text-lg font-medium transition-all
              ${feedback && option === currentCharade?.answer ? 'bg-green-500 text-white ring-4 ring-green-300' : ''}
              ${feedback === 'wrong' && selectedAnswer === option ? 'bg-red-500 text-white' : ''}
              ${!feedback ? 'bg-white border-2 border-green-200 hover:border-green-400 hover:bg-green-50' : ''}
              ${feedback && option !== currentCharade?.answer && option !== selectedAnswer ? 'opacity-50' : ''}
            `}
          >
            {option}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`mt-6 text-center text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
          {feedback === 'correct' ? '🎉 Correct!' : `❌ It was: ${currentCharade?.answer}`}
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {optionCount} options{showHint ? ' with hints' : ' (no hints)'}
      </p>
    </div>
  );
}
