import { useState, useEffect } from "react";
import { SysmonEvent } from "@/app/lib/sysmon";

export function useRealtimeData(refreshInterval = 5000) {
  const [data, setData] = useState<SysmonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/logs");
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        const result = await response.json();
        setData(result.logs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, loading, error };
}
