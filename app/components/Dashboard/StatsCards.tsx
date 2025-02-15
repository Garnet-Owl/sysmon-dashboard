"use client";

import { useState, useEffect } from "react";
import Card from "../ui/Card";
import { SysmonEvent } from "@/app/lib/sysmon";

interface Stats {
  totalEvents: number;
  uniqueProcesses: number;
  networkConnections: number;
  fileOperations: number;
  dnsQueries: number;
  uniqueDestinations: number;
}

const REFRESH_INTERVAL = 5000; // 5 seconds

export default function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    uniqueProcesses: 0,
    networkConnections: 0,
    fileOperations: 0,
    dnsQueries: 0,
    uniqueDestinations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const res = await fetch("/api/logs");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const logs = data.logs as SysmonEvent[];

        // Process statistics
        const uniqueProcesses = new Set(logs.map((log) => log.processId));
        const uniqueDestinations = new Set(
          logs
            .filter((log) => log.destinationIp)
            .map((log) => log.destinationIp)
        );

        setStats({
          totalEvents: logs.length,
          uniqueProcesses: uniqueProcesses.size,
          networkConnections: logs.filter((log) => log.destinationIp).length,
          fileOperations: logs.filter((log) => log.targetFilename).length,
          dnsQueries: logs.filter((log) => log.queryName).length,
          uniqueDestinations: uniqueDestinations.size,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <>
        {[...Array(6)].map((_, index) => (
          <Card key={`skeleton-${index}`} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <Card className="p-4 col-span-full">
        <div className="text-red-600">
          <h3 className="text-lg font-semibold">Error Loading Stats</h3>
          <p className="mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  const cards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      className: "text-blue-600",
    },
    {
      title: "Unique Processes",
      value: stats.uniqueProcesses,
      className: "text-green-600",
    },
    {
      title: "Network Connections",
      value: stats.networkConnections,
      className: "text-purple-600",
    },
    {
      title: "File Operations",
      value: stats.fileOperations,
      className: "text-orange-600",
    },
    {
      title: "DNS Queries",
      value: stats.dnsQueries,
      className: "text-indigo-600",
    },
    {
      title: "Unique Destinations",
      value: stats.uniqueDestinations,
      className: "text-teal-600",
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <Card
          key={card.title}
          className="p-4 transition-all duration-200 hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-700">{card.title}</h3>
          <p className={`text-2xl font-bold mt-2 ${card.className}`}>
            {card.value.toLocaleString()}
          </p>
        </Card>
      ))}
    </>
  );
}
