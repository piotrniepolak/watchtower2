#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, 'static-site');
const dataDir = path.join(outputDir, 'data');

async function buildStaticSite() {
  console.log('Building static site for deployment...');

  // Create output directories
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });

  // Extract live data from your running server
  await extractLiveData();
  
  // Create optimized static HTML
  await createStaticHTML();
  
  // Create deployment files
  await createDeploymentFiles();
  
  console.log('Static site ready for deployment!');
  console.log(`Location: ${outputDir}`);
  console.log('Use the upload scripts to deploy to your server.');
}

async function extractLiveData() {
  const serverUrl = 'http://localhost:5000';
  const endpoints = [
    'conflicts', 'stocks', 'metrics', 'notifications', 
    'correlation-events', 'quiz/today', 'news/today'
  ];

  console.log('Extracting live data...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${serverUrl}/api/${endpoint}`);
      const data = await response.json();
      const filename = endpoint.replace('/', '-') + '.json';
      
      await fs.writeFile(
        path.join(dataDir, filename),
        JSON.stringify(data, null, 2)
      );
      console.log(`✓ ${endpoint}`);
    } catch (error) {
      console.log(`⚠ ${endpoint} - using fallback`);
      await fs.writeFile(
        path.join(dataDir, endpoint.replace('/', '-') + '.json'),
        JSON.stringify(null)
      );
    }
  }

  // Create metadata
  await fs.writeFile(
    path.join(dataDir, 'build-info.json'),
    JSON.stringify({
      buildTime: new Date().toISOString(),
      version: Date.now(),
      dataSource: 'live-replit'
    }, null, 2)
  );
}

