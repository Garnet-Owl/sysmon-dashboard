"use client";

import { useState, useEffect } from "react";
import Card from "../ui/Card";
import { processRecentActivities, SysmonEvent } from "@/app/lib/sysmon";

interface ActivityData {
  websites: Array<{ domain: string; time: string }>;
  files: Array<{ name: string; time: string }>;
  network: Array<{ source: string; destination: string; time: string }>;
}

export default function RecentActivity() {
  const [recentData, setRecentData] = useState<ActivityData>({
    websites: [],
    files: [],
    network: [],
  });

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => {
        const processed = processRecentActivities(data.logs as SysmonEvent[]);
        setRecentData(processed);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Websites</h2>
        <ul className="space-y-2">
          {recentData.websites.map((site, index) => (
            <li
              key={`website-${site.domain}-${index}`}
              className="flex items-center space-x-2"
            >
              <span className="text-gray-600">{site.domain}</span>
              <span className="text-sm text-gray-400">{site.time}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Files</h2>
        <ul className="space-y-2">
          {recentData.files.map((file, index) => (
            <li
              key={`file-${file.name}-${index}`}
              className="flex items-center space-x-2"
            >
              <span className="text-gray-600">{file.name}</span>
              <span className="text-sm text-gray-400">{file.time}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Network Activity</h2>
        <ul className="space-y-2">
          {recentData.network.map((conn, index) => (
            <li
              key={`network-${conn.source}-${conn.destination}-${index}`}
              className="flex items-center space-x-2"
            >
              <span className="text-gray-600">
                {conn.source} → {conn.destination}
              </span>
              <span className="text-sm text-gray-400">{conn.time}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
