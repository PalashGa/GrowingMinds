import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface LogicPuzzlesProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

interface Puzzle {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  category: string;
}

const PUZZLES: Puzzle[] = [
  { question: 'If all roses are flowers and some flowers fade quickly, can we say all roses fade quickly?', options: ['Yes', 'No', 'Maybe'], answer: 1, explanation: 'Just because some flowers fade quickly does not mean all flowers (including roses) do.', category: 'Deduction' },
  { question: 'Complete the pattern: 2, 4, 8, 16, ?', options: ['24', '32', '30'], answer: 1, explanation: 'Each number doubles: 2×2=4, 4×2=8, 8×2=16, 16×2=32', category: 'Patterns' },
  { question: 'If A > B and B > C, which is true?', options: ['A > C', 'C > A', 'A = C'], answer: 0, explanation: 'If A is greater than B, and B is greater than C, then A must be greater than C.', category: 'Comparison' },
  { question: 'Which word does NOT belong: Apple, Banana, Carrot, Orange?', options: ['Apple', 'Banana', 'Carrot', 'Orange'], answer: 2, explanation: 'Carrot is a vegetable, while the others are fruits.', category: 'Classification' },
  { question: 'If it takes 5 machines 5 minutes to make 5 widgets, how long for 100 machines to make 100 widgets?', options: ['5 minutes', '100 minutes', '20 minutes'], answer: 0, explanation: 'Each machine makes 1 widget in 5 minutes. So 100 machines make 100 widgets in 5 minutes.', category: 'Logic' },
  { question: 'Complete: Circle is to Ball as Square is to ?', options: ['Rectangle', 'Cube', 'Triangle'], answer: 1, explanation: 'Circle is a 2D shape, Ball is its 3D form. Square is 2D, Cube is its 3D form.', category: 'Analogy' },
  { question: 'If today is Wednesday, what day will it be in 100 days?', options: ['Friday', 'Saturday', 'Thursday'], answer: 0, explanation: '100 ÷ 7 = 14 weeks + 2 days. Wednesday + 2 = Friday', category: 'Calculation' },
  { question: 'Complete the series: J, F, M, A, M, ?', options: ['J', 'N', 'O'], answer: 0, explanation: 'These are first letters of months: January, February, March, April, May, June', category: 'Patterns' },
  { question: 'A bat and ball cost $1.10. The bat costs $1 more than the ball. How much is the ball?', options: ['$0.10', '$0.05', '$0.15'], answer: 1, explanation: 'If ball = x, then bat = x + 1. So x + (x + 1) = 1.10, meaning 2x = 0.10, x = $0.05', category: 'Algebra' },
  { question: 'Which shape completes the sequence: ○ △ □ ○ △ ?', options: ['○', '□', '△'], answer: 1, explanation: 'The pattern repeats: circle, triangle, square, circle, triangle, square...', category: 'Patterns' },
  { question: 'If all Bloops are Razzies and all Razzies are Lazzies, all Bloops are definitely:', options: ['Razzies only', 'Lazzies', 'Neither'], answer: 1, explanation: 'If Bloops → Razzies → Lazzies, then Bloops are both Razzies AND Lazzies.', category: 'Syllogism' },
  { question: 'What comes next: 1, 1, 2, 3, 5, 8, ?', options: ['11', '13', '15'], answer: 1, explanation: 'Fibonacci sequence: each number is sum of two before it. 5+8=13', category: 'Sequences' },
];

export default function LogicPuzzles({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: LogicPuzzlesProps) {
  const puzzleCounts = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 8 };
  const showExplanations = { 1: true, 2: true, 3: true, 4: false, 5: false };
  
  const puzzleCount = puzzleCounts[level];
  const showExplanation = showExplanations[level];
  
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [usedPuzzles, setUsedPuzzles] = useState<number[]>([]);

  const generatePuzzle = useCallback(() => {
    const availableIndices = PUZZLES.map((_, i) => i).filter(i => !usedPuzzles.includes(i));
    if (availableIndices.length === 0) {
      setUsedPuzzles([]);
      return PUZZLES[0];
    }
    
    const index = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedPuzzles(prev => [...prev, index]);
    return PUZZLES[index];
  }, [usedPuzzles]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      setCurrentPuzzle(generatePuzzle());
      setSelectedAnswer(null);
      setFeedback(null);
    }
  }, [isPlaying, puzzleIndex]);

  const handleAnswer = (answerIndex: number) => {
    if (feedback || isPaused || !currentPuzzle) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentPuzzle.answer;
    setFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      addScore(20 * level + streak * 5);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setGameOver(true), 2000);
        return;
      }
    }
    
    setTimeout(() => {
      if (puzzleIndex + 1 >= puzzleCount) {
        setGameOver(true);
      } else {
        setPuzzleIndex(prev => prev + 1);
      }
    }, showExplanation ? 3000 : 1500);
  };

  const progress = ((puzzleIndex + 1) / puzzleCount) * 100;

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Puzzle</p>
          <p className="text-2xl font-bold text-amber-600">{puzzleIndex + 1}/{puzzleCount}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Lives</p>
          <p className="text-2xl font-bold">
            {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
          </p>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentPuzzle && (
        <>
          <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧩</span>
              <span className="text-sm font-medium text-amber-700">{currentPuzzle.category}</span>
            </div>
            <p className="text-lg font-medium text-gray-700">{currentPuzzle.question}</p>
          </div>

          <div className="w-full space-y-3 mb-6">
            {currentPuzzle.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={!!feedback || isPaused}
                className={`
                  w-full px-6 py-4 rounded-xl text-left font-medium transition-all
                  ${feedback && index === currentPuzzle.answer ? 'bg-green-500 text-white ring-4 ring-green-300' : ''}
                  ${feedback === 'wrong' && selectedAnswer === index ? 'bg-red-500 text-white' : ''}
                  ${!feedback ? 'bg-white border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50' : ''}
                  ${feedback && index !== currentPuzzle.answer && index !== selectedAnswer ? 'opacity-50' : ''}
                `}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 mr-3">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            ))}
          </div>

          {feedback && showExplanation && (
            <div className={`w-full p-4 rounded-xl ${feedback === 'correct' ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className={`font-bold mb-2 ${feedback === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                {feedback === 'correct' ? '✅ Correct!' : '❌ Not quite!'}
              </p>
              <p className="text-sm text-gray-600">
                💡 {currentPuzzle.explanation}
              </p>
            </div>
          )}
        </>
      )}

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {puzzleCount} puzzles{showExplanation ? ' with explanations' : ''}
      </p>
    </div>
  );
}
