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

      // Calculate health scores for all countries
      const countryHealthScores = Object.entries(countries).map(([iso3, countryData]: [string, any]) => {
        const healthScore = this.calculateWHOHealthScore(
          countryData.indicators,
          countries,
          healthIndicators
        );
        return { iso3, name: countryData.name, healthScore };
      });

      if (this.perplexityApiKey) {
        return await this.getPerplexityHealthOpportunities(countryHealthScores);
      } else {
        return this.getFallbackHealthOpportunities(countryHealthScores);
      }
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
    // Countries with moderate GDP but health infrastructure gaps
    const opportunities = [
      {
        name: 'Brazil',
        iso3: 'BRA',
        gdpPerCapita: 8780,
        keyFactors: ['Large population', 'Growing middle class', 'Healthcare access gaps in rural areas'],
        recommendedSectors: ['Telemedicine', 'Pharmaceuticals', 'Medical devices'],
        marketPotential: 'High'
      },
      {
        name: 'Mexico',
        iso3: 'MEX', 
        gdpPerCapita: 9270,
        keyFactors: ['USMCA trade benefits', 'Healthcare modernization needs', 'Aging population'],
        recommendedSectors: ['Digital health', 'Medical equipment', 'Chronic disease management'],
        marketPotential: 'High'
      },
      {
        name: 'Turkey',
        iso3: 'TUR',
        gdpPerCapita: 9030,
        keyFactors: ['Strategic location', 'Healthcare tourism potential', 'Infrastructure investment'],
        recommendedSectors: ['Medical tourism', 'Pharmaceuticals', 'Healthcare IT'],
        marketPotential: 'Moderate-High'
      },
      {
        name: 'Thailand',
        iso3: 'THA',
        gdpPerCapita: 7260,
        keyFactors: ['Medical tourism hub', 'Aging society', 'Rural healthcare gaps'],
        recommendedSectors: ['Geriatric care', 'Medical tourism', 'Rural health technology'],
        marketPotential: 'Moderate-High'
      },
      {
        name: 'Malaysia',
        iso3: 'MYS',
        gdpPerCapita: 11200,
        keyFactors: ['Strong healthcare system', 'Medical tourism', 'Technology adoption'],
        recommendedSectors: ['Health tech', 'Medical devices', 'Biotechnology'],
        marketPotential: 'Moderate'
      },
      {
        name: 'Colombia',
        iso3: 'COL',
        gdpPerCapita: 6130,
        keyFactors: ['Healthcare reform', 'Urban-rural disparities', 'Growing economy'],
        recommendedSectors: ['Primary care', 'Digital health', 'Preventive medicine'],
        marketPotential: 'Moderate'
      },
      {
        name: 'South Africa',
        iso3: 'ZAF',
        gdpPerCapita: 6220,
        keyFactors: ['Dual healthcare system', 'High disease burden', 'Economic inequality'],
        recommendedSectors: ['Infectious disease', 'Primary care', 'Health insurance'],
        marketPotential: 'Moderate'
      },
      {
        name: 'India',
        iso3: 'IND',
        gdpPerCapita: 2100,
        keyFactors: ['Massive market', 'Healthcare access gaps', 'Digital transformation'],
        recommendedSectors: ['Digital health', 'Affordable care', 'Pharmaceuticals'],
        marketPotential: 'Very High'
      }
    ];

    return opportunities.map(country => {
      const healthData = healthScores.find(h => h.iso3 === country.iso3);
      return {
        ...country,
        healthScore: healthData?.healthScore || 65,
        opportunityScore: this.calculateOpportunityScore(healthData?.healthScore || 65, country.gdpPerCapita)
      };
    });
  }

  private calculateOpportunityScore(healthScore: number, gdpPerCapita: number): number {
    // Higher GDP with lower health score = higher opportunity
    const normalizedGDP = Math.min(gdpPerCapita / 15000, 1); // Normalize to 0-1
    const healthGap = (100 - healthScore) / 100; // Invert health score
    return Math.round((normalizedGDP * 0.6 + healthGap * 0.4) * 100);
  }

  private calculateWHOHealthScore(indicators: Record<string, number>, allCountries: Record<string, any>, healthIndicators: string[]): number {
    const scores: number[] = [];

    // Life expectancy (higher is better)
    const lifeExpectancy = indicators['Life expectancy at birth (years)'];
    if (lifeExpectancy) {
      scores.push(Math.min(lifeExpectancy / 85 * 100, 100));
    }

    // Infant mortality (lower is better)
    const infantMortality = indicators['Infant mortality rate (per 1,000 live births)'];
    if (infantMortality) {
      scores.push(Math.max(100 - (infantMortality / 50 * 100), 0));
    }

    // Healthcare coverage (higher is better)
    const healthcareCoverage = indicators['Universal health coverage service coverage index'];
    if (healthcareCoverage) {
      scores.push(healthcareCoverage);
    }

    // Vaccination coverage (higher is better)
    const vaccineCoverage = indicators['DTP3 immunization coverage among 1-year-olds (%)'];
    if (vaccineCoverage) {
      scores.push(vaccineCoverage);
    }

    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
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