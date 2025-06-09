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
                {/* Static World Map Background */}
                <img 
                  src={worldMapPath} 
                  alt="World Map" 
                  className="w-full h-full object-cover"
                />
                
                {/* SVG Overlay for Interactive Elements */}
                <svg 
                  viewBox="0 0 1000 500" 
                  className="absolute inset-0 w-full h-full"
                  style={{ pointerEvents: 'none' }}
                >
                  <defs>
                    {/* Drop shadow filter */}
                    <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  
                  {/* Interactive Country Overlays */}
                  <g style={{ pointerEvents: 'auto' }}>
                    {/* Ukraine - positioned over real Ukraine on map */}
                    <path 
                      d="M480,150 L510,145 L540,155 L545,170 L540,185 L525,195 L500,190 L480,180 L475,165 Z"
                      fill={getTerritoryColor('UA')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Ukraine'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Russia - positioned over real Russia on map */}
                    <path 
                      d="M540,100 L600,95 L660,100 L720,105 L780,110 L840,115 L880,125 L875,140 L860,155 L840,165 L820,170 L800,175 L780,180 L760,185 L740,190 L720,185 L700,180 L680,175 L660,170 L640,165 L620,160 L600,155 L580,150 L560,145 L545,135 L540,120 Z"
                      fill={getTerritoryColor('RU')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Russia'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Syria - positioned over real Syria on map */}
                    <path 
                      d="M510,200 L525,195 L535,205 L530,215 L515,220 L505,215 L505,205 Z"
                      fill={getTerritoryColor('SY')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Syria'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Israel/Palestine - positioned over real Israel/Palestine on map */}
                    <path 
                      d="M505,220 L515,215 L520,225 L515,235 L505,230 Z"
                      fill={getTerritoryColor('IL')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Gaza') || c.name.includes('Israel'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Yemen - positioned over real Yemen on map */}
                    <path 
                      d="M530,275 L560,270 L570,285 L565,295 L550,300 L535,295 L530,285 Z"
                      fill={getTerritoryColor('YE')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Yemen'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Afghanistan - positioned over real Afghanistan on map */}
                    <path 
                      d="M620,200 L650,195 L670,205 L665,220 L655,235 L640,240 L625,235 L620,220 Z"
                      fill={getTerritoryColor('AF')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Afghanistan'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Mali - positioned over real Mali on map */}
                    <path 
                      d="M410,270 L440,265 L460,275 L455,290 L440,300 L420,295 L410,285 Z"
                      fill={getTerritoryColor('ML')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Mali'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Sudan - positioned over real Sudan on map */}
                    <path 
                      d="M510,270 L540,265 L555,280 L550,300 L535,310 L520,305 L510,290 Z"
                      fill={getTerritoryColor('SD')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Sudan'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Ethiopia - positioned over real Ethiopia on map */}
                    <path 
                      d="M555,300 L580,295 L595,310 L590,325 L575,335 L560,330 L555,315 Z"
                      fill={getTerritoryColor('ET')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Ethiopia') || c.name.includes('Tigray'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* China - positioned over real China on map */}
                    <path 
                      d="M670,160 L730,155 L790,165 L830,175 L850,190 L845,210 L835,230 L820,245 L800,255 L780,260 L760,255 L740,250 L720,245 L700,240 L680,235 L670,220 L665,200 L670,180 Z"
                      fill={getTerritoryColor('CN')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('China') || c.name.includes('South China Sea'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    
                    {/* Myanmar - positioned over real Myanmar on map */}
                    <path 
                      d="M700,270 L720,265 L735,280 L730,295 L715,305 L705,300 L700,285 Z"
                      fill={getTerritoryColor('MM')}
                      fillOpacity="0.6"
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:drop-shadow-lg hover:filter hover:brightness-110 cursor-pointer transition-all duration-200"
                      style={{ filter: 'url(#dropShadow)' }}
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Myanmar'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'url(#dropShadow)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
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