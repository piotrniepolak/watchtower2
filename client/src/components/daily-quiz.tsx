import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, XCircle, Award, Clock, TrendingUp } from "lucide-react";
import { MiniGeopoliticalLoader } from "@/components/geopolitical-loader";
// Temporarily removing auth dependency for quiz functionality
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
}

export default function DailyQuiz() {
  const queryClient = useQueryClient();
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const { data: quiz, isLoading: quizLoading } = useQuery<DailyQuiz>({
    queryKey: ['/api/quiz/today'],
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: async (responses: number[]) => {
      return apiRequest(`/api/quiz/${quiz!.id}/submit`, 'POST', { responses });
    },
    onSuccess: () => {
      setShowResults(true);
    },
  });

  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;

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

  if (quizLoading) {
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
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            No quiz available for today. Our AI is generating new questions based on current developments.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted && !showResults) {
    const score = existingResponse!.score;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Quiz Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-lg text-slate-600 dark:text-slate-400 mb-4">
              {percentage}% Correct
            </div>
            <Progress value={percentage} className="w-full max-w-xs mx-auto" />
          </div>
          
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            Completed at {new Date(existingResponse!.completedAt).toLocaleTimeString()}
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => setShowResults(true)}
              variant="outline"
            >
              Review Answers
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults || (isCompleted && showResults)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => {
            const userAnswer = isCompleted ? existingResponse!.responses[index] : selectedAnswers[index];
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
              onClick={() => setQuizStarted(true)}
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