"use client";

import { useState } from "react";
import Card from "../ui/Card";
import { Globe, HardDrive, Network, Clock } from "lucide-react";
import { processRecentActivities, TimeFilter } from "@/app/lib/sysmon";
import { useRealtimeData } from "@/app/hooks/useRealtimeData";

type TabType = "websites" | "files" | "network";

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const timeFilterOptions: { value: TimeFilter; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "1d", label: "Last 24 Hours" },
  { value: "6h", label: "Last 6 Hours" },
  { value: "1h", label: "Last Hour" },
  { value: "30m", label: "Last 30 Minutes" },
  { value: "5m", label: "Last 5 Minutes" },
  { value: "1m", label: "Last Minute" },
];

const TabButton = ({ active, icon, label, onClick }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default function RecentActivity() {
  const { data, loading } = useRealtimeData();
  const [activeTab, setActiveTab] = useState<TabType>("websites");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1d");
  const recentData = processRecentActivities(data, timeFilter);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "websites":
        return recentData.websites.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No recent website activity
          </div>
        ) : (
          recentData.websites.map((site, index) => (
            <div
              key={`website-${index}`}
              className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-gray-50"
            >
              <span className="text-gray-700 font-medium truncate max-w-[70%]">
                {site.domain}
              </span>
              <span className="text-sm text-gray-500">{site.time}</span>
            </div>
          ))
        );
      case "files":
        return recentData.files.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No recent file activity
          </div>
        ) : (
          recentData.files.map((file, index) => (
            <div
              key={`file-${index}`}
              className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-gray-50"
            >
              <span className="text-gray-700 font-medium truncate max-w-[70%]">
                {file.name}
              </span>
              <span className="text-sm text-gray-500">{file.time}</span>
            </div>
          ))
        );
      case "network":
        return recentData.network.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No recent network activity
          </div>
        ) : (
          recentData.network.map((conn, index) => (
            <div
              key={`network-${index}`}
              className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-gray-50"
            >
              <div className="text-gray-700 font-medium truncate max-w-[70%]">
                <span>{conn.source}</span>
                <span className="text-gray-400 mx-2">→</span>
                <span>{conn.destination}</span>
              </div>
              <span className="text-sm text-gray-500">{conn.time}</span>
            </div>
          ))
        );
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
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
      <div className="flex space-x-4 mb-6">
        <TabButton
          active={activeTab === "websites"}
          icon={<Globe size={18} />}
          label="Websites"
          onClick={() => setActiveTab("websites")}
        />
        <TabButton
          active={activeTab === "files"}
          icon={<HardDrive size={18} />}
          label="Files"
          onClick={() => setActiveTab("files")}
        />
        <TabButton
          active={activeTab === "network"}
          icon={<Network size={18} />}
          label="Network"
          onClick={() => setActiveTab("network")}
        />
      </div>
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {renderContent()}
      </div>
    </Card>
  );
}
