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
                {/* SVG World Map with Accurate Geography and Country Borders */}
                <svg 
                  viewBox="0 0 1000 500" 
                  className="w-full h-full"
                  style={{ backgroundColor: '#bfdbfe' }}
                >
                  {/* Ocean background */}
                  <rect width="1000" height="500" fill="#bfdbfe" />
                  
                  {/* Country territories with geographically accurate shapes */}
                  <g>
                    {/* North America */}
                    {/* United States - continental */}
                    <path 
                      d="M50,160 L60,140 L80,135 L120,130 L160,135 L180,140 L220,145 L260,150 L300,155 L320,165 L325,175 L330,185 L325,195 L315,205 L300,215 L280,220 L250,225 L220,230 L180,235 L140,230 L100,225 L70,220 L50,210 L45,190 L48,175 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Alaska */}
                    <path 
                      d="M25,120 L50,115 L65,120 L70,135 L65,145 L50,150 L35,145 L25,135 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Canada */}
                    <path 
                      d="M50,60 L80,55 L120,50 L160,55 L200,60 L240,65 L280,70 L320,75 L350,85 L360,95 L355,105 L345,115 L320,125 L280,120 L240,115 L200,110 L160,105 L120,100 L80,105 L50,100 L40,90 L45,75 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Mexico */}
                    <path 
                      d="M80,240 L120,235 L160,240 L200,245 L220,255 L215,265 L200,270 L180,275 L150,270 L120,265 L90,260 L80,250 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Central America */}
                    <path 
                      d="M200,270 L220,275 L235,285 L230,295 L220,300 L210,295 L200,285 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* South America */}
                    {/* Brazil */}
                    <path 
                      d="M240,300 L280,295 L320,305 L340,320 L350,340 L355,360 L350,380 L340,395 L320,405 L300,410 L280,405 L260,400 L245,385 L240,365 L238,345 L240,325 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Argentina */}
                    <path 
                      d="M260,405 L280,400 L295,410 L300,430 L295,450 L280,455 L265,450 L260,430 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Chile */}
                    <path 
                      d="M250,400 L265,405 L268,425 L265,445 L260,460 L255,445 L252,425 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Europe */}
                    {/* United Kingdom */}
                    <path 
                      d="M410,120 L425,115 L430,125 L425,135 L415,140 L405,135 L405,125 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* France */}
                    <path 
                      d="M420,140 L440,135 L455,145 L450,160 L435,165 L420,160 L415,150 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Germany */}
                    <path 
                      d="M440,125 L460,120 L475,130 L470,145 L455,150 L440,145 L435,135 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Ukraine */}
                    <path 
                      d="M500,140 L530,135 L560,145 L565,160 L560,175 L545,185 L520,180 L500,170 L495,155 Z"
                      fill={getTerritoryColor('UA')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Ukraine'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Russia */}
                    <path 
                      d="M560,80 L620,75 L680,80 L740,85 L800,90 L860,95 L900,100 L920,110 L915,125 L900,135 L880,145 L860,150 L840,155 L820,160 L800,165 L780,170 L760,175 L740,180 L720,175 L700,170 L680,165 L660,160 L640,155 L620,150 L600,145 L580,140 L565,130 L560,115 L555,100 Z"
                      fill={getTerritoryColor('RU')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Russia'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Middle East */}
                    {/* Turkey */}
                    <path 
                      d="M490,180 L520,175 L545,185 L540,195 L520,200 L500,195 L485,185 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Syria */}
                    <path 
                      d="M520,200 L535,195 L545,205 L540,215 L525,220 L515,215 L515,205 Z"
                      fill={getTerritoryColor('SY')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Syria'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Israel/Palestine */}
                    <path 
                      d="M515,220 L525,215 L530,225 L525,235 L515,230 Z"
                      fill={getTerritoryColor('IL')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Gaza') || c.name.includes('Israel'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Iraq */}
                    <path 
                      d="M545,205 L565,200 L580,210 L575,225 L560,230 L545,225 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Iran */}
                    <path 
                      d="M580,200 L610,195 L630,205 L625,220 L610,230 L590,225 L580,215 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Saudi Arabia */}
                    <path 
                      d="M530,235 L570,230 L590,250 L585,270 L570,280 L540,275 L530,255 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Yemen */}
                    <path 
                      d="M540,275 L570,270 L580,285 L575,295 L560,300 L545,295 L540,285 Z"
                      fill={getTerritoryColor('YE')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Yemen'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Afghanistan */}
                    <path 
                      d="M630,200 L660,195 L680,205 L675,220 L665,235 L650,240 L635,235 L630,220 Z"
                      fill={getTerritoryColor('AF')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Afghanistan'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Africa */}
                    {/* Egypt */}
                    <path 
                      d="M500,235 L530,230 L540,250 L535,265 L520,270 L505,265 L500,250 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Libya */}
                    <path 
                      d="M470,240 L500,235 L510,255 L505,270 L485,275 L470,270 L465,255 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Mali */}
                    <path 
                      d="M420,270 L450,265 L470,275 L465,290 L450,300 L430,295 L420,285 Z"
                      fill={getTerritoryColor('ML')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Mali'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Nigeria */}
                    <path 
                      d="M450,300 L480,295 L490,310 L485,320 L470,325 L455,320 L450,310 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Sudan */}
                    <path 
                      d="M520,270 L550,265 L565,280 L560,300 L545,310 L530,305 L520,290 Z"
                      fill={getTerritoryColor('SD')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Sudan'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Ethiopia */}
                    <path 
                      d="M565,300 L590,295 L605,310 L600,325 L585,335 L570,330 L565,315 Z"
                      fill={getTerritoryColor('ET')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Ethiopia') || c.name.includes('Tigray'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Kenya */}
                    <path 
                      d="M585,330 L605,325 L615,340 L610,350 L595,355 L585,350 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* DRC */}
                    <path 
                      d="M490,330 L530,325 L550,340 L545,360 L525,370 L505,365 L490,350 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* South Africa */}
                    <path 
                      d="M510,380 L540,375 L560,390 L555,405 L540,410 L520,405 L510,395 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Asia */}
                    {/* China */}
                    <path 
                      d="M680,160 L740,155 L800,165 L840,175 L860,190 L855,210 L845,230 L830,245 L810,255 L790,260 L770,255 L750,250 L730,245 L710,240 L690,235 L680,220 L675,200 L680,180 Z"
                      fill={getTerritoryColor('CN')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('China') || c.name.includes('South China Sea'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* India */}
                    <path 
                      d="M640,240 L680,235 L700,250 L710,270 L705,290 L690,305 L670,315 L650,310 L635,295 L630,275 L635,255 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Myanmar */}
                    <path 
                      d="M710,270 L730,265 L745,280 L740,295 L725,305 L715,300 L710,285 Z"
                      fill={getTerritoryColor('MM')}
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      className="hover:opacity-80 cursor-pointer"
                      onClick={() => {
                        const conflict = activeConflicts.find(c => c.name.includes('Myanmar'));
                        if (conflict) setSelectedConflict(conflict);
                      }}
                    />
                    
                    {/* Thailand */}
                    <path 
                      d="M725,305 L745,300 L755,315 L750,330 L735,335 L725,330 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Vietnam */}
                    <path 
                      d="M755,280 L770,275 L780,290 L775,310 L765,325 L755,320 L750,305 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Indonesia */}
                    <path 
                      d="M750,335 L780,330 L810,340 L820,355 L815,365 L795,370 L775,365 L755,360 L750,345 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Japan */}
                    <path 
                      d="M860,200 L875,195 L885,205 L880,220 L870,225 L860,220 L855,210 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* South Korea */}
                    <path 
                      d="M840,220 L850,215 L855,225 L850,235 L840,230 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* Australia */}
                    <path 
                      d="M750,390 L800,385 L840,395 L870,405 L885,420 L880,440 L865,450 L840,455 L810,450 L780,445 L760,440 L750,425 L745,410 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
                      className="hover:opacity-80"
                    />
                    
                    {/* New Zealand */}
                    <path 
                      d="M890,450 L905,445 L910,455 L905,465 L890,460 Z"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="0.8"
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