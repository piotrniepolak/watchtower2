import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3, Star } from 'lucide-react';

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

  if (!isOpen) return null;

  const isPositive = stock.changePercent >= 0;
  const timeRanges = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'Max'];

  // Mock financial data - in a real app, this would come from an API
  const mockData = {
    open: stock.price - (stock.change * 0.8),
    high: stock.price + Math.abs(stock.change * 1.2),
    low: stock.price - Math.abs(stock.change * 1.5),
    marketCap: stock.symbol === 'STOK' ? '627.86M' : 
               stock.symbol === 'PFE' ? '140.2B' :
               stock.symbol === 'JNJ' ? '392.1B' : '2.5B',
    peRatio: stock.symbol === 'STOK' ? '14.62' :
             stock.symbol === 'PFE' ? '15.2' :
             stock.symbol === 'JNJ' ? '16.8' : '-',
    week52High: stock.price * 1.4,
    week52Low: stock.price * 0.6,
    divYield: stock.symbol === 'PFE' ? '5.8%' :
              stock.symbol === 'JNJ' ? '2.9%' : '-',
    qtrlyDivAmt: stock.symbol === 'PFE' ? '0.42' :
                 stock.symbol === 'JNJ' ? '1.19' : '-'
  };

  // Generate mock chart data points
  const generateChartData = () => {
    const points = 50;
    const data = [];
    let currentPrice = stock.price - stock.change;
    
    for (let i = 0; i < points; i++) {
      const variation = (Math.random() - 0.5) * (Math.abs(stock.change) * 0.1);
      currentPrice += variation;
      if (i === points - 1) currentPrice = stock.price; // End at current price
      data.push({ x: i, y: currentPrice });
    }
    return data;
  };

  const chartData = generateChartData();
  const minPrice = Math.min(...chartData.map(d => d.y));
  const maxPrice = Math.max(...chartData.map(d => d.y));
  const priceRange = maxPrice - minPrice;

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
                  d={`${createPath(chartData)} L 400,120 L 0,120 Z`}
                  fill="url(#chartGradient)"
                />
                
                {/* Price line */}
                <path
                  d={createPath(chartData)}
                  fill="none"
                  stroke={isPositive ? "#10b981" : "#ef4444"}
                  strokeWidth="2"
                />
              </svg>
              
              {/* Time labels */}
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>10:00 AM</span>
                <span>12:00 PM</span>
                <span>2:00 PM</span>
                <span>4:00 PM</span>
                <span>6:00 PM</span>
                <span>8:00 PM</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 font-medium">Open</div>
                <div className="text-sm font-semibold">{mockData.open.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">High</div>
                <div className="text-sm font-semibold">{mockData.high.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Low</div>
                <div className="text-sm font-semibold">{mockData.low.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 font-medium">Mkt cap</div>
                <div className="text-sm font-semibold">{mockData.marketCap}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">P/E ratio</div>
                <div className="text-sm font-semibold">{mockData.peRatio}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Div yield</div>
                <div className="text-sm font-semibold">{mockData.divYield}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 font-medium">52-wk high</div>
                <div className="text-sm font-semibold">{mockData.week52High.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">52-wk low</div>
                <div className="text-sm font-semibold">{mockData.week52Low.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Qtrly Div Amt</div>
                <div className="text-sm font-semibold">{mockData.qtrlyDivAmt}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 font-medium">Previous close</div>
                <div className="text-sm font-semibold">{(stock.price - stock.change).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}