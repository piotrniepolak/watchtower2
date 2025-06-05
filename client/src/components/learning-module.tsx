import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Trophy,
  Target,
  Brain,
  TrendingUp,
  Globe
} from "lucide-react";
import type { Conflict, Stock } from "@shared/schema";

interface Question {
  id: string;
  type: "multiple-choice" | "scenario" | "data-analysis";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

interface LearningModuleProps {
  moduleId: string;
  onComplete: (score: number) => void;
  onClose: () => void;
}

export default function LearningModule({ moduleId, onComplete, onClose }: LearningModuleProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const { data: conflicts } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const { data: stocks } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const getModuleContent = () => {
    const activeConflicts = (conflicts as Conflict[] || []).filter(c => c.status === "Active");
    const defensiveStocks = (stocks as Stock[] || []).slice(0, 5);

    switch (moduleId) {
      case "geo-basics":
        return {
          title: "Geopolitical Fundamentals",
          steps: [
            {
              type: "lesson",
              title: "Understanding Conflict Analysis",
              content: `
                <h3>Core Principles of Geopolitical Analysis</h3>
                <p>Geopolitical analysis examines how geography, politics, and economics interact to shape global events. Key principles include:</p>
                <ul>
                  <li><strong>Geographic Factors:</strong> Location, resources, borders, and strategic positioning</li>
                  <li><strong>Political Dynamics:</strong> Government stability, alliances, and internal conflicts</li>
                  <li><strong>Economic Influence:</strong> Trade relationships, resource dependencies, and market access</li>
                  <li><strong>Historical Context:</strong> Past conflicts, cultural tensions, and unresolved disputes</li>
                </ul>
                
                <h4>Current Global Context</h4>
                <p>Today, we're monitoring <strong>${activeConflicts.length} active conflicts</strong> worldwide, each with unique characteristics and implications for global stability.</p>
                
                <h4>Regional Distribution Analysis</h4>
                <p>The conflicts span across ${new Set(activeConflicts.map(c => c.region)).size} major regions, with the highest concentration in areas of strategic importance.</p>
              `
            },
            {
              type: "quiz",
              questions: [
                {
                  id: "q1",
                  type: "multiple-choice",
                  question: `Based on current data, how many active conflicts is ConflictWatch monitoring?`,
                  options: ["10", "13", "15", "18"],
                  correctAnswer: activeConflicts.length.toString(),
                  explanation: `ConflictWatch currently monitors ${activeConflicts.length} active conflicts globally, providing real-time analysis of ongoing geopolitical situations.`,
                  points: 25
                },
                {
                  id: "q2",
                  type: "multiple-choice",
                  question: "Which factor is NOT a core component of geopolitical analysis?",
                  options: ["Geographic positioning", "Cultural preferences", "Economic dependencies", "Historical context"],
                  correctAnswer: "Cultural preferences",
                  explanation: "While culture influences geopolitics, individual cultural preferences are less significant than geographic, economic, and historical factors in conflict analysis.",
                  points: 25
                },
                {
                  id: "q3",
                  type: "multiple-choice",
                  question: `How many distinct regions are affected by current active conflicts?`,
                  options: ["3", "4", "5", "6"],
                  correctAnswer: new Set(activeConflicts.map(c => c.region)).size.toString(),
                  explanation: `Current conflicts span ${new Set(activeConflicts.map(c => c.region)).size} major regions, demonstrating the global nature of contemporary geopolitical instability.`,
                  points: 25
                },
                {
                  id: "q4",
                  type: "multiple-choice",
                  question: "What is the primary purpose of geopolitical intelligence analysis?",
                  options: [
                    "Predicting stock market movements",
                    "Understanding power dynamics and strategic implications",
                    "Supporting military operations",
                    "Influencing diplomatic negotiations"
                  ],
                  correctAnswer: "Understanding power dynamics and strategic implications",
                  explanation: "Geopolitical intelligence analysis focuses on understanding how geographic, political, and economic factors interact to influence global power dynamics and strategic decision-making.",
                  points: 25
                }
              ]
            }
          ]
        };

      case "conflict-types":
        return {
          title: "Types of Modern Conflicts",
          steps: [
            {
              type: "lesson",
              title: "Conflict Classification",
              content: `
                <h3>Modern Conflict Categories</h3>
                <p>Contemporary conflicts fall into several distinct categories:</p>
                
                <h4>Interstate Conflicts</h4>
                <p>Direct military confrontations between sovereign states. Example: ${activeConflicts.find(c => c.region === "Eastern Europe")?.name || "Traditional state-vs-state warfare"}</p>
                
                <h4>Intrastate Conflicts</h4>
                <p>Civil wars and internal conflicts within state borders. These often involve government forces versus rebel groups or ethnic conflicts.</p>
                
                <h4>Proxy Conflicts</h4>
                <p>Conflicts where major powers support opposing sides without direct military engagement.</p>
                
                <h4>Hybrid Warfare</h4>
                <p>Combining conventional military tactics with cyber warfare, disinformation, and economic pressure.</p>
              `
            },
            {
              type: "scenario",
              title: "Conflict Analysis Exercise",
              content: `
                <h3>Real-World Analysis</h3>
                <p>Using current ConflictWatch data, analyze this scenario:</p>
                <div class="bg-blue-50 p-4 rounded-lg">
                  <p><strong>Scenario:</strong> ${activeConflicts[0]?.name || "Regional Conflict"} has been ongoing since ${activeConflicts[0]?.startDate || "2022"}.</p>
                  <p><strong>Current Status:</strong> ${activeConflicts[0]?.status || "Active"}</p>
                  <p><strong>Severity Level:</strong> ${activeConflicts[0]?.severity || "High"}</p>
                </div>
              `,
              questions: [
                {
                  id: "s1",
                  type: "multiple-choice",
                  question: `What type of conflict best describes the ${activeConflicts[0]?.name || "current situation"}?`,
                  options: ["Interstate", "Intrastate", "Proxy", "Hybrid"],
                  correctAnswer: "Interstate",
                  explanation: "This represents an interstate conflict as it involves direct confrontation between sovereign nations.",
                  points: 50
                }
              ]
            }
          ]
        };

      case "defense-markets":
        return {
          title: "Defense Industry Analysis",
          steps: [
            {
              type: "lesson",
              title: "Defense Market Dynamics",
              content: `
                <h3>How Conflicts Drive Defense Markets</h3>
                <p>Defense contractor stocks respond to geopolitical events through several mechanisms:</p>
                
                <h4>Direct Revenue Impact</h4>
                <p>Increased military spending leads to higher defense contracts and revenue growth.</p>
                
                <h4>Market Expectations</h4>
                <p>Anticipated conflicts can drive stock prices even before actual contracts are awarded.</p>
                
                <h4>Current Market Status</h4>
                <p>Today's defense market data shows:</p>
                <ul>
                  <li><strong>Total Companies Tracked:</strong> ${defensiveStocks.length} major contractors</li>
                  <li><strong>Average Price Change:</strong> ${(defensiveStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / defensiveStocks.length).toFixed(2)}%</li>
                  <li><strong>Top Performer:</strong> ${defensiveStocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || "N/A"}</li>
                </ul>
              `
            },
            {
              type: "data-analysis",
              title: "Market Data Interpretation",
              questions: [
                {
                  id: "d1",
                  type: "multiple-choice",
                  question: `Which defense contractor is currently showing the strongest performance today?`,
                  options: defensiveStocks.map(stock => `${stock.symbol} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`),
                  correctAnswer: `${defensiveStocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || "LMT"} (${defensiveStocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.changePercent >= 0 ? '+' : ''}${defensiveStocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.changePercent.toFixed(2) || "0.00"}%)`,
                  explanation: `${defensiveStocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || "This company"} is leading today's performance, likely due to positive market sentiment or recent contract announcements.`,
                  points: 75
                }
              ]
            }
          ]
        };

      case "data-interpretation":
        return {
          title: "Data Analysis & Intelligence",
          steps: [
            {
              type: "lesson",
              title: "Understanding Conflict Data",
              content: `
                <h3>Key Metrics in Conflict Analysis</h3>
                <p>Intelligence analysts focus on several critical data points when assessing conflicts:</p>
                
                <h4>Severity Assessment</h4>
                <p>Conflicts are classified by severity levels:</p>
                <ul>
                  <li><strong>Low:</strong> Limited engagement, minimal casualties</li>
                  <li><strong>Medium:</strong> Regular combat operations, moderate impact</li>
                  <li><strong>High:</strong> Intense fighting, significant civilian impact</li>
                  <li><strong>Critical:</strong> Full-scale warfare, regional destabilization</li>
                </ul>
                
                <h4>Current Intelligence Summary</h4>
                <p>Based on our real-time monitoring:</p>
                <ul>
                  <li><strong>Active Conflicts:</strong> ${activeConflicts.length} situations under observation</li>
                  <li><strong>High Severity:</strong> ${activeConflicts.filter(c => c.severity === "High").length} conflicts</li>
                  <li><strong>Regional Distribution:</strong> Spanning ${new Set(activeConflicts.map(c => c.region)).size} major regions</li>
                </ul>
              `
            },
            {
              type: "quiz",
              questions: [
                {
                  id: "di1",
                  type: "multiple-choice",
                  question: `How many conflicts are currently classified as "High" severity?`,
                  options: ["2", "3", "4", "5"],
                  correctAnswer: activeConflicts.filter(c => c.severity === "High").length.toString(),
                  explanation: `Currently ${activeConflicts.filter(c => c.severity === "High").length} conflicts are classified as high severity, indicating significant impact on regional stability.`,
                  points: 50
                }
              ]
            }
          ]
        };

      case "correlation-analysis":
        return {
          title: "Market Correlation Analysis",
          steps: [
            {
              type: "lesson",
              title: "Understanding Market Correlations",
              content: `
                <h3>Event-Driven Market Analysis</h3>
                <p>Geopolitical events create measurable impacts on defense markets through various channels:</p>
                
                <h4>Direct Correlation Factors</h4>
                <ul>
                  <li><strong>Conflict Escalation:</strong> Typically increases defense stock prices</li>
                  <li><strong>Military Aid Packages:</strong> Benefits specific contractors</li>
                  <li><strong>Defense Budget Changes:</strong> Affects entire sector outlook</li>
                  <li><strong>Technology Developments:</strong> Impacts specialized companies</li>
                </ul>
                
                <h4>Current Market Analysis</h4>
                <p>Today's correlation indicators:</p>
                <ul>
                  <li><strong>Market Volatility:</strong> Defense sector showing ${defensiveStocks.filter(s => Math.abs(s.changePercent) > 1).length} stocks with >1% movement</li>
                  <li><strong>Volume Analysis:</strong> Average trading volume indicates ${defensiveStocks.filter(s => s.volume > 1000000).length} stocks with high activity</li>
                  <li><strong>Sector Performance:</strong> Overall trend is ${(defensiveStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / defensiveStocks.length) > 0 ? 'positive' : 'negative'}</li>
                </ul>
              `
            },
            {
              type: "scenario",
              title: "Real-Time Correlation Exercise",
              content: `
                <h3>Market Impact Assessment</h3>
                <p>Analyze this real scenario:</p>
                <div class="bg-amber-50 p-4 rounded-lg">
                  <p><strong>Current Situation:</strong> ${activeConflicts[0]?.name || "Regional Conflict"} continues with ${activeConflicts[0]?.severity || "High"} severity.</p>
                  <p><strong>Market Response:</strong> Defense stocks showing mixed performance today.</p>
                  <p><strong>Key Indicator:</strong> ${defensiveStocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || "Top performer"} leads with ${defensiveStocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.changePercent.toFixed(2) || "strong"}% change.</p>
                </div>
              `,
              questions: [
                {
                  id: "ca1",
                  type: "multiple-choice",
                  question: "What is the most likely driver of today's defense market performance?",
                  options: [
                    "Ongoing conflict developments",
                    "Quarterly earnings reports",
                    "General market sentiment",
                    "Currency fluctuations"
                  ],
                  correctAnswer: "Ongoing conflict developments",
                  explanation: "Given the current geopolitical climate and active conflicts, defense market movements are primarily driven by conflict-related developments and military spending expectations.",
                  points: 100
                }
              ]
            }
          ]
        };

      case "practical-case":
        return {
          title: "Advanced Case Study Analysis",
          steps: [
            {
              type: "lesson",
              title: "Professional Intelligence Analysis",
              content: `
                <h3>Comprehensive Conflict Assessment</h3>
                <p>In this advanced module, you'll conduct a full intelligence assessment using current ConflictWatch data.</p>
                
                <h4>Case Study: ${activeConflicts[0]?.name || "Current Regional Conflict"}</h4>
                <div class="bg-slate-100 p-4 rounded-lg">
                  <p><strong>Conflict Overview:</strong></p>
                  <ul>
                    <li><strong>Location:</strong> ${activeConflicts[0]?.region || "Eastern Europe"}</li>
                    <li><strong>Duration:</strong> Since ${activeConflicts[0]?.startDate || "2022"}</li>
                    <li><strong>Current Status:</strong> ${activeConflicts[0]?.status || "Active"}</li>
                    <li><strong>Severity Level:</strong> ${activeConflicts[0]?.severity || "High"}</li>
                  </ul>
                </div>
                
                <h4>Market Impact Analysis</h4>
                <p>Corresponding defense market indicators:</p>
                <ul>
                  <li><strong>Sector Performance:</strong> ${(defensiveStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / defensiveStocks.length).toFixed(2)}% average change</li>
                  <li><strong>Volume Trends:</strong> ${defensiveStocks.filter(s => s.volume > 1000000).length} stocks with elevated trading</li>
                  <li><strong>Leading Companies:</strong> ${defensiveStocks.sort((a, b) => b.changePercent - a.changePercent).slice(0, 3).map(s => s.symbol).join(', ')}</li>
                </ul>
              `
            },
            {
              type: "data-analysis",
              title: "Professional Assessment Exercise",
              questions: [
                {
                  id: "pc1",
                  type: "multiple-choice",
                  question: `Based on the ${activeConflicts[0]?.name || "current conflict"} situation, what is the most appropriate investment strategy?`,
                  options: [
                    "Immediate portfolio rebalancing toward defense stocks",
                    "Gradual position building with risk management",
                    "Wait-and-see approach until situation stabilizes",
                    "Diversify away from defense sector entirely"
                  ],
                  correctAnswer: "Gradual position building with risk management",
                  explanation: "Professional analysts recommend measured approaches that account for volatility while capitalizing on sustained geopolitical trends. Immediate reactions often lead to poor timing, while excessive caution misses opportunities.",
                  points: 150
                }
              ]
            }
          ]
        };

      default:
        return {
          title: "Learning Module",
          steps: [
            {
              type: "lesson",
              title: "Module Content",
              content: "<p>Module content would be loaded here based on the selected learning path.</p>"
            }
          ]
        };
    }
  };

  const moduleContent = getModuleContent();
  const currentStepData = moduleContent.steps[currentStep];
  const totalSteps = moduleContent.steps.length;

  const handleAnswer = (questionId: string, answer: any) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentStepData.type === "quiz" || currentStepData.type === "scenario" || currentStepData.type === "data-analysis") {
      // Calculate score for current step
      const questions = currentStepData.questions || [];
      let stepScore = 0;
      
      questions.forEach(question => {
        if (userAnswers[question.id] === question.correctAnswer) {
          stepScore += question.points;
        }
      });
      
      setScore(prev => prev + stepScore);
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleComplete = () => {
    onComplete(score);
  };

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case "lesson":
        return (
          <div className="space-y-4">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: currentStepData.content || "" }}
            />
          </div>
        );

      case "quiz":
      case "scenario":
      case "data-analysis":
        return (
          <div className="space-y-6">
            {currentStepData.content && (
              <div 
                className="prose max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: currentStepData.content || "" }}
              />
            )}
            
            {(currentStepData.questions || []).map((question, index) => (
              <Card key={question.id} className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Question {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 font-medium">{question.question}</p>
                  
                  {question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                            userAnswers[question.id] === option
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={userAnswers[question.id] === option}
                            onChange={(e) => handleAnswer(question.id, e.target.value)}
                            className="sr-only"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                    <span>Points: {question.points}</span>
                    {userAnswers[question.id] && (
                      <Badge variant="outline">Answer selected</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return <div>Unknown step type</div>;
    }
  };

  if (showResults) {
    const maxScore = moduleContent.steps.reduce((total, step) => {
      if (step.questions) {
        return total + step.questions.reduce((stepTotal, q) => stepTotal + q.points, 0);
      }
      return total;
    }, 0);

    const percentage = (score / maxScore) * 100;

    return (
      <div className="space-y-6">
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Trophy className="w-6 h-6" />
              Module Completed!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-green-600">{score}/{maxScore}</div>
              <div className="text-lg text-slate-700">Your Score: {percentage.toFixed(1)}%</div>
              
              <Progress value={percentage} className="w-full h-3" />
              
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                {percentage >= 80 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Excellent work! You've mastered this module.</span>
                  </>
                ) : percentage >= 60 ? (
                  <>
                    <Target className="w-4 h-4 text-yellow-600" />
                    <span>Good job! Consider reviewing the material to improve your score.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Keep learning! Review the content and try again.</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-3">
          <Button onClick={handleComplete} className="flex-1">
            Continue Learning Path
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">{moduleContent.title}</h2>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <Progress value={((currentStep + 1) / totalSteps) * 100} className="w-32 h-2" />
        </div>
      </div>

      {/* Step content */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStepData.type === "lesson" && <Globe className="w-5 h-5" />}
            {currentStepData.type === "quiz" && <Brain className="w-5 h-5" />}
            {currentStepData.type === "scenario" && <Target className="w-5 h-5" />}
            {currentStepData.type === "data-analysis" && <TrendingUp className="w-5 h-5" />}
            {currentStepData.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Exit Module
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (currentStepData.type === "quiz" || currentStepData.type === "scenario" || currentStepData.type === "data-analysis") &&
              (currentStepData.questions || []).some(q => !userAnswers[q.id])
            }
          >
            {currentStep === totalSteps - 1 ? "Complete Module" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}