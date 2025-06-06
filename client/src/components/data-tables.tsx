import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Circle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CompanyLogo from "@/components/company-logo";
import FlagIcon from "@/components/flag-icon";
import GeopoliticalLoader from "@/components/geopolitical-loader";
import type { Conflict, Stock } from "@shared/schema";

export default function DataTables() {
  const [conflictSearch, setConflictSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");

  const { data: conflicts, isLoading: conflictsLoading } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const { data: stocks, isLoading: stocksLoading } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const filteredConflicts = (conflicts as Conflict[] || []).filter(conflict =>
    conflict.region.toLowerCase().includes(conflictSearch.toLowerCase()) ||
    conflict.name.toLowerCase().includes(conflictSearch.toLowerCase())
  );

  const filteredStocks = (stocks as Stock[] || []).filter(stock =>
    stock.symbol.toLowerCase().includes(stockSearch.toLowerCase()) ||
    stock.name.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "text-red-500";
      case "ongoing": return "text-amber-500";
      case "resolved": return "text-green-500";
      default: return "text-slate-500";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
      {/* Current Conflicts Table */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Current Conflicts</h3>
            <Input
              placeholder="Search conflicts..."
              value={conflictSearch}
              onChange={(e) => setConflictSearch(e.target.value)}
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center">
                      Region <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center">
                      Severity <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center">
                      Duration <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conflictsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <GeopoliticalLoader 
                        type="conflict" 
                        message="Analyzing global conflicts..."
                        className="mx-auto"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConflicts?.map((conflict) => (
                    <TableRow key={conflict.id} className="hover:bg-slate-50 cursor-pointer">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 flex space-x-1">
                            {conflict.parties && conflict.parties.map((party, index) => (
                              <FlagIcon key={index} countryCode={party} size="md" />
                            ))}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{conflict.region}</div>
                            <div className="text-sm text-slate-500">{conflict.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(conflict.severity)}>
                          {conflict.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {conflict.duration}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center">
                          <Circle className={`h-2 w-2 mr-1 fill-current ${getStatusColor(conflict.status)}`} />
                          {conflict.status}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-700">
              Showing {filteredConflicts.length} of {(conflicts as Conflict[] || []).length} conflicts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Defense Contractors Stock Data */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Defense Contractors</h3>
            <Input
              placeholder="Search stocks..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center">
                      Company <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center">
                      Price <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center">
                      Change <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center">
                      Volume <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocksLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <GeopoliticalLoader 
                        type="market" 
                        message="Fetching real-time market data..."
                        className="mx-auto"
                      />
                    </TableCell>
                  </TableRow>
                ) : filteredStocks && filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <TableRow key={stock.symbol} className="hover:bg-slate-50 cursor-pointer">
                      <TableCell>
                        <CompanyLogo symbol={stock.symbol} name={stock.name} size="md" />
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        ${stock.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${
                          stock.changePercent >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {stock.changePercent >= 0 ? "+" : ""}${stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {stock.volume.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      No stock data available. 
                      <Button 
                        variant="link" 
                        className="ml-1 p-0"
                        onClick={() => fetch('/api/stocks/refresh', { method: 'POST' })}
                      >
                        Refresh data
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-700">
              Showing {filteredStocks.length} companies
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
