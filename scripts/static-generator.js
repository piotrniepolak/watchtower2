#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

class StaticSiteGenerator {
  constructor() {
    this.outputDir = path.join(rootDir, 'static-dist');
    this.dataDir = path.join(this.outputDir, 'data');
    this.serverUrl = process.env.STATIC_SERVER_URL || 'http://localhost:5000';
  }

  async init() {
    console.log('🚀 Starting static site generation...');
    
    // Clean and create output directories
    await this.cleanOutputDir();
    await this.createDirectories();
    
    // Start the server temporarily for data extraction
    const serverProcess = await this.startTempServer();
    
    try {
      // Wait for server to be ready
      await this.waitForServer();
      
      // Extract all dynamic data
      await this.extractData();
      
      // Build the static frontend
      await this.buildStaticSite();
      
      // Generate static pages
      await this.generateStaticPages();
      
      // Copy assets and configuration
      await this.copyAssets();
      
      // Generate deployment scripts
      await this.generateDeploymentScripts();
      
      console.log('✅ Static site generation completed successfully!');
      console.log(`📁 Output directory: ${this.outputDir}`);
      
    } finally {
      // Clean up server process
      if (serverProcess) {
        serverProcess.kill();
      }
    }
  }

  async cleanOutputDir() {
    try {
      await fs.rm(this.outputDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, ignore
    }
  }

  async createDirectories() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'assets'), { recursive: true });
  }

  async startTempServer() {
    return new Promise((resolve, reject) => {
      console.log('🔧 Starting temporary server for data extraction...');
      const serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: rootDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'development' }
      });

      let serverReady = false;
      
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') || output.includes('localhost:5000')) {
          serverReady = true;
          resolve(serverProcess);
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.log('Server:', data.toString());
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!serverReady) {
          serverProcess.kill();
          reject(new Error('Server failed to start within 30 seconds'));
        }
      }, 30000);
    });
  }

  async waitForServer() {
    console.log('⏳ Waiting for server to be ready...');
    let retries = 0;
    const maxRetries = 30;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch(`${this.serverUrl}/api/conflicts`);
        if (response.ok) {
          console.log('✅ Server is ready');
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }
    
    throw new Error('Server failed to become ready');
  }

  async extractData() {
    console.log('📊 Extracting dynamic data...');
    
    const endpoints = [
      { name: 'conflicts', url: '/api/conflicts' },
      { name: 'stocks', url: '/api/stocks' },
      { name: 'metrics', url: '/api/metrics' },
      { name: 'notifications', url: '/api/notifications' },
      { name: 'correlation-events', url: '/api/correlation-events' },
      { name: 'quiz', url: '/api/quiz/today' },
      { name: 'news', url: '/api/news/today' }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`  Fetching ${endpoint.name}...`);
        const response = await fetch(`${this.serverUrl}${endpoint.url}`);
        const data = await response.json();
        
        await fs.writeFile(
          path.join(this.dataDir, `${endpoint.name}.json`),
          JSON.stringify(data, null, 2)
        );
      } catch (error) {
        console.warn(`  ⚠️  Failed to fetch ${endpoint.name}:`, error.message);
        // Create empty fallback
        await fs.writeFile(
          path.join(this.dataDir, `${endpoint.name}.json`),
          JSON.stringify({}, null, 2)
        );
      }
    }

    // Generate metadata
    const metadata = {
      generatedAt: new Date().toISOString(),
      version: Date.now(),
      lastUpdate: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(this.dataDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
  }

  async buildStaticSite() {
    console.log('🔨 Building static frontend...');
    
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: rootDir,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });

      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Build process failed with code ${code}`));
        }
      });
    });
  }

  async generateStaticPages() {
    console.log('📄 Generating static pages...');
    
    // Copy built frontend files
    const distDir = path.join(rootDir, 'dist');
    await this.copyDirectory(distDir, this.outputDir);
  }

  async copyDirectory(src, dest) {
    try {
      const entries = await fs.readdir(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          await fs.mkdir(destPath, { recursive: true });
          await this.copyDirectory(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    } catch (error) {
      console.warn(`Failed to copy ${src}:`, error.message);
    }
  }

  async copyAssets() {
    console.log('📋 Copying additional assets...');
    
    // Copy any additional assets from client/public if it exists
    const publicDir = path.join(rootDir, 'client/public');
    try {
      await this.copyDirectory(publicDir, this.outputDir);
    } catch (error) {
      // Public directory doesn't exist, skip
    }
  }

  async generateDeploymentScripts() {
    console.log('🚀 Generating deployment scripts...');
    
    // Generate upload script for various hosting providers
    const uploadScript = `#!/bin/bash

