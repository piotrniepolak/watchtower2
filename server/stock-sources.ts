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
    // Initialize available sources in priority order
    this.sources = [
      new AlphaVantageSource(),
      new YahooFinanceSource(),
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
      // Use Yahoo Finance quote endpoint for complete data including volume
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.quoteResponse?.result?.[0]) {
        const quote = data.quoteResponse.result[0];
        
        const currentPrice = quote.regularMarketPrice || quote.previousClose;
        const previousClose = quote.previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        // Get volume from quote response - this endpoint provides reliable volume data
        let volume = 0;
        
        if (quote.regularMarketVolume && quote.regularMarketVolume > 0) {
          volume = quote.regularMarketVolume;
        } else if (quote.averageDailyVolume10Day && quote.averageDailyVolume10Day > 0) {
          volume = quote.averageDailyVolume10Day;
        } else if (quote.averageDailyVolume3Month && quote.averageDailyVolume3Month > 0) {
          volume = quote.averageDailyVolume3Month;
        }

        return {
          symbol,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: volume
        };
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