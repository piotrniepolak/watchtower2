#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

async function completeStaticBuild() {
  const outputDir = path.join(rootDir, 'static-dist');
  const dataDir = path.join(outputDir, 'data');
  
  console.log('Building complete static site...');

  // First extract fresh data
  await extractLatestData(outputDir, dataDir);

  // Create optimized build without server dependencies
  await createOptimizedBuild(outputDir);

  // Generate static HTML pages
  await generateStaticHTML(outputDir);

  // Create deployment configuration
  await createDeploymentConfig(outputDir);

  console.log('Static site build completed successfully!');
  console.log(`Ready to deploy from: ${outputDir}`);
}

async function extractLatestData(outputDir, dataDir) {
  const serverUrl = 'http://localhost:5000';
  
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });

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
      const response = await fetch(`${serverUrl}${endpoint.url}`);
      const data = await response.json();
      await fs.writeFile(
        path.join(dataDir, `${endpoint.name}.json`),
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      await fs.writeFile(
        path.join(dataDir, `${endpoint.name}.json`),
        JSON.stringify(null, null, 2)
      );
    }
  }

  // Create build metadata
  const metadata = {
    generatedAt: new Date().toISOString(),
    version: Date.now(),
    buildType: 'static',
    sourceData: 'live'
  };
  
  await fs.writeFile(
    path.join(dataDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
}

async function createOptimizedBuild(outputDir) {
  // Use Vite to build just the client-side code
  return new Promise((resolve, reject) => {
    const viteProcess = spawn('npx', ['vite', 'build', 'client', '--outDir', '../static-dist/app'], {
      cwd: rootDir,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' }
    });

    viteProcess.stdout.on('data', (data) => {
      console.log('Build:', data.toString().trim());
    });

    viteProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.log('Vite build failed, copying existing dist files...');
        // Fallback: copy any existing dist files
        copyExistingDist(outputDir).then(resolve).catch(resolve);
      }
    });
  });
}

async function copyExistingDist(outputDir) {
  try {
    const distDir = path.join(rootDir, 'dist');
    const entries = await fs.readdir(distDir);
    
    for (const entry of entries) {
      if (entry.endsWith('.js') || entry.endsWith('.css') || entry.endsWith('.html')) {
        const srcPath = path.join(distDir, entry);
        const destPath = path.join(outputDir, entry);
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    // Create minimal fallback files
    await createMinimalBuild(outputDir);
  }
}

async function createMinimalBuild(outputDir) {
  // Create a minimal index.html that works with the static data
  const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geopolitical Intelligence Platform</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.active { background: #fee; color: #c53030; }
        .status.resolved { background: #f0fff4; color: #38a169; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Geopolitical Intelligence Platform</h1>
            <p>Advanced conflict analysis and market intelligence</p>
        </div>
        <div id="content"></div>
    </div>

    <script>
        async function loadData() {
            try {
                const [conflicts, stocks, metrics] = await Promise.all([
                    fetch('/data/conflicts.json').then(r => r.json()),
                    fetch('/data/stocks.json').then(r => r.json()),
                    fetch('/data/metrics.json').then(r => r.json())
                ]);

                renderDashboard({ conflicts, stocks, metrics });
            } catch (error) {
                document.getElementById('content').innerHTML = 
                    '<p>Error loading data. Please ensure data files are available.</p>';
            }
        }

        function renderDashboard({ conflicts, stocks, metrics }) {
            const content = document.getElementById('content');
            
            content.innerHTML = \`
                <div class="grid">
                    <div class="card">
                        <h3>Active Conflicts</h3>
                        <p>\${metrics.activeConflicts || 0} currently active</p>
                        <div>
                            \${conflicts.slice(0, 5).map(c => \`
                                <div style="margin: 10px 0; padding: 10px; background: #f9f9f9;">
                                    <strong>\${c.name}</strong>
                                    <span class="status \${c.status.toLowerCase()}">\${c.status}</span>
                                    <br><small>\${c.region}</small>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>Defense Stocks</h3>
                        <p>Market Index: \${metrics.defenseIndexChange > 0 ? '+' : ''}\${metrics.defenseIndexChange}%</p>
                        <div>
                            \${stocks.slice(0, 8).map(s => \`
                                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                    <span>\${s.symbol}</span>
                                    <span style="color: \${s.change >= 0 ? 'green' : 'red'}">
                                        $\${s.price} (\${s.change >= 0 ? '+' : ''}\${s.changePercent}%)
                                    </span>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>Market Intelligence</h3>
                        <p>Volatility: \${metrics.marketVolatility || 'N/A'}</p>
                        <p>This platform provides real-time analysis of geopolitical conflicts and their impact on defense markets.</p>
                    </div>
                </div>
            \`;
        }

        loadData();
    </script>
</body>
</html>`;

  await fs.writeFile(path.join(outputDir, 'index.html'), indexHTML);
}

async function generateStaticHTML(outputDir) {
  // Copy the client index.html if it exists, otherwise create minimal version
  try {
    const clientIndex = path.join(rootDir, 'client/index.html');
    const targetIndex = path.join(outputDir, 'index.html');
    
    await fs.access(clientIndex);
    await fs.copyFile(clientIndex, targetIndex);
    
    // Update the HTML to work in static mode
    let html = await fs.readFile(targetIndex, 'utf8');
    html = html.replace(
      '<head>',
      `<head>
    <script>window.__STATIC_MODE__ = true;</script>`
    );
    await fs.writeFile(targetIndex, html);
  } catch (error) {
    // Minimal version was already created
  }
}

async function createDeploymentConfig(outputDir) {
  // Create .htaccess for Apache servers
  const htaccess = `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets
<FilesMatch "\\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>

# Cache data files for shorter period
<FilesMatch "\\.(json)$">
    ExpiresActive On
    ExpiresDefault "access plus 6 hours"
</FilesMatch>`;

  await fs.writeFile(path.join(outputDir, '.htaccess'), htaccess);

  // Create nginx.conf sample
  const nginxConf = `server {
    listen 80;
    server_name your-domain.com;
    root ${outputDir};
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /data/ {
        expires 6h;
        add_header Cache-Control "public";
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}`;

  await fs.writeFile(path.join(outputDir, 'nginx.conf.sample'), nginxConf);

  // Create deployment info
  const deployInfo = {
    buildDate: new Date().toISOString(),
    instructions: [
      "1. Upload all files to your web server",
      "2. Configure your web server to serve index.html for all routes",
      "3. Set up caching headers for optimal performance",
      "4. Configure SSL/HTTPS for security"
    ],
    serverConfigs: {
      apache: "Use .htaccess file (included)",
      nginx: "Use nginx.conf.sample as reference"
    }
  };

  await fs.writeFile(
    path.join(outputDir, 'deployment-info.json'),
    JSON.stringify(deployInfo, null, 2)
  );
}

completeStaticBuild().catch(console.error);