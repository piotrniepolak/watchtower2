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

export async function generateConflictPredictions(
  conflicts: Conflict[],
  stocks: Stock[]
): Promise<ConflictPrediction[]> {
  // Process conflicts in parallel for much faster results
  const predictionPromises = conflicts.map(conflict => 
    generateSingleConflictPrediction(conflict, stocks).catch(error => {
      console.error(`Error generating prediction for ${conflict.name}:`, error);
      return null;
    })
  );

  const results = await Promise.all(predictionPromises);
  return results.filter((prediction): prediction is ConflictPrediction => prediction !== null);
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
  "narrative": "detailed 3-4 sentence prediction story based on current developments",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "economicImpact": "economic implications description based on current trends",
  "defenseStockImpact": {
    "affected": ["stock symbols that would be most affected"],
    "direction": "positive|negative|neutral",
    "magnitude": "low|medium|high"
  },
  "geopoliticalImplications": ["implication1", "implication2"],
  "riskFactors": ["risk1", "risk2", "risk3"],
  "mitigationStrategies": ["strategy1", "strategy2"]
}

Use the current events and recent developments to make realistic, data-driven predictions. Focus on what is actually happening now rather than historical patterns alone.`;

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

export async function generateMarketAnalysis(
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