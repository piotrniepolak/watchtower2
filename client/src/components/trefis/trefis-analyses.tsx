import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ExternalLink, TrendingUp, BarChart3, AlertCircle, X } from 'lucide-react';

/**
 * TrefisAnalyses Component - Enhanced Scraping with Modal Integration
 * Uses refined pattern matching for ticker-based analysis extraction
 * Each analysis opens in modal iframe for direct access
 */

interface TrefisAnalysis {
  ticker: string;
  title: string;
  url: string;
  date?: string;
  value?: number;
}

interface TrefisAnalysesProps {
  sector: 'defense' | 'health' | 'energy';
}

export function TrefisAnalyses({ sector }: TrefisAnalysesProps) {
  // Modal state for iframe display
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  // Fetch actionable analyses from refined scraping service
  const { data: actionableAnalyses, isLoading: loadingActionable, error: actionableError } = useQuery({
    queryKey: ['trefis', sector, 'actionable'],
    queryFn: async () => {
      const response = await fetch(`/api/trefis?sector=${sector}&type=actionable`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch actionable analyses from refined scraping');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // 30 minutes cache for dynamic content
    retry: false,
  });

  // Fetch featured analyses from refined scraping service
  const { data: featuredAnalyses, isLoading: loadingFeatured, error: featuredError } = useQuery({
    queryKey: ['trefis', sector, 'featured'],
    queryFn: async () => {
      const response = await fetch(`/api/trefis?sector=${sector}&type=featured`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch featured analyses from refined scraping');
      }
      return response.json();
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
          <span className="ml-2 text-lg">Loading Trefis analyses using enhanced scraping...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    const errorMessage = actionableError?.message || featuredError?.message || 'Unknown error';
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Trefis Analysis Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-600">
                Error loading Trefis analysis data: {errorMessage}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="w-full"
              >
                Retry Loading
              </Button>
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
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Actionable {getSectorDisplayName(sector)} Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {actionableAnalyses && actionableAnalyses.length > 0 ? (
              actionableAnalyses.map((analysis: TrefisAnalysis, index: number) => (
                <Button
                  key={`${analysis.ticker}-${index}`}
                  variant="link"
                  onClick={() => handleAnalysisClick(analysis)}
                  className="justify-start text-left h-auto p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-blue-600">
                      {analysis.ticker}: {analysis.title}
                    </span>
                    {analysis.date && (
                      <span className="text-sm text-slate-500 mt-1">
                        Published: {analysis.date}
                      </span>
                    )}
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">
                No actionable analyses found for {getSectorDisplayName(sector)} sector
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Featured Analyses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Featured {getSectorDisplayName(sector)} Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {featuredAnalyses && featuredAnalyses.length > 0 ? (
              featuredAnalyses.map((analysis: TrefisAnalysis, index: number) => (
                <Button
                  key={`${analysis.ticker}-${index}`}
                  variant="link"
                  onClick={() => handleAnalysisClick(analysis)}
                  className="justify-start text-left h-auto p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-green-600">
                      {analysis.ticker}: {analysis.title}
                    </span>
                    {analysis.date && (
                      <span className="text-sm text-slate-500 mt-1">
                        Published: {analysis.date}
                      </span>
                    )}
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">
                No featured analyses found for {getSectorDisplayName(sector)} sector
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal for iframe display */}
      <Dialog open={!!openUrl} onOpenChange={() => setOpenUrl(null)}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Trefis Analysis</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenUrl(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
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
    </div>
  );
}