import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  console.log("[API] Received request for /api/logs");

  try {
    const jsonPath = path.join(process.cwd(), "public", "sysmon-logs.json");
    console.log(`[API] Attempting to read logs from: ${jsonPath}`);

    const fileContents = await fs.readFile(jsonPath, "utf8");
    console.log("[API] Successfully read logs file");

    const logs = JSON.parse(fileContents);
    const logsArray = Array.isArray(logs) ? logs : [logs];

    console.log(`[API] Processed ${logsArray.length} log entries`);
    console.log(
      "[API] Sample log entry:",
      JSON.stringify(logsArray[0], null, 2)
    );

    return NextResponse.json({ logs: logsArray });
  } catch (error) {
    console.error("[API] Error reading logs:", error);

    // Return empty logs array instead of sample data
    return NextResponse.json(
      { error: "Failed to fetch logs", logs: [] },
      { status: 500 }
    );
  }
}
