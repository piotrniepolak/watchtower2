import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Brain, Trophy, Timer, Target, Sparkles, Crown, Medal, Play, CheckCircle, Lock, Star, Award, BookOpen, Users, Zap, Shield, Activity, AlertTriangle, DollarSign, Globe, TrendingUp, Leaf, Smartphone, Dna } from 'lucide-react';
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
          points: 500,
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
              type: 'lesson',
              title: 'Geographic Intelligence',
              content: `
                <h3>Strategic Geography Assessment</h3>
                <p>Geographic positioning determines conflict dynamics and strategic importance:</p>
                <ul>
                  <li><strong>Chokepoints:</strong> Straits, canals, mountain passes that control movement</li>
                  <li><strong>Resource Distribution:</strong> Oil, gas, minerals, water, arable land</li>
                  <li><strong>Border Dynamics:</strong> Natural barriers, artificial boundaries, disputed territories</li>
                  <li><strong>Climate Factors:</strong> Weather patterns, natural disasters, environmental stress</li>
                </ul>
                <h4>Modern Implications</h4>
                <p>Geographic advantages translate directly to economic and military power in contemporary conflicts.</p>
              `
            },
            {
              type: 'quiz',
              title: 'Geographic Intelligence Quiz',
              questions: [
                {
                  id: 'q1',
                  type: 'multiple-choice',
                  question: 'What are strategic chokepoints?',
                  options: ['Trade agreements', 'Geographic bottlenecks controlling movement', 'Military alliances', 'Economic sanctions'],
                  correctAnswer: 'Geographic bottlenecks controlling movement',
                  explanation: 'Strategic chokepoints are narrow geographic passages that control the movement of ships, goods, or military forces.',
                  points: 50
                },
                {
                  id: 'q2',
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
                  points: 50
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Political Dynamics Analysis',
              content: `
                <h3>Government Stability Assessment</h3>
                <p>Political structures directly impact conflict probability and duration:</p>
                <ul>
                  <li><strong>Regime Types:</strong> Democratic, authoritarian, hybrid systems</li>
                  <li><strong>Leadership Stability:</strong> Electoral cycles, succession planning, coups</li>
                  <li><strong>Institutional Strength:</strong> Military, judiciary, bureaucracy effectiveness</li>
                  <li><strong>Civil Society:</strong> Media freedom, protest movements, opposition groups</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Stability Assessment Exercise',
              content: `
                <h3>Real-World Analysis</h3>
                <p>Analyze political stability factors in current conflict zones:</p>
                <div class="bg-blue-50 p-4 rounded-lg">
                  <p><strong>Active Regions:</strong> ${new Set(activeConflicts.map(c => c.region)).size} major areas</p>
                  <p><strong>Conflict Types:</strong> Territorial, ethnic, resource-based disputes</p>
                </div>
              `,
              questions: [
                {
                  id: 's1',
                  type: 'multiple-choice',
                  question: 'Which factor is most predictive of conflict escalation?',
                  options: ['Economic recession', 'Leadership transitions', 'Natural disasters', 'All of the above'],
                  correctAnswer: 'All of the above',
                  explanation: 'Economic stress, leadership instability, and natural disasters all increase conflict probability.',
                  points: 75
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Economic Intelligence',
              content: `
                <h3>Economic Warfare and Dependencies</h3>
                <p>Economic factors often drive and sustain modern conflicts:</p>
                <ul>
                  <li><strong>Resource Wars:</strong> Competition for oil, gas, minerals, water</li>
                  <li><strong>Trade Dependencies:</strong> Supply chain vulnerabilities, embargo effects</li>
                  <li><strong>Financial Warfare:</strong> Sanctions, asset freezes, banking restrictions</li>
                  <li><strong>Currency Conflicts:</strong> Exchange rate manipulation, reserve diversification</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Economic Intelligence Assessment',
              questions: [
                {
                  id: 'e1',
                  type: 'multiple-choice',
                  question: 'What is the primary goal of economic sanctions?',
                  options: ['Military deterrence', 'Behavior modification', 'Resource acquisition', 'Alliance building'],
                  correctAnswer: 'Behavior modification',
                  explanation: 'Economic sanctions aim to change behavior by imposing economic costs on target countries.',
                  points: 60
                },
                {
                  id: 'e2',
                  type: 'multiple-choice',
                  question: 'Which economic factor most commonly triggers resource conflicts?',
                  options: ['Inflation', 'Unemployment', 'Resource scarcity', 'Currency devaluation'],
                  correctAnswer: 'Resource scarcity',
                  explanation: 'Scarcity of critical resources like water, oil, or minerals frequently leads to territorial and economic conflicts.',
                  points: 60
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Historical Pattern Recognition',
              content: `
                <h3>Learning from Past Conflicts</h3>
                <p>Historical analysis reveals recurring patterns in conflict development:</p>
                <ul>
                  <li><strong>Conflict Cycles:</strong> Escalation, plateau, de-escalation phases</li>
                  <li><strong>Intervention Patterns:</strong> When and how external powers intervene</li>
                  <li><strong>Resolution Mechanisms:</strong> Negotiation, mediation, enforcement</li>
                  <li><strong>Post-Conflict Stability:</strong> Reconstruction, reconciliation, prevention</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Final Assessment',
              questions: [
                {
                  id: 'f1',
                  type: 'multiple-choice',
                  question: 'Which phase typically lasts longest in modern conflicts?',
                  options: ['Initial escalation', 'Active fighting', 'Stalemate plateau', 'Resolution'],
                  correctAnswer: 'Stalemate plateau',
                  explanation: 'Most modern conflicts spend the majority of their duration in prolonged stalemate phases.',
                  points: 75
                },
                {
                  id: 'f2',
                  type: 'multiple-choice',
                  question: 'What is the most effective conflict prevention strategy?',
                  options: ['Military deterrence', 'Economic development', 'Diplomatic engagement', 'All combined'],
                  correctAnswer: 'All combined',
                  explanation: 'Effective conflict prevention requires coordinated military, economic, and diplomatic approaches.',
                  points: 75
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
          points: 450,
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
              type: 'lesson',
              title: 'Budget Cycle Analysis',
              content: `
                <h3>Government Spending Patterns</h3>
                <p>Defense budgets follow predictable cycles:</p>
                <ul>
                  <li><strong>Fiscal Year Timing:</strong> October to September cycle</li>
                  <li><strong>Appropriations Process:</strong> Congressional budget approval</li>
                  <li><strong>Continuing Resolutions:</strong> Temporary funding measures</li>
                  <li><strong>Supplemental Funding:</strong> Emergency military operations</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Budget Analysis Quiz',
              questions: [
                {
                  id: 'b1',
                  type: 'multiple-choice',
                  question: 'When does the US government fiscal year begin?',
                  options: ['January 1', 'April 1', 'July 1', 'October 1'],
                  correctAnswer: 'October 1',
                  explanation: 'The US federal fiscal year runs from October 1 to September 30.',
                  points: 60
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Contract Type Analysis',
              content: `
                <h3>Government Contract Structures</h3>
                <p>Different contract types affect risk and profitability:</p>
                <ul>
                  <li><strong>Fixed-Price:</strong> Contractor bears cost risk</li>
                  <li><strong>Cost-Plus:</strong> Government reimburses costs</li>
                  <li><strong>Time & Materials:</strong> Hourly rate structures</li>
                  <li><strong>Indefinite Delivery:</strong> Framework contracts</li>
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
                  points: 70
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Performance Metrics',
              content: `
                <h3>Key Defense Industry KPIs</h3>
                <p>Critical metrics for evaluating defense contractors:</p>
                <ul>
                  <li><strong>Book-to-Bill Ratio:</strong> New orders vs revenue</li>
                  <li><strong>Backlog:</strong> Contracted future revenue</li>
                  <li><strong>Operating Margins:</strong> Profitability measures</li>
                  <li><strong>Cash Flow:</strong> Working capital management</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Performance Assessment',
              questions: [
                {
                  id: 'p1',
                  type: 'multiple-choice',
                  question: 'What does a book-to-bill ratio above 1.0 indicate?',
                  options: ['Declining orders', 'Growing business', 'Stable revenue', 'Cash flow problems'],
                  correctAnswer: 'Growing business',
                  explanation: 'A book-to-bill ratio above 1.0 means new orders exceed current revenue, indicating growth.',
                  points: 80
                },
                {
                  id: 'p2',
                  type: 'multiple-choice',
                  question: 'Which metric best indicates long-term revenue visibility?',
                  options: ['Operating margin', 'Book-to-bill ratio', 'Contract backlog', 'Cash flow'],
                  correctAnswer: 'Contract backlog',
                  explanation: 'Contract backlog represents already-awarded future revenue, providing visibility into future performance.',
                  points: 80
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
          points: 425,
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
              type: 'lesson',
              title: 'Escalation Indicators',
              content: `
                <h3>Warning Signs and Triggers</h3>
                <p>Key indicators that predict conflict escalation:</p>
                <ul>
                  <li><strong>Military Indicators:</strong> Troop buildups, equipment movements, exercises</li>
                  <li><strong>Diplomatic Indicators:</strong> Ambassador recalls, summit cancellations, ultimatums</li>
                  <li><strong>Economic Indicators:</strong> Trade restrictions, asset freezes, currency controls</li>
                  <li><strong>Social Indicators:</strong> Propaganda increases, protest movements, refugee flows</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Escalation Assessment',
              questions: [
                {
                  id: 'e1',
                  type: 'multiple-choice',
                  question: 'What is the most reliable early indicator of conflict escalation?',
                  options: ['Media reports', 'Troop movements', 'Economic sanctions', 'Diplomatic protests'],
                  correctAnswer: 'Troop movements',
                  explanation: 'Military deployments and troop movements are concrete, observable actions that indicate serious escalation potential.',
                  points: 65
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Economic Impact Analysis',
              content: `
                <h3>Financial Consequences Assessment</h3>
                <p>Conflicts create economic disruptions with measurable impacts:</p>
                <ul>
                  <li><strong>Direct Costs:</strong> Military spending, reconstruction, humanitarian aid</li>
                  <li><strong>Trade Disruption:</strong> Supply chain breaks, shipping route closures</li>
                  <li><strong>Resource Impacts:</strong> Energy price spikes, commodity shortages</li>
                  <li><strong>Market Volatility:</strong> Risk premiums, capital flight, currency fluctuations</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Regional Spillover Analysis',
              content: `
                <h3>Conflict Contagion Assessment</h3>
                <p>Evaluate spillover risks using current data:</p>
                <div class="bg-orange-50 p-4 rounded-lg">
                  <p><strong>Active Conflicts:</strong> ${activeConflicts.length} ongoing situations</p>
                  <p><strong>Regional Clusters:</strong> ${new Set(activeConflicts.map(c => c.region)).size} affected regions</p>
                  <p><strong>High-Risk Areas:</strong> Potential for expansion</p>
                </div>
              `,
              questions: [
                {
                  id: 'r1',
                  type: 'multiple-choice',
                  question: 'Which factor most accelerates regional conflict spillover?',
                  options: ['Media coverage', 'Alliance obligations', 'Economic ties', 'Geographic proximity'],
                  correctAnswer: 'Alliance obligations',
                  explanation: 'Military alliances create legal obligations that can rapidly expand local conflicts into regional wars.',
                  points: 75
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Investment Risk Modeling',
              content: `
                <h3>Portfolio Risk Assessment</h3>
                <p>Translating conflict risk into investment decisions:</p>
                <ul>
                  <li><strong>Sector Exposure:</strong> Defense, energy, commodities sensitivity</li>
                  <li><strong>Geographic Risk:</strong> Regional market exposures</li>
                  <li><strong>Timeline Factors:</strong> Short vs long-term impact assessment</li>
                  <li><strong>Hedge Strategies:</strong> Risk mitigation through diversification</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Investment Risk Assessment',
              questions: [
                {
                  id: 'i1',
                  type: 'multiple-choice',
                  question: 'Which investment sector typically benefits from geopolitical tensions?',
                  options: ['Tourism', 'Defense', 'Retail', 'Entertainment'],
                  correctAnswer: 'Defense',
                  explanation: 'Defense contractors typically see increased demand and higher valuations during periods of geopolitical tension.',
                  points: 85
                },
                {
                  id: 'i2',
                  type: 'multiple-choice',
                  question: 'What is the primary risk to energy investments during conflicts?',
                  options: ['Technology changes', 'Supply disruption', 'Regulatory changes', 'Currency fluctuation'],
                  correctAnswer: 'Supply disruption',
                  explanation: 'Conflicts often disrupt energy supply chains and infrastructure, creating price volatility and supply shortages.',
                  points: 85
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
          points: 475,
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
            },
            {
              type: 'lesson',
              title: 'Budget Authorization Process',
              content: `
                <h3>Congressional Appropriations Cycle</h3>
                <p>Understanding the federal budget process:</p>
                <ul>
                  <li><strong>Presidential Budget:</strong> February submission to Congress</li>
                  <li><strong>Authorization Bills:</strong> Setting spending limits and priorities</li>
                  <li><strong>Appropriations Bills:</strong> Actual funding allocation</li>
                  <li><strong>Continuing Resolutions:</strong> Temporary funding extensions</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Budget Process Assessment',
              questions: [
                {
                  id: 'bp1',
                  type: 'multiple-choice',
                  question: 'When does the President typically submit the federal budget to Congress?',
                  options: ['January', 'February', 'March', 'April'],
                  correctAnswer: 'February',
                  explanation: 'The President submits the federal budget request to Congress in early February each year.',
                  points: 70
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Contract Award Cycles',
              content: `
                <h3>Procurement Timeline Patterns</h3>
                <p>Government contracting follows predictable timing:</p>
                <ul>
                  <li><strong>RFP Release:</strong> Request for proposals timing</li>
                  <li><strong>Bid Submission:</strong> Contractor response periods</li>
                  <li><strong>Evaluation Phase:</strong> Government review and selection</li>
                  <li><strong>Award Announcement:</strong> Contract notification and protests</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Procurement Impact Analysis',
              content: `
                <h3>Contract Award Market Effects</h3>
                <p>Analyze how procurement announcements affect stock prices:</p>
                <div class="bg-green-50 p-4 rounded-lg">
                  <p><strong>Defense Companies:</strong> ${defensiveStocks.length} major contractors</p>
                  <p><strong>Contract Sensitivity:</strong> Stock price reactions to awards</p>
                  <p><strong>Timing Patterns:</strong> Fiscal year-end award spikes</p>
                </div>
              `,
              questions: [
                {
                  id: 'pa1',
                  type: 'multiple-choice',
                  question: 'When do most defense contract awards typically occur?',
                  options: ['Beginning of fiscal year', 'Mid fiscal year', 'End of fiscal year', 'Randomly throughout year'],
                  correctAnswer: 'End of fiscal year',
                  explanation: 'Government agencies rush to obligate funds before fiscal year end, creating a spike in contract awards.',
                  points: 85
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Multi-Year Programs',
              content: `
                <h3>Long-Term Defense Programs</h3>
                <p>Major defense programs span multiple years:</p>
                <ul>
                  <li><strong>Program Structure:</strong> Research, development, procurement phases</li>
                  <li><strong>Milestone Reviews:</strong> Gate criteria for program continuation</li>
                  <li><strong>Funding Profiles:</strong> Annual appropriations for multi-year efforts</li>
                  <li><strong>Risk Factors:</strong> Program cancellation and restructuring risks</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Program Management Assessment',
              questions: [
                {
                  id: 'pm1',
                  type: 'multiple-choice',
                  question: 'What is the greatest risk to defense contractors in long-term programs?',
                  options: ['Technical challenges', 'Cost overruns', 'Program cancellation', 'Competition'],
                  correctAnswer: 'Program cancellation',
                  explanation: 'Program cancellation represents the greatest risk as it eliminates all future revenue from that contract.',
                  points: 95
                },
                {
                  id: 'pm2',
                  type: 'multiple-choice',
                  question: 'Which phase typically has the highest profit margins?',
                  options: ['Research', 'Development', 'Production', 'Sustainment'],
                  correctAnswer: 'Production',
                  explanation: 'Production phases typically offer higher margins due to economies of scale and reduced development risks.',
                  points: 95
                }
              ]
            }
          ]
        },
        {
          id: 'strategic-intelligence',
          title: 'Strategic Intelligence Integration',
          description: 'Combine multiple intelligence sources for comprehensive conflict analysis',
          icon: Brain,
          difficulty: 'advanced',
          points: 525,
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
            },
            {
              type: 'lesson',
              title: 'Open Source Intelligence',
              content: `
                <h3>OSINT Collection and Analysis</h3>
                <p>Publicly available information provides critical insights:</p>
                <ul>
                  <li><strong>Media Monitoring:</strong> News trends, bias analysis, source credibility</li>
                  <li><strong>Social Media:</strong> Public sentiment, disinformation campaigns</li>
                  <li><strong>Academic Research:</strong> Expert analysis, historical context</li>
                  <li><strong>Government Reports:</strong> Official statements, budget documents</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'OSINT Assessment',
              questions: [
                {
                  id: 'os1',
                  type: 'multiple-choice',
                  question: 'What is the primary advantage of open source intelligence?',
                  options: ['Always accurate', 'Publicly available', 'Government verified', 'Real-time updates'],
                  correctAnswer: 'Publicly available',
                  explanation: 'OSINT\'s main advantage is its accessibility - information available to all analysts without classification restrictions.',
                  points: 75
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Economic Intelligence',
              content: `
                <h3>Financial and Trade Analysis</h3>
                <p>Economic data reveals conflict patterns and impacts:</p>
                <ul>
                  <li><strong>Trade Flow Analysis:</strong> Import/export disruptions, sanctions effects</li>
                  <li><strong>Currency Movements:</strong> Exchange rate volatility, capital flight</li>
                  <li><strong>Commodity Prices:</strong> Resource scarcity, supply chain disruption</li>
                  <li><strong>Market Indicators:</strong> Risk premiums, sector rotations</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Intelligence Integration Exercise',
              content: `
                <h3>Multi-Source Correlation</h3>
                <p>Practice integrating diverse intelligence sources:</p>
                <div class="bg-purple-50 p-4 rounded-lg">
                  <p><strong>Active Monitoring:</strong> ${activeConflicts.length} conflict situations</p>
                  <p><strong>Data Sources:</strong> Economic, social, military indicators</p>
                  <p><strong>Analysis Goal:</strong> Comprehensive threat assessment</p>
                </div>
              `,
              questions: [
                {
                  id: 'ii1',
                  type: 'multiple-choice',
                  question: 'Which combination provides the most reliable conflict assessment?',
                  options: ['Military + Economic', 'Social + Political', 'Economic + Social', 'All sources combined'],
                  correctAnswer: 'All sources combined',
                  explanation: 'Comprehensive analysis requires correlation across all available intelligence sources for accuracy.',
                  points: 90
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Predictive Analytics',
              content: `
                <h3>Forecasting Conflict Developments</h3>
                <p>Using integrated intelligence for prediction:</p>
                <ul>
                  <li><strong>Pattern Recognition:</strong> Historical precedents and cycles</li>
                  <li><strong>Trend Analysis:</strong> Escalation and de-escalation indicators</li>
                  <li><strong>Scenario Planning:</strong> Multiple outcome probabilities</li>
                  <li><strong>Warning Systems:</strong> Early detection thresholds</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Predictive Analysis Assessment',
              questions: [
                {
                  id: 'pa1',
                  type: 'multiple-choice',
                  question: 'What is the most important factor in conflict prediction accuracy?',
                  options: ['Data quantity', 'Data quality', 'Analysis speed', 'Source diversity'],
                  correctAnswer: 'Data quality',
                  explanation: 'High-quality, verified data is more valuable than large quantities of unreliable information.',
                  points: 100
                },
                {
                  id: 'pa2',
                  type: 'multiple-choice',
                  question: 'Which analytical approach is most effective for long-term forecasting?',
                  options: ['Trend extrapolation', 'Historical patterns', 'Scenario planning', 'Expert opinion'],
                  correctAnswer: 'Scenario planning',
                  explanation: 'Scenario planning accounts for multiple variables and uncertainties, making it most effective for long-term forecasting.',
                  points: 100
                }
              ]
            }
          ]
        },
        {
          id: 'cyber-warfare',
          title: 'Cyber Warfare & Digital Security',
          description: 'Analyze cyber threats, digital warfare tactics, and cybersecurity investments',
          icon: Shield,
          difficulty: 'advanced',
          points: 550,
          steps: [
            {
              type: 'lesson',
              title: 'Cyber Threat Landscape',
              content: `
                <h3>Modern Digital Warfare</h3>
                <p>Cyber warfare has become a primary conflict domain:</p>
                <ul>
                  <li><strong>State Actors:</strong> Nation-state cyber operations and capabilities</li>
                  <li><strong>Critical Infrastructure:</strong> Power grids, communications, financial systems</li>
                  <li><strong>Information Operations:</strong> Disinformation, election interference</li>
                  <li><strong>Economic Warfare:</strong> Intellectual property theft, market manipulation</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Cybersecurity Economics',
              content: `
                <h3>Market Impact of Cyber Threats</h3>
                <p>Cyber incidents create significant economic consequences:</p>
                <ul>
                  <li><strong>Direct Costs:</strong> System recovery, data restoration, legal fees</li>
                  <li><strong>Business Disruption:</strong> Operational shutdowns, customer loss</li>
                  <li><strong>Market Impacts:</strong> Stock price volatility, sector effects</li>
                  <li><strong>Insurance Claims:</strong> Cyber insurance market growth</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Cyber Economics Assessment',
              questions: [
                {
                  id: 'ce1',
                  type: 'multiple-choice',
                  question: 'Which sector is most vulnerable to cyber warfare economic impact?',
                  options: ['Manufacturing', 'Financial services', 'Agriculture', 'Entertainment'],
                  correctAnswer: 'Financial services',
                  explanation: 'Financial services are highly dependent on digital systems and represent high-value targets for cyber attacks.',
                  points: 80
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Attribution and Response',
              content: `
                <h3>Cyber Attack Attribution</h3>
                <p>Identifying cyber attack sources and planning responses:</p>
                <ul>
                  <li><strong>Technical Attribution:</strong> Malware analysis, infrastructure tracking</li>
                  <li><strong>Behavioral Attribution:</strong> Tactics, techniques, procedures (TTPs)</li>
                  <li><strong>Strategic Attribution:</strong> Motivation, capabilities, opportunities</li>
                  <li><strong>Response Options:</strong> Defensive, offensive, diplomatic measures</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Cyber Incident Analysis',
              content: `
                <h3>Critical Infrastructure Attack</h3>
                <p>Analyze a hypothetical cyber attack scenario:</p>
                <div class="bg-red-50 p-4 rounded-lg">
                  <p><strong>Target:</strong> Energy grid control systems</p>
                  <p><strong>Method:</strong> Supply chain compromise</p>
                  <p><strong>Impact:</strong> Regional power outages</p>
                  <p><strong>Attribution:</strong> Advanced persistent threat group</p>
                </div>
              `,
              questions: [
                {
                  id: 'ci1',
                  type: 'multiple-choice',
                  question: 'What is the primary economic impact of infrastructure cyber attacks?',
                  options: ['Data theft', 'Service disruption', 'Reputation damage', 'Legal liability'],
                  correctAnswer: 'Service disruption',
                  explanation: 'Infrastructure attacks primarily cause economic damage through service disruption affecting multiple sectors.',
                  points: 90
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Cybersecurity Investment Trends',
              content: `
                <h3>Security Technology Markets</h3>
                <p>Growing cybersecurity investment opportunities:</p>
                <ul>
                  <li><strong>Zero Trust Architecture:</strong> Network security model investments</li>
                  <li><strong>AI Security:</strong> Machine learning for threat detection</li>
                  <li><strong>Cloud Security:</strong> Protecting distributed infrastructure</li>
                  <li><strong>IoT Security:</strong> Internet of Things device protection</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Cybersecurity Investment Assessment',
              questions: [
                {
                  id: 'csi1',
                  type: 'multiple-choice',
                  question: 'Which cybersecurity technology shows the highest growth potential?',
                  options: ['Antivirus software', 'AI-powered security', 'Hardware firewalls', 'Password managers'],
                  correctAnswer: 'AI-powered security',
                  explanation: 'AI-powered security solutions show the highest growth potential due to their ability to detect sophisticated threats.',
                  points: 100
                },
                {
                  id: 'csi2',
                  type: 'multiple-choice',
                  question: 'What drives the largest cybersecurity spending increases?',
                  options: ['Compliance requirements', 'High-profile breaches', 'Technology upgrades', 'Staff training'],
                  correctAnswer: 'High-profile breaches',
                  explanation: 'Major security breaches typically trigger significant increases in cybersecurity spending across industries.',
                  points: 100
                }
              ]
            }
          ]
        },
        {
          id: 'global-alliances',
          title: 'Military Alliances & Defense Cooperation',
          description: 'Understand alliance structures, burden sharing, and cooperative defense programs',
          icon: Users,
          difficulty: 'advanced',
          points: 600,
          steps: [
            {
              type: 'lesson',
              title: 'Alliance Architecture',
              content: `
                <h3>Global Defense Alliance Systems</h3>
                <p>Understanding modern military alliance structures:</p>
                <ul>
                  <li><strong>NATO:</strong> North Atlantic Treaty Organization structure and Article 5</li>
                  <li><strong>Bilateral Agreements:</strong> US defense partnerships worldwide</li>
                  <li><strong>Regional Alliances:</strong> AUKUS, QUAD, Five Eyes intelligence sharing</li>
                  <li><strong>Defense Industrial Cooperation:</strong> Joint development programs</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Burden Sharing Analysis',
              content: `
                <h3>Defense Spending and Contributions</h3>
                <p>Alliance burden sharing creates market opportunities:</p>
                <ul>
                  <li><strong>NATO 2% Target:</strong> Defense spending as percentage of GDP</li>
                  <li><strong>Capability Gaps:</strong> Identifying partner nation needs</li>
                  <li><strong>Interoperability:</strong> Standardization requirements and opportunities</li>
                  <li><strong>Technology Transfer:</strong> Foreign military sales and licensing</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Alliance Economics Assessment',
              questions: [
                {
                  id: 'ae1',
                  type: 'multiple-choice',
                  question: 'What is NATO\'s defense spending target for member nations?',
                  options: ['1% of GDP', '2% of GDP', '3% of GDP', '4% of GDP'],
                  correctAnswer: '2% of GDP',
                  explanation: 'NATO members committed to spending at least 2% of GDP on defense by 2024.',
                  points: 85
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Joint Development Programs',
              content: `
                <h3>Multinational Defense Projects</h3>
                <p>Collaborative defense development creates market opportunities:</p>
                <ul>
                  <li><strong>Cost Sharing:</strong> Reducing development costs through partnership</li>
                  <li><strong>Technology Access:</strong> Sharing advanced capabilities</li>
                  <li><strong>Market Access:</strong> Partner nation procurement preferences</li>
                  <li><strong>Risk Mitigation:</strong> Distributing program risks across partners</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Alliance Procurement Analysis',
              content: `
                <h3>NATO Capability Development</h3>
                <p>Analyze alliance procurement opportunities:</p>
                <div class="bg-blue-50 p-4 rounded-lg">
                  <p><strong>Capability Gap:</strong> Air defense systems</p>
                  <p><strong>Partners:</strong> Multiple NATO nations</p>
                  <p><strong>Market Size:</strong> Multi-billion dollar opportunity</p>
                  <p><strong>Competition:</strong> US and European contractors</p>
                </div>
              `,
              questions: [
                {
                  id: 'ap1',
                  type: 'multiple-choice',
                  question: 'What is the primary advantage of multinational defense programs?',
                  options: ['Lower costs', 'Faster development', 'Better technology', 'Guaranteed sales'],
                  correctAnswer: 'Lower costs',
                  explanation: 'Cost sharing across multiple nations is the primary advantage of multinational defense programs.',
                  points: 95
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Foreign Military Sales',
              content: `
                <h3>International Defense Trade</h3>
                <p>Understanding government-to-government defense sales:</p>
                <ul>
                  <li><strong>FMS Process:</strong> US Foreign Military Sales program structure</li>
                  <li><strong>Partner Capacity:</strong> Building allied military capabilities</li>
                  <li><strong>Technology Security:</strong> Export controls and classification levels</li>
                  <li><strong>Market Access:</strong> Competitive advantages in partner nations</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Strategic Competition Impacts',
              content: `
                <h3>Great Power Competition Effects</h3>
                <p>How strategic competition drives alliance cooperation:</p>
                <ul>
                  <li><strong>Threat Perception:</strong> Shared challenges driving cooperation</li>
                  <li><strong>Capability Prioritization:</strong> Focus on high-end warfare systems</li>
                  <li><strong>Industrial Base:</strong> Strengthening defense manufacturing capacity</li>
                  <li><strong>Innovation Investment:</strong> Joint research and development priorities</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Strategic Competition Assessment',
              questions: [
                {
                  id: 'sc1',
                  type: 'multiple-choice',
                  question: 'Which factor most drives increased alliance defense cooperation?',
                  options: ['Economic benefits', 'Shared threats', 'Political agreements', 'Historical ties'],
                  correctAnswer: 'Shared threats',
                  explanation: 'Shared threat perceptions are the primary driver of increased defense cooperation among allies.',
                  points: 110
                },
                {
                  id: 'sc2',
                  type: 'multiple-choice',
                  question: 'What capability area receives highest alliance investment priority?',
                  options: ['Peacekeeping', 'Humanitarian aid', 'High-end warfare', 'Border security'],
                  correctAnswer: 'High-end warfare',
                  explanation: 'Strategic competition focuses alliance investment on high-end warfare capabilities against peer competitors.',
                  points: 110
                }
              ]
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
          points: 425,
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
              type: 'lesson',
              title: 'Health System Performance',
              content: `
                <h3>Healthcare System Effectiveness Metrics</h3>
                <p>WHO evaluates health systems using comprehensive indicators:</p>
                <ul>
                  <li><strong>Universal Health Coverage:</strong> Population access to essential services</li>
                  <li><strong>Financial Protection:</strong> Catastrophic health expenditure rates</li>
                  <li><strong>Health Equity:</strong> Disparities between population groups</li>
                  <li><strong>Quality of Care:</strong> Clinical effectiveness and patient safety</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'System Performance Assessment',
              questions: [
                {
                  id: 'sp1',
                  type: 'multiple-choice',
                  question: 'What is universal health coverage designed to achieve?',
                  options: ['Lower costs', 'Better technology', 'Population access to services', 'Faster treatment'],
                  correctAnswer: 'Population access to services',
                  explanation: 'Universal health coverage ensures all people have access to needed health services without financial hardship.',
                  points: 60
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Disease Surveillance Systems',
              content: `
                <h3>Global Disease Monitoring</h3>
                <p>WHO coordinates worldwide disease surveillance:</p>
                <ul>
                  <li><strong>Epidemic Intelligence:</strong> Early warning systems for outbreaks</li>
                  <li><strong>Laboratory Networks:</strong> Diagnostic capacity and quality assurance</li>
                  <li><strong>Data Integration:</strong> Multi-source health information systems</li>
                  <li><strong>Risk Assessment:</strong> Threat evaluation and response planning</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Health Data Analysis',
              content: `
                <h3>Real-World Health Intelligence</h3>
                <p>Analyze current pharmaceutical market performance:</p>
                <div class="bg-green-50 p-4 rounded-lg">
                  <p><strong>Healthcare Companies:</strong> ${healthStocks.length} major pharmaceutical firms</p>
                  <p><strong>Market Leaders:</strong> Companies driving innovation and growth</p>
                  <p><strong>Investment Trends:</strong> Capital flowing into health technology</p>
                </div>
              `,
              questions: [
                {
                  id: 'hd1',
                  type: 'multiple-choice',
                  question: 'Which organization provides the most comprehensive global health statistics?',
                  options: ['CDC', 'WHO', 'NIH', 'FDA'],
                  correctAnswer: 'WHO',
                  explanation: 'The World Health Organization (WHO) maintains the most comprehensive global health database covering 195 countries.',
                  points: 70
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Health Economics Fundamentals',
              content: `
                <h3>Economic Analysis in Healthcare</h3>
                <p>Understanding the economics of health systems:</p>
                <ul>
                  <li><strong>Cost-Effectiveness:</strong> Value for money in health interventions</li>
                  <li><strong>Budget Impact:</strong> Financial implications of health programs</li>
                  <li><strong>Resource Allocation:</strong> Optimizing limited healthcare resources</li>
                  <li><strong>Market Dynamics:</strong> Public-private partnerships in health</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Health Economics Assessment',
              questions: [
                {
                  id: 'he1',
                  type: 'multiple-choice',
                  question: 'What does cost-effectiveness analysis primarily measure?',
                  options: ['Total costs', 'Value for money', 'Patient satisfaction', 'Treatment speed'],
                  correctAnswer: 'Value for money',
                  explanation: 'Cost-effectiveness analysis measures the value for money of health interventions by comparing costs to health outcomes.',
                  points: 80
                },
                {
                  id: 'he2',
                  type: 'multiple-choice',
                  question: 'What drives healthcare investment decisions?',
                  options: ['Political pressure', 'Evidence-based outcomes', 'Historical precedent', 'Popular opinion'],
                  correctAnswer: 'Evidence-based outcomes',
                  explanation: 'Healthcare investment decisions should be driven by evidence-based outcomes demonstrating clinical and economic value.',
                  points: 80
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
          difficulty: 'intermediate',
          points: 475,
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
                  <li><strong>Phase II:</strong> Efficacy evaluation in targeted populations</li>
                  <li><strong>Phase III:</strong> Large-scale comparative effectiveness studies</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Regulatory Approval Process',
              content: `
                <h3>FDA and Global Regulatory Pathways</h3>
                <p>Drug approval requires comprehensive regulatory review:</p>
                <ul>
                  <li><strong>Investigational New Drug (IND):</strong> Permission to begin human testing</li>
                  <li><strong>New Drug Application (NDA):</strong> Comprehensive safety and efficacy data</li>
                  <li><strong>Breakthrough Therapy:</strong> Expedited review for significant advances</li>
                  <li><strong>Post-Market Surveillance:</strong> Ongoing safety monitoring</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Regulatory Process Assessment',
              questions: [
                {
                  id: 'rp1',
                  type: 'multiple-choice',
                  question: 'What is the primary purpose of Phase I clinical trials?',
                  options: ['Test effectiveness', 'Test safety', 'Compare to existing drugs', 'Determine pricing'],
                  correctAnswer: 'Test safety',
                  explanation: 'Phase I trials primarily test safety and determine appropriate dosing in small groups of volunteers.',
                  points: 70
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Biotech Investment Analysis',
              content: `
                <h3>Evaluating Pharmaceutical Investments</h3>
                <p>Key factors in biotech investment decisions:</p>
                <ul>
                  <li><strong>Pipeline Depth:</strong> Number and stage of development programs</li>
                  <li><strong>Market Size:</strong> Total addressable market for target indications</li>
                  <li><strong>Competitive Landscape:</strong> Existing treatments and development competition</li>
                  <li><strong>Regulatory Risk:</strong> Probability of approval and timeline uncertainty</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Pipeline Valuation Exercise',
              content: `
                <h3>Pharmaceutical Portfolio Analysis</h3>
                <p>Evaluate biotech investment opportunities:</p>
                <div class="bg-blue-50 p-4 rounded-lg">
                  <p><strong>Development Stage:</strong> Phase II oncology program</p>
                  <p><strong>Market Size:</strong> $10B total addressable market</p>
                  <p><strong>Competition:</strong> 3 existing approved therapies</p>
                  <p><strong>Timeline:</strong> 3-5 years to potential approval</p>
                </div>
              `,
              questions: [
                {
                  id: 'pv1',
                  type: 'multiple-choice',
                  question: 'What is the highest risk factor in biotech investments?',
                  options: ['Market competition', 'Regulatory approval', 'Manufacturing costs', 'Patent expiration'],
                  correctAnswer: 'Regulatory approval',
                  explanation: 'Regulatory approval represents the highest risk as failure can result in total loss of investment.',
                  points: 85
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Market Access and Pricing',
              content: `
                <h3>Commercial Strategy in Pharmaceuticals</h3>
                <p>Bringing approved drugs to market requires strategic planning:</p>
                <ul>
                  <li><strong>Health Technology Assessment:</strong> Value demonstration to payers</li>
                  <li><strong>Pricing Strategy:</strong> Value-based pricing and market access</li>
                  <li><strong>Real-World Evidence:</strong> Post-launch effectiveness data</li>
                  <li><strong>Global Launch:</strong> Sequential market entry strategies</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Market Access Assessment',
              questions: [
                {
                  id: 'ma1',
                  type: 'multiple-choice',
                  question: 'What primarily determines drug pricing in developed markets?',
                  options: ['Development costs', 'Value to patients', 'Competitor pricing', 'Manufacturing costs'],
                  correctAnswer: 'Value to patients',
                  explanation: 'Value-based pricing considers the clinical and economic value delivered to patients and healthcare systems.',
                  points: 95
                },
                {
                  id: 'ma2',
                  type: 'multiple-choice',
                  question: 'Which evidence type is most important for market access?',
                  options: ['Clinical trial data', 'Real-world evidence', 'Expert opinions', 'Historical comparisons'],
                  correctAnswer: 'Real-world evidence',
                  explanation: 'Real-world evidence demonstrates actual effectiveness and value in routine clinical practice.',
                  points: 95
                }
              ]
            }
          ]
        },
        {
          id: 'epidemic-intelligence',
          title: 'Epidemic Intelligence & Outbreak Response',
          description: 'Master disease surveillance, outbreak investigation, and public health response',
          icon: AlertTriangle,
          difficulty: 'advanced',
          points: 525,
          steps: [
            {
              type: 'lesson',
              title: 'Disease Surveillance Systems',
              content: `
                <h3>Global Health Security</h3>
                <p>Modern disease surveillance integrates multiple data sources:</p>
                <ul>
                  <li><strong>Sentinel Surveillance:</strong> Strategic monitoring sites for early detection</li>
                  <li><strong>Syndromic Surveillance:</strong> Pattern recognition before laboratory confirmation</li>
                  <li><strong>Laboratory Networks:</strong> Diagnostic capacity and pathogen characterization</li>
                  <li><strong>Digital Surveillance:</strong> Social media and web-based disease monitoring</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Outbreak Investigation Methodology',
              content: `
                <h3>Systematic Outbreak Response</h3>
                <p>Standardized approach to outbreak investigation:</p>
                <ul>
                  <li><strong>Case Definition:</strong> Clear criteria for confirmed, probable, and suspected cases</li>
                  <li><strong>Descriptive Epidemiology:</strong> Time, place, and person analysis</li>
                  <li><strong>Hypothesis Generation:</strong> Source and transmission mode identification</li>
                  <li><strong>Control Measures:</strong> Intervention strategies to limit spread</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Outbreak Investigation Assessment',
              questions: [
                {
                  id: 'oi1',
                  type: 'multiple-choice',
                  question: 'What is the first step in outbreak investigation?',
                  options: ['Laboratory testing', 'Case definition', 'Contact tracing', 'Media notification'],
                  correctAnswer: 'Case definition',
                  explanation: 'Establishing clear case definitions is essential for consistent case identification and counting.',
                  points: 75
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Risk Communication Strategies',
              content: `
                <h3>Public Health Communication</h3>
                <p>Effective crisis communication during health emergencies:</p>
                <ul>
                  <li><strong>Risk Perception:</strong> Understanding public risk perception and behavior</li>
                  <li><strong>Message Development:</strong> Clear, actionable, and culturally appropriate messaging</li>
                  <li><strong>Stakeholder Engagement:</strong> Coordination with media, community leaders, and partners</li>
                  <li><strong>Misinformation Management:</strong> Combating false information and conspiracy theories</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Pandemic Response Simulation',
              content: `
                <h3>Global Health Emergency</h3>
                <p>Manage a hypothetical pandemic scenario:</p>
                <div class="bg-red-50 p-4 rounded-lg">
                  <p><strong>Pathogen:</strong> Novel respiratory virus with human-to-human transmission</p>
                  <p><strong>Geography:</strong> Multiple countries with international spread</p>
                  <p><strong>Severity:</strong> Moderate case fatality rate, high transmission</p>
                  <p><strong>Response:</strong> Coordinate international public health response</p>
                </div>
              `,
              questions: [
                {
                  id: 'pr1',
                  type: 'multiple-choice',
                  question: 'What is the most critical early intervention in pandemic response?',
                  options: ['Vaccine development', 'Travel restrictions', 'Case isolation', 'Economic support'],
                  correctAnswer: 'Case isolation',
                  explanation: 'Early case identification and isolation is most critical for breaking transmission chains.',
                  points: 90
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Global Health Security',
              content: `
                <h3>International Health Regulations</h3>
                <p>Framework for global health security cooperation:</p>
                <ul>
                  <li><strong>Core Capacities:</strong> National surveillance and response capabilities</li>
                  <li><strong>Public Health Emergencies:</strong> International concern determination and response</li>
                  <li><strong>Information Sharing:</strong> Rapid data exchange and transparency requirements</li>
                  <li><strong>Mutual Support:</strong> Technical assistance and resource sharing mechanisms</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Pharmaceutical Countermeasures',
              content: `
                <h3>Medical Countermeasure Development</h3>
                <p>Rapid development and deployment of medical interventions:</p>
                <ul>
                  <li><strong>Vaccine Development:</strong> Accelerated vaccine design and testing</li>
                  <li><strong>Therapeutic Options:</strong> Antiviral development and repurposing existing drugs</li>
                  <li><strong>Diagnostic Tools:</strong> Rapid test development and validation</li>
                  <li><strong>Manufacturing Scale-up:</strong> Global production and distribution capacity</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Countermeasures Assessment',
              questions: [
                {
                  id: 'cm1',
                  type: 'multiple-choice',
                  question: 'Which countermeasure can be deployed fastest in a pandemic?',
                  options: ['New vaccines', 'Novel therapeutics', 'Repurposed drugs', 'New diagnostics'],
                  correctAnswer: 'Repurposed drugs',
                  explanation: 'Repurposing existing approved drugs can be fastest since safety profiles are already known.',
                  points: 100
                },
                {
                  id: 'cm2',
                  type: 'multiple-choice',
                  question: 'What is the primary bottleneck in pandemic vaccine deployment?',
                  options: ['Development time', 'Manufacturing capacity', 'Regulatory approval', 'Distribution logistics'],
                  correctAnswer: 'Manufacturing capacity',
                  explanation: 'Manufacturing scale-up to produce billions of doses is typically the primary constraint.',
                  points: 100
                }
              ]
            }
          ]
        },
        {
          id: 'digital-health',
          title: 'Digital Health Innovation',
          description: 'Explore telemedicine, AI diagnostics, and health technology investments',
          icon: Smartphone,
          difficulty: 'intermediate',
          points: 450,
          steps: [
            {
              type: 'lesson',
              title: 'Telemedicine Transformation',
              content: `
                <h3>Remote Healthcare Delivery</h3>
                <p>Digital transformation of healthcare delivery models:</p>
                <ul>
                  <li><strong>Virtual Consultations:</strong> Remote patient-provider interactions</li>
                  <li><strong>Remote Monitoring:</strong> Continuous health data collection</li>
                  <li><strong>Digital Therapeutics:</strong> Software-based treatment interventions</li>
                  <li><strong>Mobile Health Apps:</strong> Consumer health management tools</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Artificial Intelligence in Healthcare',
              content: `
                <h3>AI-Powered Medical Applications</h3>
                <p>Machine learning revolutionizing healthcare:</p>
                <ul>
                  <li><strong>Diagnostic Imaging:</strong> AI-assisted radiology and pathology</li>
                  <li><strong>Drug Discovery:</strong> Accelerated pharmaceutical development</li>
                  <li><strong>Clinical Decision Support:</strong> Evidence-based treatment recommendations</li>
                  <li><strong>Predictive Analytics:</strong> Risk stratification and early warning systems</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'AI Healthcare Assessment',
              questions: [
                {
                  id: 'ai1',
                  type: 'multiple-choice',
                  question: 'Where has AI shown the most promising results in healthcare?',
                  options: ['Administrative tasks', 'Diagnostic imaging', 'Patient scheduling', 'Billing processes'],
                  correctAnswer: 'Diagnostic imaging',
                  explanation: 'AI has demonstrated exceptional performance in medical imaging, often matching or exceeding human radiologist accuracy.',
                  points: 65
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Health Data Analytics',
              content: `
                <h3>Big Data in Healthcare</h3>
                <p>Leveraging large-scale health data for insights:</p>
                <ul>
                  <li><strong>Electronic Health Records:</strong> Structured and unstructured clinical data</li>
                  <li><strong>Genomic Data:</strong> Personalized medicine and precision therapy</li>
                  <li><strong>Population Health:</strong> Community-level health trend analysis</li>
                  <li><strong>Real-World Evidence:</strong> Treatment effectiveness in routine practice</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Digital Health Investment',
              content: `
                <h3>Health Technology Venture</h3>
                <p>Evaluate digital health investment opportunity:</p>
                <div class="bg-purple-50 p-4 rounded-lg">
                  <p><strong>Technology:</strong> AI-powered diagnostic platform</p>
                  <p><strong>Market:</strong> Primary care and specialist applications</p>
                  <p><strong>Validation:</strong> Clinical trials in progress</p>
                  <p><strong>Regulatory:</strong> FDA breakthrough device designation</p>
                </div>
              `,
              questions: [
                {
                  id: 'dh1',
                  type: 'multiple-choice',
                  question: 'What is the primary risk in digital health investments?',
                  options: ['Technology development', 'Regulatory approval', 'Market adoption', 'Competition'],
                  correctAnswer: 'Market adoption',
                  explanation: 'Healthcare providers can be slow to adopt new technologies, making market adoption a primary investment risk.',
                  points: 75
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Regulatory Framework for Digital Health',
              content: `
                <h3>Digital Health Regulation</h3>
                <p>Evolving regulatory landscape for health technology:</p>
                <ul>
                  <li><strong>Software as Medical Device:</strong> FDA regulation of diagnostic and therapeutic software</li>
                  <li><strong>Data Privacy:</strong> HIPAA compliance and patient data protection</li>
                  <li><strong>Clinical Evidence:</strong> Requirements for safety and effectiveness validation</li>
                  <li><strong>Quality Management:</strong> ISO standards for medical device software</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Cybersecurity in Healthcare',
              content: `
                <h3>Protecting Health Information</h3>
                <p>Critical cybersecurity considerations for digital health:</p>
                <ul>
                  <li><strong>Data Encryption:</strong> Protecting patient information in transit and at rest</li>
                  <li><strong>Access Controls:</strong> Identity management and role-based permissions</li>
                  <li><strong>Incident Response:</strong> Breach detection and response protocols</li>
                  <li><strong>Vendor Management:</strong> Third-party security assessments and contracts</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Digital Health Security Assessment',
              questions: [
                {
                  id: 'dhs1',
                  type: 'multiple-choice',
                  question: 'What is the most common cause of healthcare data breaches?',
                  options: ['Hacking attacks', 'Employee error', 'System failures', 'Physical theft'],
                  correctAnswer: 'Employee error',
                  explanation: 'Human error, including inadvertent disclosure and lost devices, accounts for the majority of healthcare data breaches.',
                  points: 85
                },
                {
                  id: 'dhs2',
                  type: 'multiple-choice',
                  question: 'Which regulation primarily governs healthcare data privacy in the US?',
                  options: ['GDPR', 'HIPAA', 'SOX', 'FERPA'],
                  correctAnswer: 'HIPAA',
                  explanation: 'The Health Insurance Portability and Accountability Act (HIPAA) is the primary US regulation for healthcare data privacy.',
                  points: 85
                }
              ]
            }
          ]
        },
        {
          id: 'health-economics',
          title: 'Health Economics & Policy Analysis',
          description: 'Understand healthcare financing, policy evaluation, and economic impact assessment',
          icon: DollarSign,
          difficulty: 'advanced',
          points: 500,
          steps: [
            {
              type: 'lesson',
              title: 'Healthcare Financing Models',
              content: `
                <h3>Global Health System Financing</h3>
                <p>Different approaches to healthcare funding and delivery:</p>
                <ul>
                  <li><strong>Single-Payer Systems:</strong> Government-funded universal healthcare</li>
                  <li><strong>Multi-Payer Insurance:</strong> Mixed public-private insurance models</li>
                  <li><strong>Direct Payment:</strong> Out-of-pocket and fee-for-service systems</li>
                  <li><strong>Hybrid Models:</strong> Combinations of funding mechanisms</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Health Technology Assessment',
              content: `
                <h3>Economic Evaluation of Health Interventions</h3>
                <p>Systematic assessment of health technology value:</p>
                <ul>
                  <li><strong>Cost-Effectiveness Analysis:</strong> Cost per quality-adjusted life year</li>
                  <li><strong>Budget Impact Analysis:</strong> Financial implications for health systems</li>
                  <li><strong>Cost-Utility Analysis:</strong> Preference-based outcome measures</li>
                  <li><strong>Social Value Assessment:</strong> Broader societal impact consideration</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Health Economics Fundamentals',
              questions: [
                {
                  id: 'hef1',
                  type: 'multiple-choice',
                  question: 'What does a cost-effectiveness ratio measure?',
                  options: ['Total treatment costs', 'Cost per unit of health benefit', 'Patient satisfaction scores', 'Healthcare provider revenue'],
                  correctAnswer: 'Cost per unit of health benefit',
                  explanation: 'Cost-effectiveness ratios measure the cost required to achieve one unit of health benefit, typically cost per QALY.',
                  points: 70
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Pharmaceutical Economics',
              content: `
                <h3>Drug Pricing and Market Access</h3>
                <p>Economic factors in pharmaceutical markets:</p>
                <ul>
                  <li><strong>Value-Based Pricing:</strong> Pricing based on clinical and economic outcomes</li>
                  <li><strong>Reference Pricing:</strong> International price comparisons and benchmarking</li>
                  <li><strong>Risk-Sharing Agreements:</strong> Outcomes-based contracts with payers</li>
                  <li><strong>Biosimilar Competition:</strong> Generic competition for biologic drugs</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Health Policy Analysis',
              content: `
                <h3>Healthcare Reform Impact Assessment</h3>
                <p>Analyze the economic impact of health policy changes:</p>
                <div class="bg-green-50 p-4 rounded-lg">
                  <p><strong>Policy:</strong> Universal health coverage expansion</p>
                  <p><strong>Population:</strong> 10 million uninsured individuals</p>
                  <p><strong>Cost:</strong> $50 billion annual government investment</p>
                  <p><strong>Benefits:</strong> Improved access, preventive care, health outcomes</p>
                </div>
              `,
              questions: [
                {
                  id: 'hpa1',
                  type: 'multiple-choice',
                  question: 'What is the primary economic benefit of universal health coverage?',
                  options: ['Lower administrative costs', 'Improved population health', 'Increased healthcare employment', 'Higher tax revenue'],
                  correctAnswer: 'Improved population health',
                  explanation: 'The primary economic benefit is improved population health leading to increased productivity and reduced healthcare costs.',
                  points: 85
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Global Health Investment',
              content: `
                <h3>International Health Development</h3>
                <p>Economic aspects of global health initiatives:</p>
                <ul>
                  <li><strong>Development Assistance:</strong> Bilateral and multilateral health funding</li>
                  <li><strong>Impact Investing:</strong> Private capital for health outcomes</li>
                  <li><strong>Innovative Financing:</strong> Results-based funding mechanisms</li>
                  <li><strong>Economic Growth:</strong> Health investment impact on national development</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Health Workforce Economics',
              content: `
                <h3>Healthcare Labor Market Analysis</h3>
                <p>Economic factors affecting health workforce:</p>
                <ul>
                  <li><strong>Workforce Planning:</strong> Supply and demand forecasting</li>
                  <li><strong>Migration Patterns:</strong> International health worker mobility</li>
                  <li><strong>Productivity Analysis:</strong> Efficiency and output optimization</li>
                  <li><strong>Compensation Models:</strong> Performance-based payment systems</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Health Workforce Assessment',
              questions: [
                {
                  id: 'hw1',
                  type: 'multiple-choice',
                  question: 'What is the primary driver of healthcare workforce shortages?',
                  options: ['Low wages', 'Aging population', 'Poor working conditions', 'Limited training capacity'],
                  correctAnswer: 'Aging population',
                  explanation: 'Aging populations increase healthcare demand while simultaneously reducing the workforce through retirements.',
                  points: 90
                },
                {
                  id: 'hw2',
                  type: 'multiple-choice',
                  question: 'Which payment model best aligns provider incentives with patient outcomes?',
                  options: ['Fee-for-service', 'Salary-based', 'Value-based care', 'Capitation'],
                  correctAnswer: 'Value-based care',
                  explanation: 'Value-based care payment models tie compensation to patient outcomes and quality metrics.',
                  points: 90
                }
              ]
            }
          ]
        },
        {
          id: 'precision-medicine',
          title: 'Precision Medicine & Genomics',
          description: 'Explore personalized healthcare, genetic testing, and targeted therapy investments',
          icon: Dna,
          difficulty: 'advanced',
          points: 575,
          steps: [
            {
              type: 'lesson',
              title: 'Genomic Medicine Fundamentals',
              content: `
                <h3>Personalized Healthcare Revolution</h3>
                <p>Genomics transforming medical practice:</p>
                <ul>
                  <li><strong>Pharmacogenomics:</strong> Drug response based on genetic variations</li>
                  <li><strong>Disease Risk Assessment:</strong> Genetic predisposition screening</li>
                  <li><strong>Targeted Therapies:</strong> Treatments based on molecular profiles</li>
                  <li><strong>Companion Diagnostics:</strong> Tests guiding treatment selection</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Genomic Data Infrastructure',
              content: `
                <h3>Big Data in Genomics</h3>
                <p>Managing and analyzing genomic information:</p>
                <ul>
                  <li><strong>Sequencing Technologies:</strong> Next-generation and long-read sequencing</li>
                  <li><strong>Data Storage:</strong> Cloud computing for genomic data management</li>
                  <li><strong>Bioinformatics:</strong> Computational tools for genetic analysis</li>
                  <li><strong>Privacy Protection:</strong> Genetic data security and consent</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Genomics Technology Assessment',
              questions: [
                {
                  id: 'gt1',
                  type: 'multiple-choice',
                  question: 'What has driven the rapid adoption of genomic medicine?',
                  options: ['Government mandates', 'Decreasing sequencing costs', 'Patient demand', 'Insurance coverage'],
                  correctAnswer: 'Decreasing sequencing costs',
                  explanation: 'Dramatic reductions in DNA sequencing costs have made genomic medicine economically viable for routine clinical use.',
                  points: 80
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Cancer Genomics and Immunotherapy',
              content: `
                <h3>Precision Oncology</h3>
                <p>Genomics revolutionizing cancer treatment:</p>
                <ul>
                  <li><strong>Tumor Profiling:</strong> Genetic characterization of cancer types</li>
                  <li><strong>Liquid Biopsies:</strong> Blood-based cancer detection and monitoring</li>
                  <li><strong>CAR-T Cell Therapy:</strong> Genetically engineered immune treatments</li>
                  <li><strong>Immunotherapy Biomarkers:</strong> Predicting response to immune treatments</li>
                </ul>
              `
            },
            {
              type: 'scenario',
              title: 'Precision Medicine Investment',
              content: `
                <h3>Genomics Company Valuation</h3>
                <p>Evaluate precision medicine investment opportunity:</p>
                <div class="bg-indigo-50 p-4 rounded-lg">
                  <p><strong>Technology:</strong> AI-powered genomic analysis platform</p>
                  <p><strong>Applications:</strong> Cancer diagnosis and treatment selection</p>
                  <p><strong>Market:</strong> Oncology centers and clinical laboratories</p>
                  <p><strong>Intellectual Property:</strong> 15 patents in genomic algorithms</p>
                </div>
              `,
              questions: [
                {
                  id: 'pm1',
                  type: 'multiple-choice',
                  question: 'What is the primary value proposition of precision medicine?',
                  options: ['Lower treatment costs', 'Faster diagnosis', 'Improved treatment outcomes', 'Reduced side effects'],
                  correctAnswer: 'Improved treatment outcomes',
                  explanation: 'Precision medicine\'s primary value is matching patients with treatments most likely to be effective for their specific condition.',
                  points: 95
                }
              ]
            },
            {
              type: 'lesson',
              title: 'Rare Disease Genomics',
              content: `
                <h3>Orphan Drug Development</h3>
                <p>Genomics enabling rare disease treatment:</p>
                <ul>
                  <li><strong>Disease Gene Discovery:</strong> Identifying genetic causes of rare conditions</li>
                  <li><strong>Gene Therapy:</strong> Direct genetic intervention strategies</li>
                  <li><strong>Regulatory Pathways:</strong> Orphan drug designation and accelerated approval</li>
                  <li><strong>Market Dynamics:</strong> Small patient populations and high-value treatments</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Population Genomics',
              content: `
                <h3>Large-Scale Genetic Studies</h3>
                <p>Population-level genomic research and applications:</p>
                <ul>
                  <li><strong>Biobanks:</strong> Large-scale genetic and health data repositories</li>
                  <li><strong>Polygenic Risk Scores:</strong> Multiple genetic variant risk assessment</li>
                  <li><strong>Ancestry and Health:</strong> Population-specific genetic variations</li>
                  <li><strong>Public Health Genomics:</strong> Population screening and prevention</li>
                </ul>
              `
            },
            {
              type: 'lesson',
              title: 'Ethical and Regulatory Considerations',
              content: `
                <h3>Genomics Ethics and Policy</h3>
                <p>Addressing societal implications of genomic medicine:</p>
                <ul>
                  <li><strong>Genetic Discrimination:</strong> Insurance and employment protections</li>
                  <li><strong>Informed Consent:</strong> Complex genetic testing decisions</li>
                  <li><strong>Data Sharing:</strong> Balancing research benefits with privacy</li>
                  <li><strong>Health Equity:</strong> Ensuring diverse representation in genomic research</li>
                </ul>
              `
            },
            {
              type: 'quiz',
              title: 'Precision Medicine Ethics Assessment',
              questions: [
                {
                  id: 'pme1',
                  type: 'multiple-choice',
                  question: 'What is the primary ethical concern in genomic medicine?',
                  options: ['Treatment costs', 'Data privacy', 'Research validity', 'Clinical effectiveness'],
                  correctAnswer: 'Data privacy',
                  explanation: 'Genetic data privacy is a primary concern as genomic information can affect individuals and their families for generations.',
                  points: 105
                },
                {
                  id: 'pme2',
                  type: 'multiple-choice',
                  question: 'Why is diversity important in genomic research?',
                  options: ['Political correctness', 'Research funding', 'Health equity', 'Statistical power'],
                  correctAnswer: 'Health equity',
                  explanation: 'Genomic diversity ensures that precision medicine benefits are available to all populations, not just those historically over-represented in research.',
                  points: 105
                }
              ]
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
                <p>Energy markets are highly dynamic, influenced by supply-demand fundamentals, geopolitical events, and seasonal patterns.</p>
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
        },
        {
          id: 'geopolitical-energy',
          title: 'Energy Geopolitics & Security',
          description: 'Analyze global energy dependencies, pipeline politics, and supply chain risks',
          icon: Shield,
          difficulty: 'advanced',
          points: 185,
          steps: [
            {
              type: 'lesson',
              title: 'Energy Security Fundamentals',
              content: `
                <h3>Global Energy Dependencies</h3>
                <p>Energy security involves strategic considerations beyond market dynamics:</p>
                <ul>
                  <li><strong>Supply Chain Resilience:</strong> Critical infrastructure protection</li>
                  <li><strong>Resource Nationalism:</strong> Government control over energy assets</li>
                  <li><strong>Pipeline Politics:</strong> Strategic transit routes and chokepoints</li>
                  <li><strong>Energy Diplomacy:</strong> International cooperation and sanctions</li>
                </ul>
              `
            }
          ]
        },
        {
          id: 'energy-trading',
          title: 'Commodity Trading & Derivatives',
          description: 'Master oil futures, natural gas contracts, and energy hedging strategies',
          icon: Target,
          difficulty: 'advanced',
          points: 195,
          steps: [
            {
              type: 'lesson',
              title: 'Energy Derivatives Markets',
              content: `
                <h3>Trading Energy Commodities</h3>
                <p>Energy trading involves sophisticated financial instruments:</p>
                <ul>
                  <li><strong>Crude Oil Futures:</strong> WTI and Brent benchmark contracts</li>
                  <li><strong>Natural Gas Contracts:</strong> Henry Hub and regional pricing</li>
                  <li><strong>Refined Products:</strong> Gasoline and heating oil futures</li>
                  <li><strong>Power Markets:</strong> Electricity trading and grid balancing</li>
                </ul>
              `
            }
          ]
        },
        {
          id: 'carbon-markets',
          title: 'Carbon Credits & Climate Finance',
          description: 'Navigate emissions trading, carbon offsets, and green finance mechanisms',
          icon: Sparkles,
          difficulty: 'intermediate',
          points: 170,
          steps: [
            {
              type: 'lesson',
              title: 'Carbon Market Dynamics',
              content: `
                <h3>Climate Finance Innovation</h3>
                <p>Carbon markets create financial incentives for emissions reduction:</p>
                <ul>
                  <li><strong>Cap-and-Trade Systems:</strong> EU ETS and California programs</li>
                  <li><strong>Carbon Offset Projects:</strong> Forestry, renewable energy, and efficiency</li>
                  <li><strong>Green Bonds:</strong> Climate-focused debt instruments</li>
                  <li><strong>ESG Integration:</strong> Environmental criteria in investment decisions</li>
                </ul>
              `
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
      const allQuestionsAnswered = step.questions?.every(q => moduleAnswers[q.id]) || false;
      
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
                      disabled={allQuestionsAnswered}
                      className={cn(
                        "w-full p-3 text-left rounded-lg border transition-colors",
                        moduleAnswers[question.id] === option && !allQuestionsAnswered
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/50",
                        allQuestionsAnswered && option === question.correctAnswer && "border-green-500 bg-green-50 dark:bg-green-900/20",
                        allQuestionsAnswered && moduleAnswers[question.id] === option && option !== question.correctAnswer && "border-red-500 bg-red-50 dark:bg-red-900/20"
                      )}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
                {allQuestionsAnswered && (
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
          {!allQuestionsAnswered && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Answer all questions to see explanations and results
              </p>
            </div>
          )}
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
              <p className="text-sm text-muted-foreground mt-2">
                New quiz available in 24 hours
              </p>
            </div>
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