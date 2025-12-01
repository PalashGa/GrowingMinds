import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface HealthyChoicesProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface HealthScenario {
  question: string;
  options: { text: string; emoji: string; isHealthy: boolean; explanation: string }[];
  category: string;
}

const SCENARIOS: HealthScenario[] = [
  {
    question: 'What should you drink most throughout the day?',
    options: [
      { text: 'Water', emoji: '💧', isHealthy: true, explanation: 'Water is the best choice for staying hydrated!' },
      { text: 'Soda', emoji: '🥤', isHealthy: false, explanation: 'Soda has lots of sugar. Water is better!' },
      { text: 'Energy drink', emoji: '⚡', isHealthy: false, explanation: 'Energy drinks have too much caffeine for kids.' },
    ],
    category: 'Hydration'
  },
  {
    question: 'Which is a healthier breakfast choice?',
    options: [
      { text: 'Oatmeal with fruit', emoji: '🥣', isHealthy: true, explanation: 'Oatmeal gives you energy that lasts!' },
      { text: 'Sugary cereal', emoji: '🥣', isHealthy: false, explanation: 'Too much sugar can make you tired later.' },
      { text: 'Skip breakfast', emoji: '❌', isHealthy: false, explanation: 'Breakfast helps your brain work better!' },
    ],
    category: 'Food'
  },
  {
    question: 'How much sleep should kids get each night?',
    options: [
      { text: '9-11 hours', emoji: '😴', isHealthy: true, explanation: 'Good sleep helps you grow and learn!' },
      { text: '5-6 hours', emoji: '😫', isHealthy: false, explanation: 'That\'s not enough rest for growing bodies.' },
      { text: 'As late as possible', emoji: '📱', isHealthy: false, explanation: 'Regular bedtimes help you feel better!' },
    ],
    category: 'Sleep'
  },
  {
    question: 'What should you do for at least 60 minutes each day?',
    options: [
      { text: 'Physical activity', emoji: '🏃', isHealthy: true, explanation: 'Moving your body keeps you healthy and happy!' },
      { text: 'Watch TV', emoji: '📺', isHealthy: false, explanation: 'Some screen time is okay, but moving is important!' },
      { text: 'Video games only', emoji: '🎮', isHealthy: false, explanation: 'Balance games with active play!' },
    ],
    category: 'Exercise'
  },
  {
    question: 'Which snack is the healthiest choice?',
    options: [
      { text: 'Apple slices', emoji: '🍎', isHealthy: true, explanation: 'Fruits are nature\'s candy!' },
      { text: 'Candy bar', emoji: '🍫', isHealthy: false, explanation: 'Candy has too much sugar for everyday snacks.' },
      { text: 'Chips', emoji: '🍟', isHealthy: false, explanation: 'Chips have lots of salt and fat.' },
    ],
    category: 'Food'
  },
  {
    question: 'When should you wash your hands?',
    options: [
      { text: 'Before eating and after bathroom', emoji: '🧼', isHealthy: true, explanation: 'Clean hands stop germs from spreading!' },
      { text: 'Only when visibly dirty', emoji: '🤚', isHealthy: false, explanation: 'Germs are invisible! Wash often.' },
      { text: 'Never, germs make you stronger', emoji: '🦠', isHealthy: false, explanation: 'That\'s not true! Washing prevents illness.' },
    ],
    category: 'Hygiene'
  },
  {
    question: 'How often should you brush your teeth?',
    options: [
      { text: 'Twice a day, 2 minutes each', emoji: '🪥', isHealthy: true, explanation: 'This keeps your teeth healthy and strong!' },
      { text: 'Once a week', emoji: '😬', isHealthy: false, explanation: 'Your teeth need daily care!' },
      { text: 'Only before dentist visits', emoji: '🦷', isHealthy: false, explanation: 'Daily brushing prevents cavities!' },
    ],
    category: 'Hygiene'
  },
  {
    question: 'What\'s a good way to handle stress?',
    options: [
      { text: 'Talk to someone you trust', emoji: '💬', isHealthy: true, explanation: 'Sharing feelings helps you feel better!' },
      { text: 'Keep it all inside', emoji: '🤐', isHealthy: false, explanation: 'Bottling up feelings isn\'t healthy.' },
      { text: 'Take deep breaths', emoji: '🧘', isHealthy: true, explanation: 'Breathing exercises calm your mind!' },
    ],
    category: 'Mental Health'
  },
  {
    question: 'Which is better for your eyes?',
    options: [
      { text: 'Take breaks from screens', emoji: '👀', isHealthy: true, explanation: 'The 20-20-20 rule protects your eyes!' },
      { text: 'Stare at screens all day', emoji: '📱', isHealthy: false, explanation: 'Too much screen time strains your eyes.' },
      { text: 'Never go outside', emoji: '🏠', isHealthy: false, explanation: 'Outdoor time is good for eye health!' },
    ],
    category: 'Screen Time'
  },
  {
    question: 'What should you put on before going in the sun?',
    options: [
      { text: 'Sunscreen', emoji: '🧴', isHealthy: true, explanation: 'Sunscreen protects your skin!' },
      { text: 'Nothing at all', emoji: '☀️', isHealthy: false, explanation: 'Sunburns can harm your skin.' },
      { text: 'Only a hat', emoji: '🧢', isHealthy: false, explanation: 'A hat helps, but sunscreen is needed too!' },
    ],
    category: 'Sun Safety'
  },
];

