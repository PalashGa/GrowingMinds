import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface MazeSolverProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

type Cell = 'path' | 'wall' | 'start' | 'end' | 'visited';

export default function MazeSolver({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: MazeSolverProps) {
  const mazeSizes = { 1: 5, 2: 7, 3: 9, 4: 11, 5: 13 };
  const mazeSize = mazeSizes[level];
  
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [endPos, setEndPos] = useState({ x: mazeSize - 2, y: mazeSize - 2 });
  const [moves, setMoves] = useState(0);
  const [round, setRound] = useState(1);
  const [completed, setCompleted] = useState(false);

  const generateMaze = useCallback(() => {
    const newMaze: Cell[][] = Array.from({ length: mazeSize }, () =>
      Array.from({ length: mazeSize }, () => 'wall' as Cell)
    );

    const stack: { x: number; y: number }[] = [];
    const startX = 1, startY = 1;
    
    newMaze[startY][startX] = 'path';
    stack.push({ x: startX, y: startY });

    const directions = [
      { dx: 0, dy: -2 },
      { dx: 2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: -2, dy: 0 }
    ];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors: { x: number; y: number; wx: number; wy: number }[] = [];

      for (const dir of directions) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;
        const wx = current.x + dir.dx / 2;
        const wy = current.y + dir.dy / 2;

        if (nx > 0 && nx < mazeSize - 1 && ny > 0 && ny < mazeSize - 1 && newMaze[ny][nx] === 'wall') {
          neighbors.push({ x: nx, y: ny, wx, wy });
        }
      }

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        newMaze[next.wy][next.wx] = 'path';
        newMaze[next.y][next.x] = 'path';
        stack.push({ x: next.x, y: next.y });
      } else {
        stack.pop();
      }
    }

    newMaze[1][1] = 'start';
    newMaze[mazeSize - 2][mazeSize - 2] = 'end';
    
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setEndPos({ x: mazeSize - 2, y: mazeSize - 2 });
    setMoves(0);
    setCompleted(false);
  }, [mazeSize]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      generateMaze();
    }
  }, [isPlaying, round, generateMaze, isPaused]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (isPaused || completed) return;
    
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize) {
      const cell = maze[newY][newX];
      if (cell !== 'wall') {
        setPlayerPos({ x: newX, y: newY });
        setMoves(prev => prev + 1);
        
        if (cell !== 'start' && cell !== 'end') {
          const newMaze = maze.map(row => [...row]);
          newMaze[newY][newX] = 'visited';
          setMaze(newMaze);
        }
        
        if (newX === endPos.x && newY === endPos.y) {
          setCompleted(true);
          const optimalMoves = (mazeSize - 2) * 2;
          const efficiency = Math.max(0.5, optimalMoves / moves);
          const points = Math.round(50 * level * efficiency);
          addScore(points);
          
          setTimeout(() => {
            setRound(prev => prev + 1);
          }, 1500);
        }
      }
    }
  }, [isPaused, completed, playerPos, mazeSize, maze, endPos, moves, level, addScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(1, 0);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, movePlayer]);

  const getCellStyle = (cell: Cell, x: number, y: number) => {
    if (x === playerPos.x && y === playerPos.y) {
      return 'bg-blue-500';
    }
    switch (cell) {
      case 'wall': return 'bg-gray-800';
      case 'path': return 'bg-amber-100';
      case 'start': return 'bg-green-400';
      case 'end': return 'bg-red-400';
      case 'visited': return 'bg-amber-200';
      default: return 'bg-amber-100';
    }
  };

  const cellSize = Math.min(320 / mazeSize, 40);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Maze</p>
          <p className="text-2xl font-bold text-orange-600">#{round}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Moves</p>
          <p className="text-2xl font-bold text-blue-600">{moves}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Size</p>
          <p className="text-2xl font-bold text-purple-600">{mazeSize}x{mazeSize}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-center text-lg font-medium">
          {completed ? '🎉 Maze Complete!' : '🌀 Find your way to the red exit!'}
        </p>
      </div>

      <div 
        className="border-4 border-gray-800 rounded overflow-hidden mb-4"
        style={{ width: `${cellSize * mazeSize}px` }}
      >
        {maze.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`${getCellStyle(cell, x, y)} flex items-center justify-center transition-colors duration-100`}
                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
              >
                {x === playerPos.x && y === playerPos.y && (
                  <span style={{ fontSize: `${cellSize * 0.6}px` }}>🏃</span>
                )}
                {cell === 'end' && !(x === playerPos.x && y === playerPos.y) && (
                  <span style={{ fontSize: `${cellSize * 0.6}px` }}>🚪</span>
                )}
                {cell === 'start' && !(x === playerPos.x && y === playerPos.y) && (
                  <span style={{ fontSize: `${cellSize * 0.5}px` }}>🏁</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div />
        <button
          onClick={() => movePlayer(0, -1)}
          className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-xl"
          disabled={isPaused || completed}
        >
          ↑
        </button>
        <div />
        <button
          onClick={() => movePlayer(-1, 0)}
          className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-xl"
          disabled={isPaused || completed}
        >
          ←
        </button>
        <button
          onClick={() => movePlayer(0, 1)}
          className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-xl"
          disabled={isPaused || completed}
        >
          ↓
        </button>
        <button
          onClick={() => movePlayer(1, 0)}
          className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-xl"
          disabled={isPaused || completed}
        >
          →
        </button>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Use arrow keys or buttons to move • Level {level}
      </p>
    </div>
  );
}
