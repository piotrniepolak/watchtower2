import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Info, Loader2, Globe } from 'lucide-react';
import { useWHOStatisticalData } from '@/hooks/use-who-data';

interface CountryHealthData {
  iso3: string;
  name: string;
  healthScore: number;
  indicators: Record<string, number>;
}

export default function WorldHealthMapClean() {
  const [selectedCountry, setSelectedCountry] = useState<CountryHealthData | null>(null);
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
    if (healthScore >= 80) return 'bg-green-500'; // Excellent
    if (healthScore >= 60) return 'bg-yellow-500'; // Good  
    if (healthScore >= 40) return 'bg-orange-500'; // Fair
    return 'bg-red-500'; // Poor
  };

  // Process WHO data for countries
  const processedCountries = useMemo(() => {
    if (!whoData.data) return [];
    
    return whoData.data.map((country: any) => {
      const healthScore = calculateHealthScore(country.indicators);
      return {
        iso3: country.iso3,
        name: country.name,
        healthScore,
        indicators: country.indicators
      };
    }).sort((a, b) => b.healthScore - a.healthScore);
  }, [whoData.data]);

  // Organize countries by regions for better display
  const regionGroups = useMemo(() => {
    const regions = {
      'North America': ['USA', 'CAN', 'MEX'],
      'Europe': ['DEU', 'GBR', 'FRA', 'RUS', 'TUR'],
      'Asia': ['JPN', 'CHN', 'IND', 'KOR', 'THA', 'VNM', 'SGP', 'MYS', 'IDN', 'PHL', 'PAK', 'BGD', 'LKA', 'NPL', 'AFG', 'UZB', 'KAZ'],
      'Middle East': ['SAU', 'ARE', 'QAT', 'KWT', 'OMN', 'BHR', 'JOR', 'LBN', 'ISR', 'PSE', 'IRN'],
      'South America': ['BRA', 'ARG', 'COL', 'PER', 'CHL', 'VEN', 'ECU', 'BOL', 'URY'],
      'Africa': ['ZAF', 'NGA', 'ETH', 'EGY'],
      'Oceania': ['AUS']
    };

    const grouped: Record<string, CountryHealthData[]> = {};
    
    Object.entries(regions).forEach(([region, isoCodes]) => {
      grouped[region] = processedCountries.filter(country => 
        isoCodes.includes(country.iso3)
      );
    });

    return grouped;
  }, [processedCountries]);

  const handleCountryClick = (country: CountryHealthData) => {
    setSelectedCountry(country);
  };

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
          {processedCountries.length} countries with WHO data
        </Badge>
      </div>

      {/* Regional Country Grid */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-6">
            {Object.entries(regionGroups).map(([region, countries]) => (
              <div key={region} className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-800 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  {region}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                  {countries.map((country) => (
                    <button
                      key={country.iso3}
                      onClick={() => handleCountryClick(country)}
                      className={`
                        p-3 rounded-lg border transition-all duration-200 hover:shadow-md
                        ${getCountryColor(country.healthScore)} text-white hover:opacity-80
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      `}
                    >
                      <div className="text-xs font-medium mb-1">{country.iso3}</div>
                      <div className="text-xs truncate">{country.name}</div>
                      <div className="text-xs font-bold mt-1">
                        {country.healthScore}/100
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
                  <div className={`w-4 h-4 rounded ${getCountryColor(selectedCountry.healthScore)}`}></div>
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

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Health Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {processedCountries.slice(0, 9).map((country, index) => (
              <div key={country.iso3} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-bold text-gray-500">#{index + 1}</div>
                  <div>
                    <div className="text-sm font-medium">{country.name}</div>
                    <div className="text-xs text-gray-600">{country.iso3}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {country.healthScore}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}