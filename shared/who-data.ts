// WHO Statistical Annex data structure and generation functions

// Health score calculation functions (same as map component)
function isPositiveDirection(indicator: string): boolean {
  const positiveKeywords = [
    'coverage', 'access', 'births', 'skilled', 'immunization',
    'vaccination', 'expectancy', 'density', 'improved', 'safe'
  ];
  
  const negativeKeywords = [
    'mortality', 'death', 'disease', 'malnutrition', 'stunting',
    'wasting', 'underweight', 'prevalence', 'incidence', 'burden'
  ];
  
  const indicatorLower = indicator.toLowerCase();
  
  // Check for positive indicators first
  if (positiveKeywords.some(keyword => indicatorLower.includes(keyword))) {
    return true;
  }
  
  // Check for negative indicators
  if (negativeKeywords.some(keyword => indicatorLower.includes(keyword))) {
    return false;
  }
  
  // Default to positive direction if unclear
  return true;
}

// Normalize indicator values to 0-1 scale
function normalizeIndicator(
  values: number[], 
  value: number, 
  isPositive: boolean
): number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  if (max === min) return 0.5; // Handle case where all values are the same
  
  if (isPositive) {
    // Higher is better: (value - min) / (max - min)
    return (value - min) / (max - min);
  } else {
    // Lower is better: (max - value) / (max - min)
    return (max - value) / (max - min);
  }
}

function calculateWHOHealthScore(
  countryIndicators: Record<string, number>,
  allCountriesData: Record<string, any>,
  healthIndicators: string[]
): number {
  if (Object.keys(countryIndicators).length === 0) return 0;
  
  let totalScore = 0;
  let validIndicators = 0;
  
  // Equal weight for each indicator
  const weight = 1 / healthIndicators.length;
  
  healthIndicators.forEach(indicator => {
    const value = countryIndicators[indicator];
    if (value === undefined || isNaN(value)) return;
    
    // Get all values for this indicator across countries for normalization
    const allValues = Object.values(allCountriesData)
      .map((country: any) => country.indicators[indicator])
      .filter((val: any) => val !== undefined && !isNaN(val));
    
    if (allValues.length === 0) return;
    
    const isPositive = isPositiveDirection(indicator);
    const normalizedValue = normalizeIndicator(allValues, value, isPositive);
    
    totalScore += normalizedValue * weight;
    validIndicators++;
  });
  
  // Scale to 0-100 and adjust for missing indicators
  const adjustmentFactor = healthIndicators.length / Math.max(1, validIndicators);
  const rawScore = totalScore * 100 * adjustmentFactor;
  
  // Calibrate score to 0-100 range where original min=28 maps to 0 and max=69 maps to 100
  const originalMin = 28;
  const originalMax = 69;
  const originalRange = originalMax - originalMin;
  
  // Apply linear transformation: newScore = ((rawScore - originalMin) / originalRange) * 100
  const calibratedScore = Math.max(0, Math.min(100, ((rawScore - originalMin) / originalRange) * 100));
  
  return calibratedScore;
}

export function generateAuthenticWHOData() {
  // Authentic WHO health indicators from Statistical Annex (excluding traffic & suicide mortality)
  const healthIndicators = [
    'Life expectancy at birth (years)',
    'Healthy life expectancy at birth (years)', 
    'Maternal mortality ratio (per 100,000 live births)',
    'Infant mortality rate (per 1,000 live births)',
    'Neonatal mortality rate (per 1,000 live births)',
    'Under-five mortality rate (per 1,000 live births)',
    'Adult mortality rate (probability of dying between 15 and 60 years per 1,000 population)',
    'Births attended by skilled health personnel (%)',
    'Antenatal care coverage (at least 4 visits) (%)',
    'Children aged <5 years underweight (%)',
    'Children aged <5 years stunted (%)', 
    'Children aged <5 years wasted (%)',
    'Exclusive breastfeeding rate (%)',
    'DTP3 immunization coverage among 1-year-olds (%)',
    'Measles immunization coverage among 1-year-olds (%)',
    'Polio immunization coverage among 1-year-olds (%)',
    'Hepatitis B immunization coverage among 1-year-olds (%)',
    'BCG immunization coverage among 1-year-olds (%)',
    'Vitamin A supplementation coverage among children aged 6-59 months (%)',
    'Use of insecticide-treated bed nets (%)',
    'HIV prevalence among adults aged 15-49 years (%)',
    'Antiretroviral therapy coverage (%)',
    'Tuberculosis incidence (per 100,000 population)',
    'Tuberculosis treatment success rate (%)',
    'Malaria incidence (per 1,000 population at risk)',
    'Population using improved drinking water sources (%)',
    'Population using improved sanitation facilities (%)',
    'Medical doctors (per 10,000 population)',
    'Nursing and midwifery personnel (per 10,000 population)',
    'Hospital beds (per 10,000 population)',
    'Total health expenditure as % of GDP',
    'Government health expenditure as % of total health expenditure',
    'Private health expenditure as % of total health expenditure',
    'Out-of-pocket health expenditure as % of total health expenditure',
    'Universal health coverage service coverage index',
    'Essential medicines availability (%)'
  ];

  const countries = generateComprehensiveHealthData();
  
  // Calculate health scores for all countries using the same algorithm as the map
  const countriesWithScores: Record<string, any> = {};
  
  Object.entries(countries).forEach(([iso3, countryData]: [string, any]) => {
    const healthScore = calculateWHOHealthScore(
      countryData.indicators,
      countries,
      healthIndicators
    );
    
    countriesWithScores[iso3] = {
      ...countryData,
      healthScore
    };
  });
  
  return countriesWithScores;
}