async function createStaticHTML() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geopolitical Intelligence Platform</title>
    <meta name="description" content="Advanced geopolitical intelligence platform with real-time conflict analysis and defense market insights">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; color: #333; background: #f8fafc;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 40px 20px; text-align: center; margin-bottom: 30px;
            border-radius: 12px;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { 
            background: white; border-radius: 12px; padding: 25px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;
        }
        .card h3 { color: #2d3748; margin-bottom: 15px; font-size: 1.3rem; }
        .metric-value { font-size: 2rem; font-weight: bold; color: #4299e1; margin-bottom: 5px; }
        .conflict-item, .stock-item { 
            padding: 12px; margin: 8px 0; background: #f7fafc; 
            border-radius: 8px; border-left: 4px solid #e2e8f0;
        }
        .status-active { border-left-color: #f56565; }
        .status-resolved { border-left-color: #48bb78; }
        .stock-positive { color: #38a169; }
        .stock-negative { color: #e53e3e; }
        .loading { text-align: center; padding: 40px; }
        .error { color: #e53e3e; text-align: center; padding: 20px; }
        .last-updated { 
            text-align: center; color: #718096; font-size: 0.9rem; 
            margin-top: 30px; padding: 20px; background: white; border-radius: 8px;
        }
        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
            .header h1 { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Geopolitical Intelligence Platform</h1>
            <p>Real-time conflict analysis and defense market intelligence</p>
        </div>
        
        <div id="loading" class="loading">
            <p>Loading intelligence data...</p>
        </div>
        
        <div id="content" style="display: none;"></div>
        
        <div id="error" class="error" style="display: none;">
            <p>Unable to load data. Please check that data files are accessible.</p>
        </div>
        
        <div id="last-updated" class="last-updated" style="display: none;"></div>
    </div>

    <script>
        async function loadIntelligenceData() {
            try {
                const [conflicts, stocks, metrics, news, buildInfo] = await Promise.all([
                    fetch('./data/conflicts.json').then(r => r.json()).catch(() => []),
                    fetch('./data/stocks.json').then(r => r.json()).catch(() => []),
                    fetch('./data/metrics.json').then(r => r.json()).catch(() => ({})),
                    fetch('./data/news-today.json').then(r => r.json()).catch(() => null),
                    fetch('./data/build-info.json').then(r => r.json()).catch(() => ({}))
                ]);

                displayIntelligence({ conflicts, stocks, metrics, news, buildInfo });
                
            } catch (error) {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
            }
        }

        function displayIntelligence({ conflicts, stocks, metrics, news, buildInfo }) {
            const content = document.getElementById('content');
            const loading = document.getElementById('loading');
            const lastUpdated = document.getElementById('last-updated');
            
            const activeConflicts = conflicts.filter(c => c.status === 'Active');
            const topStocks = stocks.slice(0, 8);
            
            content.innerHTML = \`
                <div class="grid">
                    <div class="card">
                        <h3>🌍 Global Conflicts</h3>
                        <div class="metric-value">\${activeConflicts.length}</div>
                        <p>Active conflicts monitored</p>
                        <div style="margin-top: 15px;">
                            \${activeConflicts.slice(0, 4).map(conflict => \`
                                <div class="conflict-item status-\${conflict.status.toLowerCase()}">
                                    <strong>\${conflict.name}</strong>
                                    <div style="font-size: 0.9rem; color: #718096;">
                                        \${conflict.region} • \${conflict.severity} severity
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>📈 Defense Markets</h3>
                        <div class="metric-value \${metrics.defenseIndexChange >= 0 ? 'stock-positive' : 'stock-negative'}">
                            \${metrics.defenseIndexChange >= 0 ? '+' : ''}\${(metrics.defenseIndexChange || 0).toFixed(2)}%
                        </div>
                        <p>Defense sector performance</p>
                        <div style="margin-top: 15px;">
                            \${topStocks.map(stock => \`
                                <div class="stock-item">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span><strong>\${stock.symbol}</strong></span>
                                        <span class="\${stock.change >= 0 ? 'stock-positive' : 'stock-negative'}">
                                            $\${stock.price} (\${stock.change >= 0 ? '+' : ''}\${stock.changePercent}%)
                                        </span>
                                    </div>
                                    <div style="font-size: 0.8rem; color: #718096;">\${stock.name}</div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>🎯 Intelligence Summary</h3>
                        <div class="metric-value">\${conflicts.length}</div>
                        <p>Total conflicts tracked</p>
                        <div style="margin-top: 15px;">
                            <div class="conflict-item">
                                <strong>Market Volatility</strong>
                                <div style="color: #718096;">Current: \${metrics.marketVolatility || 'Normal'}</div>
                            </div>
                            <div class="conflict-item">
                                <strong>Risk Assessment</strong>
                                <div style="color: #718096;">AI-powered analysis active</div>
                            </div>
                        </div>
                    </div>
                    
                    \${news ? \`
                    <div class="card">
                        <h3>📰 Latest Intelligence</h3>
                        <div style="line-height: 1.6;">
                            <strong>\${news.title}</strong>
                            <p style="margin-top: 10px; color: #4a5568;">\${news.summary || 'Daily intelligence briefing available'}</p>
                        </div>
                    </div>
                    \` : ''}
                </div>
            \`;
            
            lastUpdated.innerHTML = \`
                <p>Last updated: \${new Date(buildInfo.buildTime || Date.now()).toLocaleString()}</p>
                <p>Data source: Live Replit CMS • Static deployment ready</p>
            \`;
            
            loading.style.display = 'none';
            content.style.display = 'block';
            lastUpdated.style.display = 'block';
        }

        // Load data when page loads
        loadIntelligenceData();
    </script>
</body>
</html>`;

  await fs.writeFile(path.join(outputDir, 'index.html'), html);
}

async function createDeploymentFiles() {
  // Create upload script
  const uploadScript = `#!/bin/bash
# Upload static site to your server

SITE_DIR="./static-site"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

if [ ! -d "$SITE_DIR" ]; then
    echo "Error: Run node build-static-site.js first"
    exit 1
fi

case "$1" in
    "rsync")
        if [ -z "$2" ]; then
            echo "Usage: $0 rsync user@server:/path/to/webroot"
            exit 1
        fi
        echo "Uploading to $2 via rsync..."
        rsync -avz --delete "$SITE_DIR/" "$2/"
        ;;
    "s3")
        if [ -z "$2" ]; then
            echo "Usage: $0 s3 bucket-name"
            exit 1
        fi
        echo "Uploading to S3 bucket $2..."
        aws s3 sync "$SITE_DIR/" "s3://$2/" --delete
        ;;
    "scp")
        if [ -z "$2" ]; then
            echo "Usage: $0 scp user@server:/path/to/webroot"
            exit 1
        fi
        echo "Uploading to $2 via scp..."
        scp -r "$SITE_DIR"/* "$2/"
        ;;
    *)
        echo "Usage: $0 [rsync|s3|scp] [destination]"
        echo "Examples:"
        echo "  $0 rsync user@myserver.com:/var/www/html"
        echo "  $0 s3 my-website-bucket"
        echo "  $0 scp user@myserver.com:/var/www/html"
        ;;
esac

echo "Deployment completed at $(date)"`;

  await fs.writeFile(path.join(__dirname, 'deploy.sh'), uploadScript);
  await fs.chmod(path.join(__dirname, 'deploy.sh'), 0o755);

  // Create automated sync script
  const syncScript = `#!/bin/bash
# Automated sync script for periodic updates

echo "Starting sync at $(date)"

# Rebuild static site with latest data
node build-static-site.js

# Deploy (customize the line below for your server)
# ./deploy.sh rsync user@yourserver.com:/var/www/html
# ./deploy.sh s3 your-bucket-name

echo "Sync completed at $(date)"`;

  await fs.writeFile(path.join(__dirname, 'auto-sync.sh'), syncScript);
  await fs.chmod(path.join(__dirname, 'auto-sync.sh'), 0o755);

  // Create server configuration files
  const htaccess = `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

<FilesMatch "\\.(json)$">
    Header set Cache-Control "max-age=21600"
</FilesMatch>`;

  await fs.writeFile(path.join(outputDir, '.htaccess'), htaccess);

  // Create README
  const readme = `# Geopolitical Intelligence Platform - Static Deployment

## Quick Start

1. **Generate Static Site**
   \`\`\`bash
   node build-static-site.js
   \`\`\`

2. **Deploy to Your Server**
   \`\`\`bash
   # For rsync deployment
   ./deploy.sh rsync user@yourserver.com:/var/www/html
   
   # For S3 deployment
   ./deploy.sh s3 your-bucket-name
   
   # For SCP deployment
   ./deploy.sh scp user@yourserver.com:/var/www/html
   \`\`\`

3. **Set Up Automated Updates**
   Edit auto-sync.sh and add to cron:
   \`\`\`bash
   # Sync every 6 hours
   0 */6 * * * cd /path/to/project && ./auto-sync.sh >> sync.log 2>&1
   \`\`\`

## Files Generated

- \`static-site/\` - Complete static website
- \`static-site/data/\` - Live data from Replit CMS
- \`static-site/index.html\` - Optimized static HTML
- \`deploy.sh\` - Upload script
- \`auto-sync.sh\` - Automated sync script

The static site includes real-time conflict data, defense stock prices, and AI-generated intelligence summaries extracted from your Replit CMS.`;

  await fs.writeFile(path.join(__dirname, 'README.md'), readme);
}

buildStaticSite().catch(console.error);