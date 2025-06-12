import { useQuery } from '@tanstack/react-query';
import type { Stock, DailyNews, NewsStockHighlight } from '@/../../shared/schema';

export function useStockPrices() {
  return useQuery<Stock[]>({
    queryKey: ['/api/stocks'],
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}

export function useEnhancedPharmaNews() {
  const { data: news, isLoading: newsLoading, error: newsError } = useQuery<DailyNews>({
    queryKey: ["/api/news/pharma/today"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  const { data: stocks, isLoading: stocksLoading } = useStockPrices();

  // Enhance pharmaceutical stock highlights with real-time prices
  const enhancedNews = news && stocks ? {
    ...news,
    pharmaceuticalStockHighlights: Array.isArray(news.pharmaceuticalStockHighlights) 
      ? news.pharmaceuticalStockHighlights.map((highlight: any) => {
          const stock = stocks.find(s => s.symbol === highlight.symbol);
          if (stock && stock.price > 0) {
            return {
              ...highlight,
              price: stock.price,
              change: stock.change,
              changePercent: stock.changePercent
            };
          }
          return highlight;
        })
      : news.pharmaceuticalStockHighlights
  } : news;

  return {
    data: enhancedNews,
    isLoading: newsLoading || stocksLoading,
    error: newsError
  };
}