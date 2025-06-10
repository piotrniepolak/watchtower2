import { useState, useMemo, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleSequential } from "d3-scale";
import { interpolateRdYlGn } from "d3-scale-chromatic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, Heart, Shield, AlertTriangle, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWHOStatisticalData } from "@/hooks/use-who-data";

// Custom geography loader with fallback sources
const useWorldGeography = () => {
  const [geography, setGeography] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGeography = async () => {
      const sources = [
        "https://cdn.jsdelivr.net/npm/world-atlas@3/countries-110m.json",
        "https://unpkg.com/world-atlas@3/countries-110m.json",
        "https://raw.githubusercontent.com/topojson/world-atlas/master/countries-110m.json"
      ];

      for (const source of sources) {
        try {
          console.log(`Attempting to load geography from: ${source}`);
          const response = await fetch(source);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          console.log(`Successfully loaded geography from: ${source}`);
          setGeography(data);
          setLoading(false);
          return;
        } catch (err) {
          console.warn(`Failed to load geography from ${source}:`, err);
          continue;
        }
      }
      
      // If all sources fail, create a simple fallback
      console.log("All geography sources failed, using fallback");
      setError("Could not load world map data");
      setLoading(false);
    };

    loadGeography();
  }, []);

  return { geography, loading, error };
};

interface CountryHealthData {
  iso3: string;
  name: string;
  healthScore: number;
  indicators: Record<string, number>;
  lastUpdated: string;
}

interface GeographyFeature {
  type: string;
  properties: {
    NAME: string;
    ISO_A3: string;
    POP_EST: number;
  };
  geometry: any;
}

// Health scoring function for authentic WHO data
const calculateHealthScore = (indicators: Record<string, number>): number => {
  const keyIndicators = [
    'Life expectancy at birth (years)',
    'Infant mortality rate (per 1,000 live births)',
    'Maternal mortality ratio (per 100,000 live births)',
    'DTP3 immunization coverage among 1-year-olds (%)',
    'Universal health coverage service coverage index'
  ];

  let totalScore = 0;
  let validCount = 0;

  keyIndicators.forEach(indicator => {
    const value = indicators[indicator];
    if (value !== undefined && value !== null && !isNaN(value)) {
      let score = 0;
      
      // Normalize each indicator
      switch (indicator) {
        case 'Life expectancy at birth (years)':
          score = Math.min(100, Math.max(0, (value - 50) / 35 * 100));
          break;
        case 'Infant mortality rate (per 1,000 live births)':
          score = Math.min(100, Math.max(0, 100 - (value / 50 * 100)));
          break;
        case 'Maternal mortality ratio (per 100,000 live births)':
          score = Math.min(100, Math.max(0, 100 - (value / 500 * 100)));
          break;
        case 'DTP3 immunization coverage among 1-year-olds (%)':
        case 'Universal health coverage service coverage index':
          score = Math.min(100, Math.max(0, value));
          break;
      }
      
      totalScore += score;
      validCount++;
    }
  });

  return validCount > 0 ? Math.round(totalScore / validCount) : 0;
};

