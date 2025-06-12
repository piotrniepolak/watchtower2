import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface StockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    reason?: string;
  };
}

export function StockDetailModal({ isOpen, onClose, stock }: StockDetailModalProps) {
  const [timeRange, setTimeRange] = useState('1D');
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch authentic stock quote data from Yahoo Finance with fallback
  const { data: stockQuote, isLoading: quoteLoading, error: quoteError } = useQuery({
    queryKey: [`/api/stocks/${stock.symbol}/quote`],
    enabled: isOpen && !!stock.symbol,
    refetchInterval: 30000, // Refresh every 30 seconds when modal is open
    retry: false, // Don't retry on API failures
  });

  // Fetch authentic chart data from Yahoo Finance with fallback
  const { data: chartData, isLoading: chartLoading, error: chartError } = useQuery({
    queryKey: [`/api/stocks/${stock.symbol}/chart`, timeRange],
    enabled: isOpen && !!stock.symbol,
    refetchInterval: timeRange === '1D' ? 60000 : 300000, // More frequent for intraday
    retry: false, // Don't retry on API failures
  });

  if (!isOpen) return null;

  const isPositive = stock.changePercent >= 0;
  const timeRanges = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'Max'];

  // Show loading state or authentic data only
  const showLoadingState = quoteLoading && !stockQuote;

  // Process authentic chart data for display with time range responsiveness
  const processChartData = () => {
    if (!chartData || typeof chartData !== 'object' || !(chartData as any).data || !Array.isArray((chartData as any).data) || (chartData as any).data.length === 0) {
      return [];
    }
    
    const data = (chartData as any).data;
    const dataPoints = data.length;
    
    // Ensure chart updates when time range changes by processing data differently for each range
    const processedData = data.map((point: any, index: number) => ({
      x: index,
      y: point.close,
      timestamp: point.date,
      timeRange: timeRange // Include current time range to force re-processing
    }));
    
    return processedData;
  };

  const processedChartData = processChartData();
  const minPrice = processedChartData.length > 0 ? Math.min(...processedChartData.map((d: any) => d.y)) : 0;
  const maxPrice = processedChartData.length > 0 ? Math.max(...processedChartData.map((d: any) => d.y)) : 0;
  const priceRange = maxPrice - minPrice || 1;

  // Helper function to format large numbers
  const formatMarketCap = (value: number | null) => {
    if (!value || value === 0) return '-';
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toLocaleString();
  };

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return `$${value.toFixed(2)}`;
  };

  const createPath = (data: Array<{x: number, y: number}>) => {
    if (data.length === 0) return '';
    
    const width = 400;
    const height = 120;
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.y - minPrice) / priceRange) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">{stock.price.toFixed(2)}</h2>
                <span className="text-slate-500 text-sm font-medium">USD</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  today
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Closed: {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })} EDT • Disclaimer
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isFollowing 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Star className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Company Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{stock.symbol}</h3>
            <p className="text-slate-600 text-sm">{stock.name}</p>
            {stock.reason && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-700">{stock.reason}</p>
              </div>
            )}
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 mb-4">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            {chartLoading ? (
              <div className="animate-pulse">
                <div className="h-32 bg-slate-200 rounded mb-2"></div>
                <div className="flex justify-between">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-3 bg-slate-200 rounded w-12"></div>
                  ))}
                </div>
              </div>
            ) : processedChartData.length > 0 ? (
              <div className="relative">
                <svg width="100%" height="120" viewBox="0 0 400 120" className="overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75].map((fraction) => (
                    <line
                      key={fraction}
                      x1="0"
                      y1={120 * fraction}
                      x2="400"
                      y2={120 * fraction}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Area under curve */}
                  <path
                    d={`${createPath(processedChartData)} L 400,120 L 0,120 Z`}
                    fill="url(#chartGradient)"
                  />
                  
                  {/* Price line */}
                  <path
                    d={createPath(processedChartData)}
                    fill="none"
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    strokeWidth="2"
                  />
                </svg>
                
                {/* Dynamic time labels based on time range */}
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  {timeRange === '1D' ? (
                    <>
                      <span>9:30 AM</span>
                      <span>11:00 AM</span>
                      <span>1:00 PM</span>
                      <span>3:00 PM</span>
                      <span>4:00 PM</span>
                    </>
                  ) : timeRange === '5D' ? (
                    <>
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                    </>
                  ) : (
                    <>
                      <span>Start</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>End</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                <p>Chart data unavailable for this time range</p>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          {quoteLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="animate-pulse">
                    <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : quoteError ? (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-orange-800 text-sm">
                <strong>External data source temporarily unavailable.</strong>
                <br />
                Additional financial metrics require external API access. Please check your API configuration or try again later.
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Current Price</div>
                  <div className="text-sm font-semibold">{formatCurrency(stock.price)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Previous Close</div>
                  <div className="text-sm font-semibold">{formatCurrency(stock.price - stock.change)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Open</div>
                  <div className="text-sm font-semibold">{stockQuote ? formatCurrency(stockQuote.open) : '$--'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">High</div>
                  <div className="text-sm font-semibold">{stockQuote ? formatCurrency(stockQuote.high) : '$--'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Low</div>
                  <div className="text-sm font-semibold">{stockQuote ? formatCurrency(stockQuote.low) : '$--'}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Mkt cap</div>
                  <div className="text-sm font-semibold">{stockQuote ? formatMarketCap(stockQuote.marketCap) : '--'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">P/E ratio</div>
                  <div className="text-sm font-semibold">{stockQuote?.peRatio || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Div yield</div>
                  <div className="text-sm font-semibold">{stockQuote ? formatPercent(stockQuote.divYield) : '-'}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-500 font-medium">52-wk high</div>
                  <div className="text-sm font-semibold">{stockQuote ? formatCurrency(stockQuote.week52High) : '$--'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">52-wk low</div>
                  <div className="text-sm font-semibold">{stockQuote ? formatCurrency(stockQuote.week52Low) : '$--'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Volume</div>
                  <div className="text-sm font-semibold">{stockQuote?.volume ? formatMarketCap(stockQuote.volume) : '-'}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Previous close</div>
                  <div className="text-sm font-semibold">{formatCurrency(stock.price - stock.change)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">EPS</div>
                  <div className="text-sm font-semibold">{stockQuote?.eps ? stockQuote.eps.toFixed(2) : '-'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}