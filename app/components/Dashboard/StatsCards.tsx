"use client";

import { useState } from "react";
import Card from "../ui/Card";
import { Activity, Globe, HardDrive, Network, Users, Target } from "lucide-react";
import { useRealtimeData } from "@/app/hooks/useRealtimeData";
import { SysmonEvent } from "@/app/lib/sysmon";
import DetailedView from "./DetailedView";

interface Stats {
  totalEvents: number;
  uniqueProcesses: number;
  networkConnections: number;
  fileOperations: number;
  dnsQueries: number;
  uniqueDestinations: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  className: string;
  subtext?: string;
  onClick: () => void;
}

const StatCard = ({ title, value, icon, className, subtext, onClick }: StatCardProps) => (
  <Card 
    className="p-4 transition-all duration-200 hover:shadow-md cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className={`text-2xl font-bold mt-2 ${className}`}>
          {value.toLocaleString()}
        </p>
        {subtext && (
          <p className="text-sm text-gray-500 mt-1">{subtext}</p>
        )}
      </div>
      <div className={`${className} opacity-80`}>
        {icon}
      </div>
    </div>
  </Card>
);

export default function StatsCards() {
  const { data: logs, loading, error } = useRealtimeData();
  const [selectedView, setSelectedView] = useState<{
    type: 'events' | 'processes' | 'network' | 'files' | 'dns' | 'destinations';
    title: string;
  } | null>(null);

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
          <p className="mt-1">{error.message}</p>
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

  // Calculate statistics
  const uniqueProcesses = new Set(logs.map((log) => log.processId));
  const uniqueDestinations = new Set(
    logs
      .filter((log): log is SysmonEvent & { destinationIp: string } => 
        'destinationIp' in log
      )
      .map((log) => log.destinationIp)
  );

  const stats = {
    totalEvents: logs.length,
    uniqueProcesses: uniqueProcesses.size,
    networkConnections: logs.filter(log => log.eventId === 3).length,
    fileOperations: logs.filter(log => log.eventId === 11).length,
    dnsQueries: logs.filter(log => log.eventId === 22).length,
    uniqueDestinations: uniqueDestinations.size,
  };

  const timeRange = logs.length > 0 ? new Date(logs[0].timestamp).toLocaleTimeString() : 'N/A';

  return (
    <>
      <StatCard
        title="Total Events"
        value={stats.totalEvents}
        icon={<Activity size={24} />}
        className="text-blue-600"
        subtext={`Since ${timeRange}`}
        onClick={() => setSelectedView({ type: 'events', title: 'All Events' })}
      />
      <StatCard
        title="Unique Processes"
        value={stats.uniqueProcesses}
        icon={<Users size={24} />}
        className="text-green-600"
        onClick={() => setSelectedView({ type: 'processes', title: 'Process Events' })}
      />
      <StatCard
        title="Network Connections"
        value={stats.networkConnections}
        icon={<Network size={24} />}
        className="text-purple-600"
        onClick={() => setSelectedView({ type: 'network', title: 'Network Events' })}
      />
      <StatCard
        title="File Operations"
        value={stats.fileOperations}
        icon={<HardDrive size={24} />}
        className="text-orange-600"
        onClick={() => setSelectedView({ type: 'files', title: 'File Events' })}
      />
      <StatCard
        title="DNS Queries"
        value={stats.dnsQueries}
        icon={<Globe size={24} />}
        className="text-indigo-600"
        onClick={() => setSelectedView({ type: 'dns', title: 'DNS Events' })}
      />
      <StatCard
        title="Unique Destinations"
        value={stats.uniqueDestinations}
        icon={<Target size={24} />}
        className="text-teal-600"
        onClick={() => setSelectedView({ type: 'destinations', title: 'Destination Events' })}
      />

      {selectedView && (
        <DetailedView
          isOpen={true}
          onClose={() => setSelectedView(null)}
          title={selectedView.title}
          type={selectedView.type}
          data={logs}
        />
      )}
    </>
  );
}