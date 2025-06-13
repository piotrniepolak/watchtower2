import { PerplexityService } from './perplexity-service';

export interface ConflictUpdate {
  region: string;
  conflict: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  recentDevelopments: string[];
  marketImplications: string;
  sources: string[];
  lastUpdated: Date;
}

export interface GeopoliticalAnalysis {
  executiveSummary: string;
  conflictUpdates: ConflictUpdate[];
  policyImpacts: {
    defense: string;
    healthcare: string;
    energy: string;
  };
  riskAssessment: string;
  marketOutlook: string;
  sources: string[];
}

export class GeopoliticalAnalysisService {
  private perplexityService: PerplexityService;

  constructor() {
    this.perplexityService = new PerplexityService();
  }

  async generateDefenseGeopoliticalAnalysis(): Promise<GeopoliticalAnalysis> {
    try {
      console.log('🔍 Generating defense-focused geopolitical analysis with Perplexity...');

      // Get recent global conflict updates
      const conflictQuery = `
        Provide a comprehensive analysis of current global defense and security developments from the past 48 hours. 
        Focus on:
        1. NATO and alliance developments
        2. Ukraine-Russia conflict latest developments
        3. Middle East security situations (Israel-Palestine, Iran tensions)
        4. Asia-Pacific defense tensions (China-Taiwan, North Korea)
        5. Defense spending and military procurement news
        6. Cybersecurity threats and military technology developments
        
        For each conflict or development, provide:
        - Current status and recent changes
        - Strategic implications for global defense markets
        - Impact on military contractors and defense spending
        - Policy implications for major powers
        
        Include specific dates, locations, and credible sources.
      `;

      const conflictResponse = await this.perplexityService.query(conflictQuery, {
        searchRecencyFilter: 'week',
        temperature: 0.1,
        maxTokens: 2000
      });

      // Get defense policy and market implications
      const policyQuery = `
        Analyze recent defense policy developments and their market implications from the past week:
        1. US Defense Authorization Act updates
        2. European defense spending commitments
        3. Defense technology export controls
        4. Military aid packages and approvals
        5. Defense contractor earnings and stock movements
        6. New military technology acquisitions
        
        Focus on actionable intelligence for defense industry investors and policymakers.
      `;

      const policyResponse = await this.perplexityService.query(policyQuery, {
        searchRecencyFilter: 'week',
        temperature: 0.1,
        maxTokens: 1500
      });

      return this.parseDefenseAnalysis(conflictResponse, policyResponse);
    } catch (error) {
      console.error('Error generating defense geopolitical analysis:', error);
      return this.getDefaultDefenseAnalysis();
    }
  }

  async generatePharmaGeopoliticalAnalysis(): Promise<GeopoliticalAnalysis> {
    try {
      console.log('🔍 Generating pharmaceutical-focused geopolitical analysis with Perplexity...');

      // Get recent global health and pharmaceutical policy developments
      const healthQuery = `
        Provide a comprehensive analysis of current global health security and pharmaceutical policy developments from the past 48 hours:
        1. WHO emergency declarations and global health alerts
        2. Pandemic preparedness and vaccine distribution updates
        3. Drug pricing and healthcare policy changes by major economies
        4. Pharmaceutical supply chain disruptions and geopolitical impacts
        5. Medical technology export controls and trade restrictions
        6. Biodefense and biosecurity developments
        7. Clinical trial regulations and approval process changes
        
        For each development, provide:
        - Current status and recent policy changes
        - Impact on pharmaceutical companies and healthcare markets
        - Regulatory implications for drug development and distribution
        - Geopolitical tensions affecting global health cooperation
        
        Include specific dates, regulatory bodies, and credible sources.
      `;

      const healthResponse = await this.perplexityService.query(healthQuery, {
        searchRecencyFilter: 'week',
        temperature: 0.1,
        maxTokens: 2000
      });

      // Get pharmaceutical market and policy implications
      const pharmaQuery = `
        Analyze recent pharmaceutical and healthcare policy developments affecting global markets from the past week:
        1. FDA and EMA drug approvals and rejections
        2. Healthcare spending legislation and budget allocations
        3. Pharmaceutical trade agreements and disputes
        4. Biosimilar and generic drug market developments
        5. Digital health and telemedicine regulations
        6. Pharmaceutical company earnings and strategic moves
        
        Focus on actionable intelligence for healthcare investors and pharmaceutical companies.
      `;

      const pharmaResponse = await this.perplexityService.query(pharmaQuery, {
        searchRecencyFilter: 'week',
        temperature: 0.1,
        maxTokens: 1500
      });

      return this.parsePharmaAnalysis(healthResponse, pharmaResponse);
    } catch (error) {
      console.error('Error generating pharmaceutical geopolitical analysis:', error);
      return this.getDefaultPharmaAnalysis();
    }
  }

