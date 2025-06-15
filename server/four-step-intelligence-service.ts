/**
 * Four-Step Source-Based Intelligence Methodology Service
 * 
 * This service implements the exact 4-step process:
 * 1. Identify exactly 20 news sources (15 sector + 5 general)
 * 2. Extract ALL articles published today/yesterday from these sources
 * 3. Use ONLY extracted articles to write 4 sections
 * 4. Include direct article URLs without modification
 * 
 * NO fallback mechanisms, NO synthetic content generation
 */

interface ExtractedArticle {
  title: string;
  url: string;
  source: string;
  publishDate: string;
  content: string;
}

interface FourStepIntelligenceBrief {
  executiveSummary: string;
  keyDevelopments: string[];
  marketImpactAnalysis: string;
  geopoliticalAnalysis: string;
  extractedArticles: ExtractedArticle[];
  sourceUrls: string[];
  methodologyUsed: 'four-step-authentic-extraction';
  generatedAt: string;
}

export class FourStepIntelligenceService {
  private readonly defenceSources = [
    'defensenews.com',
    'janes.com',
    'breakingdefense.com',
    'defenseone.com',
    'thedrive.com/the-war-zone',
    'military.com',
    'c4isrnet.com',
    'nationaldefensemagazine.org',
    'defensedaily.com',
    'insidedefense.com',
    'defensescoop.com',
    'armytimes.com',
    'navytimes.com',
    'airforcetimes.com',
    'spaceforcetimes.com'
  ];

  private readonly pharmaceuticalSources = [
    'statnews.com',
    'biopharmadive.com',
    'fiercepharma.com',
    'pharmalive.com',
    'pharmaceutical-technology.com',
    'drugdiscoverytrends.com',
    'fda.gov/news-events',
    'raps.org',
    'bioworld.com',
    'nature.com/nbt',
    'stm.sciencemag.org',
    'cell.com',
    'thelancet.com',
    'nejm.org',
    'pharmavoice.com'
  ];

  private readonly generalSources = [
    'reuters.com',
    'apnews.com',
    'bloomberg.com',
    'wsj.com',
    'ft.com'
  ];

  private readonly perplexityApiKey = process.env.PERPLEXITY_API_KEY;

  constructor() {
    if (!this.perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY required for 4-step methodology');
    }
  }

  async generateDefenseIntelligence(): Promise<FourStepIntelligenceBrief> {
    const sources = [...this.defenceSources, ...this.generalSources];
    return this.executeStepByStepProcess('defense', sources);
  }

  async generatePharmaceuticalIntelligence(): Promise<FourStepIntelligenceBrief> {
    const sources = [...this.pharmaceuticalSources, ...this.generalSources];
    return this.executeStepByStepProcess('pharmaceutical', sources);
  }

  private async executeStepByStepProcess(
    sector: string, 
    sources: string[]
  ): Promise<FourStepIntelligenceBrief> {
    console.log(`🔬 STEP 1: Identifying ${sources.length} sources for ${sector} sector`);
    
    // STEP 2: Extract articles from today and yesterday
    console.log(`📰 STEP 2: Extracting articles from ${sources.length} sources`);
    const extractedArticles = await this.extractArticlesFromSources(sector, sources);
    
    if (extractedArticles.length === 0) {
      throw new Error(`STEP 2 FAILED: No articles found from specified sources for ${sector}`);
    }
    
    console.log(`✅ STEP 2 SUCCESS: Extracted ${extractedArticles.length} articles`);
    
    // STEP 3: Generate sections using ONLY extracted articles
    console.log(`📝 STEP 3: Writing sections using ONLY extracted articles`);
    const intelligence = await this.generateSectionsFromArticles(extractedArticles, sector);
    
    // STEP 4: Include direct URLs
    console.log(`🔗 STEP 4: Including ${extractedArticles.length} direct article URLs`);
    const sourceUrls = extractedArticles.map(article => article.url);
    
    return {
      ...intelligence,
      extractedArticles,
      sourceUrls,
      methodologyUsed: 'four-step-authentic-extraction',
      generatedAt: new Date().toISOString()
    };
  }

