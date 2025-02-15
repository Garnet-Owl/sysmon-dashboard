"use client";

import { useState, useEffect } from "react";
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
import { processLogsForGraph, SysmonEvent } from "@/app/lib/sysmon";

export default function ActivityGraph() {
  const [data, setData] = useState<ReturnType<typeof processLogsForGraph>>([]);

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => {
        const processed = processLogsForGraph(data.logs as SysmonEvent[]);
        setData(processed);
      })
      .catch(console.error);
  }, []);

  return (
    <Card className="p-4 h-96">
      <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="websites" stroke="#8884d8" />
          <Line type="monotone" dataKey="files" stroke="#82ca9d" />
          <Line type="monotone" dataKey="network" stroke="#ffc658" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
