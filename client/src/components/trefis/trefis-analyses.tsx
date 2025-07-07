import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ExternalLink, TrendingUp, BarChart3 } from 'lucide-react';

/**
 * TrefisAnalyses Component
 * Displays actionable and featured analyses for a specific sector
 * Each analysis opens in a modal with iframe to show full Trefis content
 */

interface TrefisAnalysis {
  title: string;
  url: string;
}

interface TrefisAnalysesProps {
  sector: 'defense' | 'health' | 'energy';
}

export function TrefisAnalyses({ sector }: TrefisAnalysesProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<TrefisAnalysis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch actionable analyses for the sector
  const { data: actionableAnalyses, isLoading: loadingActionable } = useQuery({
    queryKey: ['trefis', sector, 'actionable'],
    queryFn: async () => {
      const response = await fetch(`/api/trefis?sector=${sector}&type=actionable`);
      if (!response.ok) {
        throw new Error('Failed to fetch actionable analyses');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Fetch featured analyses for the sector
  const { data: featuredAnalyses, isLoading: loadingFeatured } = useQuery({
    queryKey: ['trefis', sector, 'featured'],
    queryFn: async () => {
      const response = await fetch(`/api/trefis?sector=${sector}&type=featured`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured analyses');
      }
      return response.json();
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

  // Get sector display name
  const getSectorDisplayName = (sector: string) => {
    switch (sector) {
      case 'defense': return 'Defense';
      case 'health': return 'Healthcare';
      case 'energy': return 'Energy';
      default: return sector;
    }
  };

  // Show loading state while data is being fetched
  if (loadingActionable || loadingFeatured) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading Trefis analyses...</span>
        </div>
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
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleAnalysisClick(analysis)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <ExternalLink className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{analysis.title}</span>
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
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleAnalysisClick(analysis)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <ExternalLink className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{analysis.title}</span>
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No featured analyses available</p>
            )}
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
    </div>
  );
}