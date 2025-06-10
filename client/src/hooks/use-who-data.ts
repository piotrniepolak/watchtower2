import { useState, useEffect } from 'react';

interface WHOCountryData {
  name: string;
  iso3: string;
  indicators: Record<string, number>;
}

interface WHODataState {
  data: WHOCountryData[] | null;
  loading: boolean;
  error: string | null;
}

export function useWHOStatisticalData(): WHODataState {
  const [state, setState] = useState<WHODataState>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchWHOData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch('/api/who-data');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        setState({
          data: data,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching WHO data:', error);
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load WHO data'
        });
      }
    };

    fetchWHOData();
  }, []);

  return state;
}