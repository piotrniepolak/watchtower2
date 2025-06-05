import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MiniGeopoliticalLoader } from "@/components/geopolitical-loader";

export default function CorrelationAnalysis() {
  const [timeframe, setTimeframe] = useState("Last 6 months");

  // Mock correlation data
  const correlationData = [
    { x: 1, y: 2.3 },
    { x: 2, y: 1.8 },
    { x: 3, y: 4.2 },
    { x: 4, y: 3.1 },
    { x: 5, y: 5.5 },
    { x: 6, y: 2.9 },
    { x: 7, y: 4.8 },
    { x: 8, y: 3.7 },
    { x: 9, y: 6.1 },
  ];

  const insights = [
    {
      color: "bg-primary",
      text: "Strong positive correlation (0.73) between conflict escalation and defense stock performance"
    },
    {
      color: "bg-green-500",
      text: "Aerospace sector shows highest sensitivity to geopolitical events"
    },
    {
      color: "bg-amber-500",
      text: "Average stock price increase of 3.2% following major conflict announcements"
    },
  ];

  const statistics = [
    { label: "Correlation Coefficient:", value: "0.73" },
    { label: "P-value:", value: "< 0.001" },
    { label: "R-squared:", value: "0.53" },
    { label: "Sample Size:", value: "156 events" },
  ];

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Conflict-Market Correlation Analysis
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="Last 90 days">Last 90 days</SelectItem>
                <SelectItem value="Last 6 months">Last 6 months</SelectItem>
                <SelectItem value="Last year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-primary hover:bg-primary/90">
              Generate Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="x" 
                    stroke="#64748b" 
                    fontSize={12}
                    name="Conflict Severity Index"
                  />
                  <YAxis 
                    dataKey="y" 
                    stroke="#64748b" 
                    fontSize={12}
                    name="Stock Price Change (%)"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}
                    labelFormatter={(value) => `Severity: ${value}`}
                    formatter={(value) => [`${value}%`, 'Stock Change']}
                  />
                  <Scatter 
                    dataKey="y" 
                    fill="#0ea5e9"
                    stroke="#0284c7"
                    strokeWidth={1}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">Key Insights</h4>
              <ul className="text-sm text-slate-600 space-y-2">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <span className={`w-2 h-2 ${insight.color} rounded-full mt-2 mr-2 flex-shrink-0`}></span>
                    {insight.text}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">Statistical Summary</h4>
              <div className="space-y-2 text-sm">
                {statistics.map((stat, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-slate-600">{stat.label}</span>
                    <span className="font-medium text-slate-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
