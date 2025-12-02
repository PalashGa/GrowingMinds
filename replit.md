# Smart Study Zone - Child Development Platform

## Overview

Smart Study Zone is a comprehensive child development platform that provides assessment tools, educational programs, and progress tracking for children aged 5-16. The application offers behavioral assessments, yoga programs, nutrition planning, robotics education, and educational games to support holistic child development.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod for validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit OpenID Connect (OIDC) with Passport.js
- **Session Management**: Express sessions with PostgreSQL storage
- **API Pattern**: RESTful endpoints with JSON responses

### Database Design
- **Schema Organization**: Shared schema definitions between client and server
- **Key Entities**:
  - Users (parent accounts with Stripe integration)
  - Children (linked to parent users with height/weight tracking)
  - Assessment types, questions, and results (5 types: Behavioral, Personality, IQ, Career, Strengths & Weakness)
  - Yoga programs and sessions
  - Yoga poses (21 comprehensive poses organized by developmental categories)
  - Yoga pose sessions for tracking individual pose practice
  - Nutrition plans and daily tracking
  - Recipes library with nutrition information
  - Nutritional goals per child
  - Meal preferences (dietary type, allergies, dislikes)
  - Progress photos for growth tracking
  - Robotics modules and progress tracking
  - Educational games and scores (26 built-in interactive games)
- **Migration Strategy**: Drizzle Kit for schema migrations

### Educational Games System
- **26 Interactive Games** organized into 6 categories with 5 difficulty levels each:
  
- **Cognitive Skills (5 games)**:
  - Memory Matrix: Pattern recall on grids
  - Lost in Migration: Selective attention training
  - Speed Match: Processing speed enhancement
  - Pet Detective: Logical deduction puzzles
  - Raindrops: Math fluency with falling problems

- **Emotional Intelligence (4 games)**:
  - Emoji Charades: Emotion expression recognition
  - Emotion Recognition: Identifying feelings in scenarios
  - Calm Breathing: Guided breathing exercises with visual feedback
  - Reflection Game: Self-awareness journaling prompts

- **Logic & Reasoning (4 games)**:
  - Maze Solver: Spatial navigation puzzles
  - Logic Puzzles: Deductive reasoning challenges
  - Block Puzzle: Tetris-style planning game
  - Number Sequence: Pattern recognition in sequences

- **Academic Skills (5 games)**:
  - Quick Math: Speed arithmetic challenges
  - Word Builder: Letter unscrambling puzzles
  - Riddle Challenge: Verbal reasoning brain teasers
  - Math Puzzles: Word problems with multiple choice
  - Math Arcade: Arcade-style falling math problems

- **Memory Training (3 games)**:
  - Card Match: Classic memory card matching
  - Pattern Matching: Visual pattern recognition
  - Hidden Object: Attention-to-detail scene searches

- **Creative & Health (5 games)**:
  - Role Play Adventure: Decision-making story scenarios
  - Robot Designer: Creative engineering design
  - Healthy Choices: Health education quiz game
  - Zen Garden: Relaxation and creativity builder

### Robotics Learning System
- **Target Audience**: Kids aged 8-16 years
- **Core Concept**: Robotics = Machines + Sensors + Coding + Creativity

- **7 Educational Modules**:

1. **What Is a Robot?**
   - Definition of robots and smart machines
   - Examples: vacuum robots, drones, robot toys, factory robots
   - Fun facts and interactive quizzes

