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
                {/* Static World Map with Political Borders */}
                <div className="relative w-full h-full">
                  {/* Background Image - World Map with Political Borders */}
                  <svg 
                    viewBox="0 0 1000 500" 
                    className="w-full h-full"
                    style={{ backgroundColor: '#dbeafe' }}
                  >
                    {/* Ocean background */}
                    <rect width="1000" height="500" fill="#dbeafe" />
                    
                    {/* Static country outlines with political borders */}
                    <g>
                      {/* North America */}
                      <path d="M60,180 L80,160 L120,155 L160,160 L200,165 L240,170 L280,175 L320,180 L340,190 L345,200 L340,210 L320,220 L280,225 L240,230 L200,235 L160,230 L120,225 L80,220 L60,200 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M60,80 L100,75 L140,80 L180,85 L220,90 L260,95 L300,100 L340,105 L360,115 L355,125 L340,135 L300,140 L260,135 L220,130 L180,125 L140,120 L100,115 L60,110 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M80,240 L120,235 L160,240 L200,245 L220,255 L215,265 L200,270 L160,265 L120,260 L80,255 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      
                      {/* South America */}
                      <path d="M240,300 L280,295 L320,305 L340,320 L350,340 L355,360 L350,380 L340,395 L320,405 L280,400 L240,385 L235,345 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M260,405 L280,400 L295,410 L300,430 L295,450 L280,455 L265,450 L260,430 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      
                      {/* Europe */}
                      <path d="M420,140 L460,135 L480,150 L475,165 L460,170 L420,165 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M480,150 L520,145 L560,155 L565,175 L560,190 L540,200 L520,195 L480,185 L475,170 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M560,90 L620,85 L680,90 L740,95 L800,100 L860,105 L900,110 L920,120 L915,135 L900,150 L860,160 L800,170 L740,175 L680,170 L620,165 L560,155 L545,125 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      
                      {/* Middle East */}
                      <path d="M500,190 L540,185 L560,195 L555,205 L540,210 L500,205 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M520,210 L540,205 L550,215 L545,225 L530,230 L520,225 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M515,230 L525,225 L530,235 L525,245 L515,240 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M530,245 L580,240 L600,260 L595,280 L580,290 L530,285 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M540,285 L580,280 L590,295 L585,305 L570,310 L540,305 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M580,200 L620,195 L640,210 L635,230 L620,240 L580,235 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M640,200 L680,195 L700,210 L695,230 L680,245 L640,240 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      
                      {/* Africa */}
                      <path d="M420,250 L460,245 L480,260 L475,275 L460,280 L420,275 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M460,245 L500,240 L520,255 L515,275 L500,285 L460,280 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M420,275 L460,270 L480,285 L475,300 L460,310 L420,305 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M460,280 L500,275 L520,290 L515,305 L500,315 L460,310 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M520,275 L560,270 L580,285 L575,305 L560,315 L520,310 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M560,270 L600,265 L620,280 L615,305 L600,320 L560,315 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M600,320 L640,315 L660,330 L655,350 L640,360 L600,355 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M460,310 L500,305 L520,320 L515,335 L500,345 L460,340 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M500,345 L540,340 L560,355 L555,375 L540,385 L500,380 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M520,400 L560,395 L580,410 L575,425 L560,435 L520,430 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      
                      {/* Asia */}
                      <path d="M700,160 L760,155 L820,165 L860,175 L880,190 L875,210 L860,230 L820,245 L760,250 L700,240 L680,220 L685,190 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M660,250 L700,245 L720,260 L730,280 L725,300 L700,315 L660,310 L640,295 L645,275 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M720,280 L740,275 L755,290 L750,305 L735,315 L720,310 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M740,305 L760,300 L775,315 L770,330 L755,340 L740,335 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M775,285 L790,280 L805,295 L800,315 L785,330 L775,325 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M760,340 L800,335 L830,350 L825,365 L800,375 L760,370 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M880,200 L900,195 L915,210 L910,225 L895,235 L880,230 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                      <path d="M760,390 L820,385 L860,400 L880,415 L875,435 L860,450 L820,455 L760,450 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.5"/>
                    </g>
                  </svg>
                  
                  {/* Interactive SVG Overlays for Conflict Zones */}
                  <svg 
                    viewBox="0 0 1000 500" 
                    className="absolute inset-0 w-full h-full"
                    style={{ pointerEvents: 'none' }}
                  >
                    <defs>
                      <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    
                    <g style={{ pointerEvents: 'auto' }}>
                      {/* Ukraine - exactly following background borders */}
                      <path 
                        d="M480,150 L520,145 L560,155 L565,175 L560,190 L540,200 L520,195 L480,185 L475,170 Z"
                        fill={getTerritoryColor('UA')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                      
                      {/* Russia - exactly following background borders */}
                      <path 
                        d="M560,90 L620,85 L680,90 L740,95 L800,100 L860,105 L900,110 L920,120 L915,135 L900,150 L860,160 L800,170 L740,175 L680,170 L620,165 L560,155 L545,125 Z"
                        fill={getTerritoryColor('RU')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                      
                      {/* Syria - exactly following background borders */}
                      <path 
                        d="M520,210 L540,205 L550,215 L545,225 L530,230 L520,225 Z"
                        fill={getTerritoryColor('SY')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                      
                      {/* Israel/Palestine - exactly following background borders */}
                      <path 
                        d="M515,230 L525,225 L530,235 L525,245 L515,240 Z"
                        fill={getTerritoryColor('IL')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                      
                      {/* Yemen - exactly following background borders */}
                      <path 
                        d="M540,285 L580,280 L590,295 L585,305 L570,310 L540,305 Z"
                        fill={getTerritoryColor('YE')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                      
                      {/* Afghanistan - exactly following background borders */}
                      <path 
                        d="M640,200 L680,195 L700,210 L695,230 L680,245 L640,240 Z"
                        fill={getTerritoryColor('AF')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                      
                      {/* Mali - exactly following background borders */}
                      <path 
                        d="M420,275 L460,270 L480,285 L475,300 L460,310 L420,305 Z"
                        fill={getTerritoryColor('ML')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                      
                      {/* Sudan - exactly following background borders */}
                      <path 
                        d="M560,270 L600,265 L620,280 L615,305 L600,320 L560,315 Z"
                        fill={getTerritoryColor('SD')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                      
                      {/* Ethiopia - exactly following background borders */}
                      <path 
                        d="M600,320 L640,315 L660,330 L655,350 L640,360 L600,355 Z"
                        fill={getTerritoryColor('ET')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                      
                      {/* China - exactly following background borders */}
                      <path 
                        d="M700,160 L760,155 L820,165 L860,175 L880,190 L875,210 L860,230 L820,245 L760,250 L700,240 L680,220 L685,190 Z"
                        fill={getTerritoryColor('CN')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                      
                      {/* Myanmar - exactly following background borders */}
                      <path 
                        d="M720,280 L740,275 L755,290 L750,305 L735,315 L720,310 Z"
                        fill={getTerritoryColor('MM')}
                        fillOpacity="0.7"
                        stroke="#1e293b"
                        strokeWidth="2"
                        className="hover:drop-shadow-lg cursor-pointer transition-all duration-200"
                        style={{ filter: 'url(#dropShadow)', transformOrigin: 'center' }}
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
                </div>
                
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