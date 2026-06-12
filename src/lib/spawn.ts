import { spawn as nodeSpawn, spawnSync as nodeSpawnSync, type ChildProcess } from "node:child_process";
import { Readable } from "node:stream";

const isWin = process.platform === "win32";

function injectHiddenFlag(args: string[]): string[] {
  if (!isWin || args.length === 0) return args;
  const cmd = args[0]?.toLowerCase?.() ?? "";
  if (cmd === "powershell" || cmd === "powershell.exe") {
    const rest = args.slice(1);
    if (rest.some(a => a.toLowerCase() === "-windowstyle")) return args;
    return [args[0], "-WindowStyle", "Hidden", ...rest];
  }
  return args;
}

export interface SpawnResult {
  stdout: ReadableStream | null;
  stderr: ReadableStream | null;
  exited: Promise<number>;
  kill: () => void;
  spawnError: string;
}

export function quietSpawn(args: string[], opts?: { stdout?: "pipe" | "inherit" | "ignore"; stderr?: "pipe" | "inherit" | "ignore" }): SpawnResult {
  if (isWin) {
    const fixed = injectHiddenFlag(args);
    let spawnError = "";
    const child = nodeSpawn(fixed[0], fixed.slice(1), {
      windowsHide: true,
      stdio: ["ignore", opts?.stdout === "pipe" ? "pipe" : "ignore", opts?.stderr === "pipe" ? "pipe" : "ignore"] as any, // stdin 设为 ignore！
    } as any);
    return {
      stdout: child.stdout ? Readable.toWeb(child.stdout) as ReadableStream : null,
      stderr: child.stderr ? Readable.toWeb(child.stderr) as ReadableStream : null,
      exited: new Promise<number>((resolve) => {
        child.on("exit", (code) => resolve(code ?? -1));
        child.on("error", (err: any) => { spawnError = err?.message || String(err); resolve(-1); });
      }),
      kill: () => { try { child.kill(); } catch {} },
      get spawnError() { return spawnError; },
    };
  }
  const bunProc = Bun.spawn(args, {
    ...opts,
    stdin: "ignore", // 确保 Bun.spawn 的 stdin 也是 ignore
  } as any);
  return {
    stdout: (bunProc as any).stdout as ReadableStream ?? null,
    stderr: (bunProc as any).stderr as ReadableStream ?? null,
    exited: bunProc.exited as Promise<number>,
    kill: () => { try { (bunProc as any).kill(); } catch {} },
    spawnError: "",
  };
}

export function quietSpawnSync(args: string[]) {
  if (isWin) {
    const fixed = injectHiddenFlag(args);
    return nodeSpawnSync(fixed[0], fixed.slice(1), { windowsHide: true });
  }
  return Bun.spawnSync(args);
}
