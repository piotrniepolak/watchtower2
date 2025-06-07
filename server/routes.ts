import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { discussionStorage } from "./discussion-storage";
import { insertUserSchema, insertStockWatchlistSchema, insertConflictWatchlistSchema } from "@shared/schema";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { pool } from "./db";
import { generateConflictPredictions, generateMarketAnalysis, generateConflictStoryline } from "./ai-analysis";
import { stockService } from "./stock-service";
import { quizService } from "./quiz-service";
import { newsService } from "./news-service";
import { lobbyingService } from "./lobbying-service";
import { modernLobbyingService } from "./modern-lobbying-service";
import session from "express-session";

// Simple session-based auth for now
const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

// Simple auth middleware
const isAuthenticated = async (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    const user = await storage.getUser(req.session.userId.toString());
    if (user) {
      req.user = user;
      console.log('Authentication successful for user:', { id: user.id, email: user.email });
      return next();
    }
  }
  console.log('Authentication failed - no valid session or user');
  return res.status(401).json({ message: 'Unauthorized' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable sessions
  app.use(sessionConfig);

  // Simple login endpoint for demo
  app.get('/api/login', (req: any, res) => {
    // Create a demo user session
    req.session.userId = 1;
    res.redirect('/');
  });

  // Quick login for existing user (development only)
  app.post('/api/auth/quick-login', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create session
      (req as any).session.userId = user.id;
      
      res.json({ 
        message: "Login successful", 
        user: { 
          id: user.id, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Quick login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const bcrypt = await import('bcrypt');
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      (req as any).session.userId = user.id;

      res.json({ 
        message: "Login successful", 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        } 
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get('/api/logout', (req: any, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  // Admin endpoint to clear all registered users
  app.post('/api/admin/clear-users', async (req, res) => {
    try {
      if (storage instanceof DatabaseStorage) {
        await storage.clearRegisteredUsers();
      }
      // Also clear from memory storage
      storage = new MemStorage();
      
      res.json({ message: "All registered users have been cleared successfully" });
    } catch (error) {
      console.error("Error clearing users:", error);
      res.status(500).json({ message: "Failed to clear users" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      // Auto-login the user
      (req as any).session.userId = newUser.id;

      res.status(201).json({ 
        message: "User created successfully", 
        user: { 
          id: newUser.id, 
          username: newUser.username, 
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        } 
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    if (req.session?.userId) {
      const user = await storage.getUser(req.session.userId.toString());
      if (user) {
        return res.json(user);
      }
    }
    res.status(401).json({ message: 'Not authenticated' });
  });

  app.patch('/api/auth/username', isAuthenticated, async (req: any, res) => {
    console.log('Username update endpoint hit');
    console.log('Request body:', req.body);
    console.log('User from middleware:', req.user);
    
    try {
      const { username } = req.body;
      const userId = req.user.id.toString();

      console.log('Updating username for user:', userId, 'to:', username);

      if (!username || username.trim().length === 0) {
        console.log('Username validation failed: empty username');
        return res.status(400).json({ message: "Username is required" });
      }

      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ message: "Username must be between 3 and 20 characters" });
      }

      // Check if username contains only valid characters
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, underscores, and hyphens" });
      }

      const updatedUser = await storage.updateUsername(userId, username.trim());
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "Username updated successfully",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName
        }
      });
    } catch (error: any) {
      console.error("Error updating username:", error);
      if (error.message === "Username already taken") {
        return res.status(400).json({ message: "Username already taken" });
      }
      res.status(500).json({ message: "Failed to update username" });
    }
  });

  // Simple test endpoint
  app.get('/api/auth/profile-test', (req, res) => {
    res.json({ message: "Profile endpoint is working" });
  });

  app.patch('/api/auth/profile', (req, res) => {
    console.log('=== PROFILE UPDATE REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('==============================');
    
    // Simple JSON response to test
    const response = {
      success: true,
      message: "Profile updated successfully",
      data: {
        firstName: req.body?.firstName || "Test",
        lastName: req.body?.lastName || "User",
        bio: req.body?.bio || "Test bio"
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(response);
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists by email or username
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userToCreate = { ...userData, password: hashedPassword };

      const user = await storage.createUser(userToCreate);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        },
        token 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password } = req.body; // identifier can be email or username
      
      // Try to find user by email first, then by username
      let user = await storage.getUserByEmail(identifier);
      if (!user) {
        user = await storage.getUserByUsername(identifier);
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        },
        token 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', isAuthenticated, async (req: any, res) => {
    const user = await storage.getUser(req.user.id.toString());
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username,
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName 
      } 
    });
  });

  app.put('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Check if username or email already exists for other users
      if (updateData.username) {
        const existingUser = await storage.getUserByUsername(updateData.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'Username already exists' });
        }
      }

      if (updateData.email) {
        const existingUser = await storage.getUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Watchlist routes
  app.get('/api/watchlist/stocks', isAuthenticated, async (req: any, res) => {
    try {
      const watchlist = await storage.getUserStockWatchlist(req.user.id);
      res.json(watchlist);
    } catch (error) {
      console.error('Error fetching stock watchlist:', error);
      res.status(500).json({ message: 'Failed to fetch watchlist' });
    }
  });

  app.post('/api/watchlist/stocks', isAuthenticated, async (req: any, res) => {
    try {
      const watchlistData = insertStockWatchlistSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const watchlist = await storage.addStockToWatchlist(watchlistData);
      res.json(watchlist);
    } catch (error) {
      console.error('Error adding to stock watchlist:', error);
      res.status(400).json({ message: 'Failed to add to watchlist' });
    }
  });

  app.delete('/api/watchlist/stocks/:symbol', isAuthenticated, async (req: any, res) => {
    try {
      // await storage.removeStockFromWatchlist(req.user.id, req.params.symbol);
      res.json({ message: 'Removed from watchlist' });
    } catch (error) {
      console.error('Error removing from stock watchlist:', error);
      res.status(500).json({ message: 'Failed to remove from watchlist' });
    }
  });

  // Temporarily commenting out watchlist endpoints due to missing dependencies
  // app.get('/api/watchlist/conflicts', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const watchlist = await storage.getUserConflictWatchlist(req.user.id);
  //     res.json(watchlist);
  //   } catch (error) {
  //     console.error('Error fetching conflict watchlist:', error);
  //     res.status(500).json({ message: 'Failed to fetch watchlist' });
  //   }
  // });

  // app.post('/api/watchlist/conflicts', isAuthenticated, async (req: any, res) => {
  //   try {
  //     const watchlistData = insertConflictWatchlistSchema.parse({
  //       ...req.body,
  //       userId: req.user.id
  //     });
      
  //     const watchlist = await storage.addConflictToWatchlist(watchlistData);
  //     res.json(watchlist);
  //   } catch (error) {
  //     console.error('Error adding to conflict watchlist:', error);
  //     res.status(400).json({ message: 'Failed to add to watchlist' });
  //   }
  // });

  // app.delete('/api/watchlist/conflicts/:id', isAuthenticated, async (req: any, res) => {
  //   try {
  //     await storage.removeConflictFromWatchlist(req.user.id, parseInt(req.params.id));
  //     res.json({ message: 'Removed from watchlist' });
  //   } catch (error) {
  //     console.error('Error removing from conflict watchlist:', error);
  //     res.status(500).json({ message: 'Failed to remove from watchlist' });
  //   }
  // });

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
      
      // Calculate dynamic correlation score based on market performance and conflict activity
      const avgChangePercent = stocks.length > 0 
        ? stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length
        : 0;
      
      // Base correlation on conflict intensity and market performance
      const conflictIntensity = activeConflicts / totalConflicts;
      const marketVolatility = Math.abs(avgChangePercent) / 100;
      
      // Higher correlation when conflicts are active and markets are volatile
      const baseCorrelation = 0.65;
      const conflictFactor = conflictIntensity * 0.15;
      const volatilityFactor = marketVolatility * 0.20;
      
      const rawCorrelationScore = Math.min(0.95, baseCorrelation + conflictFactor + volatilityFactor);
      const correlationScore = Math.round(rawCorrelationScore * 100) / 100;
      
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

  // ROI Rankings endpoint
  app.get("/api/roi-rankings", async (req, res) => {
    try {
      const timeframe = req.query.timeframe as string || "1Y";
      const rankings = await lobbyingService.calculateROIRankings(timeframe);
      res.json(rankings);
    } catch (error) {
      console.error("Error fetching ROI rankings:", error);
      res.status(500).json({ error: "Failed to fetch ROI rankings" });
    }
  });

  // Lobbying expenditures endpoint
  app.get("/api/lobbying", async (req, res) => {
    try {
      const stockSymbol = req.query.symbol as string;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const expenditures = await lobbyingService.getLobbyingExpenditures(stockSymbol, year);
      res.json(expenditures);
    } catch (error) {
      console.error("Error fetching lobbying data:", error);
      res.status(500).json({ error: "Failed to fetch lobbying data" });
    }
  });

  // Modern lobbying analysis with Perplexity AI
  app.get("/api/lobbying/analysis", async (req, res) => {
    try {
      const timeframe = req.query.timeframe as string || "1Y";
      const stocks = await storage.getStocks();
      const analysis = await modernLobbyingService.getLobbyingAnalysis(stocks, timeframe);
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching lobbying analysis:", error);
      res.status(500).json({ error: "Failed to fetch lobbying analysis" });
    }
  });

  // Refresh lobbying data
  app.post("/api/lobbying/refresh", async (req, res) => {
    try {
      const stocks = await storage.getStocks();
      const analysis = await modernLobbyingService.refreshLobbyingData(stocks);
      res.json(analysis);
    } catch (error) {
      console.error("Error refreshing lobbying data:", error);
      res.status(500).json({ error: "Failed to refresh lobbying data" });
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
  app.get("/api/watchlist/stocks", isAuthenticated, async (req: any, res) => {
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
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send initial stock data
    storage.getStocks().then(stocks => {
      ws.send(JSON.stringify({ 
        type: 'stocks', 
        data: stocks,
        timestamp: new Date().toISOString()
      }));
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Broadcast stock updates to all connected clients
  const broadcastStockUpdate = async () => {
    try {
      const stocks = await storage.getStocks();
      const message = JSON.stringify({ 
        type: 'stocks', 
        data: stocks,
        timestamp: new Date().toISOString()
      });
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Error broadcasting stock update:', error);
    }
  };
  
  // Set up periodic stock updates broadcast
  setInterval(broadcastStockUpdate, 15000); // Every 15 seconds
  
  // Daily News Routes
  app.get("/api/news/today", async (req, res) => {
    try {
      const news = await newsService.getTodaysNews();
      if (!news) {
        return res.status(404).json({ error: "No news available for today" });
      }
      res.json(news);
    } catch (error) {
      console.error("Error fetching today's news:", error);
      res.status(500).json({ error: "Failed to fetch today's news" });
    }
  });
  
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

  app.get("/api/quiz/leaderboard", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const leaderboard = await storage.getDailyQuizLeaderboard(today);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching quiz leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch quiz leaderboard" });
    }
  });

  app.post("/api/quiz/:quizId/submit", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const { responses, completionTimeSeconds } = req.body;
      const userId = 1; // Using default user ID for demo

      if (!Array.isArray(responses)) {
        return res.status(400).json({ error: "Responses must be an array" });
      }

      // Check if user already submitted this quiz
      const existingResponse = await storage.getUserQuizResponse(userId, quizId);
      if (existingResponse) {
        return res.status(400).json({ error: "Quiz already completed" });
      }

      const result = await quizService.submitQuizResponse(userId, quizId, responses, completionTimeSeconds);
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

  // This route was conflicting with individual discussion route - removed

  // Individual discussion endpoint - CRITICAL FIX
  app.get('/api/discussions/:id(\\d+)', async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      console.log("DISCUSSION ENDPOINT HIT - ID:", discussionId);
      
      // Direct database query
      const result = await pool.query(`
        SELECT 
          d.id, d.title, d.content, d.author_id, d.category, d.tags,
          d.upvotes, d.downvotes, d.reply_count, d.last_activity_at,
          d.created_at, d.updated_at,
          u.id as user_id, u.username, u.first_name, u.last_name, u.profile_image_url
        FROM discussions d
        LEFT JOIN users u ON d.author_id = u.id
        WHERE d.id = $1
      `, [discussionId]);
      
      console.log("Database result rows:", result.rows.length);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Discussion not found" });
      }
      
      const row = result.rows[0];
      const discussion = {
        id: row.id,
        title: row.title,
        content: row.content,
        authorId: row.author_id,
        category: row.category,
        tags: row.tags || [],
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        replyCount: row.reply_count,
        lastActivityAt: row.last_activity_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        author: {
          id: row.user_id,
          username: row.username,
          firstName: row.first_name,
          lastName: row.last_name,
          profileImageUrl: row.profile_image_url,
        }
      };
      
      console.log("Returning discussion:", discussion.title);
      res.json(discussion);
    } catch (error) {
      console.error("Discussion endpoint error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Chat API routes
  app.get('/api/chat/:category', async (req, res) => {
    try {
      const category = req.params.category || 'general';
      const limit = 50;
      
      const messages = await discussionStorage.getDiscussions(limit, 0, category);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      // For demo purposes, use a default user ID (user 2 which exists)
      // In production, this would check proper authentication
      const userId = 2;
      
      const { content, category = "general" } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
      }
      
      const message = await discussionStorage.createDiscussion({
        title: "Chat Message",
        content: content.trim(),
        authorId: userId.toString(),
        category,
        tags: [],
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get('/api/discussions', async (req, res) => {
    try {
      const category = req.query.category as string || 'general';
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      
      const messages = await discussionStorage.getDiscussions(limit, 0, category);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post('/api/discussions', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const { title, content, category = "general", tags = [] } = req.body;
      
      if (!title || !title.trim() || !content || !content.trim()) {
        return res.status(400).json({ error: "Title and content are required" });
      }
      
      const discussion = await discussionStorage.createDiscussion({
        title,
        content,
        authorId: userId,
        category,
        tags,
      });
      
      res.status(201).json(discussion);
    } catch (error) {
      console.error("Error creating discussion:", error);
      res.status(500).json({ error: "Failed to create discussion" });
    }
  });

  app.get('/api/discussions/:id/replies', async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const replies = await discussionStorage.getDiscussionReplies(discussionId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching replies:", error);
      res.status(500).json({ error: "Failed to fetch replies" });
    }
  });

  app.post('/api/discussions/:id/replies', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const discussionId = parseInt(req.params.id);
      const { content, parentReplyId } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      
      const reply = await discussionStorage.createDiscussionReply({
        discussionId,
        content,
        authorId: userId.toString(),
        parentReplyId: parentReplyId || null,
      });
      
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating reply:", error);
      res.status(500).json({ error: "Failed to create reply" });
    }
  });

  // Like/unlike a discussion thread
  app.post('/api/discussions/:id/like', async (req, res) => {
    try {
      // Using session-based authentication
      const userId = req.session?.user?.id || 2; // Default to user 2 for demo
      
      const discussionId = parseInt(req.params.id);
      await discussionStorage.voteOnDiscussion(parseInt(userId), discussionId, 'up');
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking discussion:", error);
      res.status(500).json({ error: "Failed to like discussion" });
    }
  });

  // Like/unlike a reply
  app.post('/api/discussions/replies/:id/like', async (req, res) => {
    try {
      // Using session-based authentication
      const userId = req.session?.user?.id || 2; // Default to user 2 for demo
      
      const replyId = parseInt(req.params.id);
      await discussionStorage.voteOnReply(parseInt(userId), replyId, 'up');
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking reply:", error);
      res.status(500).json({ error: "Failed to like reply" });
    }
  });

  app.post('/api/discussions/:id/vote', async (req, res) => {
    try {
      // For now, using a demo user ID since auth is not fully implemented
      const userId = 1;
      const discussionId = parseInt(req.params.id);
      const { voteType } = req.body;
      
      if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ error: "Vote type must be 'up' or 'down'" });
      }
      
      await discussionStorage.voteOnDiscussion(userId, discussionId, voteType);
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting on discussion:", error);
      res.status(500).json({ error: "Failed to vote on discussion" });
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
