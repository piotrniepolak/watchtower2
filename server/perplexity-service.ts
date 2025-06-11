import fetch from 'node-fetch';

interface PerplexityQuizRequest {
  sector: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GeneratedQuiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  source: string;
  tags: string[];
}

class PerplexityService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY is required');
    }
  }

  async generateQuiz(request: PerplexityQuizRequest): Promise<GeneratedQuiz> {
    const sectorPrompts = {
      defense: this.getDefensePrompt(request.difficulty),
      health: this.getHealthPrompt(request.difficulty), 
      energy: this.getEnergyPrompt(request.difficulty)
    };

    const prompt = sectorPrompts[request.sector as keyof typeof sectorPrompts] || sectorPrompts.defense;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an expert intelligence analyst creating educational quiz questions. Always provide current, factual information with reliable sources. Format your response as valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from Perplexity API');
      }

      // Parse the JSON response
      let parsedQuiz: GeneratedQuiz;
      try {
        parsedQuiz = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from the content
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedQuiz = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse quiz JSON from response');
        }
      }

      // Validate the parsed quiz
      if (!this.validateQuiz(parsedQuiz)) {
        throw new Error('Generated quiz does not meet required format');
      }

      return parsedQuiz;
    } catch (error) {
      console.error('Error generating quiz with Perplexity:', error);
      // Return a fallback quiz based on sector
      return this.getFallbackQuiz(request.sector, request.difficulty);
    }
  }

  private getDefensePrompt(difficulty: string): string {
    return `Create a ${difficulty} difficulty multiple choice quiz question about current defense/military/conflict intelligence. 

Focus on recent developments in:
- Global conflicts and their status
- Defense spending and military contracts
- Geopolitical tensions and their market impact
- Defense company performance and contracts
- Military technology developments

Return ONLY valid JSON in this exact format:
{
  "question": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation with current context",
  "source": "Specific source citation",
  "tags": ["relevant", "topic", "tags"]
}

Make sure the question is based on current events from the last 30 days and includes accurate financial/market data.`;
  }

  private getHealthPrompt(difficulty: string): string {
    return `Create a ${difficulty} difficulty multiple choice quiz question about current pharmaceutical/healthcare intelligence.

Focus on recent developments in:
- Pharmaceutical company earnings and drug approvals
- Healthcare policy changes and their market impact
- Medical breakthrough announcements
- WHO health data and global health trends
- Biotech sector performance and investments

Return ONLY valid JSON in this exact format:
{
  "question": "Question text here", 
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation with current context",
  "source": "Specific source citation",
  "tags": ["relevant", "topic", "tags"]
}

Make sure the question is based on current events from the last 30 days and includes accurate financial/market data.`;
  }

  private getEnergyPrompt(difficulty: string): string {
    return `Create a ${difficulty} difficulty multiple choice quiz question about current energy sector intelligence.

Focus on recent developments in:
- Oil and gas company earnings and production updates
- Renewable energy policy and investment trends
- Energy commodity prices and market movements
- Climate policy impact on energy markets
- Energy infrastructure and technology developments

Return ONLY valid JSON in this exact format:
{
  "question": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"], 
  "correctAnswer": 0,
  "explanation": "Detailed explanation with current context",
  "source": "Specific source citation",
  "tags": ["relevant", "topic", "tags"]
}

Make sure the question is based on current events from the last 30 days and includes accurate financial/market data.`;
  }

  private validateQuiz(quiz: any): quiz is GeneratedQuiz {
    return (
      typeof quiz === 'object' &&
      typeof quiz.question === 'string' &&
      Array.isArray(quiz.options) &&
      quiz.options.length === 4 &&
      typeof quiz.correctAnswer === 'number' &&
      quiz.correctAnswer >= 0 &&
      quiz.correctAnswer < 4 &&
      typeof quiz.explanation === 'string' &&
      typeof quiz.source === 'string' &&
      Array.isArray(quiz.tags)
    );
  }

  private getFallbackQuiz(sector: string, difficulty: string): GeneratedQuiz {
    const fallbackQuizzes = {
      defense: {
        question: "Which factor most significantly impacts defense stock performance during geopolitical tensions?",
        options: [
          "Government defense spending announcements",
          "Currency exchange rates",
          "Consumer confidence indices", 
          "Agricultural commodity prices"
        ],
        correctAnswer: 0,
        explanation: "Government defense spending announcements have the most direct impact on defense stocks during geopolitical tensions, as increased military budgets typically lead to higher contracts and revenues for defense companies.",
        source: "Defense sector analysis",
        tags: ["defense", "spending", "geopolitics"]
      },
      health: {
        question: "What is the primary driver of pharmaceutical stock volatility in current markets?",
        options: [
          "FDA drug approval announcements",
          "Weather patterns",
          "Sports events",
          "Fashion trends"
        ],
        correctAnswer: 0,
        explanation: "FDA drug approval announcements are the primary driver of pharmaceutical stock volatility, as approvals can add billions in market value while rejections can cause significant losses.",
        source: "Pharmaceutical market analysis",
        tags: ["pharma", "FDA", "approvals"]
      },
      energy: {
        question: "Which factor most influences energy sector performance in today's market?",
        options: [
          "Global oil demand and supply dynamics",
          "Social media trends",
          "Movie box office performance",
          "Video game sales"
        ],
        correctAnswer: 0,
        explanation: "Global oil demand and supply dynamics remain the most significant factor influencing energy sector performance, affecting everything from crude prices to company valuations.",
        source: "Energy market analysis", 
        tags: ["energy", "oil", "supply-demand"]
      }
    };

    return fallbackQuizzes[sector as keyof typeof fallbackQuizzes] || fallbackQuizzes.defense;
  }
}

export const perplexityService = new PerplexityService();