import { storage } from "./storage";

interface AlphaVantageQuote {
  "01. symbol": string;
  "02. open": string;
  "03. high": string;
  "04. low": string;
  "05. price": string;
  "06. volume": string;
  "07. latest trading day": string;
  "08. previous close": string;
  "09. change": string;
  "10. change percent": string;
}

interface AlphaVantageResponse {
  "Global Quote": AlphaVantageQuote;
}

class StockService {
  private apiKey: string;
  private baseUrl = "https://www.alphavantage.co/query";
  private updateInterval: NodeJS.Timeout | null = null;
  private isUpdating = false;

  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY!;
    if (!this.apiKey) {
      console.error("ALPHA_VANTAGE_API_KEY is required for real-time stock updates");
    }
  }

  async fetchStockPrice(symbol: string): Promise<{
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  } | null> {
    if (!this.apiKey) {
      console.error("Alpha Vantage API key not configured");
      return null;
    }

    try {
      const cleanSymbol = symbol.replace(/\.(L|DE)$/, ''); // Remove exchange suffixes for API call
      const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${cleanSymbol}&apikey=${this.apiKey}`;
      
      const response = await fetch(url);
      const data: AlphaVantageResponse = await response.json();

      if (!data["Global Quote"] || !data["Global Quote"]["05. price"]) {
        console.error(`No data received for ${symbol}:`, data);
        return null;
      }

      const quote = data["Global Quote"];
      const price = parseFloat(quote["05. price"]);
      const change = parseFloat(quote["09. change"]);
      const changePercent = parseFloat(quote["10. change percent"].replace('%', ''));
      const volume = parseInt(quote["06. volume"]);

      return {
        price,
        change,
        changePercent,
        volume
      };
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      return null;
    }
  }

  async updateAllStockPrices(): Promise<void> {
    if (this.isUpdating) {
      console.log("Stock update already in progress, skipping...");
      return;
    }

    this.isUpdating = true;
    console.log("Starting stock price updates...");

    try {
      const stocks = await storage.getStocks();
      const prioritySymbols = ["LMT", "RTX", "NOC", "GD", "BA"]; // Update major stocks first
      
      // Update priority stocks first
      for (const symbol of prioritySymbols) {
        const stock = stocks.find(s => s.symbol === symbol);
        if (stock) {
          await this.updateSingleStock(stock.symbol);
          // Add delay to respect API rate limits (Alpha Vantage free tier: 5 calls per minute)
          await new Promise(resolve => setTimeout(resolve, 12000)); // 12 seconds between calls
        }
      }

      // Update remaining stocks
      const remainingStocks = stocks.filter(s => !prioritySymbols.includes(s.symbol));
      for (const stock of remainingStocks.slice(0, 3)) { // Limit to avoid hitting rate limits
        await this.updateSingleStock(stock.symbol);
        await new Promise(resolve => setTimeout(resolve, 12000));
      }

    } catch (error) {
      console.error("Error updating stock prices:", error);
    } finally {
      this.isUpdating = false;
      console.log("Stock price update cycle completed");
    }
  }

  private async updateSingleStock(symbol: string): Promise<void> {
    const priceData = await this.fetchStockPrice(symbol);
    if (priceData) {
      await storage.updateStock(symbol, {
        price: priceData.price,
        change: priceData.change,
        changePercent: priceData.changePercent,
        volume: priceData.volume,
      });
      console.log(`Updated ${symbol}: $${priceData.price} (${priceData.changePercent > 0 ? '+' : ''}${priceData.changePercent.toFixed(2)}%)`);
    }
  }

  startRealTimeUpdates(): void {
    if (!this.apiKey) {
      console.error("Cannot start real-time updates: Alpha Vantage API key not configured");
      return;
    }

    console.log("Starting real-time stock price updates...");
    
    // Initial update
    this.updateAllStockPrices();

    // Update every 5 minutes (to respect free tier rate limits)
    this.updateInterval = setInterval(() => {
      this.updateAllStockPrices();
    }, 5 * 60 * 1000);
  }

  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log("Stopped real-time stock price updates");
    }
  }
}

export const stockService = new StockService();