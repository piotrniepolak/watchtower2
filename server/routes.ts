import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStockSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Conflicts routes
  app.get("/api/conflicts", async (req, res) => {
    try {
      const conflicts = await storage.getConflicts();
      res.json(conflicts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conflicts" });
    }
  });

  app.get("/api/conflicts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conflict = await storage.getConflict(id);
      if (!conflict) {
        return res.status(404).json({ error: "Conflict not found" });
      }
      res.json(conflict);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conflict" });
    }
  });

  // Stocks routes
  app.get("/api/stocks", async (req, res) => {
    try {
      const stocks = await storage.getStocks();
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stocks" });
    }
  });

  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const stock = await storage.getStock(symbol);
      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }
      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock" });
    }
  });

  // Refresh stock data from Alpha Vantage
  app.post("/api/stocks/refresh", async (req, res) => {
    try {
      const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || process.env.VITE_ALPHA_VANTAGE_API_KEY || "demo";
      
      const defenseStocks = [
        { symbol: "LMT", name: "Lockheed Martin Corporation" },
        { symbol: "RTX", name: "Raytheon Technologies Corporation" },
        { symbol: "NOC", name: "Northrop Grumman Corporation" },
        { symbol: "GD", name: "General Dynamics Corporation" },
        { symbol: "BA", name: "The Boeing Company" },
      ];

      const updatedStocks = [];
      
      for (const stockInfo of defenseStocks) {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockInfo.symbol}&apikey=${API_KEY}`
          );
          
          if (!response.ok) {
            console.error(`Failed to fetch data for ${stockInfo.symbol}`);
            continue;
          }
          
          const data = await response.json();
          const quote = data["Global Quote"];
          
          if (!quote || !quote["05. price"]) {
            console.error(`Invalid data format for ${stockInfo.symbol}`);
            continue;
          }
          
          const price = parseFloat(quote["05. price"]);
          const change = parseFloat(quote["09. change"]);
          const changePercent = parseFloat(quote["10. change percent"].replace("%", ""));
          const volume = parseInt(quote["06. volume"]);
          
          const stockData = {
            symbol: stockInfo.symbol,
            name: stockInfo.name,
            price,
            change,
            changePercent,
            volume,
            marketCap: "N/A", // Would need separate API call for market cap
          };
          
          const existingStock = await storage.getStock(stockInfo.symbol);
          if (existingStock) {
            await storage.updateStock(stockInfo.symbol, stockData);
          } else {
            await storage.createStock(stockData);
          }
          
          updatedStocks.push(stockData);
          
          // Add delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error processing ${stockInfo.symbol}:`, error);
        }
      }
      
      res.json({ 
        message: `Updated ${updatedStocks.length} stocks`,
        stocks: updatedStocks 
      });
    } catch (error) {
      console.error("Error refreshing stock data:", error);
      res.status(500).json({ error: "Failed to refresh stock data" });
    }
  });

  // Correlation events
  app.get("/api/correlation-events", async (req, res) => {
    try {
      const events = await storage.getCorrelationEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch correlation events" });
    }
  });

  // Market metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const conflicts = await storage.getConflicts();
      const stocks = await storage.getStocks();
      
      const activeConflicts = conflicts.filter(c => c.status === "Active").length;
      const totalConflicts = conflicts.length;
      
      // Calculate defense index (average of defense stocks)
      const defenseIndex = stocks.length > 0 
        ? stocks.reduce((sum, stock) => sum + stock.price, 0) / stocks.length
        : 0;
      
      // Calculate total market cap (simplified)
      const totalMarketCap = stocks.reduce((sum, stock) => {
        // Simplified calculation - in real app would use actual market cap
        return sum + (stock.price * stock.volume);
      }, 0);
      
      // Simplified correlation score
      const correlationScore = 0.73;
      
      res.json({
        activeConflicts,
        totalConflicts,
        defenseIndex: defenseIndex.toFixed(2),
        marketCap: `$${(totalMarketCap / 1000000000).toFixed(1)}B`,
        correlationScore,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
