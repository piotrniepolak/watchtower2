import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, TrendingUp, AlertTriangle, Shield, Users, Globe, BarChart3, Target, Zap, Pill } from "lucide-react";

// Import all original dashboard widgets
import MetricsCards from "@/components/metrics-cards";
import ActiveConflictsList from "@/components/active-conflicts-list";
import ConflictSeverityMap from "@/components/conflict-severity-map";
import EnhancedChartsSection from "@/components/enhanced-charts-section";
import DailyNews from "@/components/daily-news";
import ConflictTimeline from "@/components/conflict-timeline";
import MultiSectorNavigation from "@/components/multi-sector-navigation";
import WorldHealthMapSimple from "@/components/world-health-map-simple";
import PharmaIntelligenceBrief from "@/components/pharma-intelligence-brief";

interface EnhancedMultiSectorDashboardProps {
  defaultSector?: string;
}

interface StockData {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
}

export default function EnhancedMultiSectorDashboard({ defaultSector = "defense" }: EnhancedMultiSectorDashboardProps) {
  const [location] = useLocation();
  
  // Initialize sector from URL parameters immediately to prevent flash
  const getInitialSector = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sectorParam = urlParams.get('sector');
    if (sectorParam && ['defense', 'health', 'energy'].includes(sectorParam)) {
      return sectorParam;
    }
    return defaultSector;
  };
  
  const [currentSector, setCurrentSector] = useState(getInitialSector);

  // Update sector when location changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sectorParam = urlParams.get('sector');
    if (sectorParam && ['defense', 'health', 'energy'].includes(sectorParam)) {
      setCurrentSector(sectorParam);
    }
  }, [location]);

  // Fetch sector-specific data
  const { data: sectorStocks = [], isLoading: stocksLoading } = useQuery<StockData[]>({
    queryKey: [`/api/sectors/${currentSector}/stocks`],
  });

  const { data: sectorMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: [`/api/sectors/${currentSector}/metrics`],
  });

  // Defense sector gets all original widgets
  const renderDefenseWidgets = () => (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <MetricsCards />

      {/* Market Overview Section */}
      <div className="w-full mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Defense Market Performance
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time performance of defense and aerospace stocks
          </p>
        </div>
        <EnhancedChartsSection sector={currentSector} />
      </div>



      {/* Active Global Conflicts Section */}
      <div className="w-full mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Active Global Conflicts
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time monitoring of global conflicts affecting defense markets
          </p>
        </div>
        <ActiveConflictsList />
      </div>

      {/* News Section */}
      <div className="w-full mb-8">
        <DailyNews />
      </div>

      {/* Additional Analysis Grid */}
      <div className="grid grid-cols-1 gap-6">
        <ConflictSeverityMap />
      </div>

      {/* Bottom Full Width Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <ConflictTimeline />
      </div>
    </div>
  );

  // Health sector widgets
  const renderHealthWidgets = () => (
    <div className="space-y-6">
      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Outbreaks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pharma Stocks</CardTitle>
            <Pill className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectorStocks.length}</div>
            <p className="text-xs text-muted-foreground">Healthcare companies tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Cases</CardTitle>
            <Globe className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">Past 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">R&D Pipeline</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Drugs in development</p>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview Section */}
      <div className="w-full mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Healthcare Market Performance
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time performance of pharmaceutical and healthcare stocks
          </p>
        </div>
        <EnhancedChartsSection sector={currentSector} />
      </div>

      {/* Pharma Intelligence Brief Section */}
      <div className="w-full mb-8">
        <PharmaIntelligenceBrief />
      </div>

      {/* Global Health Map Section */}
      <div className="w-full mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Global Health Map - WHO Statistical Annex Data
          </h2>
          <p className="text-sm text-slate-600">
            Real-time global health monitoring with comprehensive WHO indicators and pharmaceutical market insights
          </p>
        </div>
        <WorldHealthMapSimple />
      </div>

      {/* Health-specific content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="h-5 w-5 text-green-600" />
              <span>Disease Outbreaks</span>
            </CardTitle>
            <CardDescription>Global health emergencies and their impact on pharmaceutical markets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">COVID-19 Variant Surge</p>
                  <p className="text-sm text-muted-foreground">Asia-Pacific Region</p>
                </div>
                <Badge variant="destructive">High</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Influenza H5N1</p>
                  <p className="text-sm text-muted-foreground">North America</p>
                </div>
                <Badge variant="secondary">Medium</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mpox Outbreak</p>
                  <p className="text-sm text-muted-foreground">Sub-Saharan Africa</p>
                </div>
                <Badge variant="outline">Low</Badge>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );

  // Energy sector widgets  
  const renderEnergyWidgets = () => (
    <div className="space-y-6">
      {/* Energy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Regulations</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Stocks</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectorStocks.length}</div>
            <p className="text-xs text-muted-foreground">Oil & gas companies tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oil Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$78.45</div>
            <p className="text-xs text-muted-foreground">+2.1% today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Cost</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.1B</div>
            <p className="text-xs text-muted-foreground">Industry estimate</p>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview Section */}
      <div className="w-full mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Energy Market Performance
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Real-time performance of oil, gas, and energy stocks
          </p>
        </div>
        <EnhancedChartsSection sector={currentSector} />
      </div>

      {/* Energy-specific content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <span>Regulatory Changes</span>
            </CardTitle>
            <CardDescription>Recent oil & gas regulations affecting market dynamics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">EU Carbon Tax Extension</p>
                  <p className="text-sm text-muted-foreground">European Union</p>
                </div>
                <Badge variant="destructive">High Impact</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">US Offshore Drilling Permits</p>
                  <p className="text-sm text-muted-foreground">Gulf of Mexico</p>
                </div>
                <Badge variant="secondary">Medium Impact</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Clean Energy Subsidies</p>
                  <p className="text-sm text-muted-foreground">Global Initiative</p>
                </div>
                <Badge variant="outline">Low Impact</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Energy Market Trends</span>
            </CardTitle>
            <CardDescription>Key trends affecting energy sector performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Oil Price Volatility</p>
                  <p className="text-sm text-muted-foreground">WTI Crude fluctuations</p>
                </div>
                <Badge variant="secondary">Moderate</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Renewable Energy Growth</p>
                  <p className="text-sm text-muted-foreground">Solar and wind expansion</p>
                </div>
                <Badge variant="default">Rising</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Natural Gas Demand</p>
                  <p className="text-sm text-muted-foreground">Industrial consumption</p>
                </div>
                <Badge variant="outline">Stable</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSectorContent = () => {
    switch (currentSector) {
      case "defense":
        return renderDefenseWidgets();
      case "health":
        return renderHealthWidgets();
      case "energy":
        return renderEnergyWidgets();
      default:
        return renderDefenseWidgets();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <MultiSectorNavigation 
        currentSector={currentSector} 
        onSectorChange={setCurrentSector} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderSectorContent()}
      </main>
    </div>
  );
}