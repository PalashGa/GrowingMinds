import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, FileText, Loader2, CheckCircle2, 
  Brain, Heart, Target, BookOpen, Sparkles,
  Apple, GraduationCap, Calendar, Trophy
} from "lucide-react";
import jsPDF from "jspdf";

interface ReportData {
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

interface ReportGeneratorProps {
  childId: string;
  childName: string;
  assessmentTypeId: string;
  assessmentTypeName: string;
  isCompleted: boolean;
}

const COLORS = {
  primary: [79, 70, 229],
  secondary: [5, 150, 105],
  accent: [236, 72, 153],
  warning: [245, 158, 11],
  success: [34, 197, 94],
  muted: [100, 116, 139],
  dark: [30, 41, 59],
  light: [241, 245, 249],
};

function generatePDF(report: ReportData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  const addNewPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - margin) {
      addNewPage();
    }
  };

  const drawHeader = (text: string, color: number[]) => {
    checkPageBreak(15);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, yPos, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin + 5, yPos + 7);
    doc.setTextColor(0, 0, 0);
    yPos += 15;
  };

  const drawSubHeader = (text: string) => {
    checkPageBreak(10);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(text, margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 7;
  };

  const drawText = (text: string, fontSize = 10) => {
    checkPageBreak(8);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 5 + 3;
  };

  const drawBulletPoint = (text: string, indent = 0) => {
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const bulletX = margin + indent;
    doc.text('•', bulletX, yPos);
    const lines = doc.splitTextToSize(text, contentWidth - indent - 5);
    doc.text(lines, bulletX + 5, yPos);
    yPos += lines.length * 5 + 2;
  };

  const drawProgressBar = (label: string, value: number, color: number[]) => {
    checkPageBreak(12);
    doc.setFontSize(10);
    doc.text(`${label}: ${value}%`, margin, yPos);
    yPos += 5;
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, yPos, contentWidth, 5, 'F');
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, yPos, (contentWidth * value) / 100, 5, 'F');
    yPos += 10;
  };

  // PAGE 1: Cover Page
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Study Zone', pageWidth / 2, 60, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(report.coverPage.tagline, pageWidth / 2, 75, { align: 'center' });
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(30, 90, pageWidth - 60, 80, 5, 5, 'F');
  
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(report.coverPage.childName, pageWidth / 2, 115, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Age: ${report.coverPage.childAge} years`, pageWidth / 2, 130, { align: 'center' });
  doc.text(`Assessment: ${report.coverPage.assessmentType}`, pageWidth / 2, 145, { align: 'center' });
  doc.text(`Date: ${report.coverPage.testDate}`, pageWidth / 2, 160, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('Comprehensive Development Report', pageWidth / 2, 200, { align: 'center' });

  // PAGE 2: Executive Summary
  addNewPage();
  drawHeader('EXECUTIVE SUMMARY', COLORS.primary);
  
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');
  
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(`${report.executiveSummary.overallScore}%`, margin + 10, yPos + 18);
  
  doc.setFontSize(12);
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.text(`Overall Score: ${report.executiveSummary.scoreCategory}`, margin + 45, yPos + 18);
  yPos += 40;
  
  drawSubHeader('Strength Areas');
  report.executiveSummary.strengthAreas.forEach(strength => drawBulletPoint(strength));
  yPos += 5;
  
  drawSubHeader('Growth Areas');
  report.executiveSummary.growthAreas.forEach(area => drawBulletPoint(area));
  yPos += 5;
  
  drawSubHeader('Top 3 Recommendations');
  report.executiveSummary.recommendations.forEach((rec, i) => drawBulletPoint(`${i + 1}. ${rec}`));
  yPos += 5;
  
  drawSubHeader('Parent Action Checklist');
  report.executiveSummary.parentActionChecklist.forEach(item => drawBulletPoint(`☐ ${item}`));

  // PAGE 3: Behavioral Insights
  addNewPage();
  drawHeader('BEHAVIORAL INSIGHTS', COLORS.secondary);
  
  drawSubHeader('Domain Scores');
  report.behavioralInsights.domains.forEach(domain => {
    const color = domain.category === 'High' ? COLORS.success : 
                  domain.category === 'Moderate' ? COLORS.warning : COLORS.accent;
    drawProgressBar(domain.name, domain.score, color);
    drawText(domain.interpretation, 9);
    yPos += 3;
  });
  
  addNewPage();
  drawHeader('QUESTION ANALYSIS', COLORS.secondary);
  report.behavioralInsights.questionAnalysis.slice(0, 10).forEach((qa, i) => {
    drawSubHeader(`Q${i + 1}: ${qa.question.substring(0, 60)}...`);
    drawText(`Insight: ${qa.meaning}`);
    yPos += 3;
  });

  // PAGE 4: Strengths Analysis
  addNewPage();
  drawHeader('STRENGTHS ANALYSIS', COLORS.success);
  
  const strengthCategories = [
    { name: 'Academic Strengths', items: report.strengthsAnalysis.academic },
    { name: 'Behavioral Strengths', items: report.strengthsAnalysis.behavioral },
    { name: 'Social Strengths', items: report.strengthsAnalysis.social },
    { name: 'Emotional Strengths', items: report.strengthsAnalysis.emotional },
    { name: 'Cognitive Strengths', items: report.strengthsAnalysis.cognitive },
  ];
  
  strengthCategories.forEach(cat => {
    drawSubHeader(cat.name);
    cat.items.forEach(item => drawBulletPoint(item));
    yPos += 5;
  });

  // PAGE 5: Areas of Improvement
  addNewPage();
  drawHeader('AREAS FOR GROWTH', COLORS.warning);
  
  report.areasOfImprovement.forEach(area => {
    drawSubHeader(area.area);
    drawText(`Why it matters: ${area.reason}`);
    drawText(`Pattern observed: ${area.pattern}`);
    yPos += 5;
  });

  // PAGE 6: Parent Guidance
  addNewPage();
  drawHeader('PARENT GUIDANCE', COLORS.primary);
  
  report.parentGuidance.forEach(guide => {
    drawSubHeader(guide.area);
    
    drawText('What to DO:', 10);
    guide.whatToDo.forEach(item => drawBulletPoint(item, 5));
    
    drawText('What to AVOID:', 10);
    guide.whatToAvoid.forEach(item => drawBulletPoint(item, 5));
    
    drawText('Communication Strategies:', 10);
    guide.communicationStrategies.forEach(item => drawBulletPoint(item, 5));
    
    drawText('Suggested Routines:', 10);
    guide.routines.forEach(item => drawBulletPoint(item, 5));
    yPos += 5;
  });

  // PAGE 7: 30-Day Growth Plan
  addNewPage();
  drawHeader('30-DAY GROWTH PLAN', COLORS.accent);
  
  report.growthPlan.forEach(week => {
    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    checkPageBreak(40);
    doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(`Week ${week.week}: ${week.focus}`, margin + 5, yPos + 8);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Activities: ${week.activities.join(', ')}`, margin + 5, yPos + 18);
    doc.text(`Goals: ${week.goals.join(', ')}`, margin + 5, yPos + 28);
    
    yPos += 42;
  });

  // PAGE 8: Activity Recommendations
  addNewPage();
  drawHeader('ACTIVITY RECOMMENDATIONS', COLORS.secondary);
  
  const activities = [
    { name: 'Yoga Poses', items: report.activityRecommendations.yogaPoses },
    { name: 'Brain Games', items: report.activityRecommendations.brainGames },
    { name: 'Outdoor Activities', items: report.activityRecommendations.outdoorActivities },
    { name: 'Art Activities', items: report.activityRecommendations.artActivities },
    { name: 'Focus Exercises', items: report.activityRecommendations.focusExercises },
    { name: 'Confidence Building', items: report.activityRecommendations.confidenceBuilding },
  ];
  
  activities.forEach(act => {
    drawSubHeader(act.name);
    act.items.forEach(item => drawBulletPoint(item));
    yPos += 3;
  });

  // PAGE 9: Nutrition Guidance
  addNewPage();
  drawHeader('NUTRITION GUIDANCE', COLORS.success);
  
  drawSubHeader('Brain-Boosting Foods');
  report.nutritionGuidance.brainBoosting.forEach(item => drawBulletPoint(item));
  
  drawSubHeader('Foods for Concentration');
  report.nutritionGuidance.concentration.forEach(item => drawBulletPoint(item));
  
  drawSubHeader('Mood-Stabilizing Foods');
  report.nutritionGuidance.moodStabilizing.forEach(item => drawBulletPoint(item));
  
  drawSubHeader('Weekly Diet Tips');
  report.nutritionGuidance.weeklyTips.forEach(item => drawBulletPoint(item));
  
  drawSubHeader('Foods to Reduce');
  report.nutritionGuidance.toReduce.forEach(item => drawBulletPoint(item));

  // PAGE 10: School Suggestions
  addNewPage();
  drawHeader('SCHOOL SUGGESTIONS', COLORS.primary);
  
  drawSubHeader('Seating Recommendations');
  report.schoolSuggestions.seating.forEach(item => drawBulletPoint(item));
  
  drawSubHeader('Homework Routine Tips');
  report.schoolSuggestions.homework.forEach(item => drawBulletPoint(item));
  
  drawSubHeader('Teacher Communication');
  report.schoolSuggestions.teacherCommunication.forEach(item => drawBulletPoint(item));
  
  drawSubHeader('Emotional Support Needed');
  report.schoolSuggestions.emotionalSupport.forEach(item => drawBulletPoint(item));
  
  drawSubHeader('Focus Strategies for School');
  report.schoolSuggestions.focusStrategies.forEach(item => drawBulletPoint(item));

  // PAGE 11: Progress Tracking
  addNewPage();
  drawHeader('PROGRESS TRACKING', COLORS.warning);
  
  drawText('Use this section to track your child\'s weekly progress:');
  yPos += 5;
  
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  
  report.progressTracking.weeklyGoals.forEach(weekGoal => {
    checkPageBreak(30);
    doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Week ${weekGoal.week}`, margin + 5, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    weekGoal.goals.forEach((goal, i) => {
      doc.text(`☐ ${goal}`, margin + 5, yPos + 15 + (i * 5));
    });
    yPos += 30;
  });
  
  yPos += 10;
  drawSubHeader('Tracking Categories');
  report.progressTracking.categories.forEach(cat => drawBulletPoint(cat));

  // PAGE 12: Bonus Insights
  addNewPage();
  drawHeader('BONUS INSIGHTS', COLORS.accent);
  
  drawSubHeader('Personality Snapshot');
  report.bonusInsights.personalitySnapshot.forEach(trait => drawBulletPoint(trait));
  yPos += 10;
  
  drawSubHeader('Key Metrics');
  drawProgressBar('Confidence Meter', report.bonusInsights.confidenceMeter, COLORS.success);
  drawProgressBar('Attention Index', report.bonusInsights.attentionIndex, COLORS.primary);
  drawProgressBar('Emotional Stability', report.bonusInsights.emotionalStability, COLORS.secondary);
  yPos += 10;
  
  drawSubHeader('Recommended Parenting Style');
  drawText(report.bonusInsights.parentingStyleRecommendation);

  // FINAL PAGE: Conclusion
  addNewPage();
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCLUSION', pageWidth / 2, 35, { align: 'center' });
  
  yPos = 80;
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const messageLines = doc.splitTextToSize(report.conclusion.message, contentWidth);
  doc.text(messageLines, margin, yPos);
  yPos += messageLines.length * 6 + 15;
  
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, yPos, contentWidth, 40, 5, 5, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  const encouragementLines = doc.splitTextToSize(report.conclusion.encouragement, contentWidth - 20);
  doc.text(encouragementLines, margin + 10, yPos + 15);
  
  yPos = pageHeight - 40;
  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text('Smart Study Zone - Child Development Platform', pageWidth / 2, yPos, { align: 'center' });
  doc.text('www.smartstudyzone.com', pageWidth / 2, yPos + 6, { align: 'center' });

  // Save the PDF
  const filename = `${report.coverPage.childName.replace(/\s+/g, '_')}_${report.coverPage.assessmentType.replace(/\s+/g, '_')}_Report.pdf`;
  doc.save(filename);
}

export default function ReportPDFGenerator({ 
  childId, 
  childName, 
  assessmentTypeId, 
  assessmentTypeName,
  isCompleted 
}: ReportGeneratorProps) {
  const { toast } = useToast();
  const [generationProgress, setGenerationProgress] = useState(0);

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      setGenerationProgress(10);
      const response = await apiRequest("POST", "/api/reports/generate", {
        childId,
        assessmentTypeId
      });
      setGenerationProgress(70);
      const report = await response.json();
      setGenerationProgress(90);
      return report as ReportData;
    },
    onSuccess: (report) => {
      setGenerationProgress(100);
      generatePDF(report);
      toast({
        title: "Report Generated!",
        description: `${assessmentTypeName} report for ${childName} has been downloaded.`,
      });
      setTimeout(() => setGenerationProgress(0), 1000);
    },
    onError: (error: any) => {
      setGenerationProgress(0);
      toast({
        title: "Error",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const assessmentIcons: Record<string, any> = {
    'behavioral': Brain,
    'personality': Heart,
    'iq': Target,
    'career': GraduationCap,
    'strengths-weakness': Sparkles,
  };

  const Icon = assessmentIcons[assessmentTypeId] || FileText;

  return (
    <Card className={`transition-all ${isCompleted ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isCompleted ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gray-200'}`}>
            <Icon className={`h-6 w-6 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{assessmentTypeName}</h3>
            <p className="text-sm text-gray-500">
              {isCompleted ? 'Ready to download' : 'Complete assessment first'}
            </p>
          </div>
          {isCompleted ? (
            <Button
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {generateReportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          ) : (
            <Badge variant="outline" className="text-gray-400">
              Not Available
            </Badge>
          )}
        </div>
        
        {generateReportMutation.isPending && generationProgress > 0 && (
          <div className="mt-4">
            <Progress value={generationProgress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1 text-center">
              {generationProgress < 30 ? 'Analyzing assessment data...' :
               generationProgress < 70 ? 'Generating personalized insights with AI...' :
               generationProgress < 100 ? 'Creating PDF report...' : 'Complete!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
