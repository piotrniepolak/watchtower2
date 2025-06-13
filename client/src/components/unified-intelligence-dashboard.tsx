import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Pill, Zap, TrendingUp, TrendingDown, ExternalLink, RefreshCw } from "lucide-react";

interface UnifiedBriefData {
  id: number;
  title: string;
  summary: string;
  date: string;
  keyDevelopments: string[];
  marketImpact: string;
  geopoliticalAnalysis: string;
  defenseStockHighlights?: Array<{
    symbol: string;
    name: string;
    change: number;
    changePercent: number;
    reason: string;
  }>;
  pharmaceuticalStockHighlights?: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    reason: string;
  }>;
  energyStockHighlights?: Array<{
    symbol: string;
    name: string;
    change: number;
    changePercent: number;
    reason: string;
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
  
  const config = sectorConfig[selectedSector];
  const IconComponent = config.icon;

  // Fetch intelligence brief for selected sector
  const { data: briefData, isLoading, refetch } = useQuery<UnifiedBriefData>({
    queryKey: [config.endpoint],
    staleTime: 0,
    gcTime: 0,
  });

  const handleGenerate = async () => {
    const generateEndpoint = config.endpoint.replace("/today", "/generate");
    try {
      const response = await fetch(generateEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error("Error generating brief:", error);
    }
  };

  const getStockHighlights = () => {
    if (selectedSector === "defense") return briefData?.defenseStockHighlights || [];
    if (selectedSector === "pharma") return briefData?.pharmaceuticalStockHighlights || [];
    if (selectedSector === "energy") return briefData?.energyStockHighlights || [];
    return [];
  };

  const formatContent = (content: string) => {
    // Clean formatting artifacts while preserving links
    return content
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\[([^\]]+)\]/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  };

  return (
    <div className="space-y-6">
      {/* Header with Sector Selector */}
      <Card className={`${config.borderColor} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`bg-gradient-to-r ${config.color} text-white p-3 rounded-lg`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Global Intelligence Center</CardTitle>
                <CardDescription>Comprehensive analysis across defense, pharmaceutical, and energy sectors</CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={selectedSector} onValueChange={(value: keyof typeof sectorConfig) => setSelectedSector(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{config.name}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defense">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Defense Intelligence</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pharma">
                    <div className="flex items-center space-x-2">
                      <Pill className="w-4 h-4" />
                      <span>Pharmaceutical Intelligence</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="energy">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Energy Intelligence</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleGenerate} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Fresh Brief
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading intelligence brief...</p>
          </CardContent>
        </Card>
      ) : briefData ? (
        <div className="grid gap-6">
          {/* Brief Title and Summary */}
          <Card className={`${config.bgColor}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{briefData.title}</span>
                <Badge variant="secondary">{briefData.date}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatContent(briefData.summary) }}
              />
            </CardContent>
          </Card>

          {/* Key Developments */}
          <Card>
            <CardHeader>
              <CardTitle>Key Developments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {briefData.keyDevelopments.map((development, index) => (
                  <div key={index} className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {formatContent(development)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stock Highlights */}
          {getStockHighlights().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedSector === "defense" && "Defense Stocks Mentioned"}
                  {selectedSector === "pharma" && "Pharmaceutical Stocks Mentioned"}
                  {selectedSector === "energy" && "Energy Stocks Mentioned"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {getStockHighlights().map((stock: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-sm">{stock.symbol}</span>
                          <span className="text-sm text-gray-600">{stock.name}</span>
                          {stock.price && (
                            <span className="text-sm font-medium">${stock.price.toFixed(2)}</span>
                          )}
                        </div>
                        {stock.reason && (
                          <p className="text-xs text-gray-500 mt-1">{formatContent(stock.reason)}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {stock.changePercent !== undefined && (
                          <div className={`flex items-center space-x-1 ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span className="text-xs font-medium">
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Impact and Geopolitical Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(briefData.marketImpact) }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geopolitical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(briefData.geopoliticalAnalysis) }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">No intelligence brief available for {config.name.toLowerCase()}</p>
            <Button onClick={handleGenerate} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Brief
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}