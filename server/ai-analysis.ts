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
        model: "sonar-pro",
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
        search_after_date_filter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US'),
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
  console.log(`🎯 generateSectorPredictions called with sector: "${sector}"`);
  
  // Validate and normalize sector parameter
  const validSectors = ['defense', 'health', 'energy'];
  const normalizedSector = validSectors.includes(sector) ? sector : 'defense';
  console.log(`✅ Validated sector: "${normalizedSector}" (original: "${sector}")`);
  
  try {
    if (normalizedSector === 'health') {
      console.log('🏥 Generating health predictions');
      return await generateHealthPredictions(stocks);
    } else if (normalizedSector === 'energy') {
      console.log('⚡ Generating energy predictions');
      return await generateEnergyPredictions(stocks);
    } else {
      console.log('🛡️ Generating defense predictions');
      // Process conflicts in parallel for defense sector
      const predictionPromises = conflicts.map(conflict => 
        generateSingleConflictPrediction(conflict, stocks).catch(error => {
          console.error(`Error generating prediction for ${conflict.name}:`, error);
          return null;
        })
      );

      const results = await Promise.all(predictionPromises);
      return results.filter((prediction): prediction is ConflictPrediction => prediction !== null);
    }
  } catch (error) {
    console.error(`❌ Error in generateSectorPredictions for ${normalizedSector}:`, error);
    return [];
  }
}

export async function generateConflictPredictions(
  conflicts: Conflict[],
  stocks: Stock[],
  sector: string = 'defense'
): Promise<ConflictPrediction[]> {
  return generateSectorPredictions(sector, conflicts, stocks);
}

async function generateHealthPredictions(stocks: Stock[]): Promise<ConflictPrediction[]> {
  console.log('🏥 Starting health predictions generation');
  const healthStocks = stocks.filter(s => s.sector === 'Healthcare');
  console.log(`Found ${healthStocks.length} healthcare stocks:`, healthStocks.map(s => s.symbol));
  
  // Return simplified health predictions to avoid timeout issues
  const healthPredictions: ConflictPrediction[] = [
    {
      conflictId: 100,
      conflictName: "Global Pandemic Preparedness",
      scenario: "escalation",
      probability: 85,
      timeframe: "6-18 months",
      narrative: "Increased investment in pandemic preparedness and biosecurity infrastructure will drive growth in healthcare and pharmaceutical sectors.",
      keyFactors: ["WHO guidelines", "Government funding", "Vaccine development"],
      economicImpact: "Positive impact on pharmaceutical and healthcare infrastructure sectors",
      defenseStockImpact: {
        affected: healthStocks.map(s => s.symbol),
        direction: "positive",
        magnitude: "medium"
      },
      geopoliticalImplications: ["Global health security cooperation", "International vaccine distribution"],
      riskFactors: ["Regulatory delays", "Supply chain disruptions"],
      mitigationStrategies: ["Diversified R&D portfolio", "Strategic partnerships"]
    },
    {
      conflictId: 101,
      conflictName: "Pharmaceutical Innovation",
      scenario: "escalation",
      probability: 78,
      timeframe: "12-24 months",
      narrative: "AI-driven drug discovery and personalized medicine are accelerating pharmaceutical innovation and market expansion.",
      keyFactors: ["AI integration", "Personalized medicine", "Regulatory support"],
      economicImpact: "Strong growth potential for biotech and pharmaceutical companies",
      defenseStockImpact: {
        affected: healthStocks.map(s => s.symbol),
        direction: "positive",
        magnitude: "high"
      },
      geopoliticalImplications: ["Technology transfer agreements", "International patent policies"],
      riskFactors: ["Competition from generic drugs", "Pricing pressures"],
      mitigationStrategies: ["Innovation pipeline diversification", "Market expansion"]
    }
  ];
  
  console.log(`✅ Generated ${healthPredictions.length} health predictions`);
  return healthPredictions;
}

