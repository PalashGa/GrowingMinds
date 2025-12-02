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
        displayName: 'Child Behavioral Assessment',
        description: 'Comprehensive behavioral assessment questionnaire for ages 9-16 years. Covers 9 key areas: Emotional Symptoms, Hyperactivity & Impulsivity, Aggression & Defiance, Attention & Concentration, Social Skills, Adaptability & Coping, Communication & Expression, Self-Esteem & Confidence, and Leadership & Responsibility.',
        ageMin: 9,
        ageMax: 16,
        duration: 45,
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

    // Seed Assessment Questions - 50 Behavioral Questions organized by 9 categories
    const questionsData = [
      // === EMOTIONAL SYMPTOMS (Anxiety, Depression, Mood Swings) - Questions 1-10 ===
      { assessmentTypeId: 'behavioral-test', question: 'Does the child often worry about what might happen in the future?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 1, isRequired: true, category: 'Emotional Symptoms' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child appear fearful or anxious in everyday situations?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 2, isRequired: true, category: 'Emotional Symptoms' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child seem sad, low, or hopeless without clear reason?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 3, isRequired: true, category: 'Emotional Symptoms' },
      { assessmentTypeId: 'behavioral-test', question: 'Has the child lost interest in activities they previously enjoyed?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 4, isRequired: true, category: 'Emotional Symptoms' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child experience frequent mood swings during the day?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 5, isRequired: true, category: 'Emotional Symptoms' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child get upset or angry easily, even over small things?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 6, isRequired: true, category: 'Emotional Symptoms' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child seem to hold on to negative emotions for a long time?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 7, isRequired: true, category: 'Emotional Symptoms' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child cry easily or appear emotionally sensitive?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 8, isRequired: true, category: 'Emotional Symptoms' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child often express feelings of loneliness or being left out?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 9, isRequired: true, category: 'Emotional Symptoms' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child show signs of emotional withdrawal or detachment?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 10, isRequired: true, category: 'Emotional Symptoms' },
      
      // === HYPERACTIVITY & IMPULSIVITY - Questions 11-15 ===
      { assessmentTypeId: 'behavioral-test', question: 'Does the child have difficulty sitting still for more than a few minutes?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 11, isRequired: true, category: 'Hyperactivity & Impulsivity' },
      { assessmentTypeId: 'behavioral-test', question: 'Is the child often fidgeting, tapping, or moving around excessively?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 12, isRequired: true, category: 'Hyperactivity & Impulsivity' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child talk more than usual or interrupt others frequently?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 13, isRequired: true, category: 'Hyperactivity & Impulsivity' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child act before thinking about possible consequences?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 14, isRequired: true, category: 'Hyperactivity & Impulsivity' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child find it hard to wait for their turn in games or discussions?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 15, isRequired: true, category: 'Hyperactivity & Impulsivity' },
      
      // === AGGRESSION & DEFIANCE - Questions 16-20 ===
      { assessmentTypeId: 'behavioral-test', question: 'Does the child lose their temper easily or react angrily when corrected?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 16, isRequired: true, category: 'Aggression & Defiance' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child argue frequently with parents, teachers, or peers?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 17, isRequired: true, category: 'Aggression & Defiance' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child blame others for their mistakes or misbehavior?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 18, isRequired: true, category: 'Aggression & Defiance' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child threaten, hit, or damage things when angry?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 19, isRequired: true, category: 'Aggression & Defiance' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child appear defiant or resistant to rules and authority?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 20, isRequired: true, category: 'Aggression & Defiance' },
      
      // === ATTENTION & CONCENTRATION - Questions 21-25 ===
      { assessmentTypeId: 'behavioral-test', question: 'Does the child have difficulty staying focused on tasks or schoolwork?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 21, isRequired: true, category: 'Attention & Concentration' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child seem easily distracted by noises or surroundings?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 22, isRequired: true, category: 'Attention & Concentration' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child frequently forget instructions or important details?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 23, isRequired: true, category: 'Attention & Concentration' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child make careless mistakes due to inattention?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 24, isRequired: true, category: 'Attention & Concentration' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child struggle to complete homework or assignments on time?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 25, isRequired: true, category: 'Attention & Concentration' },
      
      // === SOCIAL SKILLS & PEER RELATIONSHIPS - Questions 26-30 ===
      { assessmentTypeId: 'behavioral-test', question: 'Does the child find it easy to make and keep friends?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 26, isRequired: true, category: 'Social Skills & Peer Relationships' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child cooperate well in group games or projects?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 27, isRequired: true, category: 'Social Skills & Peer Relationships' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child understand others\' feelings and show empathy?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 28, isRequired: true, category: 'Social Skills & Peer Relationships' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child avoid social interactions or prefer to play alone?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 29, isRequired: true, category: 'Social Skills & Peer Relationships' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child handle disagreements or conflicts with peers calmly?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 30, isRequired: true, category: 'Social Skills & Peer Relationships' },
      
      // === ADAPTABILITY & COPING - Questions 31-35 ===
      { assessmentTypeId: 'behavioral-test', question: 'Does the child adjust well when there are changes in routine?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 31, isRequired: true, category: 'Adaptability & Coping' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child handle new situations or environments confidently?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 32, isRequired: true, category: 'Adaptability & Coping' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child get upset or anxious with unexpected changes?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 33, isRequired: true, category: 'Adaptability & Coping' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child take time to recover from disappointments or stress?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 34, isRequired: true, category: 'Adaptability & Coping' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child respond positively to feedback or correction?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 35, isRequired: true, category: 'Adaptability & Coping' },
      
      // === COMMUNICATION & EXPRESSION - Questions 36-40 ===
      { assessmentTypeId: 'behavioral-test', question: 'Does the child clearly express thoughts and emotions in words?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 36, isRequired: true, category: 'Communication & Expression' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child listen carefully and follow multi-step instructions?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 37, isRequired: true, category: 'Communication & Expression' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child ask for help when confused or frustrated?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 38, isRequired: true, category: 'Communication & Expression' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child have trouble expressing emotions appropriately (e.g., anger or sadness)?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 39, isRequired: true, category: 'Communication & Expression' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child participate confidently in discussions or group activities?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 40, isRequired: true, category: 'Communication & Expression' },
      
      // === SELF-ESTEEM & CONFIDENCE - Questions 41-45 ===
      { assessmentTypeId: 'behavioral-test', question: 'Does the child seem proud of their efforts and achievements?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 41, isRequired: true, category: 'Self-Esteem & Confidence' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child believe in their ability to improve with practice?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 42, isRequired: true, category: 'Self-Esteem & Confidence' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child often compare themselves negatively with others?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 43, isRequired: true, category: 'Self-Esteem & Confidence' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child avoid trying new activities due to fear of failure?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 44, isRequired: true, category: 'Self-Esteem & Confidence' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child show confidence when solving problems or learning new things?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 45, isRequired: true, category: 'Self-Esteem & Confidence' },
      
      // === LEADERSHIP & RESPONSIBILITY - Questions 46-50 ===
      { assessmentTypeId: 'behavioral-test', question: 'Does the child take initiative in group settings or projects?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 46, isRequired: true, category: 'Leadership & Responsibility' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child show responsibility in completing assigned tasks?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 47, isRequired: true, category: 'Leadership & Responsibility' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child encourage or help peers when needed?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 48, isRequired: true, category: 'Leadership & Responsibility' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child try to control situations or dominate group decisions?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 49, isRequired: true, category: 'Leadership & Responsibility' },
      { assessmentTypeId: 'behavioral-test', question: 'Does the child show honesty and accountability for their actions?', questionType: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'], orderIndex: 50, isRequired: true, category: 'Leadership & Responsibility' },
      
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
