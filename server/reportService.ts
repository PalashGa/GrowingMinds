import OpenAI from "openai";
import { storage } from "./storage";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

interface AssessmentData {
  childName: string;
  childAge: number;
  childHeight?: number;
  childWeight?: number;
  assessmentType: string;
  assessmentTypeName: string;
  answers: { questionId: string; questionText: string; answer: string; value: number }[];
  completedAt: string;
}

interface ReportSection {
  title: string;
  content: string;
}

interface GeneratedReport {
  coverPage: {
    childName: string;
    childAge: number;
    testDate: string;
    assessmentType: string;
    tagline: string;
  };
  executiveSummary: {
    overallScore: number;
    scoreCategory: string;
    strengthAreas: string[];
    growthAreas: string[];
    recommendations: string[];
    parentActionChecklist: string[];
  };
  behavioralInsights: {
    questionAnalysis: { question: string; meaning: string }[];
    domains: { name: string; score: number; category: string; interpretation: string }[];
  };
  strengthsAnalysis: {
    academic: string[];
    behavioral: string[];
    social: string[];
    emotional: string[];
    cognitive: string[];
  };
  areasOfImprovement: {
    area: string;
    reason: string;
    pattern: string;
  }[];
  parentGuidance: {
    area: string;
    whatToDo: string[];
    whatToAvoid: string[];
    communicationStrategies: string[];
    routines: string[];
  }[];
  growthPlan: {
    week: number;
    focus: string;
    activities: string[];
    goals: string[];
  }[];
  activityRecommendations: {
    yogaPoses: string[];
    brainGames: string[];
    outdoorActivities: string[];
    artActivities: string[];
    focusExercises: string[];
    confidenceBuilding: string[];
  };
  nutritionGuidance: {
    brainBoosting: string[];
    concentration: string[];
    moodStabilizing: string[];
    weeklyTips: string[];
    toReduce: string[];
  };
  schoolSuggestions: {
    seating: string[];
    homework: string[];
    teacherCommunication: string[];
    emotionalSupport: string[];
    focusStrategies: string[];
  };
  progressTracking: {
    categories: string[];
    weeklyGoals: { week: number; goals: string[] }[];
  };
  conclusion: {
    message: string;
    encouragement: string;
  };
  bonusInsights: {
    personalitySnapshot: string[];
    confidenceMeter: number;
    attentionIndex: number;
    emotionalStability: number;
    parentingStyleRecommendation: string;
  };
}

function calculateDomainScores(answers: { questionText: string; value: number }[]): { name: string; score: number; category: string }[] {
  const domains = [
    { name: "Emotional Regulation", keywords: ["emotion", "feeling", "angry", "sad", "happy", "mood", "calm"] },
    { name: "Social Interaction", keywords: ["friend", "social", "share", "play", "communicate", "interact", "peer"] },
    { name: "Focus & Attention", keywords: ["focus", "attention", "concentrate", "distract", "listen", "task"] },
    { name: "Behavioral Control", keywords: ["behave", "control", "impulse", "rule", "follow", "discipline"] },
    { name: "Learning & Academics", keywords: ["learn", "study", "school", "homework", "read", "write", "math"] },
    { name: "Self-Confidence", keywords: ["confident", "try", "new", "challenge", "believe", "self"] }
  ];

  return domains.map(domain => {
    const relevantAnswers = answers.filter(a => 
      domain.keywords.some(keyword => a.questionText.toLowerCase().includes(keyword))
    );
    
    const avgScore = relevantAnswers.length > 0 
      ? relevantAnswers.reduce((sum, a) => sum + a.value, 0) / relevantAnswers.length 
      : 3;
    
    const normalizedScore = Math.round((avgScore / 5) * 100);
    const category = normalizedScore >= 80 ? "High" : normalizedScore >= 50 ? "Moderate" : "Low";
    
    return { name: domain.name, score: normalizedScore, category };
  });
}

function calculateOverallScore(answers: { value: number }[]): number {
  if (answers.length === 0) return 0;
  const avgValue = answers.reduce((sum, a) => sum + a.value, 0) / answers.length;
  return Math.round((avgValue / 5) * 100);
}

