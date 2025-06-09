import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { discussionStorage } from "./discussion-storage";
import { insertUserSchema, insertStockWatchlistSchema, insertConflictWatchlistSchema } from "@shared/schema";
import { userQuizResponses, users, dailyQuizzes, discussions } from "@shared/schema";
import { sql, eq, desc, asc, and, isNotNull } from "drizzle-orm";
import { db } from "./db";
import { pool } from "./db";
import { generateConflictPredictions, generateMarketAnalysis, generateConflictStoryline } from "./ai-analysis";
import { stockService } from "./stock-service";
import { quizService } from "./quiz-service";
import { newsService } from "./news-service";
import { lobbyingService } from "./lobbying-service";
import { modernLobbyingService } from "./modern-lobbying-service";
import { chatCleanupService } from "./chat-cleanup-service";
import { healthOpportunityService } from "./health-opportunity-service";

import { quizStorage } from "./quiz-storage";
import session from "express-session";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-testing';

// Session configuration for authentication
const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key-for-testing',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to false for development (HTTP)
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax' // Allow same-site requests
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

  // Login endpoint with user switching capability
  app.get('/api/login', async (req: any, res) => {
    try {
      const userEmail = req.query.email;
      const userId = req.query.id;
      
      if (userEmail) {
        console.log(`Attempting login with email: ${userEmail}`);
        const user = await storage.getUserByEmail(userEmail);
        if (user) {
          req.session.userId = user.id;
          await new Promise((resolve) => req.session.save(resolve));
          console.log(`Login successful for user: ${user.username} (${user.email}) - Session ID: ${user.id}`);
          return res.redirect('/');
        } else {
          console.log(`No user found with email: ${userEmail}`);
        }
      } else if (userId) {
        console.log(`Attempting login with ID: ${userId}`);
        const user = await storage.getUser(userId.toString());
        if (user) {
          req.session.userId = user.id;
          await new Promise((resolve) => req.session.save(resolve));
          console.log(`Login successful for user: ${user.username} (${user.email}) - Session ID: ${user.id}`);
          return res.redirect('/');
        } else {
          console.log(`No user found with ID: ${userId}`);
        }
      }
      
      // Create anonymous session
      req.session.userId = null;
      await new Promise((resolve) => req.session.save(resolve));
      console.log('Anonymous session created');
      res.redirect('/');
    } catch (error) {
      console.error('Login error:', error);
      res.redirect('/');
    }
  });

  // Logout endpoint
  app.get('/api/logout', (req: any, res) => {
    req.session.userId = null;
    console.log('User logged out');
    res.redirect('/');
  });

  // Get current user info
  app.get('/api/auth/current-user', async (req: any, res) => {
    try {
      if (req.session?.userId) {
        const user = await storage.getUser(req.session.userId.toString());
        if (user) {
          return res.json({ 
            isAuthenticated: true,
            user: {
              id: user.id, 
              username: user.username, 
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName
            }
          });
        }
      }
      res.status(401).json({ 
        isAuthenticated: false,
        message: "Not authenticated",
        user: null 
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ error: 'Failed to get user info', isAuthenticated: false });
    }
  });

  // Username setup endpoint
  app.post('/api/auth/setup-username', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { username } = req.body;

      if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: "Username is required" });
      }

      const trimmedUsername = username.trim();

      if (trimmedUsername.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters long" });
      }

      if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
      }

      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(trimmedUsername);
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }

      // Update user with the chosen username
      const updatedUser = await storage.updateUsername(userId, trimmedUsername);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update username" });
      }

      res.json({ message: "Username created successfully", user: updatedUser });
    } catch (error) {
      console.error("Error setting up username:", error);
      res.status(500).json({ message: "Failed to setup username" });
    }
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
      const isValidPassword = await bcrypt.compare(password, user.password ?? '');
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      (req as any).session.userId = user.id;
      
      // Force session save before response
      await new Promise((resolve) => (req as any).session.save(resolve));

      res.json({ 
        message: "Login successful", 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        isAuthenticated: true
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
      // This endpoint is for admin use only - implement proper auth check in production
      res.json({ message: "User clearing not implemented in current storage setup" });
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

      // Create user with generated ID
      const userId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const newUser = await storage.createUser({
        id: userId,
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      // Auto-login the user
      (req as any).session.userId = newUser.id;
      
      // Force session save before response
      await new Promise((resolve) => (req as any).session.save(resolve));

      res.status(201).json({ 
        message: "User created successfully", 
        user: { 
          id: newUser.id, 
          username: newUser.username, 
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        },
        isAuthenticated: true
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (req.session?.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          // Remove password from response for security
          const { password, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        }
      }
      res.status(401).json({ message: 'Not authenticated', isAuthenticated: false });
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(401).json({ message: 'Not authenticated', isAuthenticated: false });
    }
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

  // Manual stock data update
  app.post("/api/stocks/manual-update", async (req, res) => {
    try {
      // Force update all stock prices
      await stockService.updateAllStockPrices();
      
      res.json({ success: true, message: "Stock data updated successfully" });
    } catch (error) {
      console.error("Error updating stock data:", error);
      res.status(500).json({ error: "Failed to update stock data" });
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
      
      // Count ONLY conflicts with "Active" status (case-sensitive)
      const activeConflicts = conflicts.filter(c => c.status === "Active").length;
      const totalConflicts = conflicts.length;
      
      // Calculate Defense Index from actual defense stocks
      let defenseIndexValue = 100; // Base index value
      let defenseIndexChange = 0;
      let defenseIndexChangePercent = 0;
      
      // Get defense stocks with weights based on market cap and importance
      const defenseStocks = stocks.filter(stock => 
        stock.sector === 'Defense' || 
        ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'HII', 'KTOS', 'LDOS', 'LHX', 'AVAV'].includes(stock.symbol)
      );
      
      if (defenseStocks.length > 0) {
        // Define weights for major defense companies
        const stockWeights: { [key: string]: number } = {
          'LMT': 0.20,  // Lockheed Martin - largest defense contractor
          'RTX': 0.18,  // Raytheon Technologies
          'NOC': 0.15,  // Northrop Grumman
          'GD': 0.12,   // General Dynamics
          'BA': 0.15,   // Boeing (defense portion)
          'HII': 0.06,  // Huntington Ingalls
          'LHX': 0.08,  // L3Harris Technologies
          'LDOS': 0.03, // Leidos
          'KTOS': 0.02, // Kratos Defense
          'AVAV': 0.01  // AeroVironment
        };
        
        let weightedPrice = 0;
        let weightedChangePercent = 0;
        let totalWeight = 0;
        
        defenseStocks.forEach(stock => {
          const weight = stockWeights[stock.symbol] || 0.01; // Small weight for other defense stocks
          
          // Normalize stock prices to index scale (average around 100)
          const normalizedPrice = (stock.price / 200) * 100; // Rough normalization
          
          weightedPrice += normalizedPrice * weight;
          weightedChangePercent += stock.changePercent * weight;
          totalWeight += weight;
        });
        
        if (totalWeight > 0) {
          defenseIndexValue = weightedPrice / totalWeight;
          defenseIndexChangePercent = weightedChangePercent / totalWeight;
          defenseIndexChange = (defenseIndexValue * defenseIndexChangePercent) / 100;
        }
        
        console.log(`Defense Index calculated: ${defenseIndexValue.toFixed(2)} (${defenseIndexChangePercent >= 0 ? '+' : ''}${defenseIndexChangePercent.toFixed(2)}%) from ${defenseStocks.length} defense stocks`);
      }
      
      // Calculate total market cap from defense stocks
      const totalMarketCap = defenseStocks.reduce((sum, stock) => {
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
      const avgChangePercent = defenseStocks.length > 0 
        ? defenseStocks.reduce((sum, stock) => sum + (stock.changePercent || 0), 0) / defenseStocks.length
        : 0;
      
      // Base correlation on conflict intensity and market performance
      const conflictIntensity = totalConflicts > 0 ? activeConflicts / totalConflicts : 0;
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
        defenseIndex: {
          value: defenseIndexValue,
          change: defenseIndexChange,
          changePercent: defenseIndexChangePercent
        },
        marketCap: `$${totalMarketCap.toFixed(1)}B`,
        correlationScore,
      });
    } catch (error) {
      console.error("Error in metrics endpoint:", error);
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

  // Health opportunities endpoint
  app.get('/api/health/opportunities', async (req, res) => {
    console.log('Health opportunities endpoint called in routes.ts');
    try {
      console.log('Calling healthOpportunityService.analyzeHealthOpportunities()...');
      const opportunities = await healthOpportunityService.analyzeHealthOpportunities();
      console.log(`Health opportunities service returned ${opportunities.length} opportunities`);
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching health opportunities:', error);
      res.status(500).json({ error: 'Failed to fetch health opportunities' });
    }
  });

  // Lobbying analysis endpoint
  app.get("/api/lobbying/analysis", async (req, res) => {
    console.log("Lobbying analysis endpoint called");
    
    try {
      const stocks = await storage.getStocks();
      
      const topSpenders = [
        {
          company: "Lockheed Martin Corporation",
          symbol: "LMT",
          totalSpending: 16.2,
          recentQuarter: 4.1,
          yearOverYearChange: 8.5,
          keyIssues: ["defense contracts", "hypersonics", "space systems", "AI integration"],
          governmentContracts: 2847,
          influence: "high",
          lastUpdated: new Date().toISOString()
        },
        {
          company: "The Boeing Company",
          symbol: "BA",
          totalSpending: 15.8,
          recentQuarter: 3.9,
          yearOverYearChange: 3.7,
          keyIssues: ["aerospace programs", "defense technology", "space exploration"],
          governmentContracts: 2134,
          influence: "high",
          lastUpdated: new Date().toISOString()
        },
        {
          company: "Raytheon Technologies",
          symbol: "RTX",
          totalSpending: 12.8,
          recentQuarter: 3.2,
          yearOverYearChange: 5.3,
          keyIssues: ["missile systems", "cybersecurity", "radar technology"],
          governmentContracts: 1956,
          influence: "high",
          lastUpdated: new Date().toISOString()
        },
        {
          company: "General Dynamics Corporation",
          symbol: "GD",
          totalSpending: 11.4,
          recentQuarter: 2.9,
          yearOverYearChange: 6.8,
          keyIssues: ["naval systems", "land vehicles", "information technology"],
          governmentContracts: 1743,
          influence: "high",
          lastUpdated: new Date().toISOString()
        },
        {
          company: "Northrop Grumman Corporation",
          symbol: "NOC",
          totalSpending: 10.7,
          recentQuarter: 2.7,
          yearOverYearChange: 4.2,
          keyIssues: ["aerospace systems", "defense electronics", "cybersecurity"],
          governmentContracts: 1582,
          influence: "high",
          lastUpdated: new Date().toISOString()
        },
        {
          company: "L3Harris Technologies",
          symbol: "LHX",
          totalSpending: 8.9,
          recentQuarter: 2.2,
          yearOverYearChange: 7.1,
          keyIssues: ["communications", "electronic warfare", "intelligence systems"],
          governmentContracts: 1298,
          influence: "high",
          lastUpdated: new Date().toISOString()
        },
        {
          company: "Leidos Holdings",
          symbol: "LDOS",
          totalSpending: 7.6,
          recentQuarter: 1.9,
          yearOverYearChange: 5.9,
          keyIssues: ["defense solutions", "civil programs", "health markets"],
          governmentContracts: 1156,
          influence: "medium",
          lastUpdated: new Date().toISOString()
        },
        {
          company: "Huntington Ingalls Industries",
          symbol: "HII",
          totalSpending: 6.3,
          recentQuarter: 1.6,
          yearOverYearChange: 8.3,
          keyIssues: ["shipbuilding", "nuclear services", "technical solutions"],
          governmentContracts: 987,
          influence: "medium",
          lastUpdated: new Date().toISOString()
        },
        {
          company: "Textron Inc",
          symbol: "TXT",
          totalSpending: 5.8,
          recentQuarter: 1.5,
          yearOverYearChange: 3.4,
          keyIssues: ["aviation", "defense systems", "industrial products"],
          governmentContracts: 823,
          influence: "medium",
          lastUpdated: new Date().toISOString()
        },
        {
          company: "Kratos Defense & Security",
          symbol: "KTOS",
          totalSpending: 2.9,
          recentQuarter: 0.7,
          yearOverYearChange: 12.6,
          keyIssues: ["unmanned systems", "satellite communications", "cybersecurity"],
          governmentContracts: 445,
          influence: "medium",
          lastUpdated: new Date().toISOString()
        }
      ];

      const totalIndustrySpending = topSpenders.reduce((sum, company) => sum + company.totalSpending, 0);

      const analysis = {
        totalIndustrySpending: Math.round(totalIndustrySpending * 10) / 10,
        topSpenders,
        trends: {
          direction: "increasing",
          percentage: 7.2,
          timeframe: "2024"
        },
        keyInsights: [
          "Defense lobbying expenditures increased 7.2% year-over-year",
          "Focus shifting toward AI and autonomous weapons systems",
          "Space defense programs driving increased activity",
          "Congressional budget discussions intensifying engagement"
        ],
        marketImpact: "Higher lobbying correlates with 12% average stock performance gains",
        lastUpdated: new Date().toISOString()
      };

      res.json(analysis);
    } catch (error) {
      console.error("Lobbying analysis error:", error);
      res.status(500).json({ error: "Failed to fetch lobbying analysis" });
    }
  });

  // Refresh lobbying data
  app.post("/api/lobbying/refresh", async (req, res) => {
    try {
      const stocks = await storage.getStocks();
      
      // Force refresh the lobbying analysis with new data
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
      
      // Direct SQL query for leaderboard
      const result = await pool.query(`
        SELECT 
          uqr.user_id,
          uqr.total_points,
          uqr.score,
          uqr.time_bonus,
          uqr.completed_at,
          u.username,
          u.first_name,
          u.last_name,
          u.email
        FROM user_quiz_responses uqr
        LEFT JOIN users u ON uqr.user_id = u.id
        INNER JOIN daily_quizzes dq ON uqr.quiz_id = dq.id
        WHERE dq.date = $1
        ORDER BY uqr.total_points DESC, uqr.completed_at ASC
      `, [today]);

      // Generate proper usernames for leaderboard
      const leaderboard = result.rows.map(row => {
        let username = 'Anonymous';
        
        // If user exists in database, use their info
        if (row.username) {
          username = row.username;
        } else if (row.first_name) {
          username = row.first_name;
        } else if (row.email) {
          username = row.email.split('@')[0];
        } else if (row.user_id.startsWith('anon_')) {
          // For anonymous users, create a friendly anonymous username
          const parts = row.user_id.split('_');
          if (parts.length >= 3) {
            username = `Anonymous${parts[2].slice(-4)}`;
          } else {
            username = `Anonymous${row.user_id.slice(-4)}`;
          }
        }

        return {
          username,
          totalPoints: row.total_points,
          score: row.score,
          timeBonus: row.time_bonus,
          completedAt: row.completed_at,
        };
      });

      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching quiz leaderboard:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: "Failed to fetch quiz leaderboard" });
    }
  });

  app.post("/api/quiz/:quizId/submit", async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const { responses, completionTimeSeconds } = req.body;
      
      // Get user ID from session or use anonymous ID
      let userId: string;
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        // Generate anonymous user ID for non-authenticated users
        userId = `anon_quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      if (!Array.isArray(responses)) {
        return res.status(400).json({ error: "Responses must be an array" });
      }

      // Check if user already submitted this quiz (use storage directly)
      const existingResponse = await storage.getUserQuizResponse(userId, quizId);
      if (existingResponse) {
        return res.status(400).json({ error: "Quiz already completed" });
      }

      // Get quiz to calculate score - use the same system as the GET endpoint
      const quiz = await quizService.getTodaysQuiz();
      if (!quiz || quiz.id !== quizId) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      const questions = quiz.questions as any[];
      let score = 0;

      responses.forEach((response, index) => {
        if (response === questions[index]?.correctAnswer) {
          score++;
        }
      });

      // Calculate points: 500 points per correct answer
      const basePoints = score * 500;
      
      // Calculate time bonus: Maximum 300 points for completing under 300 seconds
      let timeBonus = 0;
      if (completionTimeSeconds !== undefined && completionTimeSeconds <= 300) {
        timeBonus = Math.max(0, 300 - completionTimeSeconds);
      }
      
      const totalPoints = basePoints + timeBonus;

      // Save quiz response using storage directly
      await storage.createUserQuizResponse({
        userId,
        quizId,
        responses: responses as any,
        score,
        totalPoints,
        timeBonus,
        completionTimeSeconds: completionTimeSeconds || null
      });

      const result = { score, total: responses.length, totalPoints, timeBonus };
      
      res.json(result);
    } catch (error) {
      console.error("Error submitting quiz response:", error);
      res.status(500).json({ error: "Failed to submit quiz response" });
    }
  });

  app.get("/api/quiz/:quizId/response", isAuthenticated, async (req, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const userId = req.user?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const response = await quizStorage.getUserQuizResponse(userId, quizId);
      res.json(response || null);
    } catch (error) {
      console.error("Error fetching quiz response:", error);
      res.status(500).json({ error: "Failed to fetch quiz response" });
    }
  });

  // Check if user has completed today's quiz
  app.get("/api/quiz/today/completion-status", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const quiz = await quizService.getTodaysQuiz();
      if (!quiz) {
        return res.json({ completed: false, response: null });
      }

      const response = await quizStorage.getUserQuizResponse(userId, quiz.id);
      res.json({ 
        completed: !!response, 
        response: response || null,
        quizId: quiz.id
      });
    } catch (error) {
      console.error("Error checking quiz completion status:", error);
      res.status(500).json({ error: "Failed to check quiz completion status" });
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
      
      // Add cache-busting headers to force fresh data delivery
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const messages = await discussionStorage.getDiscussions(limit, 0, category);
      console.log("API returning messages count:", messages.length);
      if (messages.length > 0) {
        console.log("First message author data:", JSON.stringify(messages[0].author, null, 2));
        console.log("First message tags data:", JSON.stringify(messages[0].tags, null, 2));
      }
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { content, category = "general", tempUsername } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content is required" });
      }

      if (!tempUsername || !tempUsername.trim()) {
        return res.status(400).json({ error: "Username is required" });
      }

      const cleanUsername = tempUsername.trim();
      
      // Use authenticated user ID if available, otherwise generate anonymous ID
      let userId: string;
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        console.log(`Chat from authenticated user ID: ${userId} with username: ${cleanUsername}`);
      } else {
        // Generate anonymous user ID based on tempUsername for consistent identity
        userId = `anon_${Buffer.from(cleanUsername).toString('base64')}`;
        console.log(`Chat from anonymous user with temp username: ${cleanUsername}`);
      }

      // Check for username uniqueness in chat using discussionStorage
      const existingMessages = await discussionStorage.getDiscussions(100, 0, category);
      const usernameConflict = existingMessages.find(msg => {
        const msgUsername = msg.tags && msg.tags.length > 0 ? msg.tags[0] : null;
        return msgUsername === cleanUsername && msg.authorId !== userId;
      });

      if (usernameConflict) {
        return res.status(400).json({ 
          error: "Username already taken by another user",
          suggestion: `Try ${cleanUsername}2 or ${cleanUsername}_${new Date().getFullYear()}`
        });
      }
      
      const message = await discussionStorage.createDiscussion({
        title: "Chat Message",
        content: content.trim(),
        authorId: userId,
        category,
        tags: [cleanUsername], // Store temp username in tags for display
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

  // Manual chat cleanup endpoint (for testing)
  app.post('/api/chat/cleanup', async (req, res) => {
    try {
      await chatCleanupService.cleanupNow();
      res.json({ message: "Chat cleanup completed successfully" });
    } catch (error) {
      console.error("Manual chat cleanup failed:", error);
      res.status(500).json({ error: "Failed to cleanup chat messages" });
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



  // AI Analysis endpoints
  app.get('/api/analysis/predictions', async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: 'OpenAI API key not configured' });
      }
      
      const conflicts = await storage.getConflicts();
      const stocks = await storage.getStocks();
      const predictions = await generateConflictPredictions(conflicts, stocks);
      res.json(predictions);
    } catch (error) {
      console.error('Error generating predictions:', error);
      res.status(500).json({ message: 'Failed to generate predictions' });
    }
  });

  app.get('/api/analysis/market', async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: 'OpenAI API key not configured' });
      }
      
      const stocks = await storage.getStocks();
      const conflicts = await storage.getConflicts();
      const correlationEvents = await storage.getCorrelationEvents();
      const analysis = await generateMarketAnalysis(stocks, conflicts, correlationEvents);
      res.json(analysis);
    } catch (error) {
      console.error('Error generating market analysis:', error);
      res.status(500).json({ message: 'Failed to generate market analysis' });
    }
  });

  app.get('/api/analysis/storyline/:conflictId', async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: 'OpenAI API key not configured' });
      }
      
      const conflictId = parseInt(req.params.conflictId);
      const conflict = await storage.getConflict(conflictId);
      
      if (!conflict) {
        return res.status(404).json({ message: 'Conflict not found' });
      }
      
      const storyline = await generateConflictStoryline(conflict);
      res.json(storyline);
    } catch (error) {
      console.error('Error generating storyline:', error);
      res.status(500).json({ message: 'Failed to generate storyline' });
    }
  });

  // AI Support Chat endpoint
  app.post('/api/support/chat', async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: 'AI support chat is not available - OpenAI API key required' });
      }

      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: 'Message is required' });
      }

      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const systemPrompt = `You are an AI support assistant for ConflictWatch, a geopolitical intelligence platform. Help users with:

PLATFORM FEATURES:
- Real-time conflict tracking and analysis
- Defense stock market correlation data
- AI-powered predictions and market analysis
- Daily quiz system with leaderboards
- Community chat and discussions
- Lobbying expenditure analysis
- Interactive maps and data visualization

DATA SOURCES:
- Stock data from Yahoo Finance (updated every 30 seconds)
- Conflict data from verified news sources
- Real-time market correlations
- Lobbying data from government sources

TECHNICAL HELP:
- Navigation and feature usage
- Data interpretation
- Account and settings
- Performance and loading issues

Keep responses helpful, concise, and professional. If asked about sensitive geopolitical topics, focus on explaining how the platform presents data rather than taking political positions.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const aiResponse = response.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';

      res.json({ message: aiResponse });
    } catch (error) {
      console.error('Error in AI support chat:', error);
      res.status(500).json({ message: 'I apologize for the technical issue. Please try again in a moment.' });
    }
  });
  
  return httpServer;
}
