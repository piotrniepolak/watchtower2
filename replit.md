# Watchtower: Multi-Domain Intelligence Platform

## Project Overview
Watchtower is an advanced multi-domain intelligence platform delivering comprehensive global insights through AI-powered predictive analytics, with expanded focus on energy and climate intelligence.

**Core Technologies:**
- React.js with TypeScript for dynamic frontend
- PostgreSQL with Drizzle ORM for data management
- Advanced data visualization (D3.js, Leaflet.js, Chart.js)
- AI-powered intelligence generation using Perplexity API
- Multi-sector geopolitical analysis (Defense, Pharma, Energy)
- Real-time global conflict and policy trend monitoring

## Recent Changes

### June 13, 2025 - Fixed References Display and Sector Separation
**Major Fixes Completed:**
- **Fixed cross-contamination between defense and pharmaceutical intelligence briefs** through complete database architecture separation with sector-specific unique constraints
- **Transformed references from inline URLs to clean, clickable "References" sections** matching professional intelligence brief format requirements
- **Enhanced pharmaceutical company extraction logic** to comprehensively scan all sections of daily pharmaceutical intelligence brief with 60+ company patterns
- **Implemented sector-specific database operations** preventing data overwriting between defense and pharmaceutical intelligence services
- **Updated all content sections** to properly parse and display numbered reference links instead of embedded URLs

**Technical Implementation:**
- Added sector field to daily_news database schema with unique constraint on (date, sector)
- Updated all storage methods and API routes to include sector parameter for data separation
- Modified pharmaceutical intelligence brief component to parse **References:** markdown sections into clickable numbered links
- Enhanced executive summary, key developments, and market impact sections with proper reference formatting
- Fixed Perplexity service citation processing to generate clean markdown reference lists
- Updated all services (defense-news-service, pharma-news-service, defense-intelligence-service) to use sector-specific operations

**User Impact:**
- Defense and pharmaceutical intelligence briefs now save to separate database records, eliminating cross-contamination
- References appear as clean, numbered clickable links in dedicated "References" sections throughout all content areas
- Professional intelligence brief format matching industry standards with proper source attribution
- Enhanced pharmaceutical company extraction showing 7-14 companies properly identified from brief content

## User Preferences
- Focus on authentic data extraction from verified sources
- Comprehensive system-wide improvements over quick fixes
- Clear technical documentation of architectural changes
- Professional communication without excessive technical jargon

## Project Architecture
- **Frontend:** React.js with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend:** Express.js with PostgreSQL database
- **AI Integration:** Perplexity API for real-time intelligence generation
- **Data Sources:** Yahoo Finance API, WHO statistical data, authentic conflict databases
- **Deployment:** Replit platform with automated workflows