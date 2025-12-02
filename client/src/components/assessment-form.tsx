import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import type { AssessmentQuestion } from "@shared/schema";

interface AssessmentFormProps {
  question: AssessmentQuestion;
  answer: any;
  onAnswerChange: (answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  currentIndex: number;
  totalQuestions: number;
}

const scaleButtonColors: Record<string, { bg: string; hover: string; text: string; border: string }> = {
  'Never': { bg: 'bg-red-50', hover: 'hover:bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'Rarely': { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'Sometimes': { bg: 'bg-yellow-50', hover: 'hover:bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Often': { bg: 'bg-lime-50', hover: 'hover:bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' },
  'Always': { bg: 'bg-green-50', hover: 'hover:bg-green-100', text: 'text-green-700', border: 'border-green-200' },
};

const selectedButtonColors: Record<string, { bg: string; text: string; border: string }> = {
  'Never': { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
  'Rarely': { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  'Sometimes': { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-600' },
  'Often': { bg: 'bg-lime-500', text: 'text-white', border: 'border-lime-600' },
  'Always': { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
};

export default function AssessmentForm({
  question,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  isSubmitting,
  currentIndex,
  totalQuestions
}: AssessmentFormProps) {

  const handleScaleClick = (value: string) => {
    onAnswerChange(value);
    if (!isLastQuestion) {
      setTimeout(() => {
        onNext();
      }, 300);
    }
  };

  const handleRadioChange = (value: string) => {
    onAnswerChange(value);
    if (!isLastQuestion) {
      setTimeout(() => {
        onNext();
      }, 300);
    }
  };

  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const renderQuestionInput = () => {
    switch (question.questionType) {
      case 'multiple_choice': {
        const options = question.options as string[] | undefined;
        return (
          <div className="space-y-3">
            {options && options.map((option: string, index: number) => {
              const isSelected = answer === option;
              return (
                <button
                  key={index}
                  onClick={() => handleRadioChange(option)}
                  className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid={`option-${index}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );
      }
      
      case 'scale': {
        const scaleOptions = question.options as string[] | undefined;
        return (
          <div className="space-y-3">
            {scaleOptions && scaleOptions.map((option: string, index: number) => {
              const isSelected = answer === option;
              const colors = scaleButtonColors[option] || { bg: 'bg-gray-50', hover: 'hover:bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
              const selectedColors = selectedButtonColors[option] || { bg: 'bg-primary', text: 'text-white', border: 'border-primary' };
              
              return (
                <button
                  key={index}
                  onClick={() => handleScaleClick(option)}
                  className={`w-full p-4 rounded-xl border-2 text-center font-semibold transition-all duration-200 ${
                    isSelected
                      ? `${selectedColors.bg} ${selectedColors.text} ${selectedColors.border} shadow-lg scale-[1.02]`
                      : `${colors.bg} ${colors.hover} ${colors.text} ${colors.border}`
                  }`}
                  data-testid={`scale-option-${index}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );
      }
      
      case 'text':
        return (
          <Textarea
            placeholder="Please provide your answer here..."
            value={answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="min-h-[100px]"
            data-testid="textarea-answer"
          />
        );
      
      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <Card className="overflow-hidden" data-testid="card-assessment-question">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between text-white mb-3">
          <span className="font-medium text-sm">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="font-medium text-sm">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2 bg-white/30" />
      </div>
      
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 leading-relaxed" data-testid="text-question">
            {question.question}
          </h3>
        </div>
        
        {renderQuestionInput()}
        
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center"
            data-testid="button-previous"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {isLastQuestion && (
            <Button
              onClick={onNext}
              disabled={!canGoNext || isSubmitting}
              className="flex items-center bg-green-600 hover:bg-green-700"
              data-testid="button-next"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Assessment
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
