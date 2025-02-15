"use client";

import { useState } from "react";
import { X, ExternalLink, Clock, Download } from "lucide-react";
import Card from "../ui/Card";
import { SysmonEvent, formatTimestamp } from "@/app/lib/sysmon";

interface DetailedViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "events" | "processes" | "network" | "files" | "dns" | "destinations";
  data: SysmonEvent[];
}

const getEventTypeDisplay = (event: SysmonEvent) => {
  if (event.eventId === 1) return "process_create";
  if (event.eventId === 3) return "network_connect";
  if (event.eventId === 11) return "file_create";
  if (event.eventId === 22) return "dns_query";
  return "unknown";
};

const renderEventDetails = (event: SysmonEvent) => {
  const eventType = getEventTypeDisplay(event);

  switch (eventType) {
    case "process_create":
      return (
        <>
          <div className="font-medium">Process Created</div>
          <div className="text-sm text-gray-600">
            <div>Image: {event.image}</div>
            {"commandLine" in event && (
              <div>Command Line: {event.commandLine}</div>
            )}
            {"parentImage" in event && <div>Parent: {event.parentImage}</div>}
          </div>
        </>
      );
    case "network_connect":
      return (
        <>
          <div className="font-medium">Network Connection</div>
          <div className="text-sm text-gray-600">
            {"sourceIp" in event && <div>Source: {event.sourceIp}</div>}
            {"destinationIp" in event && "destinationPort" in event && (
              <div>
                Destination: {event.destinationIp}:{event.destinationPort}
              </div>
            )}
            {"protocol" in event && <div>Protocol: {event.protocol}</div>}
          </div>
        </>
      );
    case "file_create":
      return (
        <>
          <div className="font-medium">File Created</div>
          <div className="text-sm text-gray-600">
            {"targetFilename" in event && (
              <div>Path: {event.targetFilename}</div>
            )}
          </div>
        </>
      );
    case "dns_query":
      return (
        <>
          <div className="font-medium">DNS Query</div>
          <div className="text-sm text-gray-600">
            {"queryName" in event && <div>Query: {event.queryName}</div>}
            {"queryStatus" in event && <div>Status: {event.queryStatus}</div>}
          </div>
        </>
      );
    default:
      return (
        <div className="text-sm text-gray-600">Event ID: {event.eventId}</div>
      );
  }
};

export default function DetailedView({
  isOpen,
  onClose,
  title,
  type,
  data,
}: DetailedViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (!isOpen) return null;

  const filteredData = data.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    switch (type) {
      case "processes":
        return (
          event.image.toLowerCase().includes(searchLower) ||
          event.processId.toString().includes(searchLower)
        );
      case "network":
        return (
          ("sourceIp" in event &&
            event.sourceIp.toLowerCase().includes(searchLower)) ||
          ("destinationIp" in event &&
            event.destinationIp.toLowerCase().includes(searchLower))
        );
      case "files":
        return (
          "targetFilename" in event &&
          event.targetFilename.toLowerCase().includes(searchLower)
        );
      case "dns":
        return (
          "queryName" in event &&
          event.queryName.toLowerCase().includes(searchLower)
        );
      default:
        return JSON.stringify(event).toLowerCase().includes(searchLower);
    }
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return sortOrder === "asc"
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });

  const exportData = () => {
    const jsonStr = JSON.stringify(sortedData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sysmon-${type}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-lg shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 px-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() =>
                setSortOrder((order) => (order === "asc" ? "desc" : "asc"))
              }
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Clock size={16} />
              {sortOrder === "asc" ? "Oldest first" : "Newest first"}
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="divide-y">
            {sortedData.map((event, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    ID: {event.processId}
                  </span>
                </div>
                {renderEventDetails(event)}
              </div>
            ))}
            {sortedData.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No matching events found
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
