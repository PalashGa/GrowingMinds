import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface CardMatchProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'];

export default function CardMatch({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: CardMatchProps) {
  const pairCounts = { 1: 4, 2: 6, 3: 8, 4: 10, 5: 12 };
  const pairCount = pairCounts[level];
  
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [streak, setStreak] = useState(0);

  const initializeCards = useCallback(() => {
    const selectedEmojis = CARD_EMOJIS.slice(0, pairCount);
    const cardPairs = [...selectedEmojis, ...selectedEmojis];
    
    const shuffled = cardPairs
      .map((emoji, i) => ({ emoji, id: i, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ emoji, id }, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setStreak(0);
  }, [pairCount]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      initializeCards();
    }
  }, [isPlaying, initializeCards, isPaused]);

  const handleCardClick = (cardId: number) => {
    if (isPaused || isChecking) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;
    
    const newCards = cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);
      
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true } 
              : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
          
          const newMatched = matchedPairs + 1;
          setMatchedPairs(newMatched);
          setStreak(prev => prev + 1);
          
          const points = (10 + streak * 2) * level;
          addScore(points);
          
          if (newMatched === pairCount) {
            setTimeout(() => setGameOver(true), 500);
          }
        }, 300);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
          setStreak(0);
        }, 1000);
      }
    }
  };

  const gridCols = pairCount <= 6 ? 4 : pairCount <= 10 ? 5 : 6;
  const cardSize = pairCount <= 6 ? 'w-16 h-16' : pairCount <= 10 ? 'w-14 h-14' : 'w-12 h-12';
  const emojiSize = pairCount <= 6 ? 'text-3xl' : pairCount <= 10 ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Pairs</p>
          <p className="text-2xl font-bold text-red-600">{matchedPairs}/{pairCount}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Moves</p>
          <p className="text-2xl font-bold text-blue-600">{moves}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-center text-lg font-medium">
          🃏 Match all the pairs!
        </p>
      </div>

      <div 
        className="grid gap-2 p-4 bg-red-50 rounded-xl"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={isPaused || card.isMatched || card.isFlipped}
            className={`
              ${cardSize} rounded-xl transition-all duration-300 transform
              ${card.isMatched 
                ? 'bg-green-400 scale-90 opacity-60' 
                : card.isFlipped 
                  ? 'bg-white shadow-lg rotate-y-180' 
                  : 'bg-gradient-to-br from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-md cursor-pointer'}
              flex items-center justify-center
            `}
          >
            {(card.isFlipped || card.isMatched) ? (
              <span className={emojiSize}>{card.emoji}</span>
            ) : (
              <span className={`${emojiSize} text-white`}>❓</span>
            )}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {pairCount} pairs ({pairCount * 2} cards)
      </p>
    </div>
  );
}
