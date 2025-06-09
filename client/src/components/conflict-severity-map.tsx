import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Info, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocalWatchlist } from "@/hooks/useLocalWatchlist";
import FlagIcon from "@/components/flag-icon";
import type { Conflict } from "@shared/schema";
import worldMapPath from "@assets/world-map-306338_1280.png";

interface ConflictMapProps {
  className?: string;
}

export default function ConflictSeverityMap({ className }: ConflictMapProps) {
  const { isAuthenticated } = useAuth();
  const watchlist = useLocalWatchlist();
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  const { data: conflicts = [] } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  // Regional conflict mapping based on known conflict locations
  const conflictRegions = {
    "Ukraine-Russia": { x: 55, y: 30, region: "Eastern Europe" },
    "Israel-Gaza": { x: 52, y: 47, region: "Middle East" },
    "South China Sea Dispute": { x: 75, y: 52, region: "Southeast Asia" },
    "Mali Crisis": { x: 45, y: 55, region: "West Africa" },
    "Yemen Civil War": { x: 54, y: 55, region: "Middle East" },
    "Syria Conflict": { x: 52, y: 45, region: "Middle East" },
    "Afghanistan Instability": { x: 62, y: 45, region: "Central Asia" },
    "Ethiopia Tigray": { x: 55, y: 60, region: "East Africa" }
  };

  // Country code mapping for flag display
  const getCountryCode = (conflictName: string): string => {
    const mapping: { [key: string]: string } = {
      "Ukraine-Russia Conflict": "UA",
      "Israel-Gaza Conflict": "IL", 
      "South China Sea Dispute": "CN",
      "Mali Crisis": "ML",
      "Yemen Civil War": "YE",
      "Syria Conflict": "SY",
      "Afghanistan Instability": "AF",
      "Ethiopia Tigray Conflict": "ET",
      "Myanmar Civil War": "MM",
      "Sudan Crisis": "SD",
      "Haiti Gang Violence": "HT",
      "Kashmir Dispute": "IN",
      "Taiwan Strait Tensions": "TW"
    };
    return mapping[conflictName] || "XX";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#8B0000'; // Dark red
      case 'high': return '#DC143C';     // Crimson red
      case 'medium': return '#FF8C00';   // Dark orange
      case 'low': return '#FFD700';      // Gold
      default: return '#808080';         // Grey
    }
  };

  const getSeveritySize = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 16;
      case 'high': return 14;
      case 'medium': return 12;
      case 'low': return 10;
      default: return 8;
    }
  };

  const activeConflicts = (conflicts as Conflict[]).filter(conflict => 
    conflict.status === 'Active'
  );

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Global Conflict Severity Map
            </div>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Interactive map showing current conflicts with severity-based color coding
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <div className="relative bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-300 shadow-inner" style={{ aspectRatio: '2/1' }}>
                <img 
                  src={worldMapPath} 
                  alt="World Map" 
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Map overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-slate-100/30 pointer-events-none"></div>
                
                {/* Conflict Markers */}
                {activeConflicts.map((conflict) => {
                  const position = conflictRegions[conflict.name as keyof typeof conflictRegions];
                  if (!position) return null;
                  
                  return (
                    <div
                      key={conflict.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                      }}
                      onClick={() => setSelectedConflict(conflict)}
                    >
                      <div
                        className="rounded-full border-2 border-white shadow-lg flex items-center justify-center relative"
                        style={{
                          backgroundColor: getSeverityColor(conflict.severity),
                          width: `${getSeveritySize(conflict.severity)}px`,
                          height: `${getSeveritySize(conflict.severity)}px`,
                          boxShadow: `0 0 0 2px ${getSeverityColor(conflict.severity)}40`,
                        }}
                      >
                        <AlertTriangle className="h-3 w-3 text-white drop-shadow-sm" />
                        {/* Pulse animation ring */}
                        <div 
                          className="absolute rounded-full border-2 animate-ping"
                          style={{
                            borderColor: getSeverityColor(conflict.severity),
                            width: `${getSeveritySize(conflict.severity) + 8}px`,
                            height: `${getSeveritySize(conflict.severity) + 8}px`,
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-3">Severity Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: '#8B0000' }}
                    />
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: '#DC143C' }}
                    />
                    <span>High</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: '#FF8C00' }}
                    />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: '#FFD700' }}
                    />
                    <span>Low</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: '#808080' }}
                    />
                    <span>None</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conflict Details Panel */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3">Active Conflicts ({activeConflicts.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeConflicts.map((conflict) => (
                    <div 
                      key={conflict.id}
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        selectedConflict?.id === conflict.id 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'bg-white hover:bg-slate-100'
                      }`}
                      onClick={() => setSelectedConflict(conflict)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FlagIcon countryCode={getCountryCode(conflict.name)} size="sm" />
                          <span className="font-medium text-sm truncate">{conflict.name}</span>
                        </div>
                        <Badge 
                          variant={
                            conflict.severity === 'Critical' || conflict.severity === 'High'
                              ? 'destructive'
                              : conflict.severity === 'Medium'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-xs"
                        >
                          {conflict.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{conflict.region}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Conflict Details */}
              {selectedConflict && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FlagIcon countryCode={getCountryCode(selectedConflict.name)} size="md" />
                        <span>{selectedConflict.name}</span>
                      </div>
                      {isAuthenticated && (
                        <Button
                          variant={watchlist.isConflictWatched(selectedConflict.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (watchlist.isConflictWatched(selectedConflict.id)) {
                              watchlist.removeFromConflictWatchlist(selectedConflict.id);
                            } else {
                              watchlist.addToConflictWatchlist(selectedConflict.id);
                            }
                          }}
                        >
                          {watchlist.isConflictWatched(selectedConflict.id) ? "Remove" : "Watch"}
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-slate-600">Region:</span>
                      <p className="text-sm">{selectedConflict.region}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Duration:</span>
                      <p className="text-sm">{selectedConflict.duration}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Status:</span>
                      <div className="mt-1">
                        <Badge variant={selectedConflict.status === 'Active' ? 'destructive' : 'outline'}>
                          {selectedConflict.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-600">Severity:</span>
                      <div className="mt-1">
                        <Badge 
                          variant={
                            selectedConflict.severity === 'Critical' || selectedConflict.severity === 'High'
                              ? 'destructive'
                              : selectedConflict.severity === 'Medium'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {selectedConflict.severity}
                        </Badge>
                      </div>
                    </div>
                    {selectedConflict.description && (
                      <div>
                        <span className="text-sm font-medium text-slate-600">Description:</span>
                        <p className="text-sm mt-1">{selectedConflict.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {!selectedConflict && (
                <div className="text-center py-8 text-slate-500">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click on a conflict marker to view details</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}