2. **Robot Parts**
   - Sensors (eyes & ears of the robot)
   - Motors (robot's muscles)
   - Battery (robot's energy)
   - Wheels & Arms (movement and manipulation)
   - Brain/Microcontroller (Arduino, Raspberry Pi)

3. **How Robots Move**
   - How wheels turn with motors
   - Motor mechanics and electricity
   - Line following using sensors
   - Movement commands: forward, backward, turn, spin

4. **Sensors - Robot's Senses**
   - Light sensor (like our eyes)
   - Sound sensor (like our ears)
   - Touch sensor (like our skin)
   - Distance sensor (judging distance)
   - Temperature sensor (hot/cold detection)

5. **Basics of Coding**
   - Simple commands: move forward, turn, stop
   - Obstacle detection and path following
   - Block-based programming (Scratch, ages 5-10)
   - Python programming (ages 10+)
   - Arduino C++ (ages 12+)

6. **Real-Life Uses of Robots**
   - Robots in hospitals (surgery, medicine delivery)
   - Robots in space (Mars rovers, satellite repair)
   - Robots in homes (vacuum, smart assistants)
   - Robots in industries (assembly, welding, packaging)
   - Future careers in robotics

7. **Mini Robotics Activities**
   - Build a Cardboard Robot
   - Human Robot Game
   - Draw a Robot Blueprint
   - Sensor Scavenger Hunt
   - Online coding tools: Scratch, Code.org, Tinkercad

- **Module Features**:
  - Interactive content with visual examples
  - Step-by-step instructions
  - Quizzes and challenges
  - Progress tracking per child
  - Age-appropriate difficulty levels

- **Game Features**:
  - 5 Difficulty Levels per game (Easy to Master)
  - Lives/streak system for engagement
  - Score tracking and high scores per child
  - Age-appropriate filtering (ages 5-16)
  - GameWrapper component for consistent UI
  - Timer, pause, and reset functionality
  - Detailed feedback and explanations
  - Progress saved to database

### Yoga Poses Feature
- **21 Comprehensive Poses** organized by developmental benefits:
  - Openness: Cobra Pose, Wild Thing, Wheel Pose
  - Conscientiousness: Mountain Pose, Warrior I, Plank Pose
  - Extraversion: Sun Salutation, Dancer's Pose
  - Agreeableness: Partner Tree Pose, Heart Opening Pose
  - Emotional Stability: Child's Pose, Corpse Pose
  - Logical Reasoning: Eagle Pose, Crow Pose
  - Problem-Solving: Headstand Prep, Handstand Prep
  - Verbal Comprehension: Lion's Breath, Humming Bee Breath
  - Mathematical Skills: Scale Pose, Boat Pose
  - Working Memory: Sequence Flow
- **Personalized Recommendations**: Age-appropriate poses based on child's age, height, and weight
- **Category Filtering**: Browse poses by developmental benefit category
- **Pose Details**: Sanskrit names, instructions, benefits, difficulty levels, and age ranges
- **Interactive Features**:
  - Practice Session Timer: Start, pause, reset, and complete timed practice sessions
  - Step-by-Step Guidance: Navigate through instructions with previous/next controls
  - Visual Progress Tracking: Current step highlighting and completion indicators
- **Child-Friendly UI**: Colorful gradients, emojis, and engaging visual design

### Nutrition Planning System
- **Three Main Sections**:
  - Nutrition Dashboard (/nutrition): Overview with meal plans, nutritional goals, recipe access, progress photos
  - Meal Planner (/nutrition/planner): Weekly calendar with drag-and-drop meal planning
  - Recipe Library (/nutrition/recipes): Searchable database with filters and detailed recipes

- **Nutrition Dashboard Features**:
  - Current week's meal plan with quick view of daily meals
  - Nutritional goals tracking (calories, protein, carbs, fats, water, fiber)
  - Goals calculated based on child's age and weight
  - Hydration tracker with visual progress
  - Quick access to recipes and meal planner
  - Progress photos upload for growth tracking

- **Meal Planner Features**:
  - Weekly calendar view (Monday-Sunday)
  - Drag-and-drop meals from library to calendar
  - Meal categories: Breakfast, Lunch, Dinner, Snacks
  - Nutritional information per meal
  - Add custom meals functionality
  - Family preference settings (veg/non-veg, allergies, dislikes)
  - Week navigation (previous/next)

- **Recipe Library Features**:
  - Searchable database of healthy recipes
  - Filters: Category, Dietary type (Veg/Vegan/Non-veg/Jain), Difficulty
  - Tag-based browsing (high-protein, iron-rich, brain-food, etc.)
  - Detailed recipe view with ingredients and step-by-step instructions
  - Nutrition information per serving (calories, protein, carbs, fats, fiber)
  - Favorites system
  - Age-appropriate recommendations (5-16 years)

### Authentication & Authorization
- **Identity Provider**: Replit OIDC for seamless platform integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Route Protection**: Middleware-based authentication checks
- **User Management**: Automatic user creation/updates on login

### API Structure
- **Endpoint Pattern**: `/api/{resource}` with RESTful conventions
- **Error Handling**: Centralized error middleware with status codes
- **Request Logging**: Detailed API request/response logging
- **Data Validation**: Zod schemas for request/response validation

## External Dependencies

### Database & Hosting
- **PostgreSQL**: Primary database using Neon serverless
- **Drizzle ORM**: Type-safe database operations and migrations
- **WebSocket Support**: Neon serverless with ws library for real-time connections

### Authentication Services
- **Replit OIDC**: Platform-native authentication
- **OpenID Client**: Standards-compliant OIDC implementation
- **Passport.js**: Authentication middleware and strategy handling

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation and formatting

### Development Tools
- **Vite**: Fast build tool with HMR support
- **ESBuild**: Fast JavaScript bundler for production
- **TanStack Query**: Server state management with caching
- **React Hook Form**: Performant form handling
- **Zod**: Runtime type validation

### Payment Processing
- **Stripe**: Payment processing with React integration
- **Subscription Management**: Premium and family plan support

### Data Visualization
- **Recharts**: Chart library for progress tracking and analytics
- **Progress Components**: Custom progress visualization for child development metrics