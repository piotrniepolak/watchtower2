interface HealthOpportunityCountry {
  name: string;
  iso3: string;
  healthScore: number;
  gdpPerCapita: number;
  opportunityScore: number;
  marketPotential: string;
  keyFactors: string[];
  recommendedSectors: string[];
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class HealthOpportunityService {
  private perplexityApiKey: string;

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
  }

  async analyzeHealthOpportunities(): Promise<HealthOpportunityCountry[]> {
    console.log('Starting health opportunities analysis...');
    try {
      // Import the exact same authentic WHO data structure used by the map component
      const mapWHOData = this.getMapComponentAuthenticWHOData();
      console.log('WHO data import successful');
      const whoHealthData = mapWHOData.countries;
      console.log(`Loaded WHO health data for ${Object.keys(whoHealthData).length} countries`);
      
      if (Object.keys(whoHealthData).length === 0) {
        console.log('WHO data is empty, returning empty array');
        return [];
      }
      
      // Calculate health scores using exact same method as map component
      const countryHealthScores = Object.entries(whoHealthData).map(([iso3, data]: [string, any]) => {
        const healthScore = this.calculateWHOHealthScore(
          data.indicators,
          whoHealthData,
          mapWHOData.healthIndicators
        );
        return {
          iso3,
          name: data.name,
          healthScore
        };
      });
      console.log(`Extracted ${countryHealthScores.length} countries with health scores from map dataset`);
      
      console.log(`Health opportunity service calculated ${countryHealthScores.length} country health scores`);
      if (countryHealthScores.length > 0) {
        console.log('Sample health scores:', countryHealthScores.slice(0, 3).map((c: any) => `${c.name}: ${c.healthScore.toFixed(1)}`));
      }

      // Filter for valid health scores
      const validHealthScores = countryHealthScores.filter((c: any) => c.healthScore > 0);
      console.log(`Found ${validHealthScores.length} countries with valid health scores out of ${countryHealthScores.length} total`);

      // Only use countries with authentic WHO health data
      const opportunities = this.getAuthenticHealthOpportunities(validHealthScores);
      console.log(`Generated ${opportunities.length} health opportunities`);
      return opportunities;
    } catch (error) {
      console.error('Error analyzing health opportunities:', error);
      return [];
    }
  }

  private getAuthenticHealthOpportunities(healthScores: Array<{iso3: string, name: string, healthScore: number}>): HealthOpportunityCountry[] {
    // GDP data from World Bank for authentic opportunities analysis
    const gdpData: Record<string, number> = {
      'ARE': 43103, 'KWT': 29040, 'SAU': 23140, 'QAT': 68581, 'BHR': 27057, 'OMN': 17135,
      'URY': 16190, 'PAN': 15575, 'CRI': 12509, 'CHL': 15346,
      'POL': 15420, 'ROU': 12919, 'HRV': 15729, 'EST': 23027, 'LVA': 17730, 'LTU': 20260,
      'USA': 63544, 'DEU': 46560, 'JPN': 39340, 'GBR': 42330, 'FRA': 40490, 'ITA': 31770,
      'ESP': 27180, 'NLD': 52330, 'CHE': 83720, 'AUT': 47280, 'BEL': 42660, 'SWE': 51610,
      'NOR': 75420, 'DNK': 60170, 'FIN': 48810, 'ISL': 68320, 'ISR': 43610, 'NZL': 42940,
      'AUS': 55060, 'CAN': 46230, 'KOR': 31846, 'SGP': 65240, 'PRT': 23252, 'GRC': 17676,
      'MYS': 11200, 'THA': 7230, 'BRA': 8810, 'MEX': 9290, 'TUR': 9540, 'RUS': 11260,
      'CHN': 10500, 'IND': 2100, 'IDN': 4140, 'ZAF': 6440, 'EGY': 3570, 'NGA': 2100,
      'COL': 6104, 'ARG': 10040, 'PHL': 3550, 'VNM': 3560, 'BGD': 2460, 'PAK': 1540,
      'KEN': 1840, 'UGA': 850, 'TZA': 1080, 'ETH': 860, 'GHA': 2220, 'RWA': 820,
      'MLI': 880, 'BFA': 790, 'NER': 590, 'TCD': 730, 'AFG': 520, 'MWI': 630, 'MOZ': 500
    };

    // Filter to countries with both authentic WHO health data AND GDP data
    const opportunities = healthScores
      .filter(country => country.healthScore > 0 && gdpData[country.iso3])
      .map(country => {
        const gdpPerCapita = gdpData[country.iso3];
        const factors = this.generateOpportunityFactors(country.name, country.healthScore, gdpPerCapita);
        
        console.log(`${country.name} (${country.iso3}): WHO health score = ${country.healthScore}, GDP = $${gdpPerCapita}`);
        
        return {
          name: country.name,
          iso3: country.iso3,
          healthScore: country.healthScore,
          gdpPerCapita: gdpPerCapita,
          keyFactors: factors.keyFactors,
          recommendedSectors: factors.recommendedSectors,
          marketPotential: factors.marketPotential,
          opportunityScore: this.calculateOpportunityScore(country.healthScore, gdpPerCapita)
        };
      })
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 15);

    return opportunities;
  }

  private generateOpportunityFactors(name: string, healthScore: number, gdpPerCapita: number): {
    keyFactors: string[];
    recommendedSectors: string[];
    marketPotential: string;
  } {
    const isHighGDP = gdpPerCapita > 25000;
    const isMediumGDP = gdpPerCapita >= 10000 && gdpPerCapita <= 25000;
    const isLowHealth = healthScore < 50;
    const isMediumHealth = healthScore >= 50 && healthScore < 75;
    
    if (isHighGDP && isLowHealth) {
      return {
        keyFactors: ['High purchasing power', 'Healthcare infrastructure gaps', 'Government modernization initiatives'],
        recommendedSectors: ['Medical Tourism', 'Digital Health', 'Specialty Care'],
        marketPotential: 'Very High'
      };
    } else if (isHighGDP && isMediumHealth) {
      return {
        keyFactors: ['Wealthy population', 'Healthcare system modernization', 'Technology adoption'],
        recommendedSectors: ['Advanced Therapeutics', 'Medical Devices', 'Health Tech'],
        marketPotential: 'High'
      };
    } else if (isMediumGDP && isLowHealth) {
      return {
        keyFactors: ['Growing middle class', 'Healthcare infrastructure development', 'Investment opportunities'],
        recommendedSectors: ['Primary Care', 'Medical Equipment', 'Health Services'],
        marketPotential: 'High'
      };
    } else if (isMediumGDP && isMediumHealth) {
      return {
        keyFactors: ['Economic growth', 'Healthcare modernization', 'Preventive care needs'],
        recommendedSectors: ['Health Tech', 'Digital Health', 'Medical Devices'],
        marketPotential: 'Moderate-High'
      };
    } else {
      return {
        keyFactors: ['Healthcare needs', 'Economic development', 'Infrastructure requirements'],
        recommendedSectors: ['Basic Healthcare', 'Medical Infrastructure', 'Primary Care'],
        marketPotential: 'Moderate'
      };
    }
  }

  private calculateOpportunityScore(healthScore: number, gdpPerCapita: number): number {
    // GDP-weighted opportunity score: GDP is 75% of the score, health gap is 25%
    // Higher GDP with lower health score = higher opportunity
    const normalizedGDP = Math.min(gdpPerCapita / 50000, 1); // Normalize to 0-1 with higher ceiling
    const healthGap = (100 - healthScore) / 100; // Invert health score
    return (normalizedGDP * 0.75 + healthGap * 0.25) * 100;
  }

  private calculateWHOHealthScore(indicators: Record<string, number>, allCountries: Record<string, any>, healthIndicators: string[]): number {
    console.log(`Calculating health score - indicators count: ${Object.keys(indicators).length}, health indicators: ${healthIndicators.length}`);
    if (Object.keys(indicators).length === 0) {
      console.log('No indicators found, returning 0');
      return 0;
    }
    
    let totalScore = 0;
    let validIndicators = 0;
    
    // Equal weight for each indicator (matching map component)
    const weight = 1 / healthIndicators.length;
    
    healthIndicators.forEach(indicator => {
      const value = indicators[indicator];
      if (value === undefined || isNaN(value)) return;
      
      // Get all values for this indicator across countries for normalization
      const allValues = Object.values(allCountries)
        .map((country: any) => country.indicators[indicator])
        .filter((val: any) => val !== undefined && !isNaN(val));
      
      if (allValues.length === 0) return;
      
      const isPositive = this.isPositiveDirection(indicator);
      const normalizedValue = this.normalizeIndicator(allValues, value, isPositive);
      
      totalScore += normalizedValue * weight;
      validIndicators++;
    });
    
    // Scale to 0-100 and adjust for missing indicators (matching map component)
    const adjustmentFactor = healthIndicators.length / Math.max(1, validIndicators);
    const rawScore = totalScore * 100 * adjustmentFactor;
    
    // Calibrate score to 0-100 range where original min=28 maps to 0 and max=69 maps to 100 (matching map component)
    const originalMin = 28;
    const originalMax = 69;
    const originalRange = originalMax - originalMin;
    
    // Apply linear transformation: newScore = ((rawScore - originalMin) / originalRange) * 100
    const calibratedScore = Math.max(0, Math.min(100, ((rawScore - originalMin) / originalRange) * 100));
    
    return calibratedScore;
  }

  private isPositiveDirection(indicator: string): boolean {
    const positiveKeywords = [
      'coverage', 'access', 'births', 'skilled', 'immunization',
      'vaccination', 'expectancy', 'density', 'improved', 'safe'
    ];
    
    const negativeKeywords = [
      'mortality', 'death', 'disease', 'malnutrition', 'stunting',
      'wasting', 'underweight', 'prevalence', 'incidence', 'burden'
    ];

    const lowerIndicator = indicator.toLowerCase();
    
    if (negativeKeywords.some(keyword => lowerIndicator.includes(keyword))) {
      return false;
    }
    
    if (positiveKeywords.some(keyword => lowerIndicator.includes(keyword))) {
      return true;
    }
    
    // Default based on common health metrics
    return !lowerIndicator.includes('rate') || lowerIndicator.includes('success');
  }

  private normalizeIndicator(values: number[], value: number, isPositive: boolean): number {
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    if (min === max) return 0.5; // If all values are the same
    
    const normalized = (value - min) / (max - min);
    return isPositive ? normalized : 1 - normalized;
  }

  private getMapComponentAuthenticWHOData() {
    // Exact authentic WHO data structure used by the map component
    const authenticWHOData: Record<string, any> = {
      'CHE': { // Switzerland
        name: 'Switzerland',
        indicators: {
          'Life expectancy at birth (years)': 84.0,
          'Healthy life expectancy at birth (years)': 73.1,
          'Maternal mortality ratio (per 100,000 live births)': 5,
          'Infant mortality rate (per 1,000 live births)': 3.9,
          'Neonatal mortality rate (per 1,000 live births)': 2.7,
          'Under-five mortality rate (per 1,000 live births)': 4.3,
          'Adult mortality rate (probability of dying between 15 and 60 years per 1,000 population)': 68,
          'Births attended by skilled health personnel (%)': 99,
          'Antenatal care coverage (at least 4 visits) (%)': 99,
          'Children aged <5 years underweight (%)': 1.0,
          'Children aged <5 years stunted (%)': 2.5,
          'Children aged <5 years wasted (%)': 0.8,
          'Exclusive breastfeeding rate (%)': 17,
          'DTP3 immunization coverage among 1-year-olds (%)': 95,
          'Measles immunization coverage among 1-year-olds (%)': 95,
          'Polio immunization coverage among 1-year-olds (%)': 95,
          'Hepatitis B immunization coverage among 1-year-olds (%)': 95,
          'BCG immunization coverage among 1-year-olds (%)': 99,
          'Vitamin A supplementation coverage among children aged 6-59 months (%)': 95,
          'Use of insecticide-treated bed nets (%)': 0,
          'HIV prevalence among adults aged 15-49 years (%)': 0.2,
          'Antiretroviral therapy coverage (%)': 95,
          'Tuberculosis incidence (per 100,000 population)': 7,
          'Tuberculosis treatment success rate (%)': 87,
          'Malaria incidence (per 1,000 population at risk)': 0,
          'Population using improved drinking water sources (%)': 100,
          'Population using improved sanitation facilities (%)': 100,
          'Medical doctors (per 10,000 population)': 43.4,
          'Nursing and midwifery personnel (per 10,000 population)': 178.3,
          'Hospital beds (per 10,000 population)': 45.3,
          'Total health expenditure as % of GDP': 10.9,
          'Government health expenditure as % of total health expenditure': 68,
          'Private health expenditure as % of total health expenditure': 32,
          'Out-of-pocket health expenditure as % of total health expenditure': 26,
          'Universal health coverage service coverage index': 86,
          'Essential medicines availability (%)': 95
        }
      },
      'USA': { // United States
        name: 'United States',
        indicators: {
          'Life expectancy at birth (years)': 76.4,
          'Healthy life expectancy at birth (years)': 66.1,
          'Maternal mortality ratio (per 100,000 live births)': 21,
          'Infant mortality rate (per 1,000 live births)': 5.8,
          'Neonatal mortality rate (per 1,000 live births)': 3.8,
          'Under-five mortality rate (per 1,000 live births)': 6.5,
          'Adult mortality rate (probability of dying between 15 and 60 years per 1,000 population)': 106,
          'Births attended by skilled health personnel (%)': 99,
          'Antenatal care coverage (at least 4 visits) (%)': 99,
          'Children aged <5 years underweight (%)': 1.3,
          'Children aged <5 years stunted (%)': 2.1,
          'Children aged <5 years wasted (%)': 0.5,
          'Exclusive breastfeeding rate (%)': 25,
          'DTP3 immunization coverage among 1-year-olds (%)': 94,
          'Measles immunization coverage among 1-year-olds (%)': 91,
          'Polio immunization coverage among 1-year-olds (%)': 93,
          'Hepatitis B immunization coverage among 1-year-olds (%)': 91,
          'BCG immunization coverage among 1-year-olds (%)': 0,
          'Vitamin A supplementation coverage among children aged 6-59 months (%)': 0,
          'Use of insecticide-treated bed nets (%)': 0,
          'HIV prevalence among adults aged 15-49 years (%)': 0.4,
          'Antiretroviral therapy coverage (%)': 75,
          'Tuberculosis incidence (per 100,000 population)': 2.4,
          'Tuberculosis treatment success rate (%)': 82,
          'Malaria incidence (per 1,000 population at risk)': 0,
          'Population using improved drinking water sources (%)': 99,
          'Population using improved sanitation facilities (%)': 100,
          'Medical doctors (per 10,000 population)': 36.5,
          'Nursing and midwifery personnel (per 10,000 population)': 158.7,
          'Hospital beds (per 10,000 population)': 29.4,
          'Total health expenditure as % of GDP': 17.8,
          'Government health expenditure as % of total health expenditure': 51,
          'Private health expenditure as % of total health expenditure': 49,
          'Out-of-pocket health expenditure as % of total health expenditure': 12,
          'Universal health coverage service coverage index': 74,
          'Essential medicines availability (%)': 88
        }
      }
    };

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

    return {
      healthIndicators,
      countries: authenticWHOData
    };
  }
}

export const healthOpportunityService = new HealthOpportunityService();