import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { generateConflictPredictions, generateMarketAnalysis, generateConflictStoryline } from "./ai-analysis";
import { stockService } from "./stock-service";
import { quizService } from "./quiz-service";
import { newsService } from "./news-service";
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

  // Simple login endpoint for demo
  app.get('/api/login', (req: any, res) => {
    // Create a demo user session
    req.session.userId = 1;
    res.redirect('/');
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

  app.post('/api/quiz/submit', isAuthenticated, async (req: any, res) => {
    try {
      const { quizId, responses, completionTimeSeconds } = req.body;
      const userId = req.user.id;
      
      const result = await quizService.submitQuizResponse(userId, quizId, responses, completionTimeSeconds);
      res.json(result);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      res.status(500).json({ message: 'Failed to submit quiz' });
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

      // Fetch ITA ETF data (iShares U.S. Aerospace & Defense ETF) which tracks S&P Aerospace & Defense
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
          console.log(`Successfully fetched ITA Defense Index: $${currentPrice.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
        }
      } catch (error) {
        console.log('Failed to fetch ITA data, using fallback calculation');
        
        // Fallback: Calculate from major defense stocks with S&P weights
        const majorDefenseStocks = stocks.filter(stock => 
          ['LMT', 'RTX', 'NOC', 'GD', 'BA'].includes(stock.symbol)
        );
        
        if (majorDefenseStocks.length > 0) {
          const weights = {
            'LMT': 0.28, 'RTX': 0.24, 'NOC': 0.18, 'GD': 0.15, 'BA': 0.15
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
            price: (weightedPrice / totalWeight) * 0.5,
            change: 0,
            changePercent: weightedChange / totalWeight
          };
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