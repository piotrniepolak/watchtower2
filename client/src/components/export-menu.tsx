import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Stock, Conflict, CorrelationEvent } from "@shared/schema";

interface ExportMenuProps {
  className?: string;
}

export default function ExportMenu({ className }: ExportMenuProps) {
  const { toast } = useToast();

  const { data: stocks = [] } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const { data: conflicts = [] } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const { data: correlationEvents = [] } = useQuery({
    queryKey: ["/api/correlation"],
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/metrics"],
  });

  const convertToCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(",")
      )
    ].join("\n");
    
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportData = (format: 'csv' | 'json') => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalStocks: (stocks as Stock[]).length,
        totalConflicts: (conflicts as Conflict[]).length,
        activeConflicts: (conflicts as Conflict[]).filter((c: Conflict) => c.status === 'Active').length,
        totalCorrelationEvents: (correlationEvents as CorrelationEvent[]).length,
      },
      stocks: (stocks as Stock[]).map((stock: Stock) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        marketCap: stock.marketCap,
        lastUpdated: stock.lastUpdated,
      })),
      conflicts: (conflicts as Conflict[]).map((conflict: Conflict) => ({
        id: conflict.id,
        name: conflict.name,
        region: conflict.region,
        severity: conflict.severity,
        status: conflict.status,
        duration: conflict.duration,
        startDate: conflict.startDate,
        description: conflict.description,
        latitude: conflict.latitude,
        longitude: conflict.longitude,
        parties: conflict.parties,
      })),
      correlationEvents: (correlationEvents as CorrelationEvent[]).map((event: CorrelationEvent) => ({
        id: event.id,
        conflictId: event.conflictId,
        eventDate: event.eventDate,
        eventDescription: event.eventDescription,
        severity: event.severity,
        stockMovement: event.stockMovement,
      })),
      metrics: metrics || {}
    };

    if (format === 'json') {
      const jsonContent = JSON.stringify(exportData, null, 2);
      downloadFile(jsonContent, `defense-market-analysis-${timestamp}.json`, 'application/json');
      toast({ title: "JSON export completed", description: "Data exported successfully" });
    } else {
      // Export stocks as CSV
      const stockHeaders = ['symbol', 'name', 'price', 'change', 'changePercent', 'volume', 'marketCap', 'lastUpdated'];
      const stocksCSV = convertToCSV(exportData.stocks as any[], stockHeaders);
      downloadFile(stocksCSV, `defense-stocks-${timestamp}.csv`, 'text/csv');

      // Export conflicts as CSV
      const conflictHeaders = ['id', 'name', 'region', 'severity', 'status', 'duration', 'startDate', 'description'];
      const conflictsCSV = convertToCSV(exportData.conflicts as any[], conflictHeaders);
      downloadFile(conflictsCSV, `global-conflicts-${timestamp}.csv`, 'text/csv');

      // Export correlation events as CSV
      const correlationHeaders = ['id', 'conflictId', 'eventDate', 'eventDescription', 'severity', 'stockMovement'];
      const correlationCSV = convertToCSV(exportData.correlationEvents as any[], correlationHeaders);
      downloadFile(correlationCSV, `correlation-events-${timestamp}.csv`, 'text/csv');

      toast({ title: "CSV export completed", description: "3 CSV files downloaded successfully" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => exportData('csv')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportData('json')}>
          <Database className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-slate-500">
          Exports all dashboard data including stocks, conflicts, and correlation events
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}