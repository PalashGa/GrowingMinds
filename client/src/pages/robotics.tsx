import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, Play, Clock, User, Trophy, BookOpen, Wrench, CheckCircle, ArrowRight, 
  Cpu, Battery, Eye, Ear, Hand, Thermometer, Zap, Cog, Heart, Rocket,
  Factory, Home, Stethoscope, GraduationCap, Lightbulb, Code, ArrowLeft,
  Star, ChevronRight, Sparkles, Target, Settings, Radio, Volume2
} from "lucide-react";
import type { RoboticsModule, Child, RoboticsProgress } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";

const ROBOTICS_BASICS_MODULES = [
  {
    id: "what-is-robot",
    number: 1,
    title: "What Is a Robot?",
    icon: "🤖",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    description: "A robot is a smart machine that can do tasks on its own or with commands.",
    content: {
      mainIdea: "A robot is a smart machine that can do tasks on its own.",
      examples: [
        { name: "Vacuum Robots", icon: "🧹", desc: "Clean your floors automatically" },
        { name: "Drones", icon: "🚁", desc: "Fly and capture photos from the sky" },
        { name: "Robot Toys", icon: "🎮", desc: "Interactive toys that move and talk" },
        { name: "Factory Robots", icon: "🏭", desc: "Build cars and products" },
      ],
      funFact: "The word 'robot' comes from a Czech word 'robota' meaning 'forced work' or 'labor'!",
      quiz: [
        { q: "What makes a robot 'smart'?", a: "It can sense, think, and act on its own!" },
        { q: "Can robots be any size?", a: "Yes! From tiny nano-robots to huge factory robots!" },
      ]
    }
  },
  {
    id: "robot-parts",
    number: 2,
    title: "Robot Parts",
    icon: "⚙️",
    color: "bg-green-500",
    bgColor: "bg-green-50",
    description: "Learn about the main building blocks that make up every robot.",
    content: {
      parts: [
        { 
          name: "Sensors", 
          icon: "👁️", 
          emoji: "🔍",
          desc: "Eyes & ears of the robot - help it see and hear the world",
          examples: ["Camera sensors", "Sound sensors", "Touch sensors"]
        },
        { 
          name: "Motors", 
          icon: "💪", 
          emoji: "⚡",
          desc: "Robot's muscles - make parts move and spin",
          examples: ["Wheel motors", "Arm motors", "Gripper motors"]
        },
        { 
          name: "Battery", 
          icon: "🔋", 
          emoji: "⚡",
          desc: "Robot's energy source - like food for humans!",
          examples: ["Rechargeable batteries", "Solar panels", "Power adapters"]
        },
        { 
          name: "Wheels & Arms", 
          icon: "🦾", 
          emoji: "🔧",
          desc: "Help robots move around and grab things",
          examples: ["Wheels for driving", "Arms for picking", "Legs for walking"]
        },
        { 
          name: "Brain (Microcontroller)", 
          icon: "🧠", 
          emoji: "💻",
          desc: "The computer that thinks and makes decisions",
          examples: ["Arduino", "Raspberry Pi", "Micro:bit"]
        },
      ],
      activity: "Draw a robot and label all 5 parts: sensors, motors, battery, wheels/arms, and brain!"
    }
  },
  {
    id: "how-robots-move",
    number: 3,
    title: "How Robots Move",
    icon: "🚗",
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    description: "Discover how robots use wheels, motors, and sensors to move around.",
    content: {
      concepts: [
        {
          title: "How Wheels Turn",
          icon: "⭕",
          explanation: "Motors are connected to wheels. When electricity flows, the motor spins the wheel!",
          visual: "Motor → Axle → Wheel → Movement"
        },
        {
          title: "How Motors Work",
          icon: "⚡",
          explanation: "Motors convert electrical energy into motion. They have magnets inside that spin when powered.",
          visual: "Electricity → Magnets Spin → Shaft Rotates"
        },
        {
          title: "Line Following",
          icon: "➿",
          explanation: "Robots use light sensors to detect a dark line on the ground. They adjust their motors to stay on the line!",
          visual: "Sensor Sees Line → Brain Calculates → Motors Adjust"
        }
      ],
      movements: [
        { name: "Forward", arrow: "⬆️", desc: "Both wheels spin forward together" },
        { name: "Backward", arrow: "⬇️", desc: "Both wheels spin backward together" },
        { name: "Turn Left", arrow: "⬅️", desc: "Right wheel faster, left wheel slower" },
        { name: "Turn Right", arrow: "➡️", desc: "Left wheel faster, right wheel slower" },
        { name: "Spin", arrow: "🔄", desc: "Wheels spin in opposite directions" },
      ]
    }
  },
  {
    id: "sensors",
    number: 4,
    title: "Sensors - Robot's Senses",
    icon: "👁️",
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    description: "Learn how robots sense the world just like humans do!",
    content: {
      intro: "Sensors help robots 'sense' the world around them - just like how we use our eyes, ears, and hands!",
      sensors: [
        {
          name: "Light Sensor",
          icon: "💡",
          humanSense: "Like our eyes",
          what: "Detects brightness and darkness",
          uses: ["Following lines", "Detecting day/night", "Finding light sources"],
          color: "bg-yellow-100"
        },
        {
          name: "Sound Sensor",
          icon: "🔊",
          humanSense: "Like our ears",
          what: "Hears sounds and voice commands",
          uses: ["Voice control", "Detecting claps", "Music robots"],
          color: "bg-blue-100"
        },
        {
          name: "Touch Sensor",
          icon: "✋",
          humanSense: "Like our skin",
          what: "Feels when something bumps into it",
          uses: ["Detecting obstacles", "Button presses", "Grip control"],
          color: "bg-pink-100"
        },
        {
          name: "Distance Sensor",
          icon: "📏",
          humanSense: "Like judging distance",
          what: "Measures how far away objects are",
          uses: ["Avoiding walls", "Parking robots", "Following objects"],
          color: "bg-green-100"
        },
        {
          name: "Temperature Sensor",
          icon: "🌡️",
          humanSense: "Like feeling hot/cold",
          what: "Measures temperature",
          uses: ["Weather robots", "Safety systems", "Cooking robots"],
          color: "bg-red-100"
        },
      ],
      challenge: "Match the sensor! What sensor would a robot use to: 1) Avoid bumping into walls? 2) Turn on lights at night? 3) Respond to your voice?"
    }
  },
  {
    id: "coding-basics",
    number: 5,
    title: "Basics of Coding",
    icon: "💻",
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    description: "Learn how to give commands to robots using simple coding concepts.",
    content: {
      intro: "Coding is how we tell robots what to do. It's like giving step-by-step instructions!",
      commands: [
        { 
          name: "Move Forward", 
          block: "🟢 MOVE FORWARD", 
          code: "robot.forward()",
          desc: "Makes the robot go straight ahead"
        },
        { 
          name: "Turn Left", 
          block: "🔵 TURN LEFT", 
          code: "robot.left()",
          desc: "Rotates the robot to the left"
        },
        { 
          name: "Turn Right", 
          block: "🔴 TURN RIGHT", 
          code: "robot.right()",
          desc: "Rotates the robot to the right"
        },
        { 
          name: "Stop", 
          block: "⬛ STOP", 
          code: "robot.stop()",
          desc: "Makes the robot stop moving"
        },
        { 
          name: "Check Obstacle", 
          block: "🟡 IF OBSTACLE", 
          code: "if robot.sees_obstacle():",
          desc: "Checks if something is in the way"
        },
      ],
      sequence: {
        title: "Example: Navigate a Maze",
        steps: [
          "1. Move Forward",
          "2. IF obstacle ahead THEN Turn Right",
          "3. Move Forward",
          "4. IF obstacle ahead THEN Turn Left",
          "5. Continue until goal reached!"
        ]
      },
      codingTypes: [
        { name: "Block Coding", ages: "5-10", tool: "Scratch, Blockly", icon: "🧩" },
        { name: "Python", ages: "10+", tool: "Python with robots", icon: "🐍" },
        { name: "Arduino", ages: "12+", tool: "C++ for hardware", icon: "⚡" },
      ]
    }
  },
  {
    id: "real-life-robots",
    number: 6,
    title: "Real-Life Uses of Robots",
    icon: "🌍",
    color: "bg-teal-500",
    bgColor: "bg-teal-50",
    description: "Explore how robots help us in hospitals, space, homes, and industries.",
    content: {
      areas: [
        {
          title: "Robots in Hospitals",
          icon: "🏥",
          emoji: "💊",
          examples: [
            "Surgery robots help doctors operate with precision",
            "Medicine delivery robots bring supplies to patients",
            "Therapy robots help children and elderly",
            "Disinfection robots clean hospital rooms"
          ],
          color: "bg-red-100"
        },
        {
          title: "Robots in Space",
          icon: "🚀",
          emoji: "🌟",
          examples: [
            "Mars rovers explore other planets",
            "Space station robots help astronauts",
            "Satellite repair robots fix equipment",
            "Moon exploration robots collect samples"
          ],
          color: "bg-purple-100"
        },
        {
          title: "Robots in Homes",
          icon: "🏠",
          emoji: "🏡",
          examples: [
            "Vacuum robots clean floors automatically",
            "Smart assistants help with daily tasks",
            "Lawn mowing robots cut grass",
            "Pool cleaning robots maintain pools"
          ],
          color: "bg-green-100"
        },
        {
          title: "Robots in Industries",
          icon: "🏭",
          emoji: "⚙️",
          examples: [
            "Assembly robots build cars and electronics",
            "Welding robots join metal parts",
            "Packaging robots box products",
            "Quality inspection robots check for defects"
          ],
          color: "bg-blue-100"
        }
      ],
      futureJobs: [
        { title: "Robotics Engineer", icon: "🔧", desc: "Designs and builds robots" },
        { title: "AI Programmer", icon: "💻", desc: "Makes robots smart with code" },
        { title: "Robot Operator", icon: "🎮", desc: "Controls and monitors robots" },
        { title: "Drone Pilot", icon: "🚁", desc: "Flies drones for various purposes" },
      ]
    }
  },
  {
    id: "mini-activities",
    number: 7,
    title: "Mini Robotics Activities",
    icon: "🎨",
    color: "bg-pink-500",
    bgColor: "bg-pink-50",
    description: "Fun hands-on activities to build and learn about robots!",
    content: {
      activities: [
        {
          title: "Build a Cardboard Robot",
          icon: "📦",
          difficulty: "Easy",
          time: "30 mins",
          materials: ["Cardboard boxes", "Markers", "Tape", "Bottle caps for eyes"],
          steps: [
            "Find a medium-sized cardboard box for the body",
            "Cut out arm and leg shapes from extra cardboard",
            "Attach arms and legs with tape or string",
            "Add details: eyes, buttons, antennas",
            "Decorate with markers and stickers!"
          ]
        },
        {
          title: "Human Robot Game",
          icon: "🎮",
          difficulty: "Easy",
          time: "15 mins",
          materials: ["Just yourself and friends!"],
          steps: [
            "One person is the 'Programmer'",
            "Another person is the 'Robot'",
            "Programmer gives commands: forward, left, right, stop",
            "Robot must follow commands exactly",
            "Try navigating around obstacles!"
          ]
        },
        {
          title: "Draw a Robot Blueprint",
          icon: "📝",
          difficulty: "Medium",
          time: "20 mins",
          materials: ["Paper", "Pencil", "Colored markers"],
          steps: [
            "Draw your dream robot",
            "Label all the parts: sensors, motors, battery, brain",
            "Write what your robot can do",
            "Add special features and colors",
            "Present your design to family!"
          ]
        },
        {
          title: "Sensor Scavenger Hunt",
          icon: "🔍",
          difficulty: "Easy",
          time: "20 mins",
          materials: ["Paper and pen for recording"],
          steps: [
            "Walk around your house",
            "Find devices that use sensors",
            "Examples: motion lights, automatic doors, smoke detectors",
            "Write down what sensor each device uses",
            "Share your findings!"
          ]
        },
      ],
      onlineTools: [
        { name: "Scratch", url: "scratch.mit.edu", desc: "Block-based coding for kids", icon: "🐱" },
        { name: "Code.org", url: "code.org", desc: "Learn coding with games", icon: "🎓" },
        { name: "Tinkercad Circuits", url: "tinkercad.com", desc: "Virtual electronics lab", icon: "⚡" },
      ]
    }
  }
];

