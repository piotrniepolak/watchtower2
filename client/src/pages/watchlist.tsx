import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, StarOff, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useSimpleAuth";
import { useLocalWatchlist } from "@/hooks/useLocalWatchlist";
import Navigation from "@/components/navigation";
import CompanyLogo from "@/components/company-logo";
import { useQuery } from "@tanstack/react-query";
import type { Stock, Conflict } from "@shared/schema";

export default function Watchlist() {
  const { user, isAuthenticated } = useAuth();
  const watchlist = useLocalWatchlist();

  const { data: allStocks = [] } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const { data: allConflicts = [] } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const watchedStocks = watchlist.getWatchedStocks(allStocks as Stock[]);
  const watchedConflicts = watchlist.getWatchedConflicts(allConflicts as Conflict[]);
  const unwatchedStocks = (allStocks as Stock[]).filter(stock => !watchlist.isStockWatched(stock.symbol));
  const unwatchedConflicts = (allConflicts as Conflict[]).filter(conflict => !watchlist.isConflictWatched(conflict.id));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Login Required</h2>
              <p className="text-slate-600 mb-4">
                Please log in to access your watchlists.
              </p>
              <p className="text-sm text-slate-500">
                Click the Account button in the navigation to get started.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Watchlists</h1>
          <p className="text-slate-600">
            Track your favorite defense stocks and global conflicts
          </p>
        </div>

        <Tabs defaultValue="stocks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stocks">Defense Stocks</TabsTrigger>
            <TabsTrigger value="conflicts">Global Conflicts</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Watched Stocks ({watchedStocks.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {watchedStocks.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No stocks in your watchlist yet</p>
                      <p className="text-sm text-slate-400">
                        Add stocks from the available options below to start tracking
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {watchedStocks.map((stock: Stock) => (
                        <div
                          key={stock.symbol}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <CompanyLogo symbol={stock.symbol} name={stock.name} />
                            <div>
                              <h3 className="font-semibold">{stock.name}</h3>
                              <p className="text-sm text-slate-600">{stock.symbol}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-semibold">${stock.price}</p>
                              <div className="flex items-center space-x-1">
                                {stock.change >= 0 ? (
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <span
                                  className={`text-sm ${
                                    stock.change >= 0 ? "text-green-500" : "text-red-500"
                                  }`}
                                >
                                  {stock.change >= 0 ? "+" : ""}
                                  {stock.changePercent.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => watchlist.removeFromStockWatchlist(stock.symbol)}
                            >
                              <StarOff className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Stocks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {unwatchedStocks.length === 0 ? (
                      <p className="text-center text-slate-500 py-4">
                        All available stocks are already in your watchlist
                      </p>
                    ) : (
                      unwatchedStocks.map((stock: Stock) => (
                        <div
                          key={stock.symbol}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <CompanyLogo symbol={stock.symbol} name={stock.name} />
                            <div>
                              <h3 className="font-semibold">{stock.name}</h3>
                              <p className="text-sm text-slate-600">{stock.symbol}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-semibold">${stock.price}</p>
                              <div className="flex items-center space-x-1">
                                {stock.change >= 0 ? (
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                                <span
                                  className={`text-sm ${
                                    stock.change >= 0 ? "text-green-500" : "text-red-500"
                                  }`}
                                >
                                  {stock.change >= 0 ? "+" : ""}
                                  {stock.changePercent.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => watchlist.addToStockWatchlist(stock.symbol)}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="conflicts">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Watched Conflicts ({watchedConflicts.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {watchedConflicts.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No conflicts in your watchlist yet</p>
                      <p className="text-sm text-slate-400">
                        Add conflicts from the available options below to start tracking
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {watchedConflicts.map((conflict: Conflict) => (
                        <div
                          key={conflict.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold">{conflict.name}</h3>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    conflict.severity === "Critical"
                                      ? "destructive"
                                      : conflict.severity === "High"
                                      ? "destructive"
                                      : conflict.severity === "Medium"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {conflict.severity}
                                </Badge>
                                <Badge
                                  variant={conflict.status === "Active" ? "destructive" : "outline"}
                                >
                                  {conflict.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{conflict.region}</p>
                            <p className="text-sm text-slate-500">Duration: {conflict.duration}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => watchlist.removeFromConflictWatchlist(conflict.id)}
                            className="ml-4"
                          >
                            <StarOff className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Conflicts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {unwatchedConflicts.length === 0 ? (
                      <p className="text-center text-slate-500 py-4">
                        All available conflicts are already in your watchlist
                      </p>
                    ) : (
                      unwatchedConflicts.map((conflict: Conflict) => (
                        <div
                          key={conflict.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold">{conflict.name}</h3>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={
                                    conflict.severity === "Critical"
                                      ? "destructive"
                                      : conflict.severity === "High"
                                      ? "destructive"
                                      : conflict.severity === "Medium"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {conflict.severity}
                                </Badge>
                                <Badge
                                  variant={conflict.status === "Active" ? "destructive" : "outline"}
                                >
                                  {conflict.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{conflict.region}</p>
                            <p className="text-sm text-slate-500">Duration: {conflict.duration}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => watchlist.addToConflictWatchlist(conflict.id)}
                            className="ml-4"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}