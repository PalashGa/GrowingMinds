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
import logoImage from "@assets/logo-png_1764759697879.png";

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
    questionAnalysis: { question: string; answer: string; meaning: string }[];
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
  primary: [99, 102, 241] as [number, number, number],
  secondary: [16, 185, 129] as [number, number, number],
  accent: [236, 72, 153] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  info: [59, 130, 246] as [number, number, number],
  purple: [139, 92, 246] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  teal: [20, 184, 166] as [number, number, number],
  rose: [244, 63, 94] as [number, number, number],
  gold: [234, 179, 8] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  dark: [30, 41, 59] as [number, number, number],
  light: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function sanitizeText(text: string): string {
  if (!text) return '';
  
  const replacements: { [key: string]: string } = {
    '\u2019': "'",
    '\u2018': "'",
    '\u201C': '"',
    '\u201D': '"',
    '\u2013': '-',
    '\u2014': '-',
    '\u2026': '...',
    '\u00A0': ' ',
    '\u2022': '-',
    '\u2713': '*',
    '\u2714': '*',
    '\u2715': 'x',
    '\u2716': 'x',
    '\u2605': '*',
    '\u2606': '*',
    '\u25CF': '-',
    '\u25CB': 'o',
    '\u25A0': '-',
    '\u25A1': 'o',
    '\u25B6': '>',
    '\u25C0': '<',
    '\u2190': '<-',
    '\u2192': '->',
    '\u2191': '^',
    '\u2193': 'v',
  };
  
  let result = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0x1F300 && code <= 0x1F9FF) continue;
    if (code >= 0x2600 && code <= 0x26FF) continue;
    if (code >= 0x2700 && code <= 0x27BF) continue;
    if (code >= 0x1F600 && code <= 0x1F64F) continue;
    if (code >= 0x1F680 && code <= 0x1F6FF) continue;
    if (code >= 0x1F1E0 && code <= 0x1F1FF) continue;
    if (code > 0xFFFF) continue;
    
    if (code > 127) {
      result += replacements[char] || '';
    } else {
      result += char;
    }
  }
  
  return result.replace(/\s+/g, ' ').trim();
}

