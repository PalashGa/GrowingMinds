import { useState, useEffect, useCallback, useRef } from 'react';
import { DifficultyLevel } from './types';

interface BlockPuzzleProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

type PieceShape = number[][];

const TETRIS_PIECES: { shape: PieceShape; color: string }[] = [
  { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' },
  { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
  { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-orange-500' },
  { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-blue-500' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-green-500' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-red-500' },
];

export default function BlockPuzzle({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: BlockPuzzleProps) {
  const boardWidths = { 1: 8, 2: 10, 3: 10, 4: 10, 5: 10 };
  const speeds = { 1: 1000, 2: 800, 3: 600, 4: 400, 5: 250 };
  
  const boardWidth = boardWidths[level];
  const boardHeight = 16;
  const dropSpeed = speeds[level];
  
  const [board, setBoard] = useState<(string | null)[][]>(() => 
    Array.from({ length: boardHeight }, () => Array(boardWidth).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<{ shape: PieceShape; color: string; x: number; y: number } | null>(null);
  const [linesCleared, setLinesCleared] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  
  const lastDropTime = useRef(Date.now());

  const spawnPiece = useCallback(() => {
    const piece = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)];
    const x = Math.floor((boardWidth - piece.shape[0].length) / 2);
    return { ...piece, x, y: 0 };
  }, [boardWidth]);

  const checkCollision = useCallback((piece: typeof currentPiece, board: (string | null)[][], offsetX = 0, offsetY = 0) => {
    if (!piece) return true;
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + offsetX;
          const newY = piece.y + y + offsetY;
          
          if (newX < 0 || newX >= boardWidth || newY >= boardHeight) return true;
          if (newY >= 0 && board[newY][newX]) return true;
        }
      }
    }
    return false;
  }, [boardWidth, boardHeight]);

  const placePiece = useCallback((piece: typeof currentPiece) => {
    if (!piece) return board;
    
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0 && boardY < boardHeight && boardX >= 0 && boardX < boardWidth) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    return newBoard;
  }, [board, boardHeight, boardWidth]);

  const clearLines = useCallback((board: (string | null)[][]) => {
    let cleared = 0;
    const newBoard = board.filter(row => {
      const full = row.every(cell => cell !== null);
      if (full) cleared++;
      return !full;
    });
    
    while (newBoard.length < boardHeight) {
      newBoard.unshift(Array(boardWidth).fill(null));
    }
    
    if (cleared > 0) {
      const points = [0, 40, 100, 300, 1200][cleared] * level;
      addScore(points);
      setLinesCleared(prev => prev + cleared);
    }
    
    return newBoard;
  }, [boardHeight, boardWidth, level, addScore]);

  const rotatePiece = useCallback((piece: typeof currentPiece) => {
    if (!piece) return null;
    
    const rotated: PieceShape = [];
    for (let x = 0; x < piece.shape[0].length; x++) {
      const row: number[] = [];
      for (let y = piece.shape.length - 1; y >= 0; y--) {
        row.push(piece.shape[y][x]);
      }
      rotated.push(row);
    }
    return { ...piece, shape: rotated };
  }, []);

  useEffect(() => {
    if (isPlaying && !isPaused && !currentPiece && !gameEnded) {
      setCurrentPiece(spawnPiece());
    }
  }, [isPlaying, isPaused, currentPiece, spawnPiece, gameEnded]);

  useEffect(() => {
    if (!isPlaying || isPaused || !currentPiece || gameEnded) return;
    
    const interval = setInterval(() => {
      if (Date.now() - lastDropTime.current >= dropSpeed) {
        if (!checkCollision(currentPiece, board, 0, 1)) {
          setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
        } else {
          const newBoard = placePiece(currentPiece);
          const clearedBoard = clearLines(newBoard);
          setBoard(clearedBoard);
          
          const newPiece = spawnPiece();
          if (checkCollision(newPiece, clearedBoard, 0, 0)) {
            setGameEnded(true);
            setGameOver(true);
          } else {
            setCurrentPiece(newPiece);
          }
        }
        lastDropTime.current = Date.now();
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, currentPiece, board, dropSpeed, checkCollision, placePiece, clearLines, spawnPiece, gameEnded, setGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused || !currentPiece || gameEnded) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (!checkCollision(currentPiece, board, -1, 0)) {
            setCurrentPiece(prev => prev ? { ...prev, x: prev.x - 1 } : null);
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (!checkCollision(currentPiece, board, 1, 0)) {
            setCurrentPiece(prev => prev ? { ...prev, x: prev.x + 1 } : null);
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (!checkCollision(currentPiece, board, 0, 1)) {
            setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
            addScore(1);
          }
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          const rotated = rotatePiece(currentPiece);
          if (rotated && !checkCollision(rotated, board, 0, 0)) {
            setCurrentPiece(rotated);
          }
          break;
        case ' ':
          let dropY = 0;
          while (!checkCollision(currentPiece, board, 0, dropY + 1)) {
            dropY++;
          }
          setCurrentPiece(prev => prev ? { ...prev, y: prev.y + dropY } : null);
          addScore(dropY * 2);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, currentPiece, board, checkCollision, rotatePiece, addScore, gameEnded]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < boardHeight && boardX >= 0 && boardX < boardWidth) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  const cellSize = Math.min(20, 300 / boardWidth);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Lines</p>
          <p className="text-2xl font-bold text-rose-600">{linesCleared}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Speed</p>
          <p className="text-2xl font-bold text-purple-600">L{level}</p>
        </div>
      </div>

      <div 
        className="border-4 border-gray-800 rounded bg-gray-900"
        style={{ padding: '2px' }}
      >
        {renderBoard().map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`${cell || 'bg-gray-800'} border border-gray-700`}
                style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            if (currentPiece && !checkCollision(currentPiece, board, -1, 0)) {
              setCurrentPiece(prev => prev ? { ...prev, x: prev.x - 1 } : null);
            }
          }}
          className="p-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
          disabled={isPaused || gameEnded}
        >
          ←
        </button>
        <button
          onClick={() => {
            const rotated = rotatePiece(currentPiece);
            if (rotated && !checkCollision(rotated, board, 0, 0)) {
              setCurrentPiece(rotated);
            }
          }}
          className="p-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
          disabled={isPaused || gameEnded}
        >
          ↻
        </button>
        <button
          onClick={() => {
            if (currentPiece && !checkCollision(currentPiece, board, 1, 0)) {
              setCurrentPiece(prev => prev ? { ...prev, x: prev.x + 1 } : null);
            }
          }}
          className="p-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
          disabled={isPaused || gameEnded}
        >
          →
        </button>
        <div />
        <button
          onClick={() => {
            if (currentPiece && !checkCollision(currentPiece, board, 0, 1)) {
              setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
              addScore(1);
            }
          }}
          className="p-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
          disabled={isPaused || gameEnded}
        >
          ↓
        </button>
        <div />
      </div>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Arrow keys to move • Up to rotate • Space to drop
      </p>
    </div>
  );
}
