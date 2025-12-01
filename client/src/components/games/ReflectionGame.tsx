import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface ReflectionGameProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Reflection {
  prompt: string;
  category: string;
  followUp: string;
  icon: string;
}

const REFLECTIONS: Reflection[] = [
  { prompt: 'What made you smile today?', category: 'Happiness', followUp: 'Remembering happy moments helps us feel good!', icon: '😊' },
  { prompt: 'Did you help someone today?', category: 'Kindness', followUp: 'Being kind makes the world better!', icon: '💝' },
  { prompt: 'What was challenging today?', category: 'Challenges', followUp: 'Challenges help us grow stronger!', icon: '💪' },
  { prompt: 'What are you thankful for?', category: 'Gratitude', followUp: 'Gratitude makes us happier!', icon: '🙏' },
  { prompt: 'How did you feel when you woke up?', category: 'Feelings', followUp: 'Noticing our feelings is important!', icon: '🌅' },
  { prompt: 'What did you learn today?', category: 'Learning', followUp: 'Every day we can learn something new!', icon: '📚' },
  { prompt: 'Who made you feel happy today?', category: 'Relationships', followUp: 'Good friends are treasures!', icon: '👫' },
  { prompt: 'What would you do differently tomorrow?', category: 'Growth', followUp: 'Thinking ahead helps us improve!', icon: '🌱' },
  { prompt: 'What was the best part of your day?', category: 'Highlights', followUp: 'Finding highlights makes days special!', icon: '⭐' },
  { prompt: 'Did anything make you feel worried?', category: 'Concerns', followUp: 'Sharing worries makes them smaller!', icon: '💭' },
  { prompt: 'What made you laugh today?', category: 'Joy', followUp: 'Laughter is the best medicine!', icon: '😄' },
  { prompt: 'How did you show love today?', category: 'Love', followUp: 'Love grows when we share it!', icon: '❤️' },
];

const FEELING_OPTIONS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😰', label: 'Worried' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🥳', label: 'Excited' },
];

export default function ReflectionGame({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: ReflectionGameProps) {
  const questionCounts = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7 };
  const showFollowUp = { 1: true, 2: true, 3: true, 4: true, 5: false };
  
  const questionCount = questionCounts[level];
  const showMessage = showFollowUp[level];
  
  const [currentReflection, setCurrentReflection] = useState<Reflection | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [step, setStep] = useState<'feeling' | 'question' | 'followup'>('feeling');
  const [completedQuestions, setCompletedQuestions] = useState<{ question: string; feeling: string; response: string }[]>([]);
  const [usedReflections, setUsedReflections] = useState<number[]>([]);

  const generateQuestion = useCallback(() => {
    const availableIndices = REFLECTIONS.map((_, i) => i).filter(i => !usedReflections.includes(i));
    if (availableIndices.length === 0) {
      setUsedReflections([]);
      return REFLECTIONS[0];
    }
    
    const index = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedReflections(prev => [...prev, index]);
    return REFLECTIONS[index];
  }, [usedReflections]);

  useEffect(() => {
    if (isPlaying && !isPaused && !currentReflection) {
      setCurrentReflection(generateQuestion());
    }
  }, [isPlaying, isPaused, currentReflection, generateQuestion]);

  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling);
    setStep('question');
    addScore(5 * level);
  };

  const handleSubmitResponse = () => {
    if (!response.trim() || !currentReflection || !selectedFeeling) return;
    
    setCompletedQuestions(prev => [...prev, {
      question: currentReflection.prompt,
      feeling: selectedFeeling,
      response: response
    }]);
    
    addScore(15 * level);
    
    if (showMessage) {
      setStep('followup');
    } else {
      moveToNextQuestion();
    }
  };

  const moveToNextQuestion = () => {
    if (questionIndex + 1 >= questionCount) {
      setGameOver(true);
      return;
    }
    
    setQuestionIndex(prev => prev + 1);
    setCurrentReflection(generateQuestion());
    setSelectedFeeling(null);
    setResponse('');
    setStep('feeling');
  };

  const progress = ((questionIndex + 1) / questionCount) * 100;

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      <div className="flex items-center gap-6 mb-6 w-full">
        <div className="text-center flex-1">
          <p className="text-sm text-muted-foreground">Question</p>
          <p className="text-2xl font-bold text-lime-600">{questionIndex + 1}/{questionCount}</p>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-lime-400 to-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {step === 'feeling' && (
        <div className="w-full text-center">
          <div className="mb-6">
            <p className="text-lg font-medium mb-2">
              🪞 How are you feeling right now?
            </p>
            <p className="text-sm text-muted-foreground">
              Choose the emoji that best describes your mood
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {FEELING_OPTIONS.map((option) => (
              <button
                key={option.label}
                onClick={() => handleFeelingSelect(option.emoji)}
                className="p-3 bg-white border-2 border-lime-200 rounded-xl hover:border-lime-400 hover:bg-lime-50 transition-all"
              >
                <p className="text-3xl mb-1">{option.emoji}</p>
                <p className="text-xs text-muted-foreground">{option.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'question' && currentReflection && (
        <div className="w-full">
          <div className="bg-gradient-to-r from-lime-100 to-green-100 p-6 rounded-2xl mb-6 text-center">
            <p className="text-4xl mb-3">{currentReflection.icon}</p>
            <p className="text-lg font-medium text-gray-700">{currentReflection.prompt}</p>
            <p className="text-sm text-lime-600 mt-2">{currentReflection.category}</p>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Your mood:</span>
            <span className="text-2xl">{selectedFeeling}</span>
          </div>
          
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-4 border-2 border-lime-200 rounded-xl focus:border-lime-400 focus:outline-none resize-none h-32"
            disabled={isPaused}
          />
          
          <button
            onClick={handleSubmitResponse}
            disabled={!response.trim() || isPaused}
            className="w-full mt-4 py-3 bg-gradient-to-r from-lime-500 to-green-500 text-white rounded-xl font-bold hover:from-lime-600 hover:to-green-600 disabled:opacity-50 transition-all"
          >
            Submit Reflection ✨
          </button>
        </div>
      )}

      {step === 'followup' && currentReflection && (
        <div className="w-full text-center">
          <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-6 rounded-2xl mb-6">
            <p className="text-4xl mb-3">💡</p>
            <p className="text-lg font-medium text-amber-700">{currentReflection.followUp}</p>
          </div>
          
          <button
            onClick={moveToNextQuestion}
            className="w-full py-3 bg-gradient-to-r from-lime-500 to-green-500 text-white rounded-xl font-bold hover:from-lime-600 hover:to-green-600 transition-all"
          >
            {questionIndex + 1 >= questionCount ? 'See Summary' : 'Next Question'} →
          </button>
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground text-center">
        Level {level}: {questionCount} reflection prompts
      </p>
    </div>
  );
}
