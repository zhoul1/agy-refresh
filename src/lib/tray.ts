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

/**
 * Windows 对环境块大小有限制。测试/开发环境下若父进程环境变量过大，
 * 直接继承会导致 PowerShell 子进程启动失败。此处保留系统关键变量并丢弃
 * 过长变量，确保托盘进程能稳定启动。
 */
function buildTrayEnv(): NodeJS.ProcessEnv {
  const essential = new Set([
    "SYSTEMROOT", "WINDIR", "PATH", "PATHEXT", "TMP", "TEMP",
    "USERPROFILE", "APPDATA", "LOCALAPPDATA", "ProgramFiles",
    "ProgramFiles(x86)", "CommonProgramFiles", "CommonProgramFiles(x86)",
    "NUMBER_OF_PROCESSORS", "OS", "COMPUTERNAME", "USERDOMAIN",
    "USERDOMAIN_ROAMINGPROFILE", "HOMEDRIVE", "HOMEPATH", "HOME",
    "ALLUSERSPROFILE", "PUBLIC", "SystemDrive", "ComSpec", "PSModulePath",
  ]);

  const env: NodeJS.ProcessEnv = {};
  let total = 0;
  for (const [key, value] of Object.entries(process.env)) {
    if (value === undefined) continue;
    // 保留系统关键变量和值较短的自定义变量
    if (essential.has(key) || value.length < 512) {
      env[key] = value;
      total += key.length + value.length + 2; // key=value\0
    }
  }

  // 即使如此仍超出安全阈值，只保留系统关键变量
  if (total > 60000) {
    for (const key of Object.keys(env)) {
      if (!essential.has(key)) delete env[key];
    }
  }
  return env;
}

export function startTray(): boolean {
  if (process.platform !== "win32") return false;
  if (trayProcess) return false;
  trayProcess = spawn("powershell", [
    "-WindowStyle", "Hidden",
    "-ExecutionPolicy", "Bypass",
    "-File", TRAY_SCRIPT,
    "-ApiUrl", trayApiUrl,
  ], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"], env: buildTrayEnv() });

  trayProcess.stdout?.on("data", (data) => {
    console.log(`[TRAY] ${data.toString().trim()}`);
  });
  trayProcess.stderr?.on("data", (data) => {
    console.error(`[TRAY ERR] ${data.toString().trim()}`);
  });
  trayProcess.on("exit", (code) => {
    console.log(`[TRAY] exited with code ${code}`);
    trayProcess = null;
  });
  trayProcess.on("error", (err) => {
    console.error(`[TRAY] error: ${err.message}`);
    trayProcess = null;
  });
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
