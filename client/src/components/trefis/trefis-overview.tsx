import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

/**
 * TrefisOverview Component
 * Displays best and worst performing companies across all three sectors
 * Used on the homepage for quick sector performance overview
 */

interface TrefisAnalysis {
  title: string;
  url: string;
}

interface TrefisBestWorst {
  best: TrefisAnalysis;
  worst: TrefisAnalysis;
}

export function TrefisOverview() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<TrefisAnalysis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch best/worst data for all three sectors
  const { data: defenseData, isLoading: loadingDefense } = useQuery({
    queryKey: ['trefis', 'defense', 'bestWorst'],
    queryFn: async () => {
      const response = await fetch('/api/trefis?sector=defense&type=bestWorst');
      if (!response.ok) throw new Error('Failed to fetch defense data');
      return response.json() as TrefisBestWorst;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: healthData, isLoading: loadingHealth } = useQuery({
    queryKey: ['trefis', 'health', 'bestWorst'],
    queryFn: async () => {
      const response = await fetch('/api/trefis?sector=health&type=bestWorst');
      if (!response.ok) throw new Error('Failed to fetch health data');
      return response.json() as TrefisBestWorst;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: energyData, isLoading: loadingEnergy } = useQuery({
    queryKey: ['trefis', 'energy', 'bestWorst'],
    queryFn: async () => {
      const response = await fetch('/api/trefis?sector=energy&type=bestWorst');
      if (!response.ok) throw new Error('Failed to fetch energy data');
      return response.json() as TrefisBestWorst;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Handle analysis selection and modal opening
  const handleAnalysisClick = (analysis: TrefisAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsModalOpen(true);
  };

  // Close modal and reset selected analysis
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnalysis(null);
  };

  // Show loading state while data is being fetched
  if (loadingDefense || loadingHealth || loadingEnergy) {
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
            <span className="ml-2">Loading market performance data...</span>
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

      {/* Analysis Modal with Iframe */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-[90vw] h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {selectedAnalysis?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 mt-4">
            {selectedAnalysis && (
              <iframe
                src={selectedAnalysis.url}
                className="w-full h-full border rounded-lg"
                title={selectedAnalysis.title}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}