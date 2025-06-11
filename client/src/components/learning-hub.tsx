import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Brain, Trophy, Timer, Target, Sparkles, Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sector: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  tags: string[];
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

interface LearningHubProps {}

export function LearningHub({}: LearningHubProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [learningSelectedSector, setLearningSelectedSector] = useState<string>('defense');
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const queryClient = useQueryClient();

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

  // Fetch daily quiz for current sector
  const { data: dailyQuiz, isLoading: quizLoading } = useQuery<QuizQuestion>({
    queryKey: [`/api/learning/daily-quiz/${learningSelectedSector}`],
    enabled: isExpanded,
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

  // Generate new quiz mutation
  const generateQuizMutation = useMutation({
    mutationFn: async () => {
      const result = await fetch('/api/learning/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: learningSelectedSector })
      });
      return result.json();
    },
    onSuccess: (newQuiz: QuizQuestion) => {
      setCurrentQuiz(newQuiz);
      setSelectedAnswer(null);
      setShowResult(false);
      setQuizStartTime(Date.now());
      setIsAnswerSubmitted(false);
    }
  });

  useEffect(() => {
    if (dailyQuiz && !currentQuiz) {
      setCurrentQuiz(dailyQuiz);
      setQuizStartTime(Date.now());
    }
  }, [dailyQuiz, currentQuiz]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !currentQuiz || isAnswerSubmitted) return;

    const timeSpent = Date.now() - quizStartTime;
    const isCorrect = selectedAnswer === currentQuiz.correctAnswer;

    setIsAnswerSubmitted(true);
    setShowResult(true);

    await submitResponseMutation.mutateAsync({
      questionId: currentQuiz.id,
      selectedAnswer,
      isCorrect,
      timeSpent,
    });
  };

  const handleGenerateNewQuiz = () => {
    generateQuizMutation.mutate();
  };

  const IconComponent = config.icon;

  const difficultyColor = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  if (!isExpanded) {
    return (
      <Card className={cn("transition-all duration-300 hover:shadow-md cursor-pointer", config.borderColor, config.bgColor)}>
        <CardHeader 
          className="pb-3"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", config.bgColor)}>
                <IconComponent className={cn("h-5 w-5", config.color)} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
                <CardDescription className="text-sm">
                  Expand to access learning modules and quizzes
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {userStats && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Score: {userStats.totalScore || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Streak: {userStats.streak || 0} 🔥
                  </div>
                </div>
              )}
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all duration-300", config.borderColor)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <IconComponent className={cn("h-5 w-5", config.color)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
                <Select value={learningSelectedSector} onValueChange={setLearningSelectedSector}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defense">ConflictWatch</SelectItem>
                    <SelectItem value="health">PharmaWatch</SelectItem>
                    <SelectItem value="energy">EnergyWatch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                Master intelligence analysis with real-time market quizzes
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Progress Section */}
        {userStats && (
          <div className={cn("p-4 rounded-lg", config.bgColor)}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Your Progress
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userStats.totalScore || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
                  {userStats.streak || 0} 🔥
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userStats.totalQuestions || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userStats.totalQuestions > 0 ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
            </div>
            {userStats.totalQuestions > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{userStats.correctAnswers}/{userStats.totalQuestions}</span>
                </div>
                <Progress 
                  value={(userStats.correctAnswers / userStats.totalQuestions) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Quiz Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Daily Intelligence Quiz
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateNewQuiz}
              disabled={generateQuizMutation.isPending}
            >
              {generateQuizMutation.isPending ? 'Generating...' : 'New Quiz'}
            </Button>
          </div>

          {quizLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading quiz...</p>
            </div>
          ) : currentQuiz && currentQuiz.question && currentQuiz.options ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={difficultyColor[currentQuiz.difficulty || 'medium']}>
                  {currentQuiz.difficulty || 'medium'}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Timer className="h-3 w-3" />
                  <span>{Math.round((Date.now() - quizStartTime) / 1000)}s</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-4">{currentQuiz.question}</h4>
                <div className="space-y-2">
                  {currentQuiz.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswerSubmitted}
                      className={cn(
                        "w-full p-3 text-left border rounded-lg transition-colors",
                        selectedAnswer === index
                          ? showResult
                            ? index === currentQuiz.correctAnswer
                              ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300"
                              : "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300"
                            : "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300"
                          : showResult && index === currentQuiz.correctAnswer
                          ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800",
                        isAnswerSubmitted && "cursor-not-allowed"
                      )}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  ))}
                </div>

                {!showResult && selectedAnswer !== null && (
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={submitResponseMutation.isPending}
                    className="w-full mt-4"
                  >
                    {submitResponseMutation.isPending ? 'Submitting...' : 'Submit Answer'}
                  </Button>
                )}

                {showResult && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium mb-2">Explanation:</h5>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {currentQuiz.explanation}
                    </p>
                    <p className="text-xs text-gray-500">
                      Source: {currentQuiz.source}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Click "New Quiz" to generate a question based on current market conditions
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Leaderboard Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            Sector Leaderboard
          </h3>

          {leaderboardLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : Array.isArray(leaderboard) && leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry: LeaderboardEntry, index: number) => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium">
                      {index < 3 ? (
                        <Medal className={cn(
                          "h-4 w-4",
                          index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-orange-600"
                        )} />
                      ) : (
                        entry.rank
                      )}
                    </div>
                    <span className="font-medium">{entry.username}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{entry.totalScore}</div>
                    <div className="text-xs text-gray-500">
                      {entry.streak} day streak
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No participants yet. Be the first to take a quiz!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}