import fetch from 'node-fetch';

interface ConflictPrediction {
  conflictName: string;
  region: string;
  scenario: 'escalation' | 'de-escalation' | 'stalemate' | 'resolution';
  probability: number;
  timeframe: string;
  narrative: string;
  keyFactors: string[];
  marketImpact: 'positive' | 'negative' | 'neutral';
  affectedSectors: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface MarketAnalysis {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  sector: string;
  keyDrivers: string[];
  topStocks: Array<{
    symbol: string;
    prediction: 'buy' | 'sell' | 'hold';
    confidence: number;
    reasoning: string;
  }>;
  riskFactors: string[];
  opportunities: string[];
  timeHorizon: string;
  marketOutlook: string;
}

interface EconomicIndicators {
  inflationTrend: 'rising' | 'falling' | 'stable';
  gdpGrowth: number;
  unemploymentRate: number;
  interestRateDirection: 'up' | 'down' | 'stable';
  commodityPrices: {
    oil: { price: number; change: number };
    gold: { price: number; change: number };
  };
  currencyStrength: 'strong' | 'weak' | 'stable';
}

class RealTimeAIAnalysisService {
  private perplexityApiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.perplexityApiKey) {
      console.log('PERPLEXITY_API_KEY not found - using sample data for development');
    }
  }

  private async callPerplexityAPI(prompt: string, systemMessage: string): Promise<string> {
    if (!this.perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    try {
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
              content: systemMessage
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.3,
          top_p: 0.9,
          search_recency_filter: 'day',
          return_images: false,
          return_related_questions: false,
          stream: false
        })
      });

      if (!response.ok) {
        console.error('Perplexity API error:', response.status, response.statusText);
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error calling Perplexity API:', error);
      throw error;
    }
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async generateConflictPredictions(): Promise<ConflictPrediction[]> {
    const cacheKey = 'conflict_predictions';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Skip sample data - use real API

    try {
      const prompt = `Return ONLY valid JSON with no explanatory text. Analyze current global conflicts from the last 24-48 hours and provide analysis in this exact JSON format:

{
  "predictions": [
    {
      "conflictName": "Ukraine-Russia Conflict",
      "region": "Eastern Europe",
      "scenario": "escalation",
      "probability": 75,
      "timeframe": "3-6 months",
      "narrative": "Recent developments include continued military operations and diplomatic efforts",
      "keyFactors": ["Military aid", "Sanctions", "Diplomatic negotiations"],
      "marketImpact": "negative",
      "affectedSectors": ["defense", "energy", "agriculture"],
      "riskLevel": "high"
    }
  ]
}

Focus on Ukraine-Russia, Middle East tensions, and Taiwan Strait. Return ONLY the JSON object with no other text. Today's date: ${new Date().toISOString().split('T')[0]}`;

      const systemMessage = `You are a senior geopolitical analyst with access to real-time global intelligence. Analyze only current, active conflicts and tensions with recent developments from credible news sources. Provide realistic probability assessments based on actual events, not speculation.`;

      const response = await this.callPerplexityAPI(prompt, systemMessage);
      
      try {
        // Extract JSON from response - handle multiple patterns
        let cleanedResponse = response.trim();
        
        // First try to find JSON block in markdown
        const jsonBlockMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch) {
          cleanedResponse = jsonBlockMatch[1].trim();
        } else {
          // Try to extract the main JSON object
          const jsonMatch = cleanedResponse.match(/(\{[\s\S]*\})/);
          if (jsonMatch) {
            cleanedResponse = jsonMatch[1];
          }
        }
        
        const parsed = JSON.parse(cleanedResponse);
        const predictions = parsed.predictions || [];
        this.setCachedData(cacheKey, predictions);
        return predictions;
      } catch (parseError) {
        console.error('Error parsing conflict predictions response:', parseError);
        console.log('Raw response:', response.substring(0, 500));
        return [];
      }
    } catch (error) {
      console.error('Error generating conflict predictions:', error);
      return [];
    }
  }

  async generateMarketAnalysis(sector: string = 'defense'): Promise<MarketAnalysis | null> {
    const cacheKey = `market_analysis_${sector}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const sectorMap = {
        defense: 'defense and aerospace companies (LMT, RTX, NOC, GD, BA)',
        health: 'pharmaceutical and healthcare companies (PFE, JNJ, GILD, MRNA, ABBV)',
        energy: 'energy and oil companies (XOM, CVX, COP, EOG, SLB)'
      };

      const companies = sectorMap[sector as keyof typeof sectorMap] || sectorMap.defense;

      const prompt = `Return ONLY valid JSON with no explanatory text. Analyze ${sector} sector market conditions for ${companies} and provide analysis in this exact JSON format:

{
  "overallSentiment": "bullish",
  "sector": "${sector}",
  "keyDrivers": ["Government contracts", "Defense spending", "Geopolitical tensions"],
  "topStocks": [
    {
      "symbol": "LMT",
      "prediction": "buy",
      "confidence": 80,
      "reasoning": "Strong defense contracts and government spending"
    }
  ],
  "riskFactors": ["Budget constraints", "Political changes", "Supply chain issues"],
  "opportunities": ["Modernization programs", "International sales", "Technology upgrades"],
  "timeHorizon": "6-12 months",
  "marketOutlook": "Positive outlook driven by global security concerns and defense modernization"
}

Focus on recent 24-48 hour developments. Return ONLY the JSON object with no other text. Today's date: ${new Date().toISOString().split('T')[0]}`;

      const systemMessage = `You are a senior financial analyst with access to real-time market data and news. Provide specific, actionable investment insights based on current market conditions and recent developments. Focus on factual analysis from credible financial sources.`;

      const response = await this.callPerplexityAPI(prompt, systemMessage);
      
      try {
        // Extract JSON from response - handle multiple patterns
        let cleanedResponse = response.trim();
        
        // First try to find JSON block in markdown
        const jsonBlockMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch) {
          cleanedResponse = jsonBlockMatch[1].trim();
        } else {
          // Try to extract the main JSON object
          const jsonMatch = cleanedResponse.match(/(\{[\s\S]*\})/);
          if (jsonMatch) {
            cleanedResponse = jsonMatch[1];
          }
        }
        
        const analysis = JSON.parse(cleanedResponse);
        this.setCachedData(cacheKey, analysis);
        return analysis;
      } catch (parseError) {
        console.error('Error parsing market analysis response:', parseError);
        console.log('Raw response:', response.substring(0, 500));
        return null;
      }
    } catch (error) {
      console.error('Error generating market analysis:', error);
      return null;
    }
  }

  async generateSectorAnalysis(sector: string): Promise<any | null> {
    const cacheKey = `sector_analysis_${sector}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const analysisPrompts = {
        defense: `Analyze current global military conflicts and defense threats. Return ONLY valid JSON in this format:
{
  "conflicts": [
    {
      "name": "Ukraine-Russia War",
      "region": "Eastern Europe",
      "escalationRisk": 85,
      "defenseImpact": "High - driving NATO defense spending increases",
      "keyDevelopments": ["Recent missile strikes", "Western aid packages"]
    }
  ],
  "emergingThreats": ["Cyber warfare escalation", "Space militarization"],
  "defenseSpendingTrends": "Global defense budgets increasing 5-7% annually",
  "criticalSupplyChains": ["Semiconductor shortage affecting military systems", "Rare earth minerals supply constraints"]
}`,
        health: `Analyze current global health threats and biodefense concerns. Return ONLY valid JSON in this format:
{
  "healthThreats": [
    {
      "name": "H5N1 Avian Influenza",
      "severity": "High",
      "regions": ["Asia", "Europe"],
      "riskLevel": 75,
      "preparedness": "Moderate - vaccine development ongoing"
    }
  ],
  "pandemicRisk": "Medium - multiple respiratory viruses circulating",
  "biodefenseAlerts": ["Lab security incidents", "Dual-use research concerns"],
  "healthSystemStrain": "Regional capacity issues in developing nations"
}`,
        energy: `Analyze current energy supply disruptions and infrastructure threats. Return ONLY valid JSON in this format:
{
  "supplyDisruptions": [
    {
      "source": "Middle East Pipeline",
      "impact": "Regional gas shortages",
      "severity": 70,
      "duration": "3-6 months estimated",
      "affectedRegions": ["Europe", "Asia"]
    }
  ],
  "infrastructureThreats": ["Cyber attacks on power grids", "Climate-related outages"],
  "energySecurityAlerts": "Critical mineral supply chain vulnerabilities",
  "transitionRisks": "Renewable energy intermittency challenges"
}`
      };

      const prompt = analysisPrompts[sector as keyof typeof analysisPrompts];
      if (!prompt) throw new Error(`Unknown sector: ${sector}`);

      const response = await this.callPerplexityAPI(`${prompt}

Use latest intelligence from the last 24-48 hours. Return ONLY the JSON object with no other text. Today's date: ${new Date().toISOString().split('T')[0]}`);

      let cleanedResponse = response.trim();
      const jsonBlockMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
        cleanedResponse = jsonBlockMatch[1].trim();
      }
      
      cleanedResponse = this.cleanJsonResponse(cleanedResponse);
      const analysisData = JSON.parse(cleanedResponse);
      
      this.setCachedData(cacheKey, analysisData);
      return analysisData;
    } catch (error) {
      console.error(`Error generating sector analysis for ${sector}:`, error);
      throw new Error(`Failed to generate sector analysis for ${sector}`);
    }
  }

  async generateSectorIndicators(sector: string): Promise<any | null> {
    const cacheKey = `sector_indicators_${sector}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const indicatorPrompts = {
        defense: `Analyze defense sector metrics and spending indicators. Return ONLY valid JSON in this format:
{
  "globalDefenseSpending": {
    "total": 2400,
    "growth": 3.2,
    "topSpenders": [
      {"country": "United States", "amount": 816, "change": 2.8},
      {"country": "China", "amount": 296, "change": 4.2}
    ]
  },
  "contractActivity": {
    "totalValue": 89.5,
    "majorContracts": ["F-35 sustainment", "Navy shipbuilding"],
    "trend": "increasing"
  },
  "threatLevel": "elevated",
  "technologyFocus": ["AI integration", "Hypersonic weapons", "Cyber defense"],
  "supplierHealth": "strained"
}`,
        health: `Analyze healthcare sector indicators and health system metrics. Return ONLY valid JSON in this format:
{
  "globalHealthSpending": {
    "total": 9.8,
    "gdpPercentage": 9.8,
    "growth": 4.1,
    "publicPrivateRatio": "70/30"
  },
  "pharmaceuticalPipeline": {
    "newDrugs": 37,
    "approvalRate": 85,
    "majorAreas": ["Oncology", "Neurological disorders", "Rare diseases"]
  },
  "healthSystemCapacity": "moderate strain",
  "emergingDiseases": 12,
  "vaccineDevelopment": "accelerated timelines",
  "regulatoryEnvironment": "increasingly stringent"
}`,
        energy: `Analyze energy sector indicators and market dynamics. Return ONLY valid JSON in this format:
{
  "globalEnergyDemand": {
    "total": 580.8,
    "growth": 2.1,
    "renewableShare": 29.4,
    "trend": "recovery post-pandemic"
  },
  "oilMarkets": {
    "price": 82.4,
    "volatility": "high",
    "reserves": "strategic releases ongoing",
    "production": "OPEC+ cuts in effect"
  },
  "renewableCapacity": {
    "additions": 295,
    "solar": 191,
    "wind": 77,
    "growth": "record year"
  },
  "gridStability": "regional concerns",
  "energyTransition": "accelerating but uneven",
  "carbonPricing": "expanding globally"
}`
      };

      const prompt = indicatorPrompts[sector as keyof typeof indicatorPrompts];
      if (!prompt) throw new Error(`Unknown sector: ${sector}`);

      const response = await this.callPerplexityAPI(`${prompt}

Use latest market data and reports from the last 24-48 hours. Include specific numerical values and percentages. Return ONLY the JSON object with no other text. Today's date: ${new Date().toISOString().split('T')[0]}`);

      let cleanedResponse = response.trim();
      const jsonBlockMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch) {
        cleanedResponse = jsonBlockMatch[1].trim();
      }
      
      cleanedResponse = this.cleanJsonResponse(cleanedResponse);
      const indicatorData = JSON.parse(cleanedResponse);
      
      this.setCachedData(cacheKey, indicatorData);
      return indicatorData;
    } catch (error) {
      console.error(`Error generating sector indicators for ${sector}:`, error);
      throw new Error(`Failed to generate sector indicators for ${sector}`);
    }
  }

  async generateEconomicIndicators(sector: string = 'defense'): Promise<EconomicIndicators | null> {
    const cacheKey = `economic_indicators_${sector}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log(`Returning cached economic indicators for ${sector}`);
      return cached;
    }
    
    console.log(`Generating fresh economic indicators for ${sector}`);

    // Skip sample data - use real API

    try {
      const sectorFocus = {
        defense: 'defense spending, military contracts, and geopolitical impact on economy',
        health: 'healthcare costs, pharmaceutical pricing, and medical sector economic impact',
        energy: 'energy prices, oil/gas markets, and renewable energy economic trends'
      };

      const focus = sectorFocus[sector as keyof typeof sectorFocus] || sectorFocus.defense;

      const prompt = `Return ONLY valid JSON with no explanatory text. Analyze current economic indicators with focus on ${focus} and provide data in this exact JSON format:

{
  "inflationTrend": "stable",
  "gdpGrowth": 2.1,
  "unemploymentRate": 3.7,
  "interestRateDirection": "stable",
  "commodityPrices": {
    "oil": {"price": 75.50, "change": -1.2},
    "gold": {"price": 2010.50, "change": 0.8}
  },
  "currencyStrength": "strong"
}

Focus on how ${sector} sector economic factors influence broader indicators. Use latest data from the last 24-48 hours. Return ONLY the JSON object with no other text. Today's date: ${new Date().toISOString().split('T')[0]}`;

      const systemMessage = `You are a senior economist with access to real-time economic data from official government and financial institutions. Provide accurate, current economic indicators based on the latest available data from credible sources like the Federal Reserve, Bureau of Labor Statistics, and major financial data providers.`;

      const response = await this.callPerplexityAPI(prompt, systemMessage);
      
      try {
        // Extract JSON from response - handle multiple patterns
        let cleanedResponse = response.trim();
        
        // First try to find JSON block in markdown
        const jsonBlockMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch) {
          cleanedResponse = jsonBlockMatch[1].trim();
        } else {
          // Try to extract the main JSON object
          const jsonMatch = cleanedResponse.match(/(\{[\s\S]*\})/);
          if (jsonMatch) {
            cleanedResponse = jsonMatch[0];
          }
        }
        
        // Clean the JSON response to handle comments and formatting issues
        cleanedResponse = this.cleanJsonResponse(cleanedResponse);
        
        let rawIndicators;
        try {
          rawIndicators = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.error(`Failed to parse economic indicators for ${sector}:`, parseError);
          throw new Error(`Failed to generate economic indicators for ${sector}`);
        }
        
        // Normalize the data structure to ensure compatibility
        const indicators: EconomicIndicators = {
          inflationTrend: this.normalizeInflationTrend(rawIndicators.inflationTrend),
          gdpGrowth: this.normalizeNumericValue(rawIndicators.gdpGrowth, 2.4),
          unemploymentRate: this.normalizeNumericValue(rawIndicators.unemploymentRate, 3.8),
          interestRateDirection: this.normalizeDirection(rawIndicators.interestRateDirection),
          commodityPrices: {
            oil: {
              price: this.normalizeNumericValue(rawIndicators.commodityPrices?.oil?.price, 73.85),
              change: this.normalizeNumericValue(rawIndicators.commodityPrices?.oil?.change, -1.2)
            },
            gold: {
              price: this.normalizeNumericValue(rawIndicators.commodityPrices?.gold?.price, 2025.30),
              change: this.normalizeNumericValue(rawIndicators.commodityPrices?.gold?.change, 0.8)
            }
          },
          currencyStrength: this.normalizeCurrencyStrength(rawIndicators.currencyStrength)
        };
        
        this.setCachedData(cacheKey, indicators);
        return indicators;
      } catch (parseError) {
        console.error('Error parsing economic indicators response:', parseError);
        console.log('Raw response:', response.substring(0, 500));
        return null;
      }
    } catch (error) {
      console.error('Error generating economic indicators:', error);
      return null;
    }
  }

  async generateComprehensiveAnalysis() {
    try {
      const [conflicts, defenseMarket, healthMarket, energyMarket, economics] = await Promise.all([
        this.generateConflictPredictions(),
        this.generateMarketAnalysis('defense'),
        this.generateMarketAnalysis('health'),
        this.generateMarketAnalysis('energy'),
        this.generateEconomicIndicators()
      ]);

      return {
        conflicts,
        markets: {
          defense: defenseMarket,
          health: healthMarket,
          energy: energyMarket
        },
        economics,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating comprehensive analysis:', error);
      throw error;
    }
  }

  private normalizeInflationTrend(value: any): 'rising' | 'falling' | 'stable' {
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower.includes('rising') || lower.includes('increasing') || lower.includes('up')) return 'rising';
      if (lower.includes('falling') || lower.includes('decreasing') || lower.includes('down')) return 'falling';
    }
    return 'stable';
  }

  private normalizeDirection(value: any): 'up' | 'down' | 'stable' {
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower.includes('up') || lower.includes('rising') || lower.includes('elevated') || lower.includes('higher')) return 'up';
      if (lower.includes('down') || lower.includes('falling') || lower.includes('lower')) return 'down';
    }
    return 'stable';
  }

  private normalizeNumericValue(value: any, fallback: number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (!isNaN(parsed)) return parsed;
    }
    return fallback;
  }

  private normalizeCurrencyStrength(value: any): 'strong' | 'weak' | 'stable' {
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower.includes('strong') || lower.includes('stronger')) return 'strong';
      if (lower.includes('weak') || lower.includes('weaker')) return 'weak';
    }
    if (typeof value === 'object' && value?.USD) {
      const usdValue = value.USD.toLowerCase();
      if (usdValue.includes('strong') || usdValue.includes('stronger')) return 'strong';
      if (usdValue.includes('weak') || usdValue.includes('weaker')) return 'weak';
    }
    return 'stable';
  }

  private cleanJsonResponse(jsonString: string): string {
    // Remove comments (both // and /* */)
    jsonString = jsonString.replace(/\/\/.*$/gm, '');
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove trailing commas
    jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
    
    // Normalize whitespace
    jsonString = jsonString.replace(/\s*[\r\n]+\s*/g, ' ');
    
    // Handle truncated JSON by ensuring proper closing
    let openBraces = 0;
    let lastValidIndex = jsonString.length;
    
    for (let i = 0; i < jsonString.length; i++) {
      if (jsonString[i] === '{') openBraces++;
      if (jsonString[i] === '}') openBraces--;
      if (openBraces === 0 && jsonString[i] === '}') {
        lastValidIndex = i + 1;
        break;
      }
    }
    
    if (openBraces > 0) {
      // JSON is truncated, close it properly
      jsonString = jsonString.substring(0, lastValidIndex) + '}'.repeat(openBraces);
    } else {
      jsonString = jsonString.substring(0, lastValidIndex);
    }
    
    return jsonString.trim();
  }
}

export const realTimeAIAnalysis = new RealTimeAIAnalysisService();