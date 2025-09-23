import { db } from "./db";
import { 
  assessmentTypes, 
  assessmentQuestions, 
  yogaPrograms, 
  roboticsModules, 
  educationalGames 
} from "@shared/schema";

export async function seedDatabase() {
  try {
    // Seed Assessment Types
    const assessmentTypesData = [
      {
        id: 'behavioral-test',
        name: 'behavioral',
        displayName: 'Behavioral Assessment',
        description: 'Comprehensive behavioral pattern analysis to understand your child\'s personality and behavioral tendencies.',
        ageMin: 5,
        ageMax: 16,
        duration: 30,
        isActive: true
      },
      {
        id: 'personality-test',
        name: 'personality',
        displayName: 'Personality Test',
        description: 'Discover your child\'s unique personality traits and strengths.',
        ageMin: 8,
        ageMax: 16,
        duration: 25,
        isActive: true
      },
      {
        id: 'iq-test',
        name: 'iq',
        displayName: 'IQ Assessment',
        description: 'Measure cognitive abilities and intellectual potential.',
        ageMin: 9,
        ageMax: 16,
        duration: 45,
        isActive: true
      },
      {
        id: 'career-test',
        name: 'career',
        displayName: 'Career Orientation',
        description: 'Explore potential career paths based on interests and aptitudes.',
        ageMin: 12,
        ageMax: 16,
        duration: 35,
        isActive: true
      }
    ];

    await db.insert(assessmentTypes).values(assessmentTypesData).onConflictDoNothing();

    // Seed Assessment Questions
    const questionsData = [
      // Behavioral Assessment Questions
      {
        assessmentTypeId: 'behavioral-test',
        question: 'How does your child typically react when faced with a new situation?',
        questionType: 'multiple_choice',
        options: [
          'Excited and eager to explore',
          'Cautious but willing to try',
          'Anxious and hesitant',
          'Completely avoids new situations'
        ],
        orderIndex: 1,
        isRequired: true
      },
      {
        assessmentTypeId: 'behavioral-test',
        question: 'How well does your child follow instructions?',
        questionType: 'scale',
        options: ['Never', 'Rarely', 'Sometimes', 'Usually', 'Always'],
        orderIndex: 2,
        isRequired: true
      },
      {
        assessmentTypeId: 'behavioral-test',
        question: 'How does your child interact with peers?',
        questionType: 'multiple_choice',
        options: [
          'Very social and outgoing',
          'Friendly but selective',
          'Shy but warm once comfortable',
          'Prefers solitary activities'
        ],
        orderIndex: 3,
        isRequired: true
      },
      // Personality Test Questions
      {
        assessmentTypeId: 'personality-test',
        question: 'What type of activities does your child prefer?',
        questionType: 'multiple_choice',
        options: [
          'Creative and artistic activities',
          'Physical and sports activities',
          'Reading and learning activities',
          'Building and constructing things'
        ],
        orderIndex: 1,
        isRequired: true
      },
      {
        assessmentTypeId: 'personality-test',
        question: 'How does your child express emotions?',
        questionType: 'multiple_choice',
        options: [
          'Openly and dramatically',
          'Clearly but calmly',
          'Quietly and internally',
          'Through actions rather than words'
        ],
        orderIndex: 2,
        isRequired: true
      },
      // IQ Test Questions
      {
        assessmentTypeId: 'iq-test',
        question: 'How quickly does your child learn new concepts?',
        questionType: 'scale',
        options: ['Very Slowly', 'Slowly', 'Average', 'Quickly', 'Very Quickly'],
        orderIndex: 1,
        isRequired: true
      },
      {
        assessmentTypeId: 'iq-test',
        question: 'How well does your child solve problems independently?',
        questionType: 'scale',
        options: ['Needs lots of help', 'Needs some help', 'Sometimes independent', 'Usually independent', 'Always independent'],
        orderIndex: 2,
        isRequired: true
      },
      // Career Orientation Questions
      {
        assessmentTypeId: 'career-test',
        question: 'What subjects does your child enjoy most?',
        questionType: 'multiple_choice',
        options: [
          'Science and Mathematics',
          'Arts and Literature',
          'Social Studies and History',
          'Technology and Engineering'
        ],
        orderIndex: 1,
        isRequired: true
      }
    ];

    await db.insert(assessmentQuestions).values(questionsData).onConflictDoNothing();

    // Seed Yoga Programs
    const yogaProgramsData = [
      {
        id: 'kids-yoga-basics',
        title: 'Kids Yoga Basics',
        description: 'Introduction to yoga poses and breathing techniques for young children.',
        ageMin: 5,
        ageMax: 10,
        difficulty: 'beginner',
        duration: 20,
        videoUrl: 'https://example.com/kids-yoga-basics',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        benefits: ['Improved flexibility', 'Better focus', 'Stress relief', 'Body awareness'],
        isActive: true
      },
      {
        id: 'mindful-movements',
        title: 'Mindful Movements',
        description: 'Gentle yoga flows combined with mindfulness exercises for pre-teens.',
        ageMin: 8,
        ageMax: 14,
        difficulty: 'intermediate',
        duration: 30,
        videoUrl: 'https://example.com/mindful-movements',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        benefits: ['Emotional regulation', 'Improved concentration', 'Better sleep', 'Anxiety relief'],
        isActive: true
      },
      {
        id: 'teen-yoga-flow',
        title: 'Teen Yoga Flow',
        description: 'Dynamic yoga sequences designed for teenagers to build strength and confidence.',
        ageMin: 12,
        ageMax: 16,
        difficulty: 'intermediate',
        duration: 40,
        videoUrl: 'https://example.com/teen-yoga-flow',
        thumbnailUrl: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400',
        benefits: ['Increased strength', 'Better posture', 'Stress management', 'Self-confidence'],
        isActive: true
      }
    ];

    await db.insert(yogaPrograms).values(yogaProgramsData).onConflictDoNothing();

    // Seed Robotics Modules
    const roboticsModulesData = [
      {
        id: 'robotics-intro',
        title: 'Introduction to Robotics',
        description: 'Learn the basics of what robots are and how they work in our daily lives.',
        ageMin: 8,
        ageMax: 12,
        difficulty: 'beginner',
        orderIndex: 1,
        content: {
          lessons: ['What is a robot?', 'Types of robots', 'Robot parts and functions'],
          activities: ['Robot scavenger hunt', 'Draw your dream robot']
        },
        videoUrl: 'https://example.com/robotics-intro',
        projectInstructions: 'Build a simple robot using household items like cardboard boxes, wheels, and LED lights.',
        isActive: true
      },
      {
        id: 'basic-programming',
        title: 'Basic Programming Concepts',
        description: 'Introduction to programming logic and simple coding concepts.',
        ageMin: 10,
        ageMax: 16,
        difficulty: 'beginner',
        orderIndex: 2,
        content: {
          lessons: ['What is programming?', 'Sequential thinking', 'Loops and conditions'],
          activities: ['Code without computers', 'Algorithm games']
        },
        videoUrl: 'https://example.com/basic-programming',
        projectInstructions: 'Create a simple flowchart for everyday activities like brushing teeth or making a sandwich.',
        isActive: true
      },
      {
        id: 'sensors-actuators',
        title: 'Sensors and Actuators',
        description: 'Explore how robots sense their environment and interact with the world.',
        ageMin: 12,
        ageMax: 16,
        difficulty: 'intermediate',
        orderIndex: 3,
        content: {
          lessons: ['Types of sensors', 'How actuators work', 'Input and output systems'],
          activities: ['Sensor exploration', 'Build a simple alarm system']
        },
        videoUrl: 'https://example.com/sensors-actuators',
        projectInstructions: 'Design a motion-detecting device using simple electronics and explain how it could be used in robotics.',
        isActive: true
      }
    ];

    await db.insert(roboticsModules).values(roboticsModulesData).onConflictDoNothing();

    // Seed Educational Games
    const gamesData = [
      {
        id: 'math-adventure',
        title: 'Math Adventure Quest',
        description: 'Embark on a mathematical journey solving puzzles and challenges.',
        ageMin: 6,
        ageMax: 12,
        category: 'math',
        difficulty: 'beginner',
        gameUrl: '/games/math-adventure',
        thumbnailUrl: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400',
        learningObjectives: ['Basic arithmetic', 'Problem solving', 'Number recognition'],
        isActive: true
      },
      {
        id: 'science-explorer',
        title: 'Science Explorer',
        description: 'Discover the wonders of science through interactive experiments.',
        ageMin: 8,
        ageMax: 14,
        category: 'science',
        difficulty: 'intermediate',
        gameUrl: '/games/science-explorer',
        thumbnailUrl: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400',
        learningObjectives: ['Scientific method', 'Observation skills', 'Hypothesis testing'],
        isActive: true
      },
      {
        id: 'word-wizard',
        title: 'Word Wizard',
        description: 'Master vocabulary and reading skills in this magical word game.',
        ageMin: 5,
        ageMax: 10,
        category: 'reading',
        difficulty: 'beginner',
        gameUrl: '/games/word-wizard',
        thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        learningObjectives: ['Vocabulary building', 'Reading comprehension', 'Spelling skills'],
        isActive: true
      },
      {
        id: 'logic-master',
        title: 'Logic Master',
        description: 'Challenge your mind with puzzles that develop logical thinking.',
        ageMin: 10,
        ageMax: 16,
        category: 'logic',
        difficulty: 'advanced',
        gameUrl: '/games/logic-master',
        thumbnailUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400',
        learningObjectives: ['Logical reasoning', 'Pattern recognition', 'Critical thinking'],
        isActive: true
      }
    ];

    await db.insert(educationalGames).values(gamesData).onConflictDoNothing();

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
