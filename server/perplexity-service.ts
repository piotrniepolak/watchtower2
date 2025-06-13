export interface PerplexityQueryOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  searchRecencyFilter?: 'hour' | 'day' | 'week' | 'month' | 'year';
  searchDomainFilter?: string[];
  returnImages?: boolean;
  returnRelatedQuestions?: boolean;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class PerplexityService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('PERPLEXITY_API_KEY not found in environment variables');
    }
  }

  async query(
    prompt: string, 
    options: PerplexityQueryOptions = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const {
      model = 'llama-3.1-sonar-small-128k-online',
      temperature = 0.2,
      maxTokens = 1500,
      searchRecencyFilter = 'week',
      searchDomainFilter = [],
      returnImages = false,
      returnRelatedQuestions = false
    } = options;

    const requestBody = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional geopolitical analyst providing accurate, factual analysis based on recent developments. Focus on actionable intelligence and cite specific sources with dates.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature,
      top_p: 0.9,
      search_domain_filter: searchDomainFilter,
      return_images: returnImages,
      return_related_questions: returnRelatedQuestions,
      search_recency_filter: searchRecencyFilter,
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    };

    try {
      console.log(`🔍 Querying Perplexity with model: ${model}, recency: ${searchRecencyFilter}`);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error:', response.status, errorText);
        throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
      }

      const data: PerplexityResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices returned from Perplexity API');
      }

      const content = data.choices[0].message.content;
      console.log(`✅ Perplexity query completed: ${data.usage.total_tokens} tokens used`);
      
      return content;
    } catch (error) {
      console.error('Error querying Perplexity API:', error);
      throw error;
    }
  }

  async queryWithCitations(
    prompt: string,
    options: PerplexityQueryOptions = {}
  ): Promise<{ content: string; citations: string[] }> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await this.queryRaw(prompt, options);
    
    return {
      content: response.choices[0]?.message?.content || '',
      citations: response.citations || []
    };
  }

  private async queryRaw(
    prompt: string,
    options: PerplexityQueryOptions = {}
  ): Promise<PerplexityResponse> {
    const {
      model = 'llama-3.1-sonar-small-128k-online',
      temperature = 0.2,
      maxTokens = 1500,
      searchRecencyFilter = 'week',
      searchDomainFilter = [],
      returnImages = false,
      returnRelatedQuestions = false
    } = options;

    const requestBody = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional geopolitical analyst providing accurate, factual analysis based on recent developments. Focus on actionable intelligence and cite specific sources with dates.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature,
      top_p: 0.9,
      search_domain_filter: searchDomainFilter,
      return_images: returnImages,
      return_related_questions: returnRelatedQuestions,
      search_recency_filter: searchRecencyFilter,
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const perplexityService = new PerplexityService();