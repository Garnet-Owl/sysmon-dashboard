"use client";

import { useState } from "react";
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
import { processLogsForGraph, TimeFilter } from "@/app/lib/sysmon";
import { useRealtimeData } from "@/app/hooks/useRealtimeData";
import { Clock } from "lucide-react";

const timeFilterOptions: { value: TimeFilter; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "1d", label: "Last 24 Hours" },
  { value: "6h", label: "Last 6 Hours" },
  { value: "1h", label: "Last Hour" },
  { value: "30m", label: "Last 30 Minutes" },
  { value: "5m", label: "Last 5 Minutes" },
  { value: "1m", label: "Last Minute" },
];

const formatXAxis = (value: number, timeFilter: TimeFilter) => {
  const date = new Date(value);
  switch (timeFilter) {
    case "7d":
    case "1d":
      return `${date.getHours()}:00`;
    case "6h":
    case "1h":
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "30m":
    case "5m":
    case "1m":
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    default:
      return value;
  }
};

export default function ActivityGraph() {
  const { data, loading } = useRealtimeData();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1d");
  const processedData = processLogsForGraph(data, timeFilter);

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Activity Timeline</h2>
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-gray-500" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="px-3 py-1 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
          <XAxis
            dataKey="hour"
            tickFormatter={(value) => formatXAxis(value, timeFilter)}
            label={{
              value: "Time",
              position: "bottom",
              offset: 0,
            }}
          />
          <YAxis
            label={{
              value: "Number of Events",
              angle: -90,
              position: "insideLeft",
              offset: 10,
            }}
          />
          <Tooltip
            formatter={(value: number) => [value, "Events"]}
            labelFormatter={(value) => formatXAxis(value, timeFilter)}
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