  private parseDefenseAnalysis(conflictData: string, policyData: string): GeopoliticalAnalysis {
    // Extract key conflict updates
    const conflictUpdates: ConflictUpdate[] = [
      {
        region: 'Eastern Europe',
        conflict: 'Ukraine-Russia Conflict',
        severity: 'high',
        summary: this.extractSummary(conflictData, 'Ukraine'),
        recentDevelopments: this.extractDevelopments(conflictData, 'Ukraine'),
        marketImplications: 'Sustained defense spending increases across NATO allies, driving aerospace and defense contractor revenues.',
        sources: this.extractSources(conflictData),
        lastUpdated: new Date()
      },
      {
        region: 'Asia-Pacific',
        conflict: 'China-Taiwan Tensions',
        severity: 'medium',
        summary: this.extractSummary(conflictData, 'Taiwan'),
        recentDevelopments: this.extractDevelopments(conflictData, 'China'),
        marketImplications: 'Increased US defense presence in Pacific driving naval and aerospace procurement.',
        sources: this.extractSources(conflictData),
        lastUpdated: new Date()
      }
    ];

    return {
      executiveSummary: this.generateExecutiveSummary(conflictData, policyData, 'defense'),
      conflictUpdates,
      policyImpacts: {
        defense: this.extractPolicyImpact(policyData, 'defense'),
        healthcare: 'Limited direct impact on healthcare sector from current defense developments.',
        energy: 'Energy security concerns driving defense infrastructure investments.'
      },
      riskAssessment: this.generateRiskAssessment(conflictData, 'defense'),
      marketOutlook: this.generateMarketOutlook(policyData, 'defense'),
      sources: this.extractAllSources(conflictData, policyData)
    };
  }

  private parsePharmaAnalysis(healthData: string, pharmaData: string): GeopoliticalAnalysis {
    // Extract key health crisis updates
    const conflictUpdates: ConflictUpdate[] = [
      {
        region: 'Global',
        conflict: 'Pandemic Preparedness',
        severity: 'medium',
        summary: this.extractSummary(healthData, 'pandemic'),
        recentDevelopments: this.extractDevelopments(healthData, 'WHO'),
        marketImplications: 'Increased government funding for vaccine development and healthcare infrastructure.',
        sources: this.extractSources(healthData),
        lastUpdated: new Date()
      },
      {
        region: 'US-China',
        conflict: 'Pharmaceutical Trade Tensions',
        severity: 'medium',
        summary: this.extractSummary(pharmaData, 'trade'),
        recentDevelopments: this.extractDevelopments(pharmaData, 'FDA'),
        marketImplications: 'Supply chain diversification driving pharmaceutical manufacturing investments.',
        sources: this.extractSources(pharmaData),
        lastUpdated: new Date()
      }
    ];

    return {
      executiveSummary: this.generateExecutiveSummary(healthData, pharmaData, 'pharmaceutical'),
      conflictUpdates,
      policyImpacts: {
        defense: 'Biodefense spending increases affecting pharmaceutical research priorities.',
        healthcare: this.extractPolicyImpact(pharmaData, 'healthcare'),
        energy: 'Limited direct impact from current pharmaceutical policy developments.'
      },
      riskAssessment: this.generateRiskAssessment(healthData, 'healthcare'),
      marketOutlook: this.generateMarketOutlook(pharmaData, 'pharmaceutical'),
      sources: this.extractAllSources(healthData, pharmaData)
    };
  }

