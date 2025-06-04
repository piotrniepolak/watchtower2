import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, StarOff, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import CompanyLogo from "@/components/company-logo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Stock, Conflict, StockWatchlist, ConflictWatchlist } from "@shared/schema";

export default function Watchlist() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stockWatchlist = [] } = useQuery({
    queryKey: ["/api/watchlist/stocks", user?.id],
    enabled: !!user?.id,
  });

  const { data: conflictWatchlist = [] } = useQuery({
    queryKey: ["/api/watchlist/conflicts", user?.id],
    enabled: !!user?.id,
  });

  const { data: allStocks = [] } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const { data: allConflicts = [] } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  const addStockMutation = useMutation({
    mutationFn: async (stockSymbol: string) => {
      return apiRequest(`/api/watchlist/stocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockSymbol }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist/stocks"] });
      toast({ title: "Stock added to watchlist" });
    },
    onError: (error) => {
      toast({ title: "Failed to add stock", variant: "destructive" });
    },
  });

  const removeStockMutation = useMutation({
    mutationFn: async (stockSymbol: string) => {
      return apiRequest(`/api/watchlist/stocks/${stockSymbol}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist/stocks"] });
      toast({ title: "Stock removed from watchlist" });
    },
    onError: (error) => {
      toast({ title: "Failed to remove stock", variant: "destructive" });
    },
  });

  const addConflictMutation = useMutation({
    mutationFn: async (conflictId: number) => {
      return apiRequest(`/api/watchlist/conflicts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conflictId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist/conflicts"] });
      toast({ title: "Conflict added to watchlist" });
    },
    onError: (error) => {
      toast({ title: "Failed to add conflict", variant: "destructive" });
    },
  });

  const removeConflictMutation = useMutation({
    mutationFn: async (conflictId: number) => {
      return apiRequest(`/api/watchlist/conflicts/${conflictId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist/conflicts"] });
      toast({ title: "Conflict removed from watchlist" });
    },
    onError: (error) => {
      toast({ title: "Failed to remove conflict", variant: "destructive" });
    },
  });

  const isStockWatched = (symbol: string) => {
    return stockWatchlist.some((item: StockWatchlist) => item.stockSymbol === symbol);
  };

  const isConflictWatched = (id: number) => {
    return conflictWatchlist.some((item: ConflictWatchlist) => item.conflictId === id);
  };

  const getWatchedStocks = () => {
    return allStocks.filter((stock: Stock) => isStockWatched(stock.symbol));
  };

  const getWatchedConflicts = () => {
    return allConflicts.filter((conflict: Conflict) => isConflictWatched(conflict.id));
  };

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
              <Button onClick={() => window.location.href = '/api/login'}>
                Login
              </Button>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Watchlists</h1>
          <p className="text-slate-600">
            Track your selected defense stocks and global conflicts
          </p>
        </div>

        <Tabs defaultValue="stocks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stocks">Stock Watchlist</TabsTrigger>
            <TabsTrigger value="conflicts">Conflict Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Watched Stocks ({getWatchedStocks().length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getWatchedStocks().length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No stocks in your watchlist yet</p>
                      <p className="text-sm text-slate-400">
                        Add stocks from the Markets page to track them here
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {getWatchedStocks().map((stock: Stock) => (
                        <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <CompanyLogo symbol={stock.symbol} name={stock.name} />
                            <div>
                              <h3 className="font-semibold">{stock.name}</h3>
                              <p className="text-sm text-slate-600">{stock.symbol}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-semibold">${stock.price.toFixed(2)}</div>
                              <div className={`text-sm flex items-center ${
                                stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {stock.change >= 0 ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeStockMutation.mutate(stock.symbol)}
                              disabled={removeStockMutation.isPending}
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
                  <CardTitle>Add Stocks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {allStocks
                      .filter((stock: Stock) => !isStockWatched(stock.symbol))
                      .map((stock: Stock) => (
                        <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CompanyLogo symbol={stock.symbol} name={stock.name} size="sm" />
                            <div>
                              <div className="font-medium">{stock.name}</div>
                              <div className="text-sm text-slate-600">{stock.symbol}</div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addStockMutation.mutate(stock.symbol)}
                            disabled={addStockMutation.isPending}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Watched Conflicts ({getWatchedConflicts().length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getWatchedConflicts().length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">No conflicts in your watchlist yet</p>
                      <p className="text-sm text-slate-400">
                        Add conflicts from the Conflicts page to track them here
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {getWatchedConflicts().map((conflict: Conflict) => (
                        <div key={conflict.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold">{conflict.name}</h3>
                              <Badge variant={conflict.status === 'Active' ? 'destructive' : 'secondary'}>
                                {conflict.status}
                              </Badge>
                              <Badge variant="outline">
                                {conflict.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{conflict.region}</p>
                            <p className="text-sm text-slate-500">{conflict.description}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeConflictMutation.mutate(conflict.id)}
                            disabled={removeConflictMutation.isPending}
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
                  <CardTitle>Add Conflicts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {allConflicts
                      .filter((conflict: Conflict) => !isConflictWatched(conflict.id))
                      .map((conflict: Conflict) => (
                        <div key={conflict.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="font-medium">{conflict.name}</div>
                              <Badge variant={conflict.status === 'Active' ? 'destructive' : 'secondary'} className="text-xs">
                                {conflict.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-600">{conflict.region}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addConflictMutation.mutate(conflict.id)}
                            disabled={addConflictMutation.isPending}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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