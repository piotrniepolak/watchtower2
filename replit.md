# Geopolitical Intelligence Platform

## Overview

This is a full-stack geopolitical intelligence platform built with React (frontend) and Express.js (backend) that provides real-time conflict analysis, defense market intelligence, and WHO health data visualization. The platform operates as both a dynamic application and a static site generator, allowing users to run a full CMS on Replit while deploying optimized static versions to external hosting providers.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Mapping**: Google Maps API integration via @googlemaps/js-api-loader
- **Data Visualization**: D3.js for geographic data visualization and React Simple Maps
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **External APIs**: 
  - Alpha Vantage for financial data
  - Google Maps API for geolocation services
  - Perplexity AI for content generation
- **Authentication**: JWT-based session management
- **Deployment**: Designed for Replit with auto-scaling capabilities

### Static Site Generation
- **Hybrid Architecture**: Dynamic CMS on Replit + Static deployment capability
- **Build Process**: Node.js script that extracts live data and generates optimized static files
- **Deployment Options**: Multiple deployment targets (rsync, S3, Netlify, Vercel)

## Key Components

### Core Features
1. **Conflict Tracking**: Real-time geopolitical conflict monitoring and analysis
2. **Defense Market Intelligence**: Live defense stock prices and market analysis
3. **WHO Health Data Visualization**: Interactive world health maps with authentic WHO statistical data
4. **Daily Questions**: AI-generated sector-specific discussion prompts
5. **Correlation Analysis**: Market-conflict correlation tracking
6. **News Aggregation**: Curated geopolitical news feeds

### Data Management
- **WHO Data**: Authentic statistical data from WHO Statistical Annex covering 196 countries
- **Financial Data**: Real-time defense sector stock prices via Alpha Vantage API
- **Conflict Data**: Structured conflict tracking with geographic coordinates
- **User-Generated Content**: Discussion forums and community features

### Static Generation Pipeline
- **Data Extraction**: Automated extraction of live data from running Replit instance
- **Optimization**: Static HTML/CSS/JS generation with pre-built data files
- **Multi-Deployment**: Support for various hosting platforms with automated sync

## Data Flow

1. **Live Data Ingestion**: External APIs → Backend Services → Database
2. **Real-time Updates**: Database → WebSocket/HTTP → Frontend Components
3. **Static Generation**: Live Database → Build Script → Static Files → Deployment
4. **User Interactions**: Frontend → API Routes → Database → Response

## External Dependencies

### APIs
- **Google Maps API**: Geolocation and mapping services (VITE_GOOGLE_MAPS_API_KEY)
- **Alpha Vantage**: Financial market data (VITE_ALPHA_VANTAGE_API_KEY)
- **Perplexity AI**: Content generation for discussions and analysis

### Database
- **PostgreSQL**: Primary data store (configured via DATABASE_URL)
- **Drizzle ORM**: Type-safe database operations with migration support

### Development Tools
- **Replit Environment**: nodejs-20, web, postgresql-16, python-3.11 modules
- **Build Tools**: Vite, ESBuild, TypeScript compiler
- **UI Framework**: shadcn/ui component library

## Deployment Strategy

### Dual-Mode Operation
1. **Dynamic Mode**: Full-featured application running on Replit
   - Real-time data updates
   - User authentication and sessions
   - Database operations
   - AI-powered content generation

2. **Static Mode**: Pre-generated static site for external hosting
   - Optimized performance
   - Reduced hosting costs
   - CDN compatibility
   - High availability

### Deployment Methods
- **Interactive Deployment**: `deploy-interactive.sh` with multiple hosting options
- **Automated Sync**: Cron-based updates via `auto-sync-configured.sh`
- **Manual Deployment**: Direct command-line tools for rsync, S3, SCP, Netlify, Vercel

### Build Process
1. Generate static site: `node build-static-site.js`
2. Extract live data from running Replit application
3. Create optimized static files in `static-site/` directory
4. Deploy using preferred method
5. Optional: Set up automated sync for regular updates

## Changelog
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.