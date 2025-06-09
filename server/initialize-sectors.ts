import { storage } from "./storage";

export async function initializeAllSectorStocks() {
  // Defense stocks
  const defenseStocks = [
    { symbol: "LMT", name: "Lockheed Martin Corporation", sector: "defense" },
    { symbol: "RTX", name: "RTX Corporation", sector: "defense" },
    { symbol: "NOC", name: "Northrop Grumman Corporation", sector: "defense" },
    { symbol: "GD", name: "General Dynamics Corporation", sector: "defense" },
    { symbol: "BA", name: "Boeing Company", sector: "defense" },
    { symbol: "LDOS", name: "Leidos Holdings Inc", sector: "defense" },
    { symbol: "LHX", name: "L3Harris Technologies Inc", sector: "defense" },
    { symbol: "HWM", name: "Howmet Aerospace Inc", sector: "defense" },
    { symbol: "KTOS", name: "Kratos Defense & Security Solutions", sector: "defense" },
    { symbol: "AVAV", name: "AeroVironment Inc", sector: "defense" }
  ];

  // Healthcare stocks  
  const healthcareStocks = [
    { symbol: "PFE", name: "Pfizer Inc.", sector: "healthcare" },
    { symbol: "JNJ", name: "Johnson & Johnson", sector: "healthcare" },
    { symbol: "MRNA", name: "Moderna Inc.", sector: "healthcare" },
    { symbol: "NVAX", name: "Novavax Inc.", sector: "healthcare" },
    { symbol: "GILD", name: "Gilead Sciences Inc.", sector: "healthcare" },
    { symbol: "REGN", name: "Regeneron Pharmaceuticals Inc.", sector: "healthcare" },
    { symbol: "AMGN", name: "Amgen Inc.", sector: "healthcare" },
    { symbol: "BIIB", name: "Biogen Inc.", sector: "healthcare" },
    { symbol: "VRTX", name: "Vertex Pharmaceuticals Inc.", sector: "healthcare" },
    { symbol: "BMY", name: "Bristol-Myers Squibb Company", sector: "healthcare" }
  ];

  // Energy stocks
  const energyStocks = [
    { symbol: "XOM", name: "Exxon Mobil Corporation", sector: "energy" },
    { symbol: "CVX", name: "Chevron Corporation", sector: "energy" },
    { symbol: "COP", name: "ConocoPhillips", sector: "energy" },
    { symbol: "EOG", name: "EOG Resources Inc.", sector: "energy" },
    { symbol: "SLB", name: "SLB", sector: "energy" },
    { symbol: "HAL", name: "Halliburton Company", sector: "energy" },
    { symbol: "BKR", name: "Baker Hughes Company", sector: "energy" },
    { symbol: "MPC", name: "Marathon Petroleum Corporation", sector: "energy" },
    { symbol: "VLO", name: "Valero Energy Corporation", sector: "energy" },
    { symbol: "PSX", name: "Phillips 66", sector: "energy" },
    { symbol: "KMI", name: "Kinder Morgan Inc.", sector: "energy" },
    { symbol: "OKE", name: "ONEOK Inc.", sector: "energy" },
    { symbol: "NEE", name: "NextEra Energy Inc.", sector: "energy" },
    { symbol: "SO", name: "Southern Company", sector: "energy" }
  ];

  // Initialize all stocks with proper sectors
  const allStocks = [...defenseStocks, ...healthcareStocks, ...energyStocks];
  
  for (let i = 0; i < allStocks.length; i++) {
    const stock = allStocks[i];
    await storage.createStock({
      id: i + 1,
      symbol: stock.symbol,
      name: stock.name,
      price: 100 + Math.random() * 400, // Random starting prices
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 10000000) + 500000,
      marketCap: `$${(Math.random() * 500 + 10).toFixed(1)}B`,
      sector: stock.sector,
      lastUpdated: new Date()
    });
  }

  console.log(`Initialized ${allStocks.length} stocks across all sectors`);
  return allStocks;
}