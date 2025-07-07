import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, BarChart3, AlertCircle } from 'lucide-react';

/**
 * TrefisOverview Component - JSON Endpoint Integration
 * Displays best and worst performing companies from reverse-engineered Trefis JSON APIs
 * Used on the homepage for quick sector performance overview across all three sectors
 */

interface TrefisAnalysis {
  title: string;
  url: string;
  value?: number;
}

interface TrefisBestWorst {
  best: TrefisAnalysis | null;
  worst: TrefisAnalysis | null;
}

export function TrefisOverview() {

  // Fetch best/worst performers from JSON endpoints for all three sectors
  const { data: defenseData, isLoading: loadingDefense, error: defenseError } = useQuery({
    queryKey: ['trefis', 'defense', 'bestWorst'],
    queryFn: async () => {
      const response = await fetch('/api/trefis?sector=defense&type=bestWorst');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch defense data from JSON endpoints');
      }
      return response.json() as TrefisBestWorst;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour - matches cache duration
    retry: false, // Don't retry on failure - respect no-fallback policy
  });

  const { data: healthData, isLoading: loadingHealth, error: healthError } = useQuery({
    queryKey: ['trefis', 'health', 'bestWorst'],
    queryFn: async () => {
      const response = await fetch('/api/trefis?sector=health&type=bestWorst');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch health data from JSON endpoints');
      }
      return response.json() as TrefisBestWorst;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour - matches cache duration
    retry: false, // Don't retry on failure - respect no-fallback policy
  });

  const { data: energyData, isLoading: loadingEnergy, error: energyError } = useQuery({
    queryKey: ['trefis', 'energy', 'bestWorst'],
    queryFn: async () => {
      const response = await fetch('/api/trefis?sector=energy&type=bestWorst');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch energy data from JSON endpoints');
      }
      return response.json() as TrefisBestWorst;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour - matches cache duration
    retry: false, // Don't retry on failure - respect no-fallback policy
  });

  // Handle analysis selection - open in new tab with no-login-required URLs
  const handleAnalysisClick = (analysis: TrefisAnalysis) => {
    // Log click for analytics
    console.log(`Opening Trefis analysis: ${analysis.title.substring(0, 50)}...`);
    
    // Open in new tab with security attributes
    window.open(analysis.url, '_blank', 'noopener,noreferrer');
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
            <span className="ml-2">Loading Trefis data from JSON endpoints...</span>
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
                  Real Trefis JSON endpoints must be discovered via browser network inspection.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">
                    Setup Required:
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Use browser DevTools to discover working Trefis API endpoints, then update the service configuration.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Unable to load authentic Trefis market performance data from configured endpoints.
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
              {defenseData?.best && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-green-200 hover:border-green-300"
                  onClick={() => handleAnalysisClick(defenseData.best)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Top Performer</p>
                        <p className="text-sm font-medium leading-tight">{defenseData.best.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Worst Performer */}
              {defenseData?.worst && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-red-200 hover:border-red-300"
                  onClick={() => handleAnalysisClick(defenseData.worst)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-red-600 font-medium">Underperformer</p>
                        <p className="text-sm font-medium leading-tight">{defenseData.worst.title}</p>
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
              {healthData?.best && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-green-200 hover:border-green-300"
                  onClick={() => handleAnalysisClick(healthData.best)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Top Performer</p>
                        <p className="text-sm font-medium leading-tight">{healthData.best.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Worst Performer */}
              {healthData?.worst && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-red-200 hover:border-red-300"
                  onClick={() => handleAnalysisClick(healthData.worst)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-red-600 font-medium">Underperformer</p>
                        <p className="text-sm font-medium leading-tight">{healthData.worst.title}</p>
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
              {energyData?.best && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-green-200 hover:border-green-300"
                  onClick={() => handleAnalysisClick(energyData.best)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Top Performer</p>
                        <p className="text-sm font-medium leading-tight">{energyData.best.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Worst Performer */}
              {energyData?.worst && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-red-200 hover:border-red-300"
                  onClick={() => handleAnalysisClick(energyData.worst)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-red-600 font-medium">Underperformer</p>
                        <p className="text-sm font-medium leading-tight">{energyData.worst.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}