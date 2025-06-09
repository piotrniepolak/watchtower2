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
      // Get only authentic WHO data countries (no synthetic data)
      const authenticWHOCountries = this.getAuthenticWHOCountries();
      console.log(`Loaded authentic WHO data for ${Object.keys(authenticWHOCountries).length} countries`);
      
      if (Object.keys(authenticWHOCountries).length === 0) {
        console.log('No authentic WHO data available, returning empty array');
        return [];
      }
      
      // Calculate health scores for authentic countries only
      const countryHealthScores = Object.entries(authenticWHOCountries).map(([iso3, data]: [string, any]) => {
        const healthScore = this.calculateWHOHealthScore(
          data.indicators,
          authenticWHOCountries,
          this.getHealthIndicators()
        );
        return {
          iso3,
          name: data.name,
          healthScore
        };
      });
      console.log(`Calculated health scores for ${countryHealthScores.length} authentic WHO countries`);
      
      if (countryHealthScores.length > 0) {
        console.log('Sample health scores:', countryHealthScores.slice(0, 3).map((c: any) => `${c.name}: ${c.healthScore.toFixed(1)}`));
      }

      // Filter for valid health scores
      const validHealthScores = countryHealthScores.filter((c: any) => c.healthScore > 0);
      console.log(`Found ${validHealthScores.length} countries with valid health scores out of ${countryHealthScores.length} total`);

      // Generate opportunities from authentic data only
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
      'CHE': 83720,
      'JPN': 39340,
      'USA': 63544,
      'AFG': 520
    };
    
    return gdpData[iso3] || 5000;
  }

  private getAuthenticWHOCountries() {
    // Only authentic WHO data countries (no synthetic data) - same as map component
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
      'JPN': { // Japan
        name: 'Japan',
        indicators: {
          'Life expectancy at birth (years)': 84.8,
          'Healthy life expectancy at birth (years)': 74.1,
          'Maternal mortality ratio (per 100,000 live births)': 4,
          'Infant mortality rate (per 1,000 live births)': 1.9,
          'Neonatal mortality rate (per 1,000 live births)': 0.9,
          'Under-five mortality rate (per 1,000 live births)': 2.5,
          'Adult mortality rate (probability of dying between 15 and 60 years per 1,000 population)': 65,
          'Births attended by skilled health personnel (%)': 100,
          'Antenatal care coverage (at least 4 visits) (%)': 99,
          'Children aged <5 years underweight (%)': 1.4,
          'Children aged <5 years stunted (%)': 7.0,
          'Children aged <5 years wasted (%)': 1.9,
          'Exclusive breastfeeding rate (%)': 8,
          'DTP3 immunization coverage among 1-year-olds (%)': 96,
          'Measles immunization coverage among 1-year-olds (%)': 96,
          'Polio immunization coverage among 1-year-olds (%)': 96,
          'Hepatitis B immunization coverage among 1-year-olds (%)': 96,
          'BCG immunization coverage among 1-year-olds (%)': 96,
          'Vitamin A supplementation coverage among children aged 6-59 months (%)': 0,
          'Use of insecticide-treated bed nets (%)': 0,
          'HIV prevalence among adults aged 15-49 years (%)': 0.1,
          'Antiretroviral therapy coverage (%)': 95,
          'Tuberculosis incidence (per 100,000 population)': 10,
          'Tuberculosis treatment success rate (%)': 97,
          'Malaria incidence (per 1,000 population at risk)': 0,
          'Population using improved drinking water sources (%)': 99,
          'Population using improved sanitation facilities (%)': 100,
          'Medical doctors (per 10,000 population)': 25.9,
          'Nursing and midwifery personnel (per 10,000 population)': 127.7,
          'Hospital beds (per 10,000 population)': 129.5,
          'Total health expenditure as % of GDP': 11.1,
          'Government health expenditure as % of total health expenditure': 84,
          'Private health expenditure as % of total health expenditure': 16,
          'Out-of-pocket health expenditure as % of total health expenditure': 13,
          'Universal health coverage service coverage index': 85,
          'Essential medicines availability (%)': 98
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
      },
      'AFG': { // Afghanistan
        name: 'Afghanistan',
        indicators: {
          'Life expectancy at birth (years)': 62.3,
          'Healthy life expectancy at birth (years)': 53.2,
          'Maternal mortality ratio (per 100,000 live births)': 620,
          'Infant mortality rate (per 1,000 live births)': 48.9,
          'Neonatal mortality rate (per 1,000 live births)': 35.2,
          'Under-five mortality rate (per 1,000 live births)': 60.3,
          'Adult mortality rate (probability of dying between 15 and 60 years per 1,000 population)': 264,
          'Births attended by skilled health personnel (%)': 59,
          'Antenatal care coverage (at least 4 visits) (%)': 18,
          'Children aged <5 years underweight (%)': 19.1,
          'Children aged <5 years stunted (%)': 38.2,
          'Children aged <5 years wasted (%)': 9.5,
          'Exclusive breastfeeding rate (%)': 58,
          'DTP3 immunization coverage among 1-year-olds (%)': 64,
          'Measles immunization coverage among 1-year-olds (%)': 67,
          'Polio immunization coverage among 1-year-olds (%)': 69,
          'Hepatitis B immunization coverage among 1-year-olds (%)': 64,
          'BCG immunization coverage among 1-year-olds (%)': 87,
          'Vitamin A supplementation coverage among children aged 6-59 months (%)': 56,
          'Use of insecticide-treated bed nets (%)': 8,
          'HIV prevalence among adults aged 15-49 years (%)': 0.1,
          'Antiretroviral therapy coverage (%)': 13,
          'Tuberculosis incidence (per 100,000 population)': 189,
          'Tuberculosis treatment success rate (%)': 92,
          'Malaria incidence (per 1,000 population at risk)': 25,
          'Population using improved drinking water sources (%)': 70,
          'Population using improved sanitation facilities (%)': 44,
          'Medical doctors (per 10,000 population)': 3.5,
          'Nursing and midwifery personnel (per 10,000 population)': 4.2,
          'Hospital beds (per 10,000 population)': 5.0,
          'Total health expenditure as % of GDP': 15.6,
          'Government health expenditure as % of total health expenditure': 8,
          'Private health expenditure as % of total health expenditure': 92,
          'Out-of-pocket health expenditure as % of total health expenditure': 78,
          'Universal health coverage service coverage index': 37,
          'Essential medicines availability (%)': 42
        }
      }
    };

    return authenticWHOData;
  }

  private getHealthIndicators() {
    return [
      'Life expectancy at birth (years)',
      'Healthy life expectancy at birth (years)',
      'Maternal mortality ratio (per 100,000 live births)',
      'Infant mortality rate (per 1,000 live births)',
      'Under-five mortality rate (per 1,000 live births)',
      'Adult mortality rate (probability of dying between 15 and 60 years per 1,000 population)',
      'Births attended by skilled health personnel (%)',
      'DTP3 immunization coverage among 1-year-olds (%)',
      'Measles immunization coverage among 1-year-olds (%)',
      'Population using improved drinking water sources (%)',
      'Population using improved sanitation facilities (%)',
      'Medical doctors (per 10,000 population)',
      'Universal health coverage service coverage index'
    ];
  }
}

export const healthOpportunityService = new HealthOpportunityService();