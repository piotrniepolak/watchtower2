import { generateAuthenticWHOData } from '../shared/who-data';

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
    try {
      // Calculate authentic WHO health scores for all countries
      const { countries } = generateAuthenticWHOData();
      
      // Calculate health scores for each country based on 36 WHO indicators
      const countryHealthScores = countries.map((country: any) => {
        const healthScore = this.calculateWHOHealthScore(
          country.indicators,
          countries.reduce((acc: any, c: any) => ({...acc, [c.iso3]: c}), {}),
          Object.keys(country.indicators)
        );
        return {
          iso3: country.iso3,
          name: country.name,
          healthScore
        };
      });
      
      console.log(`Health opportunity service calculated ${countryHealthScores.length} country health scores`);
      console.log('Sample health scores:', countryHealthScores.slice(0, 5).map(c => `${c.name}: ${c.healthScore.toFixed(1)}`));

      // Only use countries with authentic WHO health data
      return this.getAuthenticHealthOpportunities(countryHealthScores);
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
        
        console.log(`${country.name} (${country.iso3}): WHO health score = ${country.healthScore.toFixed(1)}, GDP = $${gdpPerCapita}`);
        
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
    return Math.round((normalizedGDP * 0.75 + healthGap * 0.25) * 100);
  }

  private calculateWHOHealthScore(indicators: Record<string, number>, allCountries: Record<string, any>, healthIndicators: string[]): number {
    if (Object.keys(indicators).length === 0) return 0;
    
    let totalScore = 0;
    let validIndicators = 0;

    // Get all indicator values across countries for normalization
    const allIndicatorValues: Record<string, number[]> = {};
    Object.values(allCountries).forEach((country: any) => {
      Object.entries(country.indicators || {}).forEach(([indicator, value]) => {
        if (!allIndicatorValues[indicator]) allIndicatorValues[indicator] = [];
        allIndicatorValues[indicator].push(value as number);
      });
    });

    healthIndicators.forEach(indicator => {
      const value = indicators[indicator];
      if (value !== undefined && value !== null && !isNaN(value)) {
        const indicatorValues = allIndicatorValues[indicator] || [];
        if (indicatorValues.length > 0) {
          const isPositive = this.isPositiveDirection(indicator);
          const normalizedScore = this.normalizeIndicator(indicatorValues, value, isPositive);
          totalScore += normalizedScore;
          validIndicators++;
        }
      }
    });

    return validIndicators > 0 ? (totalScore / validIndicators) * 100 : 0;
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
}

export const healthOpportunityService = new HealthOpportunityService();