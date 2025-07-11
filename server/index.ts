import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { newsService } from "./news-service";
import { stockService } from "./stock-service";
import { conflictTimelineService } from "./conflict-timeline-service";
import { chatCleanupService } from "./chat-cleanup-service";
import { dailyQuestionService } from "./daily-question-service";

// Make environment variables available to Vite frontend
process.env.VITE_GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
process.env.VITE_ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const { registerRoutes } = await import('./routes.js');
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    // Start daily news scheduler
    newsService.startDailyNewsScheduler();
    // Start real-time stock updates
    stockService.startRealTimeUpdates();
    // Start real-time conflict timeline updates
    conflictTimelineService.startRealTimeUpdates();
    // Start automated daily questions
    dailyQuestionService.scheduleNextGeneration();
    // Initialize daily brief scheduler
    const { dailyBriefScheduler } = await import('./daily-brief-scheduler.js');
    console.log('Daily intelligence brief scheduler started');
    
    const cron = await import('node-cron');
    cron.schedule('0 0 * * *', async () => {
      console.log('🕛 Starting midnight Trefis cache priming...');
      try {
        const sectors = ['defense', 'health', 'energy'];
        const types = ['actionable', 'featured'];
        
        for (const sector of sectors) {
          for (const type of types) {
            const url = `http://localhost:5000/api/trefis?sector=${sector}&type=${type}`;
            console.log(`📡 Priming cache: ${url}`);
            await fetch(url);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        console.log('✅ Trefis cache priming completed');
      } catch (error) {
        console.error('❌ Error during Trefis cache priming:', error);
      }
    }, {
      timezone: 'UTC'
    });
    console.log('🕛 Trefis cache priming cron job scheduled for midnight UTC');
  });
})();
