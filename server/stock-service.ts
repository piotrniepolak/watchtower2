import { storage } from "./storage";
import { stockDataManager } from "./stock-sources";

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
    return await stockDataManager.fetchStockPrice(symbol);
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
      
      let successfulUpdates = 0;
      let rateLimitHit = false;

      // Update priority stocks first
      for (const symbol of prioritySymbols) {
        const stock = stocks.find(s => s.symbol === symbol);
        if (stock && !rateLimitHit) {
          const result = await this.updateSingleStock(stock.symbol);
          if (result === 'rate_limit') {
            rateLimitHit = true;
            console.log("Alpha Vantage API rate limit reached. Using cached prices until reset.");
            break;
          } else if (result === 'success') {
            successfulUpdates++;
          }
          // Add delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 12000));
        }
      }

      // Update remaining stocks if not rate limited
      if (!rateLimitHit) {
        const remainingStocks = stocks.filter(s => !prioritySymbols.includes(s.symbol));
        for (const stock of remainingStocks.slice(0, 3)) {
          const result = await this.updateSingleStock(stock.symbol);
          if (result === 'rate_limit') {
            rateLimitHit = true;
            break;
          } else if (result === 'success') {
            successfulUpdates++;
          }
          await new Promise(resolve => setTimeout(resolve, 12000));
        }
      }

      console.log(`Updated ${successfulUpdates} stocks successfully${rateLimitHit ? ' (rate limit reached)' : ''}`);

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