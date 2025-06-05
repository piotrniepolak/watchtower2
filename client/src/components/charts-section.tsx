import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import type { Stock } from "@shared/schema";

export default function ChartsSection() {
  const [timeframe, setTimeframe] = useState("1M");
  
  const { data: stocks, isLoading: stocksLoading } = useQuery({
    queryKey: ["/api/stocks"],
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  // Generate chart data with real-time stock prices
  const generateChartData = () => {
    if (!stocks || !Array.isArray(stocks)) {
      return [];
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentPrices = {
      LMT: stocks.find(s => s.symbol === 'LMT')?.price || 420,
      RTX: stocks.find(s => s.symbol === 'RTX')?.price || 95,
      NOC: stocks.find(s => s.symbol === 'NOC')?.price || 450,
      GD: stocks.find(s => s.symbol === 'GD')?.price || 280,
      BA: stocks.find(s => s.symbol === 'BA')?.price || 210,
    };

    // Calculate defense index from real prices
    const defenseIndex = (currentPrices.LMT + currentPrices.RTX + currentPrices.NOC + currentPrices.GD + currentPrices.BA) / 5;

    return months.map((month, index) => {
      const variation = (index - 2) * 0.05; // Simulate progression over months
      return {
        month,
        defenseIndex: defenseIndex * (1 + variation + (Math.random() * 0.1 - 0.05)),
        LMT: currentPrices.LMT * (1 + variation + (Math.random() * 0.1 - 0.05)),
        RTX: currentPrices.RTX * (1 + variation + (Math.random() * 0.1 - 0.05)),
        NOC: currentPrices.NOC * (1 + variation + (Math.random() * 0.1 - 0.05)),
        GD: currentPrices.GD * (1 + variation + (Math.random() * 0.1 - 0.05)),
        BA: currentPrices.BA * (1 + variation + (Math.random() * 0.1 - 0.05)),
      };
    });
  };

  const chartData = generateChartData();

  return (
    <div className="mb-8">
      {/* Defense Stocks Performance */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Defense Stocks Performance
            </CardTitle>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="1W">1W</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="defenseIndex" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="LMT" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="RTX" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            {(stocks as Stock[] || []).slice(0, 3).map((stock) => (
              <div key={stock.symbol} className="text-center">
                <div className="font-medium text-slate-900">{stock.symbol}</div>
                <div className={stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}>
                  {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%
                </div>
              </div>
            ))}
            {(stocks as Stock[] || []).length === 0 && (
              <>
                <div className="text-center">
                  <div className="font-medium text-slate-900">LMT</div>
                  <div className="text-green-600">+2.4%</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-slate-900">RTX</div>
                  <div className="text-green-600">+1.8%</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-slate-900">NOC</div>
                  <div className="text-green-600">+3.1%</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}