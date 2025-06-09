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

export class HealthOpportunityService {
  constructor() {}

  async analyzeHealthOpportunities(): Promise<HealthOpportunityCountry[]> {
    console.log('Starting health opportunities analysis...');
    try {
      // Import the exact same WHO data function used by the map component
      const { generateAuthenticWHOData } = await import('../shared/who-data');
      const mapWHOData = generateAuthenticWHOData();
      console.log('WHO data import successful');
      const whoHealthData = mapWHOData.countries;
      console.log(`Loaded WHO health data for ${Object.keys(whoHealthData).length} countries`);
      
      if (Object.keys(whoHealthData).length === 0) {
        console.log('WHO data is empty, returning empty array');
        return [];
      }
      
      // Use the pre-calculated health scores directly from the map data (identical to map display)
      const countryHealthScores = Object.entries(whoHealthData).map(([iso3, data]: [string, any]) => ({
        iso3,
        name: data.name,
        healthScore: data.healthScore // Use exact score from map component
      }));
      console.log(`Extracted ${countryHealthScores.length} countries with health scores from map dataset`);
      
      if (countryHealthScores.length > 0) {
        console.log('Sample health scores:', countryHealthScores.slice(0, 3).map((c: any) => `${c.name}: ${c.healthScore.toFixed(1)}`));
        
        // Log specific countries for verification
        const usaData = countryHealthScores.find((c: any) => c.name === 'United States');
        const switzerlandData = countryHealthScores.find((c: any) => c.name === 'Switzerland');
        if (usaData) console.log(`USA health score: ${usaData.healthScore.toFixed(1)}`);
        if (switzerlandData) console.log(`Switzerland health score: ${switzerlandData.healthScore.toFixed(1)}`);
        if (!usaData) console.log('USA not found in health data');
        
        // Log all country names to verify what's available
        console.log('Available countries:', countryHealthScores.map((c: any) => c.name).sort().slice(0, 10));
      }

      // Filter for valid health scores
      const validHealthScores = countryHealthScores.filter((c: any) => c.healthScore > 0);
      console.log(`Found ${validHealthScores.length} countries with valid health scores out of ${countryHealthScores.length} total`);

      // Generate opportunities using exact same data as map
      const opportunities = this.getAuthenticHealthOpportunities(validHealthScores);
      console.log(`Generated ${opportunities.length} health opportunities`);
      
      return opportunities;
    } catch (error) {
      console.error('Error in health opportunities analysis:', error);
      return [];
    }
  }

  private getAuthenticHealthOpportunities(healthScores: Array<{iso3: string, name: string, healthScore: number}>): HealthOpportunityCountry[] {
    // Sort by health score (ascending - lower scores indicate higher opportunities)
    const sortedCountries = healthScores.sort((a, b) => a.healthScore - b.healthScore);
    
    // Take top 15 countries with lowest health scores (highest opportunity potential)
    const topOpportunities = sortedCountries.slice(0, 15);
    
    return topOpportunities.map((country) => {
      const gdpPerCapita = this.getGDPPerCapita(country.iso3);
      const opportunityFactors = this.generateOpportunityFactors(country.name, country.healthScore, gdpPerCapita);
      
      console.log(`${country.name} (${country.iso3}): WHO health score = ${country.healthScore.toFixed(1)}, GDP = $${gdpPerCapita}`);
      
      return {
        name: country.name,
        iso3: country.iso3,
        healthScore: country.healthScore,
        gdpPerCapita,
        opportunityScore: this.calculateOpportunityScore(country.healthScore, gdpPerCapita),
        marketPotential: opportunityFactors.marketPotential,
        keyFactors: opportunityFactors.keyFactors,
        recommendedSectors: opportunityFactors.recommendedSectors
      };
    });
  }

  private calculateWHOHealthScore(
    indicators: Record<string, number>,
    allCountries: Record<string, any>,
    healthIndicators: string[]
  ): number {
    if (!indicators || Object.keys(indicators).length === 0) {
      return 0;
    }

    // Extract all values for normalization
    const allValues: Record<string, number[]> = {};
    
    Object.values(allCountries).forEach((country: any) => {
      if (country.indicators) {
        healthIndicators.forEach(indicator => {
          if (!allValues[indicator]) allValues[indicator] = [];
          if (typeof country.indicators[indicator] === 'number') {
            allValues[indicator].push(country.indicators[indicator]);
          }
        });
      }
    });

    // Calculate normalized scores for each indicator
    const scores: number[] = [];
    
    healthIndicators.forEach(indicator => {
      if (typeof indicators[indicator] === 'number' && allValues[indicator] && allValues[indicator].length > 1) {
        const isPositive = this.isPositiveDirection(indicator);
        const normalizedScore = this.normalizeIndicator(allValues[indicator], indicators[indicator], isPositive);
        scores.push(normalizedScore);
      }
    });

    if (scores.length === 0) return 0;

    // Calculate average score and convert to 0-100 scale
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return averageScore * 100;
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
    
    const indicatorLower = indicator.toLowerCase();
    
    if (positiveKeywords.some(keyword => indicatorLower.includes(keyword))) {
      return true;
    }
    
    if (negativeKeywords.some(keyword => indicatorLower.includes(keyword))) {
      return false;
    }
    
    return true;
  }

  private normalizeIndicator(values: number[], value: number, isPositive: boolean): number {
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    if (max === min) return 0.5;
    
    if (isPositive) {
      return (value - min) / (max - min);
    } else {
      return (max - value) / (max - min);
    }
  }