# Static Site Upload Script
# Generated automatically by Replit CMS

set -e

STATIC_DIR="${this.outputDir}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🚀 Starting deployment at $TIMESTAMP"

# Check if static files exist
if [ ! -d "$STATIC_DIR" ]; then
    echo "❌ Static files not found. Run 'npm run generate:static' first."
    exit 1
fi

# Upload method selection
case "$1" in
    "rsync")
        # Example: ./upload.sh rsync user@server:/var/www/html
        if [ -z "$2" ]; then
            echo "Usage: $0 rsync user@server:/path/to/webroot"
            exit 1
        fi
        echo "📤 Uploading via rsync to $2"
        rsync -avz --delete "$STATIC_DIR/" "$2/"
        ;;
    "scp")
        # Example: ./upload.sh scp user@server:/var/www/html
        if [ -z "$2" ]; then
            echo "Usage: $0 scp user@server:/path/to/webroot"
            exit 1
        fi
        echo "📤 Uploading via scp to $2"
        scp -r "$STATIC_DIR"/* "$2/"
        ;;
    "s3")
        # Example: ./upload.sh s3 my-bucket-name
        if [ -z "$2" ]; then
            echo "Usage: $0 s3 bucket-name"
            exit 1
        fi
        echo "📤 Uploading to S3 bucket $2"
        aws s3 sync "$STATIC_DIR/" "s3://$2/" --delete
        ;;
    "netlify")
        echo "📤 Uploading to Netlify"
        npx netlify deploy --prod --dir="$STATIC_DIR"
        ;;
    "vercel")
        echo "📤 Uploading to Vercel"
        npx vercel --prod "$STATIC_DIR"
        ;;
    *)
        echo "Usage: $0 [rsync|scp|s3|netlify|vercel] [destination]"
        echo ""
        echo "Examples:"
        echo "  $0 rsync user@myserver.com:/var/www/html"
        echo "  $0 scp user@myserver.com:/var/www/html"
        echo "  $0 s3 my-website-bucket"
        echo "  $0 netlify"
        echo "  $0 vercel"
        exit 1
        ;;
esac

echo "✅ Deployment completed successfully at $(date)"
`;

    await fs.writeFile(path.join(rootDir, 'upload.sh'), uploadScript);
    await fs.chmod(path.join(rootDir, 'upload.sh'), 0o755);

    // Generate sync script for automated updates
    const syncScript = `#!/bin/bash

# Automated Sync Script
# Run this script periodically (e.g., via cron) to sync changes

set -e

echo "🔄 Starting automated sync at $(date)"

# Generate new static files
npm run generate:static

# Upload to your server (customize the upload command below)
# Uncomment and modify one of these lines:

# For rsync:
# ./upload.sh rsync user@yourserver.com:/var/www/html

# For S3:
# ./upload.sh s3 your-bucket-name

# For other providers:
# ./upload.sh netlify
# ./upload.sh vercel

echo "✅ Sync completed at $(date)"
`;

    await fs.writeFile(path.join(rootDir, 'sync.sh'), syncScript);
    await fs.chmod(path.join(rootDir, 'sync.sh'), 0o755);

    // Generate cron job helper
    const cronHelper = `# Add this to your crontab to automatically sync every hour
# Run: crontab -e
# Add: 0 * * * * cd ${rootDir} && ./sync.sh >> sync.log 2>&1

# Or sync every 6 hours:
# 0 */6 * * * cd ${rootDir} && ./sync.sh >> sync.log 2>&1

# Or sync daily at 2 AM:
# 0 2 * * * cd ${rootDir} && ./sync.sh >> sync.log 2>&1
`;

    await fs.writeFile(path.join(rootDir, 'cron-example.txt'), cronHelper);
  }
}

// Run the generator if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new StaticSiteGenerator();
  generator.init().catch(console.error);
}

export default StaticSiteGenerator;