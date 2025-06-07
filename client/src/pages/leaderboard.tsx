import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { Trophy, Medal, Award, Clock, Target } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  score: number;
  totalPoints: number;
  timeBonus: number;
  completionTimeSeconds: number;
  completedAt: Date;
}

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/quiz/leaderboard"],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-semibold text-slate-600">#{rank}</span>;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Daily Quiz Leaderboard</h1>
          <p className="text-slate-600">See how you rank against other geopolitical intelligence analysts</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Quiz Results Yet</h3>
              <p className="text-slate-600">
                Complete today's daily quiz to see your score on the leaderboard!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              
              return (
                <Card key={entry.username} className={`transition-all ${
                  isTopThree ? 'ring-2 ring-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50' : ''
                }`}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(rank)}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-slate-900">{entry.username}</h3>
                          <p className="text-sm text-slate-600">
                            Completed {formatDate(entry.completedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-slate-600">Score</span>
                          </div>
                          <div className="font-semibold text-lg">{entry.score}/10</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-slate-600">Time</span>
                          </div>
                          <div className="font-semibold">{formatTime(entry.completionTimeSeconds)}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-slate-600">Total Points</div>
                          <Badge variant={isTopThree ? "default" : "secondary"} className="text-lg px-3 py-1">
                            {entry.totalPoints}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {entry.timeBonus > 0 && (
                      <div className="mt-2 flex justify-end">
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          +{entry.timeBonus} time bonus
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Card>
            <CardContent className="py-6">
              <h3 className="font-semibold text-slate-900 mb-2">How Scoring Works</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <p>• Base points: 10 points per correct answer</p>
                <p>• Time bonus: Up to 50 additional points for fast completion</p>
                <p>• Leaderboard updates daily with new quiz results</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}