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

### June 13, 2025 - Enhanced Pharmaceutical Company Extraction
**Major Enhancement Completed:**
- **Enhanced pharmaceutical company extraction logic** to comprehensively scan all sections of daily pharmaceutical intelligence brief
- **Expanded company-to-symbol mapping** with 30+ additional pharmaceutical companies including biotechnology, life sciences, and contract research organizations
- **Implemented comprehensive fallback logic** to identify companies mentioned in any content section through multiple detection methods
- **Added deep content analysis** for broader pharmaceutical company detection using company name word matching
- **Fixed variable declaration conflicts** and server compilation errors in perplexity service
- **Verified extraction accuracy** showing 7-14 pharmaceutical companies now properly identified from brief content

**Technical Implementation:**
- Updated `extractCompanyMentions()` function with enhanced regex patterns for 60+ pharmaceutical companies
- Enhanced `generatePharmaceuticalStockAnalysis()` to scan executive summary, key developments, market impact, regulatory analysis, and health crisis updates
- Added direct symbol detection and cross-reference with healthcare stocks database
- Implemented multi-tier fallback logic ensuring companies are always identified from content
- Added comprehensive logging for debugging and verification of extraction process

**User Impact:**
- "Pharmaceutical Stocks Mentioned in this Brief" section now accurately displays companies found throughout entire intelligence brief
- Real-time stock pricing data integration for all extracted pharmaceutical companies
- Enhanced analysis quality with broader company coverage and more accurate identification

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