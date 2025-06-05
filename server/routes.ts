import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, DatabaseStorage } from "./storage";
import { insertUserSchema, insertStockWatchlistSchema, insertConflictWatchlistSchema } from "@shared/schema";
import { generateConflictPredictions, generateMarketAnalysis, generateConflictStoryline } from "./ai-analysis";
import { stockService } from "./stock-service";
import { quizService } from "./quiz-service";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const dbStorage = new DatabaseStorage();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await dbStorage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await dbStorage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await dbStorage.createUser(userData);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        token 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await dbStorage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await dbStorage.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        token 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    res.json({ 
      user: { 
        id: req.user.id, 
        email: req.user.email, 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
      }
    });
  });

  // Watchlist routes
  app.get('/api/watchlist/stocks', authenticateToken, async (req: any, res) => {
    try {
      const watchlist = await dbStorage.getUserStockWatchlist(req.user.id);
      res.json(watchlist);
    } catch (error) {
      console.error('Error fetching stock watchlist:', error);
      res.status(500).json({ message: 'Failed to fetch watchlist' });
    }
  });

  app.post('/api/watchlist/stocks', authenticateToken, async (req: any, res) => {
    try {
      const watchlistData = insertStockWatchlistSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const watchlist = await dbStorage.addStockToWatchlist(watchlistData);
      res.json(watchlist);
    } catch (error) {
      console.error('Error adding to stock watchlist:', error);
      res.status(400).json({ message: 'Failed to add to watchlist' });
    }
  });

  app.delete('/api/watchlist/stocks/:symbol', authenticateToken, async (req: any, res) => {
    try {
      await dbStorage.removeStockFromWatchlist(req.user.id, req.params.symbol);
      res.json({ message: 'Removed from watchlist' });
    } catch (error) {
      console.error('Error removing from stock watchlist:', error);
      res.status(500).json({ message: 'Failed to remove from watchlist' });
    }
  });

  app.get('/api/watchlist/conflicts', authenticateToken, async (req: any, res) => {
    try {
      const watchlist = await dbStorage.getUserConflictWatchlist(req.user.id);
      res.json(watchlist);
    } catch (error) {
      console.error('Error fetching conflict watchlist:', error);
      res.status(500).json({ message: 'Failed to fetch watchlist' });
    }
  });

  app.post('/api/watchlist/conflicts', authenticateToken, async (req: any, res) => {
    try {
      const watchlistData = insertConflictWatchlistSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const watchlist = await dbStorage.addConflictToWatchlist(watchlistData);
      res.json(watchlist);
    } catch (error) {
      console.error('Error adding to conflict watchlist:', error);
      res.status(400).json({ message: 'Failed to add to watchlist' });
    }
  });

  app.delete('/api/watchlist/conflicts/:id', authenticateToken, async (req: any, res) => {
    try {
      await dbStorage.removeConflictFromWatchlist(req.user.id, parseInt(req.params.id));
      res.json({ message: 'Removed from watchlist' });
    } catch (error) {
      console.error('Error removing from conflict watchlist:', error);
      res.status(500).json({ message: 'Failed to remove from watchlist' });
    }
  });

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
      const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || process.env.VITE_ALPHA_VANTAGE_API_KEY;
      
      if (!API_KEY || API_KEY === "demo") {
        return res.status(400).json({ 
          error: "Alpha Vantage API key required for real-time data",
          message: "Please provide a valid ALPHA_VANTAGE_API_KEY" 
        });
      }
      
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
            console.error(`Failed to fetch data for ${stockInfo.symbol}: ${response.status}`);
            continue;
          }
          
          const data = await response.json();
          console.log(`API Response for ${stockInfo.symbol}:`, JSON.stringify(data, null, 2));
          
          const quote = data["Global Quote"];
          
          if (!quote || !quote["05. price"]) {
            console.error(`Invalid data format for ${stockInfo.symbol}`, data);
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
            marketCap: `$${(price * volume / 1000000).toFixed(1)}M`, // Estimated market cap
          };
          
          const existingStock = await storage.getStock(stockInfo.symbol);
          if (existingStock) {
            await storage.updateStock(stockInfo.symbol, stockData);
          } else {
            await storage.createStock(stockData);
          }
          
          updatedStocks.push(stockData);
          
          // Add delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error processing ${stockInfo.symbol}:`, error);
        }
      }
      
      if (updatedStocks.length === 0) {
        return res.status(503).json({
          error: "Unable to fetch stock data from Alpha Vantage",
          message: "API may be rate limited or temporarily unavailable"
        });
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
      
      // Calculate total market cap from actual market cap values
      const totalMarketCap = stocks.reduce((sum, stock) => {
        if (!stock.marketCap) return sum;
        
        // Parse market cap string (e.g., "$120.5B", "€20.8B", "£41.2B")
        const cleanValue = stock.marketCap.replace(/[^\d.]/g, '');
        const numericValue = parseFloat(cleanValue);
        
        if (stock.marketCap.includes('B')) {
          return sum + numericValue;
        } else if (stock.marketCap.includes('M')) {
          return sum + (numericValue / 1000);
        }
        return sum;
      }, 0);
      
      // Simplified correlation score
      const correlationScore = 0.73;
      
      res.json({
        activeConflicts,
        totalConflicts,
        defenseIndex: defenseIndex.toFixed(2),
        marketCap: `$${totalMarketCap.toFixed(1)}B`,
        correlationScore,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // AI-powered conflict prediction routes
  app.get("/api/ai/predictions", async (req, res) => {
    try {
      const conflicts = await storage.getConflicts();
      const stocks = await storage.getStocks();
      
      const predictions = await generateConflictPredictions(conflicts, stocks);
      res.json(predictions);
    } catch (error) {
      console.error("Error generating conflict predictions:", error);
      res.status(500).json({ error: "Failed to generate predictions" });
    }
  });

  app.get("/api/ai/market-analysis", async (req, res) => {
    try {
      const conflicts = await storage.getConflicts();
      const stocks = await storage.getStocks();
      const predictions = await generateConflictPredictions(conflicts, stocks);
      
      const marketAnalysis = await generateMarketAnalysis(conflicts, stocks, predictions);
      res.json(marketAnalysis);
    } catch (error) {
      console.error("Error generating market analysis:", error);
      res.status(500).json({ error: "Failed to generate market analysis" });
    }
  });

  app.get("/api/ai/storyline/:conflictId", async (req, res) => {
    try {
      const conflictId = parseInt(req.params.conflictId);
      const conflict = await storage.getConflict(conflictId);
      
      if (!conflict) {
        return res.status(404).json({ error: "Conflict not found" });
      }
      
      const storyline = await generateConflictStoryline(conflict);
      res.json(storyline);
    } catch (error) {
      console.error("Error generating conflict storyline:", error);
      res.status(500).json({ error: "Failed to generate storyline" });
    }
  });

  // In-memory notification storage for state persistence
  let notificationStore = [
        {
          id: 1,
          type: "conflict_update",
          title: "Ukraine-Russia Conflict Update",
          message: "Significant developments in drone warfare tactics reported in eastern regions",
          data: { conflictId: 1, updateType: "new_development" },
          read: false,
          priority: "high",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: null
        },
        {
          id: 2,
          type: "market_alert",
          title: "Defense Stock Alert",
          message: "Lockheed Martin (LMT) up 3.2% following contract announcement",
          data: { stockSymbol: "LMT", alertType: "price_change", currentValue: 452.30, change: 14.05 },
          read: false,
          priority: "normal",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          expiresAt: null
        },
        {
          id: 3,
          type: "ai_analysis",
          title: "AI Prediction Complete",
          message: "New conflict analysis generated for Sudan Civil War with 73% confidence",
          data: { analysisType: "prediction", conflictId: 3, confidence: 0.73 },
          read: true,
          priority: "normal",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          expiresAt: null
        },
        {
          id: 4,
          type: "conflict_update",
          title: "Taiwan Strait Tensions",
          message: "Increased military exercises reported in the region, monitoring escalation indicators",
          data: { conflictId: 6, updateType: "escalation" },
          read: false,
          priority: "urgent",
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          expiresAt: null
        },
        {
          id: 5,
          type: "market_alert",
          title: "Defense Index Movement",
          message: "Defense sector showing strong correlation with recent geopolitical developments",
          data: { alertType: "correlation_event", currentValue: 389.45 },
          read: true,
          priority: "normal",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          expiresAt: null
        },
        {
          id: 6,
          type: "conflict_update",
          title: "Myanmar Civil War",
          message: "Resistance forces reported significant territorial gains in northern regions",
          data: { conflictId: 4, updateType: "status_change" },
          read: false,
          priority: "high",
          createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          expiresAt: null
        }
  ];

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      res.json(notificationStore);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = notificationStore.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req, res) => {
    try {
      notificationStore.forEach(notification => {
        notification.read = true;
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const index = notificationStore.findIndex(n => n.id === notificationId);
      if (index > -1) {
        notificationStore.splice(index, 1);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // Protected routes example  
  app.get("/api/watchlist/stocks", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const watchlist = await storage.getUserStockWatchlist(userId);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching stock watchlist:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  // Real-time stock price updates
  app.post("/api/stocks/update", async (req, res) => {
    try {
      await stockService.updateAllStockPrices();
      res.json({ success: true, message: "Stock prices updated successfully" });
    } catch (error) {
      console.error("Error updating stock prices:", error);
      res.status(500).json({ error: "Failed to update stock prices" });
    }
  });

  app.get("/api/stocks/status", async (req, res) => {
    try {
      const hasApiKey = !!process.env.ALPHA_VANTAGE_API_KEY;
      res.json({ 
        realTimeEnabled: hasApiKey,
        lastUpdate: new Date().toISOString(),
        apiProvider: "Alpha Vantage"
      });
    } catch (error) {
      console.error("Error getting stock service status:", error);
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  const httpServer = createServer(app);
  
  // Daily Quiz Routes
  app.get("/api/quiz/today", async (req, res) => {
    try {
      const quiz = await quizService.getTodaysQuiz();
      if (!quiz) {
        return res.status(404).json({ error: "No quiz available for today" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching today's quiz:", error);
      res.status(500).json({ error: "Failed to fetch today's quiz" });
    }
  });

  app.post("/api/quiz/:quizId/submit", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const { responses } = req.body;
      const userId = 1; // Using default user ID for demo

      if (!Array.isArray(responses)) {
        return res.status(400).json({ error: "Responses must be an array" });
      }

      // Check if user already submitted this quiz
      const existingResponse = await storage.getUserQuizResponse(userId, quizId);
      if (existingResponse) {
        return res.status(400).json({ error: "Quiz already completed" });
      }

      const result = await quizService.submitQuizResponse(userId, quizId, responses);
      res.json(result);
    } catch (error) {
      console.error("Error submitting quiz response:", error);
      res.status(500).json({ error: "Failed to submit quiz response" });
    }
  });

  app.get("/api/quiz/:quizId/response", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const userId = 1; // Using default user ID for demo

      const response = await storage.getUserQuizResponse(userId, quizId);
      res.json(response || null);
    } catch (error) {
      console.error("Error fetching quiz response:", error);
      res.status(500).json({ error: "Failed to fetch quiz response" });
    }
  });

  // Start real-time stock price updates when server starts
  if (process.env.ALPHA_VANTAGE_API_KEY) {
    console.log("Starting real-time stock price updates...");
    stockService.startRealTimeUpdates();
  } else {
    console.warn("ALPHA_VANTAGE_API_KEY not found - real-time stock updates disabled");
  }

  // Start daily quiz scheduler
  if (process.env.OPENAI_API_KEY) {
    quizService.startDailyQuizScheduler();
    console.log("Daily quiz scheduler started");
  } else {
    console.warn("OPENAI_API_KEY not found - daily quiz generation disabled");
  }
  
  return httpServer;
}
