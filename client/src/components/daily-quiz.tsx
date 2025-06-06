import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, XCircle, Award, Clock, TrendingUp, Timer, Star, Zap, Lock, UserPlus } from "lucide-react";
import { MiniGeopoliticalLoader } from "@/components/geopolitical-loader";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: "geopolitical" | "market" | "defense" | "general";
  source?: string;
}

interface DailyQuiz {
  id: number;
  date: string;
  questions: QuizQuestion[];
  createdAt: string;
}

interface QuizResponse {
  id: number;
  userId: number;
  quizId: number;
  responses: number[];
  score: number;
  completedAt: string;
}

interface QuizResult {
  score: number;
  total: number;
  totalPoints: number;
  timeBonus: number;
}

export default function DailyQuiz() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Check if user is demo account
  const isDemoUser = user?.username === 'demo_user';

  const quizQuery = useQuery<DailyQuiz>({
    queryKey: ['/api/quiz/today'],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchInterval: 5000, // Poll every 5 seconds to check for new quiz
  });

  const { data: quiz, isLoading: quizLoading, refetch } = quizQuery;

  const submitMutation = useMutation({
    mutationFn: async (responses: number[]) => {
      const completionTimeSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : undefined;
      console.log('Submitting quiz responses:', responses);
      console.log('Quiz ID:', quiz?.id);
      console.log('Completion time:', completionTimeSeconds, 'seconds');
      try {
        const response = await apiRequest('POST', `/api/quiz/${quiz!.id}/submit`, { 
          responses, 
          completionTimeSeconds 
        });
        const result = await response.json();
        console.log('Quiz submission result:', result);
        return result;
      } catch (error) {
        console.error('Quiz submission error:', error);
        throw error;
      }
    },
    onSuccess: (data: QuizResult) => {
      console.log('Quiz submitted successfully:', data);
      setQuizResult(data);
      setShowResults(true);
    },
    onError: (error) => {
      console.error('Quiz submission failed:', error);
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizStarted && startTime && !showResults) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, startTime, showResults]);

  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const responses = Array.from({ length: totalQuestions }, (_, i) => selectedAnswers[i] ?? -1);
    submitMutation.mutate(responses);
  };

  const canSubmit = Object.keys(selectedAnswers).length === totalQuestions && 
                   Object.values(selectedAnswers).every(val => val !== undefined);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'geopolitical': return <Brain className="w-4 h-4" />;
      case 'market': return <TrendingUp className="w-4 h-4" />;
      case 'defense': return <Award className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Show restricted access for demo users
  if (!authLoading && isAuthenticated && isDemoUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Daily Intelligence Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Quiz Restricted for Demo Account
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md">
                Daily quizzes are only available to registered users. Create a real account to participate in the intelligence quiz and compete on the leaderboard.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/register'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show login prompt for non-authenticated users
  if (!authLoading && !isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Daily Intelligence Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Sign In Required
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md">
                Access daily intelligence quizzes and compete on the leaderboard by signing in to your account.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authLoading || quizLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Daily Intelligence Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MiniGeopoliticalLoader type="intelligence" />
          <p className="text-center text-slate-600 dark:text-slate-400 mt-4">
            Loading today's quiz...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Daily Intelligence Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Our AI is generating new questions based on current geopolitical developments.
          </p>
          <div className="flex items-center justify-between">
            <MiniGeopoliticalLoader type="intelligence" />
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              disabled={quizLoading}
            >
              {quizLoading ? "Checking..." : "Check Again"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const correctAnswers = Object.entries(selectedAnswers).filter(([index, answer]) => 
      answer === questions[parseInt(index)]?.correctAnswer
    ).length;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-slate-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">{totalQuestions}</div>
                <div className="text-sm text-slate-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-slate-600">Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round((correctAnswers / totalQuestions) * 100)}%</div>
                <div className="text-sm text-slate-600">Score</div>
              </div>
            </div>
            
            {quizResult && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Point Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Base Points</span>
                      <span className="font-bold text-blue-600">{correctAnswers * 500}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">500 points per correct answer</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Speed Bonus
                      </span>
                      <span className="font-bold text-green-600">+{quizResult.timeBonus}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {elapsedTime <= 300 ? `Fast completion bonus` : 'No speed bonus'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700 font-medium">Total Points</span>
                      <span className="font-bold text-purple-700 text-lg">{quizResult.totalPoints}</span>
                    </div>
                    <div className="text-xs text-purple-600 mt-1">Final score for today</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {questions.map((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={question.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {index + 1}. {question.question}
                  </h3>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <div className="flex items-center">
                      {getCategoryIcon(question.category)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const isUserAnswer = userAnswer === optionIndex;
                    const isCorrectAnswer = optionIndex === question.correctAnswer;
                    
                    return (
                      <div
                        key={optionIndex}
                        className={`p-2 rounded-md border ${
                          isCorrectAnswer
                            ? 'bg-green-50 border-green-300 dark:bg-green-900/20'
                            : isUserAnswer && !isCorrect
                            ? 'bg-red-50 border-red-300 dark:bg-red-900/20'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{option}</span>
                          <div className="flex items-center gap-1">
                            {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                  {question.source && (
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Source: {question.source}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  if (!quizStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Daily Intelligence Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Today's Geopolitical Intelligence Challenge
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Test your knowledge of recent global developments and defense market trends
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Questions</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">~5</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Minutes</div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={handleStartQuiz}
              className="w-full"
            >
              Start Quiz
            </Button>
          </div>
          
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Questions are generated daily using current geopolitical developments
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Question {currentQuestion + 1} of {totalQuestions}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
              <Timer className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <Badge className={getDifficultyColor(currentQ.difficulty)}>
              {currentQ.difficulty}
            </Badge>
            <div className="flex items-center">
              {getCategoryIcon(currentQ.category)}
            </div>
          </div>
        </div>
        <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
            {currentQ.question}
          </h3>
          
          <RadioGroup
            value={selectedAnswers[currentQuestion]?.toString() || ""}
            onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
          >
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentQuestion < totalQuestions - 1 ? (
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestion] === undefined}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={!canSubmit || submitMutation.isPending}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}