import { useState, useEffect, useCallback } from 'react';
import { DifficultyLevel } from './types';

interface CalmBreathingProps {
  level: DifficultyLevel;
  isPlaying: boolean;
  isPaused: boolean;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATHING_PATTERNS = {
  1: { name: 'Simple Breath', inhale: 3, hold: 0, exhale: 3, rest: 0, cycles: 3 },
  2: { name: 'Box Breathing', inhale: 4, hold: 2, exhale: 4, rest: 0, cycles: 4 },
  3: { name: 'Relaxing Breath', inhale: 4, hold: 4, exhale: 4, rest: 2, cycles: 4 },
  4: { name: 'Deep Calm', inhale: 4, hold: 7, exhale: 8, rest: 0, cycles: 5 },
  5: { name: 'Master Breath', inhale: 5, hold: 5, exhale: 7, rest: 3, cycles: 6 },
};

const PHASE_COLORS: Record<BreathPhase, string> = {
  inhale: 'from-blue-400 to-cyan-400',
  hold: 'from-purple-400 to-pink-400',
  exhale: 'from-green-400 to-emerald-400',
  rest: 'from-amber-400 to-orange-400',
};

const PHASE_MESSAGES: Record<BreathPhase, string> = {
  inhale: 'Breathe in slowly...',
  hold: 'Hold your breath...',
  exhale: 'Breathe out gently...',
  rest: 'Rest and relax...',
};

const PHASE_ICONS: Record<BreathPhase, string> = {
  inhale: '🌬️',
  hold: '✨',
  exhale: '🍃',
  rest: '💫',
};

export default function CalmBreathing({ 
  level, 
  isPlaying, 
  isPaused, 
  addScore, 
  setGameOver 
}: CalmBreathingProps) {
  const pattern = BREATHING_PATTERNS[level];
  
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [timer, setTimer] = useState(pattern.inhale);
  const [cycle, setCycle] = useState(1);
  const [circleSize, setCircleSize] = useState(100);
  const [completedBreaths, setCompletedBreaths] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const getNextPhase = useCallback((currentPhase: BreathPhase): BreathPhase => {
    switch (currentPhase) {
      case 'inhale':
        return pattern.hold > 0 ? 'hold' : 'exhale';
      case 'hold':
        return 'exhale';
      case 'exhale':
        return pattern.rest > 0 ? 'rest' : 'inhale';
      case 'rest':
        return 'inhale';
    }
  }, [pattern]);

  const getPhaseDuration = useCallback((phase: BreathPhase): number => {
    switch (phase) {
      case 'inhale': return pattern.inhale;
      case 'hold': return pattern.hold;
      case 'exhale': return pattern.exhale;
      case 'rest': return pattern.rest;
    }
  }, [pattern]);

  useEffect(() => {
    if (!isPlaying || isPaused || isComplete) return;
    
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          const nextPhase = getNextPhase(phase);
          const nextDuration = getPhaseDuration(nextPhase);
          
          if (phase === 'exhale' || (phase === 'rest' && pattern.rest > 0)) {
            const newCompletedBreaths = completedBreaths + 1;
            setCompletedBreaths(newCompletedBreaths);
            addScore(10 * level);
            
            if (cycle >= pattern.cycles) {
              setIsComplete(true);
              setTimeout(() => setGameOver(true), 2000);
              return 0;
            }
            setCycle(prev => prev + 1);
          }
          
          setPhase(nextPhase);
          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, phase, pattern, cycle, level, addScore, getNextPhase, getPhaseDuration, completedBreaths, isComplete, setGameOver]);

  useEffect(() => {
    if (phase === 'inhale') {
      setCircleSize(200);
    } else if (phase === 'exhale') {
      setCircleSize(100);
    }
  }, [phase]);

  const progress = ((pattern.cycles - cycle + 1) / pattern.cycles) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Breath</p>
          <p className="text-2xl font-bold text-teal-600">{cycle}/{pattern.cycles}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Pattern</p>
          <p className="text-lg font-bold text-purple-600">{pattern.name}</p>
        </div>
      </div>

      <div className="mb-4 text-center">
        <p className="text-lg font-medium text-gray-600">
          {isComplete ? '🎉 Amazing! You completed all breaths!' : PHASE_MESSAGES[phase]}
        </p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <div className="absolute w-full h-full rounded-full bg-gray-100" />
        
        <div 
          className={`
            absolute rounded-full bg-gradient-to-br ${PHASE_COLORS[phase]}
            transition-all duration-1000 ease-in-out
            flex items-center justify-center
          `}
          style={{ 
            width: `${circleSize}px`, 
            height: `${circleSize}px`,
            opacity: 0.8
          }}
        >
          <div className="text-center text-white">
            <p className="text-4xl mb-1">{PHASE_ICONS[phase]}</p>
            <p className="text-3xl font-bold">{timer}</p>
          </div>
        </div>

        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex gap-2 mb-4">
        {['inhale', 'hold', 'exhale', 'rest'].map((p) => {
          const duration = getPhaseDuration(p as BreathPhase);
          if (duration === 0) return null;
          return (
            <div 
              key={p}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                ${phase === p ? `bg-gradient-to-r ${PHASE_COLORS[p as BreathPhase]} text-white` : 'bg-gray-100 text-gray-600'}
              `}
            >
              {PHASE_ICONS[p as BreathPhase]} {p}: {duration}s
            </div>
          );
        })}
      </div>

      <div className="flex gap-1">
        {Array.from({ length: pattern.cycles }).map((_, i) => (
          <div 
            key={i}
            className={`
              w-8 h-2 rounded-full
              ${i < cycle ? 'bg-teal-500' : 'bg-gray-200'}
            `}
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground text-center">
        Level {level}: {pattern.inhale}-{pattern.hold}-{pattern.exhale}{pattern.rest > 0 ? `-${pattern.rest}` : ''} breathing
      </p>
    </div>
  );
}
