import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, AlertTriangle, Zap, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

const cleanEventDescription = (description: string) => {
  // Remove all formatting markers and clean up text thoroughly
  let cleaned = description
    .replace(/^\*+/g, '') // Remove leading asterisks
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/##\s*/g, '') // Remove markdown headers
    .replace(/Title:\s*/g, '')
    .replace(/Description:\s*/g, '')
    .replace(/\(Source:.*?\)$/g, '') // Remove source citations at end
    .replace(/\[Source:.*?\]$/g, '') // Remove bracketed sources
    .replace(/Source:.*$/gm, '') // Remove source lines
    .replace(/Severity:.*$/gm, '') // Remove severity lines
    .replace(/- \*\*\d{4}-\d{2}-\d{2}.*?\*\*.*?-/g, '') // Remove date headers
    .replace(/^\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/gm, '') // Remove standalone timestamps
    .replace(/Russia conflict based on available news.*?:/gi, '') // Remove boilerplate text
    .replace(/Military Operations and Battlefield Updates/gi, '') // Remove section headers
    .replace(/\n+/g, ' ') // Replace multiple newlines with space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^[^a-zA-Z]*/, '') // Remove non-letter characters from start
    .trim();
  
  // If description is empty or too short, provide a fallback
  if (cleaned.length < 10) {
    cleaned = "Military activity reported in the region";
  }
  
  return cleaned;
};

const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return { text, isTruncated: false };
  
  // Try to break at first sentence if it's reasonable length
  const sentences = text.split(/[.!?]+/);
  if (sentences.length > 1 && sentences[0].length > 40 && sentences[0].length <= maxLength) {
    return { text: sentences[0].trim() + '.', isTruncated: true };
  }
  
  // Otherwise find last complete word within limit
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  const finalText = lastSpaceIndex > maxLength * 0.7 ? truncated.substring(0, lastSpaceIndex) : truncated;
  
  return { text: finalText + '...', isTruncated: true };
};

export function ConflictTimeline({ conflictId, conflictName }: ConflictTimelineProps) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const toggleExpanded = (eventId: number) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const { data: timeline = [], isLoading } = useQuery<TimelineEvent[]>({
    queryKey: [`/api/conflicts/${conflictId}/timeline`],
    refetchInterval: 60000, // Refetch every minute
  });

  const updateTimelineMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/conflicts/${conflictId}/update-timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update timeline' }));
        throw new Error(errorData.error || 'Failed to update timeline');
      }
      return response.json();
    },
    onMutate: () => {
      setIsUpdating(true);
      toast({
        title: "Updating Timeline",
        description: `Fetching latest intelligence for ${conflictName}...`,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/conflicts/${conflictId}/timeline`] });
      toast({
        title: "Timeline Updated",
        description: `Added ${data.eventsAdded || 0} new events from intelligence sources`,
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Unable to fetch latest timeline data",
        variant: "destructive",
      });
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

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const eventDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(eventDate.getTime())) {
      return "Unknown time";
    }
    
    const diffInMinutes = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };



  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
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
      
      <CardContent className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : !timeline || timeline.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent timeline events</p>
            <p className="text-xs mt-1">
              Click "Update" to fetch the latest developments
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="relative px-4 pb-4">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-4">
              {(timeline as TimelineEvent[]).map((event: TimelineEvent, index: number) => (
                <div key={event.id} className="relative flex gap-3">
                  {/* Timeline dot */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1
                    ${getSeverityColor(event.severity) === 'destructive' ? 'bg-red-100 border-red-500 text-red-700' :
                      getSeverityColor(event.severity) === 'secondary' ? 'bg-orange-100 border-orange-500 text-orange-700' :
                      getSeverityColor(event.severity) === 'outline' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
                      'bg-blue-100 border-blue-500 text-blue-700'}
                  `}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(event.severity)} className="text-xs px-1.5 py-0.5 font-medium h-5">
                        Level {event.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatTimeAgo(event.eventDate)}
                      </span>
                    </div>
                    
                    <div className="bg-muted/10 rounded-md p-2.5 border border-border/30">
                      {(() => {
                        const cleanedDescription = cleanEventDescription(event.eventDescription);
                        const { text, isTruncated } = truncateText(cleanedDescription, 120);
                        const isExpanded = expandedEvents.has(event.id);
                        const displayText = isExpanded ? cleanedDescription : text;
                        
                        return (
                          <div>
                            <p className="text-sm text-foreground leading-relaxed">
                              {displayText}
                            </p>
                            {isTruncated && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(event.id)}
                                className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-3 h-3 mr-1" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3 mr-1" />
                                    Read more
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        );
                      })()}
                      
                      {event.stockMovement !== 0 && (
                        <div className="mt-1 pt-1 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">Market: </span>
                          <span className={`text-xs font-medium ${event.stockMovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {event.stockMovement > 0 ? '+' : ''}{event.stockMovement}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        )}
        
        {timeline && timeline.length > 0 && (
          <div className="px-4 py-2 border-t bg-muted/5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Powered by Perplexity AI</span>
              <span>Auto-refreshes every minute</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}