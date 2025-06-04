import { MapPin, AlertTriangle } from "lucide-react";
import type { Conflict } from "@shared/schema";

interface GoogleMapProps {
  conflicts: Conflict[];
  className?: string;
}

export default function GoogleMap({ conflicts, className }: GoogleMapProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "bg-red-500";
      case "medium": return "bg-amber-500";
      default: return "bg-green-500";
    }
  };

  return (
    <div className={`w-full h-full rounded-lg bg-slate-100 relative overflow-hidden ${className}`}>
      {/* World Map Background */}
      <svg viewBox="0 0 800 400" className="w-full h-full">
        <rect width="800" height="400" fill="#f1f5f9" />
        
        {/* Simplified continents */}
        <path d="M 100 150 Q 200 120 300 150 Q 350 170 400 160 Q 450 150 500 170 Q 550 180 600 160 Q 650 150 700 170" 
              fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M 150 200 Q 250 180 350 200 Q 400 220 450 200 Q 500 190 550 210" 
              fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M 500 250 Q 550 230 600 250 Q 650 270 700 250" 
              fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        
        {/* Conflict markers based on real coordinates */}
        {conflicts.map((conflict, index) => {
          if (!conflict.latitude || !conflict.longitude) return null;
          
          // Convert lat/lng to SVG coordinates (simplified projection)
          const x = ((conflict.longitude + 180) / 360) * 800;
          const y = ((90 - conflict.latitude) / 180) * 400;
          
          return (
            <g key={conflict.id}>
              <circle 
                cx={x} 
                cy={y} 
                r="6" 
                fill={conflict.severity === "High" ? "#ef4444" : 
                     conflict.severity === "Medium" ? "#f59e0b" : "#10b981"}
                stroke="#ffffff"
                strokeWidth="2"
                className="animate-pulse cursor-pointer"
              >
                <title>{`${conflict.name} - ${conflict.region} (${conflict.severity})`}</title>
              </circle>
              <circle 
                cx={x} 
                cy={y} 
                r="12" 
                fill="transparent" 
                stroke={conflict.severity === "High" ? "#ef4444" : 
                       conflict.severity === "Medium" ? "#f59e0b" : "#10b981"}
                strokeWidth="1"
                opacity="0.3"
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