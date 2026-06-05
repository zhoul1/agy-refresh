import { spawn, type ChildProcess } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TRAY_SCRIPT = join(HERE, "..", "tray", "tray.ps1");

let trayProcess: ChildProcess | null = null;
let trayApiUrl = "http://localhost:6789";

export function setTrayApiUrl(url: string) {
  trayApiUrl = url;
}

export function startTray(): boolean {
  if (trayProcess) return false;
  trayProcess = spawn("powershell", [
    "-WindowStyle", "Hidden",
    "-ExecutionPolicy", "Bypass",
    "-File", TRAY_SCRIPT,
    "-ApiUrl", trayApiUrl,
  ], { windowsHide: true, stdio: "ignore" });

  trayProcess.on("exit", () => { trayProcess = null; });
  trayProcess.on("error", () => { trayProcess = null; });
  return true;
}

export function stopTray(): boolean {
  if (!trayProcess) return false;
  trayProcess.kill();
  trayProcess = null;
  return true;
}

export function isTrayRunning(): boolean {
  return trayProcess !== null;
}
