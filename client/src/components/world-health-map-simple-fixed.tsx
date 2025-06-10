import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, Heart, Shield, AlertTriangle, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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

// Color scale utility for health scores with 5 categories (20-point ranges)
const getCountryColor = (healthScore: number | undefined, scoreRange: { min: number; max: number }): string => {
  if (!healthScore) return '#E5E7EB'; // Gray for no data
  
  // 5 categories with 20-point ranges
  if (healthScore >= 80) return '#065f46'; // Dark green (80-100)
  if (healthScore >= 60) return '#10b981'; // Green (60-79)
  if (healthScore >= 40) return '#f59e0b'; // Amber (40-59)
  if (healthScore >= 20) return '#dc2626'; // Red (20-39)
  return '#7f1d1d'; // Dark red (0-19)
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
  const svgRef = useRef<SVGSVGElement>(null);

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

  // Simple world map SVG paths (major countries only)
  const countryPaths = {
    USA: "M158 206c2-1 4-2 6-2 3 0 5 1 7 3l8 6c2 2 3 4 2 7-1 2-3 4-6 4h-12c-3 0-5-2-6-4-1-3 0-6 2-8l-1-6z",
    JPN: "M830 220c3-2 7-1 9 2 1 2 1 5-1 7l-6 4c-2 1-5 1-7-1-2-2-2-5 0-7l5-5z", 
    CHN: "M780 180c8-3 15-2 22 2 5 3 8 8 7 13-1 4-4 7-8 8l-18 3c-5 1-10-1-13-5-3-4-2-9 2-12l8-9z",
    GBR: "M480 140c2-1 4 0 5 2 1 1 1 3 0 4l-3 2c-1 1-3 1-4 0-1-1-1-3 0-4l2-4z",
    DEU: "M520 160c3-1 6 0 8 2 2 2 2 5 1 7l-4 3c-2 1-5 1-7-1-2-2-2-5 0-7l2-4z",
    FRA: "M500 180c4-2 8-1 11 2 2 2 3 5 2 8l-5 4c-3 2-7 2-10 0-3-2-3-6-1-9l3-5z",
    IND: "M720 260c6-3 12-2 17 2 4 3 6 8 5 12-1 4-4 7-8 8l-15 2c-4 1-9-1-12-4-3-3-3-8 0-11l13-9z",
    BRA: "M280 340c7-4 15-3 21 2 5 4 8 10 6 16-2 5-6 9-12 10l-20 3c-6 1-12-2-15-7-3-5-2-11 2-15l18-9z",
    AUS: "M820 420c8-4 17-3 24 3 6 5 9 12 7 19-2 6-7 11-14 12l-25 4c-7 1-14-2-18-8-4-6-3-13 3-18l23-12z",
    RUS: "M580 80c12-6 26-5 37 3 9 6 15 16 14 26-1 8-6 15-14 19l-35 15c-8 3-17 2-24-3-7-5-11-13-10-21 1-8 6-15 14-19l18-20z"
  };

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
              ref={svgRef}
              viewBox="0 0 1000 500"
              className="w-full h-full cursor-pointer"
            >
              {Object.entries(countryPaths).map(([countryCode, path]) => {
                const countryData = healthData.get(countryCode);
                const isHovered = hoveredCountry === countryCode;
                const color = getCountryColor(countryData?.healthScore, scoreRange);
                
                return (
                  <path
                    key={countryCode}
                    d={path}
                    fill={color}
                    stroke="#fff"
                    strokeWidth="1"
                    className="transition-all duration-200 hover:stroke-2 hover:stroke-blue-500"
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
                <div className="w-4 h-3 bg-red-800 rounded"></div>
                <span className="text-xs text-gray-600">Low</span>
                <div className="w-4 h-3 bg-yellow-500 rounded"></div>
                <span className="text-xs text-gray-600">Medium</span>
                <div className="w-4 h-3 bg-green-600 rounded"></div>
                <span className="text-xs text-gray-600">High</span>
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