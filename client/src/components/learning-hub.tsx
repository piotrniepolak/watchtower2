import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Trophy, 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Medal,
  Star,
  Target,
  TrendingUp,
  Shield,
  Pill,
  Zap,
  Globe
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sector: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
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

interface LearningHubProps {
  selectedSector: string;
}

export function LearningHub({ selectedSector }: LearningHubProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("quiz");
  const queryClient = useQueryClient();

  // Fetch daily quiz for current sector
  const { data: dailyQuiz, isLoading: quizLoading } = useQuery({
    queryKey: ["/api/learning/daily-quiz", selectedSector],
    enabled: isExpanded,
  });

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/learning/leaderboard", selectedSector],
    enabled: isExpanded,
  });

  // Fetch user stats
  const { data: userStats } = useQuery<{
    totalScore: number;
    streak: number;
    correctAnswers: number;
    totalQuestions: number;
  }>({
    queryKey: ["/api/learning/user-stats", selectedSector],
    enabled: isExpanded,
  });

  // Submit quiz response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (response: QuizResponse) => {
      const result = await fetch('/api/learning/submit-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...response,
          sector: selectedSector
        })
      });
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learning/user-stats"] });
    }
  });

  // Generate new quiz mutation
  const generateQuizMutation = useMutation({
    mutationFn: async () => {
      const result = await fetch('/api/learning/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: selectedSector })
      });
      return result.json();
    },
    onSuccess: (newQuiz: QuizQuestion) => {
      setCurrentQuiz(newQuiz);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuizStartTime(Date.now());
    }
  });

  useEffect(() => {
    if (dailyQuiz && !currentQuiz) {
      setCurrentQuiz(dailyQuiz);
      setQuizStartTime(Date.now());
    }
  }, [dailyQuiz, currentQuiz]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuiz) return;

    const timeSpent = Date.now() - quizStartTime;
    const isCorrect = selectedAnswer === currentQuiz.correctAnswer;

    const response: QuizResponse = {
      questionId: currentQuiz.id,
      selectedAnswer,
      isCorrect,
      timeSpent
    };

    submitResponseMutation.mutate(response);
    setShowResult(true);
  };

  const handleNextQuiz = () => {
    generateQuizMutation.mutate();
  };

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case 'defense': return Shield;
      case 'health': return Pill;
      case 'energy': return Zap;
      default: return Globe;
    }
  };

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'defense': return 'from-blue-500 to-purple-600';
      case 'health': return 'from-green-500 to-teal-600';
      case 'energy': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getSectorName = (sector: string) => {
    switch (sector) {
      case 'defense': return 'ConflictWatch';
      case 'health': return 'PharmaWatch';
      case 'energy': return 'EnergyWatch';
      default: return 'Global Intelligence';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SectorIcon = getSectorIcon(selectedSector);

  return (
    <Card className="w-full">
      <CardHeader 
        className="cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${getSectorColor(selectedSector)} text-white`}>
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Learning Hub</h3>
              <p className="text-sm text-slate-600 font-normal">
                Master {getSectorName(selectedSector)} intelligence with AI-powered quizzes
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {userStats && (
              <div className="flex items-center space-x-3 mr-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">{userStats.totalScore || 0}</div>
                  <div className="text-xs text-slate-500">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{userStats.streak || 0}</div>
                  <div className="text-xs text-slate-500">Streak</div>
                </div>
              </div>
            )}
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quiz" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Daily Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Progress</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quiz" className="mt-6">
              {quizLoading || generateQuizMutation.isPending ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Generating intelligent quiz questions...</p>
                  </div>
                </div>
              ) : currentQuiz ? (
                <div className="space-y-6">
                  {/* Quiz Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <SectorIcon className="h-5 w-5 text-slate-600" />
                      <div>
                        <h4 className="font-semibold text-slate-900">{getSectorName(selectedSector)} Quiz</h4>
                        <p className="text-sm text-slate-600">Test your knowledge of current events and market trends</p>
                      </div>
                    </div>
                    <Badge className={getDifficultyColor(currentQuiz.difficulty)}>
                      {currentQuiz.difficulty.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Question */}
                  <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50">
                    <h5 className="text-lg font-medium mb-4">{currentQuiz.question}</h5>
                    
                    <div className="space-y-3">
                      {currentQuiz.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={showResult}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedAnswer === index
                              ? showResult
                                ? index === currentQuiz.correctAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-red-500 bg-red-50'
                                : 'border-blue-500 bg-blue-50'
                              : showResult && index === currentQuiz.correctAnswer
                              ? 'border-green-500 bg-green-50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedAnswer === index
                                ? showResult
                                  ? index === currentQuiz.correctAnswer
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-red-500 bg-red-500'
                                  : 'border-blue-500 bg-blue-500'
                                : showResult && index === currentQuiz.correctAnswer
                                ? 'border-green-500 bg-green-500'
                                : 'border-slate-300'
                            }`}>
                              {showResult && (
                                selectedAnswer === index
                                  ? index === currentQuiz.correctAnswer
                                    ? <CheckCircle className="h-4 w-4 text-white" />
                                    : <XCircle className="h-4 w-4 text-white" />
                                  : index === currentQuiz.correctAnswer
                                  ? <CheckCircle className="h-4 w-4 text-white" />
                                  : null
                              )}
                            </div>
                            <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                            <span>{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Results */}
                  {showResult && (
                    <Card className="p-6 bg-gradient-to-r from-slate-50 to-green-50">
                      <div className="flex items-center space-x-3 mb-4">
                        {selectedAnswer === currentQuiz.correctAnswer ? (
                          <>
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            <span className="text-lg font-semibold text-green-700">Correct!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-6 w-6 text-red-500" />
                            <span className="text-lg font-semibold text-red-700">Incorrect</span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-700 mb-4">{currentQuiz.explanation}</p>
                      <div className="text-xs text-slate-500">
                        Source: {currentQuiz.source}
                      </div>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    {!showResult ? (
                      <Button 
                        onClick={handleSubmitAnswer} 
                        disabled={selectedAnswer === null || submitResponseMutation.isPending}
                        className="w-full"
                      >
                        {submitResponseMutation.isPending ? 'Submitting...' : 'Submit Answer'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleNextQuiz} 
                        disabled={generateQuizMutation.isPending}
                        className="w-full"
                      >
                        {generateQuizMutation.isPending ? 'Generating...' : 'Next Question'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">No Quiz Available</h4>
                  <p className="text-slate-600 mb-6">Generate a new quiz to start learning!</p>
                  <Button onClick={handleNextQuiz} disabled={generateQuizMutation.isPending}>
                    <Play className="h-4 w-4 mr-2" />
                    {generateQuizMutation.isPending ? 'Generating...' : 'Start Quiz'}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-6">
              {leaderboardLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Top Performers</h4>
                    <Badge variant="outline">{getSectorName(selectedSector)}</Badge>
                  </div>
                  
                  {leaderboard.length > 0 ? (
                    <div className="space-y-3">
                      {leaderboard.slice(0, 10).map((entry: LeaderboardEntry, index: number) => (
                        <div key={entry.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {index < 3 ? <Medal className="h-4 w-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
                            </div>
                            <div>
                              <div className="font-medium">{entry.username}</div>
                              <div className="text-sm text-slate-500">
                                {entry.streak} day streak
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{entry.totalScore}</div>
                            <div className="text-xs text-slate-500">points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No rankings available yet. Be the first to take a quiz!</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <div className="space-y-6">
                <h4 className="text-lg font-semibold">Your Learning Progress</h4>
                
                {userStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Total Score</span>
                      </div>
                      <div className="text-2xl font-bold">{userStats.totalScore || 0}</div>
                      <div className="text-sm text-slate-500">Points earned</div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Current Streak</span>
                      </div>
                      <div className="text-2xl font-bold">{userStats.streak || 0}</div>
                      <div className="text-sm text-slate-500">Consecutive days</div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Accuracy</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {userStats.totalQuestions > 0 
                          ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100)
                          : 0}%
                      </div>
                      <div className="text-sm text-slate-500">
                        {userStats.correctAnswers || 0} of {userStats.totalQuestions || 0} correct
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Take your first quiz to see your progress!</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}