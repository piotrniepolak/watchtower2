// Multiple stock data sources with fallback support

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export class StockDataManager {
  private sources: StockDataSource[] = [];

  constructor() {
    // Initialize available sources in priority order - Yahoo Finance first (no API key required)
    this.sources = [
      new YahooFinanceSource(),
      new AlphaVantageSource(),
      new FinnhubSource(),
      new PolygonSource()
    ];
  }

  async fetchStockPrice(symbol: string): Promise<StockData | null> {
    for (const source of this.sources) {
      try {
        const data = await source.fetchPrice(symbol);
        if (data) {
          console.log(`Successfully fetched ${symbol} from ${source.name}`);
          return data;
        }
      } catch (error) {
        console.log(`${source.name} failed for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
        continue;
      }
    }
    
    console.log(`All sources failed for ${symbol}`);
    return null;
  }

  async fetchDefenseIndex(): Promise<{ price: number; change: number; changePercent: number } | null> {
    // Try multiple S&P Aerospace & Defense index symbols
    const indexSymbols = [
      "^SP500-2010", // S&P Aerospace & Defense Index
      "ITA",         // iShares U.S. Aerospace & Defense ETF
      "PPA",         // Invesco Aerospace & Defense ETF
      "XAR"          // SPDR S&P Aerospace & Defense ETF
    ];
    
    for (const indexSymbol of indexSymbols) {
      for (const source of this.sources) {
        try {
          const data = await source.fetchPrice(indexSymbol);
          if (data) {
            console.log(`Successfully fetched Defense Index ${indexSymbol} from ${source.name}`);
            return {
              price: data.price,
              change: data.change,
              changePercent: data.changePercent
            };
          }
        } catch (error) {
          console.log(`${source.name} failed for ${indexSymbol}:`, error instanceof Error ? error.message : 'Unknown error');
          continue;
        }
      }
    }
    
    // Calculate from major defense stocks weighted by market cap
    console.log("Defense Index unavailable, calculating weighted index from major defense stocks");
    const majorSymbols = ["LMT", "RTX", "NOC", "GD", "BA"];
    const stockData = [];
    
    for (const symbol of majorSymbols) {
      const data = await this.fetchStockPrice(symbol);
      if (data) stockData.push(data);
    }
    
    if (stockData.length > 0) {
      // Weight by typical market caps (approximate)
      const weights = { LMT: 0.25, RTX: 0.22, NOC: 0.18, GD: 0.15, BA: 0.20 };
      let weightedPrice = 0;
      let weightedChange = 0;
      let weightedChangePercent = 0;
      let totalWeight = 0;
      
      stockData.forEach(stock => {
        const weight = weights[stock.symbol as keyof typeof weights] || 0.1;
        weightedPrice += stock.price * weight;
        weightedChange += stock.change * weight;
        weightedChangePercent += stock.changePercent * weight;
        totalWeight += weight;
      });
      
      return {
        price: weightedPrice / totalWeight,
        change: weightedChange / totalWeight,
        changePercent: weightedChangePercent / totalWeight
      };
    }
    
    return null;
  }

  async testSources(): Promise<void> {
    console.log("Testing stock data sources...");
    for (const source of this.sources) {
      try {
        const result = await source.fetchPrice("AAPL");
        console.log(`${source.name}: ${result ? "✓ Working" : "✗ No data"}`);
      } catch (error) {
        console.log(`${source.name}: ✗ Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
}

abstract class StockDataSource {
  abstract name: string;
  abstract fetchPrice(symbol: string): Promise<StockData | null>;
}

class AlphaVantageSource extends StockDataSource {
  name = "Alpha Vantage";

  async fetchPrice(symbol: string): Promise<StockData | null> {
    if (!process.env.ALPHA_VANTAGE_API_KEY) {
      throw new Error("Alpha Vantage API key not configured");
    }

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data["Global Quote"]) {
      const quote = data["Global Quote"];
      return {
        symbol,
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"].replace('%', '')),
        volume: parseInt(quote["06. volume"])
      };
    }
    return null;
  }
}

class YahooFinanceSource extends StockDataSource {
  name = "Yahoo Finance";

  async fetchPrice(symbol: string): Promise<StockData | null> {
    try {
      // Using working Yahoo Finance chart API endpoint
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const meta = result.meta;
        
        if (meta) {
          const currentPrice = meta.regularMarketPrice || meta.previousClose;
          const previousClose = meta.previousClose;
          const change = currentPrice - previousClose;
          const changePercent = (change / previousClose) * 100;

          // Get volume from meta data - this contains the most reliable volume information
          let volume = 0;
          
          // Try multiple volume sources from meta data
          if (meta.regularMarketVolume && meta.regularMarketVolume > 0) {
            volume = meta.regularMarketVolume;
          } else if (meta.averageDailyVolume10Day && meta.averageDailyVolume10Day > 0) {
            volume = meta.averageDailyVolume10Day;
          } else if (meta.averageDailyVolume3Month && meta.averageDailyVolume3Month > 0) {
            volume = meta.averageDailyVolume3Month;
          } else {
            // For stocks that don't report current day volume, use average as fallback
            volume = meta.averageDailyVolume10Day || meta.averageDailyVolume3Month || 1000000;
          }

          return {
            symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            volume: volume
          };
        }
      }
    } catch (error) {
      console.error(`Error fetching ${symbol} from Yahoo Finance:`, error);
    }
    return null;
  }
}

class FinnhubSource extends StockDataSource {
  name = "Finnhub";

  async fetchPrice(symbol: string): Promise<StockData | null> {
    // Finnhub offers free tier with 60 calls/minute
    const apiKey = process.env.FINNHUB_API_KEY || "demo"; // Demo key for testing
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.c && data.pc) { // current price and previous close
      const change = data.c - data.pc;
      const changePercent = (change / data.pc) * 100;

      return {
        symbol,
        price: data.c,
        change: change,
        changePercent: changePercent,
        volume: 0 // Volume not available in this endpoint
      };
    }
    return null;
  }
}

class PolygonSource extends StockDataSource {
  name = "Polygon.io";

  async fetchPrice(symbol: string): Promise<StockData | null> {
    if (!process.env.POLYGON_API_KEY) {
      throw new Error("Polygon API key not configured");
    }

    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${process.env.POLYGON_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results?.[0]) {
      const result = data.results[0];
      const change = result.c - result.o; // close - open
      const changePercent = (change / result.o) * 100;

      return {
        symbol,
        price: result.c,
        change: change,
        changePercent: changePercent,
        volume: result.v
      };
    }
    return null;
  }
}

export const stockDataManager = new StockDataManager();