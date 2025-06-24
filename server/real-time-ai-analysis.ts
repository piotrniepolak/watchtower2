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
      console.warn('PERPLEXITY_API_KEY not found - AI analysis will be limited');
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

    try {
      const prompt = `Analyze current global conflicts and geopolitical tensions from the last 24-48 hours. Focus on:

1. Active military conflicts (Ukraine-Russia, Middle East, Taiwan Strait, etc.)
2. Recent diplomatic tensions or breakthroughs
3. Economic sanctions or trade disputes
4. Regional instability indicators

For each significant conflict or tension, provide analysis in this JSON format:
{
  "predictions": [
    {
      "conflictName": "specific conflict name",
      "region": "geographic region",
      "scenario": "escalation|de-escalation|stalemate|resolution",
      "probability": number 0-100,
      "timeframe": "specific timeframe (e.g., '3-6 months')",
      "narrative": "detailed analysis based on recent developments",
      "keyFactors": ["factor1", "factor2", "factor3"],
      "marketImpact": "positive|negative|neutral",
      "affectedSectors": ["defense", "energy", "technology", etc.],
      "riskLevel": "low|medium|high|critical"
    }
  ]
}

Focus only on real, current conflicts with recent developments. Use today's date: ${new Date().toISOString().split('T')[0]}`;

      const systemMessage = `You are a senior geopolitical analyst with access to real-time global intelligence. Analyze only current, active conflicts and tensions with recent developments from credible news sources. Provide realistic probability assessments based on actual events, not speculation.`;

      const response = await this.callPerplexityAPI(prompt, systemMessage);
      
      try {
        // Clean response by removing markdown code blocks if present
        const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
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

      const prompt = `Analyze current market conditions and provide investment insights for ${sector} sector stocks focusing on ${companies}.

Consider recent developments from the last 24-48 hours:
1. Earnings reports or guidance updates
2. Geopolitical events affecting the sector
3. Regulatory changes or government contracts
4. Industry-specific news and trends
5. Economic indicators impact

Provide analysis in this JSON format:
{
  "overallSentiment": "bullish|bearish|neutral",
  "sector": "${sector}",
  "keyDrivers": ["driver1", "driver2", "driver3"],
  "topStocks": [
    {
      "symbol": "stock symbol",
      "prediction": "buy|sell|hold",
      "confidence": number 0-100,
      "reasoning": "specific reasoning based on recent news"
    }
  ],
  "riskFactors": ["risk1", "risk2", "risk3"],
  "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "timeHorizon": "short-term timeframe",
  "marketOutlook": "detailed outlook based on current events"
}

Base recommendations on actual recent news and market movements. Today's date: ${new Date().toISOString().split('T')[0]}`;

      const systemMessage = `You are a senior financial analyst with access to real-time market data and news. Provide specific, actionable investment insights based on current market conditions and recent developments. Focus on factual analysis from credible financial sources.`;

      const response = await this.callPerplexityAPI(prompt, systemMessage);
      
      try {
        // Clean response by removing markdown code blocks if present
        const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
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

    try {
      const prompt = `Analyze current economic indicators and provide a comprehensive overview based on the latest data from the last 24-48 hours:

1. Recent inflation data and trends
2. GDP growth indicators or forecasts
3. Employment/unemployment statistics
4. Federal Reserve policy or interest rate decisions
5. Commodity prices (oil, gold) with recent changes
6. Currency strength indicators (USD)

Provide analysis in this JSON format:
{
  "inflationTrend": "rising|falling|stable",
  "gdpGrowth": actual_number,
  "unemploymentRate": actual_number,
  "interestRateDirection": "up|down|stable",
  "commodityPrices": {
    "oil": {"price": current_price, "change": percent_change},
    "gold": {"price": current_price, "change": percent_change}
  },
  "currencyStrength": "strong|weak|stable"
}

Use only current, verified economic data from official sources. Today's date: ${new Date().toISOString().split('T')[0]}`;

      const systemMessage = `You are a senior economist with access to real-time economic data from official government and financial institutions. Provide accurate, current economic indicators based on the latest available data from credible sources like the Federal Reserve, Bureau of Labor Statistics, and major financial data providers.`;

      const response = await this.callPerplexityAPI(prompt, systemMessage);
      
      try {
        // Clean response by removing markdown code blocks if present
        const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
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