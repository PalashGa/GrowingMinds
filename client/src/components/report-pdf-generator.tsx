import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, FileText, Loader2, 
  Brain, Heart, Target, GraduationCap, Sparkles
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
  assessmentTypeKey: string;
  isCompleted: boolean;
}

const COLORS = {
  primary: [99, 102, 241],      // Indigo
  secondary: [16, 185, 129],    // Emerald
  accent: [236, 72, 153],       // Pink
  warning: [245, 158, 11],      // Amber
  success: [34, 197, 94],       // Green
  info: [59, 130, 246],         // Blue
  purple: [139, 92, 246],       // Purple
  orange: [249, 115, 22],       // Orange
  teal: [20, 184, 166],         // Teal
  rose: [244, 63, 94],          // Rose
  muted: [100, 116, 139],
  dark: [30, 41, 59],
  light: [241, 245, 249],
  white: [255, 255, 255],
};

function generatePDF(report: ReportData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
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

  const drawColoredHeader = (text: string, bgColor: number[], icon?: string) => {
    checkPageBreak(20);
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const iconText = icon ? `${icon} ` : '';
    doc.text(`${iconText}${text}`, margin + 6, yPos + 9);
    doc.setTextColor(0, 0, 0);
    yPos += 20;
  };

  const drawSubHeader = (text: string, color: number[] = COLORS.primary) => {
    checkPageBreak(12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;
  };

  const drawText = (text: string, fontSize = 10, color: number[] = COLORS.dark) => {
    checkPageBreak(8);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += lines.length * 5 + 3;
  };

  const drawColoredBullet = (text: string, bulletColor: number[], indent = 0) => {
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const bulletX = margin + indent;
    doc.setFillColor(bulletColor[0], bulletColor[1], bulletColor[2]);
    doc.circle(bulletX + 2, yPos - 1.5, 1.5, 'F');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    const lines = doc.splitTextToSize(text, contentWidth - indent - 8);
    doc.text(lines, bulletX + 7, yPos);
    yPos += lines.length * 5 + 2;
  };

  const drawPieChart = (centerX: number, centerY: number, radius: number, value: number, color: number[], label: string) => {
    const startAngle = -90;
    const endAngle = startAngle + (value / 100) * 360;
    
    doc.setFillColor(230, 230, 230);
    doc.circle(centerX, centerY, radius, 'F');
    
    doc.setFillColor(color[0], color[1], color[2]);
    if (value > 0) {
      const segments = Math.ceil(value / 5);
      for (let i = 0; i <= segments; i++) {
        const angle1 = (startAngle + (i * 360 * value / 100 / segments)) * Math.PI / 180;
        const angle2 = (startAngle + ((i + 1) * 360 * value / 100 / segments)) * Math.PI / 180;
        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);
        doc.triangle(centerX, centerY, x1, y1, x2, y2, 'F');
      }
    }
    
    doc.setFillColor(255, 255, 255);
    doc.circle(centerX, centerY, radius * 0.6, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`${value}%`, centerX, centerY + 2, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text(label, centerX, centerY + radius + 6, { align: 'center' });
  };

  const drawHorizontalBar = (x: number, y: number, width: number, height: number, value: number, color: number[], label: string) => {
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x, y, width, height, 2, 2, 'F');
    
    const fillWidth = (width * value) / 100;
    if (fillWidth > 0) {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(x, y, fillWidth, height, 2, 2, 'F');
    }
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text(label, x, y - 2);
    
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`${value}%`, x + width + 3, y + height - 1);
  };

  const drawInfoCard = (x: number, y: number, width: number, height: number, title: string, content: string, color: number[]) => {
    doc.setFillColor(color[0], color[1], color[2], 0.1);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, width, height, 3, 3, 'FD');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(title, x + 4, y + 6);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    const lines = doc.splitTextToSize(content, width - 8);
    doc.text(lines, x + 4, y + 12);
  };

  // ========== PAGE 1: COVER PAGE ==========
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, pageHeight * 0.5, 'F');
  
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.rect(0, pageHeight * 0.5, pageWidth, pageHeight * 0.5, 'F');
  
  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth / 2, 50, 25, 'F');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text('SSZ', pageWidth / 2, 54, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text('Smart Study Zone', pageWidth / 2, 95, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Child Development Assessment Report', pageWidth / 2, 108, { align: 'center' });
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(30, 125, pageWidth - 60, 90, 8, 8, 'F');
  
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(report.coverPage.childName, pageWidth / 2, 150, { align: 'center' });
  
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.roundedRect(pageWidth/2 - 25, 160, 50, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Age: ${report.coverPage.childAge} years`, pageWidth / 2, 166, { align: 'center' });
  
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(report.coverPage.assessmentType, pageWidth / 2, 185, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Date: ${report.coverPage.testDate}`, pageWidth / 2, 195, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('Personalized Insights for Your Child\'s Growth', pageWidth / 2, 240, { align: 'center' });
  
  doc.setFontSize(9);
  doc.text('Powered by AI-driven Analysis', pageWidth / 2, 250, { align: 'center' });

  // ========== PAGE 2: EXECUTIVE SUMMARY ==========
  addNewPage();
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', pageWidth / 2, 25, { align: 'center' });
  yPos = 50;
  
  const scoreColor = report.executiveSummary.overallScore >= 80 ? COLORS.success :
                     report.executiveSummary.overallScore >= 60 ? COLORS.info :
                     report.executiveSummary.overallScore >= 40 ? COLORS.warning : COLORS.rose;
  
  drawPieChart(pageWidth / 2, yPos + 30, 25, report.executiveSummary.overallScore, scoreColor, report.executiveSummary.scoreCategory);
  yPos += 70;
  
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, yPos, contentWidth / 2 - 5, 50, 4, 4, 'F');
  doc.roundedRect(margin + contentWidth / 2 + 5, yPos, contentWidth / 2 - 5, 50, 4, 4, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
  doc.text('Strengths', margin + 5, yPos + 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  report.executiveSummary.strengthAreas.slice(0, 3).forEach((s, i) => {
    const lines = doc.splitTextToSize(`• ${s}`, contentWidth / 2 - 15);
    doc.text(lines[0], margin + 5, yPos + 18 + (i * 10));
  });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
  doc.text('Growth Areas', margin + contentWidth / 2 + 10, yPos + 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  report.executiveSummary.growthAreas.slice(0, 3).forEach((g, i) => {
    const lines = doc.splitTextToSize(`• ${g}`, contentWidth / 2 - 15);
    doc.text(lines[0], margin + contentWidth / 2 + 10, yPos + 18 + (i * 10));
  });
  yPos += 60;
  
  drawColoredHeader('TOP RECOMMENDATIONS', COLORS.info, '★');
  report.executiveSummary.recommendations.forEach((rec, i) => {
    drawColoredBullet(rec, i % 2 === 0 ? COLORS.info : COLORS.purple);
  });
  yPos += 5;
  
  drawColoredHeader('PARENT ACTION CHECKLIST', COLORS.accent, '✓');
  report.executiveSummary.parentActionChecklist.forEach((item, i) => {
    drawColoredBullet(item, COLORS.accent);
  });

  // ========== PAGE 3: BEHAVIORAL INSIGHTS WITH CHARTS ==========
  addNewPage();
  
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BEHAVIORAL INSIGHTS', pageWidth / 2, 25, { align: 'center' });
  yPos = 50;
  
  drawSubHeader('Domain Performance Analysis', COLORS.secondary);
  yPos += 5;
  
  const barColors = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.info, COLORS.purple, COLORS.teal];
  report.behavioralInsights.domains.forEach((domain, i) => {
    const color = barColors[i % barColors.length];
    drawHorizontalBar(margin, yPos, contentWidth - 20, 8, domain.score, color, domain.name);
    yPos += 18;
  });
  yPos += 10;
  
  drawColoredHeader('KEY BEHAVIORAL OBSERVATIONS', COLORS.purple, '◆');
  
  report.behavioralInsights.questionAnalysis.slice(0, 8).forEach((qa, i) => {
    checkPageBreak(25);
    
    const cardColors = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.info, COLORS.purple, COLORS.teal, COLORS.orange, COLORS.rose];
    const cardColor = cardColors[i % cardColors.length];
    
    doc.setFillColor(cardColor[0], cardColor[1], cardColor[2]);
    doc.roundedRect(margin, yPos, 4, 18, 1, 1, 'F');
    
    doc.setFillColor(250, 250, 252);
    doc.roundedRect(margin + 5, yPos, contentWidth - 5, 18, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(cardColor[0], cardColor[1], cardColor[2]);
    doc.text(`Insight ${i + 1}`, margin + 8, yPos + 6);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    const insightLines = doc.splitTextToSize(qa.meaning, contentWidth - 15);
    doc.text(insightLines[0], margin + 8, yPos + 13);
    
    yPos += 22;
  });

  // ========== PAGE 4: STRENGTHS ANALYSIS ==========
  addNewPage();
  
  doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('STRENGTHS ANALYSIS', pageWidth / 2, 25, { align: 'center' });
  yPos = 50;
  
  const strengthCategories = [
    { name: 'Academic Strengths', items: report.strengthsAnalysis.academic, color: COLORS.info, icon: '📚' },
    { name: 'Behavioral Strengths', items: report.strengthsAnalysis.behavioral, color: COLORS.success, icon: '⭐' },
    { name: 'Social Strengths', items: report.strengthsAnalysis.social, color: COLORS.purple, icon: '👥' },
    { name: 'Emotional Strengths', items: report.strengthsAnalysis.emotional, color: COLORS.rose, icon: '❤️' },
    { name: 'Cognitive Strengths', items: report.strengthsAnalysis.cognitive, color: COLORS.teal, icon: '🧠' },
  ];
  
  strengthCategories.forEach((cat, catIndex) => {
    checkPageBreak(35);
    
    doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
    doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cat.icon} ${cat.name}`, margin + 4, yPos + 5.5);
    yPos += 12;
    
    cat.items.forEach(item => {
      drawColoredBullet(item, cat.color, 3);
    });
    yPos += 5;
  });

  // ========== PAGE 5: AREAS FOR GROWTH ==========
  addNewPage();
  
  doc.setFillColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AREAS FOR GROWTH', pageWidth / 2, 25, { align: 'center' });
  yPos = 50;
  
  report.areasOfImprovement.forEach((area, i) => {
    checkPageBreak(40);
    
    const areaColors = [COLORS.orange, COLORS.rose, COLORS.purple, COLORS.teal];
    const areaColor = areaColors[i % areaColors.length];
    
    doc.setFillColor(areaColor[0], areaColor[1], areaColor[2]);
    doc.roundedRect(margin, yPos, contentWidth, 35, 4, 4, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(area.area, margin + 5, yPos + 8);
    
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin + 3, yPos + 12, contentWidth - 6, 20, 2, 2, 'F');
    
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const reasonLines = doc.splitTextToSize(`Why: ${area.reason}`, contentWidth - 12);
    doc.text(reasonLines[0], margin + 6, yPos + 19);
    const patternLines = doc.splitTextToSize(`Pattern: ${area.pattern}`, contentWidth - 12);
    doc.text(patternLines[0], margin + 6, yPos + 27);
    
    yPos += 42;
  });

  // ========== PAGE 6: PARENT GUIDANCE ==========
  addNewPage();
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PARENT GUIDANCE', pageWidth / 2, 25, { align: 'center' });
  yPos = 50;
  
  report.parentGuidance.forEach((guide, guideIndex) => {
    checkPageBreak(60);
    
    drawColoredHeader(guide.area, guideIndex % 2 === 0 ? COLORS.info : COLORS.purple, '👪');
    
    const halfWidth = (contentWidth - 10) / 2;
    
    doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2], 0.1);
    doc.roundedRect(margin, yPos, halfWidth, 35, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    doc.text('✓ What to DO', margin + 3, yPos + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    guide.whatToDo.slice(0, 3).forEach((item, i) => {
      const lines = doc.splitTextToSize(`• ${item}`, halfWidth - 8);
      doc.text(lines[0], margin + 3, yPos + 14 + (i * 7));
    });
    
    doc.setFillColor(COLORS.rose[0], COLORS.rose[1], COLORS.rose[2], 0.1);
    doc.roundedRect(margin + halfWidth + 10, yPos, halfWidth, 35, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.rose[0], COLORS.rose[1], COLORS.rose[2]);
    doc.text('✗ What to AVOID', margin + halfWidth + 13, yPos + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    guide.whatToAvoid.slice(0, 3).forEach((item, i) => {
      const lines = doc.splitTextToSize(`• ${item}`, halfWidth - 8);
      doc.text(lines[0], margin + halfWidth + 13, yPos + 14 + (i * 7));
    });
    
    yPos += 42;
  });

  // ========== PAGE 7: 30-DAY GROWTH PLAN ==========
  addNewPage();
  
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('30-DAY GROWTH PLAN', pageWidth / 2, 25, { align: 'center' });
  yPos = 50;
  
  const weekColors = [COLORS.info, COLORS.purple, COLORS.teal, COLORS.orange];
  report.growthPlan.forEach((week, i) => {
    checkPageBreak(50);
    const weekColor = weekColors[i % weekColors.length];
    
    doc.setFillColor(weekColor[0], weekColor[1], weekColor[2]);
    doc.roundedRect(margin, yPos, 50, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Week ${week.week}`, margin + 10, yPos + 8);
    
    doc.setTextColor(weekColor[0], weekColor[1], weekColor[2]);
    doc.setFontSize(12);
    doc.text(week.focus, margin + 55, yPos + 8);
    yPos += 16;
    
    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text('Activities:', margin + 5, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(week.activities.join(' • '), margin + 28, yPos + 8);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Goals:', margin + 5, yPos + 18);
    doc.setFont('helvetica', 'normal');
    const goalText = week.goals.join(' • ');
    const goalLines = doc.splitTextToSize(goalText, contentWidth - 35);
    doc.text(goalLines[0], margin + 20, yPos + 18);
    
    yPos += 38;
  });

  // ========== PAGE 8: ACTIVITY RECOMMENDATIONS ==========
  addNewPage();
  
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTIVITY RECOMMENDATIONS', pageWidth / 2, 25, { align: 'center' });
  yPos = 50;
  
  const activities = [
    { name: '🧘 Yoga Poses', items: report.activityRecommendations.yogaPoses, color: COLORS.purple },
    { name: '🧩 Brain Games', items: report.activityRecommendations.brainGames, color: COLORS.info },
    { name: '🌳 Outdoor Activities', items: report.activityRecommendations.outdoorActivities, color: COLORS.success },
    { name: '🎨 Art Activities', items: report.activityRecommendations.artActivities, color: COLORS.accent },
    { name: '🎯 Focus Exercises', items: report.activityRecommendations.focusExercises, color: COLORS.orange },
    { name: '💪 Confidence Building', items: report.activityRecommendations.confidenceBuilding, color: COLORS.teal },
  ];
  
  const cardWidth = (contentWidth - 10) / 2;
  const cardHeight = 38;
  
  activities.forEach((act, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = margin + col * (cardWidth + 10);
    const y = yPos + row * (cardHeight + 8);
    
    if (y > pageHeight - margin - cardHeight) {
      addNewPage();
      yPos = margin;
    }
    
    doc.setFillColor(act.color[0], act.color[1], act.color[2]);
    doc.roundedRect(x, y, cardWidth, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(act.name, x + 3, y + 7);
    
    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.roundedRect(x, y + 10, cardWidth, cardHeight - 10, 2, 2, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    act.items.slice(0, 3).forEach((item, j) => {
      doc.text(`• ${item.substring(0, 35)}`, x + 3, y + 18 + (j * 7));
    });
  });
  yPos += Math.ceil(activities.length / 2) * (cardHeight + 8) + 10;

  // ========== PAGE 9: NUTRITION GUIDANCE ==========
  addNewPage();
  
  doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('NUTRITION GUIDANCE', pageWidth / 2, 25, { align: 'center' });
  yPos = 50;
  
  const nutritionSections = [
    { name: '🧠 Brain-Boosting Foods', items: report.nutritionGuidance.brainBoosting, color: COLORS.info },
    { name: '🎯 Foods for Concentration', items: report.nutritionGuidance.concentration, color: COLORS.purple },
    { name: '😊 Mood-Stabilizing Foods', items: report.nutritionGuidance.moodStabilizing, color: COLORS.success },
    { name: '📋 Weekly Diet Tips', items: report.nutritionGuidance.weeklyTips, color: COLORS.teal },
    { name: '⚠️ Foods to Reduce', items: report.nutritionGuidance.toReduce, color: COLORS.rose },
  ];
  
  nutritionSections.forEach(section => {
    checkPageBreak(30);
    drawColoredHeader(section.name, section.color);
    section.items.forEach(item => {
      drawColoredBullet(item, section.color, 3);
    });
    yPos += 5;
  });

  // ========== PAGE 10: SCHOOL SUGGESTIONS ==========
  addNewPage();
  
  doc.setFillColor(COLORS.info[0], COLORS.info[1], COLORS.info[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SCHOOL SUGGESTIONS', pageWidth / 2, 25, { align: 'center' });
  yPos = 50;
  
  const schoolSections = [
    { name: '💺 Seating Recommendations', items: report.schoolSuggestions.seating, color: COLORS.info },
    { name: '📝 Homework Routine Tips', items: report.schoolSuggestions.homework, color: COLORS.purple },
    { name: '👩‍🏫 Teacher Communication', items: report.schoolSuggestions.teacherCommunication, color: COLORS.teal },
    { name: '❤️ Emotional Support Needed', items: report.schoolSuggestions.emotionalSupport, color: COLORS.rose },
    { name: '🎯 Focus Strategies for School', items: report.schoolSuggestions.focusStrategies, color: COLORS.orange },
  ];
  
  schoolSections.forEach(section => {
    checkPageBreak(30);
    drawColoredHeader(section.name, section.color);
    section.items.forEach(item => {
      drawColoredBullet(item, section.color, 3);
    });
    yPos += 5;
  });

  // ========== PAGE 11: BONUS INSIGHTS ==========
  addNewPage();
  
  doc.setFillColor(COLORS.purple[0], COLORS.purple[1], COLORS.purple[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BONUS INSIGHTS', pageWidth / 2, 25, { align: 'center' });
  yPos = 50;
  
  drawColoredHeader('PERSONALITY SNAPSHOT', COLORS.accent, '✨');
  report.bonusInsights.personalitySnapshot.forEach(trait => {
    drawColoredBullet(trait, COLORS.accent, 3);
  });
  yPos += 10;
  
  drawColoredHeader('KEY METRICS', COLORS.info, '📊');
  yPos += 5;
  
  const chartRadius = 20;
  const chartSpacing = (contentWidth - chartRadius * 6) / 4;
  
  drawPieChart(margin + chartRadius + chartSpacing, yPos + chartRadius, chartRadius, 
               report.bonusInsights.confidenceMeter, COLORS.success, 'Confidence');
  drawPieChart(pageWidth / 2, yPos + chartRadius, chartRadius,
               report.bonusInsights.attentionIndex, COLORS.info, 'Attention');
  drawPieChart(pageWidth - margin - chartRadius - chartSpacing, yPos + chartRadius, chartRadius,
               report.bonusInsights.emotionalStability, COLORS.purple, 'Emotional Stability');
  
  yPos += chartRadius * 2 + 20;
  
  drawColoredHeader('RECOMMENDED PARENTING STYLE', COLORS.teal, '👨‍👩‍👧');
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, yPos, contentWidth, 25, 4, 4, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  const parentingLines = doc.splitTextToSize(report.bonusInsights.parentingStyleRecommendation, contentWidth - 10);
  doc.text(parentingLines, margin + 5, yPos + 10);

  // ========== FINAL PAGE: CONCLUSION ==========
  addNewPage();
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 70, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCLUSION', pageWidth / 2, 40, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for trusting Smart Study Zone', pageWidth / 2, 55, { align: 'center' });
  
  yPos = 85;
  
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, yPos, contentWidth, 50, 5, 5, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  const messageLines = doc.splitTextToSize(report.conclusion.message, contentWidth - 20);
  doc.text(messageLines, margin + 10, yPos + 15);
  
  yPos += 65;
  
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.roundedRect(margin, yPos, contentWidth, 40, 5, 5, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  const encouragementLines = doc.splitTextToSize(`"${report.conclusion.encouragement}"`, contentWidth - 20);
  doc.text(encouragementLines, margin + 10, yPos + 15);
  
  yPos = pageHeight - 30;
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Study Zone', pageWidth / 2, yPos + 8, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Empowering Children\'s Growth Through Personalized Learning', pageWidth / 2, yPos + 14, { align: 'center' });

  // Save the PDF with cross-device compatible download
  const filename = `${report.coverPage.childName.replace(/\s+/g, '_')}_${report.coverPage.assessmentType.replace(/\s+/g, '_')}_Report.pdf`;
  
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    const newWindow = window.open(blobUrl, '_blank');
    if (!newWindow) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } else {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 5000);
}

export default function ReportPDFGenerator({ 
  childId, 
  childName, 
  assessmentTypeId, 
  assessmentTypeName,
  assessmentTypeKey,
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
    'child_behavioral': Brain,
    'personality': Heart,
    'iq': Target,
    'career': GraduationCap,
    'strengths_weakness': Sparkles,
  };

  const Icon = assessmentIcons[assessmentTypeKey] || FileText;

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
