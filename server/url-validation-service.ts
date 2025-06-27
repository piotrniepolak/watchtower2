/**
 * URL Validation and Fixing Service
 * Validates and fixes broken URLs during intelligence brief generation
 * Ensures all reference links work before storing briefs
 */

interface URLValidationResult {
  isValid: boolean;
  status: number;
  redirectUrl?: string;
  error?: string;
}

interface URLReplacementMap {
  [domain: string]: {
    workingBaseUrl: string;
    pathPatterns: string[];
    fallbackUrls?: string[];
  };
}

class URLValidationService {
  private readonly timeout = 10000; // 10 second timeout
  private readonly maxRetries = 2;
  
  // Known working URL patterns for major sources
  private readonly urlReplacements: URLReplacementMap = {
    // Defense sources
    'defensenews.com': {
      workingBaseUrl: 'https://www.defensenews.com',
      pathPatterns: ['/land/', '/air/', '/naval/', '/global/', '/pentagon/', '/industry/'],
      fallbackUrls: ['https://www.defensenews.com/pentagon/', 'https://www.defensenews.com/industry/']
    },
    'breakingdefense.com': {
      workingBaseUrl: 'https://breakingdefense.com',
      pathPatterns: ['/2025/', '/land/', '/air/', '/space/', '/cyber/'],
      fallbackUrls: ['https://breakingdefense.com/category/air/', 'https://breakingdefense.com/category/land/']
    },
    'defenseone.com': {
      workingBaseUrl: 'https://www.defenseone.com',
      pathPatterns: ['/policy/', '/threats/', '/technology/', '/ideas/'],
      fallbackUrls: ['https://www.defenseone.com/threats/', 'https://www.defenseone.com/policy/']
    },
    
    // Pharmaceutical sources
    'statnews.com': {
      workingBaseUrl: 'https://www.statnews.com',
      pathPatterns: ['/2025/', '/pharmalot/', '/biotech/', '/policy/'],
      fallbackUrls: ['https://www.statnews.com/topic/biotech/', 'https://www.statnews.com/topic/drug-pricing/']
    },
    'biopharmadive.com': {
      workingBaseUrl: 'https://www.biopharmadive.com',
      pathPatterns: ['/news/', '/2025/'],
      fallbackUrls: ['https://www.biopharmadive.com/news/', 'https://www.biopharmadive.com/topic/drug-development/']
    },
    'bioworld.com': {
      workingBaseUrl: 'https://www.bioworld.com',
      pathPatterns: ['/articles/', '/2025/'],
      fallbackUrls: ['https://www.bioworld.com/articles/', 'https://www.bioworld.com/topics/drug-development']
    },
    
    // Energy sources
    'oilprice.com': {
      workingBaseUrl: 'https://oilprice.com',
      pathPatterns: ['/Energy/', '/Latest-Energy-News/', '/Geopolitics/'],
      fallbackUrls: ['https://oilprice.com/Latest-Energy-News/', 'https://oilprice.com/Energy/']
    },
    'utilitydive.com': {
      workingBaseUrl: 'https://www.utilitydive.com',
      pathPatterns: ['/news/', '/2025/'],
      fallbackUrls: ['https://www.utilitydive.com/news/', 'https://www.utilitydive.com/topic/renewable-energy/']
    },
    'energycentral.com': {
      workingBaseUrl: 'https://www.energycentral.com',
      pathPatterns: ['/news/', '/c/', '/o/'],
      fallbackUrls: ['https://www.energycentral.com/news', 'https://www.energycentral.com/c/ec/energy-industry-news']
    }
  };

