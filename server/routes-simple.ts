import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { generateConflictPredictions, generateMarketAnalysis, generateConflictStoryline } from "./ai-analysis";
import { stockService } from "./stock-service";
import { quizService } from "./quiz-service";
import { newsService } from "./news-service";
import { conflictTimelineService } from "./conflict-timeline-service";
import session from "express-session";

// Simple session-based auth
const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

// Simple auth middleware
const isAuthenticated = async (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    const user = await storage.getUser(req.session.userId.toString());
    if (user) {
      req.user = user;
      return next();
    }
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable sessions
  app.use(sessionConfig);

  // Demo login endpoint - only for demo account
  app.get('/api/demo-login', (req: any, res) => {
    // Create a demo user session
    req.session.userId = 1;
    res.redirect('/');
  });

  // Regular login endpoint for user authentication
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // For now, check if password matches (in production, use proper hashing)
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Create user session
      req.session.userId = parseInt(user.id);
      
      res.json({ 
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Registration endpoint
  app.post('/api/auth/register', async (req: any, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Create new user
      const newUser = await storage.createUser({
        username,
        email,
        password, // In production, hash this password
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
        bio: null
      });

      // Create user session
      req.session.userId = newUser.id;
      
      res.json({ 
        message: 'Registration successful',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/logout', (req: any, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
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

  // Profile update endpoint
  app.patch('/api/auth/profile', async (req: any, res) => {
    console.log('=== PROFILE UPDATE REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Session:', req.session);
    console.log('==============================');
    
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { firstName, lastName, bio, profileImageUrl } = req.body;
      
      // Update user profile in storage
      const updatedUser = await storage.updateUser(req.session.userId.toString(), {
        firstName: firstName || null,
        lastName: lastName || null,
        bio: bio || null,
        profileImageUrl: profileImageUrl || null
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Profile updated successfully:', updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }

      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
      }

      // Create new user
      const newUser = await storage.createUser({
        username,
        email,
        password, // In a real app, this should be hashed
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
        bio: null
      });

      // Automatically log in the user after registration
      req.session.userId = parseInt(newUser.id);

      res.status(201).json({ 
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // In a real app, you would verify the hashed password
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Create session
      req.session.userId = parseInt(user.id);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Public routes
  app.get('/api/conflicts', async (req, res) => {
    try {
      const conflicts = await storage.getConflicts();
      res.json(conflicts);
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      res.status(500).json({ message: 'Failed to fetch conflicts' });
    }
  });

  app.get('/api/stocks', async (req, res) => {
    try {
      const stocks = await storage.getStocks();
      res.json(stocks);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      res.status(500).json({ message: 'Failed to fetch stocks' });
    }
  });

  app.get('/api/correlation-events', async (req, res) => {
    try {
      const events = await storage.getCorrelationEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching correlation events:', error);
      res.status(500).json({ message: 'Failed to fetch correlation events' });
    }
  });

  // Conflict timeline endpoints
  app.get('/api/conflicts/:id/timeline', async (req, res) => {
    try {
      const conflictId = parseInt(req.params.id);
      const timeline = await conflictTimelineService.getConflictTimeline(conflictId);
      res.json(timeline);
    } catch (error) {
      console.error('Error fetching conflict timeline:', error);
      res.status(500).json({ error: 'Failed to fetch timeline' });
    }
  });

  app.post('/api/conflicts/:id/update-timeline', async (req, res) => {
    try {
      const conflictId = parseInt(req.params.id);
      const conflict = await storage.getConflict(conflictId);
      
      if (!conflict) {
        return res.status(404).json({ error: 'Conflict not found' });
      }

      const events = await conflictTimelineService.fetchConflictUpdates(conflict);
      
      for (const event of events) {
        const correlationEvent = {
          eventDate: event.timestamp,
          eventDescription: event.description,
          stockMovement: 0,
          conflictId: event.conflictId,
          severity: event.severity === 'low' ? 2 : event.severity === 'medium' ? 5 : event.severity === 'high' ? 7 : 9
        };
        
        await storage.createCorrelationEvent(correlationEvent);
      }

      const updatedConflict = await storage.getConflict(conflictId);
      if (updatedConflict) {
        await storage.updateConflict(conflictId, {
          name: updatedConflict.name,
          status: updatedConflict.status,
          region: updatedConflict.region,
          severity: updatedConflict.severity,
          duration: updatedConflict.duration,
          startDate: updatedConflict.startDate
        });
      }

      res.json({ 
        message: 'Timeline updated successfully',
        eventsAdded: events.length 
      });
    } catch (error) {
      console.error('Error updating conflict timeline:', error);
      res.status(500).json({ error: 'Failed to update timeline' });
    }
  });

  app.post('/api/conflicts/update-all-timelines', async (req, res) => {
    try {
      await conflictTimelineService.updateAllConflictTimelines();
      res.json({ message: 'All conflict timelines updated successfully' });
    } catch (error) {
      console.error('Error updating all timelines:', error);
      res.status(500).json({ error: 'Failed to update timelines' });
    }
  });

  // AI Analysis routes
  app.get('/api/analysis/predictions', async (req, res) => {
    try {
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

  // Quiz routes
  app.get('/api/quiz/today', async (req, res) => {
    try {
      const quiz = await quizService.getTodaysQuiz();
      res.json(quiz);
    } catch (error) {
      console.error('Error fetching today\'s quiz:', error);
      res.status(500).json({ message: 'Failed to fetch quiz' });
    }
  });

  app.post('/api/quiz/:quizId/submit', isAuthenticated, async (req: any, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const { responses, completionTimeSeconds } = req.body;
      const userId = req.session.userId; // Get actual logged-in user
      
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
      console.error('Error submitting quiz:', error);
      res.status(500).json({ error: 'Failed to submit quiz response' });
    }
  });

  app.get('/api/quiz/:quizId/response', isAuthenticated, async (req: any, res) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const userId = req.session.userId; // Get actual logged-in user

      const response = await storage.getUserQuizResponse(userId, quizId);
      res.json(response || null);
    } catch (error) {
      console.error('Error fetching quiz response:', error);
      res.status(500).json({ error: 'Failed to fetch quiz response' });
    }
  });

  app.get('/api/quiz/leaderboard', async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const leaderboard = await storage.getDailyQuizLeaderboard(today);
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
  });

  // News routes
  app.get('/api/news/today', async (req, res) => {
    try {
      const news = await newsService.getTodaysNews();
      if (!news) {
        return res.status(404).json({ error: 'No news available for today' });
      }
      res.json(news);
    } catch (error) {
      console.error('Error fetching today\'s news:', error);
      res.status(500).json({ message: 'Failed to fetch news' });
    }
  });

  // Metrics route
  app.get('/api/metrics', async (req, res) => {
    try {
      const conflicts = await storage.getConflicts();
      const stocks = await storage.getStocks();
      
      const activeConflicts = conflicts.filter(c => c.status === 'Active').length;
      const totalConflicts = conflicts.length;
      const defenseStocks = stocks.length;
      const avgStockChange = stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length;

      // Fetch iShares US Aerospace & Defense ETF (ITA)
      let defenseIndexData = null;
      try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/ITA`);
        const data = await response.json();
        
        if (data?.chart?.result?.[0]) {
          const result = data.chart.result[0];
          const meta = result.meta;
          const currentPrice = meta.regularMarketPrice || meta.previousClose;
          const previousClose = meta.previousClose;
          const change = currentPrice - previousClose;
          const changePercent = (change / previousClose) * 100;
          
          defenseIndexData = {
            price: currentPrice,
            change: change,
            changePercent: changePercent
          };
          console.log(`Successfully fetched iShares US Aerospace & Defense ETF (ITA): $${currentPrice.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
        }
      } catch (error) {
        console.log('Failed to fetch ITA ETF data, using fallback calculation');
        
        // Fallback: Calculate from major defense stocks
        const majorDefenseStocks = stocks.filter(stock => 
          ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'HWM', 'LDOS', 'LHX'].includes(stock.symbol)
        );
        
        if (majorDefenseStocks.length > 0) {
          const weights = {
            'LMT': 0.22, 'RTX': 0.20, 'NOC': 0.16, 'GD': 0.14, 'BA': 0.12,
            'HWM': 0.06, 'LDOS': 0.05, 'LHX': 0.05
          };
          
          let weightedPrice = 0;
          let weightedChange = 0;
          let totalWeight = 0;
          
          majorDefenseStocks.forEach(stock => {
            const weight = weights[stock.symbol as keyof typeof weights] || 0;
            weightedPrice += stock.price * weight;
            weightedChange += stock.changePercent * weight;
            totalWeight += weight;
          });
          
          defenseIndexData = {
            price: (weightedPrice / totalWeight) * 0.5, // Scale to ETF price range
            change: 0,
            changePercent: weightedChange / totalWeight
          };
          console.log(`Calculated Defense ETF estimate: $${defenseIndexData.price.toFixed(2)} (${defenseIndexData.changePercent >= 0 ? '+' : ''}${defenseIndexData.changePercent.toFixed(2)}%)`);
        }
      }

      // Calculate correlation score based on conflict severity and stock performance
      const calculateCorrelationScore = () => {
        const highSeverityConflicts = conflicts.filter(c => c.severity === 'High' || c.severity === 'Critical').length;
        const positiveStockPerformance = stocks.filter(s => s.changePercent > 0).length;
        
        // Higher correlation when high-severity conflicts correlate with positive defense stock performance
        const severityWeight = highSeverityConflicts / Math.max(totalConflicts, 1);
        const performanceWeight = positiveStockPerformance / Math.max(defenseStocks, 1);
        
        // Calculate correlation based on geopolitical tensions driving defense spending
        const baseCorrelation = 0.65; // Historical baseline
        const tensionMultiplier = severityWeight * 0.25;
        const performanceMultiplier = performanceWeight * 0.15;
        
        return Math.min(0.95, baseCorrelation + tensionMultiplier + performanceMultiplier);
      };

      const correlationScore = calculateCorrelationScore();

      res.json({
        activeConflicts,
        totalConflicts,
        defenseStocks,
        avgStockChange: parseFloat(avgStockChange.toFixed(2)),
        correlationScore: parseFloat(correlationScore.toFixed(2)),
        defenseIndex: defenseIndexData ? {
          value: parseFloat(defenseIndexData.price.toFixed(2)),
          change: parseFloat(defenseIndexData.change.toFixed(2)),
          changePercent: parseFloat(defenseIndexData.changePercent.toFixed(2))
        } : null
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  });

  // Notifications route
  app.get('/api/notifications', async (req, res) => {
    try {
      // Sample notifications for demo
      const notifications = [
        {
          id: 1,
          type: "conflict_update",
          title: "Ukraine Conflict Status Update",
          message: "Recent developments in Eastern Ukraine with defense stock implications",
          timestamp: new Date(),
          read: false,
          priority: "high"
        },
        {
          id: 2,
          type: "market_alert", 
          title: "Defense Sector Rally",
          message: "LMT, RTX showing strong performance (+2.5% avg)",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
          priority: "normal"
        },
        {
          id: 3,
          type: "ai_analysis",
          title: "Weekly Conflict Prediction Ready",
          message: "New AI analysis available for 12 active conflicts",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          read: true,
          priority: "normal"
        }
      ];
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send initial stock data
    storage.getStocks().then(stocks => {
      ws.send(JSON.stringify({ type: 'stocks', data: stocks }));
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
  
  // Broadcast stock updates to all connected clients
  const broadcastStockUpdate = async () => {
    const stocks = await storage.getStocks();
    const message = JSON.stringify({ type: 'stocks', data: stocks });
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  // Set up periodic stock updates broadcast
  setInterval(broadcastStockUpdate, 30000); // Every 30 seconds
  
  return httpServer;
}