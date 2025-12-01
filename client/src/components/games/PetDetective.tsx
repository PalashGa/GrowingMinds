import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface PetDetectiveProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Pet {
  type: string;
  color: string;
  accessory: string;
}

interface House {
  color: string;
  pet: Pet | null;
}

const PET_TYPES = ['🐕', '🐈', '🐇', '🐹', '🦜', '🐢'];
const PET_COLORS = ['brown', 'white', 'black', 'orange', 'gray'];
const ACCESSORIES = ['🎀', '🎩', '👓', '⭐', '💎', '🌸'];
const HOUSE_COLORS = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200'];

export default function PetDetective({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: PetDetectiveProps) {
  const houseCounts = { 1: 3, 2: 4, 3: 5, 4: 5, 5: 6 };
  const clueCounts = { 1: 2, 2: 2, 3: 3, 4: 3, 5: 4 };
  
  const houseCount = houseCounts[level];
  const clueCount = clueCounts[level];
  
  const [houses, setHouses] = useState<House[]>([]);
  const [targetPet, setTargetPet] = useState<Pet | null>(null);
  const [targetHouseIndex, setTargetHouseIndex] = useState(-1);
  const [clues, setClues] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [lives, setLives] = useState(3);

  const generatePuzzle = useCallback(() => {
    const shuffledColors = [...HOUSE_COLORS].sort(() => Math.random() - 0.5).slice(0, houseCount);
    
    const targetIndex = Math.floor(Math.random() * houseCount);
    const pet: Pet = {
      type: PET_TYPES[Math.floor(Math.random() * PET_TYPES.length)],
      color: PET_COLORS[Math.floor(Math.random() * PET_COLORS.length)],
      accessory: ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)]
    };
    
    const newHouses: House[] = shuffledColors.map((color, i) => ({
      color,
      pet: i === targetIndex ? pet : null
    }));
    
    const possibleClues = [
      `The pet is a ${pet.type}`,
      `The pet is ${pet.color}`,
      `The pet wears ${pet.accessory}`,
      `The house is ${shuffledColors[targetIndex].replace('bg-', '').replace('-200', '')}`,
    ];
    
    if (targetIndex === 0) possibleClues.push('The pet is in the first house');
    if (targetIndex === houseCount - 1) possibleClues.push('The pet is in the last house');
    if (targetIndex > 0) possibleClues.push(`The pet is NOT in house ${targetIndex}`);
    
    const selectedClues = possibleClues.sort(() => Math.random() - 0.5).slice(0, clueCount);
    
    setHouses(newHouses);
    setTargetPet(pet);
    setTargetHouseIndex(targetIndex);
    setClues(selectedClues);
    setFeedback(null);
    setShowSolution(false);
  }, [houseCount, clueCount]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      generatePuzzle();
    }
  }, [isPlaying, round, generatePuzzle, isPaused]);

  const handleHouseClick = (index: number) => {
    if (feedback || isPaused) return;
    
    if (index === targetHouseIndex) {
      setFeedback('correct');
      addScore(20 * level);
      setTimeout(() => {
        setRound(prev => prev + 1);
      }, 1000);
    } else {
      setFeedback('wrong');
      setShowSolution(true);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setGameOver(true), 1500);
      } else {
        setTimeout(() => {
          setRound(prev => prev + 1);
        }, 2000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Case</p>
          <p className="text-2xl font-bold text-violet-600">#{round}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Lives</p>
          <p className="text-2xl font-bold">
            {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-center text-lg font-medium mb-2">
          🔍 Find the hidden pet using the clues!
        </p>
        {targetPet && (
          <div className="flex items-center justify-center gap-2 bg-violet-100 p-2 rounded-lg">
            <span className="text-2xl">{targetPet.type}</span>
            <span className="text-sm">{targetPet.accessory}</span>
          </div>
        )}
      </div>

      <div className="bg-amber-50 p-4 rounded-xl mb-6 max-w-md">
        <h4 className="font-bold text-amber-800 mb-2">📋 Clues:</h4>
        <ul className="space-y-1">
          {clues.map((clue, i) => (
            <li key={i} className="text-sm text-amber-700 flex items-center gap-2">
              <span className="text-amber-500">•</span>
              {clue}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3 mb-6">
        {houses.map((house, index) => (
          <button
            key={index}
            onClick={() => handleHouseClick(index)}
            disabled={!!feedback || isPaused}
            className={`
              relative w-20 h-24 rounded-t-3xl ${house.color} 
              border-4 border-b-8 border-gray-700
              transition-all duration-200
              ${!feedback ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
              ${feedback && index === targetHouseIndex ? 'ring-4 ring-green-500' : ''}
              ${feedback === 'wrong' && showSolution && index === targetHouseIndex ? 'animate-bounce' : ''}
            `}
          >
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-8 bg-gray-700 rounded-t" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-700" />
            
            {(showSolution || feedback === 'correct') && index === targetHouseIndex && targetPet && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl">
                {targetPet.type}
                <span className="text-xs absolute -top-1 -right-1">{targetPet.accessory}</span>
              </div>
            )}
            
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600">
              {index + 1}
            </div>
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`text-center text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
          {feedback === 'correct' ? '🎉 Case solved!' : '❌ Wrong house! Look at the clues again.'}
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {houseCount} houses, {clueCount} clues
      </p>
    </div>
  );
}
