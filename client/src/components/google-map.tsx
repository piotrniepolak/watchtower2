import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useQuery } from "@tanstack/react-query";
import type { Conflict } from "@shared/schema";

interface GoogleMapProps {
  conflicts: Conflict[];
  className?: string;
}

export default function GoogleMap({ conflicts, className }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error("Google Maps API key not found");
        return;
      }

      const loader = new Loader({
        apiKey: apiKey,
        version: "weekly",
        libraries: ["places"]
      });

      try {
        await loader.load();
        
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 30, lng: 0 }, // Center on world view
            zoom: 2,
            styles: [
              {
                featureType: "all",
                elementType: "geometry.fill",
                stylers: [{ color: "#f1f5f9" }]
              },
              {
                featureType: "water",
                elementType: "geometry.fill",
                stylers: [{ color: "#e2e8f0" }]
              },
              {
                featureType: "administrative.country",
                elementType: "geometry.stroke",
                stylers: [{ color: "#cbd5e1" }, { weight: 1 }]
              }
            ]
          });
          
          setMap(mapInstance);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map || !conflicts.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    conflicts.forEach(conflict => {
      if (conflict.latitude && conflict.longitude) {
        const severityColor = 
          conflict.severity === "High" ? "#ef4444" :
          conflict.severity === "Medium" ? "#f59e0b" : "#10b981";

        const marker = new google.maps.Marker({
          position: { lat: conflict.latitude, lng: conflict.longitude },
          map: map,
          title: conflict.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: severityColor,
            fillOpacity: 0.8,
            strokeColor: "#ffffff",
            strokeWeight: 2
          },
          animation: google.maps.Animation.DROP
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              <h3 class="font-semibold text-slate-900">${conflict.name}</h3>
              <p class="text-sm text-slate-600 mt-1">${conflict.region}</p>
              <p class="text-sm text-slate-600">${conflict.description || ""}</p>
              <div class="mt-2 flex items-center justify-between text-xs">
                <span class="px-2 py-1 rounded text-white" style="background-color: ${severityColor}">
                  ${conflict.severity}
                </span>
                <span class="text-slate-500">${conflict.duration}</span>
              </div>
            </div>
          `
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);
  }, [map, conflicts]);

  return (
    <div ref={mapRef} className={`w-full h-full rounded-lg ${className}`}>
      {!map && (
        <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
          <div className="text-slate-500">Loading map...</div>
        </div>
      )}
    </div>
  );
}