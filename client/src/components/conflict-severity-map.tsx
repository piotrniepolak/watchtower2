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
                  style={{ backgroundColor: '#dbeafe' }}
                >
                  {/* Ocean background */}
                  <rect width="1000" height="500" fill="#dbeafe" />
                  
                  {/* Country territories with realistic shapes and conflict-based coloring */}
                  <g>
                    {/* North America */}
                    {/* United States */}
                    <path 
                      d="M80,180 L90,170 L100,165 L120,160 L140,165 L160,170 L180,175 L200,180 L220,185 L240,190 L260,195 L280,200 L300,205 L310,210 L315,220 L310,230 L300,240 L280,245 L260,250 L240,245 L220,240 L200,235 L180,230 L160,225 L140,220 L120,215 L100,210 L90,200 L85,190 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                    
                    {/* Canada */}
                    <path 
                      d="M80,80 L100,75 L120,70 L140,75 L160,80 L180,85 L200,90 L220,95 L240,100 L260,105 L280,110 L300,115 L320,120 L330,130 L325,140 L315,145 L300,150 L280,155 L260,150 L240,145 L220,140 L200,135 L180,130 L160,125 L140,120 L120,115 L100,110 L85,100 L80,90 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                    
                    {/* Mexico */}
                    <path 
                      d="M100,250 L140,245 L180,250 L220,255 L240,260 L250,270 L245,280 L235,285 L220,290 L200,285 L180,280 L160,275 L140,270 L120,265 L105,255 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                    
                    {/* South America */}
                    {/* Brazil */}
                    <path 
                      d="M220,320 L240,315 L260,320 L280,325 L300,330 L320,335 L330,345 L335,360 L330,375 L320,385 L300,390 L280,385 L260,380 L240,375 L225,365 L220,350 L218,335 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                    
                    {/* Argentina */}
                    <path 
                      d="M250,390 L270,385 L285,390 L290,405 L285,420 L270,425 L255,420 L250,405 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                    
                    {/* Europe */}
                    {/* Western Europe */}
                    <path 
                      d="M420,140 L440,135 L460,140 L470,150 L465,160 L455,165 L440,170 L425,165 L420,155 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                    
                    {/* Ukraine */}
                    <path 
                      d="M480,160 L500,155 L520,160 L540,165 L550,175 L545,185 L535,195 L520,200 L500,195 L485,185 L480,175 Z"
                      fill={getTerritoryColor('UA')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Ukraine'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Russia */}
                    <path 
                      d="M520,100 L580,95 L640,100 L700,105 L760,110 L800,115 L820,125 L815,140 L800,150 L780,160 L760,165 L740,170 L720,175 L700,180 L680,175 L660,170 L640,165 L620,160 L600,155 L580,150 L560,145 L540,140 L525,130 L520,115 Z"
                      fill={getTerritoryColor('RU')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Russia'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Middle East */}
                    {/* Syria */}
                    <path 
                      d="M520,220 L535,215 L545,225 L540,235 L525,240 L515,235 L515,225 Z"
                      fill={getTerritoryColor('SY')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Syria'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Israel/Palestine */}
                    <path 
                      d="M515,245 L525,240 L530,250 L525,260 L515,255 Z"
                      fill={getTerritoryColor('IL')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Gaza') || c.name.includes('Israel'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Yemen */}
                    <path 
                      d="M540,280 L560,275 L570,285 L565,295 L550,300 L540,290 Z"
                      fill={getTerritoryColor('YE')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Yemen'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Afghanistan */}
                    <path 
                      d="M620,220 L645,215 L660,225 L655,235 L645,245 L630,250 L620,240 L615,230 Z"
                      fill={getTerritoryColor('AF')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Afghanistan'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Africa */}
                    {/* Mali */}
                    <path 
                      d="M420,280 L445,275 L465,285 L460,300 L445,310 L430,305 L420,295 Z"
                      fill={getTerritoryColor('ML')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Mali'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Sudan */}
                    <path 
                      d="M500,300 L525,295 L540,305 L535,320 L520,330 L505,325 L500,315 Z"
                      fill={getTerritoryColor('SD')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Sudan'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Ethiopia */}
                    <path 
                      d="M550,310 L575,305 L590,320 L585,335 L570,340 L555,335 L550,325 Z"
                      fill={getTerritoryColor('ET')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Ethiopia') || c.name.includes('Tigray'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Other African countries */}
                    <path 
                      d="M400,240 L500,230 L580,250 L590,280 L580,320 L560,360 L540,380 L520,390 L480,395 L440,390 L420,370 L410,340 L405,310 L400,280 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                    
                    {/* Asia */}
                    {/* China */}
                    <path 
                      d="M660,180 L720,175 L780,185 L800,200 L795,220 L785,240 L770,250 L750,255 L730,250 L710,245 L690,240 L670,235 L660,220 L655,200 Z"
                      fill={getTerritoryColor('CN')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('China') || c.name.includes('South China Sea'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* India */}
                    <path 
                      d="M620,250 L660,245 L680,260 L690,280 L685,300 L670,315 L650,310 L630,300 L620,285 L615,270 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                    
                    {/* Myanmar */}
                    <path 
                      d="M720,270 L740,265 L750,275 L745,290 L730,295 L720,285 Z"
                      fill={getTerritoryColor('MM')}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Myanmar'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Southeast Asia */}
                    <path 
                      d="M720,300 L760,295 L780,305 L790,320 L785,335 L770,340 L750,335 L730,330 L720,320 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                    
                    {/* Australia */}
                    <path 
                      d="M700,380 L750,375 L800,385 L820,395 L815,410 L800,420 L770,425 L740,420 L720,410 L705,400 L700,390 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                    
                    {/* Japan */}
                    <path 
                      d="M820,220 L835,215 L845,225 L840,235 L825,240 L815,235 L815,225 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="1"
                      className="hover:opacity-80"
                    />
                  </g>
                  
                  {/* Country labels */}
                  <g fill="#374151" fontSize="10" fontFamily="Arial">
                    <text x="200" y="200" textAnchor="middle">USA</text>
                    <text x="200" y="120" textAnchor="middle">CANADA</text>
                    <text x="280" y="360" textAnchor="middle">BRAZIL</text>
                    <text x="450" y="155" textAnchor="middle">EUROPE</text>
                    <text x="515" y="180" textAnchor="middle">UKRAINE</text>
                    <text x="680" y="140" textAnchor="middle">RUSSIA</text>
                    <text x="730" y="220" textAnchor="middle">CHINA</text>
                    <text x="650" y="280" textAnchor="middle">INDIA</text>
                    <text x="760" y="400" textAnchor="middle">AUSTRALIA</text>
                    <text x="500" y="340" textAnchor="middle">AFRICA</text>
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