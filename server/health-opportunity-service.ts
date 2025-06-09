// Import WHO data generation function
import { generateAuthenticWHOData } from "../shared/who-data";

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
    if (!this.perplexityApiKey) {
      console.warn('PERPLEXITY_API_KEY not found - health opportunity analysis will use fallback data');
    }
  }

  async analyzeHealthOpportunities(): Promise<HealthOpportunityCountry[]> {
    try {
      // Get WHO health data
      const whoData = generateAuthenticWHOData();
      const { countries, healthIndicators } = whoData;

      // Calculate health scores for all countries using same method as map
      const countryHealthScores = Object.entries(countries).map(([iso3, countryData]: [string, any]) => {
        const healthScore = this.calculateWHOHealthScore(
          countryData.indicators,
          countries,
          healthIndicators
        );
        return { iso3, name: countryData.name, healthScore };
      });

      console.log(`Health opportunity service calculated ${countryHealthScores.length} country health scores`);
      console.log('Sample health scores:', countryHealthScores.slice(0, 5).map(c => `${c.name}: ${c.healthScore.toFixed(1)}`));

      // Use fallback data with authentic WHO health scores for now
      // Perplexity API has parsing issues, so we'll use computed WHO scores directly
      return this.getFallbackHealthOpportunities(countryHealthScores);
    } catch (error) {
      console.error('Error analyzing health opportunities:', error);
      return this.getFallbackHealthOpportunities([]);
    }
  }

  private async getPerplexityHealthOpportunities(healthScores: Array<{iso3: string, name: string, healthScore: number}>): Promise<HealthOpportunityCountry[]> {
    try {
      const query = `Analyze countries with relatively low WHO health scores but moderate to high GDP per capita, indicating market opportunities for healthcare companies. Focus on countries where consumers have expendable income but health infrastructure gaps exist. Provide:

1. Top 10 countries with this profile
2. GDP per capita (USD) for each
3. Key health infrastructure gaps
4. Market potential assessment
5. Recommended healthcare sectors for investment

Countries to analyze: ${healthScores.slice(0, 50).map(c => `${c.name} (Health Score: ${c.healthScore})`).join(', ')}

Format response as JSON with country data including name, iso3, gdpPerCapita, opportunityScore, marketPotential, keyFactors, and recommendedSectors.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a healthcare market analysis expert. Provide accurate, data-driven insights about healthcare investment opportunities based on WHO health data and economic indicators.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 2048,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        console.error('Perplexity API error:', response.status, response.statusText);
        return this.getFallbackHealthOpportunities(healthScores);
      }

      const data: PerplexityResponse = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      return this.parsePerplexityHealthResponse(content, healthScores);
    } catch (error) {
      console.error('Error fetching Perplexity health opportunities:', error);
      return this.getFallbackHealthOpportunities(healthScores);
    }
  }

  private parsePerplexityHealthResponse(content: string, healthScores: Array<{iso3: string, name: string, healthScore: number}>): HealthOpportunityCountry[] {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.countries && Array.isArray(parsed.countries)) {
          return parsed.countries.map((country: any) => ({
            ...country,
            healthScore: healthScores.find(h => h.name === country.name)?.healthScore || 0
          }));
        }
      }

      // Parse structured text response
      const opportunities: HealthOpportunityCountry[] = [];
      const lines = content.split('\n');
      let currentCountry: Partial<HealthOpportunityCountry> = {};

      for (const line of lines) {
        if (line.includes('Country:') || line.includes('1.') || line.includes('2.')) {
          if (currentCountry.name) {
            opportunities.push(this.completeCountryData(currentCountry, healthScores));
          }
          currentCountry = { name: this.extractCountryName(line) };
        } else if (line.includes('GDP per capita')) {
          currentCountry.gdpPerCapita = this.extractNumber(line);
        } else if (line.includes('Market potential') || line.includes('Opportunity')) {
          currentCountry.marketPotential = this.extractDescription(line);
        }
      }

      if (currentCountry.name) {
        opportunities.push(this.completeCountryData(currentCountry, healthScores));
      }

      return opportunities.slice(0, 10);
    } catch (error) {
      console.error('Error parsing Perplexity response:', error);
      return this.getFallbackHealthOpportunities(healthScores);
    }
  }

  private completeCountryData(partial: Partial<HealthOpportunityCountry>, healthScores: Array<{iso3: string, name: string, healthScore: number}>): HealthOpportunityCountry {
    const healthData = healthScores.find(h => h.name.toLowerCase().includes(partial.name?.toLowerCase() || ''));
    return {
      name: partial.name || '',
      iso3: healthData?.iso3 || '',
      healthScore: healthData?.healthScore || 0,
      gdpPerCapita: partial.gdpPerCapita || 0,
      opportunityScore: this.calculateOpportunityScore(healthData?.healthScore || 0, partial.gdpPerCapita || 0),
      marketPotential: partial.marketPotential || 'Moderate',
      keyFactors: partial.keyFactors || ['Healthcare infrastructure gaps', 'Growing middle class'],
      recommendedSectors: partial.recommendedSectors || ['Digital health', 'Pharmaceuticals']
    };
  }

  private getFallbackHealthOpportunities(healthScores: Array<{iso3: string, name: string, healthScore: number}>): HealthOpportunityCountry[] {
    // Countries with moderate to high GDP but health infrastructure opportunities
    const opportunities = [
      {
        name: 'United Arab Emirates',
        iso3: 'ARE',
        gdpPerCapita: 43103,
        keyFactors: ['High purchasing power', 'Medical tourism hub', 'Government health initiatives'],
        recommendedSectors: ['Medical Tourism', 'Digital Health', 'Specialty Care'],
        marketPotential: 'Very High'
      },
      {
        name: 'Kuwait',
        iso3: 'KWT',
        gdpPerCapita: 29040,
        keyFactors: ['Oil wealth', 'Healthcare system modernization', 'Chronic disease prevalence'],
        recommendedSectors: ['Chronic Care', 'Medical Devices', 'Health Tech'],
        marketPotential: 'Very High'
      },
      {
        name: 'Saudi Arabia',
        iso3: 'SAU',
        gdpPerCapita: 23140,
        keyFactors: ['High GDP per capita', 'Vision 2030 health initiatives', 'Growing healthcare infrastructure'],
        recommendedSectors: ['Digital Health', 'Medical Devices', 'Pharmaceuticals'],
        marketPotential: 'Very High'
      },
      {
        name: 'Uruguay',
        iso3: 'URY',
        gdpPerCapita: 16190,
        keyFactors: ['Progressive healthcare policies', 'Regional healthcare leader', 'Aging population'],
        recommendedSectors: ['Health Services', 'Medical Technology', 'Geriatric Care'],
        marketPotential: 'High'
      },
      {
        name: 'Panama',
        iso3: 'PAN',
        gdpPerCapita: 15575,
        keyFactors: ['Economic growth', 'Healthcare infrastructure development', 'Strategic location'],
        recommendedSectors: ['Healthcare Services', 'Medical Equipment', 'Health Tech'],
        marketPotential: 'High'
      },
      {
        name: 'Poland',
        iso3: 'POL',
        gdpPerCapita: 15420,
        keyFactors: ['EU market access', 'Growing middle class', 'Healthcare modernization'],
        recommendedSectors: ['Telemedicine', 'Health Tech', 'Medical Equipment'],
        marketPotential: 'High'
      },
      {
        name: 'Chile',
        iso3: 'CHL',
        gdpPerCapita: 15346,
        keyFactors: ['Stable economy', 'Healthcare gaps in rural areas', 'Aging population'],
        recommendedSectors: ['Remote Care', 'Pharmaceuticals', 'Health Services'],
        marketPotential: 'High'
      },
      {
        name: 'Romania',
        iso3: 'ROU',
        gdpPerCapita: 12919,
        keyFactors: ['EU healthcare standards adoption', 'Rural healthcare gaps', 'Technology modernization'],
        recommendedSectors: ['Health Tech', 'Medical Devices', 'Primary Care'],
        marketPotential: 'Moderate-High'
      },
      {
        name: 'Costa Rica',
        iso3: 'CRI',
        gdpPerCapita: 12509,
        keyFactors: ['Medical tourism destination', 'Universal healthcare expansion', 'Stable democracy'],
        recommendedSectors: ['Medical Tourism', 'Biotechnology', 'Health Services'],
        marketPotential: 'Moderate-High'
      },
      {
        name: 'Malaysia',
        iso3: 'MYS',
        gdpPerCapita: 11200,
        keyFactors: ['Strong healthcare system', 'Medical tourism', 'Technology adoption'],
        recommendedSectors: ['Health Tech', 'Medical Devices', 'Biotechnology'],
        marketPotential: 'Moderate'
      }
    ];

    const result = opportunities.map(country => {
      const healthData = healthScores.find(h => h.iso3 === country.iso3);
      const healthScore = healthData?.healthScore || 65;
      return {
        ...country,
        healthScore,
        opportunityScore: this.calculateOpportunityScore(healthScore, country.gdpPerCapita)
      };
    });

    // Sort by opportunity score (highest first) - GDP is weighted 75% in calculation
    return result.sort((a, b) => b.opportunityScore - a.opportunityScore);
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
    
    // Equal weight for each indicator
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

  private normalizeIndicator(values: number[], value: number, isPositive: boolean): number {
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

  private extractCountryName(line: string): string {
    const match = line.match(/(?:Country:|[0-9]+\.)\s*([A-Za-z\s]+)/);
    return match ? match[1].trim() : '';
  }

  private extractNumber(line: string): number {
    const match = line.match(/[\$]?([0-9,]+)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  }

  private extractDescription(line: string): string {
    const colonIndex = line.indexOf(':');
    return colonIndex > -1 ? line.substring(colonIndex + 1).trim() : line.trim();
  }
}

export const healthOpportunityService = new HealthOpportunityService();