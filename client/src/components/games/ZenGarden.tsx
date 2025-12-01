import { useState, useEffect } from 'react';
import { DifficultyLevel } from './types';

interface ZenGardenProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface GardenElement {
  id: number;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const GARDEN_ELEMENTS = {
  plants: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '💐', '🌿', '🍀', '🌱'],
  rocks: ['🪨', '⛰️', '🗿'],
  water: ['💧', '🌊', '💦'],
  decorations: ['🦋', '🐝', '🐞', '🌈', '✨', '🌙', '⭐'],
  trees: ['🌳', '🌲', '🌴', '🎋', '🎍'],
};

const THEMES = [
  { name: 'Spring Garden', bg: 'from-pink-100 to-green-100', border: 'border-pink-300' },
  { name: 'Ocean View', bg: 'from-blue-100 to-cyan-100', border: 'border-blue-300' },
  { name: 'Sunset Garden', bg: 'from-orange-100 to-yellow-100', border: 'border-orange-300' },
  { name: 'Night Garden', bg: 'from-purple-100 to-indigo-100', border: 'border-purple-300' },
  { name: 'Forest Path', bg: 'from-green-100 to-emerald-100', border: 'border-green-300' },
];

export default function ZenGarden({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: ZenGardenProps) {
  const elementLimits = { 1: 8, 2: 12, 3: 16, 4: 20, 5: 25 };
  const elementLimit = elementLimits[level];
  
  const [elements, setElements] = useState<GardenElement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof GARDEN_ELEMENTS>('plants');
  const [theme, setTheme] = useState(THEMES[0]);
  const [gardenName, setGardenName] = useState('');
  const [step, setStep] = useState<'create' | 'name' | 'complete'>('create');
  const [gardensCreated, setGardensCreated] = useState(0);
  const [nextElementId, setNextElementId] = useState(0);
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    if (isPlaying && !isPaused && step === 'create') {
      const breatheInterval = setInterval(() => {
        setBreathePhase(prev => prev === 'inhale' ? 'exhale' : 'inhale');
      }, 4000);
      return () => clearInterval(breatheInterval);
    }
  }, [isPlaying, isPaused, step]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      setElements([]);
      setGardenName('');
      setStep('create');
      setNextElementId(0);
    }
  }, [isPlaying, isPaused, gardensCreated]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPaused || elements.length >= elementLimit) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const categoryElements = GARDEN_ELEMENTS[selectedCategory];
    const emoji = categoryElements[Math.floor(Math.random() * categoryElements.length)];
    
    const newElement: GardenElement = {
      id: nextElementId,
      emoji,
      x,
      y,
      scale: 0.8 + Math.random() * 0.4,
      rotation: Math.random() * 20 - 10,
    };
    
    setElements(prev => [...prev, newElement]);
    setNextElementId(prev => prev + 1);
    addScore(2 * level);
  };

  const handleRemoveElement = (id: number) => {
    setElements(prev => prev.filter(el => el.id !== id));
  };

  const handleComplete = () => {
    if (elements.length < 3) return;
    setStep('name');
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gardenName.trim()) return;
    
    const varietyBonus = new Set(elements.map(e => e.emoji)).size * 5;
    const completionPoints = elements.length * 3 + varietyBonus;
    addScore(completionPoints * level);
    
    setStep('complete');
    setGardensCreated(prev => prev + 1);
    
    setTimeout(() => {
      if (gardensCreated + 1 >= level + 1) {
        setGameOver(true);
      } else {
        setElements([]);
        setGardenName('');
        setTheme(THEMES[Math.floor(Math.random() * THEMES.length)]);
        setStep('create');
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="flex items-center gap-6 mb-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Garden</p>
          <p className="text-2xl font-bold text-pink-600">{gardensCreated + 1}/{level + 1}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Elements</p>
          <p className="text-2xl font-bold text-green-600">{elements.length}/{elementLimit}</p>
        </div>
      </div>

      {step === 'create' && (
        <>
          <div className={`
            w-full p-2 rounded-xl mb-4 text-center text-sm
            ${breathePhase === 'inhale' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
            transition-all duration-1000
          `}>
            {breathePhase === 'inhale' ? '🌬️ Breathe in slowly...' : '🍃 Breathe out gently...'}
          </div>

          <div className="flex gap-2 mb-4 flex-wrap justify-center">
            {(Object.keys(GARDEN_ELEMENTS) as (keyof typeof GARDEN_ELEMENTS)[]).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-3 py-1 rounded-full text-sm capitalize transition-all
                  ${selectedCategory === category 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'}
                `}
              >
                {GARDEN_ELEMENTS[category][0]} {category}
              </button>
            ))}
          </div>

          <div 
            onClick={handleCanvasClick}
            className={`
              relative w-full h-64 rounded-2xl cursor-crosshair
              bg-gradient-to-br ${theme.bg} ${theme.border} border-4
              overflow-hidden
            `}
          >
            {elements.map(element => (
              <div
                key={element.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform"
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  transform: `translate(-50%, -50%) scale(${element.scale}) rotate(${element.rotation}deg)`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveElement(element.id);
                }}
              >
                <span className="text-3xl">{element.emoji}</span>
              </div>
            ))}
            
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <p className="text-center">Click to add {selectedCategory}<br/>🌸 Create your peaceful garden 🌸</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            {THEMES.map((t, i) => (
              <button
                key={i}
                onClick={() => setTheme(t)}
                className={`
                  w-8 h-8 rounded-full bg-gradient-to-br ${t.bg} ${t.border} border-2
                  ${theme.name === t.name ? 'ring-2 ring-pink-400 ring-offset-2' : ''}
                `}
                title={t.name}
              />
            ))}
          </div>

          <button
            onClick={handleComplete}
            disabled={elements.length < 3 || isPaused}
            className="mt-4 w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
          >
            Complete Garden 🌸
          </button>
        </>
      )}

      {step === 'name' && (
        <div className="w-full text-center">
          <div 
            className={`
              relative w-full h-48 rounded-2xl mb-6 overflow-hidden
              bg-gradient-to-br ${theme.bg} ${theme.border} border-4
            `}
          >
            {elements.map(element => (
              <div
                key={element.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  transform: `translate(-50%, -50%) scale(${element.scale * 0.7}) rotate(${element.rotation}deg)`,
                }}
              >
                <span className="text-2xl">{element.emoji}</span>
              </div>
            ))}
          </div>
          
          <p className="text-lg font-medium mb-4">Name your peaceful garden</p>
          
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <input
              type="text"
              value={gardenName}
              onChange={(e) => setGardenName(e.target.value)}
              placeholder="Garden name..."
              className="w-full px-4 py-3 text-lg border-2 border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none text-center"
              maxLength={25}
              autoFocus
            />
            <button
              type="submit"
              disabled={!gardenName.trim() || isPaused}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
            >
              Save Garden ✨
            </button>
          </form>
        </div>
      )}

      {step === 'complete' && (
        <div className="w-full text-center">
          <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-8 rounded-2xl">
            <span className="text-6xl">🌸</span>
            <h3 className="text-2xl font-bold text-pink-700 mt-4">{gardenName}</h3>
            <p className="text-pink-600 mt-2">Your zen garden is complete!</p>
            <p className="text-sm text-gray-500 mt-2">Take a deep breath and feel peaceful...</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: Create {level + 1} gardens with up to {elementLimit} elements
      </p>
    </div>
  );
}
