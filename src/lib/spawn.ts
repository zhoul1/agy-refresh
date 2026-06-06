import { spawn as nodeSpawn, spawnSync as nodeSpawnSync } from "node:child_process";
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

export function quietSpawn(args: string[], opts?: { stdout?: "pipe" | "inherit" | "ignore"; stderr?: "pipe" | "inherit" | "ignore" }) {
  if (isWin) {
    const fixed = injectHiddenFlag(args);
    const child = nodeSpawn(fixed[0], fixed.slice(1), {
      windowsHide: true,
      stdio: ["pipe", opts?.stdout === "pipe" ? "pipe" : "ignore", opts?.stderr === "pipe" ? "pipe" : "ignore"] as any,
    } as any);
    return {
      stdout: child.stdout ? Readable.toWeb(child.stdout) as ReadableStream : null,
      stderr: child.stderr ? Readable.toWeb(child.stderr) as ReadableStream : null,
      exited: new Promise<number>((resolve) => {
        child.on("exit", (code) => resolve(code ?? -1));
        child.on("error", () => resolve(-1));
      }),
    };
  }
  return Bun.spawn(args, opts as any);
}

export function quietSpawnSync(args: string[]) {
  if (isWin) {
    const fixed = injectHiddenFlag(args);
    return nodeSpawnSync(fixed[0], fixed.slice(1), { windowsHide: true });
  }
  return Bun.spawnSync(args);
}
