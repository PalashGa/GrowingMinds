import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
}

export default function AssessmentForm({
  question,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  isSubmitting
}: AssessmentFormProps) {
  const [textAnswer, setTextAnswer] = useState(answer || "");

  const handleRadioChange = (value: string) => {
    onAnswerChange(value);
  };

  const handleScaleChange = (value: string) => {
    onAnswerChange(parseInt(value));
  };

  const handleTextChange = (value: string) => {
    setTextAnswer(value);
    onAnswerChange(value);
  };

  const renderQuestionInput = () => {
    switch (question.questionType) {
      case 'multiple_choice':
        return (
          <RadioGroup value={answer || ""} onValueChange={handleRadioChange} className="space-y-3">
            {question.options && (question.options as string[]).map((option, index) => (
              <div key={index} className="flex items-center space-x-2" data-testid={`option-${index}`}>
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-sm cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'scale':
        return (
          <div className="space-y-4">
            <RadioGroup value={answer?.toString() || ""} onValueChange={handleScaleChange} className="flex justify-between">
              {question.options && (question.options as string[]).map((option, index) => (
                <div key={index} className="flex flex-col items-center space-y-2" data-testid={`scale-option-${index}`}>
                  <RadioGroupItem value={index.toString()} id={`scale-${index}`} />
                  <Label htmlFor={`scale-${index}`} className="text-xs text-center cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Least</span>
              <span>Most</span>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <Textarea
            placeholder="Please provide your answer here..."
            value={textAnswer}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[100px]"
            data-testid="textarea-answer"
          />
        );
      
      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <Card data-testid="card-assessment-question">
      <CardHeader>
        <CardTitle className="text-xl" data-testid="text-question-title">
          Question {question.orderIndex}
        </CardTitle>
        {question.isRequired && (
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="text-destructive mr-1">*</span>
            Required question
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4" data-testid="text-question">
            {question.question}
          </h3>
          {renderQuestionInput()}
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t">
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
          
          <div className="text-sm text-muted-foreground">
            {answer && (
              <div className="flex items-center text-secondary">
                <CheckCircle className="mr-1 h-4 w-4" />
                Answered
              </div>
            )}
          </div>
          
          <Button
            onClick={onNext}
            disabled={!canGoNext || isSubmitting}
            className="flex items-center"
            data-testid="button-next"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : isLastQuestion ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Assessment
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
