import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Info, AlertTriangle } from "lucide-react";
import type { Conflict } from "@shared/schema";

interface ConflictMapProps {
  className?: string;
}

// Conflict regions mapping for positioning markers on the map
const conflictRegions = {
  "Ukraine Conflict": { x: 52, y: 35 },
  "Israel-Palestine Conflict": { x: 51, y: 50 },
  "Taiwan Strait Tensions": { x: 75, y: 45 },
  "Kashmir Dispute": { x: 65, y: 45 },
  "Syrian Civil War": { x: 51, y: 48 },
  "Yemen Civil War": { x: 55, y: 55 },
  "South China Sea Dispute": { x: 73, y: 55 },
  "Armenia-Azerbaijan Conflict": { x: 54, y: 40 },
  "Mali Conflict": { x: 42, y: 55 },
  "Myanmar Civil War": { x: 70, y: 52 },
  "Ethiopia Tigray Conflict": { x: 55, y: 60 },
  "Libya Civil War": { x: 48, y: 52 },
  "Somalia Conflict": { x: 57, y: 62 }
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical": return "bg-red-600";
    case "high": return "bg-red-500";
    case "medium": return "bg-orange-500";
    case "low": return "bg-yellow-500";
    default: return "bg-gray-500";
  }
};

const getSeverityLabel = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical": return "Critical";
    case "high": return "High";
    case "medium": return "Medium";
    case "low": return "Low";
    default: return "Unknown";
  }
};

export default function ConflictSeverityMap({ className }: ConflictMapProps) {
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ["/api/conflicts"],
  });

  const activeConflicts = conflicts.filter((conflict: Conflict) => conflict.status === "active");

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Global Conflict Severity Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <div className="relative bg-blue-100 rounded-lg overflow-hidden border-2 border-slate-300 shadow-inner" style={{ aspectRatio: '2/1' }}>
                {/* Simple world map background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300">
                  {/* Continents as simple shapes */}
                  <svg className="w-full h-full opacity-60" viewBox="0 0 100 50">
                    {/* North America */}
                    <path d="M10,15 Q15,12 25,15 Q30,18 28,25 Q25,30 15,28 Q8,25 10,15" fill="#4ade80" />
                    {/* South America */}
                    <path d="M20,25 Q25,28 22,40 Q18,45 15,35 Q17,30 20,25" fill="#4ade80" />
                    {/* Europe */}
                    <path d="M45,15 Q55,12 52,20 Q48,25 45,20 Q43,17 45,15" fill="#4ade80" />
                    {/* Africa */}
                    <path d="M45,25 Q55,28 52,40 Q48,45 45,35 Q43,30 45,25" fill="#4ade80" />
                    {/* Asia */}
                    <path d="M55,10 Q75,8 85,15 Q88,25 80,30 Q70,32 60,28 Q52,20 55,10" fill="#4ade80" />
                    {/* Australia */}
                    <path d="M75,35 Q85,33 82,40 Q78,42 75,35" fill="#4ade80" />
                  </svg>
                </div>
                
                {/* Conflict Markers */}
                {activeConflicts.map((conflict: Conflict) => {
                  const position = conflictRegions[conflict.name as keyof typeof conflictRegions];
                  if (!position) return null;
                  
                  return (
                    <div
                      key={conflict.id}
                      className={`absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 animate-pulse ${getSeverityColor(conflict.severity)}`}
                      style={{ 
                        left: `${position.x}%`, 
                        top: `${position.y}%`,
                        boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                      }}
                      onClick={() => setSelectedConflict(conflict)}
                      title={`${conflict.name} - ${getSeverityLabel(conflict.severity)}`}
                    >
                      <div className={`absolute inset-0 rounded-full ${getSeverityColor(conflict.severity)} opacity-40 animate-ping`}></div>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span>Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Low</span>
                </div>
              </div>
            </div>

            {/* Conflict Details Panel */}
            <div className="space-y-4">
              {selectedConflict ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedConflict.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${getSeverityColor(selectedConflict.severity)} text-white`}>
                        {getSeverityLabel(selectedConflict.severity)}
                      </Badge>
                      <Badge variant="secondary">{selectedConflict.region}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedConflict.description}</p>
                    <div className="space-y-2 text-sm">
                      <div><strong>Started:</strong> {new Date(selectedConflict.startDate).toLocaleDateString()}</div>
                      <div><strong>Duration:</strong> {selectedConflict.duration}</div>
                      <div><strong>Status:</strong> {selectedConflict.status}</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedConflict(null)}
                      className="w-full"
                    >
                      Close Details
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Info className="h-4 w-4" />
                      Conflict Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Click on any conflict marker on the map to view detailed information about the situation.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Active Conflicts List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-4 w-4" />
                    Active Conflicts ({activeConflicts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeConflicts.map((conflict: Conflict) => (
                      <div
                        key={conflict.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => setSelectedConflict(conflict)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(conflict.severity)}`}></div>
                          <span className="text-sm font-medium">{conflict.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {conflict.region}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}