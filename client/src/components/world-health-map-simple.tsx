import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { useWHOStatisticalData } from '@/hooks/use-who-data';

// Types
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

// Health scoring functions
function isPositiveDirection(indicator: string): boolean {
  const negativeIndicators = [
    'Maternal mortality ratio',
    'Infant mortality rate',
    'Neonatal mortality rate',
    'Under-five mortality rate',
    'Adult mortality rate',
    'Children aged <5 years underweight',
    'Children aged <5 years stunted',
    'Children aged <5 years wasted',
    'HIV prevalence',
    'Tuberculosis incidence',
    'Malaria incidence',
    'Private health expenditure as % of total health expenditure',
    'Out-of-pocket health expenditure as % of total health expenditure'
  ];
  
  return !negativeIndicators.some(neg => indicator.toLowerCase().includes(neg.toLowerCase()));
}

function normalizeIndicator(
  value: number,
  indicator: string,
  allCountryValues: number[]
): number {
  if (allCountryValues.length === 0) return 0;
  
  const min = Math.min(...allCountryValues);
  const max = Math.max(...allCountryValues);
  
  if (min === max) return 1;
  
  const normalized = (value - min) / (max - min);
  
  return isPositiveDirection(indicator) ? normalized : 1 - normalized;
}

function calculateWHOHealthScore(
  countryIndicators: Record<string, number>,
  allCountriesData: Record<string, number>[] = []
): number {
  const healthIndicators = [
    'Life expectancy at birth (years)',
    'Infant mortality rate (per 1,000 live births)',
    'Maternal mortality ratio (per 100,000 live births)',
    'DTP3 immunization coverage among 1-year-olds (%)',
    'Universal health coverage service coverage index',
    'Medical doctors (per 10,000 population)',
    'Total health expenditure as % of GDP'
  ];

  let totalScore = 0;
  let validIndicators = 0;

  healthIndicators.forEach(indicator => {
    const value = countryIndicators[indicator];
    if (value !== undefined && value !== null && !isNaN(value)) {
      const allValues = allCountriesData
        .map(country => country[indicator])
        .filter(v => v !== undefined && v !== null && !isNaN(v));
      
      if (allValues.length > 1) {
        const normalizedScore = normalizeIndicator(value, indicator, allValues);
        totalScore += normalizedScore;
        validIndicators++;
      }
    }
  });
  
  if (validIndicators === 0) return 0;
  
  const adjustmentFactor = healthIndicators.length / Math.max(1, validIndicators);
  const rawScore = totalScore * 100 * adjustmentFactor;
  
  const originalMin = 28;
  const originalMax = 69;
  const originalRange = originalMax - originalMin;
  
  const calibratedScore = Math.max(0, Math.min(100, ((rawScore - originalMin) / originalRange) * 100));
  
  return calibratedScore;
}

