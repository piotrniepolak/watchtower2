import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SourceLink {
  url: string;
  title: string;
}

interface IntelligenceSourceLinksProps {
  sources: SourceLink[];
  sectionTitle: string;
  maxDisplay?: number;
}

export function IntelligenceSourceLinks({ sources, sectionTitle, maxDisplay = 3 }: IntelligenceSourceLinksProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const displaySources = sources.slice(0, maxDisplay);

  const getDomainFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <h5 className="text-sm font-medium text-slate-900 mb-2 flex items-center">
        <ExternalLink className="h-3 w-3 mr-1" />
        {sectionTitle} References
      </h5>
      <div className="space-y-2">
        {displaySources.map((source, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="h-auto p-2 text-left justify-start w-full text-xs"
            onClick={() => window.open(source.url, '_blank')}
          >
            <div className="flex items-center space-x-2 w-full">
              <img
                src={`https://www.google.com/s2/favicons?domain=${getDomainFromUrl(source.url)}&sz=16`}
                alt=""
                className="w-4 h-4 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium text-slate-900">
                  {source.title || getDomainFromUrl(source.url)}
                </div>
                <div className="truncate text-slate-500">
                  {getDomainFromUrl(source.url)}
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-slate-400 flex-shrink-0" />
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}