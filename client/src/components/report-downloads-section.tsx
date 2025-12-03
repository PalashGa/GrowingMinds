import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReportPDFGenerator from "./report-pdf-generator";
import { FileText, Download, Sparkles, CheckCircle2 } from "lucide-react";

interface AvailableReport {
  assessmentTypeId: string;
  assessmentTypeName: string;
  isCompleted: boolean;
  completedAt: string | null;
}

interface ReportDownloadsSectionProps {
  childId: string;
  childName: string;
}

const ASSESSMENT_TYPE_NAMES: Record<string, string> = {
  'behavioral': 'Child Behavioral Assessment',
  'personality': 'Personality Assessment',
  'iq': 'IQ Assessment',
  'career': 'Career Assessment',
  'strengths-weakness': 'Strengths & Weakness Assessment',
};

export default function ReportDownloadsSection({ childId, childName }: ReportDownloadsSectionProps) {
  const { data: availableReports, isLoading } = useQuery<AvailableReport[]>({
    queryKey: ['/api/children', childId, 'available-reports'],
    enabled: !!childId,
  });

  const completedCount = availableReports?.filter(r => r.isCompleted).length || 0;
  const totalCount = availableReports?.length || 5;

  return (
    <Card className="border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Download className="h-5 w-5 text-white" />
              </div>
              Download Assessment Reports
            </CardTitle>
            <CardDescription className="mt-2">
              Generate comprehensive PDF reports with AI-powered insights for {childName}
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            {completedCount}/{totalCount} Available
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : !availableReports || availableReports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No assessments available</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <p className="text-sm text-purple-700">
                Reports include AI-generated personalized insights, 30-day growth plans, activity recommendations, and more!
              </p>
            </div>
            
            <div className="grid gap-3">
              {availableReports.map((report) => (
                <ReportPDFGenerator
                  key={report.assessmentTypeId}
                  childId={childId}
                  childName={childName}
                  assessmentTypeId={report.assessmentTypeId}
                  assessmentTypeName={ASSESSMENT_TYPE_NAMES[report.assessmentTypeId] || report.assessmentTypeName}
                  isCompleted={report.isCompleted}
                />
              ))}
            </div>

            {completedCount === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Complete at least one assessment to unlock downloadable reports with personalized insights!
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
