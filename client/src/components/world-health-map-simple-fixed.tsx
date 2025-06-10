import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, Heart, Shield, AlertTriangle, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

// Simple SVG country paths for major countries with WHO data
const countryPaths = {
  'JPN': "M780 180c15-5 28 2 35 15 4 8 3 18-3 25l-12 8c-8 3-18 2-24-4-6-6-8-16-3-24l7-20z",
  'CHE': "M520 170c8-3 17-1 23 5 3 3 4 8 2 12l-5 6c-4 2-9 2-13-1-4-3-5-8-3-12l-4-10z", 
  'USA': "M150 200c35-8 70-5 100 8 20 8 35 22 42 40 4 12 2 25-5 36l-25 30c-15 8-35 8-50 0l-45-25c-12-8-20-22-22-37-2-15 2-30 10-42l-5-10z",
  'GBR': "M480 150c10-2 20 1 27 8 4 4 5 10 3 15l-6 8c-5 3-12 3-17-1-5-4-6-10-3-15l-4-15z",
  'DEU': "M530 160c12-3 25 0 34 8 5 5 7 12 5 19l-8 10c-6 4-15 4-21-1-6-5-8-13-5-20l-5-16z",
  'FRA': "M500 180c15-4 30-1 41 8 6 5 9 13 7 21l-10 12c-8 5-19 5-27-1-8-6-11-16-7-24l-4-16z",
  'CAN': "M120 120c50-12 100-8 145 12 30 12 55 32 70 58 8 15 10 32 5 48l-20 35c-15 12-35 18-55 15l-80-15c-25-8-45-25-55-47-10-22-8-47 5-68l-15-38z",
  'CHN': "M720 180c25-8 50-5 70 8 15 10 25 25 28 42 2 12-1 25-8 35l-20 20c-12 6-26 6-38 0l-35-20c-10-8-16-20-17-33-1-13 3-26 10-37l10-15z",
  'THA': "M680 280c12-4 25-2 35 5 6 4 10 11 11 18 1 5-1 11-5 15l-12 8c-6 2-13 1-18-3-5-4-7-11-6-17l-5-26z",
  'BRA': "M280 350c30-10 60-8 85 5 20 10 35 26 45 45 5 12 6 25 2 37l-15 25c-12 8-27 10-41 5l-50-15c-15-8-27-21-32-37-5-16-3-34 6-48l0-17z",
  'RUS': "M580 100c40-15 85-10 120 12 25 15 45 38 55 65 5 18 5 37-2 54l-25 40c-18 15-42 22-65 18l-80-20c-25-10-45-28-55-52-10-24-8-52 5-75l47-42z",
  'TUR': "M560 220c15-5 32-3 45 5 8 5 14 13 16 22 2 6 1 13-3 18l-10 10c-7 3-15 3-22-1-7-4-11-11-12-19l-14-35z",
  'MEX': "M180 260c25-8 52-6 75 5 15 7 27 18 35 32 4 8 5 18 3 27l-8 15c-8 6-18 8-28 5l-40-12c-12-6-22-16-27-28-5-12-4-26 2-37l-12-7z",
  'IND': "M640 260c20-8 42-6 60 5 12 7 21 18 26 31 3 8 3 17 0 25l-12 18c-10 6-22 7-33 3l-35-15c-10-7-17-17-20-29-3-12-1-25 5-35l9-3z",
  'BGD': "M660 270c8-3 17-2 24 2 4 2 7 6 8 10 1 3 0 7-2 10l-5 5c-3 1-7 1-10-1-3-2-5-5-5-9l-10-17z",
  'IDN': "M700 320c15-5 31-3 44 5 8 5 14 12 17 21 2 5 1 11-2 15l-8 8c-6 3-13 3-19-1-6-4-10-10-11-17l-21-31z",
  'PHL': "M720 300c10-3 21-2 30 3 5 3 9 8 10 14 1 4 0 8-2 11l-6 6c-4 2-9 2-13-1-4-3-6-7-6-12l-13-21z",
  'VNM': "M680 270c8-3 17-2 24 2 4 2 7 6 8 10 1 3 0 7-2 10l-5 5c-3 1-7 1-10-1-3-2-5-5-5-9l-10-17z",
  'EGY': "M540 250c12-4 25-3 36 3 6 3 11 8 13 15 1 4 1 9-1 13l-6 8c-5 3-11 3-16 0-5-3-8-8-9-14l-17-25z",
  'UKR': "M560 180c15-5 31-3 44 5 8 4 14 11 17 19 2 5 1 11-2 15l-8 8c-6 3-13 3-19-1-6-4-10-10-11-17l-21-29z",
  'PAK': "M620 250c15-5 31-3 44 5 8 4 14 11 17 19 2 5 1 11-2 15l-8 8c-6 3-13 3-19-1-6-4-10-10-11-17l-21-29z",
  'NGA': "M500 300c12-4 25-3 36 3 6 3 11 8 13 15 1 4 1 9-1 13l-6 8c-5 3-11 3-16 0-5-3-8-8-9-14l-17-25z",
  'TCD': "M520 320c10-3 21-2 30 3 5 3 9 8 10 14 1 4 0 8-2 11l-6 6c-4 2-9 2-13-1-4-3-6-7-6-12l-13-21z",
  'AFG': "M600 230c12-4 25-3 36 3 6 3 11 8 13 15 1 4 1 9-1 13l-6 8c-5 3-11 3-16 0-5-3-8-8-9-14l-17-25z",
  'ETH': "M560 340c12-4 25-3 36 3 6 3 11 8 13 15 1 4 1 9-1 13l-6 8c-5 3-11 3-16 0-5-3-8-8-9-14l-17-25z"
};

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

  const handleCountryClick = (countryCode: string) => {
    const countryData = healthData.get(countryCode);
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
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-full cursor-pointer"
            >
              {Object.entries(countryPaths).map(([countryCode, path]) => {
                const countryData = healthData.get(countryCode);
                const isHovered = hoveredCountry === countryCode;
                const fillColor = getCountryColor(countryData?.healthScore);
                
                return (
                  <path
                    key={countryCode}
                    d={path}
                    fill={fillColor}
                    stroke="#fff"
                    strokeWidth="1"
                    className="transition-all duration-200 hover:stroke-2 hover:stroke-blue-500 cursor-pointer"
                    style={{
                      filter: isHovered ? 'brightness(1.1)' : 'none',
                      transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                    onClick={() => handleCountryClick(countryCode)}
                    onMouseEnter={() => setHoveredCountry(countryCode)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  />
                );
              })}
            </svg>
            
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
          {hoveredCountry && healthData.get(hoveredCountry) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  {healthData.get(hoveredCountry)?.name}
                </h3>
                <Badge variant="outline" className="bg-white">
                  Score: {healthData.get(hoveredCountry)?.healthScore}
                </Badge>
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