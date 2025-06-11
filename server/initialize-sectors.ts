import { storage } from "./storage";

export async function initializeAllSectorStocks() {
  // Defense stocks
  const defenseStocks = [
    { symbol: "LMT", name: "Lockheed Martin Corporation", sector: "Defense" },
    { symbol: "RTX", name: "RTX Corporation", sector: "Defense" },
    { symbol: "NOC", name: "Northrop Grumman Corporation", sector: "Defense" },
    { symbol: "GD", name: "General Dynamics Corporation", sector: "Defense" },
    { symbol: "BA", name: "Boeing Company", sector: "Defense" },
    { symbol: "LDOS", name: "Leidos Holdings Inc", sector: "Defense" },
    { symbol: "LHX", name: "L3Harris Technologies Inc", sector: "Defense" },
    { symbol: "HWM", name: "Howmet Aerospace Inc", sector: "Defense" },
    { symbol: "KTOS", name: "Kratos Defense & Security Solutions", sector: "Defense" },
    { symbol: "AVAV", name: "AeroVironment Inc", sector: "Defense" }
  ];

  // Healthcare stocks  
  const healthcareStocks = [
    { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
    { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
    { symbol: "MRNA", name: "Moderna Inc.", sector: "Healthcare" },
    { symbol: "NVAX", name: "Novavax Inc.", sector: "Healthcare" },
    { symbol: "GILD", name: "Gilead Sciences Inc.", sector: "Healthcare" },
    { symbol: "REGN", name: "Regeneron Pharmaceuticals Inc.", sector: "Healthcare" },
    { symbol: "AMGN", name: "Amgen Inc.", sector: "Healthcare" },
    { symbol: "BIIB", name: "Biogen Inc.", sector: "Healthcare" },
    { symbol: "VRTX", name: "Vertex Pharmaceuticals Inc.", sector: "Healthcare" },
    { symbol: "BMY", name: "Bristol-Myers Squibb Company", sector: "Healthcare" }
  ];

  // Energy stocks
  const energyStocks = [
    { symbol: "XOM", name: "Exxon Mobil Corporation", sector: "Energy" },
    { symbol: "CVX", name: "Chevron Corporation", sector: "Energy" },
    { symbol: "COP", name: "ConocoPhillips", sector: "Energy" },
    { symbol: "EOG", name: "EOG Resources Inc.", sector: "Energy" },
    { symbol: "SLB", name: "SLB", sector: "Energy" },
    { symbol: "HAL", name: "Halliburton Company", sector: "Energy" },
    { symbol: "BKR", name: "Baker Hughes Company", sector: "Energy" },
    { symbol: "MPC", name: "Marathon Petroleum Corporation", sector: "Energy" },
    { symbol: "VLO", name: "Valero Energy Corporation", sector: "Energy" },
    { symbol: "PSX", name: "Phillips 66", sector: "Energy" },
    { symbol: "KMI", name: "Kinder Morgan Inc.", sector: "Energy" },
    { symbol: "OKE", name: "ONEOK Inc.", sector: "Energy" },
    { symbol: "NEE", name: "NextEra Energy Inc.", sector: "Energy" },
    { symbol: "SO", name: "Southern Company", sector: "Energy" }
  ];

  // Initialize all stocks with proper sectors
  const allStocks = [...defenseStocks, ...healthcareStocks, ...energyStocks];
  
  for (let i = 0; i < allStocks.length; i++) {
    const stock = allStocks[i];
    await storage.createStock({
      symbol: stock.symbol,
      name: stock.name,
      price: 100 + Math.random() * 400, // Random starting prices
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 10000000) + 500000,
      marketCap: `$${(Math.random() * 500 + 10).toFixed(1)}B`,
      sector: stock.sector
    });
  }

  console.log(`Initialized ${allStocks.length} stocks across all sectors`);
  return allStocks;
}