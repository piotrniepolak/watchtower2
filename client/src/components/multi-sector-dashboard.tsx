import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import SectorSelector from "./sector-selector";
import { SectorConfig } from "@shared/sectors";

interface SectorMetrics {
  sector: string;
  stockCount: number;
  avgStockChange: number;
  activeConflicts?: number;
  totalConflicts?: number;
  activeOutbreaks?: number;
  totalEvents?: number;
  activeRegulations?: number;
  totalRegulations?: number;
  lastUpdated: string;
}

interface Stock {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: string;
}

export default function MultiSectorDashboard() {
  const [activeSector, setActiveSector] = useState("defense");

  const { data: sectors = [] } = useQuery<SectorConfig[]>({
    queryKey: ["/api/sectors"],
  });

  const { data: metrics } = useQuery<SectorMetrics>({
    queryKey: [`/api/sectors/${activeSector}/metrics`],
    enabled: !!activeSector,
    refetchInterval: 30000,
  });

  const { data: stocks = [] } = useQuery<Stock[]>({
    queryKey: [`/api/sectors/${activeSector}/stocks`],
    enabled: !!activeSector,
    refetchInterval: 30000,
  });

  const currentSector = sectors.find(s => s.key === activeSector);

  const formatPercentage = (value: number) => {
    const formatted = value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
    return formatted;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const renderSectorSpecificMetrics = () => {
    if (!metrics) return null;

    switch (activeSector) {
      case 'defense':
        return (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Conflicts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeConflicts}</div>
                <p className="text-xs text-muted-foreground">
                  of {metrics.totalConflicts} total conflicts
                </p>
              </CardContent>
            </Card>
          </>
        );
      case 'health':
        return (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Outbreaks</CardTitle>
                <Activity className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeOutbreaks}</div>
                <p className="text-xs text-muted-foreground">
                  of {metrics.totalEvents} total health events
                </p>
              </CardContent>
            </Card>
          </>
        );
      case 'energy':
        return (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Regulations</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeRegulations}</div>
                <p className="text-xs text-muted-foreground">
                  of {metrics.totalRegulations} total regulations
                </p>
              </CardContent>
            </Card>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sector Selection */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Intelligence Platform
        </h1>
        <p className="text-muted-foreground mb-6">
          Monitor correlations between global events and market movements across multiple sectors
        </p>
        <SectorSelector 
          selectedSector={activeSector}
          onSectorChange={setActiveSector}
        />
      </div>

      {/* Current Sector Dashboard */}
      {currentSector && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentSector.primaryColor }}
            />
            <h2 className="text-2xl font-semibold">{currentSector.label}</h2>
            <Badge variant="outline">{activeSector}</Badge>
          </div>

          {/* Metrics Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tracked Stocks</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.stockCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {currentSector.dataSources.stocks.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Stock Change</CardTitle>
                {getChangeIcon(metrics?.avgStockChange || 0)}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getChangeColor(metrics?.avgStockChange || 0)}`}>
                  {formatPercentage(metrics?.avgStockChange || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  24-hour average change
                </p>
              </CardContent>
            </Card>

            {renderSectorSpecificMetrics()}
          </div>

          {/* Sector Data Tabs */}
          <Tabs defaultValue="stocks" className="space-y-4">
            <TabsList>
              <TabsTrigger value="stocks">Market Data</TabsTrigger>
              <TabsTrigger value="events">
                {activeSector === 'defense' ? 'Conflicts' : 
                 activeSector === 'health' ? 'Health Events' : 'Regulations'}
              </TabsTrigger>
              <TabsTrigger value="correlations">Correlations</TabsTrigger>
            </TabsList>

            <TabsContent value="stocks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stocks.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-semibold">{stock.symbol}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {stock.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${stock.price.toFixed(2)}</div>
                          <div className={`text-sm ${getChangeColor(stock.changePercent)}`}>
                            {formatPercentage(stock.changePercent)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {activeSector === 'defense' ? 'Recent Conflicts' : 
                     activeSector === 'health' ? 'Recent Health Events' : 'Recent Regulations'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    {activeSector === 'defense' ? 'Conflict data integration' : 
                     activeSector === 'health' ? 'Health events data integration' : 'Regulation data integration'} 
                    {' '}in progress. 
                    This will display real-time {activeSector === 'defense' ? 'conflict updates' : 
                     activeSector === 'health' ? 'health alerts' : 'regulatory changes'}.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="correlations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Event-Stock Correlations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Correlation analysis engine processing {currentSector.label.toLowerCase()} data.
                    This will show statistical relationships between events and stock movements.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}