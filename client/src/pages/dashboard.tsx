import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProgressChart from "@/components/progress-chart";
import ReportDownloadsSection from "@/components/report-downloads-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, User, Calendar, FileText, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Child, type AssessmentResult } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const createChildSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(5, "Age must be at least 5").max(16, "Age must be at most 16"),
  profileColor: z.string().optional(),
});

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: children, isLoading: childrenLoading, error } = useQuery<Child[]>({
    queryKey: ['/api/children'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: assessmentResults, isLoading: resultsLoading } = useQuery<AssessmentResult[]>({
    queryKey: ['/api/children', selectedChild, 'assessments'],
    enabled: isAuthenticated && !!selectedChild,
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  // Auto-select first child if available
  useEffect(() => {
    if (children && children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  const form = useForm<z.infer<typeof createChildSchema>>({
    resolver: zodResolver(createChildSchema),
    defaultValues: {
      name: "",
      age: 8,
      profileColor: "#4F46E5",
    },
  });

  const createChildMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createChildSchema>) => {
      const response = await apiRequest("POST", "/api/children", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      setIsAddChildOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Child profile created successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create child profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof createChildSchema>) => {
    createChildMutation.mutate(data);
  };

  if (isLoading || childrenLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" data-testid="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const selectedChildData = children?.find(child => child.id === selectedChild);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
              Parent Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your children's progress and manage their development programs
            </p>
          </div>
          
          <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-child">
                <Plus className="mr-2 h-4 w-4" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-child">
              <DialogHeader>
                <DialogTitle>Add Child Profile</DialogTitle>
                <DialogDescription>
                  Create a new profile for your child to access personalized assessments and programs.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Child's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter child's name" {...field} data-testid="input-child-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="5" 
                            max="16" 
                            value={field.value || ""}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              field.onChange(isNaN(val) ? "" : val);
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            data-testid="input-child-age"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profileColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Color</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} value={field.value || "#4F46E5"} data-testid="input-child-color" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createChildMutation.isPending}
                    data-testid="button-create-child"
                  >
                    {createChildMutation.isPending ? "Creating..." : "Create Profile"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {!children || children.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2" data-testid="card-no-children">
            <CardContent>
              <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No child profiles yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating a profile for your child to access personalized assessments and programs.
              </p>
              <Button onClick={() => setIsAddChildOpen(true)} data-testid="button-create-first-child">
                Create Your First Child Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={selectedChild || ""} onValueChange={setSelectedChild} className="space-y-6">
            {/* Child Selector */}
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4" data-testid="tabs-children">
              {children.map((child) => (
                <TabsTrigger
                  key={child.id}
                  value={child.id}
                  className="flex items-center space-x-2"
                  data-testid={`tab-child-${child.id}`}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: child.profileColor || '#4F46E5' }}
                  >
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{child.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Child Dashboard Content */}
            {children.map((child) => (
              <TabsContent key={child.id} value={child.id} className="space-y-6">
                {/* Child Overview */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card data-testid={`card-child-info-${child.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: child.profileColor || '#4F46E5' }}
                        >
                          {child.name.charAt(0).toUpperCase()}
                        </div>
                        <span data-testid={`text-child-name-${child.id}`}>{child.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age:</span>
                          <span data-testid={`text-child-age-${child.id}`}>{child.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Joined:</span>
                          <span data-testid={`text-child-joined-${child.id}`}>
                            {new Date(child.createdAt!).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant="secondary" className="w-full justify-center mt-4" data-testid={`badge-active-${child.id}`}>
                          Active Profile
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid={`card-assessments-${child.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Assessments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary mb-2" data-testid={`text-assessment-count-${child.id}`}>
                        {assessmentResults?.length || 0}
                      </div>
                      <p className="text-muted-foreground mb-4">Completed assessments</p>
                      <Button size="sm" className="w-full" data-testid={`button-new-assessment-${child.id}`}>
                        Start New Assessment
                      </Button>
                    </CardContent>
                  </Card>

                  <Card data-testid={`card-progress-${child.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-secondary mb-2">
                        85%
                      </div>
                      <p className="text-muted-foreground mb-4">Overall development</p>
                      <Button size="sm" variant="outline" className="w-full" data-testid={`button-view-details-${child.id}`}>
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress Chart */}
                <Card data-testid={`card-progress-chart-${child.id}`}>
                  <CardHeader>
                    <CardTitle>Development Progress</CardTitle>
                    <CardDescription>
                      Track your child's progress across different areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgressChart childId={child.id} />
                  </CardContent>
                </Card>

                {/* Report Downloads Section */}
                <ReportDownloadsSection 
                  childId={child.id} 
                  childName={child.name}
                />

                {/* Recent Assessments */}
                <Card data-testid={`card-recent-assessments-${child.id}`}>
                  <CardHeader>
                    <CardTitle>Recent Assessment Results</CardTitle>
                    <CardDescription>
                      View and download your child's latest assessment reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {resultsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : !assessmentResults || assessmentResults.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No assessments completed yet</p>
                        <Button className="mt-4" data-testid={`button-start-first-assessment-${child.id}`}>
                          Start First Assessment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {assessmentResults.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                            data-testid={`assessment-result-${result.id}`}
                          >
                            <div>
                              <h4 className="font-semibold" data-testid={`text-assessment-type-${result.id}`}>
                                {result.assessmentTypeId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h4>
                              <p className="text-sm text-muted-foreground" data-testid={`text-assessment-date-${result.id}`}>
                                Completed on {new Date(result.completedAt!).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" data-testid={`badge-completed-${result.id}`}>
                                Completed
                              </Badge>
                              <Button size="sm" variant="outline" data-testid={`button-download-${result.id}`}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
}