async function generatePDF(report: ReportData): Promise<void> {
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

  const drawSectionTitle = (text: string, bgColor: [number, number, number]) => {
    checkPageBreak(18);
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizeText(text), margin + 5, yPos + 8);
    doc.setTextColor(0, 0, 0);
    yPos += 18;
  };

  const drawSubHeading = (text: string, color: [number, number, number] = COLORS.primary) => {
    checkPageBreak(10);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(sanitizeText(text), margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 7;
  };

  const drawBodyText = (text: string, fontSize = 9, color: [number, number, number] = COLORS.dark) => {
    checkPageBreak(6);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    const cleanText = sanitizeText(text);
    const lines = doc.splitTextToSize(cleanText, contentWidth - 5);
    doc.text(lines, margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += lines.length * 4.5 + 2;
  };

  const drawBulletPoint = (text: string, bulletColor: [number, number, number], indent = 0) => {
    checkPageBreak(7);
    const bulletX = margin + indent;
    doc.setFillColor(bulletColor[0], bulletColor[1], bulletColor[2]);
    doc.circle(bulletX + 1.5, yPos - 1, 1.2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    const cleanText = sanitizeText(text);
    const lines = doc.splitTextToSize(cleanText, contentWidth - indent - 8);
    doc.text(lines, bulletX + 5, yPos);
    yPos += lines.length * 4.5 + 2;
  };

  const drawPieChart = (centerX: number, centerY: number, radius: number, value: number, color: [number, number, number], label: string) => {
    doc.setFillColor(230, 230, 230);
    doc.circle(centerX, centerY, radius, 'F');
    
    doc.setFillColor(color[0], color[1], color[2]);
    if (value > 0) {
      const startAngle = -90;
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
    doc.circle(centerX, centerY, radius * 0.55, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`${value}%`, centerX, centerY + 1, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text(sanitizeText(label), centerX, centerY + radius + 5, { align: 'center' });
  };

  const drawProgressBar = (x: number, y: number, width: number, height: number, value: number, color: [number, number, number], label: string) => {
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x, y, width, height, 2, 2, 'F');
    
    const fillWidth = Math.max((width * value) / 100, 2);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, fillWidth, height, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text(sanitizeText(label), x, y - 2);
    
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`${value}%`, x + width + 3, y + height - 1);
  };

  // ========== PAGE 1: COVER PAGE ==========
  doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.circle(pageWidth / 2, 55, 28, 'F');
  
  try {
    const img = new Image();
    img.src = logoImage;
    doc.addImage(img, 'PNG', pageWidth / 2 - 22, 33, 44, 44);
  } catch (e) {
    doc.setFillColor(255, 255, 255);
    doc.circle(pageWidth / 2, 55, 20, 'F');
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('GM', pageWidth / 2, 58, { align: 'center' });
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Growing Mind', pageWidth / 2, 95, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text("Children's Future", pageWidth / 2, 105, { align: 'center' });
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(25, 120, pageWidth - 50, 85, 6, 6, 'F');
  
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Child Development Assessment Report', pageWidth / 2, 135, { align: 'center' });
  
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(sanitizeText(report.coverPage.childName), pageWidth / 2, 155, { align: 'center' });
  
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.roundedRect(pageWidth/2 - 22, 162, 44, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Age: ${report.coverPage.childAge} years`, pageWidth / 2, 168, { align: 'center' });
  
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizeText(report.coverPage.assessmentType), pageWidth / 2, 185, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Date: ${report.coverPage.testDate}`, pageWidth / 2, 195, { align: 'center' });
  
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Based on child behavioral science principles', pageWidth / 2, 230, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Personalized Insights for Your Child\'s Growth', pageWidth / 2, 240, { align: 'center' });

  // ========== PAGE 2: EXECUTIVE SUMMARY ==========
  addNewPage();
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', pageWidth / 2, 22, { align: 'center' });
  yPos = 45;
  
  const scoreColor: [number, number, number] = report.executiveSummary.overallScore >= 80 ? COLORS.success :
                     report.executiveSummary.overallScore >= 60 ? COLORS.info :
                     report.executiveSummary.overallScore >= 40 ? COLORS.warning : COLORS.rose;
  
  drawPieChart(pageWidth / 2, yPos + 25, 22, report.executiveSummary.overallScore, scoreColor, report.executiveSummary.scoreCategory);
  yPos += 60;
  
  const halfWidth = (contentWidth - 10) / 2;
  
  doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
  doc.roundedRect(margin, yPos, halfWidth, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY STRENGTHS', margin + 4, yPos + 5.5);
  
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, yPos + 8, halfWidth, 45, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  report.executiveSummary.strengthAreas.slice(0, 4).forEach((s, i) => {
    const cleanText = sanitizeText(s);
    const lines = doc.splitTextToSize(`- ${cleanText}`, halfWidth - 8);
    doc.text(lines[0], margin + 4, yPos + 17 + (i * 10));
  });
  
  doc.setFillColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
  doc.roundedRect(margin + halfWidth + 10, yPos, halfWidth, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('GROWTH AREAS', margin + halfWidth + 14, yPos + 5.5);
  
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin + halfWidth + 10, yPos + 8, halfWidth, 45, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  report.executiveSummary.growthAreas.slice(0, 4).forEach((g, i) => {
    const cleanText = sanitizeText(g);
    const lines = doc.splitTextToSize(`- ${cleanText}`, halfWidth - 8);
    doc.text(lines[0], margin + halfWidth + 14, yPos + 17 + (i * 10));
  });
  yPos += 60;
  
  drawSectionTitle('TOP RECOMMENDATIONS', COLORS.info);
  report.executiveSummary.recommendations.forEach((rec, i) => {
    drawBulletPoint(rec, i % 2 === 0 ? COLORS.info : COLORS.purple);
  });
  yPos += 5;
  
  drawSectionTitle('PARENT ACTION CHECKLIST', COLORS.accent);
  report.executiveSummary.parentActionChecklist.forEach((item) => {
    drawBulletPoint(item, COLORS.accent);
  });

  // ========== PAGE 3: BEHAVIORAL INSIGHTS ==========
  addNewPage();
  
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BEHAVIORAL INSIGHTS', pageWidth / 2, 22, { align: 'center' });
  yPos = 45;
  
  drawSubHeading('Domain Performance Analysis', COLORS.secondary);
  yPos += 3;
  
  const barColors: [number, number, number][] = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.info, COLORS.purple, COLORS.teal];
  report.behavioralInsights.domains.forEach((domain, i) => {
    const color = barColors[i % barColors.length];
    drawProgressBar(margin, yPos, contentWidth - 25, 7, domain.score, color, domain.name);
    yPos += 16;
  });
  yPos += 8;
  
  drawSectionTitle('QUESTION-BY-QUESTION BEHAVIOUR INTERPRETATIONS', COLORS.purple);
  
  report.behavioralInsights.questionAnalysis.forEach((qa, i) => {
    checkPageBreak(32);
    
    const cardColors: [number, number, number][] = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.info, COLORS.purple, COLORS.teal, COLORS.orange, COLORS.rose];
    const cardColor = cardColors[i % cardColors.length];
    
    doc.setFillColor(cardColor[0], cardColor[1], cardColor[2]);
    doc.roundedRect(margin, yPos, contentWidth, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Q${i + 1}: ${sanitizeText(qa.question).substring(0, 70)}${qa.question.length > 70 ? '...' : ''} | Answer: ${sanitizeText(qa.answer)}`, margin + 3, yPos + 4);
    yPos += 7;
    
    doc.setFillColor(250, 250, 252);
    doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(cardColor[0], cardColor[1], cardColor[2]);
    doc.text('Behaviour Interpretation:', margin + 3, yPos + 5);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    const insightText = sanitizeText(qa.meaning);
    const insightLines = doc.splitTextToSize(insightText, contentWidth - 8);
    doc.text(insightLines.slice(0, 2).join(' '), margin + 3, yPos + 11);
    
    yPos += 22;
  });

  // ========== PAGE 4: STRENGTHS ANALYSIS ==========
  addNewPage();
  
  doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('STRENGTHS ANALYSIS', pageWidth / 2, 22, { align: 'center' });
  yPos = 45;
  
  const strengthCategories = [
    { name: 'Academic Strengths', items: report.strengthsAnalysis.academic, color: COLORS.info },
    { name: 'Behavioral Strengths', items: report.strengthsAnalysis.behavioral, color: COLORS.success },
    { name: 'Social Strengths', items: report.strengthsAnalysis.social, color: COLORS.purple },
    { name: 'Emotional Strengths', items: report.strengthsAnalysis.emotional, color: COLORS.rose },
    { name: 'Cognitive Strengths', items: report.strengthsAnalysis.cognitive, color: COLORS.teal },
  ];
  
  strengthCategories.forEach((cat) => {
    checkPageBreak(30);
    
    doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
    doc.roundedRect(margin, yPos, contentWidth, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(cat.name, margin + 4, yPos + 5);
    yPos += 10;
    
    cat.items.forEach(item => {
      drawBulletPoint(item, cat.color, 3);
    });
    yPos += 4;
  });

  // ========== PAGE 5: AREAS FOR GROWTH ==========
  addNewPage();
  
  doc.setFillColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AREAS FOR GROWTH', pageWidth / 2, 22, { align: 'center' });
  yPos = 45;
  
  report.areasOfImprovement.forEach((area, i) => {
    checkPageBreak(38);
    
    const areaColors: [number, number, number][] = [COLORS.orange, COLORS.rose, COLORS.purple, COLORS.teal];
    const areaColor = areaColors[i % areaColors.length];
    
    doc.setFillColor(areaColor[0], areaColor[1], areaColor[2]);
    doc.roundedRect(margin, yPos, contentWidth, 32, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizeText(area.area), margin + 5, yPos + 7);
    
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin + 3, yPos + 10, contentWidth - 6, 19, 2, 2, 'F');
    
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const reasonText = sanitizeText(`Why it matters: ${area.reason}`);
    const reasonLines = doc.splitTextToSize(reasonText, contentWidth - 12);
    doc.text(reasonLines[0], margin + 6, yPos + 17);
    const patternText = sanitizeText(`Pattern observed: ${area.pattern}`);
    const patternLines = doc.splitTextToSize(patternText, contentWidth - 12);
    doc.text(patternLines[0], margin + 6, yPos + 25);
    
    yPos += 38;
  });

  // ========== PAGE 6: PARENT GUIDANCE ==========
  addNewPage();
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PARENT GUIDANCE', pageWidth / 2, 22, { align: 'center' });
  yPos = 45;
  
  report.parentGuidance.forEach((guide, guideIndex) => {
    checkPageBreak(55);
    
    const guideColor: [number, number, number] = guideIndex % 2 === 0 ? COLORS.info : COLORS.purple;
    drawSectionTitle(guide.area, guideColor);
    
    const boxWidth = (contentWidth - 10) / 2;
    
    doc.setFillColor(230, 255, 230);
    doc.roundedRect(margin, yPos, boxWidth, 32, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    doc.text('What to DO', margin + 3, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    guide.whatToDo.slice(0, 3).forEach((item, i) => {
      const cleanText = sanitizeText(item);
      const lines = doc.splitTextToSize(`- ${cleanText}`, boxWidth - 6);
      doc.text(lines[0], margin + 3, yPos + 13 + (i * 6));
    });
    
    doc.setFillColor(255, 230, 230);
    doc.roundedRect(margin + boxWidth + 10, yPos, boxWidth, 32, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.rose[0], COLORS.rose[1], COLORS.rose[2]);
    doc.text('What to AVOID', margin + boxWidth + 13, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    guide.whatToAvoid.slice(0, 3).forEach((item, i) => {
      const cleanText = sanitizeText(item);
      const lines = doc.splitTextToSize(`- ${cleanText}`, boxWidth - 6);
      doc.text(lines[0], margin + boxWidth + 13, yPos + 13 + (i * 6));
    });
    
    yPos += 40;
  });

  // ========== PAGE 7: 30-DAY GROWTH PLAN ==========
  addNewPage();
  
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('30-DAY GROWTH PLAN', pageWidth / 2, 22, { align: 'center' });
  yPos = 45;
  
  const weekColors: [number, number, number][] = [COLORS.info, COLORS.purple, COLORS.teal, COLORS.orange];
  report.growthPlan.forEach((week, i) => {
    checkPageBreak(45);
    const weekColor = weekColors[i % weekColors.length];
    
    doc.setFillColor(weekColor[0], weekColor[1], weekColor[2]);
    doc.roundedRect(margin, yPos, 45, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Week ${week.week}`, margin + 8, yPos + 7);
    
    doc.setTextColor(weekColor[0], weekColor[1], weekColor[2]);
    doc.setFontSize(11);
    doc.text(sanitizeText(week.focus), margin + 50, yPos + 7);
    yPos += 14;
    
    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.roundedRect(margin, yPos, contentWidth, 26, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    doc.text('Activities:', margin + 4, yPos + 7);
    doc.setFont('helvetica', 'normal');
    const activitiesText = sanitizeText(week.activities.join(' | '));
    const actLines = doc.splitTextToSize(activitiesText, contentWidth - 35);
    doc.text(actLines[0], margin + 25, yPos + 7);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Goals:', margin + 4, yPos + 16);
    doc.setFont('helvetica', 'normal');
    const goalsText = sanitizeText(week.goals.join(' | '));
    const goalLines = doc.splitTextToSize(goalsText, contentWidth - 25);
    doc.text(goalLines[0], margin + 20, yPos + 16);
    
    yPos += 32;
  });

  // ========== PAGE 8: ACTIVITY RECOMMENDATIONS ==========
  addNewPage();
  
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTIVITY RECOMMENDATIONS', pageWidth / 2, 22, { align: 'center' });
  yPos = 45;
  
  const activities = [
    { name: 'Yoga Poses', items: report.activityRecommendations.yogaPoses, color: COLORS.purple },
    { name: 'Brain Games', items: report.activityRecommendations.brainGames, color: COLORS.info },
    { name: 'Outdoor Activities', items: report.activityRecommendations.outdoorActivities, color: COLORS.success },
    { name: 'Art Activities', items: report.activityRecommendations.artActivities, color: COLORS.accent },
    { name: 'Focus Exercises', items: report.activityRecommendations.focusExercises, color: COLORS.orange },
    { name: 'Confidence Building', items: report.activityRecommendations.confidenceBuilding, color: COLORS.teal },
  ];
  
  const cardWidth = (contentWidth - 10) / 2;
  const cardHeight = 35;
  
  activities.forEach((act, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = margin + col * (cardWidth + 10);
    const y = yPos + row * (cardHeight + 6);
    
    if (y > pageHeight - margin - cardHeight) {
      addNewPage();
      yPos = margin;
    }
    
    doc.setFillColor(act.color[0], act.color[1], act.color[2]);
    doc.roundedRect(x, y, cardWidth, 9, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(act.name, x + 3, y + 6);
    
    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.roundedRect(x, y + 9, cardWidth, cardHeight - 9, 2, 2, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    act.items.slice(0, 3).forEach((item, j) => {
      const cleanText = sanitizeText(item);
      doc.text(`- ${cleanText.substring(0, 38)}`, x + 3, y + 17 + (j * 6));
    });
  });
  yPos += Math.ceil(activities.length / 2) * (cardHeight + 6) + 10;

  // ========== PAGE 9: NUTRITION GUIDANCE ==========
  addNewPage();
  
  doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('NUTRITION GUIDANCE', pageWidth / 2, 22, { align: 'center' });
  yPos = 45;
  
  const nutritionSections = [
    { name: 'Brain-Boosting Foods', items: report.nutritionGuidance.brainBoosting, color: COLORS.info },
    { name: 'Foods for Concentration', items: report.nutritionGuidance.concentration, color: COLORS.purple },
    { name: 'Mood-Stabilizing Foods', items: report.nutritionGuidance.moodStabilizing, color: COLORS.success },
    { name: 'Weekly Diet Tips', items: report.nutritionGuidance.weeklyTips, color: COLORS.teal },
    { name: 'Foods to Reduce', items: report.nutritionGuidance.toReduce, color: COLORS.rose },
  ];
  
  nutritionSections.forEach(section => {
    checkPageBreak(28);
    drawSectionTitle(section.name, section.color);
    section.items.forEach(item => {
      drawBulletPoint(item, section.color, 3);
    });
    yPos += 3;
  });

  // ========== PAGE 10: SCHOOL SUGGESTIONS ==========
  addNewPage();
  
  doc.setFillColor(COLORS.info[0], COLORS.info[1], COLORS.info[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SCHOOL SUGGESTIONS', pageWidth / 2, 22, { align: 'center' });
  yPos = 45;
  
  const schoolSections = [
    { name: 'Seating Recommendations', items: report.schoolSuggestions.seating, color: COLORS.info },
    { name: 'Homework Routine Tips', items: report.schoolSuggestions.homework, color: COLORS.purple },
    { name: 'Teacher Communication', items: report.schoolSuggestions.teacherCommunication, color: COLORS.teal },
    { name: 'Emotional Support Needed', items: report.schoolSuggestions.emotionalSupport, color: COLORS.rose },
    { name: 'Focus Strategies for School', items: report.schoolSuggestions.focusStrategies, color: COLORS.orange },
  ];
  
  schoolSections.forEach(section => {
    checkPageBreak(28);
    drawSectionTitle(section.name, section.color);
    section.items.forEach(item => {
      drawBulletPoint(item, section.color, 3);
    });
    yPos += 3;
  });

  // ========== PAGE 11: BONUS INSIGHTS ==========
  addNewPage();
  
  doc.setFillColor(COLORS.purple[0], COLORS.purple[1], COLORS.purple[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BONUS INSIGHTS', pageWidth / 2, 22, { align: 'center' });
  yPos = 45;
  
  drawSectionTitle('PERSONALITY SNAPSHOT', COLORS.accent);
  report.bonusInsights.personalitySnapshot.forEach(trait => {
    drawBulletPoint(trait, COLORS.accent, 3);
  });
  yPos += 8;
  
  drawSectionTitle('KEY METRICS', COLORS.info);
  yPos += 3;
  
  const chartRadius = 18;
  const chartSpacing = contentWidth / 3;
  
  drawPieChart(margin + chartSpacing / 2, yPos + chartRadius, chartRadius, 
               report.bonusInsights.confidenceMeter, COLORS.success, 'Confidence');
  drawPieChart(margin + chartSpacing * 1.5, yPos + chartRadius, chartRadius,
               report.bonusInsights.attentionIndex, COLORS.info, 'Attention');
  drawPieChart(margin + chartSpacing * 2.5, yPos + chartRadius, chartRadius,
               report.bonusInsights.emotionalStability, COLORS.purple, 'Emotional Stability');
  
  yPos += chartRadius * 2 + 18;
  
  drawSectionTitle('RECOMMENDED PARENTING STYLE', COLORS.teal);
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, yPos, contentWidth, 22, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  const parentingText = sanitizeText(report.bonusInsights.parentingStyleRecommendation);
  const parentingLines = doc.splitTextToSize(parentingText, contentWidth - 10);
  doc.text(parentingLines, margin + 5, yPos + 8);

  // ========== FINAL PAGE: CONCLUSION ==========
  addNewPage();
  
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCLUSION', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for trusting Growing Mind', pageWidth / 2, 48, { align: 'center' });
  
  yPos = 75;
  
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(margin, yPos, contentWidth, 45, 4, 4, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  const messageText = sanitizeText(report.conclusion.message);
  const messageLines = doc.splitTextToSize(messageText, contentWidth - 15);
  doc.text(messageLines, margin + 8, yPos + 12);
  
  yPos += 55;
  
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.roundedRect(margin, yPos, contentWidth, 35, 4, 4, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  const encouragementText = sanitizeText(report.conclusion.encouragement);
  const encouragementLines = doc.splitTextToSize(`"${encouragementText}"`, contentWidth - 15);
  doc.text(encouragementLines, margin + 8, yPos + 12);
  
  yPos = pageHeight - 30;
  doc.setFillColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'F');
  doc.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Growing Mind', pageWidth / 2, yPos + 7, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text("Children's Future - Empowering Growth Through Science", pageWidth / 2, yPos + 13, { align: 'center' });

  // Save the PDF
  const childNameClean = sanitizeText(report.coverPage.childName).replace(/\s+/g, '_');
  const assessmentClean = sanitizeText(report.coverPage.assessmentType).replace(/\s+/g, '_');
  const filename = `${childNameClean}_${assessmentClean}_Report.pdf`;
  
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
    onSuccess: async (report) => {
      setGenerationProgress(100);
      await generatePDF(report);
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
               generationProgress < 70 ? 'Generating personalized insights...' :
               generationProgress < 100 ? 'Creating PDF report...' : 'Complete!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
