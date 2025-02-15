import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Execute PowerShell script to get fresh logs
    await execAsync("powershell.exe -File ./scripts/get-sysmon-logs.ps1");

    // Read the generated JSON file
    const jsonPath = path.join(process.cwd(), "public", "sysmon-logs.json");
    const fileContents = await fs.readFile(jsonPath, "utf8");
    const logs = JSON.parse(fileContents);

    // Ensure logs is an array
    const logsArray = Array.isArray(logs) ? logs : [logs];

    return NextResponse.json({ logs: logsArray });
  } catch (error) {
    console.error("Error reading logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