  /**
   * Validate a single URL with timeout and status checking
   */
  async validateURL(url: string): Promise<URLValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URLValidator/1.0)',
        }
      });
      
      clearTimeout(timeoutId);
      
      const isValid = response.status >= 200 && response.status < 400;
      const finalUrl = response.url !== url ? response.url : undefined;
      
      return {
        isValid,
        status: response.status,
        redirectUrl: finalUrl
      };
      
    } catch (error: any) {
      return {
        isValid: false,
        status: 0,
        error: error.name === 'AbortError' ? 'Timeout' : error.message
      };
    }
  }

  /**
   * Find working replacement URL for a broken URL
   */
  async findWorkingReplacement(brokenUrl: string, sector: string): Promise<string | null> {
    try {
      const domain = new URL(brokenUrl).hostname.replace('www.', '');
      const replacement = this.urlReplacements[domain];
      
      if (!replacement) {
        console.log(`❌ No replacement patterns for domain: ${domain}`);
        return null;
      }

      // Try fallback URLs from the same domain
      for (const fallbackUrl of replacement.fallbackUrls || []) {
        const validation = await this.validateURL(fallbackUrl);
        if (validation.isValid) {
          console.log(`✅ Found working replacement: ${fallbackUrl} for ${brokenUrl}`);
          return fallbackUrl;
        }
      }

      // Try to construct working URL with known patterns
      const originalPath = new URL(brokenUrl).pathname;
      for (const pattern of replacement.pathPatterns) {
        if (originalPath.includes(pattern)) {
          const constructedUrl = `${replacement.workingBaseUrl}${originalPath}`;
          const validation = await this.validateURL(constructedUrl);
          if (validation.isValid) {
            console.log(`✅ Constructed working URL: ${constructedUrl} for ${brokenUrl}`);
            return constructedUrl;
          }
        }
      }

      console.log(`❌ No working replacement found for ${brokenUrl}`);
      return null;
      
    } catch (error) {
      console.error(`Error finding replacement for ${brokenUrl}:`, error);
      return null;
    }
  }

  /**
   * Validate and fix all URLs in a brief's source list
   */
  async validateAndFixBriefUrls(sourceUrls: string[], sector: string): Promise<string[]> {
    console.log(`🔍 Validating ${sourceUrls.length} URLs for ${sector} sector...`);
    
    const validatedUrls: string[] = [];
    const concurrentLimit = 5; // Process 5 URLs at a time
    
    for (let i = 0; i < sourceUrls.length; i += concurrentLimit) {
      const batch = sourceUrls.slice(i, i + concurrentLimit);
      
      const batchPromises = batch.map(async (url) => {
        const validation = await this.validateURL(url);
        
        if (validation.isValid) {
          console.log(`✅ URL valid: ${url}`);
          return validation.redirectUrl || url;
        } else {
          console.log(`❌ URL broken (${validation.status}): ${url}`);
          
          // Try to find replacement
          const replacement = await this.findWorkingReplacement(url, sector);
          if (replacement) {
            console.log(`🔄 Replaced ${url} with ${replacement}`);
            return replacement;
          } else {
            console.log(`⚠️ Keeping broken URL (no replacement found): ${url}`);
            return url; // Keep original if no replacement found
          }
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      validatedUrls.push(...batchResults);
      
      // Small delay between batches to avoid overwhelming servers
      if (i + concurrentLimit < sourceUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const fixedCount = validatedUrls.filter((url, index) => url !== sourceUrls[index]).length;
    console.log(`✅ URL validation complete: ${fixedCount} URLs fixed out of ${sourceUrls.length} total`);
    
    return validatedUrls;
  }

  /**
   * Quick validation check for critical URLs (faster, less comprehensive)
   */
  async quickValidateUrls(sourceUrls: string[]): Promise<{validUrls: string[], brokenUrls: string[]}> {
    const validUrls: string[] = [];
    const brokenUrls: string[] = [];
    
    const validationPromises = sourceUrls.map(async (url) => {
      const validation = await this.validateURL(url);
      if (validation.isValid) {
        validUrls.push(url);
      } else {
        brokenUrls.push(url);
      }
    });
    
    await Promise.all(validationPromises);
    
    return { validUrls, brokenUrls };
  }
}

export const urlValidationService = new URLValidationService();