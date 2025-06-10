import OpenAI from "openai";
import type { Conflict, Stock } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Perplexity API for real-time search
async function searchCurrentEvents(query: string): Promise<string> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a geopolitical intelligence analyst. Provide factual, current information about conflicts and defense developments. Focus on recent developments in the past 30 days."
          },
          {
            role: "user",
            content: query
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        search_recency_filter: "month",
        return_related_questions: false,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content || "";
  } catch (error) {
    console.error('Error fetching current events:', error);
    return "";
  }
}

export interface ConflictPrediction {
  conflictId: number;
  conflictName: string;
  scenario: "escalation" | "de-escalation" | "stalemate" | "resolution";
  probability: number;
  timeframe: string;
  narrative: string;
  keyFactors: string[];
  economicImpact: string;
  defenseStockImpact: {
    affected: string[];
    direction: "positive" | "negative" | "neutral";
    magnitude: "low" | "medium" | "high";
  };
  geopoliticalImplications: string[];
  riskFactors: string[];
  mitigationStrategies: string[];
}

export interface MarketAnalysis {
  overallSentiment: "bullish" | "bearish" | "neutral";
  sectorOutlook: string;
  keyDrivers: string[];
  riskAssessment: string;
  investmentImplications: string[];
  timeHorizon: string;
}

export async function generateSectorPredictions(
  sector: string,
  conflicts: Conflict[],
  stocks: Stock[]
): Promise<ConflictPrediction[]> {
  console.log(`generateSectorPredictions called with sector: ${sector}`);
  
  // Validate sector parameter
  const validSectors = ['defense', 'health', 'energy'];
  const normalizedSector = validSectors.includes(sector) ? sector : 'defense';
  console.log(`Validated sector: ${normalizedSector} (original: ${sector})`);
  
  if (normalizedSector === 'defense') {
    console.log('Generating defense predictions');
    // Process conflicts in parallel for defense sector
    const predictionPromises = conflicts.map(conflict => 
      generateSingleConflictPrediction(conflict, stocks).catch(error => {
        console.error(`Error generating prediction for ${conflict.name}:`, error);
        return null;
      })
    );

    const results = await Promise.all(predictionPromises);
    return results.filter((prediction): prediction is ConflictPrediction => prediction !== null);
  } else if (normalizedSector === 'health') {
    console.log('Generating health predictions');
    return generateHealthPredictions(stocks);
  } else if (normalizedSector === 'energy') {
    console.log('Generating energy predictions');
    return generateEnergyPredictions(stocks);
  }
  
  console.log(`Unknown sector ${normalizedSector}, returning empty array`);
  return [];
}

export async function generateConflictPredictions(
  conflicts: Conflict[],
  stocks: Stock[]
): Promise<ConflictPrediction[]> {
  return generateSectorPredictions('defense', conflicts, stocks);
}