  private async extractArticlesFromSources(
    sector: string, 
    sources: string[]
  ): Promise<ExtractedArticle[]> {
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    const yesterday = new Date(Date.now() - 24*60*60*1000).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });

    const prompt = `CRITICAL: Execute STEP 2 of 4-step methodology

EXTRACT ALL ARTICLES published on ${today} OR ${yesterday} from these exact sources:
${sources.map((source, i) => `${i + 1}. ${source}`).join('\n')}

REQUIREMENTS:
- ONLY articles published on ${today} or ${yesterday}
- Must include article title, publication date, source domain, and direct URL
- For ${sector} sector: include ALL relevant articles from specified sources
- Return in this exact format:

ARTICLE 1:
Title: [exact headline]
Source: [domain]
Date: [publication date]
URL: [direct unmodified URL]
Content: [key content excerpt]

ARTICLE 2:
[same format]

CRITICAL: If no articles found from specified sources on these dates, state "NO ARTICLES FOUND" - do not generate any content.`;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
          temperature: 0.1,
          search_recency_filter: "day",
          return_citations: true
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      if (content.includes('NO ARTICLES FOUND')) {
        console.log(`❌ STEP 2 FAILED: No articles found for ${sector}`);
        return [];
      }

      return this.parseExtractedArticles(content);
    } catch (error) {
      console.error(`❌ STEP 2 ERROR: Article extraction failed:`, error);
      throw error;
    }
  }

  private parseExtractedArticles(content: string): ExtractedArticle[] {
    const articles: ExtractedArticle[] = [];
    const articleBlocks = content.split(/ARTICLE \d+:/i).slice(1);

    for (const block of articleBlocks) {
      const titleMatch = block.match(/Title:\s*(.+)/i);
      const sourceMatch = block.match(/Source:\s*(.+)/i);
      const dateMatch = block.match(/Date:\s*(.+)/i);
      const urlMatch = block.match(/URL:\s*(https?:\/\/[^\s]+)/i);
      const contentMatch = block.match(/Content:\s*([\s\S]+?)(?=\n\n|\n[A-Z]|$)/i);

      if (titleMatch && sourceMatch && urlMatch) {
        articles.push({
          title: titleMatch[1].trim(),
          source: sourceMatch[1].trim(),
          publishDate: dateMatch?.[1]?.trim() || '',
          url: urlMatch[1].trim(),
          content: contentMatch?.[1]?.trim() || ''
        });
      }
    }

    console.log(`📰 Parsed ${articles.length} articles from extraction`);
    return articles;
  }

  private async generateSectionsFromArticles(
    articles: ExtractedArticle[], 
    sector: string
  ): Promise<Omit<FourStepIntelligenceBrief, 'extractedArticles' | 'sourceUrls' | 'methodologyUsed' | 'generatedAt'>> {
    const articlesText = articles.map(article => 
      `${article.title} (${article.source}, ${article.publishDate}): ${article.content}`
    ).join('\n\n');

    const prompt = `CRITICAL: Execute STEP 3 of 4-step methodology

Using ONLY these extracted articles from today/yesterday:

${articlesText}

Write exactly these 4 sections using ONLY the above articles:

**EXECUTIVE SUMMARY**
[Synthesize key themes from extracted articles only]

**KEY DEVELOPMENTS**  
[List major events from extracted articles with dates]

**MARKET IMPACT ANALYSIS**
[Analyze market implications based on extracted articles only]

**GEOPOLITICAL ANALYSIS**
[Assess geopolitical implications using only extracted articles]

CRITICAL: Use ONLY information from the extracted articles above. No additional content.`;

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 3000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      return this.parseFourStepSections(content);
    } catch (error) {
      console.error(`❌ STEP 3 ERROR: Section generation failed:`, error);
      throw error;
    }
  }

  private parseFourStepSections(content: string): Omit<FourStepIntelligenceBrief, 'extractedArticles' | 'sourceUrls' | 'methodologyUsed' | 'generatedAt'> {
    const executiveSummaryMatch = content.match(/\*\*EXECUTIVE SUMMARY\*\*\s*([\s\S]*?)(?=\*\*[A-Z]|\n\n[A-Z]|$)/i);
    const keyDevelopmentsMatch = content.match(/\*\*KEY DEVELOPMENTS\*\*\s*([\s\S]*?)(?=\*\*[A-Z]|\n\n[A-Z]|$)/i);
    const marketImpactMatch = content.match(/\*\*MARKET IMPACT ANALYSIS\*\*\s*([\s\S]*?)(?=\*\*[A-Z]|\n\n[A-Z]|$)/i);
    const geopoliticalMatch = content.match(/\*\*GEOPOLITICAL ANALYSIS\*\*\s*([\s\S]*?)(?=\*\*[A-Z]|\n\n[A-Z]|$)/i);

    const keyDevelopmentsText = keyDevelopmentsMatch?.[1]?.trim() || '';
    const keyDevelopments = keyDevelopmentsText
      .split(/\n+/)
      .filter(line => line.trim().length > 20)
      .map(line => line.replace(/^[-•*]\s*/, '').trim());

    return {
      executiveSummary: executiveSummaryMatch?.[1]?.trim() || '',
      keyDevelopments: keyDevelopments,
      marketImpactAnalysis: marketImpactMatch?.[1]?.trim() || '',
      geopoliticalAnalysis: geopoliticalMatch?.[1]?.trim() || ''
    };
  }
}

export const fourStepIntelligenceService = new FourStepIntelligenceService();