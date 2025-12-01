export type GameCategory = 
  | 'cognitive' 
  | 'emotional' 
  | 'logic' 
  | 'academic' 
  | 'memory' 
  | 'creative';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  icon: string;
  color: string;
  benefits: string[];
  ageMin: number;
  ageMax: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  level: DifficultyLevel;
  timeElapsed: number;
  gameOver: boolean;
  showResults: boolean;
}

export interface GameResult {
  score: number;
  level: DifficultyLevel;
  timeSpent: number;
  accuracy?: number;
  streak?: number;
}

export const GAME_CATEGORIES: Record<GameCategory, { 
  name: string; 
  color: string; 
  bgColor: string;
  icon: string;
  description: string;
}> = {
  cognitive: {
    name: 'Cognitive Skills',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '🧠',
    description: 'Build memory, attention, and processing speed'
  },
  emotional: {
    name: 'Emotional Intelligence',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: '💚',
    description: 'Develop emotional awareness and regulation'
  },
  logic: {
    name: 'Logic & Reasoning',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '🧩',
    description: 'Strengthen problem-solving and spatial thinking'
  },
  academic: {
    name: 'Academic Skills',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: '📚',
    description: 'Boost math, reading, and language abilities'
  },
  memory: {
    name: 'Memory Training',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '🎯',
    description: 'Enhance short-term memory and pattern recognition'
  },
  creative: {
    name: 'Creative & Health',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: '🎨',
    description: 'Foster creativity, relaxation, and healthy habits'
  }
};

