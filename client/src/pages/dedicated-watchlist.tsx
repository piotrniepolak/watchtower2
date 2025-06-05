import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, StarOff, TrendingUp, TrendingDown, MapPin, AlertTriangle, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useLocalWatchlist } from "@/hooks/useLocalWatchlist";
import Navigation from "@/components/navigation";
import CompanyLogo from "@/components/company-logo";
import FlagIcon from "@/components/flag-icon";
import type { Stock, Conflict } from "@shared/schema";

export default function DedicatedWatchlist() {
  const { isAuthenticated, user } = useAuth();
  const watchlist = useLocalWatchlist();

  const { data: stocks = [] } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const { data: conflicts = [] } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Restricted</h2>
            <p className="text-slate-600">Please log in to view your watchlists.</p>
          </div>
        </main>
      </div>
    );
  }

  const watchedStocks = (stocks as Stock[]).filter(stock => 
    watchlist.isStockWatched(stock.symbol)
  );

  const unwatchedStocks = (stocks as Stock[]).filter(stock => 
    !watchlist.isStockWatched(stock.symbol)
  );

  const watchedConflicts = (conflicts as Conflict[]).filter(conflict => 
    watchlist.isConflictWatched(conflict.id)
  );

  const unwatchedConflicts = (conflicts as Conflict[]).filter(conflict => 
    !watchlist.isConflictWatched(conflict.id)
  );

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "destructive";
      case "ongoing": return "default";
      case "resolved": return "secondary";
      default: return "outline";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "destructive";
      case "critical": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            My Watchlists
          </h2>
          <p className="text-slate-600">
            Track your favorite defense contractors and global conflicts
          </p>
        </div>

        <div className="grid gap-8">
          {/* Stock Watchlist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Defense Contractors Watchlist ({watchedStocks.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {watchedStocks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No stocks in your watchlist yet.</p>
                  <p className="text-sm text-slate-400 mt-2">Add stocks from the list below to track them here.</p>
                </div>
              ) : (
                <div className="mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Market Cap</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {watchedStocks.map((stock: Stock) => (
                        <TableRow key={stock.symbol}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <CompanyLogo symbol={stock.symbol} name={stock.name} />
                              <div className="font-medium">{stock.name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-medium">{stock.symbol}</TableCell>
                          <TableCell className="font-semibold">${stock.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className={`flex items-center space-x-1 ${
                              stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {getChangeIcon(stock.change)}
                              <span className="font-medium">
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{stock.volume.toLocaleString()}</TableCell>
                          <TableCell>{stock.marketCap}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => watchlist.removeFromStockWatchlist(stock.symbol)}
                            >
                              <StarOff className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {unwatchedStocks.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Defense Contractors to Watchlist
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unwatchedStocks.map((stock: Stock) => (
                      <div key={stock.symbol} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <CompanyLogo symbol={stock.symbol} name={stock.name} size="sm" />
                            <div>
                              <div className="font-medium text-sm">{stock.symbol}</div>
                              <div className="text-xs text-slate-600 truncate max-w-32">{stock.name}</div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => watchlist.addToStockWatchlist(stock.symbol)}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold">${stock.price.toFixed(2)}</div>
                          <div className={`text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conflict Watchlist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Conflicts Watchlist ({watchedConflicts.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {watchedConflicts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No conflicts in your watchlist yet.</p>
                  <p className="text-sm text-slate-400 mt-2">Add conflicts from the list below to track them here.</p>
                </div>
              ) : (
                <div className="mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Conflict</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Parties</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {watchedConflicts.map((conflict: Conflict) => (
                        <TableRow key={conflict.id}>
                          <TableCell className="font-medium">{conflict.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{conflict.region}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(conflict.status)}>
                              {conflict.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getSeverityColor(conflict.severity)}>
                              {conflict.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>{conflict.duration}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {conflict.parties?.slice(0, 3).map((party, index) => (
                                <FlagIcon key={index} countryCode={party} size="sm" />
                              ))}
                              {conflict.parties && conflict.parties.length > 3 && (
                                <span className="text-xs text-slate-500 ml-1">
                                  +{conflict.parties.length - 3}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => watchlist.removeFromConflictWatchlist(conflict.id)}
                            >
                              <StarOff className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {unwatchedConflicts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Conflicts to Watchlist
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unwatchedConflicts.map((conflict: Conflict) => (
                      <div key={conflict.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium text-sm truncate">{conflict.name}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => watchlist.addToConflictWatchlist(conflict.id)}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Region:</span>
                            <span className="truncate ml-2">{conflict.region}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Status:</span>
                            <Badge variant={getStatusColor(conflict.status)} className="text-xs">
                              {conflict.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Severity:</span>
                            <Badge variant={getSeverityColor(conflict.severity)} className="text-xs">
                              {conflict.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}