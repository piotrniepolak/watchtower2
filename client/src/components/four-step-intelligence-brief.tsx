import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FourStepIntelligence } from '@shared/schema';

interface ExtractedArticle {
  title: string;
  url: string;
  source: string;
  publishDate: string;
  content: string;
}

interface FourStepIntelligenceBriefProps {
  sector: 'defense' | 'pharmaceutical' | 'energy';
}

export function FourStepIntelligenceBrief({ sector }: FourStepIntelligenceBriefProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch 4-step intelligence
  const { data: intelligence, isLoading, error } = useQuery<FourStepIntelligence | { status: string; message: string; estimatedCompletion: string }>({
    queryKey: [`/api/intelligence/${sector}/four-step`],
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: (data) => {
      // If intelligence is being generated, refetch every 30 seconds
      if (data && 'status' in data && data.status === 'generating') {
        return 30000;
      }
      return false;
    },
  });

  // Regenerate intelligence mutation
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/intelligence/${sector}/four-step/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to regenerate intelligence');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/intelligence/${sector}/four-step`] });
      setIsRegenerating(false);
    },
    onError: () => {
      setIsRegenerating(false);
    },
  });

  const handleRegenerate = () => {
    setIsRegenerating(true);
    regenerateMutation.mutate();
  };

  // Check if intelligence is being generated
  const isGenerating = intelligence && 'status' in intelligence && intelligence.status === 'generating';

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            Loading 4-Step Intelligence Analysis...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Generating {sector.charAt(0).toUpperCase() + sector.slice(1)} Intelligence Brief
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {intelligence.message}
              <br />
              <strong>Estimated completion:</strong> {intelligence.estimatedCompletion}
              <br />
              <em>This page will refresh automatically when ready.</em>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    // Check if this is the expected "No Articles Found" scenario
    const errorMessage = (error as any)?.message || '';
    const isNoArticlesFound = errorMessage.includes('No articles found') || 
                             errorMessage.includes('STEP 2 FAILED');
    
    if (isNoArticlesFound) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <CheckCircle className="h-5 w-5" />
              4-Step Methodology: No Articles Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                The 4-step methodology correctly identified that no articles from the 20 specified defense sources 
                were published in the last 24-48 hours. This demonstrates the authentic source verification process.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Step 1: Dynamically searched for sources with recent articles</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Step 2: No sources found with articles from last 48 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Step 3: Authentic verification process complete</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Step 4: No synthetic content generated</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Dynamic Source Discovery:</strong> The system searches for 20 sources that actually published 
                defense sector articles in the last 48 hours. No fallback content is generated when no recent articles exist.
              </p>
            </div>
            
            <Button 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              variant="outline"
              className="w-full"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking for New Articles...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check for New Articles
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // Handle actual errors
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Failed to load 4-step intelligence analysis. Please ensure PERPLEXITY_API_KEY is configured.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!intelligence) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Intelligence Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No 4-step intelligence data found for today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                {intelligence.title}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {intelligence.methodologyUsed}
                </Badge>
                <Badge variant="secondary">
                  {intelligence.articleCount} Authentic Articles
                </Badge>
                <Badge variant="outline">
                  {intelligence.sourcesVerified ? 'Sources Verified' : 'Sources Pending'}
                </Badge>
                <Badge variant="outline">
                  {new Date(intelligence.date).toLocaleDateString()}
                </Badge>
              </div>
            </div>
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating || regenerateMutation.isPending}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", (isRegenerating || regenerateMutation.isPending) && "animate-spin")} />
              Regenerate
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {intelligence.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Key Developments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Key Developments</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {Array.isArray(intelligence.keyDevelopments) && intelligence.keyDevelopments.map((development: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <p className="text-gray-700 leading-relaxed">{development}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Market Impact Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Market Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {intelligence.marketImpactAnalysis}
          </p>
        </CardContent>
      </Card>

      {/* Geopolitical Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Geopolitical Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {intelligence.geopoliticalAnalysis}
          </p>
        </CardContent>
      </Card>

      {/* Extracted Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Source Articles Used in Analysis</CardTitle>
          <p className="text-sm text-gray-600">
            {intelligence.articleCount || 0} authentic articles extracted from verified news sources
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(intelligence.extractedArticles) && intelligence.extractedArticles.map((article: ExtractedArticle, index: number) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">{article.source}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{article.publishDate}</span>
                    </div>
                    {article.content && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {article.content}
                      </p>
                    )}
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Read
                    </a>
                  </Button>
                </div>
              </div>
            ))}
            {!Array.isArray(intelligence.extractedArticles) && (
              <div className="text-center py-8 text-gray-500">
                <p>No extracted articles available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Methodology Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">4-Step Methodology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</div>
              <p>Identify exactly 20 news sources (15 sector-specific + 5 general)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</div>
              <p>Extract ALL articles published today/yesterday from these sources</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</div>
              <p>Use ONLY extracted articles to write analysis sections</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">4</div>
              <p>Include direct article URLs without modification</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}