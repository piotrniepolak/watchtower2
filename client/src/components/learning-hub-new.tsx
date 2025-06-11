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

  // Get today's daily quiz
  const { data: dailyQuiz, isLoading: quizLoading } = useQuery({
    queryKey: ['/api/quiz/daily', learningSelectedSector],
    enabled: !!learningSelectedSector,
    refetchInterval: 60000, // Check every minute for new quiz
    onSuccess: (data) => {
      if (data && !currentQuiz) {
        setCurrentQuiz(data);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setSelectedAnswer(null);
        setShowResult(false);
        setIsAnswerSubmitted(false);
        setQuizCompleted(false);
        setQuizStartTime(Date.now());
      }
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

  // Submit quiz response mutation
  const submitQuizMutation = useMutation({
    mutationFn: async ({ quizId, responses, completionTimeSeconds }: { 
      quizId: number; 
      responses: number[]; 
      completionTimeSeconds: number;
    }) => {
      const result = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, completionTimeSeconds })
      });
      if (!result.ok) throw new Error('Failed to submit quiz');
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/learning/leaderboard/${learningSelectedSector}`] });
      setQuizCompleted(true);
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
              <CardDescription>Test your knowledge across sectors</CardDescription>
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
                        selectedAnswer === index && !isAnswerSubmitted
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