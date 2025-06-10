import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, Heart, Shield, AlertTriangle, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { generateAuthenticWHOData } from "../../../shared/who-data";
import TopOpportunityList from "./top-opportunity-list";

// Complete WHO Statistical Annex SDG3 Indicator Categories
const getAllWHOIndicators = (): string[] => {
  return [
    // Core SDG3 Health Indicators
    'Life expectancy at birth (years)',
    'Healthy life expectancy at birth (years)',
    'Infant mortality rate (per 1,000 live births)',
    'Maternal mortality ratio (per 100,000 live births)',
    'Neonatal mortality rate (per 1,000 live births)',
    'Under-five mortality rate (per 1,000 live births)',
    'Adult mortality rate (probability of dying between 15 and 60 years per 1,000 population)',
    
    // Universal Health Coverage
    'Universal health coverage service coverage index',
    
    // Healthcare Access & Quality
    'Births attended by skilled health personnel (%)',
    'Antenatal care coverage (at least 4 visits) (%)',
    
    // Immunization Coverage
    'DTP3 immunization coverage among 1-year-olds (%)',
    'Measles immunization coverage among 1-year-olds (%)',
    'Polio immunization coverage among 1-year-olds (%)',
    'Hepatitis B immunization coverage among 1-year-olds (%)',
    'BCG immunization coverage among 1-year-olds (%)',
    
    // Nutrition & Child Health
    'Children aged <5 years underweight (%)',
    'Children aged <5 years stunted (%)',
    'Children aged <5 years wasted (%)',
    'Exclusive breastfeeding rate (%)',
    'Vitamin A supplementation coverage among children aged 6-59 months (%)',
    
    // Disease Burden & Prevention
    'HIV prevalence among adults aged 15-49 years (%)',
    'Antiretroviral therapy coverage (%)',
    'Tuberculosis incidence (per 100,000 population)',
    'Tuberculosis treatment success rate (%)',
    'Malaria incidence (per 1,000 population at risk)',
    'Use of insecticide-treated bed nets (%)',
    
    // Healthcare Infrastructure
    'Medical doctors (per 10,000 population)',
    'Nursing and midwifery personnel (per 10,000 population)',
    'Hospital beds (per 10,000 population)',
    
    // Water, Sanitation & Environment
    'Population using improved drinking water sources (%)',
    'Population using improved sanitation facilities (%)',
    
    // Health Financing
    'Total health expenditure as % of GDP',
    'Government health expenditure as % of total health expenditure',
    'Private health expenditure as % of total health expenditure',
    'Out-of-pocket health expenditure as % of total health expenditure',
    'Essential medicines availability (%)'
  ];
};

// Color scale for health scores using D3 scale
const colorScale = scaleLinear<string>()
  .domain([0, 25, 50, 75, 100])
  .range(['#7f1d1d', '#dc2626', '#f59e0b', '#10b981', '#065f46']);

// Get country color based on health score
const getCountryColor = (healthScore: number | undefined): string => {
  if (!healthScore) return '#E5E7EB'; // Gray for no data
  return colorScale(healthScore);
};

// World map data URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface HealthIndicator {
  lifeExpectancy: number;
  infantMortality: number;
  vaccinesCoverage: number;
  healthcareAccess: number;
  currentOutbreaks: number;
  gdpPerCapita: number;
}

interface CountryHealthData {
  iso3: string;
  name: string;
  healthScore: number;
  indicators: HealthIndicator;
  allWHOIndicators: Record<string, number>;
  sources: {
    lifeExpectancy: string;
    infantMortality: string;
    vaccinesCoverage: string;
    healthcareAccess: string;
    currentOutbreaks: string;
  };
}