export default function Robotics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<typeof ROBOTICS_BASICS_MODULES[0] | null>(null);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"basics" | "advanced">("basics");
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

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

  const { data: children, error: childrenError } = useQuery<Child[]>({
    queryKey: ['/api/children'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: roboticsModules, isLoading: modulesLoading, error: modulesError } = useQuery<RoboticsModule[]>({
    queryKey: ['/api/robotics/modules'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: progressData, error: progressError } = useQuery<RoboticsProgress[]>({
    queryKey: ['/api/children', selectedChildId, 'robotics-progress'],
    enabled: isAuthenticated && !!selectedChildId,
    retry: false,
  });

  useEffect(() => {
    if ((childrenError && isUnauthorizedError(childrenError)) || 
        (modulesError && isUnauthorizedError(modulesError)) ||
        (progressError && isUnauthorizedError(progressError))) {
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
  }, [childrenError, modulesError, progressError, toast]);

  useEffect(() => {
    if (children && children.length === 1 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children?.find(child => child.id === selectedChildId);
  const childAge = selectedChild?.age || 10;

  const handleOpenModule = (module: typeof ROBOTICS_BASICS_MODULES[0]) => {
    setSelectedModule(module);
    setIsModuleDialogOpen(true);
  };

  const handleCompleteModule = (moduleId: string) => {
    setCompletedModules(prev => new Set(Array.from(prev).concat([moduleId])));
    toast({
      title: "Module Completed! 🎉",
      description: "Great job! You've completed this robotics module.",
    });
  };

  const calculateBasicsProgress = () => {
    return Math.round((completedModules.size / ROBOTICS_BASICS_MODULES.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Robotics Learning
              </h1>
              <p className="text-lg text-muted-foreground">For Kids 8-16 Years</p>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-700">
              Robotics = Machines + Sensors + Coding + Creativity
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Select Learner
              </CardTitle>
              <CardDescription>Choose which child is learning robotics</CardDescription>
            </CardHeader>
            <CardContent>
              {!children || children.length === 0 ? (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Create a child profile to start learning.</p>
                  <Button variant="outline">Create Profile</Button>
                </div>
              ) : (
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: child.profileColor || '#4F46E5' }}
                          />
                          <span>{child.name} (Age {child.age})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {selectedChildId && (
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                  Learning Progress
                </CardTitle>
                <CardDescription>{selectedChild?.name}'s robotics journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Basics Modules</span>
                    <span className="font-bold text-purple-600">{completedModules.size}/{ROBOTICS_BASICS_MODULES.length}</span>
                  </div>
                  <Progress value={calculateBasicsProgress()} className="h-3" />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(completedModules).map(id => (
                      <Badge key={id} className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {ROBOTICS_BASICS_MODULES.find(m => m.id === id)?.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">What Is Robotics?</h2>
          </div>
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">The Science of Creating Smart Machines</h3>
                  <p className="text-lg text-white/90 mb-6">
                    Robotics is the science of creating robots that can move, think, and work like humans or machines.
                    Kids learn how robots work and how they follow commands.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-white/20 text-white text-sm py-2 px-4">🔧 Machines</Badge>
                    <Badge className="bg-white/20 text-white text-sm py-2 px-4">👁️ Sensors</Badge>
                    <Badge className="bg-white/20 text-white text-sm py-2 px-4">💻 Coding</Badge>
                    <Badge className="bg-white/20 text-white text-sm py-2 px-4">🎨 Creativity</Badge>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="text-9xl animate-bounce">🤖</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Robotics Basics Modules
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ROBOTICS_BASICS_MODULES.map((module) => {
              const isCompleted = completedModules.has(module.id);
              
              return (
                <Card 
                  key={module.id}
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 ${isCompleted ? 'ring-2 ring-green-500' : ''}`}
                  onClick={() => handleOpenModule(module)}
                >
                  <div className={`h-2 ${module.color}`} />
                  <CardHeader className={module.bgColor}>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-white">
                        Module {module.number}
                      </Badge>
                      {isCompleted && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    <div className="text-4xl my-2">{module.icon}</div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardDescription className="line-clamp-2 mb-4">
                      {module.description}
                    </CardDescription>
                    <Button 
                      className={`w-full ${module.color} hover:opacity-90 text-white`}
                    >
                      {isCompleted ? (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Review
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Learning
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "🧠", label: "Critical Thinking", desc: "Solve problems creatively" },
            { icon: "🔧", label: "Engineering", desc: "Build and design machines" },
            { icon: "💻", label: "Coding Skills", desc: "Program robots to work" },
            { icon: "🚀", label: "Future Ready", desc: "Prepare for tech careers" },
          ].map((skill, i) => (
            <Card key={i} className="text-center border-2 hover:border-purple-300 transition-colors">
              <CardContent className="pt-6">
                <div className="text-4xl mb-3">{skill.icon}</div>
                <h3 className="font-bold mb-1">{skill.label}</h3>
                <p className="text-sm text-muted-foreground">{skill.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">🚀 Future Jobs in Robotics</h2>
              <p className="text-white/90 mb-6">
                Learning robotics today prepares kids for exciting careers tomorrow!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Robotics Engineer", icon: "🔧" },
                  { title: "AI Developer", icon: "🧠" },
                  { title: "Drone Pilot", icon: "🚁" },
                  { title: "Space Technician", icon: "🚀" },
                ].map((job, i) => (
                  <div key={i} className="bg-white/20 rounded-xl p-4">
                    <div className="text-3xl mb-2">{job.icon}</div>
                    <h3 className="font-semibold text-sm">{job.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden p-0">
          {selectedModule && (
            <>
              <div className={`${selectedModule.color} p-6 text-white`}>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-white/20 text-white">
                      Module {selectedModule.number}
                    </Badge>
                    {completedModules.has(selectedModule.id) && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-2xl flex items-center gap-3 mt-2">
                    <span className="text-4xl">{selectedModule.icon}</span>
                    {selectedModule.title}
                  </DialogTitle>
                  <DialogDescription className="text-white/90">
                    {selectedModule.description}
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <ScrollArea className="h-[60vh] p-6">
                {selectedModule.id === "what-is-robot" && (
                  <div className="space-y-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                          <Lightbulb className="mr-2 text-yellow-500" />
                          Main Idea
                        </h3>
                        <p className="text-lg">{selectedModule.content.mainIdea}</p>
                      </CardContent>
                    </Card>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-4">Examples of Robots</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(selectedModule.content as any).examples?.map((ex: any, i: number) => (
                          <Card key={i} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4 flex items-center gap-4">
                              <span className="text-4xl">{ex.icon}</span>
                              <div>
                                <h4 className="font-bold">{ex.name}</h4>
                                <p className="text-sm text-muted-foreground">{ex.desc}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2 flex items-center">
                          <Star className="mr-2 text-yellow-500" />
                          Fun Fact!
                        </h3>
                        <p>{selectedModule.content.funFact}</p>
                      </CardContent>
                    </Card>

                    <div>
                      <h3 className="text-xl font-bold mb-4">Quick Quiz</h3>
                      <Accordion type="single" collapsible className="space-y-2">
                        {(selectedModule.content as any).quiz?.map((item: any, i: number) => (
                          <AccordionItem key={i} value={`quiz-${i}`} className="border rounded-lg px-4">
                            <AccordionTrigger className="text-left">
                              <span className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-purple-500" />
                                {item.q}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="text-green-700 font-medium">
                              ✅ {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                )}

                {selectedModule.id === "robot-parts" && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {(selectedModule.content as any).parts?.map((part: any, i: number) => (
                        <Card key={i} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="text-5xl">{part.icon}</div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                  {part.name}
                                  <span className="text-2xl">{part.emoji}</span>
                                </h3>
                                <p className="text-muted-foreground mb-3">{part.desc}</p>
                                <div className="flex flex-wrap gap-2">
                                  {part.examples.map((ex: string, j: number) => (
                                    <Badge key={j} variant="secondary">{ex}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2 flex items-center">
                          <GraduationCap className="mr-2 text-green-600" />
                          Activity Time!
                        </h3>
                        <p>{selectedModule.content.activity}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedModule.id === "how-robots-move" && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {(selectedModule.content as any).concepts?.map((concept: any, i: number) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-3">
                              <span className="text-2xl">{concept.icon}</span>
                              {concept.title}
                            </h3>
                            <p className="text-muted-foreground mb-4">{concept.explanation}</p>
                            <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                              {concept.visual}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4">Movement Commands</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {(selectedModule.content as any).movements?.map((move: any, i: number) => (
                          <Card key={i} className="text-center hover:bg-blue-50 transition-colors">
                            <CardContent className="p-4">
                              <div className="text-3xl mb-2">{move.arrow}</div>
                              <h4 className="font-bold text-sm">{move.name}</h4>
                              <p className="text-xs text-muted-foreground">{move.desc}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedModule.id === "sensors" && (
                  <div className="space-y-6">
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-6">
                        <p className="text-lg">{(selectedModule.content as any).intro}</p>
                      </CardContent>
                    </Card>

                    <div className="grid gap-4">
                      {(selectedModule.content as any).sensors?.map((sensor: any, i: number) => (
                        <Card key={i} className={`${sensor.color} border-0`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="text-5xl">{sensor.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold">{sensor.name}</h3>
                                  <Badge variant="outline">{sensor.humanSense}</Badge>
                                </div>
                                <p className="text-muted-foreground mb-3">{sensor.what}</p>
                                <div className="flex flex-wrap gap-2">
                                  {sensor.uses.map((use: string, j: number) => (
                                    <Badge key={j} variant="secondary">{use}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2 flex items-center">
                          <Target className="mr-2 text-yellow-600" />
                          Sensor Challenge!
                        </h3>
                        <p>{(selectedModule.content as any).challenge}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedModule.id === "coding-basics" && (
                  <div className="space-y-6">
                    <Card className="bg-indigo-50 border-indigo-200">
                      <CardContent className="p-6">
                        <p className="text-lg">{(selectedModule.content as any).intro}</p>
                      </CardContent>
                    </Card>

                    <div>
                      <h3 className="text-xl font-bold mb-4">Basic Robot Commands</h3>
                      <div className="grid gap-3">
                        {(selectedModule.content as any).commands?.map((cmd: any, i: number) => (
                          <Card key={i} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center gap-4">
                              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg font-mono text-sm w-40 text-center">
                                {cmd.block}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold">{cmd.name}</h4>
                                <p className="text-sm text-muted-foreground">{cmd.desc}</p>
                              </div>
                              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                                {cmd.code}
                              </code>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-4">{(selectedModule.content as any).sequence?.title}</h3>
                        <div className="space-y-2">
                          {(selectedModule.content as any).sequence?.steps?.map((step: string, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <ChevronRight className="h-4 w-4 text-green-600" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <h3 className="text-xl font-bold mb-4">Coding Tools by Age</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {(selectedModule.content as any).codingTypes?.map((type: any, i: number) => (
                          <Card key={i} className="text-center">
                            <CardContent className="p-4">
                              <div className="text-3xl mb-2">{type.icon}</div>
                              <h4 className="font-bold">{type.name}</h4>
                              <Badge variant="outline" className="mt-2">Ages {type.ages}</Badge>
                              <p className="text-xs text-muted-foreground mt-2">{type.tool}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedModule.id === "real-life-robots" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {(selectedModule.content as any).areas?.map((area: any, i: number) => (
                        <Card key={i} className={`${area.color} border-0`}>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-4xl">{area.icon}</span>
                              <h3 className="text-xl font-bold">{area.title}</h3>
                            </div>
                            <ul className="space-y-2">
                              {area.examples.map((ex: string, j: number) => (
                                <li key={j} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                                  <span className="text-sm">{ex}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4">Future Robotics Jobs</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(selectedModule.content as any).futureJobs?.map((job: any, i: number) => (
                          <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="text-3xl mb-2">{job.icon}</div>
                              <h4 className="font-bold text-sm">{job.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{job.desc}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedModule.id === "mini-activities" && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {(selectedModule.content as any).activities?.map((activity: any, i: number) => (
                        <Card key={i} className="overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-3">
                                <span className="text-3xl">{activity.icon}</span>
                                {activity.title}
                              </CardTitle>
                              <div className="flex gap-2">
                                <Badge variant="outline">{activity.difficulty}</Badge>
                                <Badge variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {activity.time}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div className="mb-4">
                              <h4 className="font-semibold mb-2">Materials Needed:</h4>
                              <div className="flex flex-wrap gap-2">
                                {activity.materials.map((mat: string, j: number) => (
                                  <Badge key={j} variant="secondary">{mat}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Steps:</h4>
                              <ol className="space-y-2">
                                {activity.steps.map((step: string, j: number) => (
                                  <li key={j} className="flex items-start gap-3">
                                    <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                      {j + 1}
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                          <Code className="mr-2 text-blue-600" />
                          Online Coding Tools
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          {(selectedModule.content as any).onlineTools?.map((tool: any, i: number) => (
                            <Card key={i} className="text-center bg-white">
                              <CardContent className="p-4">
                                <div className="text-3xl mb-2">{tool.icon}</div>
                                <h4 className="font-bold">{tool.name}</h4>
                                <p className="text-xs text-blue-600">{tool.url}</p>
                                <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  {!completedModules.has(selectedModule.id) ? (
                    <Button 
                      onClick={() => handleCompleteModule(selectedModule.id)}
                      className={`${selectedModule.color} text-white`}
                      size="lg"
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Mark as Complete
                    </Button>
                  ) : (
                    <Button variant="outline" size="lg" disabled>
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      Completed!
                    </Button>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
