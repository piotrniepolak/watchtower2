import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, AlertTriangle, Zap, RefreshCw, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TimelineEvent {
  id: number;
  conflictId: number | null;
  eventDate: Date;
  eventDescription: string;
  stockMovement: number;
  severity: number;
}

interface ConflictTimelineProps {
  conflictId: number;
  conflictName: string;
}

export function ConflictTimeline({ conflictId, conflictName }: ConflictTimelineProps) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: timeline = [], isLoading } = useQuery({
    queryKey: [`/api/conflicts/${conflictId}/timeline`],
    refetchInterval: 60000, // Refetch every minute
  });

  const updateTimelineMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/conflicts/${conflictId}/update-timeline`, {
        method: 'POST',
      });
    },
    onMutate: () => {
      setIsUpdating(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conflicts/${conflictId}/timeline`] });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return "destructive";
    if (severity >= 6) return "secondary";
    if (severity >= 4) return "outline";
    return "default";
  };

  const getSeverityIcon = (severity: number) => {
    if (severity >= 8) return <AlertTriangle className="w-4 h-4" />;
    if (severity >= 6) return <Zap className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Real-Time Timeline
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTimelineMutation.mutate()}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            Update
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Latest developments in {conflictName} powered by AI research
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : timeline.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent timeline events</p>
            <p className="text-xs mt-1">
              Click "Update" to fetch the latest developments
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            
            <div className="space-y-6">
              {timeline.map((event: TimelineEvent, index: number) => (
                <div key={event.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 
                    ${getSeverityColor(event.severity) === 'destructive' ? 'bg-red-100 border-red-500 text-red-700' :
                      getSeverityColor(event.severity) === 'secondary' ? 'bg-orange-100 border-orange-500 text-orange-700' :
                      getSeverityColor(event.severity) === 'outline' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
                      'bg-blue-100 border-blue-500 text-blue-700'}
                  `}>
                    {getSeverityIcon(event.severity)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant={getSeverityColor(event.severity)} className="shrink-0">
                        Severity {event.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTimeAgo(event.eventDate)}
                      </span>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-3">
                      <p className="text-sm leading-relaxed">
                        {event.eventDescription}
                      </p>
                      
                      {event.stockMovement !== 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Market Impact:</span>
                            <span className={event.stockMovement > 0 ? 'text-green-600' : 'text-red-600'}>
                              {event.stockMovement > 0 ? '+' : ''}{event.stockMovement}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {timeline.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Powered by Perplexity AI</span>
              <span>Auto-refreshes every minute</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}