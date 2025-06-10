import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Info, Loader2 } from 'lucide-react';
import { useWHOStatisticalData } from '@/hooks/use-who-data';

interface CountryHealthData {
  iso3: string;
  name: string;
  healthScore: number;
  indicators: Record<string, number>;
}

export default function WorldHealthMapGoogle() {
  const [selectedCountry, setSelectedCountry] = useState<CountryHealthData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [dataLayer, setDataLayer] = useState<google.maps.Data | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const whoData = useWHOStatisticalData();

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

  // Get country color based on health score
  const getCountryColor = (healthScore: number): string => {
    if (healthScore >= 80) return '#10b981'; // Green - Excellent
    if (healthScore >= 60) return '#f59e0b'; // Yellow - Good  
    if (healthScore >= 40) return '#f97316'; // Orange - Fair
    return '#ef4444'; // Red - Poor
  };

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 2,
      center: { lat: 20, lng: 0 },
      mapTypeId: 'terrain',
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#a2d2ff' }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f8f9fa' }]
        }
      ]
    });

    const dataLayerInstance = new google.maps.Data();
    dataLayerInstance.setMap(mapInstance);

    // Load world countries GeoJSON
    dataLayerInstance.loadGeoJson('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');

    setMap(mapInstance);
    setDataLayer(dataLayerInstance);
  }, []);

  // Style countries based on WHO data
  useEffect(() => {
    if (!dataLayer || !whoData.data) return;

    // Create lookup map for WHO data
    const whoDataMap = new Map();
    whoData.data.forEach((country: any) => {
      whoDataMap.set(country.iso3, country);
      whoDataMap.set(country.name, country);
    });

    dataLayer.setStyle((feature) => {
      const countryName = feature.getProperty('NAME');
      const iso3 = feature.getProperty('ISO_A3');
      
      // Try to find country data by ISO3 or name
      let countryData = whoDataMap.get(iso3) || whoDataMap.get(countryName);
      
      // Handle special cases for country name matching
      if (!countryData) {
        if (countryName === 'United States of America') {
          countryData = whoDataMap.get('USA');
        } else if (countryName === 'Russia') {
          countryData = whoDataMap.get('RUS');
        }
      }

      let fillColor = '#e5e7eb'; // Default gray
      let strokeWeight = 0.5;
      
      if (countryData && countryData.indicators) {
        const healthScore = calculateHealthScore(countryData.indicators);
        fillColor = getCountryColor(healthScore);
        strokeWeight = 1;
      }

      return {
        fillColor,
        fillOpacity: 0.7,
        strokeColor: '#374151',
        strokeWeight,
        clickable: true
      };
    });

    // Handle country clicks
    dataLayer.addListener('click', (event: any) => {
      const feature = event.feature;
      const countryName = feature.getProperty('NAME');
      const iso3 = feature.getProperty('ISO_A3');
      
      let countryData = whoDataMap.get(iso3) || whoDataMap.get(countryName);
      
      if (!countryData && countryName === 'United States of America') {
        countryData = whoDataMap.get('USA');
      } else if (!countryData && countryName === 'Russia') {
        countryData = whoDataMap.get('RUS');
      }

      if (countryData) {
        const healthScore = calculateHealthScore(countryData.indicators);
        setSelectedCountry({
          iso3: countryData.iso3,
          name: countryData.name,
          healthScore,
          indicators: countryData.indicators
        });
      }
    });
  }, [dataLayer, whoData.data]);

  if (whoData.loading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading authentic WHO health data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (whoData.error) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-red-600">Error loading WHO data: {whoData.error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Global Health Map - WHO Statistical Annex
          </h2>
          <p className="text-sm text-slate-600">
            Authentic WHO Statistical Annex SDG3 data with health scoring
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {whoData.data?.length || 0} countries with WHO data
        </Badge>
      </div>

      {/* Interactive Google Map */}
      <Card className="w-full">
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="w-full h-96 md:h-[500px] rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Country Details Panel */}
      {selectedCountry && (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              {selectedCountry.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCountry(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge 
                    variant={selectedCountry.healthScore >= 60 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    Health Score: {selectedCountry.healthScore}/100
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key WHO Indicators</h4>
                  {Object.entries(selectedCountry.indicators).slice(0, 8).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-2">{key}</span>
                      <span className="font-medium">{typeof value === 'number' ? value.toFixed(1) : 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Additional Indicators</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(selectedCountry.indicators).slice(8).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-2">{key}</span>
                      <span className="font-medium">{typeof value === 'number' ? value.toFixed(1) : 'N/A'}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-2 bg-blue-50 rounded">
                  <div className="flex items-center space-x-1">
                    <Info className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">WHO Statistical Annex SDG3</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-sm mb-2">Health Score Legend</h4>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs">80-100: Excellent</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-xs">60-79: Good</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-xs">40-59: Fair</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs">0-39: Poor</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-xs">No Data</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}