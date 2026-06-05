import { spawn as nodeSpawn, spawnSync as nodeSpawnSync, type SpawnOptionsWithoutStdio } from "node:child_process";
import { Readable } from "node:stream";

const isWin = process.platform === "win32";

export function quietSpawn(args: string[], opts?: { stdout?: "pipe" | "inherit" | "ignore"; stderr?: "pipe" | "inherit" | "ignore" }) {
  if (isWin) {
    const child = nodeSpawn(args[0], args.slice(1), {
      windowsHide: true,
      stdio: ["pipe", opts?.stdout === "pipe" ? "pipe" : "ignore", opts?.stderr === "pipe" ? "pipe" : "ignore"],
    } as SpawnOptionsWithoutStdio);
    return {
      stdout: child.stdout ? Readable.toWeb(child.stdout) as ReadableStream : null,
      stderr: child.stderr ? Readable.toWeb(child.stderr) as ReadableStream : null,
      exited: new Promise<number>((resolve) => {
        child.on("exit", (code) => resolve(code ?? -1));
      }),
    };
  }
  return Bun.spawn(args, opts as any);
}

export function quietSpawnSync(args: string[]) {
  if (isWin) {
    return nodeSpawnSync(args[0], args.slice(1), { windowsHide: true });
  }
  return Bun.spawnSync(args);
}