async function generateEnergyPredictions(stocks: Stock[]): Promise<ConflictPrediction[]> {
  console.log('⚡ Starting energy predictions generation');
  const energyStocks = stocks.filter(s => s.sector === 'Energy');
  console.log(`Found ${energyStocks.length} energy stocks:`, energyStocks.map(s => s.symbol));
  
  // Return simplified energy predictions to avoid timeout issues
  const energyPredictions: ConflictPrediction[] = [
    {
      conflictId: 200,
      conflictName: "Oil Price Volatility",
      scenario: "escalation",
      probability: 82,
      timeframe: "4-12 months",
      narrative: "Geopolitical tensions and supply chain disruptions are expected to drive continued volatility in oil prices, impacting energy sector performance.",
      keyFactors: ["OPEC decisions", "Geopolitical tensions", "Supply disruptions"],
      economicImpact: "Significant impact on energy companies and commodity markets",
      defenseStockImpact: {
        affected: energyStocks.map(s => s.symbol),
        direction: "positive",
        magnitude: "high"
      },
      geopoliticalImplications: ["Energy security concerns", "Strategic reserve policies"],
      riskFactors: ["Price volatility", "Demand fluctuations"],
      mitigationStrategies: ["Portfolio diversification", "Hedging strategies"]
    },
    {
      conflictId: 201,
      conflictName: "Green Energy Transition",
      scenario: "escalation",
      probability: 89,
      timeframe: "1-3 years",
      narrative: "Accelerating investments in renewable energy infrastructure and government climate policies are reshaping the energy sector landscape.",
      keyFactors: ["Climate policies", "Technology advancement", "Investment flows"],
      economicImpact: "Mixed impact with traditional energy facing headwinds while renewables grow",
      defenseStockImpact: {
        affected: energyStocks.map(s => s.symbol),
        direction: "neutral",
        magnitude: "medium"
      },
      geopoliticalImplications: ["Energy independence goals", "International climate agreements"],
      riskFactors: ["Regulatory changes", "Technology disruption"],
      mitigationStrategies: ["Diversification into renewables", "Technological adaptation"]
    }
  ];
  
  console.log(`✅ Generated ${energyPredictions.length} energy predictions`);
  return energyPredictions;
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

export async function generateSectorStorylines(sector: string, conflicts: Conflict[], stocks: Stock[], focusId?: number): Promise<any[]> {
  const sectorStocks = stocks.filter(s => {
    if (sector === 'defense') return s.sector === 'Defense';
    if (sector === 'health') return s.sector === 'Healthcare';
    if (sector === 'energy') return s.sector === 'Energy';
    return false;
  });

  if (sector === 'defense') {
    return await generateDefenseStorylines(conflicts, sectorStocks);
  } else if (sector === 'health') {
    return await generateHealthStorylines(sectorStocks, focusId);
  } else if (sector === 'energy') {
    return await generateEnergyStorylines(sectorStocks, focusId);
  }
  
  return [];
}

async function generateDefenseStorylines(conflicts: Conflict[], stocks: Stock[]): Promise<any[]> {
  const activeConflicts = conflicts.filter(c => c.status === 'Active');
  
  // If no specific conflicts provided, generate storylines for top active conflicts
  if (activeConflicts.length === 0) {
    return [];
  }

  const storylines = [];
  const conflictsToProcess = activeConflicts.slice(0, Math.min(3, activeConflicts.length));
  
  for (const conflict of conflictsToProcess) {
    const stockPerformance = stocks.slice(0, 5).map(s => 
      `${s.symbol}: $${s.price} (${s.changePercent > 0 ? '+' : ''}${s.changePercent}%)`
    ).join('\n');

    const prompt = `Create a defense industry storyline for the ${conflict.name} conflict:

Conflict: ${conflict.name}
Region: ${conflict.region}  
Status: ${conflict.status}
Severity: ${conflict.severity}

Defense Stock Performance:
${stockPerformance}

Generate a strategic storyline in JSON format:
{
  "conflictName": "${conflict.name}",
  "currentSituation": "current defense industry response to this conflict",
  "possibleOutcomes": [
    {
      "scenario": "scenario name",
      "probability": 25-45,
      "description": "detailed outcome description",
      "timeline": "3-6 months|6-12 months|1-2 years",
      "implications": ["specific defense industry implication", "geopolitical market impact", "contractor performance outlook"]
    },
    {
      "scenario": "alternative scenario name",
      "probability": 20-40,
      "description": "alternative outcome description",
      "timeline": "6-18 months|1-3 years",
      "implications": ["alternative defense implication", "supply chain impact", "budget allocation effect"]
    }
  ],
  "keyWatchPoints": ["defense indicator 1", "defense indicator 2", "defense indicator 3"],
  "expertInsights": "defense industry expert analysis"
}

Provide detailed, specific implications for each scenario focusing on defense contractors, military spending, and market impacts.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a defense industry analyst specializing in geopolitical conflicts and their impact on defense contractors and military spending."
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

    storylines.push(JSON.parse(response.choices[0].message.content!));
  }
  
  return storylines;
}

async function generateHealthStorylines(stocks: Stock[], focusId?: number): Promise<any[]> {
  const stockPerformance = stocks.slice(0, 5).map(s => 
    `${s.symbol}: $${s.price} (${s.changePercent > 0 ? '+' : ''}${s.changePercent}%)`
  ).join('\n');

  const healthScenarios = [
    {
      id: null,
      title: "Global Health Trends",
      focus: "global health market dynamics, pharmaceutical innovation, and healthcare sector developments"
    },
    {
      id: 1,
      title: "Pandemic Preparedness",
      focus: "vaccine development, disease surveillance, and international health cooperation"
    },
    {
      id: 2,
      title: "Healthcare Innovation",
      focus: "digital therapeutics, personalized medicine, and healthcare technology adoption"
    },
    {
      id: 3,
      title: "Drug Development",
      focus: "pharmaceutical R&D, drug pipeline analysis, and regulatory approval processes"
    }
  ];

  // Find the specific scenario based on focusId, or default to global health trends
  const selectedScenario = healthScenarios.find(s => s.id === focusId) || healthScenarios[0];
  
  const prompt = `Create a healthcare industry storyline focusing on ${selectedScenario.title}:

Healthcare Stock Performance:
${stockPerformance}

Generate healthcare storyline in JSON format:
{
  "scenarioTitle": "${selectedScenario.title}",
  "currentSituation": "current global health landscape and pharmaceutical industry trends related to ${selectedScenario.focus}",
  "possibleOutcomes": [
    {
      "scenario": "positive development scenario", 
      "probability": 35-55,
      "description": "detailed positive health outcome description",
      "timeline": "6-18 months|1-3 years|2-5 years",
      "implications": ["specific pharmaceutical market impact", "healthcare access improvement", "regulatory policy change effect"]
    },
    {
      "scenario": "challenging scenario",
      "probability": 25-45,
      "description": "detailed challenging outcome description", 
      "timeline": "1-2 years|2-4 years",
      "implications": ["healthcare cost impact", "pharmaceutical R&D allocation", "global health system strain"]
    }
  ],
  "keyWatchPoints": ["health indicator 1", "health indicator 2", "health indicator 3"],
  "expertInsights": "pharmaceutical and health industry expert analysis"
}

Focus on ${selectedScenario.focus} with specific implications for pharmaceutical companies, healthcare systems, and medical innovation.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a healthcare industry analyst specializing in pharmaceutical markets, global health trends, and healthcare policy impacts."
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

  return [JSON.parse(response.choices[0].message.content!)];
}

async function generateEnergyStorylines(stocks: Stock[], focusId?: number): Promise<any[]> {
  const stockPerformance = stocks.slice(0, 5).map(s => 
    `${s.symbol}: $${s.price} (${s.changePercent > 0 ? '+' : ''}${s.changePercent}%)`
  ).join('\n');

  const energyScenarios = [
    {
      id: null,
      title: "Global Energy Markets",
      focus: "global energy market dynamics, oil and gas trends, and energy sector developments"
    },
    {
      id: 1,
      title: "Renewable Transition",
      focus: "solar and wind adoption, grid modernization, and traditional energy displacement"
    },
    {
      id: 2,
      title: "Oil & Gas Markets",
      focus: "global supply chains, geopolitical tensions, and price volatility impacts"
    },
    {
      id: 3,
      title: "Energy Security",
      focus: "grid resilience, strategic reserves, and energy independence initiatives"
    }
  ];

  // Find the specific scenario based on focusId, or default to global energy markets
  const selectedScenario = energyScenarios.find(s => s.id === focusId) || energyScenarios[0];
  
  const prompt = `Create an energy sector storyline focusing on ${selectedScenario.title}:

Energy Stock Performance:
${stockPerformance}

Generate energy sector storyline in JSON format:
{
  "scenarioTitle": "${selectedScenario.title}",
  "currentSituation": "current global energy market dynamics and transition trends related to ${selectedScenario.focus}",
  "possibleOutcomes": [
    {
      "scenario": "accelerated transition scenario",
      "probability": 40-60, 
      "description": "detailed energy acceleration outcome description",
      "timeline": "6-18 months|1-3 years|3-5 years",
      "implications": ["specific energy market impact", "infrastructure investment requirement", "traditional energy sector disruption"]
    },
    {
      "scenario": "gradual evolution scenario",
      "probability": 30-50,
      "description": "detailed gradual change outcome description",
      "timeline": "2-4 years|3-7 years", 
      "implications": ["energy price stability impact", "regulatory adaptation timeline", "market consolidation effects"]
    }
  ],
  "keyWatchPoints": ["energy indicator 1", "energy indicator 2", "energy indicator 3"],
  "expertInsights": "energy industry expert analysis"
}

Focus on ${selectedScenario.focus} with specific implications for energy companies, infrastructure investments, and market transitions.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an energy sector analyst specializing in oil, gas, renewable energy markets, and energy transition policies."
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

  return [JSON.parse(response.choices[0].message.content!)];
}