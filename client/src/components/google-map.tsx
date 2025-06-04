import { AlertTriangle } from "lucide-react";
import worldMapImage from "@assets/world-map-306338_1280.png";
import type { Conflict } from "@shared/schema";

interface GoogleMapProps {
  conflicts: Conflict[];
  className?: string;
}

export default function GoogleMap({ conflicts, className }: GoogleMapProps) {
  return (
    <div className={`w-full h-full rounded-lg relative overflow-hidden ${className}`}>
      {/* World Map Image */}
      <img 
        src={worldMapImage} 
        alt="World Map" 
        className="w-full h-full object-cover"
        style={{ filter: 'brightness(0.9) contrast(1.1)' }}
      />
      
      {/* Conflict Markers */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 720">
        {conflicts.filter(conflict => conflict.status === "Active").map((conflict) => {
          if (!conflict.latitude || !conflict.longitude) return null;
          
          // Convert lat/lng to map coordinates with proper map projection
          // Accounting for the actual landmass positioning in the world map image
          const mapWidth = 1280;
          const mapHeight = 720;
          
          // Adjust for map projection - the actual world map doesn't use full width/height
          const mapPadding = { left: 40, right: 40, top: 60, bottom: 80 };
          const usableWidth = mapWidth - mapPadding.left - mapPadding.right;
          const usableHeight = mapHeight - mapPadding.top - mapPadding.bottom;
          
          const x = mapPadding.left + ((conflict.longitude + 180) / 360) * usableWidth;
          const y = mapPadding.top + ((90 - conflict.latitude) / 180) * usableHeight;
          
          return (
            <g key={conflict.id}>
              <circle 
                cx={x} 
                cy={y} 
                r="8" 
                fill={conflict.severity === "High" ? "#ef4444" : 
                     conflict.severity === "Medium" ? "#f59e0b" : "#10b981"}
                stroke="#ffffff"
                strokeWidth="3"
                className="animate-pulse cursor-pointer"
              >
                <title>{`${conflict.name} - ${conflict.region} (${conflict.severity})`}</title>
              </circle>
              <circle 
                cx={x} 
                cy={y} 
                r="15" 
                fill="transparent" 
                stroke={conflict.severity === "High" ? "#ef4444" : 
                       conflict.severity === "Medium" ? "#f59e0b" : "#10b981"}
                strokeWidth="2"
                opacity="0.5"
                className="animate-ping"
              />
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm p-3 text-xs">
        <div className="font-medium text-slate-900 mb-2">Conflict Severity</div>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>High</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Low</span>
          </div>
        </div>
      </div>
      
      {/* Conflict count */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm p-2 text-xs">
        <div className="flex items-center">
          <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
          <span className="font-medium">{conflicts.length} Active</span>
        </div>
      </div>
    </div>
  );
}