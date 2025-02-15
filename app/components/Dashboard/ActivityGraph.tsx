"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "../ui/Card";
import { processLogsForGraph } from "@/app/lib/sysmon";
import { useRealtimeData } from "@/app/hooks/useRealtimeData";

export default function ActivityGraph() {
  const { data, loading } = useRealtimeData();
  const processedData = processLogsForGraph(data);

  if (loading) {
    return (
      <Card className="p-4 h-96">
        <div className="animate-pulse h-full">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-full bg-gray-100 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 h-96">
      <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
          <XAxis 
            dataKey="hour" 
            tickFormatter={(hour) => `${hour}:00`}
            label={{ value: 'Hour (24h)', position: 'bottom', offset: 0 }}
          />
          <YAxis 
            label={{ 
              value: 'Number of Events', 
              angle: -90, 
              position: 'insideLeft',
              offset: 10
            }}
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Events']}
            labelFormatter={(hour) => `${hour}:00`}
          />
          <Legend verticalAlign="top" height={36} />
          <Line 
            name="Websites (DNS)" 
            type="monotone" 
            dataKey="websites" 
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
          <Line 
            name="Files" 
            type="monotone" 
            dataKey="files" 
            stroke="#82ca9d"
            strokeWidth={2}
            dot={false}
          />
          <Line 
            name="Network" 
            type="monotone" 
            dataKey="network" 
            stroke="#ffc658"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}