  private extractSummary(content: string, keyword: string): string {
    const lines = content.split('\n');
    const relevantLines = lines.filter(line => 
      line.toLowerCase().includes(keyword.toLowerCase()) && line.length > 50
    );
    return relevantLines[0] || `Recent developments regarding ${keyword} require continued monitoring.`;
  }

  private extractDevelopments(content: string, keyword: string): string[] {
    const developments = content.match(/(?:- |• |1\.|2\.|3\.).+/g) || [];
    return developments
      .filter(dev => dev.toLowerCase().includes(keyword.toLowerCase()))
      .slice(0, 3)
      .map(dev => dev.replace(/^(?:- |• |1\.|2\.|3\.)/, '').trim());
  }

  private extractSources(content: string): string[] {
    const sources = content.match(/(?:Source:|According to|Reuters|Bloomberg|Associated Press|Wall Street Journal|Financial Times|Defense News|Breaking Defense|Jane's|CNBC|BBC|CNN).+/gi) || [];
    const uniqueSources = new Set(sources.slice(0, 5));
    return Array.from(uniqueSources);
  }

  private extractAllSources(content1: string, content2: string): string[] {
    const sources1 = this.extractSources(content1);
    const sources2 = this.extractSources(content2);
    const uniqueSources = new Set([...sources1, ...sources2]);
    return Array.from(uniqueSources);
  }

  private generateExecutiveSummary(data1: string, data2: string, sector: string): string {
    const keyPoints = [
      data1.split('\n')[0] || '',
      data2.split('\n')[0] || ''
    ].filter(point => point.length > 20);

    return `Current ${sector} geopolitical landscape shows heightened activity across multiple theaters. ${keyPoints.join(' ')} These developments continue to shape market dynamics and investment flows in the ${sector} sector.`;
  }

  private extractPolicyImpact(content: string, sector: string): string {
    const policyLines = content.split('\n').filter(line => 
      line.toLowerCase().includes('policy') || 
      line.toLowerCase().includes('regulation') ||
      line.toLowerCase().includes('spending')
    );
    return policyLines[0] || `${sector} policy developments require continued monitoring for market implications.`;
  }

  private generateRiskAssessment(content: string, sector: string): string {
    return `Current risk levels remain elevated across multiple geopolitical fronts. ${sector} sector faces ongoing challenges from supply chain disruptions and regulatory changes. Continued monitoring of policy developments and international relations is essential for strategic planning.`;
  }

  private generateMarketOutlook(content: string, sector: string): string {
    return `Market outlook for ${sector} sector remains cautiously optimistic despite geopolitical headwinds. Recent policy developments suggest continued government support and investment opportunities. Investors should monitor regulatory changes and international developments closely.`;
  }

  private getDefaultDefenseAnalysis(): GeopoliticalAnalysis {
    return {
      executiveSummary: 'Current defense geopolitical analysis unavailable. Real-time conflict monitoring systems are being updated to provide comprehensive intelligence.',
      conflictUpdates: [],
      policyImpacts: {
        defense: 'Defense policy analysis temporarily unavailable.',
        healthcare: 'Limited healthcare sector impact from current defense developments.',
        energy: 'Energy security considerations affecting defense infrastructure planning.'
      },
      riskAssessment: 'Risk assessment systems are being updated with latest intelligence.',
      marketOutlook: 'Defense market outlook pending updated geopolitical analysis.',
      sources: []
    };
  }

  private getDefaultPharmaAnalysis(): GeopoliticalAnalysis {
    return {
      executiveSummary: 'Current pharmaceutical geopolitical analysis unavailable. Real-time health policy monitoring systems are being updated to provide comprehensive intelligence.',
      conflictUpdates: [],
      policyImpacts: {
        defense: 'Biodefense considerations affecting pharmaceutical research priorities.',
        healthcare: 'Healthcare policy analysis temporarily unavailable.',
        energy: 'Limited energy sector impact from current pharmaceutical developments.'
      },
      riskAssessment: 'Risk assessment systems are being updated with latest health policy intelligence.',
      marketOutlook: 'Pharmaceutical market outlook pending updated policy analysis.',
      sources: []
    };
  }
}