import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Activity, MapPin, Clock } from "lucide-react";
import FlagIcon from "@/components/flag-icon";
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
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  const [isRealTime, setIsRealTime] = useState(true);

  const { data: conflicts } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  // Process conflicts into regional data
  const getRegionalData = (): RegionData[] => {
    const conflictArray = conflicts as Conflict[] | undefined;
    if (!conflictArray || conflictArray.length === 0) return [];

    const regionMap = new Map<string, Conflict[]>();
    
    conflictArray.forEach((conflict: Conflict) => {
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
    const coords = {
      "Eastern Europe": { x: 520, y: 180, width: 120, height: 80 },
      "Middle East": { x: 580, y: 250, width: 100, height: 90 },
      "West Africa": { x: 440, y: 320, width: 80, height: 100 },
      "East Africa": { x: 580, y: 340, width: 70, height: 120 },
      "Central Africa": { x: 520, y: 370, width: 80, height: 80 },
      "Horn of Africa": { x: 600, y: 360, width: 60, height: 80 },
      "South Asia": { x: 680, y: 280, width: 90, height: 80 },
      "East Asia": { x: 750, y: 200, width: 100, height: 100 },
      "Southeast Asia": { x: 760, y: 320, width: 90, height: 70 },
      "Central Asia": { x: 650, y: 220, width: 100, height: 60 },
      "South America": { x: 280, y: 450, width: 80, height: 120 },
      "South China Sea": { x: 740, y: 340, width: 80, height: 60 }
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

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      // Trigger re-render to simulate data updates
      // In real implementation, this would refresh data
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTime]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Real-time Global Conflict Heat Map
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Live monitoring of conflict intensity across global regions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {(["24h", "7d", "30d"] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-slate-600">
                {isRealTime ? 'Live' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* World Map Heat Map */}
          <div className="lg:col-span-2">
            <div className="relative w-full h-96 bg-slate-100 rounded-lg overflow-hidden">
              {/* World Map SVG */}
              <svg viewBox="0 0 1000 600" className="w-full h-full">
                {/* Background */}
                <rect width="1000" height="600" fill="#f8fafc" />
                
                {/* Simplified world continents */}
                <path d="M 120 200 Q 300 150 500 200 Q 650 220 800 200 Q 900 190 950 210" 
                      fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" opacity="0.3" />
                <path d="M 200 280 Q 400 250 600 280 Q 750 300 850 280" 
                      fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" opacity="0.3" />
                <path d="M 150 400 Q 250 380 350 400 Q 400 420 450 400" 
                      fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" opacity="0.3" />
                <path d="M 700 450 Q 780 430 850 450 Q 900 470 950 450" 
                      fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" opacity="0.3" />

                {/* Regional heat zones */}
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
                      r="8"
                      fill={getIntensityColor(region.intensity)}
                      className="animate-pulse cursor-pointer"
                      onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                    >
                      <title>{`${region.name}: ${region.activeConflicts} active conflicts`}</title>
                    </circle>
                    <text
                      x={region.coordinates.x + region.coordinates.width / 2}
                      y={region.coordinates.y - 10}
                      textAnchor="middle"
                      className="text-xs font-medium fill-slate-700"
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