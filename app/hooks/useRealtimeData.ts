import { useState, useEffect, useCallback } from "react";
import { SysmonEvent } from "@/app/lib/sysmon";

interface UseRealtimeDataReturn {
  data: SysmonEvent[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useRealtimeData(refreshInterval = 5000): UseRealtimeDataReturn {
  const [data, setData] = useState<SysmonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // First try to refresh the logs
      await fetch("/api/refresh-logs", {
        method: "POST",
      });

      // Then fetch the latest data
      const response = await fetch("/api/logs");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (!Array.isArray(result.logs)) {
        throw new Error("Invalid response format: logs is not an array");
      }

      setData(result.logs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refresh: fetchData };
}