async function generateHealthPredictions(stocks: Stock[]): Promise<ConflictPrediction[]> {
  const healthStocks = stocks.filter(s => s.sector === 'Healthcare');
  
  const healthTopics = [
    "Global Pandemic Preparedness and Biosecurity",
    "Pharmaceutical Pricing and Regulatory Changes", 
    "mRNA Technology and Next-Gen Vaccines",
    "AI-Driven Drug Discovery and Development",
    "Healthcare Infrastructure and Digital Health"
  ];

  const predictionPromises = healthTopics.map(async (topic, index) => {
    const stockSymbols = healthStocks.map(s => s.symbol).join(", ");
    
    const prompt = `Analyze this pharmaceutical and healthcare market topic:

Topic: ${topic}
Healthcare Companies: ${stockSymbols}

Generate market predictions in JSON format:
{
  "scenario": "growth|decline|stability|disruption",
  "probability": 0-100,
  "timeframe": "specific timeframe like '6-18 months', '2-4 years'",
  "narrative": "concise prediction about pharmaceutical market developments and healthcare trends",
  "keyFactors": ["regulatory factor", "market driver", "technology factor"],
  "economicImpact": "economic implications for pharmaceutical and healthcare sectors",
  "defenseStockImpact": {
    "affected": ["relevant healthcare stock symbols"],
    "direction": "positive|negative|neutral",
    "magnitude": "low|medium|high"
  },
  "geopoliticalImplications": ["global health policy impact", "international market effect"],
  "riskFactors": ["regulatory risk", "market risk"],
  "mitigationStrategies": ["strategic approach", "risk management"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a healthcare industry analyst specializing in pharmaceutical markets and global health trends."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = JSON.parse(response.choices[0].message.content!);

    return {
      conflictId: index + 100,
      conflictName: topic,
      scenario: analysis.scenario,
      probability: analysis.probability,
      timeframe: analysis.timeframe,
      narrative: analysis.narrative,
      keyFactors: analysis.keyFactors,
      economicImpact: analysis.economicImpact,
      defenseStockImpact: {
        affected: healthStocks.map(s => s.symbol),
        direction: analysis.defenseStockImpact?.direction || "positive",
        magnitude: analysis.defenseStockImpact?.magnitude || "medium"
      },
      geopoliticalImplications: analysis.geopoliticalImplications,
      riskFactors: analysis.riskFactors,
      mitigationStrategies: analysis.mitigationStrategies
    };
  });

  const results = await Promise.all(predictionPromises);
  return results;
}

async function generateEnergyPredictions(stocks: Stock[]): Promise<ConflictPrediction[]> {
  const energyStocks = stocks.filter(s => s.sector === 'Energy');
  
  const energyTopics = [
    "Oil Price Volatility",
    "Green Energy Transition",
    "Natural Gas Infrastructure",
    "Carbon Tax Regulations"
  ];

  const predictionPromises = energyTopics.map(async (topic, index) => {
    const stockSymbols = energyStocks.map(s => s.symbol).join(", ");
    
    const prompt = `Analyze this energy market topic and generate predictions:

Topic: ${topic}
Energy Companies: ${stockSymbols}

Generate energy market predictions in JSON format:
{
  "scenario": "bullish|bearish|volatile|transition",
  "probability": 0-100,
  "timeframe": "specific timeframe like '4-12 months', '1-3 years'",
  "narrative": "concise prediction about oil, gas, and renewable energy market developments",
  "keyFactors": ["supply/demand factor", "regulatory change", "technology advancement"],
  "economicImpact": "economic implications for energy and commodity markets",
  "defenseStockImpact": {
    "affected": ["relevant energy stock symbols"],
    "direction": "positive|negative|neutral",
    "magnitude": "low|medium|high"
  },
  "geopoliticalImplications": ["energy security impact", "international trade effect"],
  "riskFactors": ["commodity price risk", "regulatory risk"],
  "mitigationStrategies": ["portfolio diversification", "risk hedging"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an energy sector analyst specializing in oil, gas, and renewable energy markets."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = JSON.parse(response.choices[0].message.content!);

    return {
      conflictId: index + 200,
      conflictName: topic,
      scenario: analysis.scenario,
      probability: analysis.probability,
      timeframe: analysis.timeframe,
      narrative: analysis.narrative,
      keyFactors: analysis.keyFactors,
      economicImpact: analysis.economicImpact,
      defenseStockImpact: {
        affected: energyStocks.map(s => s.symbol),
        direction: analysis.defenseStockImpact?.direction || "positive",
        magnitude: analysis.defenseStockImpact?.magnitude || "medium"
      },
      geopoliticalImplications: analysis.geopoliticalImplications,
      riskFactors: analysis.riskFactors,
      mitigationStrategies: analysis.mitigationStrategies
    };
  });

  const results = await Promise.all(predictionPromises);
  return results;
}

async function generateSingleConflictPrediction(
  conflict: Conflict,
  stocks: Stock[]
): Promise<ConflictPrediction> {
  const stockSymbols = stocks.map(s => s.symbol).join(", ");
  
  // Single optimized prompt without external API calls for faster response
  const prompt = `Analyze this conflict and provide predictions:

Conflict: ${conflict.name}
Region: ${conflict.region}
Status: ${conflict.status}
Severity: ${conflict.severity}
Defense Stocks: ${stockSymbols}

Provide analysis in JSON format:
{
  "scenario": "escalation|de-escalation|stalemate|resolution",
  "probability": 0-100,
  "timeframe": "specific timeframe like '3-6 months', '1-2 years'",
  "narrative": "brief prediction story",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "economicImpact": "economic implications",
  "defenseStockImpact": {
    "affected": ["stock symbols"],
    "direction": "positive|negative|neutral",
    "magnitude": "low|medium|high"
  },
  "geopoliticalImplications": ["implication1", "implication2"],
  "riskFactors": ["risk1", "risk2"],
  "mitigationStrategies": ["strategy1", "strategy2"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using faster mini model for quicker responses
    messages: [
      {
        role: "system",
        content: "You are a geopolitical analyst. Provide rapid, concise predictions in valid JSON format."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 800
  });

  const analysis = JSON.parse(response.choices[0].message.content!);

  return {
    conflictId: conflict.id,
    conflictName: conflict.name,
    scenario: analysis.scenario,
    probability: analysis.probability,
    timeframe: analysis.timeframe,
    narrative: analysis.narrative,
    keyFactors: analysis.keyFactors,
    economicImpact: analysis.economicImpact,
    defenseStockImpact: analysis.defenseStockImpact,
    geopoliticalImplications: analysis.geopoliticalImplications,
    riskFactors: analysis.riskFactors,
    mitigationStrategies: analysis.mitigationStrategies
  };
}

export async function generateSectorMarketAnalysis(
  sector: string,
  stocks: Stock[],
  conflicts: Conflict[],
  correlationEvents: any[]
): Promise<MarketAnalysis> {
  console.log(`generateSectorMarketAnalysis called with sector: ${sector}`);
  
  if (sector === 'defense') {
    console.log('Generating defense market analysis');
    return generateDefenseMarketAnalysis(stocks, conflicts, correlationEvents);
  } else if (sector === 'health') {
    console.log('Generating health market analysis');
    return generateHealthMarketAnalysis(stocks);
  } else if (sector === 'energy') {
    console.log('Generating energy market analysis');
    return generateEnergyMarketAnalysis(stocks);
  }
  
  console.log(`Unknown sector ${sector}, defaulting to defense`);
  // Default to defense analysis
  return generateDefenseMarketAnalysis(stocks, conflicts, correlationEvents);
}

export async function generateMarketAnalysis(
  stocks: Stock[],
  conflicts: Conflict[],
  correlationEvents: any[]
): Promise<MarketAnalysis> {
  return generateSectorMarketAnalysis('defense', stocks, conflicts, correlationEvents);
}

async function generateDefenseMarketAnalysis(
  stocks: Stock[],
  conflicts: Conflict[],
  correlationEvents: any[]
): Promise<MarketAnalysis> {
  const conflictSummary = conflicts.map(c => 
    `${c.name} (${c.region}): ${c.status} - ${c.severity}`
  ).join('\n');

  const stockPerformance = stocks.map(s => 
    `${s.symbol}: $${s.price} (${s.changePercent > 0 ? '+' : ''}${s.changePercent}%)`
  ).join('\n');

  const prompt = `Analyze defense market conditions:

Conflicts: ${conflictSummary}
Stock Performance: ${stockPerformance}

Provide rapid market analysis in JSON:
{
  "overallSentiment": "bullish|bearish|neutral",
  "sectorOutlook": "brief sector outlook",
  "keyDrivers": ["driver1", "driver2", "driver3"],
  "riskAssessment": "brief risk assessment",
  "investmentImplications": ["implication1", "implication2"],
  "timeHorizon": "time horizon"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using faster mini model for quicker responses
    messages: [
      {
        role: "system",
        content: "You are a defense analyst. Provide rapid, concise market analysis in valid JSON format."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 600
  });

  const analysis = JSON.parse(response.choices[0].message.content!);

  return {
    overallSentiment: analysis.overallSentiment,
    sectorOutlook: analysis.sectorOutlook,
    keyDrivers: analysis.keyDrivers,
    riskAssessment: analysis.riskAssessment,
    investmentImplications: analysis.investmentImplications,
    timeHorizon: analysis.timeHorizon
  };
}

async function generateHealthMarketAnalysis(stocks: Stock[]): Promise<MarketAnalysis> {
  const healthStocks = stocks.filter(s => s.sector === 'Healthcare');
  
  const stockPerformance = healthStocks.map(s => 
    `${s.symbol}: $${s.price} (${s.changePercent > 0 ? '+' : ''}${s.changePercent}%)`
  ).join('\n');

  const prompt = `Analyze healthcare market conditions:

Healthcare Stock Performance: ${stockPerformance}

Provide rapid market analysis in JSON:
{
  "overallSentiment": "bullish|bearish|neutral",
  "sectorOutlook": "brief healthcare sector outlook",
  "keyDrivers": ["driver1", "driver2", "driver3"],
  "riskAssessment": "brief risk assessment for healthcare",
  "investmentImplications": ["implication1", "implication2"],
  "timeHorizon": "time horizon"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a healthcare analyst specializing in pharmaceutical markets. Provide rapid, concise market analysis in valid JSON format."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 600
  });

  const analysis = JSON.parse(response.choices[0].message.content!);

  return {
    overallSentiment: analysis.overallSentiment,
    sectorOutlook: analysis.sectorOutlook,
    keyDrivers: analysis.keyDrivers,
    riskAssessment: analysis.riskAssessment,
    investmentImplications: analysis.investmentImplications,
    timeHorizon: analysis.timeHorizon
  };
}

async function generateEnergyMarketAnalysis(stocks: Stock[]): Promise<MarketAnalysis> {
  const energyStocks = stocks.filter(s => s.sector === 'Energy');
  
  const stockPerformance = energyStocks.map(s => 
    `${s.symbol}: $${s.price} (${s.changePercent > 0 ? '+' : ''}${s.changePercent}%)`
  ).join('\n');

  const prompt = `Analyze energy market conditions:

Energy Stock Performance: ${stockPerformance}

Provide rapid market analysis in JSON:
{
  "overallSentiment": "bullish|bearish|neutral",
  "sectorOutlook": "brief energy sector outlook",
  "keyDrivers": ["driver1", "driver2", "driver3"],
  "riskAssessment": "brief risk assessment for energy",
  "investmentImplications": ["implication1", "implication2"],
  "timeHorizon": "time horizon"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an energy analyst specializing in oil, gas, and renewable energy. Provide rapid, concise market analysis in valid JSON format."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 600
  });

  const analysis = JSON.parse(response.choices[0].message.content!);

  return {
    overallSentiment: analysis.overallSentiment,
    sectorOutlook: analysis.sectorOutlook,
    keyDrivers: analysis.keyDrivers,
    riskAssessment: analysis.riskAssessment,
    investmentImplications: analysis.investmentImplications,
    timeHorizon: analysis.timeHorizon
  };
}

export async function generateConflictStoryline(conflict: Conflict): Promise<{
  currentSituation: string;
  possibleOutcomes: Array<{
    scenario: string;
    probability: number;
    description: string;
    timeline: string;
    implications: string[];
  }>;
  keyWatchPoints: string[];
  expertInsights: string;
}> {
  // Fetch current detailed situation and recent developments
  const currentSituationQuery = `Detailed current situation of ${conflict.name} conflict in ${conflict.region}. Latest military positions, diplomatic negotiations, casualty reports, humanitarian situation, and key players involved in the past 30 days.`;
  const currentSituation = await searchCurrentEvents(currentSituationQuery);
  
  // Search for expert analysis and predictions
  const expertAnalysisQuery = `Expert analysis and predictions for ${conflict.name} conflict outcomes. Military analysts, diplomatic experts, and think tank assessments of possible scenarios and conflict resolution prospects.`;
  const expertAnalysis = await searchCurrentEvents(expertAnalysisQuery);
  
  const prompt = `As a geopolitical storyteller and analyst, create a comprehensive narrative analysis for this conflict using the latest available information.

Conflict: ${conflict.name}
Region: ${conflict.region}
Status: ${conflict.status}
Severity: ${conflict.severity}
Duration: ${conflict.duration}

CURRENT SITUATION AND DEVELOPMENTS:
${currentSituation}

EXPERT ANALYSIS AND PREDICTIONS:
${expertAnalysis}

Based on the latest intelligence above, create a detailed storyline analysis in JSON format:
{
  "currentSituation": "comprehensive current situation narrative based on recent developments",
  "possibleOutcomes": [
    {
      "scenario": "scenario name",
      "probability": 0-100,
      "description": "detailed description based on current facts",
      "timeline": "expected timeline",
      "implications": ["implication1", "implication2"]
    }
  ],
  "keyWatchPoints": ["indicator1", "indicator2", "indicator3"],
  "expertInsights": "expert analytical insights based on current intelligence"
}

Provide 3-4 realistic scenarios grounded in the current facts and expert assessments. Use the latest developments to inform your analysis.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a renowned geopolitical analyst with access to current intelligence who creates compelling, factual narratives about global conflicts based on the latest developments and expert assessments."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 2000
  });

  return JSON.parse(response.choices[0].message.content!);
}