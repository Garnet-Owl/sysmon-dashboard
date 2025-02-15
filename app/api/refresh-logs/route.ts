import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);
const ELEVATION_MARKER = path.join(
  process.cwd(),
  "public",
  "elevated-session.lock"
);

export async function POST() {
  try {
    console.log("[API] Refreshing Sysmon logs...");
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "get-sysmon-logs.ps1"
    );

    // Check if we're already running with elevation
    let isElevated = false;
    try {
      await fs.access(ELEVATION_MARKER);
      isElevated = true;
    } catch {
      isElevated = false;
    }

    if (isElevated) {
      // Execute the PowerShell script directly since we're already elevated
      const { stdout, stderr } = await execAsync(
        `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`
      );

      if (stderr) {
        console.error("[API] PowerShell stderr:", stderr);
      }
      if (stdout) {
        console.log("[API] PowerShell stdout:", stdout);
      }
    } else {
      console.log(
        "[API] Session not elevated. Please restart the server with admin privileges."
      );
      return NextResponse.json(
        {
          error:
            "Server requires elevation. Please restart with admin privileges.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error refreshing logs:", error);
    return NextResponse.json(
      { error: "Failed to refresh logs" },
      { status: 500 }
    );
  }
}
