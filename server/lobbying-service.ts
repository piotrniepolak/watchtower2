import { db } from "./db";
import { stocks, lobbyingExpenditures, stockPriceHistory } from "@shared/schema";
import type { InsertLobbyingExpenditure, InsertStockPriceHistory, ROIAnalysis } from "@shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export class LobbyingService {
  private isInitialized = false;

  constructor() {
    this.initializeLobbyingData();
  }

  private async initializeLobbyingData() {
    if (this.isInitialized) return;

    try {
      // Check if we already have lobbying data
      const existingData = await db.select().from(lobbyingExpenditures).limit(1);
      if (existingData.length > 0) {
        this.isInitialized = true;
        return;
      }

      // Insert realistic lobbying expenditure data based on actual defense industry spending
      const lobbyingData: InsertLobbyingExpenditure[] = [
        // Lockheed Martin - historically high lobbying spender
        { stockSymbol: "LMT", year: 2024, quarter: 1, amount: 3.8, reportedDate: new Date("2024-04-15") },
        { stockSymbol: "LMT", year: 2024, quarter: 2, amount: 4.2, reportedDate: new Date("2024-07-15") },
        { stockSymbol: "LMT", year: 2024, quarter: 3, amount: 3.9, reportedDate: new Date("2024-10-15") },
        { stockSymbol: "LMT", year: 2024, quarter: 4, amount: 4.5, reportedDate: new Date("2025-01-15") },
        
        // Raytheon Technologies
        { stockSymbol: "RTX", year: 2024, quarter: 1, amount: 2.8, reportedDate: new Date("2024-04-15") },
        { stockSymbol: "RTX", year: 2024, quarter: 2, amount: 3.1, reportedDate: new Date("2024-07-15") },
        { stockSymbol: "RTX", year: 2024, quarter: 3, amount: 2.9, reportedDate: new Date("2024-10-15") },
        { stockSymbol: "RTX", year: 2024, quarter: 4, amount: 3.3, reportedDate: new Date("2025-01-15") },
        
        // Northrop Grumman
        { stockSymbol: "NOC", year: 2024, quarter: 1, amount: 2.1, reportedDate: new Date("2024-04-15") },
        { stockSymbol: "NOC", year: 2024, quarter: 2, amount: 2.4, reportedDate: new Date("2024-07-15") },
        { stockSymbol: "NOC", year: 2024, quarter: 3, amount: 2.2, reportedDate: new Date("2024-10-15") },
        { stockSymbol: "NOC", year: 2024, quarter: 4, amount: 2.6, reportedDate: new Date("2025-01-15") },
        
        // General Dynamics
        { stockSymbol: "GD", year: 2024, quarter: 1, amount: 1.8, reportedDate: new Date("2024-04-15") },
        { stockSymbol: "GD", year: 2024, quarter: 2, amount: 2.0, reportedDate: new Date("2024-07-15") },
        { stockSymbol: "GD", year: 2024, quarter: 3, amount: 1.9, reportedDate: new Date("2024-10-15") },
        { stockSymbol: "GD", year: 2024, quarter: 4, amount: 2.1, reportedDate: new Date("2025-01-15") },
        
        // Boeing
        { stockSymbol: "BA", year: 2024, quarter: 1, amount: 4.1, reportedDate: new Date("2024-04-15") },
        { stockSymbol: "BA", year: 2024, quarter: 2, amount: 3.8, reportedDate: new Date("2024-07-15") },
        { stockSymbol: "BA", year: 2024, quarter: 3, amount: 4.3, reportedDate: new Date("2024-10-15") },
        { stockSymbol: "BA", year: 2024, quarter: 4, amount: 4.0, reportedDate: new Date("2025-01-15") },
        
        // L3Harris Technologies
        { stockSymbol: "LHX", year: 2024, quarter: 1, amount: 1.2, reportedDate: new Date("2024-04-15") },
        { stockSymbol: "LHX", year: 2024, quarter: 2, amount: 1.4, reportedDate: new Date("2024-07-15") },
        { stockSymbol: "LHX", year: 2024, quarter: 3, amount: 1.3, reportedDate: new Date("2024-10-15") },
        { stockSymbol: "LHX", year: 2024, quarter: 4, amount: 1.5, reportedDate: new Date("2025-01-15") },
        
        // Huntington Ingalls
        { stockSymbol: "HII", year: 2024, quarter: 1, amount: 0.8, reportedDate: new Date("2024-04-15") },
        { stockSymbol: "HII", year: 2024, quarter: 2, amount: 0.9, reportedDate: new Date("2024-07-15") },
        { stockSymbol: "HII", year: 2024, quarter: 3, amount: 0.8, reportedDate: new Date("2024-10-15") },
        { stockSymbol: "HII", year: 2024, quarter: 4, amount: 1.0, reportedDate: new Date("2025-01-15") },
        
        // Smaller companies with lower lobbying spend
        { stockSymbol: "LDOS", year: 2024, quarter: 1, amount: 0.6, reportedDate: new Date("2024-04-15") },
        { stockSymbol: "LDOS", year: 2024, quarter: 2, amount: 0.7, reportedDate: new Date("2024-07-15") },
        { stockSymbol: "LDOS", year: 2024, quarter: 3, amount: 0.6, reportedDate: new Date("2024-10-15") },
        { stockSymbol: "LDOS", year: 2024, quarter: 4, amount: 0.8, reportedDate: new Date("2025-01-15") },
        
        { stockSymbol: "KTOS", year: 2024, quarter: 1, amount: 0.3, reportedDate: new Date("2024-04-15") },
        { stockSymbol: "KTOS", year: 2024, quarter: 2, amount: 0.4, reportedDate: new Date("2024-07-15") },
        { stockSymbol: "KTOS", year: 2024, quarter: 3, amount: 0.3, reportedDate: new Date("2024-10-15") },
        { stockSymbol: "KTOS", year: 2024, quarter: 4, amount: 0.5, reportedDate: new Date("2025-01-15") },
        
        { stockSymbol: "AVAV", year: 2024, quarter: 1, amount: 0.2, reportedDate: new Date("2024-04-15") },
        { stockSymbol: "AVAV", year: 2024, quarter: 2, amount: 0.3, reportedDate: new Date("2024-07-15") },
        { stockSymbol: "AVAV", year: 2024, quarter: 3, amount: 0.2, reportedDate: new Date("2024-10-15") },
        { stockSymbol: "AVAV", year: 2024, quarter: 4, amount: 0.3, reportedDate: new Date("2025-01-15") },
      ];

      await db.insert(lobbyingExpenditures).values(lobbyingData);
      
      // Add historical price data for ROI calculations
      await this.initializeHistoricalPrices();
      
      console.log("Lobbying expenditure data initialized successfully");
      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing lobbying data:", error);
    }
  }

  private async initializeHistoricalPrices() {
    // Add sample historical prices for calculating gains
    // These would normally come from a financial data API
    const historicalData: InsertStockPriceHistory[] = [
      // LMT - showing growth from $450 to current $481.69
      { stockSymbol: "LMT", date: "2024-01-01", openPrice: 450.0, closePrice: 452.3, highPrice: 455.0, lowPrice: 448.2, volume: 1200000 },
      { stockSymbol: "LMT", date: "2024-06-01", openPrice: 465.8, closePrice: 468.1, highPrice: 472.0, lowPrice: 463.5, volume: 1150000 },
      
      // RTX - showing moderate growth
      { stockSymbol: "RTX", date: "2024-01-01", openPrice: 135.2, closePrice: 136.8, highPrice: 138.0, lowPrice: 134.5, volume: 2800000 },
      { stockSymbol: "RTX", date: "2024-06-01", openPrice: 137.5, closePrice: 138.2, highPrice: 140.1, lowPrice: 136.8, volume: 2650000 },
      
      // NOC - strong performance
      { stockSymbol: "NOC", date: "2024-01-01", openPrice: 470.0, closePrice: 472.5, highPrice: 475.0, lowPrice: 468.8, volume: 800000 },
      { stockSymbol: "NOC", date: "2024-06-01", openPrice: 482.1, closePrice: 485.3, highPrice: 488.0, lowPrice: 480.5, volume: 750000 },
      
      // GD - steady growth
      { stockSymbol: "GD", date: "2024-01-01", openPrice: 265.0, closePrice: 267.2, highPrice: 269.5, lowPrice: 263.8, volume: 1000000 },
      { stockSymbol: "GD", date: "2024-06-01", openPrice: 271.8, closePrice: 274.1, highPrice: 276.0, lowPrice: 270.5, volume: 950000 },
      
      // BA - recovery story
      { stockSymbol: "BA", date: "2024-01-01", openPrice: 195.0, closePrice: 197.8, highPrice: 200.2, lowPrice: 193.5, volume: 3200000 },
      { stockSymbol: "BA", date: "2024-06-01", openPrice: 205.5, closePrice: 208.9, highPrice: 212.0, lowPrice: 203.8, volume: 3100000 },
      
      // Smaller companies with higher volatility
      { stockSymbol: "KTOS", date: "2024-01-01", openPrice: 38.5, closePrice: 39.2, highPrice: 40.0, lowPrice: 37.8, volume: 2100000 },
      { stockSymbol: "KTOS", date: "2024-06-01", openPrice: 39.8, closePrice: 40.1, highPrice: 41.2, lowPrice: 39.2, volume: 2000000 },
      
      { stockSymbol: "AVAV", date: "2024-01-01", openPrice: 175.0, closePrice: 178.2, highPrice: 180.5, lowPrice: 173.8, volume: 800000 },
      { stockSymbol: "AVAV", date: "2024-06-01", openPrice: 185.5, closePrice: 188.9, highPrice: 192.0, lowPrice: 184.2, volume: 750000 },
    ];

    await db.insert(stockPriceHistory).values(historicalData);
  }

  async calculateROIRankings(timeframe: string = "1Y"): Promise<ROIAnalysis[]> {
    try {
      // Get current stock prices and lobbying expenditures
      const query = sql`
        SELECT 
          s.symbol,
          s.name,
          s.price as current_price,
          s.change_percent,
          COALESCE(
            (SELECT SUM(amount) 
             FROM lobbying_expenditures le 
             WHERE le.stock_symbol = s.symbol 
             AND le.year = 2024), 
            0
          ) as total_lobbying_2024,
          COALESCE(
            (SELECT close_price 
             FROM stock_price_history sph 
             WHERE sph.stock_symbol = s.symbol 
             ORDER BY date ASC 
             LIMIT 1), 
            s.price * 0.9
          ) as historical_price
        FROM stocks s
        ORDER BY s.symbol
      `;

      const results = await db.execute(query);
      
      const roiAnalysis: ROIAnalysis[] = results.rows.map((row: any, index: number) => {
        const currentPrice = Number(row.current_price);
        const historicalPrice = Number(row.historical_price);
        const priceGainPercent = ((currentPrice - historicalPrice) / historicalPrice) * 100;
        const lobbyingSpent = Number(row.total_lobbying_2024);
        
        // Calculate ROI ratio: price gain % per million dollars spent on lobbying
        // Higher is better - more stock gain per lobbying dollar
        const roiRatio = lobbyingSpent > 0 ? priceGainPercent / lobbyingSpent : priceGainPercent * 10;

        return {
          stockSymbol: row.symbol,
          companyName: row.name,
          timeframe,
          priceGainPercent: Number(priceGainPercent.toFixed(2)),
          lobbyingSpent: Number(lobbyingSpent.toFixed(1)),
          roiRatio: Number(roiRatio.toFixed(2)),
          rank: index + 1 // Will be updated after sorting
        };
      });

      // Sort by ROI ratio (descending - higher is better)
      roiAnalysis.sort((a, b) => b.roiRatio - a.roiRatio);
      
      // Update ranks
      roiAnalysis.forEach((item, index) => {
        item.rank = index + 1;
      });

      return roiAnalysis;
    } catch (error) {
      console.error("Error calculating ROI rankings:", error);
      return [];
    }
  }

  async getLobbyingExpenditures(stockSymbol?: string, year?: number): Promise<any[]> {
    try {
      let query = db.select().from(lobbyingExpenditures);
      
      if (stockSymbol && year) {
        query = query.where(and(
          eq(lobbyingExpenditures.stockSymbol, stockSymbol),
          eq(lobbyingExpenditures.year, year)
        )) as any;
      } else if (stockSymbol) {
        query = query.where(eq(lobbyingExpenditures.stockSymbol, stockSymbol)) as any;
      } else if (year) {
        query = query.where(eq(lobbyingExpenditures.year, year)) as any;
      }

      return await query;
    } catch (error) {
      console.error("Error fetching lobbying expenditures:", error);
      return [];
    }
  }
}

export const lobbyingService = new LobbyingService();