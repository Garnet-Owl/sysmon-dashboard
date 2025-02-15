import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log("[API] Refreshing Sysmon logs...");
    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "get-sysmon-logs.ps1"
    );

    const { stdout, stderr } = await execAsync(
      `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`
    );

    if (stderr) {
      console.error("[API] PowerShell stderr:", stderr);
    }

    if (stdout) {
      console.log("[API] PowerShell stdout:", stdout);
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