export async function generateReport(assessmentData: AssessmentData): Promise<GeneratedReport> {
  const overallScore = calculateOverallScore(assessmentData.answers);
  const domains = calculateDomainScores(assessmentData.answers);
  
  const scoreCategory = overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : overallScore >= 40 ? "Developing" : "Needs Support";

  const answersText = assessmentData.answers.map((a, i) => 
    `Q${i + 1}: ${a.questionText} - Answer: ${a.answer} (Score: ${a.value}/5)`
  ).join("\n");

  const domainsText = domains.map(d => 
    `${d.name}: ${d.score}% (${d.category})`
  ).join(", ");

  const prompt = `You are a child development expert. Based on this ${assessmentData.assessmentTypeName} assessment for ${assessmentData.childName} (age ${assessmentData.childAge}), generate a comprehensive personalized report.

ASSESSMENT DATA:
${answersText}

DOMAIN SCORES:
${domainsText}

OVERALL SCORE: ${overallScore}% (${scoreCategory})

Generate a detailed JSON response with the following structure. Be specific, actionable, and positive while addressing areas for improvement. Tailor everything to the child's age (${assessmentData.childAge} years).

{
  "strengthAreas": ["5 specific strengths based on high-scoring answers"],
  "growthAreas": ["3-4 areas needing improvement based on low-scoring answers"],
  "recommendations": ["3 major personalized recommendations"],
  "parentActionChecklist": ["5 immediate actionable items for parents"],
  "questionAnalysis": [{"question": "Q1 text", "meaning": "What this answer reveals about the child"}],
  "domainInterpretations": [{"domain": "Domain name", "interpretation": "Detailed interpretation"}],
  "strengths": {
    "academic": ["2-3 academic strengths"],
    "behavioral": ["2-3 behavioral strengths"],
    "social": ["2-3 social strengths"],
    "emotional": ["2-3 emotional strengths"],
    "cognitive": ["2-3 cognitive strengths"]
  },
  "improvements": [{"area": "Area name", "reason": "Why this matters", "pattern": "What patterns indicate this"}],
  "parentGuidance": [{"area": "Focus area", "whatToDo": ["3 actions"], "whatToAvoid": ["2 things to avoid"], "communicationStrategies": ["2 strategies"], "routines": ["2 suggested routines"]}],
  "weeklyPlan": [{"week": 1, "focus": "Focus area", "activities": ["3 activities"], "goals": ["2 weekly goals"]}],
  "activities": {
    "yogaPoses": ["3 child-friendly yoga poses with benefits"],
    "brainGames": ["3 brain games"],
    "outdoorActivities": ["3 outdoor activities"],
    "artActivities": ["2 calming art activities"],
    "focusExercises": ["2 focus exercises"],
    "confidenceBuilding": ["2 confidence tasks"]
  },
  "nutrition": {
    "brainBoosting": ["3 brain-boosting foods"],
    "concentration": ["2 concentration foods"],
    "moodStabilizing": ["2 mood foods"],
    "weeklyTips": ["3 diet tips"],
    "toReduce": ["3 things to reduce"]
  },
  "school": {
    "seating": ["2 seating suggestions"],
    "homework": ["3 homework tips"],
    "teacherCommunication": ["2 teacher tips"],
    "emotionalSupport": ["2 support strategies"],
    "focusStrategies": ["2 focus strategies"]
  },
  "progressCategories": ["behavior", "mood", "study habits", "sleep", "focus"],
  "personalityTraits": ["4 personality traits"],
  "confidenceScore": 75,
  "attentionScore": 70,
  "emotionalStabilityScore": 80,
  "parentingStyle": "Recommended parenting approach",
  "conclusionMessage": "Positive concluding message about the child",
  "encouragement": "Encouraging words for parents"
}

Ensure all content is age-appropriate for a ${assessmentData.childAge}-year-old child. Be warm, supportive, and practical.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a child development expert who creates detailed, personalized assessment reports. Always respond with valid JSON only, no markdown formatting." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiResponse = JSON.parse(cleanContent);

    const questionAnalysis = assessmentData.answers.slice(0, 10).map((a, i) => ({
      question: a.questionText,
      meaning: aiResponse.questionAnalysis?.[i]?.meaning || `This response indicates the child's approach to ${a.questionText.toLowerCase().includes('focus') ? 'attention' : a.questionText.toLowerCase().includes('emotion') ? 'emotional regulation' : 'behavioral patterns'}.`
    }));

    const domainInterpretations = domains.map(d => ({
      ...d,
      interpretation: aiResponse.domainInterpretations?.find((di: any) => di.domain === d.name)?.interpretation || 
        `${d.name} score of ${d.score}% indicates ${d.category.toLowerCase()} performance in this area.`
    }));

    return {
      coverPage: {
        childName: assessmentData.childName,
        childAge: assessmentData.childAge,
        testDate: assessmentData.completedAt,
        assessmentType: assessmentData.assessmentTypeName,
        tagline: "Personalized Child Development Assessment"
      },
      executiveSummary: {
        overallScore,
        scoreCategory,
        strengthAreas: aiResponse.strengthAreas || ["Shows positive engagement", "Good learning potential", "Demonstrates curiosity"],
        growthAreas: aiResponse.growthAreas || ["Focus and attention", "Emotional regulation"],
        recommendations: aiResponse.recommendations || ["Establish consistent routines", "Practice mindfulness", "Encourage positive self-talk"],
        parentActionChecklist: aiResponse.parentActionChecklist || ["Create a daily schedule", "Set up a quiet study space", "Practice active listening", "Celebrate small wins", "Model calm behavior"]
      },
      behavioralInsights: {
        questionAnalysis,
        domains: domainInterpretations
      },
      strengthsAnalysis: {
        academic: aiResponse.strengths?.academic || ["Shows curiosity in learning", "Good memory retention"],
        behavioral: aiResponse.strengths?.behavioral || ["Follows basic rules", "Responds to guidance"],
        social: aiResponse.strengths?.social || ["Enjoys peer interaction", "Shows empathy"],
        emotional: aiResponse.strengths?.emotional || ["Expresses feelings", "Shows resilience"],
        cognitive: aiResponse.strengths?.cognitive || ["Problem-solving ability", "Creative thinking"]
      },
      areasOfImprovement: aiResponse.improvements || [
        { area: "Focus & Attention", reason: "Building attention span is crucial for academic success", pattern: "Difficulty completing tasks" },
        { area: "Emotional Regulation", reason: "Managing emotions helps in social situations", pattern: "Occasional mood fluctuations" }
      ],
      parentGuidance: aiResponse.parentGuidance || [{
        area: "Daily Routine",
        whatToDo: ["Create consistent schedules", "Use visual timers", "Break tasks into smaller steps"],
        whatToAvoid: ["Overloading with activities", "Harsh criticism"],
        communicationStrategies: ["Use positive reinforcement", "Active listening"],
        routines: ["Morning preparation routine", "Bedtime wind-down routine"]
      }],
      growthPlan: aiResponse.weeklyPlan || [
        { week: 1, focus: "Emotional Awareness", activities: ["Emotion journal", "Breathing exercises", "Mood check-ins"], goals: ["Identify 3 emotions daily", "Practice calm breathing"] },
        { week: 2, focus: "Attention Building", activities: ["Focus games", "Mindful coloring", "Reading time"], goals: ["Complete 15-min focused activity", "Reduce distractions"] },
        { week: 3, focus: "Habit Formation", activities: ["Routine charts", "Reward system", "Self-monitoring"], goals: ["Follow morning routine independently", "Complete homework without reminders"] },
        { week: 4, focus: "Social & Family", activities: ["Family game night", "Cooperative play", "Community activity"], goals: ["Practice sharing", "Improve communication with family"] }
      ],
      activityRecommendations: {
        yogaPoses: aiResponse.activities?.yogaPoses || ["Tree Pose - Balance and focus", "Cat-Cow - Flexibility and calm", "Child's Pose - Relaxation"],
        brainGames: aiResponse.activities?.brainGames || ["Memory matching", "Puzzles", "Pattern recognition games"],
        outdoorActivities: aiResponse.activities?.outdoorActivities || ["Nature walks", "Ball games", "Obstacle courses"],
        artActivities: aiResponse.activities?.artActivities || ["Mandala coloring", "Clay modeling"],
        focusExercises: aiResponse.activities?.focusExercises || ["Mindful breathing", "Concentration games"],
        confidenceBuilding: aiResponse.activities?.confidenceBuilding || ["Public speaking practice", "New skill challenges"]
      },
      nutritionGuidance: {
        brainBoosting: aiResponse.nutrition?.brainBoosting || ["Walnuts and almonds", "Blueberries", "Eggs"],
        concentration: aiResponse.nutrition?.concentration || ["Whole grains", "Dark leafy greens"],
        moodStabilizing: aiResponse.nutrition?.moodStabilizing || ["Bananas", "Yogurt"],
        weeklyTips: aiResponse.nutrition?.weeklyTips || ["Include protein in breakfast", "Limit sugar after 4pm", "Stay hydrated"],
        toReduce: aiResponse.nutrition?.toReduce || ["Sugary drinks", "Processed snacks", "Screen-time snacking"]
      },
      schoolSuggestions: {
        seating: aiResponse.school?.seating || ["Front row near teacher", "Away from windows/doors"],
        homework: aiResponse.school?.homework || ["Set specific homework time", "Break into 20-min blocks", "Use a checklist"],
        teacherCommunication: aiResponse.school?.teacherCommunication || ["Weekly check-ins", "Behavior log sharing"],
        emotionalSupport: aiResponse.school?.emotionalSupport || ["Designated calm-down space", "Trusted adult check-ins"],
        focusStrategies: aiResponse.school?.focusStrategies || ["Movement breaks", "Fidget tools if needed"]
      },
      progressTracking: {
        categories: aiResponse.progressCategories || ["Behavior", "Mood", "Study Habits", "Sleep", "Focus Sessions"],
        weeklyGoals: [
          { week: 1, goals: ["Track daily mood", "Complete one focus session"] },
          { week: 2, goals: ["Establish homework routine", "Practice calming technique"] },
          { week: 3, goals: ["Improve sleep schedule", "Reduce screen time"] },
          { week: 4, goals: ["Family activity participation", "Self-reflection practice"] }
        ]
      },
      conclusion: {
        message: aiResponse.conclusionMessage || `${assessmentData.childName} is a unique and capable child with wonderful potential. This assessment reveals both strengths to celebrate and areas where gentle support can make a big difference.`,
        encouragement: aiResponse.encouragement || "Remember, every child develops at their own pace. Your support and love are the most important factors in your child's growth journey."
      },
      bonusInsights: {
        personalitySnapshot: aiResponse.personalityTraits || ["Curious learner", "Sensitive to others", "Creative thinker", "Active explorer"],
        confidenceMeter: aiResponse.confidenceScore || Math.round(overallScore * 0.9),
        attentionIndex: aiResponse.attentionScore || Math.round(overallScore * 0.85),
        emotionalStability: aiResponse.emotionalStabilityScore || Math.round(overallScore * 0.95),
        parentingStyleRecommendation: aiResponse.parentingStyle || "A balanced approach combining gentle guidance with clear boundaries works best for this child."
      }
    };
  } catch (error) {
    console.error("Error generating AI report:", error);
    throw new Error("Failed to generate report. Please try again.");
  }
}

