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
    // Only include countries with authentic WHO health data - no synthetic data
    
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