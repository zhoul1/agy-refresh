import { quietSpawn } from "./spawn";
import { spawn } from "node:child_process";
import { Readable } from "node:stream";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { CommandConfig } from "./config";

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

const DEFAULT_TIMEOUT_MS = 60000;
const isWin = process.platform === "win32";

export async function readStream(stream: ReadableStream | null): Promise<string> {
  if (!stream) return "";
  try { return await new Response(stream).text(); } catch { return ""; }
}

/**
 * 执行配置的 agy (或其他) 命令行工具，并捕获输出结果
 * @param config 外部命令配置
 */
export async function runAgyCommand(config: CommandConfig, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<CommandResult> {
  try {
    if (isWin && config.executable.toLowerCase() === "agy") {
      return await runWinAgyWithCapture(config, timeoutMs);
    }
    return await runSpawnCommand(config, timeoutMs);
  } catch (error: any) {
    return {
      success: false,
      stdout: "",
      stderr: error?.message || String(error),
    };
  }
}

/** Windows 下 agy 使用 WriteConsole API，通过 PowerShell Start-Transcript 捕获输出 */
async function runWinAgyWithCapture(config: CommandConfig, timeoutMs: number): Promise<CommandResult> {
  let stdoutText = "";
  let stderrText = "";
  let exitCode = -1;
  let didTimeout = false;
  try {
    const scriptPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "scripts", "capture-output.ps1");
    const child = spawn("powershell", [
      "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath,
      "-Executable", config.executable,
      ...config.args,
    ], {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timer = setTimeout(() => { didTimeout = true; killProcessTree(child.pid); }, timeoutMs);

    const captured = await Promise.all([
      readStream(child.stdout ? Readable.toWeb(child.stdout) as ReadableStream : null),
      readStream(child.stderr ? Readable.toWeb(child.stderr) as ReadableStream : null),
      new Promise<number>((resolve) => {
        child.on("exit", (code) => resolve(code ?? -1));
        child.on("error", () => resolve(-1));
      }),
    ]);
    clearTimeout(timer);

    stdoutText = captured[0];
    stderrText = captured[1];
    exitCode = captured[2];
  } catch (innerError: any) {
    stderrText = (stderrText ? stderrText + "\n" : "") + `PowerShell 内部异常: ${innerError?.message || String(innerError)}`;
  }

  const parts: string[] = [];
  if (didTimeout) parts.push(`命令执行超时 (${timeoutMs}ms)`);
  if (stderrText) parts.push(stderrText);
  const errMsg = parts.join("\n");

  return {
    success: exitCode === 0,
    stdout: deduplicateTranscript(stdoutText),
    stderr: errMsg,
  };
}

/** Start-Transcript 会双写 CJK 字符，此函数去除重复 */
function deduplicateTranscript(text: string): string {
  let result = "";
  let i = 0;
  while (i < text.length) {
    result += text[i];
    if (text[i] > "\x7f" && i + 1 < text.length && text[i + 1] === text[i]) {
      i += 2;
    } else {
      i++;
    }
  }
  return result;
}

/**
 * 跨平台杀掉进程及其整个子进程树。
 *
 * 关键修复：项目通过 PowerShell 包装脚本调用 `agy`，超时原本只 `child.kill()`
 * 杀掉 powershell，而真正的 `agy.exe` 是它的子进程、不会被连带终止，于是变成
 * 孤儿进程继续空转——当初就是它在那死循环狂开浏览器授权页、把浏览器刷爆。
 * 用 `taskkill /T` 杀掉整条进程树即可不留孤儿。
 */
function killProcessTree(pid: number): void {
  if (!pid) return;
  if (process.platform === "win32") {
    try {
      spawn("taskkill", ["/T", "/F", "/PID", String(pid)], { windowsHide: true, stdio: "ignore" });
    } catch { /* ignore */ }
    try { process.kill(pid); } catch { /* ignore */ }
  } else {
    // 非 Windows：尽量杀掉进程组（需 spawn 时 detached），退而求其次杀掉直接子进程
    try { process.kill(-pid, "SIGKILL"); } catch { /* ignore */ }
    try { process.kill(pid, "SIGKILL"); } catch { /* ignore */ }
  }
}

/** 常规 spawn 执行路径 */
async function runSpawnCommand(config: CommandConfig, timeoutMs: number): Promise<CommandResult> {
  let stdoutText = "";
  let stderrText = "";
  let exitCode = -1;
  let didTimeout = false;
  let spawnError = "";
  try {
    const proc = quietSpawn([config.executable, ...config.args], {
      stdout: "pipe",
      stderr: "pipe",
    });

    const timer = setTimeout(() => { didTimeout = true; killProcessTree(proc.pid); }, timeoutMs);

    const captured = await Promise.all([
      readStream(proc.stdout),
      readStream(proc.stderr),
      proc.exited,
    ]);
    clearTimeout(timer);

    stdoutText = captured[0];
    stderrText = captured[1];
    exitCode = captured[2];
    spawnError = (proc as any).spawnError || "";
  } catch (innerError: any) {
    stderrText = (stderrText ? stderrText + "\n" : "") + `Spawn 内部异常: ${innerError?.message || String(innerError)}`;
  }

  const parts: string[] = [];
  if (didTimeout) parts.push(`命令执行超时 (${timeoutMs}ms)`);
  if (stderrText) parts.push(stderrText);
  if (spawnError) parts.push(spawnError);
  const errMsg = parts.join("\n");

  return {
    success: exitCode === 0,
    stdout: stdoutText,
    stderr: errMsg,
  };
}