export const ALL_GAMES: GameConfig[] = [
  // Cognitive Games
  {
    id: 'memory-matrix',
    name: 'Memory Matrix',
    description: 'Remember and recreate patterns on a grid. Builds visual memory and attention span.',
    category: 'cognitive',
    icon: '🟦',
    color: 'bg-blue-500',
    benefits: ['Visual Memory', 'Pattern Recall', 'Attention Span'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'lost-in-migration',
    name: 'Lost in Migration',
    description: 'Find the bird flying the wrong direction. Trains selective attention.',
    category: 'cognitive',
    icon: '🐦',
    color: 'bg-sky-500',
    benefits: ['Selective Attention', 'Focus', 'Distraction Filtering'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'speed-match',
    name: 'Speed Match',
    description: 'Match symbols quickly before time runs out. Enhances processing speed.',
    category: 'cognitive',
    icon: '⚡',
    color: 'bg-indigo-500',
    benefits: ['Processing Speed', 'Brain Flexibility', 'Quick Thinking'],
    ageMin: 6,
    ageMax: 16
  },
  {
    id: 'pet-detective',
    name: 'Pet Detective',
    description: 'Solve puzzles to find the hidden pet. Strengthens logical reasoning.',
    category: 'cognitive',
    icon: '🔍',
    color: 'bg-violet-500',
    benefits: ['Problem Solving', 'Logical Reasoning', 'Deduction'],
    ageMin: 6,
    ageMax: 16
  },
  {
    id: 'raindrops',
    name: 'Raindrops',
    description: 'Solve math problems before raindrops fall. Improves math fluency.',
    category: 'cognitive',
    icon: '💧',
    color: 'bg-cyan-500',
    benefits: ['Math Fluency', 'Mental Calculation', 'Speed'],
    ageMin: 6,
    ageMax: 16
  },

  // Emotional Games
  {
    id: 'emoji-charades',
    name: 'Emoji Charades',
    description: 'Guess emotions from emoji sequences. Improves emotional expression.',
    category: 'emotional',
    icon: '😊',
    color: 'bg-green-500',
    benefits: ['Emotional Expression', 'Recognition', 'Empathy'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'emotion-recognition',
    name: 'Emotion Recognition',
    description: 'Identify emotions in faces and situations. Increases emotional intelligence.',
    category: 'emotional',
    icon: '🎭',
    color: 'bg-emerald-500',
    benefits: ['Emotional Intelligence', 'Empathy', 'Social Skills'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'calm-breathing',
    name: 'Calm Breathing',
    description: 'Follow breathing exercises with visual guides. Helps with stress management.',
    category: 'emotional',
    icon: '🌬️',
    color: 'bg-teal-500',
    benefits: ['Stress Management', 'Focus', 'Relaxation'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'reflection-game',
    name: 'Reflection Game',
    description: 'Reflect on feelings and daily experiences. Builds self-awareness.',
    category: 'emotional',
    icon: '🪞',
    color: 'bg-lime-500',
    benefits: ['Self-Awareness', 'Emotional Regulation', 'Mindfulness'],
    ageMin: 6,
    ageMax: 16
  },

  // Logic Games
  {
    id: 'maze-solver',
    name: 'Maze Solver',
    description: 'Navigate through increasingly complex mazes. Boosts spatial intelligence.',
    category: 'logic',
    icon: '🌀',
    color: 'bg-orange-500',
    benefits: ['Spatial Intelligence', 'Planning', 'Problem Solving'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'logic-puzzles',
    name: 'Logic Puzzles',
    description: 'Solve logical reasoning challenges. Strengthens structured thinking.',
    category: 'logic',
    icon: '🧩',
    color: 'bg-amber-500',
    benefits: ['Logical Reasoning', 'Critical Thinking', 'Analysis'],
    ageMin: 6,
    ageMax: 16
  },
  {
    id: 'block-puzzle',
    name: 'Block Puzzle',
    description: 'Fit falling blocks to complete rows. Improves planning and speed.',
    category: 'logic',
    icon: '🧱',
    color: 'bg-rose-500',
    benefits: ['Planning', 'Speed', 'Spatial Awareness'],
    ageMin: 6,
    ageMax: 16
  },
  {
    id: 'number-sequence',
    name: 'Number Sequence',
    description: 'Find patterns in number sequences. Helps with pattern understanding.',
    category: 'logic',
    icon: '🔢',
    color: 'bg-pink-500',
    benefits: ['Memory', 'Pattern Recognition', 'Math Skills'],
    ageMin: 6,
    ageMax: 16
  },

  // Academic Games
  {
    id: 'quick-math',
    name: 'Quick Math',
    description: 'Solve arithmetic problems as fast as possible. Builds calculation speed.',
    category: 'academic',
    icon: '➕',
    color: 'bg-yellow-500',
    benefits: ['Arithmetic Speed', 'Math Performance', 'Accuracy'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'word-builder',
    name: 'Word Builder',
    description: 'Create words from letter tiles. Improves vocabulary and spelling.',
    category: 'academic',
    icon: '📝',
    color: 'bg-gold-500',
    benefits: ['Vocabulary', 'Spelling', 'Language Skills'],
    ageMin: 6,
    ageMax: 16
  },
  {
    id: 'riddle-challenge',
    name: 'Riddle Challenge',
    description: 'Solve creative riddles and brain teasers. Enhances verbal reasoning.',
    category: 'academic',
    icon: '❓',
    color: 'bg-lime-500',
    benefits: ['Creativity', 'Verbal Reasoning', 'Comprehension'],
    ageMin: 7,
    ageMax: 16
  },
  {
    id: 'math-puzzles',
    name: 'Math Puzzles',
    description: 'Solve mathematical puzzles and problems. Assesses math ability.',
    category: 'academic',
    icon: '🔣',
    color: 'bg-emerald-500',
    benefits: ['Math Ability', 'Logical Skills', 'Problem Solving'],
    ageMin: 6,
    ageMax: 16
  },
  {
    id: 'math-arcade',
    name: 'Math Arcade',
    description: 'Play arcade-style math games. Builds numeracy skills fun way.',
    category: 'academic',
    icon: '🎮',
    color: 'bg-cyan-500',
    benefits: ['Numeracy', 'Academic Confidence', 'Quick Thinking'],
    ageMin: 5,
    ageMax: 16
  },

  // Memory Games
  {
    id: 'card-match',
    name: 'Card Match',
    description: 'Match pairs of cards from memory. Strengthens short-term memory.',
    category: 'memory',
    icon: '🃏',
    color: 'bg-red-500',
    benefits: ['Short-term Memory', 'Focus', 'Pattern Recall'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'pattern-matching',
    name: 'Pattern Matching',
    description: 'Match visual patterns quickly. Enhances visual recognition.',
    category: 'memory',
    icon: '🎨',
    color: 'bg-rose-500',
    benefits: ['Visual Recognition', 'Cognitive Flexibility', 'Speed'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'hidden-object',
    name: 'Hidden Object',
    description: 'Find hidden objects in complex scenes. Improves attention to detail.',
    category: 'memory',
    icon: '👁️',
    color: 'bg-fuchsia-500',
    benefits: ['Attention to Detail', 'Visual Scanning', 'Patience'],
    ageMin: 5,
    ageMax: 16
  },

  // Creative & Health Games
  {
    id: 'role-play',
    name: 'Role Play Adventure',
    description: 'Make decisions in story scenarios. Builds social understanding.',
    category: 'creative',
    icon: '🎪',
    color: 'bg-purple-500',
    benefits: ['Creativity', 'Social Understanding', 'Decision Making'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'robot-designer',
    name: 'Robot Designer',
    description: 'Design and customize robots. Encourages engineering thinking.',
    category: 'creative',
    icon: '🤖',
    color: 'bg-violet-500',
    benefits: ['Creativity', 'Engineering Thinking', 'Imagination'],
    ageMin: 6,
    ageMax: 16
  },
  {
    id: 'healthy-choices',
    name: 'Healthy Choices',
    description: 'Make decisions about food and habits. Builds health awareness.',
    category: 'creative',
    icon: '🥗',
    color: 'bg-green-600',
    benefits: ['Health Awareness', 'Decision Making', 'Nutrition Knowledge'],
    ageMin: 5,
    ageMax: 16
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    description: 'Create peaceful garden designs. Reduces stress and builds patience.',
    category: 'creative',
    icon: '🌸',
    color: 'bg-pink-400',
    benefits: ['Stress Relief', 'Focus', 'Patience', 'Creativity'],
    ageMin: 5,
    ageMax: 16
  }
];

export const getGamesByCategory = (category: GameCategory) => {
  return ALL_GAMES.filter(game => game.category === category);
};

export const getGameById = (id: string) => {
  return ALL_GAMES.find(game => game.id === id);
};

export const getLevelConfig = (level: DifficultyLevel) => {
  const configs = {
    1: { name: 'Easy', timeMultiplier: 1.5, sizeMultiplier: 0.6, color: 'bg-green-500' },
    2: { name: 'Medium', timeMultiplier: 1.2, sizeMultiplier: 0.8, color: 'bg-yellow-500' },
    3: { name: 'Hard', timeMultiplier: 1.0, sizeMultiplier: 1.0, color: 'bg-orange-500' },
    4: { name: 'Expert', timeMultiplier: 0.8, sizeMultiplier: 1.2, color: 'bg-red-500' },
    5: { name: 'Master', timeMultiplier: 0.6, sizeMultiplier: 1.5, color: 'bg-purple-500' }
  };
  return configs[level];
};
