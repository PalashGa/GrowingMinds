import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface EmotionRecognitionProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface EmotionScenario {
  emoji: string;
  emotion: string;
  scenario: string;
  context: string;
}

const EMOTIONS: EmotionScenario[] = [
  { emoji: '😊', emotion: 'Happy', scenario: 'Got a good grade on a test', context: 'Achievement' },
  { emoji: '😢', emotion: 'Sad', scenario: 'Lost a favorite toy', context: 'Loss' },
  { emoji: '😠', emotion: 'Angry', scenario: 'Someone took their turn in line', context: 'Unfairness' },
  { emoji: '😨', emotion: 'Scared', scenario: 'Heard a loud thunder', context: 'Fear' },
  { emoji: '😲', emotion: 'Surprised', scenario: 'Got an unexpected gift', context: 'Surprise' },
  { emoji: '🤢', emotion: 'Disgusted', scenario: 'Saw something gross', context: 'Aversion' },
  { emoji: '😕', emotion: 'Confused', scenario: 'Didn\'t understand the directions', context: 'Uncertainty' },
  { emoji: '😔', emotion: 'Disappointed', scenario: 'The trip got cancelled', context: 'Letdown' },
  { emoji: '😤', emotion: 'Frustrated', scenario: 'Can\'t solve a puzzle', context: 'Struggle' },
  { emoji: '🥺', emotion: 'Hopeful', scenario: 'Waiting for birthday party', context: 'Anticipation' },
  { emoji: '😌', emotion: 'Relieved', scenario: 'Found the lost pet', context: 'Relief' },
  { emoji: '🤗', emotion: 'Loved', scenario: 'Got a big hug from mom', context: 'Affection' },
  { emoji: '😴', emotion: 'Tired', scenario: 'Played all day at the park', context: 'Exhaustion' },
  { emoji: '🥱', emotion: 'Bored', scenario: 'Waiting at the doctor\'s office', context: 'Tedium' },
  { emoji: '😎', emotion: 'Proud', scenario: 'Helped a friend with homework', context: 'Accomplishment' },
  { emoji: '😳', emotion: 'Embarrassed', scenario: 'Tripped in front of classmates', context: 'Social mishap' },
  { emoji: '🤔', emotion: 'Curious', scenario: 'Found a mystery box', context: 'Wonder' },
  { emoji: '😤', emotion: 'Jealous', scenario: 'Friend got a new toy', context: 'Envy' },
];

const ALL_EMOTIONS = [...new Set(EMOTIONS.map(e => e.emotion))];

export default function EmotionRecognition({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: EmotionRecognitionProps) {
  const optionCounts = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 6 };
  const showEmoji = { 1: true, 2: true, 3: true, 4: false, 5: false };
  
  const optionCount = optionCounts[level];
  const showFace = showEmoji[level];
  
  const [currentScenario, setCurrentScenario] = useState<EmotionScenario | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [usedScenarios, setUsedScenarios] = useState<number[]>([]);

  const generateRound = useCallback(() => {
    const availableIndices = EMOTIONS.map((_, i) => i).filter(i => !usedScenarios.includes(i));
    if (availableIndices.length === 0) {
      setUsedScenarios([]);
      return;
    }
    
    const scenarioIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const scenario = EMOTIONS[scenarioIndex];
    
    let emotionOptions = [scenario.emotion];
    const otherEmotions = ALL_EMOTIONS.filter(e => e !== scenario.emotion);
    while (emotionOptions.length < optionCount && otherEmotions.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherEmotions.length);
      emotionOptions.push(otherEmotions[randomIndex]);
      otherEmotions.splice(randomIndex, 1);
    }
    
    emotionOptions = emotionOptions.sort(() => Math.random() - 0.5);
    
    setCurrentScenario(scenario);
    setOptions(emotionOptions);
    setUsedScenarios(prev => [...prev, scenarioIndex]);
    setFeedback(null);
    setSelectedAnswer(null);
  }, [optionCount, usedScenarios]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      generateRound();
    }
  }, [isPlaying, round]);

  const handleAnswer = (answer: string) => {
    if (feedback || isPaused || !currentScenario) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentScenario.emotion;
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
          <p className="text-2xl font-bold text-emerald-600">{round}</p>
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
          🎭 What emotion would someone feel?
        </p>
      </div>

      {currentScenario && (
        <div className="mb-8 text-center max-w-md">
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-6 rounded-2xl mb-3">
            {showFace && (
              <p className="text-5xl mb-3">{currentScenario.emoji}</p>
            )}
            <p className="text-lg font-medium text-gray-700">
              "{currentScenario.scenario}"
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Context: {currentScenario.context}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {options.map((option, index) => {
          const emotionData = EMOTIONS.find(e => e.emotion === option);
          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={!!feedback || isPaused}
              className={`
                px-4 py-3 rounded-xl text-lg font-medium transition-all flex items-center justify-center gap-2
                ${feedback && option === currentScenario?.emotion ? 'bg-green-500 text-white ring-4 ring-green-300' : ''}
                ${feedback === 'wrong' && selectedAnswer === option ? 'bg-red-500 text-white' : ''}
                ${!feedback ? 'bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50' : ''}
                ${feedback && option !== currentScenario?.emotion && option !== selectedAnswer ? 'opacity-50' : ''}
              `}
            >
              <span>{emotionData?.emoji}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`mt-6 text-center text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
          {feedback === 'correct' ? '🎉 Great emotional intelligence!' : `❌ The answer was: ${currentScenario?.emotion}`}
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {optionCount} emotions{showFace ? ' with emoji hints' : ' (text only)'}
      </p>
    </div>
  );
}
