import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string | null;
  lastUpdated: Date;
}

export function useRealTimeStocks() {
  const queryClient = useQueryClient();
  const [realTimeStocks, setRealTimeStocks] = useState<Stock[]>([]);

  // Fetch initial stock data
  const { data: stocks, isLoading } = useQuery<Stock[]>({
    queryKey: ['/api/stocks'],
  });

  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket('/ws', {
    onMessage: (data) => {
      if (data.type === 'stocks') {
        setRealTimeStocks(data.data);
        // Update the query cache with new data
        queryClient.setQueryData(['/api/stocks'], data.data);
      }
    }
  });

  // Use real-time data if available, otherwise use fetched data
  const currentStocks = realTimeStocks.length > 0 ? realTimeStocks : stocks || [];

  return {
    stocks: currentStocks,
    isLoading,
    isConnected,
    lastUpdate: lastMessage?.timestamp || new Date()
  };
}