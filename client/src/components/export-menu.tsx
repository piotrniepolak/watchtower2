import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, Table, BarChart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Stock, Conflict, CorrelationEvent } from "@shared/schema";

interface ExportMenuProps {
  className?: string;
}

export default function ExportMenu({ className }: ExportMenuProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const { data: stocks = [] } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const { data: conflicts = [] } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const { data: correlationEvents = [] } = useQuery({
    queryKey: ["/api/correlation"],
  });

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any[], filename: string) => {
    if (!data.length) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = () => {
    setIsExporting(true);
    
    const reportData = {
      generated: new Date().toISOString(),
      summary: {
        totalStocks: stocks.length,
        totalConflicts: conflicts.length,
        activeConflicts: conflicts.filter((c: Conflict) => c.status === 'Active').length,
        totalCorrelationEvents: correlationEvents.length
      },
      stocks: stocks.map((stock: Stock) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        marketCap: stock.marketCap
      })),
      conflicts: conflicts.map((conflict: Conflict) => ({
        id: conflict.id,
        name: conflict.name,
        region: conflict.region,
        status: conflict.status,
        severity: conflict.severity,
        startDate: conflict.startDate,
        description: conflict.description
      })),
      correlationEvents: correlationEvents.map((event: CorrelationEvent) => ({
        id: event.id,
        eventDate: event.eventDate,
        eventDescription: event.eventDescription,
        severity: event.severity,
        stockMovement: event.stockMovement,
        conflictId: event.conflictId
      }))
    };

    const reportContent = `
# Defense Market Analysis Report
Generated: ${new Date().toLocaleDateString()}

## Summary
- Total Stocks Tracked: ${reportData.summary.totalStocks}
- Total Conflicts: ${reportData.summary.totalConflicts}
- Active Conflicts: ${reportData.summary.activeConflicts}
- Correlation Events: ${reportData.summary.totalCorrelationEvents}

## Stock Performance
${reportData.stocks.map(stock => 
  `- ${stock.name} (${stock.symbol}): $${stock.price} (${stock.change >= 0 ? '+' : ''}${stock.change})`
).join('\n')}

## Active Conflicts
${reportData.conflicts.filter(c => c.status === 'Active').map(conflict => 
  `- ${conflict.name} (${conflict.region}): ${conflict.severity} severity`
).join('\n')}

## Key Correlations
${reportData.correlationEvents.slice(0, 5).map(event => 
  `- ${event.eventDescription}: ${event.stockMovement}% market impact`
).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `defense-analysis-report-${new Date().toISOString().split('T')[0]}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
    toast({ title: "Report exported successfully" });
  };

  const handleExport = (type: string) => {
    setIsExporting(true);
    
    try {
      switch (type) {
        case 'stocks-csv':
          exportToCSV(stocks, 'defense-stocks');
          break;
        case 'conflicts-csv':
          exportToCSV(conflicts, 'global-conflicts');
          break;
        case 'correlation-csv':
          exportToCSV(correlationEvents, 'correlation-events');
          break;
        case 'stocks-json':
          exportToJSON(stocks, 'defense-stocks');
          break;
        case 'conflicts-json':
          exportToJSON(conflicts, 'global-conflicts');
          break;
        case 'correlation-json':
          exportToJSON(correlationEvents, 'correlation-events');
          break;
        case 'full-report':
          generateReport();
          return;
        default:
          break;
      }
      toast({ title: "Data exported successfully" });
    } catch (error) {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isExporting}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleExport('full-report')}>
          <FileText className="mr-2 h-4 w-4" />
          Complete Report (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('stocks-csv')}>
          <Table className="mr-2 h-4 w-4" />
          Stock Data (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('conflicts-csv')}>
          <Table className="mr-2 h-4 w-4" />
          Conflict Data (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('correlation-csv')}>
          <Table className="mr-2 h-4 w-4" />
          Correlation Data (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('stocks-json')}>
          <BarChart className="mr-2 h-4 w-4" />
          Stock Data (.json)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('conflicts-json')}>
          <BarChart className="mr-2 h-4 w-4" />
          Conflict Data (.json)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('correlation-json')}>
          <BarChart className="mr-2 h-4 w-4" />
          Correlation Data (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}