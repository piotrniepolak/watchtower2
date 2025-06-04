import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import GoogleMap from "@/components/google-map";
import type { Conflict } from "@shared/schema";

export default function ChartsSection() {
  const [timeframe, setTimeframe] = useState("1M");
  
  const { data: stocks, isLoading: stocksLoading } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const { data: conflicts, isLoading: conflictsLoading } = useQuery({
    queryKey: ["/api/conflicts"],
  });

  // Generate mock historical data for the chart
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      defenseIndex: 2650 + Math.random() * 200,
      LMT: 420 + Math.random() * 50,
      RTX: 95 + Math.random() * 15,
      NOC: 450 + Math.random() * 30,
    }));
  };

  const chartData = generateChartData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Global Conflicts Map */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Global Conflicts Map
            </CardTitle>
            <Button variant="link" className="text-sm text-primary hover:text-primary/80 font-medium p-0">
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <GoogleMap 
              conflicts={conflicts as Conflict[] || []} 
              className="w-full h-full"
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>Last updated: 2 hours ago</span>
            <span>{(conflicts as Conflict[] || []).length} active conflicts</span>
          </div>
        </CardContent>
      </Card>

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
                  <div className="text-green-600">+2.3%</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-slate-900">RTX</div>
                  <div className="text-green-600">+1.8%</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-slate-900">NOC</div>
                  <div className="text-red-600">-0.5%</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
