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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeConflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(conflict.severity)}
                  <h3 className="font-semibold text-sm">{conflict.name}</h3>
                </div>
                <Badge variant={getSeverityColor(conflict.severity) as any}>
                  {conflict.severity}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>{conflict.region}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{conflict.duration}</span>
                </div>
                
                {conflict.parties && conflict.parties.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium">Parties:</span>
                    <div className="flex gap-1">
                      {conflict.parties.slice(0, 3).map((party, index) => (
                        <FlagIcon key={index} countryCode={party} size="sm" />
                      ))}
                      {conflict.parties.length > 3 && (
                        <span className="text-xs text-slate-500">
                          +{conflict.parties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
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