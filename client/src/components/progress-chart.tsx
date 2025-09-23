import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Brain, Flower, Apple, Bot, Gamepad2, TrendingUp } from "lucide-react";
import type { AssessmentResult, YogaSession, GameScore, RoboticsProgress } from "@shared/schema";

interface ProgressChartProps {
  childId: string;
}

export default function ProgressChart({ childId }: ProgressChartProps) {
  const { data: assessmentResults } = useQuery<AssessmentResult[]>({
    queryKey: ['/api/children', childId, 'assessments'],
    enabled: !!childId,
    retry: false,
  });

  const { data: yogaSessions } = useQuery<YogaSession[]>({
    queryKey: ['/api/children', childId, 'yoga-sessions'],
    enabled: !!childId,
    retry: false,
  });

  const { data: gameScores } = useQuery<GameScore[]>({
    queryKey: ['/api/children', childId, 'game-scores'],
    enabled: !!childId,
    retry: false,
  });

  const { data: roboticsProgress } = useQuery<RoboticsProgress[]>({
    queryKey: ['/api/children', childId, 'robotics-progress'],
    enabled: !!childId,
    retry: false,
  });

  // Prepare data for charts
  const activityData = [
    {
      category: 'Assessments',
      count: assessmentResults?.length || 0,
      color: '#4F46E5', // primary
      icon: Brain
    },
    {
      category: 'Yoga Sessions',
      count: yogaSessions?.length || 0,
      color: '#059669', // secondary
      icon: Flower
    },
    {
      category: 'Games Played',
      count: gameScores?.length || 0,
      color: '#DC2626', // destructive
      icon: Gamepad2
    },
    {
      category: 'Robotics Modules',
      count: roboticsProgress?.filter(p => p.status === 'completed').length || 0,
      color: '#F59E0B', // accent
      icon: Bot
    }
  ];

  // Calculate overall progress scores
  const progressData = [
    {
      area: 'Cognitive Assessment',
      score: assessmentResults?.length ? Math.min(assessmentResults.length * 25, 100) : 0,
      color: '#4F46E5'
    },
    {
      area: 'Physical Wellness',
      score: yogaSessions?.length ? Math.min(yogaSessions.length * 10, 100) : 0,
      color: '#059669'
    },
    {
      area: 'Learning Games',
      score: gameScores?.length ? Math.min(gameScores.length * 5, 100) : 0,
      color: '#DC2626'
    },
    {
      area: 'STEM Skills',
      score: roboticsProgress?.length ? 
        Math.round(roboticsProgress.reduce((sum, p) => sum + parseFloat(p.progress || '0'), 0) / roboticsProgress.length) : 0,
      color: '#F59E0B'
    }
  ];

  // Recent activity timeline
  const getRecentActivity = () => {
    const activities: Array<{
      type: string;
      date: string;
      description: string;
      icon: any;
      color: string;
    }> = [];

    assessmentResults?.slice(-3).forEach(result => {
      activities.push({
        type: 'Assessment',
        date: result.completedAt!.toISOString(),
        description: `Completed ${result.assessmentTypeId.replace('-', ' ')} assessment`,
        icon: Brain,
        color: '#4F46E5'
      });
    });

    yogaSessions?.slice(-3).forEach(session => {
      activities.push({
        type: 'Yoga',
        date: session.startedAt!.toISOString(),
        description: `Completed ${session.duration}-minute yoga session`,
        icon: Flower,
        color: '#059669'
      });
    });

    gameScores?.slice(-3).forEach(score => {
      activities.push({
        type: 'Game',
        date: score.playedAt!.toISOString(),
        description: `Scored ${score.score} points in game`,
        icon: Gamepad2,
        color: '#DC2626'
      });
    });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const recentActivity = getRecentActivity();
  const overallProgress = Math.round(
    progressData.reduce((sum, item) => sum + item.score, 0) / progressData.length
  );

  return (
    <div className="space-y-6" data-testid="progress-chart-container">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {activityData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={index} data-testid={`activity-card-${index}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <IconComponent 
                      className="h-5 w-5" 
                      style={{ color: item.color }}
                    />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: item.color }} data-testid={`activity-count-${index}`}>
                      {item.count}
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid={`activity-label-${index}`}>
                      {item.category}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Progress Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart - Development Areas */}
        <Card data-testid="card-progress-bars">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Development Progress
            </CardTitle>
            <CardDescription>
              Progress across different development areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="area" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Progress']}
                  labelStyle={{ color: '#000' }}
                />
                <Bar 
                  dataKey="score" 
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Activity Distribution */}
        <Card data-testid="card-activity-pie">
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
            <CardDescription>
              Breakdown of completed activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityData.filter(item => item.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Summary */}
      <Card data-testid="card-overall-progress">
        <CardHeader>
          <CardTitle>Overall Development Score</CardTitle>
          <CardDescription>
            Combined progress across all development areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2" data-testid="text-overall-score">
                {overallProgress}%
              </div>
              <Badge 
                variant={overallProgress >= 75 ? "default" : overallProgress >= 50 ? "secondary" : "outline"}
                data-testid="badge-progress-level"
              >
                {overallProgress >= 75 ? "Excellent" : overallProgress >= 50 ? "Good" : "Getting Started"}
              </Badge>
            </div>
            <div className="space-y-2">
              {progressData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm" data-testid={`progress-item-${index}`}>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="w-24">{item.area}:</span>
                  <span className="font-medium">{item.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Timeline */}
      <Card data-testid="card-recent-activity">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest achievements and completed activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
              <p>No recent activity to display</p>
              <p className="text-sm">Complete assessments, yoga sessions, or games to see progress here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30" data-testid={`recent-activity-${index}`}>
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${activity.color}15` }}
                    >
                      <IconComponent 
                        className="h-4 w-4" 
                        style={{ color: activity.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" data-testid={`activity-description-${index}`}>
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`activity-date-${index}`}>
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs" data-testid={`activity-type-${index}`}>
                      {activity.type}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