  private generateOpportunityFactors(name: string, healthScore: number, gdpPerCapita: number): {
    marketPotential: string;
    keyFactors: string[];
    recommendedSectors: string[];
  } {
    const isLowIncome = gdpPerCapita < 5000;
    const isLowHealth = healthScore < 50;
    
    let marketPotential: string;
    if (isLowIncome && isLowHealth) {
      marketPotential = 'High - Significant unmet healthcare needs with growth potential';
    } else if (isLowHealth) {
      marketPotential = 'Medium-High - Healthcare infrastructure gaps with economic capacity';
    } else if (isLowIncome) {
      marketPotential = 'Medium - Limited economic capacity but stable health foundation';
    } else {
      marketPotential = 'Low-Medium - Established healthcare system with niche opportunities';
    }

    const keyFactors: string[] = [];
    const recommendedSectors: string[] = [];

    if (healthScore < 30) {
      keyFactors.push('Critical healthcare infrastructure gaps');
      keyFactors.push('High disease burden requiring intervention');
      recommendedSectors.push('Primary Healthcare');
      recommendedSectors.push('Infectious Disease Control');
    } else if (healthScore < 50) {
      keyFactors.push('Moderate healthcare system weaknesses');
      keyFactors.push('Emerging healthcare needs');
      recommendedSectors.push('Healthcare Technology');
      recommendedSectors.push('Preventive Care');
    }

    if (gdpPerCapita < 2000) {
      keyFactors.push('Low-income market requiring cost-effective solutions');
      recommendedSectors.push('Mobile Health Solutions');
    } else if (gdpPerCapita < 10000) {
      keyFactors.push('Middle-income market with growing healthcare demand');
      recommendedSectors.push('Telemedicine');
      recommendedSectors.push('Medical Devices');
    } else {
      keyFactors.push('Higher-income market seeking advanced healthcare');
      recommendedSectors.push('Specialized Medical Services');
      recommendedSectors.push('Health Technology Innovation');
    }

    return {
      marketPotential,
      keyFactors,
      recommendedSectors
    };
  }

  private calculateOpportunityScore(healthScore: number, gdpPerCapita: number): number {
    // Lower health score = higher opportunity (inverted)
    const healthFactor = (100 - healthScore) / 100;
    
    // GDP factor - sweet spot is middle income (not too poor, not too rich)
    let gdpFactor: number;
    if (gdpPerCapita < 1000) {
      gdpFactor = 0.3; // Very low purchasing power
    } else if (gdpPerCapita < 5000) {
      gdpFactor = 0.8; // Good opportunity market
    } else if (gdpPerCapita < 20000) {
      gdpFactor = 1.0; // Optimal market
    } else if (gdpPerCapita < 50000) {
      gdpFactor = 0.6; // Established market
    } else {
      gdpFactor = 0.2; // Saturated market
    }
    
    return Math.round((healthFactor * 0.7 + gdpFactor * 0.3) * 100);
  }

  private getGDPPerCapita(iso3: string): number {
    const gdpData: Record<string, number> = {
      // High-income countries
      'CHE': 83720, // Switzerland
      'JPN': 39340, // Japan
      'AUS': 55060, // Australia
      'SWE': 51610, // Sweden
      'NOR': 75420, // Norway
      'DNK': 60170, // Denmark
      'FIN': 48810, // Finland
      'NLD': 52330, // Netherlands
      'DEU': 46560, // Germany
      'FRA': 40490, // France
      'GBR': 42330, // United Kingdom
      'CAN': 46230, // Canada
      'USA': 63544, // United States
      'SGP': 65240, // Singapore
      'KOR': 31846, // South Korea
      'ITA': 31770, // Italy
      'ESP': 27180, // Spain
      'PRT': 23252, // Portugal
      'GRC': 17676, // Greece
      'ISR': 43610, // Israel
      'NZL': 42940, // New Zealand
      'AUT': 47280, // Austria
      'BEL': 42660, // Belgium
      'ISL': 68320, // Iceland
      'ARE': 43103, // United Arab Emirates
      'QAT': 68581, // Qatar
      'KWT': 29040, // Kuwait
      'SAU': 23140, // Saudi Arabia
      'BHR': 27057, // Bahrain
      'OMN': 17135, // Oman
      'URY': 16190, // Uruguay
      'CHL': 15346, // Chile
      'PAN': 15575, // Panama
      'CRI': 12509, // Costa Rica
      'POL': 15420, // Poland
      'EST': 23027, // Estonia
      'LVA': 17730, // Latvia
      'LTU': 20260, // Lithuania
      'HRV': 15729, // Croatia
      
      // Upper-middle income countries
      'BRA': 8810, // Brazil
      'MEX': 9290, // Mexico
      'TUR': 9540, // Turkey
      'THA': 7230, // Thailand
      'MYS': 11200, // Malaysia
      'COL': 6104, // Colombia
      'ZAF': 6440, // South Africa
      'CHN': 10500, // China
      'RUS': 11260, // Russia
      'ARG': 10040, // Argentina
      'ROU': 12919, // Romania
      
      // Lower-middle income countries
      'IND': 2100, // India
      'IDN': 4140, // Indonesia
      'PHL': 3550, // Philippines
      'VNM': 3560, // Vietnam
      'EGY': 3570, // Egypt
      'BGD': 2460, // Bangladesh
      'PAK': 1540, // Pakistan
      
      // Low-income countries
      'AFG': 520, // Afghanistan
      'TCD': 730, // Chad
      'MLI': 880, // Mali
      'BFA': 790, // Burkina Faso
      'NER': 590, // Niger
      'ETH': 860, // Ethiopia
      'MWI': 630, // Malawi
      'MOZ': 500, // Mozambique
    };
    
    return gdpData[iso3] || 5000;
  }


}

export const healthOpportunityService = new HealthOpportunityService();