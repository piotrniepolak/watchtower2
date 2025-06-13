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

### June 13, 2025 - Moved Global Intelligence Center to Top and Implemented Dedicated Reference Sections
**Major User Experience Enhancement:**
- **Moved Global Intelligence Center to the top of the homepage** for prominent positioning and immediate access to AI-powered predictive analysis
- **Implemented dedicated reference sections for each intelligence brief part** replacing inline "Sources:" text with clean, separate clickable reference sections
- **Created IntelligenceSourceLinks component** providing section-specific source references with professional styling
- **Enhanced backend to provide separate source references** for each section (summary, key developments, conflict updates, market impact, geopolitical analysis)
- **Updated pharmaceutical intelligence brief** to use dedicated reference sections with clickable buttons instead of embedded text links

**Technical Implementation:**
- Restructured homepage layout placing Global Intelligence Center at top after hero section but before global stats
- Built IntelligenceSourceLinks component with favicon integration and section-specific reference handling
- Updated perplexity-service.ts to provide structured references object for each intelligence brief section
- Modified pharmaceutical intelligence brief component to use formatContentWithSources function with dedicated reference sections
- Implemented clean content display without inline source text, followed by professional clickable reference buttons

**User Impact:**
- Global Intelligence Center immediately visible at top of homepage for quick access to AI analysis
- Each intelligence brief section has its own dedicated reference section with clickable source buttons
- Clean content presentation without embedded "Sources:" text disrupting readability
- Professional source attribution with visual indicators and easy external link access
- Consistent reference format across all intelligence brief sections

### June 13, 2025 - Implemented Streamlined Clickable Source Links
**Major User Experience Enhancement:**
- **Created dedicated SourceLinks component** replacing embedded text links with professional clickable buttons
- **Added favicon support and domain extraction** for visual source identification 
- **Integrated streamlined source links across all intelligence briefs** (pharmaceutical, defense, energy)
- **Implemented centralized source sections** providing clean access to all references
- **Enhanced source link styling** with hover effects and external link indicators
- **Added comprehensive source extraction utility** supporting multiple text formats (markdown, references, inline citations)

**Technical Implementation:**
- Built reusable SourceLinks component with favicon integration and domain parsing
- Added extractSourcesFromText utility supporting markdown links, reference sections, and direct URLs
- Replaced all inline source links in pharmaceutical and defense intelligence briefs
- Implemented consistent source link styling across all components
- Added centralized source sections at bottom of each intelligence brief

**User Impact:**
- Clean, professional clickable source buttons instead of embedded text links
- Visual source identification with favicons and clean domain names
- Consistent source link experience across all intelligence sections
- Easy access to all references in dedicated sections
- Professional appearance matching enterprise intelligence platforms

### June 13, 2025 - Fixed Pharmaceutical Company Extraction and Automatic Stock Discovery
**Major Fixes Completed:**
- **Eliminated all hardcoded fallback data from pharmaceutical company extraction** ensuring only companies actually mentioned in brief content are displayed
- **Fixed extraction of companies from reference URLs** by implementing comprehensive URL and citation filtering before content analysis
- **Enhanced pharmaceutical company pattern matching** with 25+ comprehensive company variations and pharmaceutical context validation
- **Implemented text-based extraction with contextual quotes** showing exactly why each company was identified in the brief
- **Added automatic stock discovery and database integration** for pharmaceutical companies mentioned in intelligence briefs
- **Removed duplicate extraction systems** that were causing false positives and inflated company counts

**Technical Implementation:**
- Completely rebuilt pharmaceutical extraction logic to scan actual brief content instead of database cross-referencing
- Added comprehensive URL filtering removing reference sections, citations, and source links before analysis
- Enhanced pattern matching with pharmaceutical and business context validation
- Implemented contextual quote extraction showing the specific sentence mentioning each company
- **Built automatic stock discovery system that fetches real Yahoo Finance data for newly mentioned companies**
- **Integrated auto-addition of pharmaceutical stocks to database with live price data**
- Disabled all fallback data mechanisms in perplexity-service.ts and routes.ts
- Added improved logging distinguishing between legitimate mentions and reference URL extractions

**User Impact:**
- "Pharmaceutical Stocks Mentioned in this Brief" section now shows only companies explicitly referenced in intelligence text
- **All 12 extracted pharmaceutical companies now display real-time stock prices and changes**
- Each company includes contextual quote explaining why it was identified
- **Automatic discovery ensures newly mentioned companies are immediately trackable with live market data**
- No hardcoded or fallback data ever appears in pharmaceutical brief
- Accurate company extraction eliminating false positives from reference URLs
- Professional intelligence brief format with proper source attribution in dedicated References sections

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