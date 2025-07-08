import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ExternalLink, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';

/**
 * TrefisAnalyses Component - JSON Endpoint Integration
 * Displays actionable and featured analyses from reverse-engineered Trefis JSON APIs
 * Each analysis opens in new tab with no-login-required URLs for direct access
 */

interface TrefisAnalysis {
  title: string;
  url: string;
  value?: number; // Performance metric from JSON API
}

interface TrefisAnalysesProps {
  sector: 'defense' | 'health' | 'energy';
}

export function TrefisAnalyses({ sector }: TrefisAnalysesProps) {

  // Fetch actionable analyses from JSON endpoints
  const { data: actionableAnalyses, isLoading: loadingActionable, error: actionableError } = useQuery({
    queryKey: ['trefis', sector, 'actionable'],
    queryFn: async () => {
      const response = await fetch(`/api/trefis?sector=${sector}&type=actionable`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch actionable analyses from JSON endpoints');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour - matches cache duration
    retry: false, // Don't retry on failure - respect no-fallback policy
  });

  // Fetch featured analyses from JSON endpoints
  const { data: featuredAnalyses, isLoading: loadingFeatured, error: featuredError } = useQuery({
    queryKey: ['trefis', sector, 'featured'],
    queryFn: async () => {
      const response = await fetch(`/api/trefis?sector=${sector}&type=featured`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch featured analyses from JSON endpoints');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour - matches cache duration
    retry: false, // Don't retry on failure - respect no-fallback policy
  });

  // Handle analysis selection - open in new tab with proper no-login-required URLs
  const handleAnalysisClick = (analysis: TrefisAnalysis) => {
    // Log click for analytics
    console.log(`Opening Trefis analysis: ${analysis.title.substring(0, 50)}...`);
    
    // Open in new tab with security attributes
    window.open(analysis.url, '_blank', 'noopener,noreferrer');
  };

  // Get sector display name
  const getSectorDisplayName = (sector: string) => {
    switch (sector) {
      case 'defense': return 'Defense';
      case 'health': return 'Healthcare';
      case 'energy': return 'Energy';
      default: return sector;
    }
  };

  // Handle loading and error states
  const isLoading = loadingActionable || loadingFeatured;
  const hasError = actionableError || featuredError;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading Trefis data from JSON endpoints...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    const errorMessage = actionableError?.message || featuredError?.message || 'Unknown error';
    const isNetworkInspectionRequired = errorMessage.includes('Network inspection required');
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              Trefis Analysis Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isNetworkInspectionRequired ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Trefis integration is being updated to use HTML payload extraction method.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-sm text-green-800 dark:text-green-200 mb-2">
                      New Integration Method:
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Now extracting data directly from window.pageLoaderData.payload in Trefis HTML pages for more reliable access to authentic analysis data.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Unable to load authentic Trefis analysis data. Checking HTML payload extraction.
                </p>
              )}
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">Technical Details</summary>
                <p className="mt-2 text-red-600 font-mono">
                  {errorMessage}
                </p>
              </details>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actionable Analyses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Actionable {getSectorDisplayName(sector)} Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {actionableAnalyses && actionableAnalyses.length > 0 ? (
              actionableAnalyses.map((analysis: TrefisAnalysis, index: number) => (
                <Button
                  key={`actionable-${index}`}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleAnalysisClick(analysis)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <ExternalLink className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm leading-relaxed">{analysis.title}</span>
                      {analysis.value && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Performance Score: {analysis.value}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No actionable analyses available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Featured Analyses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Featured {getSectorDisplayName(sector)} Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {featuredAnalyses && featuredAnalyses.length > 0 ? (
              featuredAnalyses.map((analysis: TrefisAnalysis, index: number) => (
                <Button
                  key={`featured-${index}`}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleAnalysisClick(analysis)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <ExternalLink className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm leading-relaxed">{analysis.title}</span>
                      {analysis.value && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Performance Score: {analysis.value}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No featured analyses available</p>
            )}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}