import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Conflict } from "@shared/schema";

interface GoogleMapProps {
  conflicts: Conflict[];
  className?: string;
}

export default function GoogleMap({ conflicts, className }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          setError("Google Maps API key not configured");
          setIsLoading(false);
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["places"]
        });

        const { Map } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement } = await loader.importLibrary("marker");

        if (mapRef.current) {
          const map = new Map(mapRef.current, {
            zoom: 2,
            center: { lat: 20, lng: 0 },
            mapId: "conflict_map",
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
          });

          mapInstanceRef.current = map;

          // Add markers for each conflict
          conflicts.forEach((conflict) => {
            if (conflict.latitude && conflict.longitude) {
              const markerElement = document.createElement('div');
              markerElement.className = 'conflict-marker';
              markerElement.innerHTML = `
                <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg animate-pulse cursor-pointer ${
                  conflict.severity === "High" ? "bg-red-500" : 
                  conflict.severity === "Medium" ? "bg-amber-500" : "bg-green-500"
                }"></div>
              `;

              const marker = new AdvancedMarkerElement({
                map,
                position: { lat: conflict.latitude, lng: conflict.longitude },
                content: markerElement,
                title: `${conflict.name} - ${conflict.region} (${conflict.severity})`
              });

              // Add info window
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <h3 class="font-semibold text-slate-900">${conflict.name}</h3>
                    <p class="text-sm text-slate-600">${conflict.region}</p>
                    <div class="flex items-center mt-1">
                      <span class="inline-block w-2 h-2 rounded-full mr-2 ${
                        conflict.severity === "High" ? "bg-red-500" : 
                        conflict.severity === "Medium" ? "bg-amber-500" : "bg-green-500"
                      }"></span>
                      <span class="text-xs font-medium">${conflict.severity} Severity</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1">Status: ${conflict.status}</p>
                  </div>
                `
              });

              markerElement.addEventListener('click', () => {
                infoWindow.open(map, marker);
              });
            }
          });

          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load Google Maps");
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [conflicts]);

  if (error) {
    return (
      <div className={`w-full h-full rounded-lg bg-slate-100 relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">{error}</p>
            <p className="text-xs text-slate-500 mt-1">Using fallback map display</p>
          </div>
        </div>
        
        {/* Fallback SVG Map */}
        <svg viewBox="0 0 800 400" className="w-full h-full opacity-50">
          <rect width="800" height="400" fill="#f1f5f9" />
          <path d="M 100 150 Q 200 120 300 150 Q 350 170 400 160 Q 450 150 500 170 Q 550 180 600 160 Q 650 150 700 170" 
                fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
          <path d="M 150 200 Q 250 180 350 200 Q 400 220 450 200 Q 500 190 550 210" 
                fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
          
          {conflicts.map((conflict) => {
            if (!conflict.latitude || !conflict.longitude) return null;
            const x = ((conflict.longitude + 180) / 360) * 800;
            const y = ((90 - conflict.latitude) / 180) * 400;
            
            return (
              <circle 
                key={conflict.id}
                cx={x} 
                cy={y} 
                r="6" 
                fill={conflict.severity === "High" ? "#ef4444" : 
                     conflict.severity === "Medium" ? "#f59e0b" : "#10b981"}
                stroke="#ffffff"
                strokeWidth="2"
              >
                <title>{`${conflict.name} - ${conflict.region}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <div className={`w-full h-full rounded-lg relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-600">Loading Google Maps...</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm p-3 text-xs z-20">
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
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm p-2 text-xs z-20">
        <div className="flex items-center">
          <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
          <span className="font-medium">{conflicts.length} Active</span>
        </div>
      </div>
    </div>
  );
}