export default function WorldHealthMapRestored() {
  const [selectedCountry, setSelectedCountry] = useState<CountryHealthData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const { geography, loading: geoLoading, error: geoError } = useWorldGeography();

  const whoStatisticalData = useWHOStatisticalData();

  // Process WHO Statistical data for countries
  const healthData = useMemo(() => {
    if (!whoStatisticalData.data) return new Map<string, CountryHealthData>();
    
    const healthMap = new Map<string, CountryHealthData>();
    
    whoStatisticalData.data.forEach((country: any) => {
      const healthScore = calculateHealthScore(country.indicators);
      
      healthMap.set(country.iso3, {
        iso3: country.iso3,
        name: country.name,
        healthScore,
        indicators: country.indicators,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    });

    return healthMap;
  }, [whoStatisticalData.data]);

  // Color scale for health scores
  const colorScale = useMemo(() => {
    return scaleSequential(interpolateRdYlGn).domain([0, 100]);
  }, []);

  // Get country fill color
  const getCountryFill = (geo: GeographyFeature) => {
    const countryData = healthData.get(geo.properties.ISO_A3);
    if (!countryData) return "#E5E7EB"; // Gray for no data
    
    return colorScale(countryData.healthScore);
  };

  // Handle country click
  const handleCountryClick = (geo: GeographyFeature) => {
    const countryData = healthData.get(geo.properties.ISO_A3);
    if (countryData) {
      setSelectedCountry(countryData);
    }
  };

  // Map opacity based on data loading
  const mapOpacity = healthData.size > 0 ? 1 : 0.7;

  if (whoStatisticalData.loading || geoLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Global Health Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading authentic WHO health data...</p>
              <p className="text-sm text-gray-500">Connecting to WHO Statistical Annex</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (whoStatisticalData.error || geoError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Global Health Map - Data Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-center text-red-600">
              <p>Error loading health data: {whoStatisticalData.error || geoError}</p>
              <p className="text-sm text-gray-500 mt-2">Please check your connection and try again</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header with WHO Data Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Global Health Map
          </h2>
          <p className="text-sm text-slate-600">
            Authentic WHO Statistical Annex SDG3 data with interactive world visualization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            WHO Statistical Annex
          </Badge>
          <Badge variant="outline" className="text-xs">
            {healthData.size} countries
          </Badge>
        </div>
      </div>

      {/* Interactive World Map */}
      <Card className="w-full">
        <CardContent className="p-0">
          <div style={{ opacity: mapOpacity }} className="w-full h-96 md:h-[500px] transition-opacity duration-300">
            <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-gray-200">
              {/* World Map Visualization */}
              <div className="absolute inset-0">
                <ComposableMap
                  projection="geoEqualEarth"
                  projectionConfig={{
                    scale: 120,
                    center: [0, 0],
                  }}
                  width={800}
                  height={500}
                  className="w-full h-full"
                >
                  <Geographies geography={geography || undefined}>
                    {({ geographies }) => {
                      if (!geographies || geographies.length === 0) {
                        return (
                          <g>
                            <rect width={800} height={500} fill="#f0f9ff" />
                            <text x="400" y="250" textAnchor="middle" fill="#6b7280" fontSize="16" fontWeight="500">
                              Loading World Health Map...
                            </text>
                            <text x="400" y="280" textAnchor="middle" fill="#9ca3af" fontSize="12">
                              Connecting to WHO Statistical Annex
                            </text>
                          </g>
                        );
                      }

                      return geographies.map((geo) => {
                        const countryData = healthData.get(geo.properties.ISO_A3);
                        const isHovered = hoveredCountry === geo.properties.ISO_A3;
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={getCountryFill(geo)}
                            stroke="#FFFFFF"
                            strokeWidth={0.5}
                            style={{
                              default: {
                                fill: getCountryFill(geo),
                                stroke: "#FFFFFF",
                                strokeWidth: 0.5,
                                outline: "none",
                              },
                              hover: {
                                fill: countryData ? "#FF6B6B" : "#D1D5DB",
                                stroke: "#FFFFFF",
                                strokeWidth: 1,
                                outline: "none",
                                cursor: countryData ? "pointer" : "default",
                              },
                              pressed: {
                                fill: "#E53E3E",
                                stroke: "#FFFFFF",
                                strokeWidth: 1,
                                outline: "none",
                              },
                            }}
                            onMouseEnter={() => {
                              if (countryData) {
                                setHoveredCountry(geo.properties.ISO_A3);
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredCountry(null);
                            }}
                            onClick={() => handleCountryClick(geo)}
                          />
                        );
                      });
                    }}
                  </Geographies>
                </ComposableMap>
              </div>

              {/* Hover Tooltip */}
              {hoveredCountry && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border z-10">
                  {(() => {
                    const countryData = healthData.get(hoveredCountry);
                    if (!countryData) return null;
                    
                    return (
                      <div>
                        <h3 className="font-semibold text-sm">{countryData.name}</h3>
                        <p className="text-xs text-gray-600">Health Score: {countryData.healthScore}/100</p>
                        <p className="text-xs text-blue-600">Click for details</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Score Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-sm mb-3">Health Score Scale</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs">Poor (0-40)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-xs">Fair (41-60)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-xs">Good (61-80)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs">Excellent (81-100)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-xs">No Data</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Details Dialog */}
      <Dialog open={!!selectedCountry} onOpenChange={() => setSelectedCountry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              {selectedCountry?.name} - Health Profile
            </DialogTitle>
          </DialogHeader>
          
          {selectedCountry && (
            <div className="space-y-4">
              {/* Health Score Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedCountry.healthScore}</div>
                  <div className="text-xs text-gray-600">Health Score</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-600">{selectedCountry.iso3}</div>
                  <div className="text-xs text-gray-600">ISO Code</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-600">{selectedCountry.lastUpdated}</div>
                  <div className="text-xs text-gray-600">Last Updated</div>
                </div>
              </div>

              <Separator />

              {/* WHO Health Indicators */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  WHO Statistical Annex Indicators
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {Object.entries(selectedCountry.indicators).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                      <span className="text-gray-700 truncate mr-2">{key}</span>
                      <span className="font-medium text-gray-900">
                        {typeof value === 'number' ? value.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">WHO Statistical Annex SDG3</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Data sourced from WHO's official Statistical Annex for SDG3 health indicators
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}