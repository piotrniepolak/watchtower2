// Static Data Adapter for CMS-generated static sites
// This replaces API calls with static JSON data files

interface StaticDataCache {
  [key: string]: any;
}

class StaticDataAdapter {
  private cache: StaticDataCache = {};
  private isStatic = false;

  constructor() {
    // Only enable static mode when explicitly set
    this.isStatic = (window as any)?.__STATIC_MODE__ === true || import.meta.env.VITE_STATIC_MODE === 'true';
    
    if (this.isStatic) {
      console.log('Static mode detected - using pre-generated data');
    } else {
      console.log('Dynamic mode detected - using API endpoints');
    }
  }

  async fetchData(endpoint: string): Promise<any> {
    // If not in static mode, use normal API calls
    if (!this.isStatic) {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      return response.json();
    }

    // In static mode, map API endpoints to static files
    const staticFile = this.getStaticFile(endpoint);
    
    // Check cache first
    if (this.cache[staticFile]) {
      return this.cache[staticFile];
    }

    try {
      const response = await fetch(`/data/${staticFile}`);
      if (!response.ok) {
        throw new Error(`Static data file not found: ${staticFile}`);
      }
      
      const data = await response.json();
      this.cache[staticFile] = data;
      return data;
    } catch (error) {
      console.warn(`Failed to load static data for ${endpoint}:`, error);
      return this.getFallbackData(endpoint);
    }
  }

  private getStaticFile(endpoint: string): string {
    // Map API endpoints to static JSON files
    const endpointMap: { [key: string]: string } = {
      '/api/conflicts': 'conflicts.json',
      '/api/stocks': 'stocks.json',
      '/api/metrics': 'metrics.json',
      '/api/notifications': 'notifications.json',
      '/api/correlation-events': 'correlation-events.json',
      '/api/quiz/today': 'quiz.json',
      '/api/news/today': 'news.json',
      '/api/user/watchlist/stocks': 'user-stocks.json',
      '/api/user/watchlist/conflicts': 'user-conflicts.json'
    };

    // Handle parameterized endpoints
    for (const [pattern, file] of Object.entries(endpointMap)) {
      if (endpoint.startsWith(pattern)) {
        return file;
      }
    }

    // Default fallback
    const filename = endpoint.replace('/api/', '').replace(/\//g, '-') + '.json';
    return filename;
  }

  private getFallbackData(endpoint: string): any {
    // Provide minimal fallback data structure for different endpoints
    const fallbacks: { [key: string]: any } = {
      '/api/conflicts': [],
      '/api/stocks': [],
      '/api/metrics': {
        activeConflicts: 0,
        totalConflicts: 0,
        defenseIndexChange: 0,
        marketVolatility: 0
      },
      '/api/notifications': [],
      '/api/correlation-events': [],
      '/api/quiz/today': null,
      '/api/news/today': null
    };

    return fallbacks[endpoint] || {};
  }

  // Method to check if we're in static mode
  isStaticMode(): boolean {
    return this.isStatic;
  }

  // Method to clear cache (useful for development)
  clearCache(): void {
    this.cache = {};
  }

  // Method to get metadata about the static build
  async getMetadata() {
    if (!this.isStatic) {
      return null;
    }

    try {
      const response = await fetch('/data/metadata.json');
      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      console.warn('Failed to load metadata:', error);
    }
    return null;
  }
}

// Create singleton instance
export const staticDataAdapter = new StaticDataAdapter();

// Custom fetch function that automatically uses static data when available
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<any> {
  // For POST/PUT/DELETE requests in static mode, just return success
  if (staticDataAdapter.isStaticMode() && options?.method && options.method !== 'GET') {
    console.warn(`${options.method} request to ${endpoint} ignored in static mode`);
    return { success: true, message: 'Operation not available in static mode' };
  }

  return staticDataAdapter.fetchData(endpoint);
}

// Export for use in React Query
export default staticDataAdapter;