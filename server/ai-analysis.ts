import OpenAI from "openai";
import type { Conflict, Stock } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function generateConflictPredictions(
  conflicts: Conflict[],
  stocks: Stock[]
): Promise<ConflictPrediction[]> {
  const predictions: ConflictPrediction[] = [];

  for (const conflict of conflicts) {
    try {
      const prediction = await generateSingleConflictPrediction(conflict, stocks);
      predictions.push(prediction);
    } catch (error) {
      console.error(`Error generating prediction for ${conflict.name}:`, error);
    }
  }

  return predictions;
}

async function generateSingleConflictPrediction(
  conflict: Conflict,
  stocks: Stock[]
): Promise<ConflictPrediction> {
  const stockSymbols = stocks.map(s => s.symbol).join(", ");
  
  const prompt = `As a geopolitical analyst and defense market expert, analyze the current conflict and provide a comprehensive prediction.

Conflict: ${conflict.name}
Region: ${conflict.region}
Current Status: ${conflict.status}
Severity: ${conflict.severity}
Duration: ${conflict.duration}

Available Defense Stocks: ${stockSymbols}

Provide a detailed analysis in the following JSON format:
{
  "scenario": "escalation|de-escalation|stalemate|resolution",
  "probability": 0-100,
  "timeframe": "specific timeframe like '3-6 months', '1-2 years'",
  "narrative": "detailed 3-4 sentence prediction story",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "economicImpact": "economic implications description",
  "defenseStockImpact": {
    "affected": ["stock symbols that would be most affected"],
    "direction": "positive|negative|neutral",
    "magnitude": "low|medium|high"
  },
  "geopoliticalImplications": ["implication1", "implication2"],
  "riskFactors": ["risk1", "risk2", "risk3"],
  "mitigationStrategies": ["strategy1", "strategy2"]
}

Base your analysis on current geopolitical trends, historical patterns, and market dynamics. Be realistic and data-driven.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a senior geopolitical analyst with expertise in defense markets and conflict prediction. Provide realistic, well-reasoned analyses based on current global dynamics."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1500
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

export async function generateMarketAnalysis(
  conflicts: Conflict[],
  stocks: Stock[],
  predictions: ConflictPrediction[]
): Promise<MarketAnalysis> {
  const conflictSummary = conflicts.map(c => 
    `${c.name} (${c.region}): ${c.status} - ${c.severity}`
  ).join('\n');

  const stockPerformance = stocks.map(s => 
    `${s.symbol}: $${s.price} (${s.changePercent > 0 ? '+' : ''}${s.changePercent}%)`
  ).join('\n');

  const predictionSummary = predictions.map(p => 
    `${p.conflictName}: ${p.scenario} (${p.probability}% probability)`
  ).join('\n');

  const prompt = `As a defense sector analyst, provide a comprehensive market analysis based on current conflicts and predictions.

Current Conflicts:
${conflictSummary}

Defense Stock Performance:
${stockPerformance}

AI Predictions:
${predictionSummary}

Provide analysis in JSON format:
{
  "overallSentiment": "bullish|bearish|neutral",
  "sectorOutlook": "detailed sector outlook description",
  "keyDrivers": ["driver1", "driver2", "driver3"],
  "riskAssessment": "risk assessment description",
  "investmentImplications": ["implication1", "implication2"],
  "timeHorizon": "relevant time horizon for analysis"
}

Focus on defense sector dynamics, geopolitical risk premiums, and market opportunities.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a senior defense sector analyst with deep expertise in geopolitical risk assessment and defense market dynamics."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 1000
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
  const prompt = `As a geopolitical storyteller and analyst, create a comprehensive narrative analysis for this conflict.

Conflict: ${conflict.name}
Region: ${conflict.region}
Status: ${conflict.status}
Severity: ${conflict.severity}
Duration: ${conflict.duration}

Create a detailed storyline analysis in JSON format:
{
  "currentSituation": "comprehensive current situation narrative",
  "possibleOutcomes": [
    {
      "scenario": "scenario name",
      "probability": 0-100,
      "description": "detailed description",
      "timeline": "expected timeline",
      "implications": ["implication1", "implication2"]
    }
  ],
  "keyWatchPoints": ["indicator1", "indicator2", "indicator3"],
  "expertInsights": "expert analytical insights and commentary"
}

Provide 3-4 realistic scenarios with compelling narratives. Be objective and analytical.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a renowned geopolitical analyst and storyteller who creates compelling, accurate narratives about global conflicts and their potential trajectories."
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