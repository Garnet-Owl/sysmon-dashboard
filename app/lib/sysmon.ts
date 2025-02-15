export interface SysmonEvent {
  timestamp: string;
  eventId: number;
  processId: string;
  image: string;
  targetFilename?: string;
  destinationIp?: string;
  sourceIp?: string;
  destinationHostname?: string;
  queryName?: string;
}

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
  return logs
    .reduce((acc: GraphDataPoint[], event) => {
      const hour = new Date(event.timestamp).getHours();
      let existing = acc.find((x) => x.hour === hour);

      if (!existing) {
        existing = {
          hour,
          websites: 0,
          files: 0,
          network: 0,
        };
        acc.push(existing);
      }

      if (event.queryName) existing.websites++;
      if (event.targetFilename) existing.files++;
      if (event.destinationIp) existing.network++;

      return acc;
    }, [])
    .sort((a, b) => a.hour - b.hour);
}

export function processRecentActivities(logs: SysmonEvent[]): RecentActivity {
  return {
    websites: logs
      .filter((event): event is SysmonEvent & { queryName: string } =>
        Boolean(event.queryName)
      )
      .slice(0, 10)
      .map((event) => ({
        domain: event.queryName,
        time: new Date(event.timestamp).toLocaleTimeString(),
      })),

    files: logs
      .filter((event): event is SysmonEvent & { targetFilename: string } =>
        Boolean(event.targetFilename)
      )
      .slice(0, 10)
      .map((event) => ({
        name: event.targetFilename.split("\\").pop() || "",
        time: new Date(event.timestamp).toLocaleTimeString(),
      })),

    network: logs
      .filter(
        (
          event
        ): event is SysmonEvent & { sourceIp: string; destinationIp: string } =>
          Boolean(event.sourceIp && event.destinationIp)
      )
      .slice(0, 10)
      .map((event) => ({
        source: event.sourceIp,
        destination: event.destinationIp,
        time: new Date(event.timestamp).toLocaleTimeString(),
      })),
  };
}
