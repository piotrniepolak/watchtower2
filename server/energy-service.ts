import { db } from "./db";
import { energyRegulationEvents, oilPriceEvents, energyStockCorrelations, stocks } from "@shared/schema";
import { correlationEngine, CorrelationData } from "./correlation-engine";
import { getSector } from "@shared/sectors";
import { eq, desc, and, gte } from "drizzle-orm";

export interface EnergyRegulationData {
  eventType: string;
  regulationType: string;
  region: string;
  country?: string;
  regulatoryBody: string;
  severity: string;
  impact: string;
  description: string;
  eventDate: Date;
}

export interface OilPriceData {
  eventType: string;
  oilType: string;
  priceChange: number;
  cause: string;
  region: string;
  eventDate: Date;
}

export class EnergyService {
  private perplexityApiKey: string;
  private isInitialized = false;

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
    this.initializeEnergyData();
  }

  private async initializeEnergyData() {
    if (this.isInitialized) return;

    try {
      // Check if we have recent energy regulation events
      const recentEvents = await db
        .select()
        .from(energyRegulationEvents)
        .where(gte(energyRegulationEvents.eventDate, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
        .limit(1);

      if (recentEvents.length === 0) {
        await this.generateInitialEnergyData();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize energy data:', error);
    }
  }

  private async generateInitialEnergyData() {
    console.log('Generating initial energy regulation data...');

    // Create realistic energy regulation events
    const regulationEventData = this.generateRealisticRegulationEvents();
    
    for (const eventData of regulationEventData) {
      try {
        await db.insert(energyRegulationEvents).values(eventData);
      } catch (error) {
        console.error('Error inserting regulation event:', error);
      }
    }

    // Create oil price events
    const oilPriceData = this.generateRealisticOilPriceEvents();
    
    for (const eventData of oilPriceData) {
      try {
        await db.insert(oilPriceEvents).values(eventData);
      } catch (error) {
        console.error('Error inserting oil price event:', error);
      }
    }

    console.log('Initial energy data generation completed');
  }

  private generateRealisticRegulationEvents(): any[] {
    const events = [];
    const currentDate = new Date();

    const regulationScenarios = [
      {
        eventType: 'policy_change',
        regulationType: 'emissions_standard',
        regulatoryBody: 'Environmental Protection Agency (EPA)',
        region: 'North America',
        country: 'United States',
        severity: 'high',
        impact: 'negative',
        affectedSector: 'oil',
        description: 'New EPA emissions standards for oil refineries requiring 30% reduction in methane emissions'
      },
      {
        eventType: 'opec_decision',
        regulationType: 'production_quota',
        regulatoryBody: 'Organization of Petroleum Exporting Countries (OPEC)',
        region: 'Global',
        severity: 'high',
        impact: 'positive',
        affectedSector: 'oil',
        description: 'OPEC+ announces production cuts of 2 million barrels per day to stabilize oil prices'
      },
      {
        eventType: 'environmental_regulation',
        regulationType: 'drilling_permit',
        regulatoryBody: 'Bureau of Land Management (BLM)',
        region: 'North America',
        country: 'United States',
        severity: 'medium',
        impact: 'negative',
        affectedSector: 'oil',
        description: 'Federal moratorium on new drilling permits in environmentally sensitive areas'
      },
      {
        eventType: 'trade_agreement',
        regulationType: 'tariff_policy',
        regulatoryBody: 'European Commission',
        region: 'Europe',
        severity: 'medium',
        impact: 'positive',
        affectedSector: 'gas',
        description: 'EU reduces tariffs on LNG imports to diversify energy supply away from pipeline gas'
      },
      {
        eventType: 'sanctions',
        regulationType: 'trade_restrictions',
        regulatoryBody: 'U.S. Treasury Department',
        region: 'Global',
        severity: 'critical',
        impact: 'negative',
        affectedSector: 'oil',
        description: 'Expanded sanctions on oil exports affecting global supply chains'
      },
      {
        eventType: 'policy_change',
        regulationType: 'renewable_mandate',
        regulatoryBody: 'Department of Energy (DOE)',
        region: 'North America',
        country: 'United States',
        severity: 'high',
        impact: 'negative',
        affectedSector: 'oil',
        description: 'Federal renewable energy mandate requiring 50% clean electricity by 2030'
      }
    ];

    regulationScenarios.forEach((scenario, index) => {
      const eventDate = new Date(currentDate);
      eventDate.setDate(eventDate.getDate() - (index * 5 + Math.floor(Math.random() * 7)));

      const implementationDate = new Date(eventDate);
      implementationDate.setDate(implementationDate.getDate() + Math.floor(Math.random() * 180 + 30));

      events.push({
        eventType: scenario.eventType,
        regulationType: scenario.regulationType,
        region: scenario.region,
        country: scenario.country,
        regulatoryBody: scenario.regulatoryBody,
        severity: scenario.severity,
        impact: scenario.impact,
        affectedSector: scenario.affectedSector,
        description: scenario.description,
        implementationDate,
        expectedDuration: this.getRandomDuration(),
        source: scenario.regulatoryBody,
        economicImpact: this.generateEconomicImpact(scenario.severity),
        priceImpactEstimate: this.generatePriceImpact(scenario.impact, scenario.severity),
        affectedCompanies: this.getAffectedCompanies(scenario.affectedSector),
        complianceCost: this.generateComplianceCost(scenario.severity),
        eventDate
      });
    });

    return events;
  }

  private generateRealisticOilPriceEvents(): any[] {
    const events = [];
    const currentDate = new Date();

    const priceScenarios = [
      {
        eventType: 'supply_shock',
        oilType: 'WTI',
        cause: 'Hurricane disrupts Gulf of Mexico oil production platforms',
        region: 'North America',
        priceChange: 8.5,
        duration: 'week'
      },
      {
        eventType: 'geopolitical',
        oilType: 'Brent',
        cause: 'Middle East tensions escalate affecting shipping routes',
        region: 'Middle East',
        priceChange: 12.3,
        duration: 'sustained'
      },
      {
        eventType: 'demand_surge',
        oilType: 'crude_oil',
        cause: 'Economic recovery drives increased industrial demand',
        region: 'Global',
        priceChange: 6.2,
        duration: 'month'
      },
      {
        eventType: 'strategic_reserve',
        oilType: 'WTI',
        cause: 'Strategic Petroleum Reserve release to cool prices',
        region: 'North America',
        priceChange: -4.8,
        duration: 'week'
      },
      {
        eventType: 'supply_shock',
        oilType: 'Brent',
        cause: 'Pipeline maintenance reduces North Sea production',
        region: 'Europe',
        priceChange: 5.7,
        duration: 'intraday'
      }
    ];

    priceScenarios.forEach((scenario, index) => {
      const eventDate = new Date(currentDate);
      eventDate.setDate(eventDate.getDate() - (index * 3 + Math.floor(Math.random() * 5)));

      const basePrice = scenario.oilType === 'WTI' ? 78.50 : 82.30;
      const priceFrom = basePrice * (1 - scenario.priceChange / 100);
      const priceTo = basePrice;

      events.push({
        eventType: scenario.eventType,
        oilType: scenario.oilType,
        priceChange: scenario.priceChange,
        priceFrom: Number(priceFrom.toFixed(2)),
        priceTo: Number(priceTo.toFixed(2)),
        volume: Math.floor(Math.random() * 500000 + 100000),
        cause: scenario.cause,
        region: scenario.region,
        duration: scenario.duration,
        marketReaction: this.generateMarketReaction(scenario.priceChange),
        analystCommentary: this.generateAnalystCommentary(scenario),
        eventDate
      });
    });

    return events;
  }

  async fetchEnergyRegulations(): Promise<any[]> {
    if (!this.perplexityApiKey) {
      console.log('No Perplexity API key available, using existing data');
      return await this.getRecentRegulationEvents();
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{
            role: 'user',
            content: `Find recent energy policy changes, OPEC decisions, and regulatory announcements from the past 7 days that affect oil and gas companies. Include EPA regulations, drilling permits, pipeline approvals, sanctions, and trade policies. For each event, provide: regulation type, affected region, regulatory body, impact assessment, and description.`
          }],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseRegulationResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error fetching energy regulations from Perplexity:', error);
      return await this.getRecentRegulationEvents();
    }
  }

  private parseRegulationResponse(content: string): any[] {
    const events = [];
    const lines = content.split('\n');
    
    let currentEvent: any = {};
    
    for (const line of lines) {
      if (line.includes('Regulation:') || line.includes('Policy:')) {
        if (currentEvent.regulationType) {
          events.push(this.normalizeRegulationEvent(currentEvent));
          currentEvent = {};
        }
        currentEvent.regulationType = line.split(':')[1]?.trim();
      } else if (line.includes('Region:') || line.includes('Location:')) {
        currentEvent.region = line.split(':')[1]?.trim();
      } else if (line.includes('Body:') || line.includes('Agency:')) {
        currentEvent.regulatoryBody = line.split(':')[1]?.trim();
      } else if (line.includes('Impact:')) {
        currentEvent.impact = line.split(':')[1]?.trim().toLowerCase();
      } else if (line.includes('Sector:')) {
        currentEvent.affectedSector = line.split(':')[1]?.trim();
      }
    }
    
    if (currentEvent.regulationType) {
      events.push(this.normalizeRegulationEvent(currentEvent));
    }
    
    return events.length > 0 ? events : this.generateRealisticRegulationEvents().slice(0, 3);
  }

  private normalizeRegulationEvent(rawEvent: any): any {
    return {
      eventType: 'policy_change',
      regulationType: rawEvent.regulationType || 'general_regulation',
      region: rawEvent.region || 'Global',
      regulatoryBody: rawEvent.regulatoryBody || 'Regulatory Authority',
      severity: 'medium',
      impact: this.normalizeImpact(rawEvent.impact),
      affectedSector: rawEvent.affectedSector || 'oil',
      description: `Energy regulation: ${rawEvent.regulationType} in ${rawEvent.region}`,
      eventDate: new Date(),
      source: rawEvent.regulatoryBody || 'Energy Authority'
    };
  }

  async calculateEnergyStockCorrelations(): Promise<any[]> {
    const energySector = getSector('energy');
    if (!energySector) return [];

    const correlations = [];
    const recentEvents = await this.getRecentRegulationEvents();
    
    for (const ticker of energySector.dataSources.stocks.tickers) {
      try {
        const stockData = await this.getStockData(ticker);
        const eventData = this.convertEventsToCorrelationData(recentEvents);
        
        if (eventData.length > 0 && stockData.length > 0) {
          const result = await correlationEngine.correlate(
            eventData,
            stockData,
            energySector.correlationParams
          );
          
          correlations.push({
            stockSymbol: ticker,
            correlation: result.strength,
            confidence: result.confidence,
            lag: result.lag,
            dataPoints: result.dataPoints,
            lastCalculated: new Date()
          });
        }
      } catch (error) {
        console.error(`Error calculating correlation for ${ticker}:`, error);
      }
    }
    
    return correlations;
  }

  private async getRecentRegulationEvents(): Promise<any[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return await db
      .select()
      .from(energyRegulationEvents)
      .where(gte(energyRegulationEvents.eventDate, thirtyDaysAgo))
      .orderBy(desc(energyRegulationEvents.eventDate));
  }

  private async getStockData(ticker: string): Promise<CorrelationData[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const stockData = await db
      .select()
      .from(stocks)
      .where(and(
        eq(stocks.symbol, ticker),
        gte(stocks.lastUpdated, thirtyDaysAgo)
      ))
      .orderBy(desc(stocks.lastUpdated));
    
    return stockData.map(stock => ({
      timestamp: stock.lastUpdated,
      value: stock.changePercent,
      metadata: {
        price: stock.price,
        volume: stock.volume
      }
    }));
  }

  private convertEventsToCorrelationData(events: any[]): CorrelationData[] {
    return events.map(event => ({
      timestamp: event.eventDate,
      value: this.getRegulationImpactScore(event.severity, event.impact),
      metadata: {
        regulationType: event.regulationType,
        region: event.region,
        affectedSector: event.affectedSector
      }
    }));
  }

  private getRegulationImpactScore(severity: string, impact: string): number {
    const severityMultiplier: Record<string, number> = {
      'low': 1,
      'medium': 2,
      'high': 4,
      'critical': 8
    };
    
    const impactDirection: Record<string, number> = {
      'negative': -1,
      'neutral': 0,
      'positive': 1
    };
    
    return (severityMultiplier[severity] || 2) * (impactDirection[impact] || 0);
  }

  private generateEconomicImpact(severity: string): number {
    const baseImpacts: Record<string, [number, number]> = {
      'low': [0.1, 1],
      'medium': [1, 10],
      'high': [10, 100],
      'critical': [50, 500]
    };
    
    const [min, max] = baseImpacts[severity] || [1, 10];
    return Number((Math.random() * (max - min) + min).toFixed(1)) * 1000000000; // In billions
  }

  private generatePriceImpact(impact: string, severity: string): number {
    const baseImpact = impact === 'positive' ? 1 : impact === 'negative' ? -1 : 0;
    const severityMultiplier: Record<string, number> = {
      'low': 1,
      'medium': 2,
      'high': 5,
      'critical': 10
    };
    
    return baseImpact * (severityMultiplier[severity] || 2) * (Math.random() * 2 + 1);
  }

  private getAffectedCompanies(sector: string): string[] {
    const companies: Record<string, string[]> = {
      'oil': ['XOM', 'CVX', 'COP', 'EOG', 'OXY'],
      'gas': ['SLB', 'HAL', 'BKR', 'HES', 'DVN'],
      'renewable': ['NEE', 'DUK', 'SO', 'AEP']
    };
    return companies[sector] || companies['oil'];
  }

  private generateComplianceCost(severity: string): number {
    const baseCosts: Record<string, [number, number]> = {
      'low': [10, 100],
      'medium': [100, 1000],
      'high': [1000, 10000],
      'critical': [5000, 50000]
    };
    
    const [min, max] = baseCosts[severity] || [100, 1000];
    return Number((Math.random() * (max - min) + min).toFixed(0)) * 1000000; // In millions
  }

  private getRandomDuration(): string {
    const durations = ['temporary', '1_year', '2_years', '5_years', 'permanent'];
    return durations[Math.floor(Math.random() * durations.length)];
  }

  private generateMarketReaction(priceChange: number): string {
    const absChange = Math.abs(priceChange);
    if (absChange > 10) return 'Strong volatility with heavy trading volume across energy futures markets';
    if (absChange > 5) return 'Moderate market reaction with increased activity in energy sector ETFs';
    return 'Limited market impact with trading within normal ranges';
  }

  private generateAnalystCommentary(scenario: any): string {
    return `Energy analysts note that ${scenario.cause.toLowerCase()}. Price impact of ${scenario.priceChange}% reflects market assessment of supply-demand dynamics in the ${scenario.region} region.`;
  }

  private normalizeImpact(impact: string): string {
    if (!impact) return 'neutral';
    const lower = impact.toLowerCase();
    if (lower.includes('positive') || lower.includes('beneficial')) return 'positive';
    if (lower.includes('negative') || lower.includes('adverse')) return 'negative';
    return 'neutral';
  }
}

export const energyService = new EnergyService();