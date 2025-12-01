import { useState, useEffect } from 'react';
import { DifficultyLevel } from './types';

interface RobotDesignerProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface RobotPart {
  category: string;
  options: { emoji: string; name: string; bonus: string }[];
}

const ROBOT_PARTS: RobotPart[] = [
  { 
    category: 'Head',
    options: [
      { emoji: '🤖', name: 'Classic', bonus: 'Memory +1' },
      { emoji: '👽', name: 'Alien', bonus: 'Creativity +2' },
      { emoji: '🎃', name: 'Pumpkin', bonus: 'Fun +2' },
      { emoji: '🐱', name: 'Cat', bonus: 'Agility +1' },
      { emoji: '🦊', name: 'Fox', bonus: 'Cleverness +2' },
    ]
  },
  { 
    category: 'Body',
    options: [
      { emoji: '🔷', name: 'Diamond', bonus: 'Defense +2' },
      { emoji: '🟦', name: 'Square', bonus: 'Stability +1' },
      { emoji: '🔶', name: 'Gold', bonus: 'Power +2' },
      { emoji: '⬛', name: 'Stealth', bonus: 'Speed +1' },
      { emoji: '🟣', name: 'Magic', bonus: 'Energy +2' },
    ]
  },
  { 
    category: 'Arms',
    options: [
      { emoji: '🦾', name: 'Mechanical', bonus: 'Strength +2' },
      { emoji: '🤲', name: 'Gentle', bonus: 'Care +1' },
      { emoji: '👐', name: 'Helper', bonus: 'Teamwork +2' },
      { emoji: '✨', name: 'Magic', bonus: 'Power +2' },
      { emoji: '🔧', name: 'Builder', bonus: 'Crafting +2' },
    ]
  },
  { 
    category: 'Legs',
    options: [
      { emoji: '🦿', name: 'Bionic', bonus: 'Speed +2' },
      { emoji: '🛞', name: 'Wheels', bonus: 'Mobility +2' },
      { emoji: '🚀', name: 'Rocket', bonus: 'Flight +2' },
      { emoji: '🐾', name: 'Paws', bonus: 'Stealth +1' },
      { emoji: '⚡', name: 'Electric', bonus: 'Energy +2' },
    ]
  },
  { 
    category: 'Accessory',
    options: [
      { emoji: '🎩', name: 'Top Hat', bonus: 'Style +2' },
      { emoji: '🎀', name: 'Bow', bonus: 'Charm +1' },
      { emoji: '⭐', name: 'Star', bonus: 'Shine +2' },
      { emoji: '🔮', name: 'Crystal', bonus: 'Vision +2' },
      { emoji: '🌈', name: 'Rainbow', bonus: 'Joy +2' },
    ]
  },
];

const MISSIONS = [
  { task: 'Rescue Mission', requirements: 'Needs Speed and Strength', emoji: '🚨' },
  { task: 'Space Exploration', requirements: 'Needs Flight and Energy', emoji: '🌌' },
  { task: 'Helper Bot', requirements: 'Needs Care and Teamwork', emoji: '🏥' },
  { task: 'Party Robot', requirements: 'Needs Fun and Joy', emoji: '🎉' },
  { task: 'Builder Bot', requirements: 'Needs Crafting and Stability', emoji: '🏗️' },
];

