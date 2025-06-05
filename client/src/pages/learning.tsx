import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import LearningModule from "@/components/learning-module";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Lock, 
  Play, 
  CheckCircle, 
  Target, 
  Book, 
  Map, 
  TrendingUp,
  Award,
  Zap,
  Brain,
  Globe
} from "lucide-react";
import type { Conflict, Stock } from "@shared/schema";

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  points: number;
  prerequisites: string[];
  completed: boolean;
  locked: boolean;
  category: "Fundamentals" | "Analysis" | "Markets" | "Practical";
  icon: any;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export default function Learning() {
  const [userProgress, setUserProgress] = useState({
    totalPoints: 0,
    level: 1,
    completedModules: [] as string[],
    achievements: [] as string[],
    streak: 0
  });

  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const { data: conflicts } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const { data: stocks } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const learningModules: LearningModule[] = [
    {
      id: "geo-basics",
      title: "Geopolitical Fundamentals",
      description: "Understanding conflict analysis, regional dynamics, and key indicators",
      difficulty: "Beginner",
      duration: "",
      points: 100, // 4 questions × 25 points = 100 points
      prerequisites: [],
      completed: userProgress.completedModules.includes("geo-basics"),
      locked: false,
      category: "Fundamentals",
      icon: Globe
    },
    {
      id: "conflict-types",
      title: "Types of Modern Conflicts",
      description: "Interstate, civil wars, proxy conflicts, and hybrid warfare patterns",
      difficulty: "Beginner",
      duration: "",
      points: 150, // 3 quiz questions (30+30+40) + 1 scenario (50) = 150 points
      prerequisites: ["geo-basics"],
      completed: userProgress.completedModules.includes("conflict-types"),
      locked: !userProgress.completedModules.includes("geo-basics"),
      category: "Fundamentals",
      icon: Map
    },
    {
      id: "defense-markets",
      title: "Defense Industry Analysis",
      description: "How conflicts impact defense contractor stocks and market dynamics",
      difficulty: "Intermediate",
      duration: "",
      points: 200, // 2 quiz questions (40+35) + 2 data analysis (75+50) = 200 points
      prerequisites: ["geo-basics", "conflict-types"],
      completed: userProgress.completedModules.includes("defense-markets"),
      locked: !userProgress.completedModules.includes("conflict-types"),
      category: "Markets",
      icon: TrendingUp
    },
    {
      id: "data-interpretation",
      title: "Reading Conflict Data",
      description: "Interpreting casualty figures, displacement stats, and economic indicators",
      difficulty: "Intermediate",
      duration: "",
      points: 50, // 1 quiz question = 50 points
      prerequisites: ["conflict-types"],
      completed: userProgress.completedModules.includes("data-interpretation"),
      locked: !userProgress.completedModules.includes("conflict-types"),
      category: "Analysis",
      icon: Book
    },
    {
      id: "correlation-analysis",
      title: "Market Correlation Patterns",
      description: "Identifying relationships between geopolitical events and stock movements",
      difficulty: "Advanced",
      duration: "",
      points: 100, // 1 scenario question = 100 points
      prerequisites: ["defense-markets", "data-interpretation"],
      completed: userProgress.completedModules.includes("correlation-analysis"),
      locked: !userProgress.completedModules.includes("defense-markets") || !userProgress.completedModules.includes("data-interpretation"),
      category: "Analysis",
      icon: Brain
    },
    {
      id: "practical-case",
      title: "Live Case Study Analysis",
      description: "Apply your knowledge to current conflicts using real ConflictWatch data",
      difficulty: "Advanced",
      duration: "",
      points: 150, // 1 data analysis question = 150 points
      prerequisites: ["correlation-analysis"],
      completed: userProgress.completedModules.includes("practical-case"),
      locked: !userProgress.completedModules.includes("correlation-analysis"),
      category: "Practical",
      icon: Target
    }
  ];

  const achievements: Achievement[] = [
    {
      id: "first-steps",
      title: "First Steps",
      description: "Complete your first learning module",
      icon: Star,
      points: 50,
      unlocked: userProgress.completedModules.length > 0,
      progress: Math.min(userProgress.completedModules.length, 1),
      maxProgress: 1
    },
    {
      id: "knowledge-seeker",
      title: "Knowledge Seeker",
      description: "Complete all fundamental modules",
      icon: Book,
      points: 150,
      unlocked: learningModules.filter(m => m.category === "Fundamentals").every(m => userProgress.completedModules.includes(m.id)),
      progress: learningModules.filter(m => m.category === "Fundamentals" && userProgress.completedModules.includes(m.id)).length,
      maxProgress: learningModules.filter(m => m.category === "Fundamentals").length
    },
    {
      id: "market-analyst",
      title: "Market Analyst",
      description: "Master defense market analysis",
      icon: TrendingUp,
      points: 200,
      unlocked: learningModules.filter(m => m.category === "Markets").every(m => userProgress.completedModules.includes(m.id)),
      progress: learningModules.filter(m => m.category === "Markets" && userProgress.completedModules.includes(m.id)).length,
      maxProgress: learningModules.filter(m => m.category === "Markets").length
    },
    {
      id: "expert-analyst",
      title: "Expert Analyst",
      description: "Complete all learning modules",
      icon: Trophy,
      points: 500,
      unlocked: learningModules.every(m => userProgress.completedModules.includes(m.id)),
      progress: userProgress.completedModules.length,
      maxProgress: learningModules.length
    }
  ];

  const handleModuleComplete = (score: number) => {
    if (activeModuleId) {
      const module = learningModules.find(m => m.id === activeModuleId);
      if (module && !userProgress.completedModules.includes(activeModuleId)) {
        const earnedPoints = score; // Use actual score, not percentage calculation
        setUserProgress(prev => ({
          ...prev,
          completedModules: [...prev.completedModules, activeModuleId],
          totalPoints: prev.totalPoints + earnedPoints,
          level: Math.floor((prev.totalPoints + earnedPoints) / 500) + 1
        }));
      }
      setActiveModuleId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Fundamentals": return Globe;
      case "Analysis": return Brain;
      case "Markets": return TrendingUp;
      case "Practical": return Target;
      default: return Book;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Geopolitical Intelligence Learning Path
          </h1>
          <p className="text-slate-600">
            Master conflict analysis and defense market intelligence through interactive, gamified learning
          </p>
        </div>

        {/* User Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Level</p>
                  <p className="text-2xl font-bold text-slate-900">{userProgress.level}</p>
                </div>
                <Award className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Points</p>
                  <p className="text-2xl font-bold text-slate-900">{userProgress.totalPoints}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">{userProgress.completedModules.length}/{learningModules.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Achievements</p>
                  <p className="text-2xl font-bold text-slate-900">{achievements.filter(a => a.unlocked).length}/{achievements.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Modules */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Modules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningModules.map((module) => {
                  const IconComponent = module.icon;
                  return (
                    <div
                      key={module.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        module.locked 
                          ? "border-slate-200 bg-slate-50 opacity-60" 
                          : module.completed
                          ? "border-green-200 bg-green-50"
                          : "border-slate-200 bg-white hover:border-blue-300 cursor-pointer"
                      }`}
                      onClick={() => !module.locked && setSelectedModule(module)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${module.locked ? "bg-slate-200" : "bg-blue-100"}`}>
                            {module.locked ? (
                              <Lock className="w-5 h-5 text-slate-500" />
                            ) : module.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <IconComponent className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{module.title}</h3>
                              <Badge variant="outline" className={getDifficultyColor(module.difficulty)}>
                                {module.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{module.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3" />
                                <span>{module.points} points</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {!module.locked && !module.completed && (
                          <Button 
                            size="sm" 
                            className="ml-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModuleId(module.id);
                            }}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Achievements Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border ${
                        achievement.unlocked 
                          ? "border-yellow-200 bg-yellow-50" 
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.unlocked ? "bg-yellow-100" : "bg-slate-200"
                        }`}>
                          <IconComponent className={`w-4 h-4 ${
                            achievement.unlocked ? "text-yellow-600" : "text-slate-500"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{achievement.title}</h4>
                          <p className="text-xs text-slate-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <Progress 
                              value={(achievement.progress / achievement.maxProgress) * 100} 
                              className="flex-1 mr-2 h-2"
                            />
                            <span className="text-xs text-slate-500">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Active Conflicts</span>
                  <span className="font-medium">{(conflicts as Conflict[] || []).filter(c => c.status === "Active").length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Defense Companies</span>
                  <span className="font-medium">{(stocks as Stock[] || []).length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Live Data Sources</span>
                  <span className="font-medium">Yahoo Finance</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interactive Learning Module */}
        {activeModuleId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <LearningModule
                  moduleId={activeModuleId}
                  onComplete={handleModuleComplete}
                  onClose={() => setActiveModuleId(null)}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Module Detail Modal */}
        {selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <selectedModule.icon className="w-6 h-6" />
                      {selectedModule.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className={getDifficultyColor(selectedModule.difficulty)}>
                        {selectedModule.difficulty}
                      </Badge>
                      <Badge variant="outline">{selectedModule.category}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedModule(null)}>×</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">{selectedModule.description}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-slate-500" />
                    <span>Points: {selectedModule.points}</span>
                  </div>
                </div>

                {selectedModule.prerequisites.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Prerequisites:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {selectedModule.prerequisites.map(prereq => {
                        const prereqModule = learningModules.find(m => m.id === prereq);
                        return (
                          <li key={prereq}>{prereqModule?.title || prereq}</li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What you'll learn:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {selectedModule.id === "geo-basics" && (
                      <>
                        <li>• Core principles of geopolitical analysis</li>
                        <li>• Key terminology and concepts</li>
                        <li>• How to assess conflict severity and impact</li>
                        <li>• Understanding regional dynamics</li>
                      </>
                    )}
                    {selectedModule.id === "conflict-types" && (
                      <>
                        <li>• Interstate vs. intrastate conflicts</li>
                        <li>• Proxy wars and hybrid warfare</li>
                        <li>• Conflict escalation patterns</li>
                        <li>• Modern warfare characteristics</li>
                      </>
                    )}
                    {selectedModule.id === "defense-markets" && (
                      <>
                        <li>• Defense industry structure and key players</li>
                        <li>• How conflicts drive stock performance</li>
                        <li>• Reading defense contractor financials</li>
                        <li>• Market timing and geopolitical events</li>
                      </>
                    )}
                    {selectedModule.id === "data-interpretation" && (
                      <>
                        <li>• Analyzing casualty and displacement data</li>
                        <li>• Economic impact assessment</li>
                        <li>• Data reliability and source evaluation</li>
                        <li>• Trend identification and forecasting</li>
                      </>
                    )}
                    {selectedModule.id === "correlation-analysis" && (
                      <>
                        <li>• Statistical correlation methods</li>
                        <li>• Event-driven market analysis</li>
                        <li>• Risk assessment frameworks</li>
                        <li>• Portfolio impact evaluation</li>
                      </>
                    )}
                    {selectedModule.id === "practical-case" && (
                      <>
                        <li>• Apply analysis to {(conflicts as Conflict[] || [])[0]?.name || "current conflicts"}</li>
                        <li>• Real-time data interpretation</li>
                        <li>• Market prediction exercises</li>
                        <li>• Professional reporting techniques</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      setActiveModuleId(selectedModule.id);
                      setSelectedModule(null);
                    }}
                    disabled={selectedModule.completed}
                  >
                    {selectedModule.completed ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Learning
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedModule(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}