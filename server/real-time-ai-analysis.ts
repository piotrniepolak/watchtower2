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

    // Skip sample data - use real API

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

  async generateEconomicIndicators(): Promise<EconomicIndicators | null> {
    const cacheKey = 'economic_indicators';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // Skip sample data - use real API

    try {
      const prompt = `Return ONLY valid JSON with no explanatory text. Analyze current economic indicators and provide data in this exact JSON format:

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

Use latest economic data from the last 24-48 hours. Return ONLY the JSON object with no other text. Today's date: ${new Date().toISOString().split('T')[0]}`;

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
            cleanedResponse = jsonMatch[1];
          }
        }
        
        const indicators = JSON.parse(cleanedResponse);
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
}

export const realTimeAIAnalysis = new RealTimeAIAnalysisService();