
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SourceLinks } from "./source-links";
import { 
  Shield, 
  Pill, 
  Zap, 
  RefreshCw, 
  ChevronDown, 
  FileText, 
  Globe, 
  BarChart3, 
  TrendingUp,
  AlertTriangle,
  Building2
} from "lucide-react";

interface UnifiedBriefData {
  id: number;
  title: string;
  summary: string;
  date: string;
  createdAt: string;
  keyDevelopments: string[];
  marketImpact: string;
  geopoliticalAnalysis: string;
  conflictUpdates?: any[];
  defenseStockHighlights?: any[];
  pharmaceuticalStockHighlights?: any[];
  energyStockHighlights?: any[];
  sources?: Array<{
    title: string;
    url: string;
    domain: string;
    category: string;
  }>;
}

const sectorConfig = {
  defense: {
    name: "Defense Intelligence",
    icon: Shield,
    color: "from-blue-600 to-purple-600",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    endpoint: "/api/news/defense/today"
  },
  pharma: {
    name: "Pharmaceutical Intelligence", 
    icon: Pill,
    color: "from-green-600 to-teal-600",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    endpoint: "/api/news/pharma/today"
  },
  energy: {
    name: "Energy Intelligence",
    icon: Zap,
    color: "from-orange-600 to-red-600",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50", 
    borderColor: "border-orange-200",
    endpoint: "/api/news/energy/today"
  }
};

export function UnifiedIntelligenceDashboard() {
  const [selectedSector, setSelectedSector] = useState<keyof typeof sectorConfig>("defense");
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [developmentsOpen, setDevelopmentsOpen] = useState(false);
  const [stocksOpen, setStocksOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [geoOpen, setGeoOpen] = useState(false);

  const config = sectorConfig[selectedSector];
  const IconComponent = config.icon;

  // Fetch intelligence brief for selected sector
  const { data: briefData, isLoading, refetch } = useQuery<UnifiedBriefData>({
    queryKey: [config.endpoint],
    staleTime: 0,
    gcTime: 0,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    const generateEndpoint = config.endpoint.replace("/today", "/generate");
    try {
      const response = await fetch(generateEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        await refetch();
      } else {
        console.error("Failed to generate intelligence brief");
      }
    } catch (error) {
      console.error("Error generating intelligence brief:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStockHighlights = () => {
    if (selectedSector === 'defense') return briefData?.defenseStockHighlights || [];
    if (selectedSector === 'pharma') return briefData?.pharmaceuticalStockHighlights || [];
    if (selectedSector === 'energy') return briefData?.energyStockHighlights || [];
    return [];
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            Loading {config.name}...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sector Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Global Intelligence Center
            </span>
            <Badge variant="secondary">Real-time AI Intelligence</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {Object.entries(sectorConfig).map(([key, sector]) => {
              const SectorIcon = sector.icon;
              return (
                <Button
                  key={key}
                  variant={selectedSector === key ? "default" : "outline"}
                  onClick={() => setSelectedSector(key as keyof typeof sectorConfig)}
                  className="flex items-center gap-2"
                >
                  <SectorIcon className="h-4 w-4" />
                  {sector.name}
                </Button>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${config.textColor}`}>
              {config.name}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {new Date().toLocaleDateString()}
              </Badge>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                size="sm"
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Brief
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {briefData ? (
        <div className="space-y-4">
          {/* Executive Summary */}
          <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
                <div className="flex items-center gap-3">
                  <FileText className={`h-5 w-5 ${config.textColor}`} />
                  <span className="font-medium text-base">Executive Summary</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className={`${config.bgColor} rounded-lg p-4`}>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {briefData.summary}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge className={config.borderColor}>
                    Real-time Intelligence
                  </Badge>
                  <Badge variant="outline">
                    Powered by Perplexity AI
                  </Badge>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Key Developments */}
          <Collapsible open={developmentsOpen} onOpenChange={setDevelopmentsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
                <div className="flex items-center gap-3">
                  <TrendingUp className={`h-5 w-5 ${config.textColor}`} />
                  <span className="font-medium text-base">Key Developments</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${developmentsOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className={`${config.bgColor} rounded-lg p-4`}>
                {briefData.keyDevelopments && briefData.keyDevelopments.length > 0 ? (
                  <ul className="space-y-3">
                    {briefData.keyDevelopments.map((development, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 ${config.textColor.replace('text-', 'bg-')} rounded-full mt-2 flex-shrink-0`} />
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {development}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No key developments available</p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Stock Highlights */}
          {getStockHighlights().length > 0 && (
            <Collapsible open={stocksOpen} onOpenChange={setStocksOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
                  <div className="flex items-center gap-3">
                    <Building2 className={`h-5 w-5 ${config.textColor}`} />
                    <span className="font-medium text-base">Companies Mentioned</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${stocksOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className={`${config.bgColor} rounded-lg p-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getStockHighlights().map((stock: any, index: number) => (
                      <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex flex-col">
                            <span className={`font-bold ${config.textColor}`}>{stock.symbol}</span>
                            <span className="text-xs text-muted-foreground truncate">{stock.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${stock.price?.toFixed(2) || '0.00'}</div>
                            <div className={`text-xs ${(stock.changePercent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {(stock.changePercent || 0) >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {stock.reason || 'Mentioned in intelligence brief'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Market Impact */}
          <Collapsible open={marketOpen} onOpenChange={setMarketOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
                <div className="flex items-center gap-3">
                  <BarChart3 className={`h-5 w-5 ${config.textColor}`} />
                  <span className="font-medium text-base">Market Impact Analysis</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${marketOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className={`${config.bgColor} rounded-lg p-4`}>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {briefData.marketImpact || 'No market impact analysis available'}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Geopolitical Analysis */}
          <Collapsible open={geoOpen} onOpenChange={setGeoOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
                <div className="flex items-center gap-3">
                  <Globe className={`h-5 w-5 ${config.textColor}`} />
                  <span className="font-medium text-base">Geopolitical Analysis</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${geoOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className={`${config.bgColor} rounded-lg p-4`}>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {briefData.geopoliticalAnalysis || 'No geopolitical analysis available'}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Sector-specific Sources */}
          <div className="mt-6">
            <SourceLinks 
              sources={briefData.sources || []}
              title={`${config.name} Sources & References`}
            />
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No {config.name.toLowerCase()} brief available. Generate a new brief using real-time data.
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <IconComponent className="h-4 w-4 mr-2" />
                  Generate {config.name} Brief
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
