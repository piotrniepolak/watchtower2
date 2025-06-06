import type { Express } from "express";
import { createServer, type Server } from "http";
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

      res.json({
        activeConflicts,
        totalConflicts,
        defenseStocks,
        avgStockChange: parseFloat(avgStockChange.toFixed(2))
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
  return httpServer;
}