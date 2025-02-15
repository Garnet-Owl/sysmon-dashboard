import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    // Read the JSON file from public directory
    const jsonPath = path.join(process.cwd(), "public", "sysmon-logs.json");
    const fileContents = await fs.readFile(jsonPath, "utf8");
    const logs = JSON.parse(fileContents);

    // If logs is not an array, wrap it in an array
    const logsArray = Array.isArray(logs) ? logs : [logs];

    return NextResponse.json({ logs: logsArray });
  } catch (error) {
    console.error("Error reading logs:", error);

    // Return sample data if file doesn't exist or there's an error
    const sampleData = [
      {
        timestamp: new Date().toISOString(),
        eventId: 1,
        processId: "1234",
        image: "C:\\Windows\\System32\\notepad.exe",
        targetFilename: "C:\\Users\\Example\\Documents\\test.txt",
        destinationIp: "192.168.1.1",
        sourceIp: "192.168.1.100",
        destinationHostname: "example.com",
        queryName: "www.example.com",
      },
    ];

    return NextResponse.json({ logs: sampleData });
  }
}