export default function RobotDesigner({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: RobotDesignerProps) {
  const partCounts = { 1: 3, 2: 4, 3: 5, 4: 5, 5: 5 };
  const missionRequired = level >= 3;
  
  const partCount = partCounts[level];
  const availableParts = ROBOT_PARTS.slice(0, partCount);
  
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [robotName, setRobotName] = useState('');
  const [mission, setMission] = useState<typeof MISSIONS[0] | null>(null);
  const [step, setStep] = useState<'design' | 'name' | 'mission' | 'complete'>('design');
  const [robotsBuilt, setRobotsBuilt] = useState(0);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      setSelections({});
      setRobotName('');
      setMission(missionRequired ? MISSIONS[Math.floor(Math.random() * MISSIONS.length)] : null);
      setStep('design');
    }
  }, [isPlaying, isPaused, missionRequired, robotsBuilt]);

  const handleSelectPart = (category: string, optionIndex: number) => {
    if (isPaused) return;
    setSelections(prev => ({ ...prev, [category]: optionIndex }));
  };

  const handleContinue = () => {
    if (Object.keys(selections).length < partCount) return;
    setStep('name');
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!robotName.trim()) return;
    
    if (missionRequired) {
      setStep('mission');
    } else {
      completeRobot();
    }
  };

  const handleMissionComplete = () => {
    completeRobot();
  };

  const completeRobot = () => {
    const partsPoints = Object.keys(selections).length * 5;
    const namePoints = robotName.length >= 3 ? 10 : 5;
    const missionPoints = missionRequired ? 15 : 0;
    const totalPoints = (partsPoints + namePoints + missionPoints) * level;
    
    addScore(totalPoints);
    setStep('complete');
    setRobotsBuilt(prev => prev + 1);
    
    setTimeout(() => {
      if (robotsBuilt + 1 >= level + 2) {
        setGameOver(true);
      } else {
        setSelections({});
        setRobotName('');
        setStep('design');
      }
    }, 3000);
  };

  const renderRobot = () => {
    const parts = availableParts.map(part => {
      const selectedIndex = selections[part.category];
      return selectedIndex !== undefined ? part.options[selectedIndex].emoji : '❓';
    });
    
    return (
      <div className="flex flex-col items-center text-4xl">
        {parts.map((emoji, i) => (
          <div key={i} className="leading-tight">{emoji}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Robots Built</p>
          <p className="text-2xl font-bold text-violet-600">{robotsBuilt}/{level + 2}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Parts</p>
          <p className="text-2xl font-bold text-blue-600">{Object.keys(selections).length}/{partCount}</p>
        </div>
      </div>

      {mission && step === 'design' && (
        <div className="w-full bg-violet-100 p-4 rounded-xl mb-4 text-center">
          <span className="text-2xl">{mission.emoji}</span>
          <p className="font-bold text-violet-700">{mission.task}</p>
          <p className="text-sm text-violet-600">{mission.requirements}</p>
        </div>
      )}

      {step === 'design' && (
        <>
          <div className="flex gap-8 mb-6">
            <div className="bg-gradient-to-br from-violet-100 to-purple-100 p-6 rounded-2xl">
              <p className="text-sm text-center text-violet-600 mb-2">Your Robot</p>
              {renderRobot()}
            </div>
          </div>

          <div className="w-full space-y-4">
            {availableParts.map(part => (
              <div key={part.category} className="bg-white p-3 rounded-xl border border-violet-200">
                <p className="text-sm font-medium text-violet-600 mb-2">{part.category}</p>
                <div className="flex gap-2 flex-wrap">
                  {part.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectPart(part.category, i)}
                      disabled={isPaused}
                      className={`
                        p-2 rounded-lg transition-all flex flex-col items-center
                        ${selections[part.category] === i 
                          ? 'bg-violet-500 text-white ring-2 ring-violet-300' 
                          : 'bg-gray-100 hover:bg-violet-100'}
                      `}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-xs">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={Object.keys(selections).length < partCount || isPaused}
            className="mt-6 w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-bold hover:from-violet-600 hover:to-purple-600 disabled:opacity-50"
          >
            Continue →
          </button>
        </>
      )}

      {step === 'name' && (
        <div className="w-full text-center">
          <div className="bg-gradient-to-br from-violet-100 to-purple-100 p-6 rounded-2xl mb-6">
            {renderRobot()}
          </div>
          
          <p className="text-lg font-medium mb-4">Name your robot!</p>
          
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <input
              type="text"
              value={robotName}
              onChange={(e) => setRobotName(e.target.value)}
              placeholder="Robot name..."
              className="w-full px-4 py-3 text-lg border-2 border-violet-200 rounded-xl focus:border-violet-400 focus:outline-none text-center"
              maxLength={20}
              autoFocus
            />
            <button
              type="submit"
              disabled={!robotName.trim() || isPaused}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-bold hover:from-violet-600 hover:to-purple-600 disabled:opacity-50"
            >
              {missionRequired ? 'Continue to Mission' : 'Complete Robot!'}
            </button>
          </form>
        </div>
      )}

      {step === 'mission' && mission && (
        <div className="w-full text-center">
          <div className="bg-gradient-to-br from-violet-100 to-purple-100 p-6 rounded-2xl mb-6">
            {renderRobot()}
            <p className="font-bold text-violet-700 mt-2">{robotName}</p>
          </div>
          
          <div className="bg-yellow-100 p-6 rounded-xl mb-6">
            <span className="text-4xl">{mission.emoji}</span>
            <h3 className="text-xl font-bold text-yellow-700 mt-2">{mission.task}</h3>
            <p className="text-yellow-600">{robotName} is ready for the mission!</p>
          </div>
          
          <button
            onClick={handleMissionComplete}
            disabled={isPaused}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600"
          >
            🚀 Complete Mission!
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div className="w-full text-center">
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-8 rounded-2xl">
            <span className="text-6xl">🎉</span>
            <h3 className="text-2xl font-bold text-green-700 mt-4">{robotName} is Complete!</h3>
            <p className="text-green-600 mt-2">Great job, engineer!</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: Design {level + 2} robots with {partCount} parts each
      </p>
    </div>
  );
}