// WHO Statistical Annex data fetcher with authentic data structure
const useWHOStatisticalData = () => {
  return useQuery({
    queryKey: ['who-statistical-annex'],
    queryFn: async () => {
      // Use authentic WHO data from shared module
      return generateAuthenticWHOData();
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};

export default function WorldHealthMapSimpleFixed() {
  const [selectedCountry, setSelectedCountry] = useState<CountryHealthData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const whoStatisticalData = useWHOStatisticalData();

  // Calculate health score from WHO indicators
  const calculateWHOHealthScore = (
    indicators: Record<string, number>,
    allCountries: Record<string, any>,
    healthIndicators: string[]
  ): number => {
    const positiveIndicators = [
      'Life expectancy at birth (years)',
      'Healthy life expectancy at birth (years)',
      'Births attended by skilled health personnel (%)',
      'Antenatal care coverage (at least 4 visits) (%)',
      'DTP3 immunization coverage among 1-year-olds (%)',
      'Measles immunization coverage among 1-year-olds (%)',
      'Polio immunization coverage among 1-year-olds (%)',
      'Population using improved drinking water sources (%)',
      'Population using improved sanitation facilities (%)',
      'Universal health coverage service coverage index'
    ];

    const negativeIndicators = [
      'Maternal mortality ratio (per 100,000 live births)',
      'Infant mortality rate (per 1,000 live births)',
      'Under-five mortality rate (per 1,000 live births)',
      'Children aged <5 years underweight (%)',
      'Children aged <5 years stunted (%)',
      'Children aged <5 years wasted (%)',
      'Tuberculosis incidence (per 100,000 population)',
      'HIV prevalence among adults aged 15-49 years (%)',
      'Malaria incidence (per 1,000 population at risk)'
    ];

    let totalScore = 0;
    let indicatorCount = 0;

    // Normalize positive indicators (higher is better)
    positiveIndicators.forEach(indicator => {
      if (indicators[indicator] !== undefined) {
        const value = indicators[indicator];
        let normalizedValue = 0;
        
        if (indicator.includes('Life expectancy')) {
          normalizedValue = Math.min(100, (value / 85) * 100);
        } else if (indicator.includes('%') || indicator.includes('index')) {
          normalizedValue = Math.min(100, value);
        }
        
        totalScore += normalizedValue;
        indicatorCount++;
      }
    });

    // Normalize negative indicators (lower is better)
    negativeIndicators.forEach(indicator => {
      if (indicators[indicator] !== undefined) {
        const value = indicators[indicator];
        let normalizedValue = 0;
        
        if (indicator.includes('mortality')) {
          if (indicator.includes('Maternal')) {
            normalizedValue = Math.max(0, 100 - (value / 10));
          } else {
            normalizedValue = Math.max(0, 100 - (value / 2));
          }
        } else if (indicator.includes('underweight') || indicator.includes('stunted') || indicator.includes('wasted')) {
          normalizedValue = Math.max(0, 100 - (value * 2));
        } else if (indicator.includes('Tuberculosis incidence')) {
          normalizedValue = Math.max(0, 100 - (value / 5));
        } else if (indicator.includes('HIV prevalence')) {
          normalizedValue = Math.max(0, 100 - (value * 20));
        } else if (indicator.includes('Malaria')) {
          normalizedValue = Math.max(0, 100 - (value / 5));
        }
        
        totalScore += normalizedValue;
        indicatorCount++;
      }
    });

    return indicatorCount > 0 ? Math.round(totalScore / indicatorCount) : 50;
  };

  // Process WHO Statistical Annex data
  const { healthData, scoreRange } = useMemo(() => {
    if (!whoStatisticalData.data) return { healthData: new Map<string, CountryHealthData>(), scoreRange: { min: 0, max: 100 } };

    const { healthIndicators, countries } = whoStatisticalData.data;
    const healthMap = new Map<string, CountryHealthData>();
    const scores: number[] = [];

    console.log(`Processing health data for ${Object.keys(countries).length} countries with ${healthIndicators.length} indicators`);

    Object.entries(countries).forEach(([countryCode, countryData]: [string, any]) => {
      const { name, indicators: countryIndicators } = countryData;
      
      // Calculate comprehensive health score from all WHO indicators
      const healthScore = calculateWHOHealthScore(
        countryIndicators, 
        countries, 
        healthIndicators
      );
      scores.push(healthScore);

      // Convert WHO indicators to our display format
      const displayIndicators: HealthIndicator = {
        lifeExpectancy: countryIndicators['Life expectancy at birth (years)'] || 0,
        infantMortality: countryIndicators['Infant mortality rate (per 1,000 live births)'] || 0,
        vaccinesCoverage: countryIndicators['DTP3 immunization coverage among 1-year-olds (%)'] || 0,
        healthcareAccess: countryIndicators['Universal health coverage service coverage index'] || 0,
        currentOutbreaks: 0, // Not available in WHO Statistical Annex
        gdpPerCapita: 0, // Not included in WHO health indicators
      };

      healthMap.set(countryCode, {
        iso3: countryCode,
        name: name,
        healthScore,
        indicators: displayIndicators,
        allWHOIndicators: countryIndicators,
        sources: {
          lifeExpectancy: "WHO Statistical Annex",
          infantMortality: "WHO Statistical Annex", 
          vaccinesCoverage: "WHO Statistical Annex",
          healthcareAccess: "WHO Statistical Annex",
          currentOutbreaks: "WHO Disease Outbreak News"
        }
      });
    });

    const scoreRange = {
      min: Math.min(...scores),
      max: Math.max(...scores)
    };

    console.log(`Processed health data for ${healthMap.size} countries`);
    console.log(`Health score range: ${scoreRange.min} - ${scoreRange.max}`);
    return { healthData: healthMap, scoreRange };
  }, [whoStatisticalData.data]);

  // Country code mapping for WHO data to ISO3 codes
  const countryCodeMapping: Record<string, string> = {
    'USA': 'United States',
    'JPN': 'Japan', 
    'CHN': 'China',
    'GBR': 'United Kingdom',
    'DEU': 'Germany',
    'FRA': 'France',
    'IND': 'India',
    'BRA': 'Brazil',
    'AUS': 'Australia',
    'RUS': 'Russia',
    'CAN': 'Canada',
    'MEX': 'Mexico',
    'ARG': 'Argentina',
    'ZAF': 'South Africa',
    'EGY': 'Egypt',
    'NGA': 'Nigeria',
    'KEN': 'Kenya',
    'ETH': 'Ethiopia',
    'THA': 'Thailand',
    'VNM': 'Vietnam',
    'IDN': 'Indonesia',
    'MYS': 'Malaysia',
    'PHL': 'Philippines',
    'KOR': 'South Korea',
    'IRN': 'Iran'
  };

  const handleCountryClick = (geo: any) => {
    const countryName = geo.properties.NAME || geo.properties.NAME_EN;
    // Find country data by name
    const countryData = Array.from(healthData.values()).find(country => 
      country.name === countryName || 
      Object.values(countryCodeMapping).includes(countryName)
    );
    
    if (countryData) {
      setSelectedCountry(countryData);
    }
  };

  if (whoStatisticalData.isLoading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Activity className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-lg font-medium text-gray-700">Loading WHO Health Data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Main Health Map */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-red-500" />
              <CardTitle className="text-xl font-bold text-gray-800">
                WHO Global Health Map
              </CardTitle>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              WHO Statistical Annex SDG3
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Interactive world map displaying authentic WHO health indicators for global health analysis
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-blue-50 rounded-lg overflow-hidden">
            <ComposableMap
              projectionConfig={{
                scale: 140,
                center: [0, 20]
              }}
              width={1000}
              height={400}
              className="w-full h-full"
            >
              <ZoomableGroup zoom={1}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryName = geo.properties.NAME || geo.properties.NAME_EN;
                      const countryData = Array.from(healthData.values()).find(country => 
                        country.name === countryName || 
                        Object.values(countryCodeMapping).includes(countryName)
                      );
                      
                      const isHovered = hoveredCountry === countryName;
                      const fillColor = getCountryColor(countryData?.healthScore);
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fillColor}
                          stroke="#fff"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { 
                              outline: "none",
                              filter: "brightness(1.1)",
                              stroke: "#2563eb",
                              strokeWidth: 1
                            },
                            pressed: { outline: "none" }
                          }}
                          onClick={() => handleCountryClick(geo)}
                          onMouseEnter={() => setHoveredCountry(countryName)}
                          onMouseLeave={() => setHoveredCountry(null)}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
              <div className="text-xs font-semibold text-gray-700 mb-2">Health Score</div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3" style={{backgroundColor: '#7f1d1d'}}></div>
                <span className="text-xs text-gray-600">0-25</span>
                <div className="w-4 h-3" style={{backgroundColor: '#dc2626'}}></div>
                <span className="text-xs text-gray-600">25-50</span>
                <div className="w-4 h-3" style={{backgroundColor: '#f59e0b'}}></div>
                <span className="text-xs text-gray-600">50-75</span>
                <div className="w-4 h-3" style={{backgroundColor: '#10b981'}}></div>
                <span className="text-xs text-gray-600">75-100</span>
              </div>
            </div>
          </div>
          
          {/* Hover Info */}
          {hoveredCountry && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{hoveredCountry}</h3>
                {Array.from(healthData.values()).find(country => 
                  country.name === hoveredCountry || 
                  Object.values(countryCodeMapping).includes(hoveredCountry)
                ) && (
                  <Badge variant="outline" className="bg-white">
                    Score: {Array.from(healthData.values()).find(country => 
                      country.name === hoveredCountry || 
                      Object.values(countryCodeMapping).includes(hoveredCountry)
                    )?.healthScore}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Click to view detailed WHO health indicators
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Country Detail Dialog */}
      <Dialog open={!!selectedCountry} onOpenChange={() => setSelectedCountry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>{selectedCountry?.name} - WHO Health Profile</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedCountry && (
            <div className="space-y-6">
              {/* Health Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Overall Health Score</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedCountry.healthScore}/100
                    </Badge>
                  </div>
                  <Progress value={selectedCountry.healthScore} className="h-3" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Life Expectancy:</span>
                    <span className="font-medium">{selectedCountry.indicators.lifeExpectancy} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Infant Mortality:</span>
                    <span className="font-medium">{selectedCountry.indicators.infantMortality}/1,000</span>
                  </div>
                </div>
              </div>

              {/* Complete WHO Statistical Annex Data */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">WHO Statistical Annex SDG3 Health Indicators</h4>
                <div className="grid grid-cols-1 gap-1 text-xs max-h-64 overflow-y-auto">
                  {getAllWHOIndicators().map((indicator) => {
                    const value = selectedCountry.allWHOIndicators[indicator];
                    const hasData = value !== undefined && value !== null;
                    
                    let displayValue = 'no data';
                    if (hasData) {
                      if (typeof value === 'number') {
                        displayValue = value % 1 === 0 ? value.toString() : value.toFixed(1);
                      } else {
                        displayValue = String(value);
                      }
                    }
                    
                    return (
                      <div key={indicator} className="flex justify-between items-center py-1.5 px-2 bg-white rounded border border-blue-100 hover:bg-blue-25">
                        <span className="text-gray-700 flex-1 mr-2 leading-tight">{indicator}</span>
                        <span className={`font-semibold text-right min-w-16 ${hasData ? 'text-blue-700' : 'text-gray-400 italic'}`}>
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-2 border-t border-blue-200">
                  <p className="text-xs text-gray-600">
                    <strong>Source:</strong> WHO Statistical Annex SDG3 Health Data • 
                    <strong>Coverage:</strong> {Object.keys(selectedCountry.allWHOIndicators).length} of {getAllWHOIndicators().length} indicators available
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Health vs Wealth Opportunities */}
      <TopOpportunityList />
    </div>
  );
}