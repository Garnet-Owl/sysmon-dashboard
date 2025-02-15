export interface BaseSysmonEvent {
  timestamp: string;
  eventId: number;
  processId: string;
  image: string;
  eventType: string;
  category?: string;
}

export interface ProcessCreateEvent extends BaseSysmonEvent {
  eventId: 1;
  eventType: "process_create";
  commandLine: string;
  parentImage: string;
  integrityLevel: string;
}

export interface NetworkConnectEvent extends BaseSysmonEvent {
  eventId: 3;
  eventType: "network_connect";
  destinationIp: string;
  sourceIp: string;
  destinationPort: string;
  protocol: string;
  destinationHostname?: string;
}

export interface FileCreateEvent extends BaseSysmonEvent {
  eventId: 11;
  eventType: "file_create";
  targetFilename: string;
}

export interface DnsQueryEvent extends BaseSysmonEvent {
  eventId: 22;
  eventType: "dns_query";
  queryName: string;
  queryStatus: string;
}

export type SysmonEvent =
  | ProcessCreateEvent
  | NetworkConnectEvent
  | FileCreateEvent
  | DnsQueryEvent;

export type TimeFilter =
  | "7d" // Last 7 days
  | "1d" // Last 24 hours
  | "6h" // Last 6 hours
  | "1h" // Last hour
  | "30m" // Last 30 minutes
  | "5m" // Last 5 minutes
  | "1m"; // Last minute

interface GraphDataPoint {
  hour: number;
  websites: number;
  files: number;
  network: number;
}

interface RecentActivity {
  websites: Array<{ domain: string; time: string }>;
  files: Array<{ name: string; time: string }>;
  network: Array<{ source: string; destination: string; time: string }>;
}

export function filterEventsByTime(
  logs: SysmonEvent[],
  timeFilter: TimeFilter
): SysmonEvent[] {
  const now = new Date();
  const filterTimes: Record<TimeFilter, number> = {
    "7d": 7 * 24 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "5m": 5 * 60 * 1000,
    "1m": 60 * 1000,
  };

  const timeThreshold = now.getTime() - filterTimes[timeFilter];
  return logs.filter(
    (event) => new Date(event.timestamp).getTime() > timeThreshold
  );
}

export function processLogsForGraph(
  logs: SysmonEvent[],
  timeFilter: TimeFilter = "1d"
): GraphDataPoint[] {
  const filteredLogs = filterEventsByTime(logs, timeFilter);
  const now = new Date();

  // Determine the interval based on the time filter
  let intervalCount = 24; // Default for 1d
  let intervalMs = 60 * 60 * 1000; // 1 hour in milliseconds

  switch (timeFilter) {
    case "7d":
      intervalCount = 7 * 24;
      intervalMs = 60 * 60 * 1000;
      break;
    case "6h":
      intervalCount = 12;
      intervalMs = 30 * 60 * 1000;
      break;
    case "1h":
      intervalCount = 12;
      intervalMs = 5 * 60 * 1000;
      break;
    case "30m":
      intervalCount = 30;
      intervalMs = 60 * 1000;
      break;
    case "5m":
      intervalCount = 5;
      intervalMs = 60 * 1000;
      break;
    case "1m":
      intervalCount = 60;
      intervalMs = 1000;
      break;
  }

  const intervals = Array.from({ length: intervalCount }, (_, i) => {
    const time = new Date(now.getTime() - (intervalCount - 1 - i) * intervalMs);
    return {
      hour: timeFilter === "1d" ? time.getHours() : time.getTime(),
      websites: 0,
      files: 0,
      network: 0,
    };
  });

  filteredLogs.forEach((event) => {
    const eventTime = new Date(event.timestamp).getTime();
    const intervalIndex = intervals.findIndex((interval, index) => {
      const nextInterval = intervals[index + 1];
      return (
        interval.hour <= eventTime &&
        (!nextInterval || eventTime < nextInterval.hour)
      );
    });

    if (intervalIndex !== -1) {
      if ("queryName" in event) intervals[intervalIndex].websites++;
      if ("targetFilename" in event) intervals[intervalIndex].files++;
      if ("destinationIp" in event) intervals[intervalIndex].network++;
    }
  });

  return intervals;
}

export function processRecentActivities(
  logs: SysmonEvent[],
  timeFilter: TimeFilter = "1d"
): RecentActivity {
  const filteredLogs = filterEventsByTime(logs, timeFilter);

  return {
    websites: filteredLogs
      .filter(
        (event): event is DnsQueryEvent => event.eventType === "dns_query"
      )
      .slice(0, 10)
      .map((event) => ({
        domain: event.queryName,
        time: new Date(event.timestamp).toLocaleTimeString(),
      })),

    files: filteredLogs
      .filter(
        (event): event is FileCreateEvent => event.eventType === "file_create"
      )
      .slice(0, 10)
      .map((event) => ({
        name: event.targetFilename.split("\\").pop() || "",
        time: new Date(event.timestamp).toLocaleTimeString(),
      })),

    network: filteredLogs
      .filter(
        (event): event is NetworkConnectEvent =>
          event.eventType === "network_connect"
      )
      .slice(0, 10)
      .map((event) => ({
        source: event.sourceIp,
        destination: event.destinationIp,
        time: new Date(event.timestamp).toLocaleTimeString(),
      })),
  };
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function getEventTypeColor(eventType: string): string {
  switch (eventType) {
    case "process_create":
      return "text-blue-600";
    case "network_connect":
      return "text-green-600";
    case "file_create":
      return "text-purple-600";
    case "dns_query":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
}
