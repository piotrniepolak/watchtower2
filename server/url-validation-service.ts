/**
 * URL Validation and Filtering Service
 * Validates URLs and filters out broken ones during intelligence brief generation
 * NO FALLBACKS - Only keeps URLs that return 200 status codes
 */

interface URLValidationResult {
  isValid: boolean;
  status: number;
  redirectUrl?: string;
  error?: string;
}

class URLValidationService {
  private readonly timeout = 10000; // 10 second timeout
  private readonly maxRetries = 2;

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
          'User-Agent': 'Mozilla/5.0 (compatible; Watchtower-URLValidator/1.0)'
        }
      });

      clearTimeout(timeoutId);

      return {
        isValid: response.ok,
        status: response.status,
        redirectUrl: response.url !== url ? response.url : undefined
      };

    } catch (error: any) {
      return {
        isValid: false,
        status: 0,
        error: error.message
      };
    }
  }

  /**
   * Filter out ALL broken URLs - no fallbacks, no replacements
   */
  async validateAndFilterWorkingUrls(sourceUrls: string[]): Promise<string[]> {
    console.log(`🔍 Filtering ${sourceUrls.length} URLs to keep only working ones...`);
    
    const workingUrls: string[] = [];
    const concurrentLimit = 10; // Process 10 URLs at a time
    
    for (let i = 0; i < sourceUrls.length; i += concurrentLimit) {
      const batch = sourceUrls.slice(i, i + concurrentLimit);
      
      const batchPromises = batch.map(async (url) => {
        const validation = await this.validateURL(url);
        
        if (validation.isValid) {
          console.log(`✅ URL valid: ${url}`);
          return validation.redirectUrl || url;
        } else {
          console.log(`❌ REJECTING broken URL (${validation.status}): ${url}`);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validUrls = batchResults.filter((url): url is string => url !== null);
      workingUrls.push(...validUrls);
      
      // Small delay between batches to avoid overwhelming servers
      if (i + concurrentLimit < sourceUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    const rejectedCount = sourceUrls.length - workingUrls.length;
    console.log(`✅ URL filtering complete: ${rejectedCount} broken URLs rejected, ${workingUrls.length} working URLs kept`);
    
    if (workingUrls.length === 0) {
      throw new Error('ZERO WORKING URLS - Cannot generate brief with no valid sources');
    }
    
    return workingUrls;
  }

  /**
   * Quick validation check for critical URLs (faster, less comprehensive)
   */
  async quickValidateUrls(sourceUrls: string[]): Promise<{validUrls: string[], brokenUrls: string[]}> {
    const validUrls: string[] = [];
    const brokenUrls: string[] = [];
    
    const promises = sourceUrls.map(async (url) => {
      const validation = await this.validateURL(url);
      if (validation.isValid) {
        validUrls.push(validation.redirectUrl || url);
      } else {
        brokenUrls.push(url);
      }
    });
    
    await Promise.all(promises);
    
    return { validUrls, brokenUrls };
  }
}

export const urlValidationService = new URLValidationService();