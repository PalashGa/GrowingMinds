import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface RolePlayProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Scenario {
  title: string;
  description: string;
  emoji: string;
  choices: { text: string; outcome: string; points: number; emoji: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    title: 'The New Student',
    description: 'A new student joins your class and looks nervous. They are sitting alone at lunch.',
    emoji: '🏫',
    choices: [
      { text: 'Invite them to sit with you', outcome: 'They smile and you become friends! Great choice!', points: 20, emoji: '😊' },
      { text: 'Wave but stay with your friends', outcome: 'They appreciate the wave but still feel lonely.', points: 10, emoji: '👋' },
      { text: 'Ignore them', outcome: 'They feel even more lonely. Could you try again?', points: 0, emoji: '😔' },
    ]
  },
  {
    title: 'The Broken Toy',
    description: 'You accidentally broke your friend\'s favorite toy while playing.',
    emoji: '🧸',
    choices: [
      { text: 'Tell the truth and apologize', outcome: 'Your friend appreciates your honesty. True friendship!', points: 20, emoji: '💚' },
      { text: 'Offer to help fix or replace it', outcome: 'That\'s responsible! Your friend feels better.', points: 15, emoji: '🔧' },
      { text: 'Hide it and say nothing', outcome: 'Your friend finds out later and is upset.', points: 0, emoji: '😢' },
    ]
  },
  {
    title: 'The Test Answer',
    description: 'During a test, you see another student\'s answers. You studied but are unsure about one question.',
    emoji: '📝',
    choices: [
      { text: 'Look away and do your best', outcome: 'Integrity matters! You feel proud of yourself.', points: 20, emoji: '✨' },
      { text: 'Ask the teacher for help', outcome: 'Smart choice! The teacher explains the question.', points: 15, emoji: '🙋' },
      { text: 'Copy the answer', outcome: 'That\'s cheating. It doesn\'t feel good inside.', points: 0, emoji: '😞' },
    ]
  },
  {
    title: 'The Birthday Party',
    description: 'You\'re having a birthday party but can only invite 5 friends. Your classmate asks if they can come.',
    emoji: '🎂',
    choices: [
      { text: 'Ask your parents if one more can come', outcome: 'Your parents say yes! Everyone is happy.', points: 20, emoji: '🎉' },
      { text: 'Explain kindly why you can\'t invite everyone', outcome: 'They understand. You handled it well.', points: 15, emoji: '💬' },
      { text: 'Say no rudely', outcome: 'That hurt their feelings. Words matter.', points: 0, emoji: '💔' },
    ]
  },
  {
    title: 'The Playground Argument',
    description: 'Two of your friends are arguing about whose turn it is on the swing.',
    emoji: '🎢',
    choices: [
      { text: 'Suggest taking turns with a timer', outcome: 'Problem solved! You\'re a great peacemaker.', points: 20, emoji: '⏰' },
      { text: 'Find something else to play together', outcome: 'Good thinking! The argument stops.', points: 15, emoji: '🤝' },
      { text: 'Take sides with one friend', outcome: 'Now the other friend feels left out.', points: 5, emoji: '😕' },
    ]
  },
  {
    title: 'The Lost Pet',
    description: 'You find a lost dog on your way home from school. It has no collar.',
    emoji: '🐕',
    choices: [
      { text: 'Ask an adult for help finding the owner', outcome: 'The owner is found! They\'re so grateful.', points: 20, emoji: '🏠' },
      { text: 'Give it water and stay with it', outcome: 'Kind and caring! Someone notices and helps.', points: 15, emoji: '💧' },
      { text: 'Keep walking', outcome: 'The dog is still lost and scared.', points: 0, emoji: '😿' },
    ]
  },
  {
    title: 'The Homework Helper',
    description: 'Your younger sibling asks for help with their homework, but your favorite show is on.',
    emoji: '📚',
    choices: [
      { text: 'Help them first, watch the show later', outcome: 'Family first! They\'re so happy for your help.', points: 20, emoji: '🌟' },
      { text: 'Record the show and help', outcome: 'Smart solution! Everyone wins.', points: 15, emoji: '📺' },
      { text: 'Tell them you\'re busy', outcome: 'They struggle alone. Family supports each other.', points: 5, emoji: '😞' },
    ]
  },
];

export default function RolePlay({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: RolePlayProps) {
  const scenarioCounts = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7 };
  const scenarioCount = scenarioCounts[level];
  
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
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
      setSelectedChoice(null);
      setShowOutcome(false);
    }
  }, [isPlaying, scenarioIndex]);

  const handleChoice = (choiceIndex: number) => {
    if (showOutcome || isPaused || !currentScenario) return;
    
    setSelectedChoice(choiceIndex);
    setShowOutcome(true);
    
    const choice = currentScenario.choices[choiceIndex];
    addScore(choice.points * level);
    
    setTimeout(() => {
      if (scenarioIndex + 1 >= scenarioCount) {
        setGameOver(true);
      } else {
        setScenarioIndex(prev => prev + 1);
      }
    }, 3000);
  };

  const progress = ((scenarioIndex + 1) / scenarioCount) * 100;

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Story</p>
          <p className="text-2xl font-bold text-purple-600">{scenarioIndex + 1}/{scenarioCount}</p>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {currentScenario && (
        <>
          <div className="w-full bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{currentScenario.emoji}</span>
              <h3 className="text-xl font-bold text-purple-700">{currentScenario.title}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{currentScenario.description}</p>
          </div>

          <p className="text-sm font-medium text-purple-600 mb-4">What would you do?</p>

          <div className="w-full space-y-3">
            {currentScenario.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(index)}
                disabled={showOutcome || isPaused}
                className={`
                  w-full p-4 rounded-xl text-left transition-all
                  ${showOutcome && selectedChoice === index 
                    ? choice.points >= 15 
                      ? 'bg-green-100 border-2 border-green-400' 
                      : choice.points >= 10
                        ? 'bg-yellow-100 border-2 border-yellow-400'
                        : 'bg-red-100 border-2 border-red-400'
                    : 'bg-white border-2 border-purple-200 hover:border-purple-400'}
                  ${showOutcome && selectedChoice !== index ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{choice.emoji}</span>
                  <span className="font-medium">{choice.text}</span>
                </div>
                
                {showOutcome && selectedChoice === index && (
                  <div className="mt-3 p-3 bg-white/50 rounded-lg">
                    <p className="text-sm text-gray-600">{choice.outcome}</p>
                    <p className="text-sm font-bold text-purple-600 mt-1">+{choice.points * level} points</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="mt-6 text-sm text-muted-foreground text-center">
        Level {level}: Make thoughtful choices in {scenarioCount} stories
      </p>
    </div>
  );
}
