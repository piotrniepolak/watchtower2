import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, BarChart3, AlertCircle, X } from 'lucide-react';

/**
 * TrefisOverview Component - Enhanced Scraping with Modal Integration
 * Displays best and worst performing companies from refined ticker-based extraction
 * Used on the homepage for quick sector performance overview across all three sectors
 */

interface TrefisAnalysis {
  ticker: string;
  title: string;
  url: string;
  date?: string;
  value?: number;
}

interface TrefisBestWorst {
  best: TrefisAnalysis[];
  worst: TrefisAnalysis[];
}

export function TrefisOverview() {
  // Modal state for iframe display
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  // Fetch best/worst performers from enhanced scraping for all three sectors
  const { data: defenseData, isLoading: loadingDefense, error: defenseError } = useQuery({
    queryKey: ['trefis', 'defense', 'bestWorst'],
    queryFn: async () => {
      const response = await fetch('/api/trefis?sector=defense&type=bestworst');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch defense data from enhanced scraping');
      }
      return response.json() as TrefisBestWorst;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // 30 minutes cache for dynamic content
    retry: false
  });

  const { data: healthData, isLoading: loadingHealth, error: healthError } = useQuery({
    queryKey: ['trefis', 'health', 'bestWorst'],
    queryFn: async () => {
      const response = await fetch('/api/trefis?sector=health&type=bestworst');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch health data from enhanced scraping');
      }
      return response.json() as TrefisBestWorst;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // 30 minutes cache for dynamic content
    retry: false,
  });

  const { data: energyData, isLoading: loadingEnergy, error: energyError } = useQuery({
    queryKey: ['trefis', 'energy', 'bestWorst'],
    queryFn: async () => {
      const response = await fetch('/api/trefis?sector=energy&type=bestworst');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch energy data from enhanced scraping');
      }
      return response.json() as TrefisBestWorst;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // 30 minutes cache for dynamic content
    retry: false,
  });

  // Handle analysis selection - open in modal iframe for direct access
  const handleAnalysisClick = (analysis: TrefisAnalysis) => {
    console.log(`Opening Trefis analysis: ${analysis.ticker}: ${analysis.title.substring(0, 50)}...`);
    setOpenUrl(analysis.url);
  };

  // Handle loading and error states
  const isLoading = loadingDefense || loadingHealth || loadingEnergy;
  const hasError = defenseError || healthError || energyError;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Trefis Market Leaders & Underperformers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading Trefis data from cloud browser service...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    const errorMessage = defenseError?.message || healthError?.message || energyError?.message || 'Unknown error';
    const isNetworkInspectionRequired = errorMessage.includes('Network inspection required');
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            Trefis Market Data Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isNetworkInspectionRequired ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Trefis integration is using enhanced cloud browser service for JavaScript content extraction.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">
                    Enhanced Integration:
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Using Browserless.io cloud service with Cheerio HTML parsing for reliable extraction of ticker-based analysis data.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Unable to load authentic Trefis market performance data. Checking cloud browser service.
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
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Trefis Market Leaders & Underperformers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Defense Sector */}
            <div className="space-y-3">
              <h3 className="font-semibold text-center text-gray-700 dark:text-gray-300 border-b pb-2">
                Defense
              </h3>
              
              {/* Best Performer */}
              {defenseData?.best && defenseData.best.length > 0 && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-green-200 hover:border-green-300"
                  onClick={() => handleAnalysisClick(defenseData.best[0])}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Top Performer</p>
                        <p className="text-sm font-medium leading-tight">{defenseData.best[0].title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Worst Performer */}
              {defenseData?.worst && defenseData.worst.length > 0 && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-red-200 hover:border-red-300"
                  onClick={() => handleAnalysisClick(defenseData.worst[0])}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-red-600 font-medium">Underperformer</p>
                        <p className="text-sm font-medium leading-tight">{defenseData.worst[0].title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Healthcare Sector */}
            <div className="space-y-3">
              <h3 className="font-semibold text-center text-gray-700 dark:text-gray-300 border-b pb-2">
                Healthcare
              </h3>
              
              {/* Best Performer */}
              {healthData?.best && healthData.best.length > 0 && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-green-200 hover:border-green-300"
                  onClick={() => handleAnalysisClick(healthData.best[0])}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Top Performer</p>
                        <p className="text-sm font-medium leading-tight">{healthData.best[0].title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Worst Performer */}
              {healthData?.worst && healthData.worst.length > 0 && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-red-200 hover:border-red-300"
                  onClick={() => handleAnalysisClick(healthData.worst[0])}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-red-600 font-medium">Underperformer</p>
                        <p className="text-sm font-medium leading-tight">{healthData.worst[0].title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Energy Sector */}
            <div className="space-y-3">
              <h3 className="font-semibold text-center text-gray-700 dark:text-gray-300 border-b pb-2">
                Energy
              </h3>
              
              {/* Best Performer */}
              {energyData?.best && energyData.best.length > 0 && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-green-200 hover:border-green-300"
                  onClick={() => handleAnalysisClick(energyData.best[0])}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Top Performer</p>
                        <p className="text-sm font-medium leading-tight">{energyData.best[0].title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Worst Performer */}
              {energyData?.worst && energyData.worst.length > 0 && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-red-200 hover:border-red-300"
                  onClick={() => handleAnalysisClick(energyData.worst[0])}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-red-600 font-medium">Underperformer</p>
                        <p className="text-sm font-medium leading-tight">{energyData.worst[0].title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for iframe display */}
      <Dialog open={!!openUrl} onOpenChange={() => setOpenUrl(null)}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              Trefis Analysis
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenUrl(null)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          {openUrl && (
            <iframe
              src={openUrl}
              className="w-full h-full border-0 rounded-lg"
              frameBorder="0"
              title="Trefis Analysis"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}