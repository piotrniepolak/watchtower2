#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

async function quickStaticBuild() {
  const outputDir = path.join(rootDir, 'static-dist');
  const dataDir = path.join(outputDir, 'data');
  const serverUrl = 'http://localhost:5000';

  console.log('🚀 Quick static generation...');

  // Create directories
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });

  // Extract data from running server
  const endpoints = [
    { name: 'conflicts', url: '/api/conflicts' },
    { name: 'stocks', url: '/api/stocks' },
    { name: 'metrics', url: '/api/metrics' },
    { name: 'notifications', url: '/api/notifications' },
    { name: 'correlation-events', url: '/api/correlation-events' },
    { name: 'quiz', url: '/api/quiz/today' },
    { name: 'news', url: '/api/news/today' }
  ];

  console.log('📊 Extracting data...');
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${serverUrl}${endpoint.url}`);
      const data = await response.json();
      await fs.writeFile(
        path.join(dataDir, `${endpoint.name}.json`),
        JSON.stringify(data, null, 2)
      );
      console.log(`  ✓ ${endpoint.name}`);
    } catch (error) {
      console.log(`  ⚠ ${endpoint.name} failed`);
      await fs.writeFile(
        path.join(dataDir, `${endpoint.name}.json`),
        JSON.stringify({}, null, 2)
      );
    }
  }

  // Create metadata
  const metadata = {
    generatedAt: new Date().toISOString(),
    version: Date.now(),
    lastUpdate: new Date().toISOString()
  };
  
  await fs.writeFile(
    path.join(dataDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  // Copy existing dist files if they exist
  try {
    const distDir = path.join(rootDir, 'dist');
    const entries = await fs.readdir(distDir);
    
    for (const entry of entries) {
      const srcPath = path.join(distDir, entry);
      const destPath = path.join(outputDir, entry);
      
      try {
        await fs.cp(srcPath, destPath, { recursive: true });
      } catch (error) {
        // Skip if can't copy
      }
    }
    console.log('📄 Copied build files');
  } catch (error) {
    console.log('⚠ No build files found, run "npm run build" first');
  }

  console.log('✅ Quick static generation completed!');
  console.log(`📁 Files in: ${outputDir}`);
}

quickStaticBuild().catch(console.error);