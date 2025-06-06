import { storage } from "./storage";
import type { Conflict, CorrelationEvent, InsertCorrelationEvent } from "../shared/schema";

interface TimelineEvent {
  id: string;
  conflictId: number;
  timestamp: Date;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  url?: string;
  impact: string;
  verified: boolean;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

export class ConflictTimelineService {
  private perplexityApiKey: string;
  private isUpdating = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
    if (!this.perplexityApiKey) {
      console.warn('PERPLEXITY_API_KEY not found. Timeline updates will be disabled.');
    }
  }

  async fetchConflictUpdates(conflict: Conflict): Promise<TimelineEvent[]> {
    if (!this.perplexityApiKey) {
      return [];
    }

    try {
      const query = `Recent developments in ${conflict.name} conflict in ${conflict.region}. Include latest military actions, diplomatic developments, casualties, territorial changes, and international responses from the last 24 hours. Focus on verified information from reliable news sources.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a news analyst. Provide only the most recent developments about the conflict in clear, concise sentences. Focus on events from the last 24-48 hours. Each update should be a complete, standalone sentence describing what happened.'
            },
            {
              role: 'user',
              content: `Latest news and developments about ${conflict.name}. What are the most recent events, military actions, diplomatic developments, or significant changes in the last 1-2 days?`
            }
          ],
          max_tokens: 1000,
          temperature: 0.1,
          top_p: 0.9,
          search_recency_filter: 'day',
          return_related_questions: false,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data: PerplexityResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        return [];
      }

      // Parse the AI response to extract timeline events
      const events = this.parseTimelineEvents(content, conflict.id, data.citations);
      return events;

    } catch (error) {
      console.error(`Error fetching updates for conflict ${conflict.name}:`, error);
      return [];
    }
  }

  private parseTimelineEvents(content: string, conflictId: number, citations?: string[]): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    
    // Split content into sentences and clean each one
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && !s.includes('I don\'t have') && !s.includes('I cannot'))
      .slice(0, 8); // Limit to 8 most relevant sentences

    sentences.forEach((sentence, index) => {
      const cleanSentence = sentence
        .replace(/^[\d\-\*\•\s]+/, '')
        .replace(/According to|Reports indicate|Sources suggest/gi, '')
        .trim();

      if (cleanSentence.length > 15) {
        const event: TimelineEvent = {
          id: `${conflictId}-${Date.now()}-${index}`,
          conflictId,
          timestamp: new Date(),
          title: this.extractMeaningfulTitle(cleanSentence),
          description: cleanSentence,
          severity: this.determineSeverity(cleanSentence),
          source: citations?.[0] || 'Perplexity Research',
          url: citations?.[0],
          impact: this.extractImpact(cleanSentence),
          verified: true
        };
        
        events.push(event);
      }
    });

    return events;
  }

  private extractMeaningfulTitle(text: string): string {
    // Extract key action words and subjects for a meaningful title
    const actionWords = ['attacked', 'launched', 'announced', 'reported', 'signed', 'agreed', 'withdrew', 'deployed', 'captured', 'destroyed'];
    const found = actionWords.find(word => text.toLowerCase().includes(word));
    
    if (found) {
      const words = text.split(' ').slice(0, 6);
      return words.join(' ') + (words.length === 6 ? '...' : '');
    }
    
    // Fallback to first 50 characters
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  private extractTimestamp(text: string): Date | null {
    // Look for date patterns in the text
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/,
      /(today|yesterday|this morning|this afternoon|tonight)/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[1];
        if (dateStr.toLowerCase().includes('today')) {
          return new Date();
        } else if (dateStr.toLowerCase().includes('yesterday')) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday;
        } else {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }

    return null;
  }

  private cleanEventText(text: string): string {
    // Remove all formatting markers and duplicates
    let cleaned = text
      .replace(/Title:\*\*\s*/g, '')
      .replace(/\*\*Title:\*\*/g, '')
      .replace(/Description:\*\*\s*/g, '')
      .replace(/\*\*Description:\*\*/g, '')
      .replace(/\*\*Timestamp:\*\*/g, '')
      .replace(/Timestamp:\*\*/g, '')
      .replace(/\[Source:.*?\]/g, '')
      .replace(/\s*-\s*\*\*.*?\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/^[\d\-\*\•\s]+/, '')
      .replace(/:\s*-\s*/g, ': ')
      .trim();

    // Remove duplicate text patterns (e.g., "A: - A")
    const colonIndex = cleaned.indexOf(':');
    if (colonIndex > 0) {
      const beforeColon = cleaned.substring(0, colonIndex).trim();
      const afterColon = cleaned.substring(colonIndex + 1).trim();
      
      // If text after colon starts with dash and repeats the before part, clean it
      if (afterColon.startsWith('- ') && afterColon.substring(2).trim().startsWith(beforeColon)) {
        cleaned = afterColon.substring(2 + beforeColon.length).trim();
        if (cleaned.startsWith(',') || cleaned.startsWith('.')) {
          cleaned = cleaned.substring(1).trim();
        }
      } else if (afterColon.startsWith('- ')) {
        cleaned = afterColon.substring(2).trim();
      } else {
        cleaned = afterColon;
      }
    }

    // Split into sentences and take the first meaningful ones
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const uniqueSentences = Array.from(new Set(sentences.map(s => s.trim())));
    
    // Return first 2 sentences, max 150 chars
    const result = uniqueSentences.slice(0, 2).join('. ').trim();
    return result.length > 150 ? result.substring(0, 150) + '...' : result + '.';
  }

  private extractTitle(text: string): string {
    // Extract first 60 characters as title, or find the main subject
    const title = text.substring(0, 80).trim();
    
    // Remove bullet points and numbering
    return title.replace(/^[\d\-\*\•\s]+/, '').trim() || 'Conflict Update';
  }

  private determineSeverity(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalWords = ['killed', 'dead', 'casualties', 'bombing', 'attack', 'invasion', 'war crimes'];
    const highWords = ['fighting', 'battle', 'conflict', 'military', 'troops', 'weapons'];
    const mediumWords = ['diplomatic', 'meeting', 'talks', 'sanctions', 'aid'];
    
    const lowerText = text.toLowerCase();
    
    if (criticalWords.some(word => lowerText.includes(word))) {
      return 'critical';
    } else if (highWords.some(word => lowerText.includes(word))) {
      return 'high';
    } else if (mediumWords.some(word => lowerText.includes(word))) {
      return 'medium';
    }
    
    return 'low';
  }

  private extractImpact(text: string): string {
    // Extract potential impact information
    const impactKeywords = ['economic', 'humanitarian', 'political', 'military', 'civilian'];
    const lowerText = text.toLowerCase();
    
    for (const keyword of impactKeywords) {
      if (lowerText.includes(keyword)) {
        return keyword.charAt(0).toUpperCase() + keyword.slice(1) + ' impact';
      }
    }
    
    return 'Regional impact';
  }

  private mapSeverityToNumber(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    switch (severity) {
      case 'low': return 2;
      case 'medium': return 5;
      case 'high': return 7;
      case 'critical': return 9;
      default: return 5;
    }
  }

  async updateAllConflictTimelines(): Promise<void> {
    if (this.isUpdating) {
      return;
    }

    this.isUpdating = true;
    console.log('Starting conflict timeline updates...');

    try {
      const conflicts = await storage.getConflicts();
      
      for (const conflict of conflicts) {
        if (conflict.status === 'active') {
          console.log(`Updating timeline for ${conflict.name}...`);
          
          const events = await this.fetchConflictUpdates(conflict);
          
          // Store events as correlation events
          for (const event of events) {
            try {
              const correlationEvent: InsertCorrelationEvent = {
                eventDate: event.timestamp,
                eventDescription: `${event.title}: ${event.description}`,
                stockMovement: 0,
                conflictId: event.conflictId,
                severity: this.mapSeverityToNumber(event.severity)
              };
              
              await storage.createCorrelationEvent(correlationEvent);
              console.log(`Added timeline event: ${event.title}`);
            } catch (error) {
              console.error('Error storing timeline event:', error);
            }
          }
          
          // Update conflict's lastUpdated timestamp
          await storage.updateConflict(conflict.id, {
            name: conflict.name,
            status: conflict.status,
            region: conflict.region,
            severity: conflict.severity,
            duration: conflict.duration,
            startDate: conflict.startDate
          });
          
          // Add delay between requests to respect API limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      console.error('Error updating conflict timelines:', error);
    } finally {
      this.isUpdating = false;
      console.log('Conflict timeline update completed');
    }
  }

  startRealTimeUpdates(): void {
    if (this.updateInterval) {
      return;
    }

    // Update every 30 minutes
    this.updateInterval = setInterval(() => {
      this.updateAllConflictTimelines();
    }, 30 * 60 * 1000);

    // Run initial update
    setTimeout(() => {
      this.updateAllConflictTimelines();
    }, 5000);

    console.log('Real-time conflict timeline updates started');
  }

  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('Real-time conflict timeline updates stopped');
    }
  }

  async getConflictTimeline(conflictId: number): Promise<CorrelationEvent[]> {
    const events = await storage.getCorrelationEvents();
    return events
      .filter(event => event.conflictId === conflictId)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }
}

export const conflictTimelineService = new ConflictTimelineService();