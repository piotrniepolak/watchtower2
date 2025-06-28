import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Calendar, TrendingUp, Globe, Building } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DailySectorBrief {
  id: number;
  sector: 'defense' | 'pharmaceutical' | 'energy';
  date: string;
  executiveSummary: string;
  keyDevelopments: string[];
  geopoliticalAnalysis: string;
  marketImpactAnalysis: string;
  references: string[];
  generatedAt: string;
  wordCounts: {
    executiveSummary: number;
    geopoliticalAnalysis: number;
    marketImpactAnalysis: number;
  };
}

interface DailySectorBriefProps {
  sector: 'defense' | 'pharmaceutical' | 'energy';
}

export function DailySectorBrief({ sector }: DailySectorBriefProps) {
  const queryClient = useQueryClient();
  
  const { data: brief, isLoading, error } = useQuery<DailySectorBrief>({
    queryKey: [`/api/daily-briefs/${sector}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const regenerateMutation = useMutation({
    mutationFn: () => 
      fetch(`/api/daily-briefs/${sector}/regenerate`, { method: 'POST' })
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/daily-briefs/${sector}`] });
    }
  });

  const getSectorInfo = (sector: string) => {
    switch (sector) {
      case 'defense':
        return {
          title: 'Defense Sector Brief',
          color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          icon: <Building className="h-5 w-5" />
        };
      case 'pharmaceutical':
        return {
          title: 'Pharmaceutical Sector Brief',
          color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          icon: <TrendingUp className="h-5 w-5" />
        };
      case 'energy':
        return {
          title: 'Energy Sector Brief',
          color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: <Globe className="h-5 w-5" />
        };
      default:
        return {
          title: 'Sector Brief',
          color: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
          badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          icon: <Building className="h-5 w-5" />
        };
    }
  };

  const sectorInfo = getSectorInfo(sector);

  if (isLoading) {
    return (
      <Card className={`${sectorInfo.color} animate-pulse`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-300 rounded w-48"></div>
            <div className="h-8 bg-gray-300 rounded w-24"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-200">
            Error Loading Daily Brief
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 dark:text-red-300">
            Failed to load the daily {sector} sector brief. Please try again.
          </p>
          <Button 
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!brief) {
    return null;
  }

  return (
    <Card className={sectorInfo.color}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {sectorInfo.icon}
            {sectorInfo.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={sectorInfo.badgeColor}>
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(brief.date).toLocaleDateString()}
            </Badge>
            <Button
              onClick={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Executive Summary
            <Badge variant="secondary" className="text-xs">
              {brief.wordCounts.executiveSummary} words
            </Badge>
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {brief.executiveSummary}
          </p>
        </div>

        <Separator />

        {/* Key Developments */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Key Developments
            <Badge variant="secondary" className="text-xs">
              {brief.keyDevelopments.length} items
            </Badge>
          </h3>
          <ul className="space-y-2">
            {brief.keyDevelopments.map((development, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {development}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Geopolitical Analysis */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Geopolitical Analysis
            <Badge variant="secondary" className="text-xs">
              {brief.wordCounts.geopoliticalAnalysis} words
            </Badge>
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {brief.geopoliticalAnalysis}
          </p>
        </div>

        <Separator />

        {/* Market Impact Analysis */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Market Impact Analysis
            <Badge variant="secondary" className="text-xs">
              {brief.wordCounts.marketImpactAnalysis} words
            </Badge>
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {brief.marketImpactAnalysis}
          </p>
        </div>

        <Separator />

        {/* References */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Verified References
            <Badge variant="secondary" className="text-xs">
              {brief.references.length} sources
            </Badge>
          </h3>
          <div className="grid gap-2">
            {brief.references.map((reference, index) => (
              <a
                key={index}
                href={reference}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
              >
                {reference}
              </a>
            ))}
          </div>
        </div>

        {/* Generated timestamp */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Generated: {new Date(brief.generatedAt).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}