import { ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SourceLink {
  title: string;
  url: string;
  source?: string;
}

interface SourceLinksProps {
  sources: SourceLink[];
  title?: string;
}

// Extract domain from URL for cleaner display
const getDomainFromUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'External Source';
  }
};

// Generate favicon URL for visual enhancement
const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  } catch {
    return '';
  }
};

export function SourceLinks({ sources, title = "Sources & References" }: SourceLinksProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
          <Globe className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2">
          {sources.map((source, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-auto p-3 justify-start hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all"
              onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex items-center gap-3 w-full text-left">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <img 
                    src={getFaviconUrl(source.url)} 
                    alt="" 
                    className="w-4 h-4 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900 text-sm truncate">
                      {source.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {source.source || getDomainFromUrl(source.url)}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to extract sources from various text formats
export function extractSourcesFromText(text: string): SourceLink[] {
  const sources: SourceLink[] = [];
  
  // Pattern 1: Markdown links [Title](URL)
  const markdownLinks = text.match(/\[([^\]]+)\]\(([^)]+)\)/g);
  if (markdownLinks) {
    markdownLinks.forEach(link => {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        sources.push({
          title: match[1].trim(),
          url: match[2].trim()
        });
      }
    });
  }
  
  // Pattern 2: References section with numbered items
  const referencesMatch = text.match(/References:\s*([\s\S]*?)(?:\n\n|\n$|$)/i);
  if (referencesMatch) {
    const referencesText = referencesMatch[1];
    const referenceLines = referencesText.split('\n').filter(line => line.trim());
    
    referenceLines.forEach(line => {
      // Pattern: - Source: "Title"
      const sourceMatch = line.match(/^-\s*([^:]+):\s*[""]([^""]+)[""]?/);
      if (sourceMatch) {
        const source = sourceMatch[1].trim();
        const title = sourceMatch[2].trim();
        
        // Generate URLs based on source
        let url = '';
        const titleSlug = title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        if (source.includes('BioPharma Dive')) {
          url = `https://www.biopharmadive.com/news/${titleSlug}`;
        } else if (source.includes('STAT News')) {
          url = `https://www.statnews.com/${titleSlug}`;
        } else if (source.includes('Reuters')) {
          url = `https://www.reuters.com/business/healthcare-pharmaceuticals/${titleSlug}`;
        } else if (source.includes('Bloomberg')) {
          url = `https://www.bloomberg.com/news/articles/${titleSlug}`;
        } else if (source.includes('FDA')) {
          url = `https://www.fda.gov/news-events/press-announcements/${titleSlug}`;
        }
        
        if (url) {
          sources.push({
            title,
            url,
            source
          });
        }
      }
      
      // Pattern: Numbered markdown links "1. [Title](URL)"
      const numberedMatch = line.match(/^\d+\.\s*\[([^\]]+)\]\(([^)]+)\)/);
      if (numberedMatch) {
        sources.push({
          title: numberedMatch[1].trim(),
          url: numberedMatch[2].trim()
        });
      }
    });
  }
  
  // Pattern 3: Direct URLs with context
  const urlPattern = /https?:\/\/[^\s\)]+/g;
  const urls = text.match(urlPattern);
  if (urls) {
    urls.forEach(url => {
      // Skip if already captured in other patterns
      if (!sources.find(s => s.url === url)) {
        sources.push({
          title: getDomainFromUrl(url),
          url: url.trim()
        });
      }
    });
  }
  
  return sources;
}