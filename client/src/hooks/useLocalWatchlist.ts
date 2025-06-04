import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Stock, Conflict } from "@shared/schema";

const STOCK_WATCHLIST_KEY = 'defense-stock-watchlist';
const CONFLICT_WATCHLIST_KEY = 'defense-conflict-watchlist';

export function useLocalWatchlist() {
  const { toast } = useToast();
  const [stockWatchlist, setStockWatchlist] = useState<string[]>([]);
  const [conflictWatchlist, setConflictWatchlist] = useState<number[]>([]);

  useEffect(() => {
    // Load watchlists from localStorage
    const savedStocks = localStorage.getItem(STOCK_WATCHLIST_KEY);
    const savedConflicts = localStorage.getItem(CONFLICT_WATCHLIST_KEY);
    
    if (savedStocks) {
      try {
        setStockWatchlist(JSON.parse(savedStocks));
      } catch (error) {
        localStorage.removeItem(STOCK_WATCHLIST_KEY);
      }
    }
    
    if (savedConflicts) {
      try {
        setConflictWatchlist(JSON.parse(savedConflicts));
      } catch (error) {
        localStorage.removeItem(CONFLICT_WATCHLIST_KEY);
      }
    }
  }, []);

  const addToStockWatchlist = (symbol: string) => {
    if (!stockWatchlist.includes(symbol)) {
      const newWatchlist = [...stockWatchlist, symbol];
      setStockWatchlist(newWatchlist);
      localStorage.setItem(STOCK_WATCHLIST_KEY, JSON.stringify(newWatchlist));
      toast({ title: "Stock added to watchlist" });
    }
  };

  const removeFromStockWatchlist = (symbol: string) => {
    const newWatchlist = stockWatchlist.filter(s => s !== symbol);
    setStockWatchlist(newWatchlist);
    localStorage.setItem(STOCK_WATCHLIST_KEY, JSON.stringify(newWatchlist));
    toast({ title: "Stock removed from watchlist" });
  };

  const addToConflictWatchlist = (id: number) => {
    if (!conflictWatchlist.includes(id)) {
      const newWatchlist = [...conflictWatchlist, id];
      setConflictWatchlist(newWatchlist);
      localStorage.setItem(CONFLICT_WATCHLIST_KEY, JSON.stringify(newWatchlist));
      toast({ title: "Conflict added to watchlist" });
    }
  };

  const removeFromConflictWatchlist = (id: number) => {
    const newWatchlist = conflictWatchlist.filter(c => c !== id);
    setConflictWatchlist(newWatchlist);
    localStorage.setItem(CONFLICT_WATCHLIST_KEY, JSON.stringify(newWatchlist));
    toast({ title: "Conflict removed from watchlist" });
  };

  const isStockWatched = (symbol: string) => stockWatchlist.includes(symbol);
  const isConflictWatched = (id: number) => conflictWatchlist.includes(id);

  const getWatchedStocks = (allStocks: Stock[]) => {
    return allStocks.filter(stock => stockWatchlist.includes(stock.symbol));
  };

  const getWatchedConflicts = (allConflicts: Conflict[]) => {
    return allConflicts.filter(conflict => conflictWatchlist.includes(conflict.id));
  };

  return {
    stockWatchlist,
    conflictWatchlist,
    addToStockWatchlist,
    removeFromStockWatchlist,
    addToConflictWatchlist,
    removeFromConflictWatchlist,
    isStockWatched,
    isConflictWatched,
    getWatchedStocks,
    getWatchedConflicts,
  };
}