function generateComprehensiveHealthData() {
  // WHO Statistical Annex SDG3 - Direct values from WHO Health Statistics CSV
  const countryHealthData: Record<string, { name: string; indicators: Record<string, number> }> = {};

  // Authentic WHO CSV data - major countries with verified values
  const authenticWHOData: Record<string, any> = {
    'JPN': { name: 'Japan', lifeExp: 84.46067178, healthyLifeExp: 74.12146032 },
    'USA': { name: 'United States of America', lifeExp: 76.37368104, healthyLifeExp: 65.17070892 },
    'CHN': { name: 'China', lifeExp: 77.61619672, healthyLifeExp: 68.58451615 },
    'IND': { name: 'India', lifeExp: 67.30780612, healthyLifeExp: 56.62488892 },
    'BGD': { name: 'Bangladesh', lifeExp: 73.10251672, healthyLifeExp: 63.05118978 },
    'THA': { name: 'Thailand', lifeExp: 75.29014364, healthyLifeExp: 65.11158113 },
    'DEU': { name: 'Germany', lifeExp: 80.49140555, healthyLifeExp: 69.63460962 },
    'GBR': { name: 'United Kingdom', lifeExp: 80.10062783, healthyLifeExp: 69.31077576 },
    'FRA': { name: 'France', lifeExp: 81.92274175, healthyLifeExp: 71.67074698 },
    'CAN': { name: 'Canada', lifeExp: 81.58276248, healthyLifeExp: 69.78359679 },
    'AUS': { name: 'Australia', lifeExp: 83.10183853, healthyLifeExp: 70.60635821 },
    'BRA': { name: 'Brazil', lifeExp: 72.38840694, healthyLifeExp: 61.8265355 },
    'RUS': { name: 'Russian Federation', lifeExp: 71.34346181, healthyLifeExp: 63.19869509 },
    'ZAF': { name: 'South Africa', lifeExp: 62.34391594, healthyLifeExp: 53.49469421 },
    'NGA': { name: 'Nigeria', lifeExp: 52.67749023, healthyLifeExp: 45.3893044 },
    'ETH': { name: 'Ethiopia', lifeExp: 67.81374508, healthyLifeExp: 59.28527221 },
    'EGY': { name: 'Egypt', lifeExp: 72.01513672, healthyLifeExp: 62.5669229 },
    'IRN': { name: 'Iran (Islamic Republic of)', lifeExp: 76.68276978, healthyLifeExp: 66.32421135 },
    'TUR': { name: 'Turkey', lifeExp: 77.69485555, healthyLifeExp: 67.43764627 },
    'IDN': { name: 'Indonesia', lifeExp: 71.72485224, healthyLifeExp: 62.78843688 },
    'VNM': { name: 'Viet Nam', lifeExp: 75.40151515, healthyLifeExp: 66.10633664 },
    'PHL': { name: 'Philippines', lifeExp: 71.23109436, healthyLifeExp: 62.06632733 },
    'MEX': { name: 'Mexico', lifeExp: 75.05125555, healthyLifeExp: 65.40446472 },
    'ARG': { name: 'Argentina', lifeExp: 74.56898059, healthyLifeExp: 64.7943616 },
    'COL': { name: 'Colombia', lifeExp: 74.53297363, healthyLifeExp: 65.02156489 },
    'PER': { name: 'Peru', lifeExp: 76.74411773, healthyLifeExp: 66.6835742 },
    'CHL': { name: 'Chile', lifeExp: 79.02404788, healthyLifeExp: 67.65230473 },
    'VEN': { name: 'Venezuela (Bolivarian Republic of)', lifeExp: 70.55029297, healthyLifeExp: 60.82473755 },
    'ECU': { name: 'Ecuador', lifeExp: 78.14819336, healthyLifeExp: 67.77658081 },
    'BOL': { name: 'Bolivia (Plurinational State of)', lifeExp: 65.41062535, healthyLifeExp: 57.42539887 },
    'URY': { name: 'Uruguay', lifeExp: 75.44248962, healthyLifeExp: 65.47525024 },
    'PAK': { name: 'Pakistan', lifeExp: 67.27253723, healthyLifeExp: 58.46849823 },
    'KOR': { name: 'Republic of Korea', lifeExp: 83.67333984, healthyLifeExp: 73.15195465 },
    'MYS': { name: 'Malaysia', lifeExp: 74.88406372, healthyLifeExp: 64.80487061 },
    'SGP': { name: 'Singapore', lifeExp: 83.72413635, healthyLifeExp: 73.85858536 },
    'LKA': { name: 'Sri Lanka', lifeExp: 77.01593018, healthyLifeExp: 67.06719971 },
    'NPL': { name: 'Nepal', lifeExp: 70.78233719, healthyLifeExp: 61.63467026 },
    'AFG': { name: 'Afghanistan', lifeExp: 59.12690224, healthyLifeExp: 50.44624351 },
    'UZB': { name: 'Uzbekistan', lifeExp: 70.00853729, healthyLifeExp: 61.13465118 },
    'KAZ': { name: 'Kazakhstan', lifeExp: 69.39474487, healthyLifeExp: 60.70463562 },
    'SAU': { name: 'Saudi Arabia', lifeExp: 76.89282227, healthyLifeExp: 66.28967285 },
    'ARE': { name: 'United Arab Emirates', lifeExp: 79.15449219, healthyLifeExp: 68.4464874 },
    'QAT': { name: 'Qatar', lifeExp: 80.23429871, healthyLifeExp: 69.42939758 },
    'KWT': { name: 'Kuwait', lifeExp: 75.49090576, healthyLifeExp: 65.52319336 },
    'OMN': { name: 'Oman', lifeExp: 72.64020538, healthyLifeExp: 63.23014832 },
    'BHR': { name: 'Bahrain', lifeExp: 74.38371772, healthyLifeExp: 64.23784447 },
    'JOR': { name: 'Jordan', lifeExp: 74.52616119, healthyLifeExp: 64.50732422 },
    'LBN': { name: 'Lebanon', lifeExp: 78.93830109, healthyLifeExp: 68.05499268 },
    'ISR': { name: 'Israel', lifeExp: 82.97415161, healthyLifeExp: 71.67845154 },
    'PSE': { name: 'occupied Palestinian territory, including east Jerusalem', lifeExp: 74.05639648, healthyLifeExp: 64.3957901 }
  };

  // Process authentic WHO data for each country
  Object.entries(authenticWHOData).forEach(([iso3, data]) => {
    const indicators: Record<string, number> = {};
    
    // Direct WHO SDG3 indicators from CSV - exact values only
    indicators['Life expectancy at birth (years)'] = data.lifeExp;
    indicators['Healthy life expectancy at birth (years)'] = data.healthyLifeExp;
    
    // Store country data with only authentic WHO CSV values
    countryHealthData[iso3] = {
      name: data.name,
      indicators
    };
  });

  return countryHealthData;
}

// Get countries that lack comprehensive WHO data
export function getCountriesWithoutWHOData(): string[] {
  return [
    // Microstates without comprehensive reporting
    'VAT', // Vatican City
    'MCO', // Monaco  
    'SMR', // San Marino
    'LIE', // Liechtenstein
    'AND', // Andorra
    'MLT', // Malta (limited data)
    
    // Small island nations with limited reporting
    'NRU', // Nauru
    'TUV', // Tuvalu
    'PLW', // Palau
    'MHL', // Marshall Islands
    'FSM', // Micronesia
    'KIR', // Kiribati
    'COK', // Cook Islands
    'NIU', // Niue
    
    // Territories and dependencies
    'GRL', // Greenland (Denmark)
    'NCL', // New Caledonia (France)
    'GUF', // French Guiana (France)
    'PYF', // French Polynesia (France)
    'SPM', // Saint Pierre and Miquelon (France)
    'WLF', // Wallis and Futuna (France)
    
    // Some disputed territories not in standard WHO reporting
    'TWN', // Taiwan (complex WHO status)
  ];
}