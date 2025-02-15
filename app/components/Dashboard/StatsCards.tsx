"use client";

import { useState, useEffect } from "react";
import Card from "../ui/Card";
import { SysmonEvent } from "@/app/lib/sysmon";

export default function StatsCards() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    uniqueProcesses: 0,
    networkConnections: 0,
  });

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => {
        const logs = data.logs as SysmonEvent[];
        setStats({
          totalEvents: logs.length,
          uniqueProcesses: new Set(logs.map((log) => log.processId)).size,
          networkConnections: logs.filter((log) => log.destinationIp).length,
        });
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-700">Total Events</h3>
        <p className="text-2xl font-bold mt-2">{stats.totalEvents}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Unique Processes
        </h3>
        <p className="text-2xl font-bold mt-2">{stats.uniqueProcesses}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Network Connections
        </h3>
        <p className="text-2xl font-bold mt-2">{stats.networkConnections}</p>
      </Card>
    </>
  );
}
