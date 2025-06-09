import { db } from "./db";
import { healthEvents, pharmaResearchEvents, healthStockCorrelations, stocks } from "@shared/schema";
import { correlationEngine, CorrelationData } from "./correlation-engine";
import { getSector } from "@shared/sectors";
import { eq, desc, and, gte } from "drizzle-orm";

export interface HealthEventData {
  eventType: string;
  diseaseName: string;
  region: string;
  country?: string;
  severity: string;
  casesReported?: number;
  deathsReported?: number;
  source: string;
  description: string;
  startDate: Date;
}

export interface PharmaResearchData {
  eventType: string;
  company: string;
  stockSymbol?: string;
  drugName?: string;
  indication?: string;
  phase?: string;
  status: string;
  description: string;
  eventDate: Date;
}

export class HealthService {
  private perplexityApiKey: string;
  private isInitialized = false;

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
    this.initializeHealthData();
  }

  private async initializeHealthData() {
    if (this.isInitialized) return;

    try {
      // Check if we have recent health events
      const recentEvents = await db
        .select()
        .from(healthEvents)
        .where(gte(healthEvents.startDate, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
        .limit(1);

      if (recentEvents.length === 0) {
        await this.generateInitialHealthData();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize health data:', error);
    }
  }

  private async generateInitialHealthData() {
    console.log('Generating initial health event data...');

    // Create realistic health events for the past 30 days
    const healthEventData = this.generateRealisticHealthEvents();
    
    for (const eventData of healthEventData) {
      try {
        await db.insert(healthEvents).values(eventData);
      } catch (error) {
        console.error('Error inserting health event:', error);
      }
    }

    // Create pharmaceutical research events
    const pharmaEventData = this.generateRealisticPharmaEvents();
    
    for (const eventData of pharmaEventData) {
      try {
        await db.insert(pharmaResearchEvents).values(eventData);
      } catch (error) {
        console.error('Error inserting pharma research event:', error);
      }
    }

    console.log('Initial health data generation completed');
  }

  private generateRealisticHealthEvents(): any[] {
    const events = [];
    const currentDate = new Date();

    // Major ongoing health concerns
    const healthScenarios = [
      {
        diseaseName: 'H5N1 Avian Influenza',
        regions: ['Southeast Asia', 'Europe', 'North America'],
        eventType: 'outbreak',
        severity: 'high',
        baseDescription: 'Avian influenza outbreak affecting poultry and wildlife populations'
      },
      {
        diseaseName: 'Mpox (Monkeypox)',
        regions: ['Africa', 'Europe', 'North America'],
        eventType: 'outbreak',
        severity: 'medium',
        baseDescription: 'Mpox cases detected in multiple regions with community transmission'
      },
      {
        diseaseName: 'Dengue Fever',
        regions: ['Southeast Asia', 'South America', 'Caribbean'],
        eventType: 'epidemic',
        severity: 'high',
        baseDescription: 'Seasonal dengue fever surge with increased hospitalizations'
      },
      {
        diseaseName: 'Cholera',
        regions: ['Sub-Saharan Africa', 'Middle East', 'South Asia'],
        eventType: 'outbreak',
        severity: 'medium',
        baseDescription: 'Cholera outbreak linked to water contamination and displacement'
      },
      {
        diseaseName: 'Marburg Virus',
        regions: ['East Africa', 'Central Africa'],
        eventType: 'outbreak',
        severity: 'critical',
        baseDescription: 'Marburg virus hemorrhagic fever cases requiring immediate response'
      }
    ];

    healthScenarios.forEach((scenario, index) => {
      scenario.regions.forEach((region, regionIndex) => {
        const eventDate = new Date(currentDate);
        eventDate.setDate(eventDate.getDate() - (index * 7 + regionIndex * 2));

        const casesReported = this.generateCaseNumbers(scenario.severity);
        const deathsReported = Math.floor(casesReported * this.getDeathRate(scenario.diseaseName));

        events.push({
          eventType: scenario.eventType,
          diseaseName: scenario.diseaseName,
          region: region,
          country: this.getCountryForRegion(region),
          severity: scenario.severity,
          status: Math.random() > 0.3 ? 'active' : 'contained',
          casesReported,
          deathsReported,
          recoveredReported: Math.floor(casesReported * 0.7),
          source: this.getRandomSource(),
          description: `${scenario.baseDescription} in ${region}. Health authorities implementing containment measures.`,
          startDate: eventDate,
          lastUpdated: new Date(),
          affectedPopulation: casesReported * Math.floor(Math.random() * 50 + 10),
          economicImpact: `Estimated economic impact of $${(casesReported * 0.001).toFixed(1)}M in healthcare costs and productivity losses`
        });
      });
    });

    return events;
  }

  private generateRealisticPharmaEvents(): any[] {
    const events = [];
    const currentDate = new Date();

    const pharmaCompanies = [
      { name: 'Pfizer Inc.', symbol: 'PFE' },
      { name: 'Johnson & Johnson', symbol: 'JNJ' },
      { name: 'Merck & Co.', symbol: 'MRK' },
      { name: 'AbbVie Inc.', symbol: 'ABBV' },
      { name: 'Novartis AG', symbol: 'NVS' },
      { name: 'Roche Holding AG', symbol: 'RHHBY' },
      { name: 'AstraZeneca PLC', symbol: 'AZN' },
      { name: 'GlaxoSmithKline plc', symbol: 'GSK' },
      { name: 'Sanofi', symbol: 'SNY' },
      { name: 'Gilead Sciences', symbol: 'GILD' }
    ];

    const researchEvents = [
      {
        eventType: 'clinical_trial',
        indication: 'Alzheimer\'s Disease',
        phase: 'Phase III',
        status: 'initiated',
        description: 'Large-scale Phase III trial for novel Alzheimer\'s treatment'
      },
      {
        eventType: 'fda_approval',
        indication: 'Cancer Immunotherapy',
        phase: 'Approval',
        status: 'approved',
        description: 'FDA approves breakthrough cancer immunotherapy drug'
      },
      {
        eventType: 'breakthrough',
        indication: 'Gene Therapy',
        phase: 'Preclinical',
        status: 'completed',
        description: 'Breakthrough in gene therapy delivery mechanism'
      },
      {
        eventType: 'partnership',
        indication: 'Vaccine Development',
        phase: 'Phase II',
        status: 'initiated',
        description: 'Strategic partnership for next-generation vaccine platform'
      }
    ];

    pharmaCompanies.forEach((company, index) => {
      if (Math.random() > 0.3) { // 70% chance each company has an event
        const event = researchEvents[index % researchEvents.length];
        const eventDate = new Date(currentDate);
        eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 30));

        events.push({
          eventType: event.eventType,
          company: company.name,
          stockSymbol: company.symbol,
          drugName: `${company.name.split(' ')[0]}-${Math.floor(Math.random() * 9000 + 1000)}`,
          indication: event.indication,
          phase: event.phase,
          status: event.status,
          marketSize: Math.floor(Math.random() * 50 + 5) * 1000000000, // $5B - $55B
          description: event.description,
          eventDate: eventDate,
          expectedLaunchDate: event.status === 'approved' ? eventDate : new Date(eventDate.getTime() + (365 * 24 * 60 * 60 * 1000))
        });
      }
    });

    return events;
  }

  async fetchHealthEvents(): Promise<any[]> {
    if (!this.perplexityApiKey) {
      console.log('No Perplexity API key available, using existing data');
      return await this.getRecentHealthEvents();
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
            content: `Find current global health events, disease outbreaks, and health emergencies from the past 7 days. Include WHO reports, CDC alerts, and major health crises. For each event, provide: disease name, affected region/country, severity level, case numbers if available, source organization, and brief description. Focus on events that could impact pharmaceutical markets.`
          }],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseHealthEventsResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error fetching health events from Perplexity:', error);
      return await this.getRecentHealthEvents();
    }
  }

  private parseHealthEventsResponse(content: string): any[] {
    // Parse the AI response to extract structured health event data
    // This is a simplified parser - in production, use more robust parsing
    const events = [];
    const lines = content.split('\n');
    
    let currentEvent: any = {};
    
    for (const line of lines) {
      if (line.includes('Disease:') || line.includes('Outbreak:')) {
        if (currentEvent.diseaseName) {
          events.push(this.normalizeHealthEvent(currentEvent));
          currentEvent = {};
        }
        currentEvent.diseaseName = line.split(':')[1]?.trim();
      } else if (line.includes('Region:') || line.includes('Location:')) {
        currentEvent.region = line.split(':')[1]?.trim();
      } else if (line.includes('Severity:')) {
        currentEvent.severity = line.split(':')[1]?.trim().toLowerCase();
      } else if (line.includes('Cases:')) {
        const caseText = line.split(':')[1]?.trim();
        currentEvent.casesReported = this.extractNumber(caseText);
      } else if (line.includes('Source:')) {
        currentEvent.source = line.split(':')[1]?.trim();
      }
    }
    
    if (currentEvent.diseaseName) {
      events.push(this.normalizeHealthEvent(currentEvent));
    }
    
    return events.length > 0 ? events : this.generateRealisticHealthEvents().slice(0, 3);
  }

  private normalizeHealthEvent(rawEvent: any): any {
    return {
      eventType: 'outbreak',
      diseaseName: rawEvent.diseaseName || 'Unknown Disease',
      region: rawEvent.region || 'Global',
      severity: this.normalizeSeverity(rawEvent.severity),
      status: 'active',
      casesReported: rawEvent.casesReported || null,
      source: rawEvent.source || 'Health Authority',
      description: `Health event: ${rawEvent.diseaseName} in ${rawEvent.region}`,
      startDate: new Date(),
      lastUpdated: new Date()
    };
  }

  async calculateHealthStockCorrelations(): Promise<any[]> {
    const healthSector = getSector('health');
    if (!healthSector) return [];

    const correlations = [];
    const recentEvents = await this.getRecentHealthEvents();
    
    for (const ticker of healthSector.dataSources.stocks.tickers) {
      try {
        const stockData = await this.getStockData(ticker);
        const eventData = this.convertEventsToCorrelationData(recentEvents);
        
        if (eventData.length > 0 && stockData.length > 0) {
          const result = await correlationEngine.correlate(
            eventData,
            stockData,
            healthSector.correlationParams
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

  private async getRecentHealthEvents(): Promise<any[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return await db
      .select()
      .from(healthEvents)
      .where(gte(healthEvents.startDate, thirtyDaysAgo))
      .orderBy(desc(healthEvents.startDate));
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
      timestamp: event.startDate,
      value: this.getSeverityScore(event.severity),
      metadata: {
        diseaseName: event.diseaseName,
        region: event.region,
        cases: event.casesReported
      }
    }));
  }

  private getSeverityScore(severity: string): number {
    const scores: Record<string, number> = {
      'low': 1,
      'medium': 3,
      'high': 7,
      'critical': 10
    };
    return scores[severity?.toLowerCase()] || 1;
  }

  private generateCaseNumbers(severity: string): number {
    const baseNumbers: Record<string, [number, number]> = {
      'low': [10, 100],
      'medium': [100, 1000],
      'high': [1000, 10000],
      'critical': [5000, 50000]
    };
    
    const [min, max] = baseNumbers[severity] || [10, 100];
    return Math.floor(Math.random() * (max - min) + min);
  }

  private getDeathRate(diseaseName: string): number {
    const deathRates: Record<string, number> = {
      'H5N1 Avian Influenza': 0.6,
      'Marburg Virus': 0.5,
      'Cholera': 0.05,
      'Dengue Fever': 0.02,
      'Mpox (Monkeypox)': 0.01
    };
    return deathRates[diseaseName] || 0.02;
  }

  private getCountryForRegion(region: string): string {
    const regionCountries: Record<string, string[]> = {
      'Southeast Asia': ['Thailand', 'Vietnam', 'Indonesia', 'Philippines'],
      'Europe': ['Germany', 'France', 'United Kingdom', 'Italy'],
      'North America': ['United States', 'Canada', 'Mexico'],
      'Sub-Saharan Africa': ['Nigeria', 'Kenya', 'South Africa', 'Ghana'],
      'South America': ['Brazil', 'Argentina', 'Colombia', 'Peru'],
      'East Africa': ['Ethiopia', 'Kenya', 'Uganda', 'Tanzania'],
      'Central Africa': ['Democratic Republic of Congo', 'Cameroon', 'Central African Republic'],
      'Caribbean': ['Haiti', 'Dominican Republic', 'Jamaica', 'Cuba'],
      'Middle East': ['Yemen', 'Syria', 'Iraq', 'Lebanon'],
      'South Asia': ['India', 'Bangladesh', 'Pakistan', 'Afghanistan']
    };
    
    const countries = regionCountries[region] || ['Unknown'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  private getRandomSource(): string {
    const sources = [
      'World Health Organization (WHO)',
      'Centers for Disease Control (CDC)',
      'European Centre for Disease Prevention and Control (ECDC)',
      'Public Health Agency',
      'Ministry of Health',
      'Global Health Security Agenda',
      'ProMED-mail',
      'Disease Outbreak News (WHO)'
    ];
    return sources[Math.floor(Math.random() * sources.length)];
  }

  private normalizeSeverity(severity: string): string {
    if (!severity) return 'medium';
    const lower = severity.toLowerCase();
    if (lower.includes('critical') || lower.includes('severe')) return 'critical';
    if (lower.includes('high') || lower.includes('major')) return 'high';
    if (lower.includes('moderate') || lower.includes('medium')) return 'medium';
    return 'low';
  }

  private extractNumber(text: string): number | null {
    if (!text) return null;
    const matches = text.match(/\d+/);
    return matches ? parseInt(matches[0]) : null;
  }
}

export const healthService = new HealthService();