export default function WorldHealthMapSimple() {
  const [selectedCountry, setSelectedCountry] = useState<CountryHealthData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const whoStatisticalData = useWHOStatisticalData();

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
      
      // Environmental Health
      'Population using improved drinking water sources (%)',
      'Population using improved sanitation facilities (%)',
      
      // Health Workforce & Infrastructure
      'Medical doctors (per 10,000 population)',
      'Nursing and midwifery personnel (per 10,000 population)',
      'Hospital beds (per 10,000 population)',
      
      // Health Financing
      'Total health expenditure as % of GDP',
      'Government health expenditure as % of total health expenditure',
      'Private health expenditure as % of total health expenditure',
      'Out-of-pocket health expenditure as % of total health expenditure',
      'Essential medicines availability (%)'
    ];
  };

  const processCountryData = (countryName: string): CountryHealthData | null => {
    if (!whoStatisticalData.data || whoStatisticalData.loading) {
      return null;
    }

    const countryData = whoStatisticalData.data.find(
      (country: any) => country.name === countryName
    );

    if (!countryData) {
      return null;
    }

    const allWHOIndicators = getAllWHOIndicators();
    const countryIndicators: Record<string, number> = {};

    // Process all WHO indicators for this country
    allWHOIndicators.forEach(indicator => {
      const value = countryData.indicators?.[indicator];
      if (value !== undefined && value !== null && !isNaN(value)) {
        countryIndicators[indicator] = Number(value);
      }
    });

    // Calculate health score using authentic WHO data
    const healthScore = calculateWHOHealthScore(countryIndicators, whoStatisticalData.data?.map((c: any) => c.indicators) || []);

    // Create display indicators for backward compatibility
    const displayIndicators: HealthIndicator = {
      lifeExpectancy: countryIndicators['Life expectancy at birth (years)'] || 0,
      infantMortality: countryIndicators['Infant mortality rate (per 1,000 live births)'] || 0,
      vaccinesCoverage: countryIndicators['DTP3 immunization coverage among 1-year-olds (%)'] || 0,
      healthcareAccess: countryIndicators['Universal health coverage service coverage index'] || 0,
      currentOutbreaks: 0, // Not available in WHO data
      gdpPerCapita: 0 // Not available in WHO data
    };

    return {
      iso3: countryData.iso3 || '',
      name: countryName,
      healthScore,
      indicators: displayIndicators,
      allWHOIndicators: countryIndicators,
      sources: {
        lifeExpectancy: 'WHO Statistical Annex SDG3',
        infantMortality: 'WHO Statistical Annex SDG3',
        vaccinesCoverage: 'WHO Statistical Annex SDG3',
        healthcareAccess: 'WHO Statistical Annex SDG3',
        currentOutbreaks: 'Not available'
      }
    };
  };

  // Map click handler
  const handleCountryClick = (countryName: string) => {
    const countryData = processCountryData(countryName);
    setSelectedCountry(countryData);
  };

  // Handle zoom and pan
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const updateTransform = () => {
      svg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      scale = Math.min(Math.max(0.5, scale * delta), 3);
      updateTransform();
    };

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      startX = event.clientX - translateX;
      startY = event.clientY - translateY;
      svg.style.cursor = 'grabbing';
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      translateX = event.clientX - startX;
      translateY = event.clientY - startY;
      updateTransform();
    };

    const handleMouseUp = () => {
      isDragging = false;
      svg.style.cursor = 'grab';
    };

    svg.addEventListener('wheel', handleWheel);
    svg.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      svg.removeEventListener('wheel', handleWheel);
      svg.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Get country color based on health score
  const getCountryColor = (countryName: string): string => {
    const countryData = processCountryData(countryName);
    if (!countryData) return '#e5e7eb'; // Gray for no data
    
    const score = countryData.healthScore;
    if (score >= 80) return '#10b981'; // Green - Excellent
    if (score >= 60) return '#f59e0b'; // Yellow - Good
    if (score >= 40) return '#f97316'; // Orange - Fair
    return '#ef4444'; // Red - Poor
  };

  if (whoStatisticalData.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading authentic WHO health data...</div>
      </div>
    );
  }

  if (whoStatisticalData.error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-600">Error loading WHO data: {whoStatisticalData.error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* World Map SVG */}
      <div className="w-full h-96 bg-blue-50 rounded-lg overflow-hidden relative">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 500"
          className="w-full h-full cursor-grab"
          style={{ backgroundColor: '#dbeafe' }}
        >
          {/* Simple world map representation */}
          {/* North America */}
          <path
            d="M50 150 L200 120 L220 180 L180 220 L120 200 Z"
            fill={getCountryColor('United States')}
            stroke="#374151"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleCountryClick('United States')}
            onMouseEnter={() => setHoveredCountry('United States')}
            onMouseLeave={() => setHoveredCountry(null)}
          />
          
          {/* Europe */}
          <path
            d="M400 120 L500 110 L520 160 L480 180 L420 170 Z"
            fill={getCountryColor('Germany')}
            stroke="#374151"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleCountryClick('Germany')}
            onMouseEnter={() => setHoveredCountry('Germany')}
            onMouseLeave={() => setHoveredCountry(null)}
          />
          
          {/* Asia */}
          <path
            d="M600 140 L750 130 L780 200 L720 220 L640 200 Z"
            fill={getCountryColor('Japan')}
            stroke="#374151"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleCountryClick('Japan')}
            onMouseEnter={() => setHoveredCountry('Japan')}
            onMouseLeave={() => setHoveredCountry(null)}
          />
          
          {/* Africa */}
          <path
            d="M450 250 L550 240 L580 320 L520 350 L480 330 Z"
            fill={getCountryColor('South Africa')}
            stroke="#374151"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleCountryClick('South Africa')}
            onMouseEnter={() => setHoveredCountry('South Africa')}
            onMouseLeave={() => setHoveredCountry(null)}
          />
          
          {/* South America */}
          <path
            d="M250 280 L320 270 L340 350 L300 380 L260 360 Z"
            fill={getCountryColor('Brazil')}
            stroke="#374151"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleCountryClick('Brazil')}
            onMouseEnter={() => setHoveredCountry('Brazil')}
            onMouseLeave={() => setHoveredCountry(null)}
          />
          
          {/* Australia */}
          <path
            d="M750 350 L850 340 L870 380 L820 400 L760 390 Z"
            fill={getCountryColor('Australia')}
            stroke="#374151"
            strokeWidth="1"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleCountryClick('Australia')}
            onMouseEnter={() => setHoveredCountry('Australia')}
            onMouseLeave={() => setHoveredCountry(null)}
          />
        </svg>
        
        {/* Hover tooltip */}
        {hoveredCountry && (
          <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-md border z-10">
            <div className="font-medium">{hoveredCountry}</div>
            <div className="text-sm text-gray-600">Click to view health data</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Excellent (80-100)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Good (60-79)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-sm">Fair (40-59)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Poor (0-39)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span className="text-sm">No Data</span>
        </div>
      </div>

      {/* Country Details Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedCountry.name}</CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={selectedCountry.healthScore >= 60 ? "default" : "destructive"}>
                    Health Score: {selectedCountry.healthScore.toFixed(1)}
                  </Badge>
                  {selectedCountry.indicators.lifeExpectancy > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      Life Expectancy: {selectedCountry.indicators.lifeExpectancy.toFixed(1)} years
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCountry(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* Key Health Indicators */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Health Indicators</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCountry.indicators.infantMortality > 0 && (
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="text-sm font-medium">Infant Mortality</div>
                        <div className="text-xl">{selectedCountry.indicators.infantMortality.toFixed(1)} per 1,000</div>
                        <div className="text-xs text-gray-500">{selectedCountry.sources.infantMortality}</div>
                      </div>
                    )}
                    {selectedCountry.indicators.vaccinesCoverage > 0 && (
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="text-sm font-medium">Vaccine Coverage</div>
                        <div className="text-xl">{selectedCountry.indicators.vaccinesCoverage.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">{selectedCountry.sources.vaccinesCoverage}</div>
                      </div>
                    )}
                    {selectedCountry.indicators.healthcareAccess > 0 && (
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="text-sm font-medium">Healthcare Access</div>
                        <div className="text-xl">{selectedCountry.indicators.healthcareAccess.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">{selectedCountry.sources.healthcareAccess}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* All WHO Indicators */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Complete WHO Statistical Annex Data ({Object.keys(selectedCountry.allWHOIndicators).length} indicators)</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getAllWHOIndicators().map(indicator => {
                      const value = selectedCountry.allWHOIndicators[indicator];
                      return (
                        <div key={indicator} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded text-sm">
                          <span className="font-medium">{indicator}</span>
                          <span className={value !== undefined ? "text-green-600" : "text-gray-400"}>
                            {value !== undefined ? value.toFixed(2) : "No data"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Data Source Information */}
                <div className="bg-blue-50 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Data Source</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    All health data sourced from WHO Statistical Annex SDG3 indicators. 
                    This represents authentic, verified health statistics from the World Health Organization.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}