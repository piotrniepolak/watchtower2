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

  // Get territory color based on conflicts in that country
  const getTerritoryColor = (countryCode: string): string => {
    const countryConflicts = activeConflicts.filter(conflict => 
      getCountryCode(conflict.name) === countryCode
    );
    
    if (countryConflicts.length === 0) return '#e2e8f0'; // Default light grey
    
    // Find highest severity
    const severityOrder = ['critical', 'high', 'medium', 'low'];
    for (const severity of severityOrder) {
      if (countryConflicts.some(c => c.severity.toLowerCase() === severity)) {
        return getSeverityColor(severity) + '40'; // Add transparency
      }
    }
    return '#e2e8f0';
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
                {/* SVG World Map with Country Borders and Territory Coloring */}
                <svg 
                  viewBox="0 0 1000 500" 
                  className="w-full h-full"
                  style={{ backgroundColor: '#f8fafc' }}
                >
                  {/* Country territories with conflict-based coloring and borders */}
                  <g>
                    {/* Ukraine */}
                    <path 
                      d="M480,180 L520,170 L540,180 L550,200 L530,220 L500,215 L480,200 Z"
                      fill={getTerritoryColor('UA')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => getCountryCode(c.name) === 'UA');
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Russia */}
                    <path 
                      d="M520,120 L650,110 L780,120 L800,140 L780,180 L650,190 L520,170 Z"
                      fill={getTerritoryColor('RU')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80"
                    />
                    
                    {/* Israel/Palestine */}
                    <path 
                      d="M515,240 L525,235 L530,245 L525,255 L515,250 Z"
                      fill={getTerritoryColor('IL')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => getCountryCode(c.name) === 'IL');
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* China */}
                    <path 
                      d="M650,200 L750,190 L780,210 L770,250 L720,260 L680,240 L650,220 Z"
                      fill={getTerritoryColor('CN')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => getCountryCode(c.name) === 'CN');
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Mali */}
                    <path 
                      d="M420,280 L460,275 L470,295 L455,310 L430,305 L420,290 Z"
                      fill={getTerritoryColor('ML')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => getCountryCode(c.name) === 'ML');
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Yemen */}
                    <path 
                      d="M540,280 L565,275 L570,290 L560,300 L545,295 Z"
                      fill={getTerritoryColor('YE')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => getCountryCode(c.name) === 'YE');
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Syria */}
                    <path 
                      d="M520,220 L540,215 L545,230 L535,240 L520,235 Z"
                      fill={getTerritoryColor('SY')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => getCountryCode(c.name) === 'SY');
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Afghanistan */}
                    <path 
                      d="M620,230 L650,225 L660,240 L645,250 L625,245 Z"
                      fill={getTerritoryColor('AF')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => getCountryCode(c.name) === 'AF');
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Ethiopia */}
                    <path 
                      d="M550,300 L580,295 L590,315 L575,325 L555,320 Z"
                      fill={getTerritoryColor('ET')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => getCountryCode(c.name) === 'ET');
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Myanmar */}
                    <path 
                      d="M720,270 L740,265 L750,280 L740,290 L725,285 Z"
                      fill={getTerritoryColor('MM')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => getCountryCode(c.name) === 'MM');
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Sudan */}
                    <path 
                      d="M500,300 L530,295 L540,315 L525,325 L505,320 Z"
                      fill={getTerritoryColor('SD')}
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => getCountryCode(c.name) === 'SD');
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Other major countries with default coloring */}
                    {/* United States */}
                    <path 
                      d="M120,180 L280,160 L320,180 L300,220 L250,240 L180,230 L120,200 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80"
                    />
                    
                    {/* Canada */}
                    <path 
                      d="M120,100 L320,80 L350,120 L320,140 L280,135 L120,150 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80"
                    />
                    
                    {/* Brazil */}
                    <path 
                      d="M220,280 L320,270 L340,320 L320,370 L280,380 L240,360 L220,320 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80"
                    />
                    
                    {/* European countries */}
                    <path 
                      d="M400,160 L480,150 L500,170 L480,190 L450,195 L400,180 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80"
                    />
                    
                    {/* Africa */}
                    <path 
                      d="M420,240 L520,230 L560,270 L540,350 L480,370 L440,340 L420,280 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80"
                    />
                    
                    {/* India */}
                    <path 
                      d="M620,250 L680,245 L690,280 L675,300 L640,295 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80"
                    />
                    
                    {/* Australia */}
                    <path 
                      d="M700,380 L780,370 L800,390 L780,410 L720,420 L700,400 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1.5"
                      className="hover:opacity-80"
                    />
                  </g>
                </svg>
                
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
              <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-slate-600" />
                  Conflict Severity Levels
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: '#8B0000' }}
                      />
                      <span className="font-medium">Critical</span>
                    </div>
                    <span className="text-xs text-slate-500">Active warfare</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: '#DC143C' }}
                      />
                      <span className="font-medium">High</span>
                    </div>
                    <span className="text-xs text-slate-500">Escalating tensions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: '#FF8C00' }}
                      />
                      <span className="font-medium">Medium</span>
                    </div>
                    <span className="text-xs text-slate-500">Regional disputes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: '#FFD700' }}
                      />
                      <span className="font-medium">Low</span>
                    </div>
                    <span className="text-xs text-slate-500">Political unrest</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Click markers for detailed information
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