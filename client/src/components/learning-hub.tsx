import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Brain, Trophy, Timer, Target, Sparkles, Crown, Medal, Play, CheckCircle, Lock, Star, Award, BookOpen, Users, Zap, Shield, Activity, AlertTriangle, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conflict, Stock } from '@shared/schema';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  source: string;
  tags: string[];
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
  sector: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  currentQuestion: number;
}

interface QuizResponse {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface LeaderboardEntry {
  id: number;
  username: string;
  totalScore: number;
  streak: number;
  sector: string;
  lastQuizDate: string;
  rank: number;
}

interface UserStats {
  totalScore: number;
  streak: number;
  correctAnswers: number;
  totalQuestions: number;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  steps: LearningStep[];
}

interface LearningStep {
  type: 'lesson' | 'quiz' | 'scenario';
  title: string;
  content?: string;
  questions?: LearningQuestion[];
}

interface LearningQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'scenario';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

interface LearningHubProps {}

export function LearningHub({}: LearningHubProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [learningSelectedSector, setLearningSelectedSector] = useState<string>('defense');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Interactive Learning Module States
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [moduleAnswers, setModuleAnswers] = useState<Record<string, any>>({});
  const [moduleScore, setModuleScore] = useState(0);
  const [showModuleResults, setShowModuleResults] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Fetch live data for dynamic module content
  const { data: conflicts } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const { data: stocks } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const sectorConfig = {
    defense: {
      title: 'ConflictWatch Learning',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      icon: Target,
    },
    health: {
      title: 'PharmaWatch Learning',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: Brain,
    },
    energy: {
      title: 'EnergyWatch Learning',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      icon: Sparkles,
    },
  };

  const config = sectorConfig[learningSelectedSector as keyof typeof sectorConfig] || sectorConfig.defense;

  // Generate dynamic learning modules based on live data
  const getLearningModules = (): LearningModule[] => {
    const activeConflicts = (conflicts as Conflict[] || []).filter(c => c.status === "Active");
    const defensiveStocks = (stocks as Stock[] || []).filter(s => s.sector === 'Defense').slice(0, 5);
    const healthStocks = (stocks as Stock[] || []).filter(s => s.sector === 'Healthcare').slice(0, 5);
    const energyStocks = (stocks as Stock[] || []).filter(s => s.sector === 'Energy').slice(0, 5);

    const modules: { [key: string]: LearningModule[] } = {
      defense: [
        {
          id: 'geo-basics',
          title: 'Geopolitical Fundamentals',
          description: 'Master the core principles of conflict analysis and geopolitical intelligence',
          icon: Shield,
          difficulty: 'beginner',
          points: 100,
          steps: [
            {
              type: 'lesson',
              title: 'Understanding Conflict Analysis',
              content: `
                <h3>Core Principles of Geopolitical Analysis</h3>
                <p>Geopolitical analysis examines how geography, politics, and economics interact to shape global events.</p>
                <ul>
                  <li><strong>Geographic Factors:</strong> Location, resources, borders, strategic positioning</li>
                  <li><strong>Political Dynamics:</strong> Government stability, alliances, internal conflicts</li>
                  <li><strong>Economic Influence:</strong> Trade relationships, resource dependencies, market access</li>
                  <li><strong>Historical Context:</strong> Past conflicts, cultural tensions, unresolved disputes</li>
                </ul>
                <h4>Current Global Context</h4>
                <p>ConflictWatch currently monitors <strong>${activeConflicts.length} active conflicts</strong> across ${new Set(activeConflicts.map(c => c.region)).size} major regions.</p>
              `
            },
            {
              type: 'quiz',
              title: 'Knowledge Check',
              questions: [
                {
                  id: 'q1',
                  type: 'multiple-choice',
                  question: `Based on current data, how many active conflicts is ConflictWatch monitoring?`,
                  options: [
                    (activeConflicts.length - 2).toString(),
                    (activeConflicts.length - 1).toString(),
                    activeConflicts.length.toString(),
                    (activeConflicts.length + 1).toString()
                  ],
                  correctAnswer: activeConflicts.length.toString(),
                  explanation: `ConflictWatch currently monitors ${activeConflicts.length} active conflicts globally, providing real-time analysis of ongoing geopolitical situations.`,
                  points: 25
                },
                {
                  id: 'q2',
                  type: 'multiple-choice',
                  question: 'Which factor is NOT a core component of geopolitical analysis?',
                  options: ['Geographic positioning', 'Cultural preferences', 'Economic dependencies', 'Historical context'],
                  correctAnswer: 'Cultural preferences',
                  explanation: 'While culture influences geopolitics, individual cultural preferences are less significant than geographic, economic, and historical factors in conflict analysis.',
                  points: 25
                }
              ]
            }
          ]
        },
        {
          id: 'defense-markets',
          title: 'Defense Market Intelligence',
          description: 'Analyze how conflicts drive defense contractor performance and market dynamics',
          icon: Target,
          difficulty: 'intermediate',

          points: 150,
          steps: [
            {
              type: 'lesson',
              title: 'Defense Market Dynamics',
              content: `
                <h3>How Conflicts Drive Defense Markets</h3>
                <p>Defense contractor stocks respond to geopolitical events through several mechanisms:</p>
                <h4>Current Market Status</h4>
                <ul>
                  <li><strong>Companies Tracked:</strong> ${defensiveStocks.length} major contractors</li>
                  <li><strong>Top Performer:</strong> ${defensiveStocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || "N/A"}</li>
                  <li><strong>High Volatility Stocks:</strong> ${defensiveStocks.filter(s => Math.abs(s.changePercent) > 1).length} showing >1% movement</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Market Analysis Exercise',
              content: `
                <h3>Real-World Defense Stock Analysis</h3>
                <p>Using current market data, analyze this scenario:</p>
                <div class="bg-blue-50 p-4 rounded-lg">
                  <p><strong>Top Defense Stock:</strong> ${defensiveStocks[0]?.symbol || "LMT"} - ${defensiveStocks[0]?.changePercent?.toFixed(2) || "0.00"}%</p>
                  <p><strong>Market Volatility:</strong> ${defensiveStocks.filter(s => Math.abs(s.changePercent) > 2).length} stocks showing >2% movement</p>
                </div>
              `,
              questions: [
                {
                  id: 's1',
                  type: 'multiple-choice',
                  question: 'What is the primary driver of defense contractor stock performance?',
                  options: ['Consumer demand', 'Government contracts', 'Trade agreements', 'Commercial markets'],
                  correctAnswer: 'Government contracts',
                  explanation: 'Defense contractors primarily rely on government contracts and military spending programs.',
                  points: 40
                }
              ]
            }
          ]
        },
        {
          id: 'risk-assessment',
          title: 'Conflict Risk Assessment',
          description: 'Master techniques for evaluating escalation risks and investment implications',
          icon: AlertTriangle,
          difficulty: 'intermediate',
          points: 175,
          steps: [
            {
              type: 'lesson',
              title: 'Risk Evaluation Framework',
              content: `
                <h3>Systematic Risk Assessment</h3>
                <p>Professional conflict analysis uses structured methodologies to evaluate risks:</p>
                <ul>
                  <li><strong>Escalation Indicators:</strong> Troop movements, diplomatic breaks, sanctions</li>
                  <li><strong>Economic Impact:</strong> Trade disruption, resource access, supply chains</li>
                  <li><strong>Regional Spillover:</strong> Alliance obligations, refugee flows, proxy involvement</li>
                  <li><strong>Timeline Analysis:</strong> Short-term volatility vs long-term structural shifts</li>
                </ul>
                <h4>Current Risk Landscape</h4>
                <p>Active high-risk regions: <strong>${new Set(activeConflicts.filter(c => c.severity === 'High').map(c => c.region)).size}</strong></p>
              `
            },
            {
              type: 'quiz',
              title: 'Risk Assessment Skills',
              questions: [
                {
                  id: 'r1',
                  type: 'multiple-choice',
                  question: 'What is the most reliable early indicator of conflict escalation?',
                  options: ['Media reports', 'Troop movements', 'Economic sanctions', 'Diplomatic protests'],
                  correctAnswer: 'Troop movements',
                  explanation: 'Military deployments and troop movements are concrete, observable actions that indicate serious escalation potential.',
                  points: 45
                }
              ]
            }
          ]
        },
        {
          id: 'procurement-cycles',
          title: 'Defense Procurement Analysis',
          description: 'Understand government contracting cycles and their market impact',
          icon: DollarSign,
          difficulty: 'advanced',
          points: 200,
          steps: [
            {
              type: 'lesson',
              title: 'Procurement Fundamentals',
              content: `
                <h3>Government Defense Contracting</h3>
                <p>Defense procurement follows predictable patterns that drive stock performance:</p>
                <ul>
                  <li><strong>Budget Cycles:</strong> Annual appropriations and multi-year programs</li>
                  <li><strong>Contract Types:</strong> Fixed-price, cost-plus, indefinite delivery</li>
                  <li><strong>Competitive Dynamics:</strong> Prime contractors vs subcontractors</li>
                  <li><strong>Program Lifecycle:</strong> R&D, production, sustainment phases</li>
                </ul>
                <h4>Market Impact Analysis</h4>
                <p>Defense stocks show correlation with contract announcements and budget approvals.</p>
              `
            }
          ]
        },
        {
          id: 'strategic-intelligence',
          title: 'Strategic Intelligence Integration',
          description: 'Combine multiple intelligence sources for comprehensive conflict analysis',
          icon: Brain,
          difficulty: 'advanced',
          points: 225,
          steps: [
            {
              type: 'lesson',
              title: 'Intelligence Synthesis',
              content: `
                <h3>Multi-Source Analysis</h3>
                <p>Professional intelligence analysis combines diverse information streams:</p>
                <ul>
                  <li><strong>Open Source:</strong> Media, academic research, government reports</li>
                  <li><strong>Economic Indicators:</strong> Trade flows, commodity prices, currency movements</li>
                  <li><strong>Satellite Intelligence:</strong> Military buildups, infrastructure changes</li>
                  <li><strong>Social Indicators:</strong> Public sentiment, protest activity, migration patterns</li>
                </ul>
                <h4>Integration Framework</h4>
                <p>Effective analysis requires systematic correlation of multiple data streams.</p>
              `
            }
          ]
        }
      ],
      health: [
        {
          id: 'health-analytics',
          title: 'Global Health Data Analysis',
          description: 'Master WHO health indicators and pharmaceutical market intelligence',
          icon: Activity,
          difficulty: 'beginner',

          points: 120,
          steps: [
            {
              type: 'lesson',
              title: 'WHO Health Indicators',
              content: `
                <h3>Understanding Global Health Metrics</h3>
                <p>WHO collects comprehensive health data across 195 countries, covering:</p>
                <ul>
                  <li><strong>Life Expectancy:</strong> Average lifespan by country and demographic</li>
                  <li><strong>Disease Burden:</strong> Mortality rates, morbidity patterns</li>
                  <li><strong>Healthcare Access:</strong> System capacity and coverage metrics</li>
                  <li><strong>Health Expenditure:</strong> Spending as percentage of GDP</li>
                </ul>
                <h4>Pharmaceutical Market Context</h4>
                <p>Current healthcare stocks tracked: <strong>${healthStocks.length}</strong> major companies</p>
                <p>Top performer: <strong>${healthStocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || "PFE"}</strong></p>
              `
            },
            {
              type: 'quiz',
              title: 'Health Data Mastery',
              questions: [
                {
                  id: 'h1',
                  type: 'multiple-choice',
                  question: 'Which organization provides the most comprehensive global health statistics?',
                  options: ['CDC', 'WHO', 'NIH', 'FDA'],
                  correctAnswer: 'WHO',
                  explanation: 'The World Health Organization (WHO) maintains the most comprehensive global health database covering 195 countries.',
                  points: 30
                },
                {
                  id: 'h2',
                  type: 'multiple-choice',
                  question: 'What does life expectancy primarily measure?',
                  options: ['Quality of life', 'Average lifespan', 'Healthcare costs', 'Disease rates'],
                  correctAnswer: 'Average lifespan',
                  explanation: 'Life expectancy measures the average number of years a person is expected to live based on current mortality rates.',
                  points: 30
                }
              ]
            }
          ]
        },
        {
          id: 'pharma-pipeline',
          title: 'Drug Development Pipeline',
          description: 'Navigate clinical trials, regulatory pathways, and biotech investments',
          icon: Brain,
          difficulty: 'advanced',

          points: 200,
          steps: [
            {
              type: 'lesson',
              title: 'Clinical Trial Phases',
              content: `
                <h3>Understanding Drug Development</h3>
                <p>The pharmaceutical development process involves multiple phases:</p>
                <ul>
                  <li><strong>Preclinical:</strong> Laboratory and animal testing</li>
                  <li><strong>Phase I:</strong> Safety testing in small human groups</li>
                  <li><strong>Phase II:</strong> Efficacy testing in larger groups</li>
                  <li><strong>Phase III:</strong> Large-scale comparative studies</li>
                  <li><strong>FDA Review:</strong> Regulatory approval process</li>
                </ul>
                <h4>Investment Implications</h4>
                <p>Success rates vary dramatically by phase, with only ~12% of drugs reaching market approval.</p>
              `
            },
            {
              type: 'scenario',
              title: 'Biotech Investment Analysis',
              content: `
                <h3>Pipeline Valuation Exercise</h3>
                <p>Analyze this biotech scenario:</p>
                <div class="bg-green-50 p-4 rounded-lg">
                  <p><strong>Company:</strong> ${healthStocks[0]?.symbol || "MRNA"}</p>
                  <p><strong>Performance:</strong> ${healthStocks[0]?.changePercent?.toFixed(2) || "2.4"}%</p>
                  <p><strong>Phase III Trial:</strong> Results expected Q2 2025</p>
                </div>
              `,
              questions: [
                {
                  id: 'p1',
                  type: 'multiple-choice',
                  question: 'What percentage of drugs typically succeed from Phase I to market approval?',
                  options: ['50%', '25%', '12%', '5%'],
                  correctAnswer: '12%',
                  explanation: 'Approximately 12% of drugs that enter Phase I clinical trials eventually receive FDA approval.',
                  points: 60
                }
              ]
            }
          ]
        },
        {
          id: 'regulatory-environment',
          title: 'Healthcare Regulatory Framework',
          description: 'Navigate FDA approval processes and compliance requirements',
          icon: Shield,
          difficulty: 'intermediate',
          points: 165,
          steps: [
            {
              type: 'lesson',
              title: 'Regulatory Pathways',
              content: `
                <h3>Healthcare Regulation Landscape</h3>
                <p>Understanding regulatory frameworks is crucial for healthcare investments:</p>
                <ul>
                  <li><strong>FDA Approval Process:</strong> Standard vs expedited pathways</li>
                  <li><strong>EMA Compliance:</strong> European regulatory requirements</li>
                  <li><strong>Patent Protection:</strong> Intellectual property considerations</li>
                  <li><strong>Generic Competition:</strong> Patent cliff analysis</li>
                </ul>
              `
            }
          ]
        },
        {
          id: 'market-access',
          title: 'Global Market Access Strategy',
          description: 'Analyze pricing strategies and market penetration across regions',
          icon: Target,
          difficulty: 'advanced',
          points: 190,
          steps: [
            {
              type: 'lesson',
              title: 'Market Access Fundamentals',
              content: `
                <h3>Global Healthcare Markets</h3>
                <p>Market access varies significantly across healthcare systems:</p>
                <ul>
                  <li><strong>Pricing Strategies:</strong> Value-based vs cost-plus models</li>
                  <li><strong>Reimbursement:</strong> Insurance coverage and government programs</li>
                  <li><strong>Market Size:</strong> Patient population and addressable markets</li>
                  <li><strong>Competitive Landscape:</strong> Existing treatments and emerging therapies</li>
                </ul>
              `
            }
          ]
        },
        {
          id: 'digital-health',
          title: 'Digital Health Innovation',
          description: 'Explore telemedicine, AI diagnostics, and health technology trends',
          icon: Brain,
          difficulty: 'intermediate',
          points: 155,
          steps: [
            {
              type: 'lesson',
              title: 'Digital Transformation',
              content: `
                <h3>Healthcare Technology Revolution</h3>
                <p>Digital health is transforming healthcare delivery and investment opportunities:</p>
                <ul>
                  <li><strong>Telemedicine:</strong> Remote patient care and monitoring</li>
                  <li><strong>AI Diagnostics:</strong> Machine learning in medical imaging</li>
                  <li><strong>Wearable Technology:</strong> Continuous health monitoring</li>
                  <li><strong>Electronic Health Records:</strong> Data integration and interoperability</li>
                </ul>
              `
            }
          ]
        }
      ],
      energy: [
        {
          id: 'energy-markets',
          title: 'Energy Market Fundamentals',
          description: 'Master commodity trading, price dynamics, and energy security analysis',
          icon: Zap,
          difficulty: 'beginner',
          estimatedTime: '16 min',
          points: 110,
          steps: [
            {
              type: 'lesson',
              title: 'Energy Commodity Basics',
              content: `
                <h3>Understanding Energy Markets</h3>
                <p>Energy markets encompass multiple commodities with distinct characteristics:</p>
                <ul>
                  <li><strong>Crude Oil:</strong> Global benchmark pricing, geopolitical sensitivity</li>
                  <li><strong>Natural Gas:</strong> Regional markets, seasonal demand patterns</li>
                  <li><strong>Coal:</strong> Power generation, environmental considerations</li>
                  <li><strong>Uranium:</strong> Nuclear fuel cycle, long-term contracts</li>
                </ul>
                <h4>Current Market Context</h4>
                <p>Energy stocks tracked: <strong>${energyStocks.length}</strong> major companies</p>
                <p>Sector leader: <strong>${energyStocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.symbol || "XOM"}</strong></p>
              `
            },
            {
              type: 'quiz',
              title: 'Energy Market Knowledge',
              questions: [
                {
                  id: 'e1',
                  type: 'multiple-choice',
                  question: 'Which energy commodity is most sensitive to geopolitical events?',
                  options: ['Natural gas', 'Crude oil', 'Coal', 'Uranium'],
                  correctAnswer: 'Crude oil',
                  explanation: 'Crude oil prices are highly sensitive to geopolitical events due to concentrated production in politically unstable regions.',
                  points: 35
                },
                {
                  id: 'e2',
                  type: 'multiple-choice',
                  question: 'What drives seasonal demand patterns in natural gas?',
                  options: ['Industrial production', 'Heating and cooling', 'Transportation', 'Agriculture'],
                  correctAnswer: 'Heating and cooling',
                  explanation: 'Natural gas demand peaks during winter heating season and summer cooling season in many regions.',
                  points: 35
                }
              ]
            }
          ]
        },
        {
          id: 'renewable-transition',
          title: 'Green Energy Transition',
          description: 'Analyze clean technology adoption, carbon markets, and sustainable investments',
          icon: Sparkles,
          difficulty: 'intermediate',

          points: 160,
          steps: [
            {
              type: 'lesson',
              title: 'Clean Energy Economics',
              content: `
                <h3>The Renewable Energy Revolution</h3>
                <p>The global energy transition involves multiple technology pathways:</p>
                <ul>
                  <li><strong>Solar Power:</strong> Photovoltaic and thermal technologies</li>
                  <li><strong>Wind Energy:</strong> Onshore and offshore installations</li>
                  <li><strong>Energy Storage:</strong> Battery systems and grid integration</li>
                  <li><strong>Hydrogen:</strong> Green hydrogen production and applications</li>
                </ul>
                <h4>Investment Landscape</h4>
                <p>Renewable energy now accounts for approximately 22% of global energy consumption.</p>
              `
            },
            {
              type: 'scenario',
              title: 'ESG Investment Analysis',
              content: `
                <h3>Sustainable Energy Portfolio</h3>
                <p>Evaluate this clean energy investment scenario:</p>
                <div class="bg-orange-50 p-4 rounded-lg">
                  <p><strong>Clean Energy Stock:</strong> ${energyStocks.find(s => s.symbol === 'NEE')?.symbol || "NEE"}</p>
                  <p><strong>Performance:</strong> ${energyStocks.find(s => s.symbol === 'NEE')?.changePercent?.toFixed(2) || "0.41"}%</p>
                  <p><strong>Focus:</strong> Renewable energy infrastructure</p>
                </div>
              `,
              questions: [
                {
                  id: 'r1',
                  type: 'multiple-choice',
                  question: 'What percentage of global energy consumption comes from renewables?',
                  options: ['15%', '22%', '30%', '40%'],
                  correctAnswer: '22%',
                  explanation: 'Renewable energy accounts for approximately 22% of global energy consumption as of 2024.',
                  points: 55
                }
              ]
            }
          ]
        }
      ]
    };

    return modules[learningSelectedSector] || modules.defense;
  };

  // Module navigation handlers
  const handleModuleStart = (moduleId: string) => {
    setActiveModule(moduleId);
    setCurrentStep(0);
    setModuleAnswers({});
    setModuleScore(0);
    setShowModuleResults(false);
  };

  const handleModuleAnswer = (questionId: string, answer: string) => {
    setModuleAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleStepNext = () => {
    const currentModule = getLearningModules().find(m => m.id === activeModule);
    if (currentModule && currentStep < currentModule.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Module completed
      handleModuleComplete();
    }
  };

  const handleModuleComplete = () => {
    const currentModule = getLearningModules().find(m => m.id === activeModule);
    if (currentModule) {
      // Calculate score
      let totalScore = 0;
      currentModule.steps.forEach(step => {
        if (step.questions) {
          step.questions.forEach(question => {
            if (moduleAnswers[question.id] === question.correctAnswer) {
              totalScore += question.points;
            }
          });
        }
      });
      setModuleScore(totalScore);
      setShowModuleResults(true);
      setCompletedModules(prev => [...prev, activeModule!]);
    }
  };

  const handleModuleClose = () => {
    setActiveModule(null);
    setCurrentStep(0);
    setModuleAnswers({});
    setModuleScore(0);
    setShowModuleResults(false);
  };

  const renderModuleContent = (step: LearningStep) => {
    if (step.type === 'lesson' && step.content) {
      return (
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
      );
    }

    if (step.type === 'quiz' || step.type === 'scenario') {
      return (
        <div className="space-y-6">
          {step.questions?.map((question, qIndex) => (
            <div key={question.id} className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-base mb-3">{question.question}</h4>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <button
                      key={oIndex}
                      onClick={() => handleModuleAnswer(question.id, option)}
                      className={cn(
                        "w-full p-3 text-left rounded-lg border transition-colors",
                        moduleAnswers[question.id] === option
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
                {moduleAnswers[question.id] && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                    <div className="flex items-center mt-2">
                      <Award className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-xs text-yellow-700 dark:text-yellow-300">
                        {moduleAnswers[question.id] === question.correctAnswer ? `+${question.points}` : '0'} points
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // Generate new quiz mutation
  const generateQuizMutation = useMutation({
    mutationFn: async (sector: string) => {
      const result = await fetch('/api/learning/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector, difficulty: 'medium' })
      });
      return result.json();
    },
    onSuccess: (data: Quiz) => {
      setCurrentQuiz(data);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsAnswerSubmitted(false);
      setQuizCompleted(false);
      setQuizStartTime(Date.now());
    }
  });

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/learning/leaderboard/${learningSelectedSector}`],
    enabled: isExpanded,
  });

  // Fetch user stats
  const { data: userStats } = useQuery<UserStats>({
    queryKey: [`/api/learning/user-stats/${learningSelectedSector}`],
    enabled: isExpanded,
  });

  // Auto-generate quiz when sector changes
  useEffect(() => {
    if (isExpanded) {
      generateQuizMutation.mutate(learningSelectedSector);
    }
  }, [learningSelectedSector, isExpanded]);

  // Submit quiz response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (response: QuizResponse) => {
      const result = await fetch('/api/learning/submit-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...response,
          sector: learningSelectedSector
        })
      });
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learning/user-stats"] });
    }
  });

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuiz) return;

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = Date.now() - quizStartTime;

    setIsAnswerSubmitted(true);
    setShowResult(true);

    // Store the answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    // Submit the response (simplified for now)
    submitResponseMutation.mutate({
      questionId: currentQuestion.id.toString(),
      selectedAnswer,
      isCorrect,
      timeSpent
    });
  };

  const handleNextQuestion = () => {
    if (!currentQuiz) return;

    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsAnswerSubmitted(false);
      setQuizStartTime(Date.now());
    } else {
      // Quiz completed
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    generateQuizMutation.mutate(learningSelectedSector);
  };

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const progress = currentQuiz ? ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100 : 0;

  const Icon = config.icon;

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500'
  };

  if (!isExpanded) {
    return (
      <Card className={cn("mb-6 cursor-pointer hover:shadow-md transition-shadow", config.borderColor)}>
        <CardHeader onClick={() => setIsExpanded(true)} className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("p-2 rounded-lg", config.bgColor)}>
                <Icon className={cn("h-5 w-5", config.color)} />
              </div>
              <div>
                <CardTitle className="text-lg">Learning Hub</CardTitle>
                <CardDescription>Test your knowledge across sectors</CardDescription>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  // If viewing a specific learning module
  if (activeModule) {
    const currentModuleData = getLearningModules().find(m => m.id === activeModule);
    if (!currentModuleData) return null;

    const currentStepData = currentModuleData.steps[currentStep];
    const isLastStep = currentStep === currentModuleData.steps.length - 1;
    const canProceed = currentStepData.type === 'lesson' || 
      (currentStepData.questions && currentStepData.questions.every(q => moduleAnswers[q.id]));

    if (showModuleResults) {
      const maxPoints = currentModuleData.steps.reduce((total, step) => {
        return total + (step.questions?.reduce((stepTotal, q) => stepTotal + q.points, 0) || 0);
      }, 0);
      const percentage = Math.round((moduleScore / maxPoints) * 100);

      return (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <CardTitle>Module Complete!</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={handleModuleClose}>
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <Crown className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{moduleScore} / {maxPoints} Points</h3>
                <p className="text-muted-foreground">Performance: {percentage}%</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted/50 rounded-lg">
                <Medal className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">{currentModuleData.title}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <p className="font-medium">{currentModuleData.difficulty.charAt(0).toUpperCase() + currentModuleData.difficulty.slice(1)}</p>
                <p className="text-sm text-muted-foreground">Difficulty</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleModuleClose} className="flex-1">
                Return to Hub
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const modules = getLearningModules();
                  const currentIndex = modules.findIndex(m => m.id === activeModule);
                  const nextModule = modules[currentIndex + 1];
                  if (nextModule) {
                    handleModuleStart(nextModule.id);
                  }
                }}
                className="flex-1"
                disabled={!getLearningModules().find((m, i) => i > getLearningModules().findIndex(mod => mod.id === activeModule))}
              >
                Next Module
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <currentModuleData.icon className="h-5 w-5 text-primary" />
              <CardTitle>{currentModuleData.title}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleModuleClose}>
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>{currentModuleData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {currentModuleData.steps.length}</span>
              <span>{currentStepData.title}</span>
            </div>
            <Progress value={((currentStep + 1) / currentModuleData.steps.length) * 100} />
          </div>

          {/* Step content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {currentStepData.type === 'lesson' && <BookOpen className="h-5 w-5" />}
              {currentStepData.type === 'quiz' && <Brain className="h-5 w-5" />}
              {currentStepData.type === 'scenario' && <Users className="h-5 w-5" />}
              {currentStepData.title}
            </h3>
            {renderModuleContent(currentStepData)}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={isLastStep ? handleModuleComplete : handleStepNext}
              disabled={!canProceed}
            >
              {isLastStep ? 'Complete Module' : 'Next Step'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("mb-6", config.borderColor)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <CardTitle className="text-lg">Learning Hub</CardTitle>
              <CardDescription>Interactive step-by-step learning across sectors</CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sector Selection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">Sector:</span>
            <Select value={learningSelectedSector} onValueChange={setLearningSelectedSector}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="defense">ConflictWatch</SelectItem>
                <SelectItem value="health">PharmaWatch</SelectItem>
                <SelectItem value="energy">EnergyWatch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary" className={config.color}>
            {config.title}
          </Badge>
        </div>

        <Separator />

        {/* Quiz Section */}
        {generateQuizMutation.isPending && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Generating new quiz...</div>
          </div>
        )}

        {currentQuiz && !quizCompleted && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
                <span className={`px-2 py-1 rounded text-xs text-white ${difficultyColors[currentQuiz.difficulty]}`}>
                  {currentQuiz.difficulty}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question */}
            {currentQuestion && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-base leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {currentQuestion.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswerSubmitted}
                      className={cn(
                        "w-full p-3 text-left rounded-lg border transition-colors",
                        selectedAnswer === index
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/50",
                        isAnswerSubmitted && index === currentQuestion.correctAnswer && "border-green-500 bg-green-50 dark:bg-green-900/20",
                        isAnswerSubmitted && selectedAnswer === index && index !== currentQuestion.correctAnswer && "border-red-500 bg-red-50 dark:bg-red-900/20"
                      )}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  ))}
                </div>

                {/* Submit/Next Button */}
                {!isAnswerSubmitted ? (
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* Explanation */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Explanation
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        {currentQuestion.explanation}
                      </p>
                      <p className="text-blue-600 dark:text-blue-300 text-xs mt-2">
                        Source: {currentQuestion.source}
                      </p>
                    </div>

                    <Button onClick={handleNextQuestion} className="w-full">
                      {currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quiz Completed */}
        {quizCompleted && currentQuiz && (
          <div className="text-center space-y-4 py-8">
            <div className="space-y-2">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto" />
              <h3 className="text-xl font-semibold">Quiz Completed!</h3>
              <p className="text-muted-foreground">
                You scored {answers.filter((answer, index) => answer === currentQuiz.questions[index].correctAnswer).length} out of {currentQuiz.questions.length}
              </p>
            </div>
            <Button onClick={handleRestartQuiz} className="w-full max-w-xs">
              Take New Quiz
            </Button>
          </div>
        )}

        <Separator />

        {/* Interactive Learning Modules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <config.icon className="h-5 w-5 mr-2" />
              Interactive Learning Modules
            </h3>
            <Badge variant="secondary" className="text-xs">
              Step-by-Step Learning
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getLearningModules().map((module) => {
              const ModuleIcon = module.icon;
              const isCompleted = completedModules.includes(module.id);
              const difficultyColor = {
                beginner: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              };

              return (
                <Card 
                  key={module.id} 
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:shadow-lg border-2",
                    isCompleted ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10" : "border-border hover:border-primary/20"
                  )}
                  onClick={() => handleModuleStart(module.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn("p-2 rounded-lg", config.bgColor)}>
                          <ModuleIcon className={cn("h-5 w-5", config.color)} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-base mb-1 flex items-center gap-2">
                            {module.title}
                            {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <Badge className={cn("text-xs", difficultyColor[module.difficulty])}>
                          {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                        </Badge>

                        <div className="flex items-center text-muted-foreground">
                          <Award className="h-3 w-3 mr-1" />
                          {module.points} pts
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={isCompleted ? "secondary" : "default"}
                        className="h-7 px-3 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModuleStart(module.id);
                        }}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Review
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{module.steps.length} steps</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            isCompleted ? "bg-green-500" : "bg-primary/30"
                          )}
                          style={{ width: isCompleted ? '100%' : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Study Resources Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Study Resources
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium mb-2">Interactive Quizzes</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Test knowledge with AI-generated questions based on current market data
              </p>
              <Badge variant="secondary" className="text-xs">
                3 Questions per Session
              </Badge>
            </Card>

            <Card className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h4 className="font-medium mb-2">Performance Tracking</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Monitor progress across sectors with detailed analytics and streaks
              </p>
              <Badge variant="secondary" className="text-xs">
                Cross-Sector Stats
              </Badge>
            </Card>

            <Card className="p-4 text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium mb-2">Real-Time Updates</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Content updated with latest market developments and news
              </p>
              <Badge variant="secondary" className="text-xs">
                Live Data Integration
              </Badge>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Stats and Leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Stats */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center">
              <Timer className="h-4 w-4 mr-2" />
              Your Stats
            </h3>
            {userStats ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Score:</span>
                  <span className="font-medium">{userStats.totalScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Streak:</span>
                  <span className="font-medium">{userStats.streak}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-medium">
                    {userStats.totalQuestions > 0 
                      ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No stats available yet</p>
            )}
          </div>

          {/* Leaderboard */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center">
              <Crown className="h-4 w-4 mr-2" />
              Leaderboard
            </h3>
            {leaderboardLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground w-4">#{entry.rank}</span>
                      <span>{entry.username}</span>
                    </div>
                    <span className="font-medium">{entry.totalScore}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No leaderboard data yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}