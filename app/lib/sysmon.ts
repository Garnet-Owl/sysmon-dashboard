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

export function processLogsForGraph(logs: SysmonEvent[]): GraphDataPoint[] {
  const now = new Date();
  const last24Hours = Array.from({ length: 24 }, (_, i) => {
    const hour = (now.getHours() - 23 + i + 24) % 24;
    return {
      hour,
      websites: 0,
      files: 0,
      network: 0,
    };
  });

  logs.forEach((event) => {
    const eventDate = new Date(event.timestamp);
    if (now.getTime() - eventDate.getTime() <= 24 * 60 * 60 * 1000) {
      const hour = eventDate.getHours();
      const point = last24Hours.find((p) => p.hour === hour);
      if (point) {
        if ("queryName" in event) point.websites++;
        if ("targetFilename" in event) point.files++;
        if ("destinationIp" in event) point.network++;
      }
    }
  });

  return last24Hours;
}

export function processRecentActivities(logs: SysmonEvent[]): RecentActivity {
  return {
    websites: logs
      .filter(
        (event): event is DnsQueryEvent => event.eventType === "dns_query"
      )
      .slice(0, 10)
      .map((event) => ({
        domain: event.queryName,
        time: new Date(event.timestamp).toLocaleTimeString(),
      })),

    files: logs
      .filter(
        (event): event is FileCreateEvent => event.eventType === "file_create"
      )
      .slice(0, 10)
      .map((event) => ({
        name: event.targetFilename.split("\\").pop() || "",
        time: new Date(event.timestamp).toLocaleTimeString(),
      })),

    network: logs
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
