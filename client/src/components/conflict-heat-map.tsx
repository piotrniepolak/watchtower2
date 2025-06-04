import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Activity, MapPin, Clock } from "lucide-react";
import FlagIcon from "@/components/flag-icon";
import worldMapImage from "@assets/world-map-306338_1280.png";
import type { Conflict } from "@shared/schema";

interface RegionData {
  name: string;
  conflicts: Conflict[];
  intensity: "low" | "medium" | "high" | "critical";
  totalCasualties: number;
  activeConflicts: number;
  coordinates: { x: number; y: number; width: number; height: number };
}

export default function ConflictHeatMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const { data: conflicts } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  // Process conflicts into regional data
  const getRegionalData = (): RegionData[] => {
    const conflictArray = conflicts as Conflict[] | undefined;
    if (!conflictArray || conflictArray.length === 0) return [];

    const regionMap = new Map<string, Conflict[]>();
    
    // Only include active conflicts in the heat map
    conflictArray.filter(conflict => conflict.status === "Active").forEach((conflict: Conflict) => {
      const region = conflict.region;
      if (!regionMap.has(region)) {
        regionMap.set(region, []);
      }
      regionMap.get(region)!.push(conflict);
    });

    return Array.from(regionMap.entries()).map(([regionName, regionConflicts]) => {
      const activeConflicts = regionConflicts.filter(c => c.status === "Active").length;
      const highSeverityCount = regionConflicts.filter(c => c.severity === "High").length;
      
      let intensity: "low" | "medium" | "high" | "critical" = "low";
      if (highSeverityCount >= 3) intensity = "critical";
      else if (highSeverityCount >= 2) intensity = "high";
      else if (activeConflicts >= 2) intensity = "medium";

      // Define region coordinates on world map
      const coordinates = getRegionCoordinates(regionName);
      
      return {
        name: regionName,
        conflicts: regionConflicts,
        intensity,
        totalCasualties: regionConflicts.length * 50000, // Estimated
        activeConflicts,
        coordinates
      };
    });
  };

  const getRegionCoordinates = (regionName: string) => {
    // Coordinates adjusted for accurate positioning on the 1280x720 world map
    const mapPadding = { left: 40, right: 40, top: 60, bottom: 80 };
    const coords = {
      "Eastern Europe": { x: 520, y: 140, width: 90, height: 70 },
      "Middle East": { x: 560, y: 230, width: 90, height: 80 },
      "West Africa": { x: 440, y: 290, width: 70, height: 90 },
      "East Africa": { x: 560, y: 320, width: 60, height: 100 },
      "Central Africa": { x: 500, y: 330, width: 70, height: 70 },
      "Horn of Africa": { x: 600, y: 340, width: 50, height: 70 },
      "South Asia": { x: 680, y: 250, width: 80, height: 70 },
      "East Asia": { x: 750, y: 170, width: 90, height: 90 },
      "Southeast Asia": { x: 770, y: 290, width: 80, height: 60 },
      "Central Asia": { x: 630, y: 190, width: 90, height: 50 },
      "South America": { x: 270, y: 390, width: 70, height: 100 },
      "South China Sea": { x: 750, y: 310, width: 70, height: 50 }
    };
    return coords[regionName as keyof typeof coords] || { x: 400, y: 300, width: 60, height: 60 };
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "critical": return "#dc2626"; // red-600
      case "high": return "#ea580c"; // orange-600
      case "medium": return "#d97706"; // amber-600
      case "low": return "#65a30d"; // lime-600
      default: return "#6b7280"; // gray-500
    }
  };

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case "critical": return "Critical";
      case "high": return "High";
      case "medium": return "Medium";
      case "low": return "Low";
      default: return "Unknown";
    }
  };

  const regionalData = getRegionalData();



  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Global Conflict Heat Map (24h)
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Live monitoring of conflict intensity across global regions
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full mr-2 bg-green-500 animate-pulse"></div>
            <span className="text-xs text-slate-600">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* World Map Heat Map */}
          <div className="lg:col-span-2">
            <div className="relative w-full h-96 bg-slate-100 rounded-lg overflow-hidden">
              {/* World Map Image */}
              <img 
                src={worldMapImage} 
                alt="World Map" 
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.9) contrast(1.1)' }}
              />
              
              {/* Heat Zone Overlays */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 720">
                {regionalData.map((region, index) => (
                  <g key={region.name}>
                    <rect
                      x={region.coordinates.x}
                      y={region.coordinates.y}
                      width={region.coordinates.width}
                      height={region.coordinates.height}
                      fill={getIntensityColor(region.intensity)}
                      opacity="0.6"
                      rx="8"
                      className="cursor-pointer transition-all duration-300 hover:opacity-0.8"
                      onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                    />
                    <circle
                      cx={region.coordinates.x + region.coordinates.width / 2}
                      cy={region.coordinates.y + region.coordinates.height / 2}
                      r="10"
                      fill={getIntensityColor(region.intensity)}
                      className="animate-pulse cursor-pointer"
                      onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                    >
                      <title>{`${region.name}: ${region.activeConflicts} active conflicts`}</title>
                    </circle>
                    <text
                      x={region.coordinates.x + region.coordinates.width / 2}
                      y={region.coordinates.y - 6}
                      textAnchor="middle"
                      className="text-sm font-bold fill-white pointer-events-none"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                    >
                      {region.activeConflicts}
                    </text>
                  </g>
                ))}
              </svg>
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm p-3 text-xs">
                <div className="font-medium text-slate-900 mb-2">Intensity Levels</div>
                <div className="space-y-1">
                  {["critical", "high", "medium", "low"].map((level) => (
                    <div key={level} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded mr-2" 
                        style={{ backgroundColor: getIntensityColor(level) }}
                      ></div>
                      <span className="capitalize">{level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time indicator */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm p-2 text-xs">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Details Panel */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Regional Overview</h4>
              <div className="space-y-3">
                {regionalData.slice(0, 5).map((region) => (
                  <div 
                    key={region.name}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedRegion === region.name 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{region.name}</span>
                      <Badge variant={region.intensity === "critical" ? "destructive" : "outline"}>
                        {getIntensityLabel(region.intensity)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-slate-600 space-x-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {region.activeConflicts} active
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {region.totalCasualties.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Region Details */}
            {selectedRegion && (
              <div className="border rounded-lg p-4">
                <h5 className="font-semibold text-slate-900 mb-3">{selectedRegion} Details</h5>
                {regionalData
                  .find(r => r.name === selectedRegion)
                  ?.conflicts.slice(0, 3)
                  .map((conflict) => (
                    <div key={conflict.id} className="mb-3 pb-3 border-b border-slate-200 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className="flex space-x-1 mr-2">
                            {conflict.parties?.slice(0, 2).map((party, index) => (
                              <FlagIcon key={index} countryCode={party} size="sm" />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{conflict.name}</span>
                        </div>
                        <Badge variant={conflict.severity === "High" ? "destructive" : "secondary"} className="text-xs">
                          {conflict.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600">
                        Duration: {conflict.duration} • Status: {conflict.status}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}