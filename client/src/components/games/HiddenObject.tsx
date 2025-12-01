import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface HiddenObjectProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface HiddenItem {
  emoji: string;
  x: number;
  y: number;
  found: boolean;
  isTarget: boolean;
}

const SCENE_ITEMS = ['🌳', '🌲', '🌴', '🌵', '🍄', '🌻', '🌹', '🌺', '🪨', '🪵', '🏠', '⛰️', '☁️', '🌤️'];
const TARGET_ITEMS = ['🦋', '🐝', '🐞', '🦎', '🐿️', '🐦', '🦜', '🦉', '🐸', '🦔', '🐛', '🦗'];

export default function HiddenObject({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: HiddenObjectProps) {
  const targetCounts = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 8 };
  const sceneCounts = { 1: 15, 2: 20, 3: 25, 4: 30, 5: 40 };
  
  const targetCount = targetCounts[level];
  const sceneCount = sceneCounts[level];
  
  const [items, setItems] = useState<HiddenItem[]>([]);
  const [targetItems, setTargetItems] = useState<string[]>([]);
  const [foundCount, setFoundCount] = useState(0);
  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const generateScene = useCallback(() => {
    const positions: { x: number; y: number }[] = [];
    const newItems: HiddenItem[] = [];
    
    const selectedTargets = TARGET_ITEMS
      .sort(() => Math.random() - 0.5)
      .slice(0, targetCount);
    
    while (positions.length < sceneCount + targetCount) {
      const x = Math.random() * 85 + 5;
      const y = Math.random() * 85 + 5;
      
      const tooClose = positions.some(p => 
        Math.abs(p.x - x) < 8 && Math.abs(p.y - y) < 8
      );
      
      if (!tooClose) {
        positions.push({ x, y });
      }
    }
    
    selectedTargets.forEach((emoji, i) => {
      const pos = positions[i];
      newItems.push({
        emoji,
        x: pos.x,
        y: pos.y,
        found: false,
        isTarget: true
      });
    });
    
    for (let i = targetCount; i < positions.length; i++) {
      const pos = positions[i];
      newItems.push({
        emoji: SCENE_ITEMS[Math.floor(Math.random() * SCENE_ITEMS.length)],
        x: pos.x,
        y: pos.y,
        found: false,
        isTarget: false
      });
    }
    
    setItems(newItems.sort(() => Math.random() - 0.5));
    setTargetItems(selectedTargets);
    setFoundCount(0);
    setWrongClicks(0);
    setShowHint(false);
  }, [targetCount, sceneCount]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      generateScene();
    }
  }, [isPlaying, round, generateScene, isPaused]);

  const handleItemClick = (item: HiddenItem, index: number) => {
    if (isPaused || item.found) return;
    
    if (item.isTarget) {
      setItems(prev => prev.map((it, i) => 
        i === index ? { ...it, found: true } : it
      ));
      
      const newFoundCount = foundCount + 1;
      setFoundCount(newFoundCount);
      setStreak(prev => prev + 1);
      
      const points = (15 - wrongClicks * 2) * level + streak * 2;
      addScore(Math.max(5, points));
      
      if (newFoundCount === targetCount) {
        setTimeout(() => {
          if (round >= 3 + level) {
            setGameOver(true);
          } else {
            setRound(prev => prev + 1);
          }
        }, 1000);
      }
    } else {
      setStreak(0);
      setWrongClicks(prev => prev + 1);
    }
  };

  const handleHint = () => {
    if (showHint) return;
    setShowHint(true);
    setTimeout(() => setShowHint(false), 2000);
  };

  const unfoundTargets = items.filter(i => i.isTarget && !i.found);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Scene</p>
          <p className="text-2xl font-bold text-fuchsia-600">{round}/{3 + level}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Found</p>
          <p className="text-2xl font-bold text-green-600">{foundCount}/{targetCount}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <p className="text-sm font-medium">Find:</p>
        <div className="flex gap-2">
          {targetItems.map((emoji, i) => {
            const found = items.find(it => it.emoji === emoji && it.found);
            return (
              <span 
                key={i}
                className={`text-2xl p-1 rounded ${found ? 'opacity-30 line-through' : 'bg-fuchsia-100'}`}
              >
                {emoji}
              </span>
            );
          })}
        </div>
        <button
          onClick={handleHint}
          disabled={showHint || foundCount === targetCount}
          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
        >
          💡 Hint
        </button>
      </div>

      <div 
        className="relative w-full max-w-lg h-72 bg-gradient-to-b from-sky-200 via-sky-100 to-green-200 rounded-xl overflow-hidden border-4 border-fuchsia-300"
      >
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item, index)}
            disabled={isPaused || item.found}
            className={`
              absolute transform -translate-x-1/2 -translate-y-1/2 text-2xl
              transition-all duration-200
              ${item.found ? 'opacity-30 scale-75' : 'hover:scale-125 cursor-pointer'}
              ${showHint && item.isTarget && !item.found ? 'animate-pulse ring-4 ring-yellow-400 rounded-full bg-yellow-100' : ''}
            `}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              zIndex: item.isTarget ? 10 : 5
            }}
          >
            {item.emoji}
          </button>
        ))}

        {foundCount === targetCount && (
          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
            <div className="bg-white px-6 py-3 rounded-xl shadow-lg">
              <span className="text-2xl font-bold text-green-600">🎉 All Found!</span>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: Find {targetCount} hidden creatures among {sceneCount} objects
      </p>
    </div>
  );
}
