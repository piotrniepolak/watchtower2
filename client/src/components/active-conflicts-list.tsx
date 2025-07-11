import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, MapPin } from "lucide-react";
import FlagIcon from "@/components/flag-icon";
import type { Conflict } from "@shared/schema";

export default function ActiveConflictsList() {
  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ['/api/conflicts'],
  });

  // Filter to show only active conflicts
  const activeConflicts = conflicts.filter(conflict => conflict.status === "Active");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Critical": return <AlertTriangle className="h-4 w-4 text-red-800" style={{ color: '#dc143c' }} />;
      case "High": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "Medium": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "Low": return <AlertTriangle className="h-4 w-4 text-green-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Active Global Conflicts ({activeConflicts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {activeConflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="border rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-w-0"
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(conflict.severity)}
                  </div>
                  <h3 className="font-medium text-sm leading-tight break-words min-w-0">
                    {conflict.name}
                  </h3>
                </div>
                <Badge 
                  variant={getSeverityColor(conflict.severity) as any}
                  className={`flex-shrink-0 text-xs ${conflict.severity.toLowerCase() === 'critical' ? 'critical-severity-badge' : ''}`}
                >
                  {conflict.severity}
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{conflict.region}</span>
                  <span className="text-slate-400">•</span>
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{conflict.duration}</span>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {conflict.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {activeConflicts.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active conflicts found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}