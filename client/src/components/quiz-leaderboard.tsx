import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Star, Clock, Zap } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  totalPoints: number;
  score: number;
  timeBonus: number;
  completedAt: Date | null;
}

export default function QuizLeaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/quiz/leaderboard"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return <Star className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2: return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3: return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200";
      default: return "bg-slate-50 border-slate-200";
    }
  };

  const formatTime = (completedAt: Date | null) => {
    if (!completedAt) return "N/A";
    
    const date = new Date(completedAt);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Daily Quiz Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-200 h-16 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Daily Quiz Leaderboard
        </CardTitle>
        <p className="text-sm text-slate-600">
          Top scorers for today's geopolitical intelligence quiz (resets daily)
        </p>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No quiz submissions yet today</p>
            <p className="text-xs text-slate-400 mt-1">Be the first to complete today's quiz!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry, index) => {
              const rank = index + 1;
              return (
                <div
                  key={`${entry.username}-${rank}`}
                  className={`p-4 rounded-lg border ${getRankColor(rank)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                        {rank <= 3 ? getRankIcon(rank) : (
                          <span className="text-sm font-bold text-slate-600">#{rank}</span>
                        )}
                      </div>
                      
                      <div>
                        <div className="font-semibold text-slate-900">
                          {entry.username}
                          {rank === 1 && (
                            <Badge className="ml-2 bg-yellow-500 text-white">
                              Champion
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{entry.score} correct answers</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(entry.completedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg text-purple-600">
                        {entry.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <span>{entry.score * 500} base</span>
                          {entry.timeBonus > 0 && (
                            <>
                              <span>+</span>
                              <Zap className="w-3 h-3 text-green-500" />
                              <span className="text-green-600">{entry.timeBonus}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {leaderboard.length > 0 && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Star className="w-4 h-4" />
              <span className="font-medium">Scoring System:</span>
            </div>
            <div className="text-xs text-blue-700 mt-1 space-y-1">
              <div>• 500 points per correct answer</div>
              <div>• Speed bonus: up to 300 points for fast completion</div>
              <div>• Leaderboard resets daily at midnight ET</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}