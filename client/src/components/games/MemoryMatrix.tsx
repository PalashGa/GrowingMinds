import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface MemoryMatrixProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

export default function MemoryMatrix({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: MemoryMatrixProps) {
  const gridSizes = { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 };
  const tileCounts = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 8 };
  
  const gridSize = gridSizes[level];
  const tileCount = tileCounts[level];
  
  const [phase, setPhase] = useState<'show' | 'input' | 'feedback'>('show');
  const [highlightedTiles, setHighlightedTiles] = useState<number[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [showCorrect, setShowCorrect] = useState(false);

  const generatePattern = useCallback(() => {
    const totalTiles = gridSize * gridSize;
    const pattern: number[] = [];
    while (pattern.length < tileCount) {
      const tile = Math.floor(Math.random() * totalTiles);
      if (!pattern.includes(tile)) {
        pattern.push(tile);
      }
    }
    return pattern;
  }, [gridSize, tileCount]);

  const startRound = useCallback(() => {
    const pattern = generatePattern();
    setHighlightedTiles(pattern);
    setSelectedTiles([]);
    setPhase('show');
    setShowCorrect(false);
    
    const showTime = Math.max(1000, 2500 - (level * 300) - (round * 100));
    setTimeout(() => {
      setPhase('input');
    }, showTime);
  }, [generatePattern, level, round]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      startRound();
    }
  }, [isPlaying, round]);

  const handleTileClick = (index: number) => {
    if (phase !== 'input' || isPaused || selectedTiles.includes(index)) return;
    
    const newSelected = [...selectedTiles, index];
    setSelectedTiles(newSelected);
    
    if (newSelected.length === tileCount) {
      setPhase('feedback');
      const correct = highlightedTiles.every(tile => newSelected.includes(tile));
      
      if (correct) {
        addScore(10 * level * round);
        setShowCorrect(true);
        setTimeout(() => {
          setRound(prev => prev + 1);
        }, 500);
      } else {
        setShowCorrect(true);
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setTimeout(() => setGameOver(true), 1000);
        } else {
          setTimeout(() => {
            startRound();
          }, 1500);
        }
      }
    }
  };

  const getTileStyle = (index: number) => {
    const isHighlighted = highlightedTiles.includes(index);
    const isSelected = selectedTiles.includes(index);
    
    if (phase === 'show' && isHighlighted) {
      return 'bg-blue-500 scale-95';
    }
    if (phase === 'feedback' && showCorrect) {
      if (isHighlighted && isSelected) return 'bg-green-500';
      if (isHighlighted && !isSelected) return 'bg-yellow-500';
      if (!isHighlighted && isSelected) return 'bg-red-500';
    }
    if (isSelected) {
      return 'bg-blue-400';
    }
    return 'bg-slate-200 hover:bg-slate-300';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Round</p>
          <p className="text-2xl font-bold text-blue-600">{round}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Lives</p>
          <p className="text-2xl font-bold">
            {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Tiles</p>
          <p className="text-2xl font-bold">{selectedTiles.length}/{tileCount}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-center text-lg font-medium">
          {phase === 'show' ? '👀 Remember the pattern!' : 
           phase === 'input' ? '🎯 Click the tiles!' : 
           showCorrect && highlightedTiles.every(t => selectedTiles.includes(t)) ? '✅ Correct!' : 
           '❌ Try again!'}
        </p>
      </div>

      <div 
        className="grid gap-2 p-4 bg-slate-100 rounded-xl"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: `${gridSize * 60 + (gridSize - 1) * 8 + 32}px`
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(index)}
            disabled={phase !== 'input' || isPaused}
            className={`
              w-12 h-12 rounded-lg transition-all duration-200
              ${getTileStyle(index)}
              ${phase === 'input' && !selectedTiles.includes(index) ? 'cursor-pointer' : 'cursor-default'}
            `}
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: Memorize {tileCount} tiles on a {gridSize}x{gridSize} grid
      </p>
    </div>
  );
}