export default function HealthyChoices({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: HealthyChoicesProps) {
  const questionCounts = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8 };
  const questionCount = questionCounts[level];
  
  const [currentScenario, setCurrentScenario] = useState<HealthScenario | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [usedScenarios, setUsedScenarios] = useState<number[]>([]);

  const generateScenario = useCallback(() => {
    const availableIndices = SCENARIOS.map((_, i) => i).filter(i => !usedScenarios.includes(i));
    if (availableIndices.length === 0) {
      setUsedScenarios([]);
      return SCENARIOS[0];
    }
    
    const index = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedScenarios(prev => [...prev, index]);
    return SCENARIOS[index];
  }, [usedScenarios]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      setCurrentScenario(generateScenario());
      setSelectedAnswer(null);
      setFeedback(null);
    }
  }, [isPlaying, questionIndex]);

  const handleAnswer = (answerIndex: number) => {
    if (feedback || isPaused || !currentScenario) return;
    
    setSelectedAnswer(answerIndex);
    const selected = currentScenario.options[answerIndex];
    setFeedback(selected.isHealthy ? 'correct' : 'wrong');
    
    if (selected.isHealthy) {
      addScore(15 * level + streak * 3);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setGameOver(true), 2000);
        return;
      }
    }
    
    setTimeout(() => {
      if (questionIndex + 1 >= questionCount) {
        setGameOver(true);
      } else {
        setQuestionIndex(prev => prev + 1);
      }
    }, 2500);
  };

  const progress = ((questionIndex + 1) / questionCount) * 100;

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Question</p>
          <p className="text-2xl font-bold text-green-600">{questionIndex + 1}/{questionCount}</p>
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
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentScenario && (
        <>
          <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥗</span>
              <span className="text-sm font-medium text-green-700">{currentScenario.category}</span>
            </div>
            <p className="text-lg font-medium text-gray-700">{currentScenario.question}</p>
          </div>

          <div className="w-full space-y-3">
            {currentScenario.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={!!feedback || isPaused}
                className={`
                  w-full p-4 rounded-xl transition-all text-left
                  ${feedback && option.isHealthy ? 'bg-green-100 border-2 border-green-400' : ''}
                  ${feedback === 'wrong' && selectedAnswer === index && !option.isHealthy ? 'bg-red-100 border-2 border-red-400' : ''}
                  ${!feedback ? 'bg-white border-2 border-green-200 hover:border-green-400' : ''}
                  ${feedback && !option.isHealthy && selectedAnswer !== index ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="font-medium">{option.text}</span>
                </div>
                
                {feedback && (selectedAnswer === index || option.isHealthy) && (
                  <p className="mt-2 text-sm text-gray-600 pl-12">
                    {option.explanation}
                  </p>
                )}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`mt-4 text-center text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback === 'correct' ? '🎉 Great healthy choice!' : '💪 Keep learning about health!'}
            </div>
          )}
        </>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {questionCount} health questions
      </p>
    </div>
  );
}