export async function getAssessmentDataForReport(childId: string, assessmentTypeId: string): Promise<AssessmentData | null> {
  const child = await storage.getChild(childId);
  if (!child) return null;

  const assessmentType = await storage.getAssessmentType(assessmentTypeId);
  if (!assessmentType) return null;

  const results = await storage.getAssessmentResults(childId);
  const latestResult = results.find(r => r.assessmentTypeId === assessmentTypeId);
  if (!latestResult) return null;

  const questions = await storage.getAssessmentQuestions(assessmentTypeId);
  
  const answers = Object.entries(latestResult.answers as Record<string, string>).map(([questionId, answer]) => {
    const questionData = questions.find(q => q.id === questionId);
    const valueMap: Record<string, number> = { 'never': 1, 'rarely': 2, 'sometimes': 3, 'often': 4, 'always': 5, 'a': 4, 'b': 3, 'c': 2, 'd': 1 };
    return {
      questionId,
      questionText: questionData?.question || questionId,
      answer: answer,
      value: valueMap[answer.toLowerCase()] || 3
    };
  });

  return {
    childName: child.name,
    childAge: child.age,
    childHeight: child.height || undefined,
    childWeight: child.weight || undefined,
    assessmentType: assessmentTypeId,
    assessmentTypeName: assessmentType.name,
    answers,
    completedAt: latestResult.completedAt ? new Date(latestResult.completedAt).toLocaleDateString() : new Date().toLocaleDateString()
  };
}
