import { startWebServer } from "../src/web";
import { loadConfig, saveConfig } from "../src/lib/config";
import {
  registerDaemonFactory,
  registerMonitorFactory,
  startDaemon,
  startMonitor,
  resetRuntimeForTests,
  getStatus,
} from "../src/lib/runtime";
import { startDaemon as daemonStarter } from "../src/lib/daemon";
import { startMonitor as monitorStarter } from "../src/lib/collector";
import { existsSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const TMP = join(import.meta.dir, ".tmp-e2e");
const CFG = join(TMP, "config.json");

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });

  const cfg = {
    scheduler: { startTime: "00:00", endTime: "23:59", intervalMinutes: 30 },
    command: { executable: "cmd", args: ["/c", "echo hello from agy"] },
    monitor: { intervalMinutes: 1, agyTimeoutMs: 1000 },
    web: { port: 3010, host: "127.0.0.1" },
  };
  saveConfig(cfg, CFG);

  process.env.__TEST_DB_PATH = ":memory:";
  resetRuntimeForTests();

  registerDaemonFactory(() => daemonStarter(CFG));
  registerMonitorFactory(() => monitorStarter({ intervalMinutes: 1, agyTimeoutMs: 1000 }));

  await startDaemon();
  await startMonitor();

  const app = startWebServer({ port: 3010, host: "127.0.0.1" }, { configPath: CFG });
  await sleep(500);

  const base = "http://127.0.0.1:3010";

  async function check(label: string, path: string, expectStatus = 200, expectContains?: string) {
    const r = await fetch(base + path);
    const text = await r.text();
    const pass = r.status === expectStatus && (!expectContains || text.includes(expectContains));
    console.log(`[${pass ? "✓" : "✗"}] ${label}: ${r.status}${expectContains ? " (含 '" + expectContains + "': " + text.includes(expectContains) + ")" : ""}`);
    if (!pass) {
      console.log("  body:", text.substring(0, 200));
    }
  }

  console.log("=== Test 1: HTML 页面 ===");
  await check("GET /", "/", 200, "Agy 控制中心");
  await check("GET /app.js", "/app.js", 200, "connectSSE");
  await check("GET /style.css", "/style.css", 200, "var(--primary)");

  console.log("\n=== Test 2: API 端点 ===");
  await check("GET /api/status", "/api/status", 200, "daemon");
  await check("GET /api/config", "/api/config", 200, "scheduler");
  await check("GET /api/scheduler/status", "/api/scheduler/status", 200, "running");
  await check("GET /api/monitor/status", "/api/monitor/status", 200, "running");
  await check("GET /api/quota/latest", "/api/quota/latest", 200);
  await check("GET /api/quota/history", "/api/quota/history?hours=24", 200);
  await check("GET /api/scheduler/history", "/api/scheduler/history?limit=10", 200);
  await check("GET /api/logs", "/api/logs?limit=20", 200, "daemon");

  console.log("\n=== Test 3: 写操作 ===");
  const r1 = await fetch(base + "/api/config", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ scheduler: { startTime: "09:00", endTime: "22:00", intervalMinutes: 45 } }),
  });
  console.log(`[${r1.ok ? "✓" : "✗"}] PUT /api/config (valid): ${r1.status}`);

  const r2 = await fetch(base + "/api/config", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ scheduler: { startTime: "25:00", endTime: "22:00", intervalMinutes: 30 } }),
  });
  console.log(`[${r2.status === 400 ? "✓" : "✗"}] PUT /api/config (invalid): ${r2.status}`);

  console.log("\n=== Test 4: 写回磁盘 ===");
  const onDisk = JSON.parse(await Bun.file(CFG).text());
  const ok = onDisk.scheduler.startTime === "09:00" && onDisk.scheduler.intervalMinutes === 45;
  console.log(`[${ok ? "✓" : "✗"}] config.json 写回正确: ${JSON.stringify(onDisk.scheduler)}`);

  console.log("\n=== Test 5: SSE (1 秒采样) ===");
  const ctrl = new AbortController();
  const ssePromise = fetch(base + "/api/events", { signal: ctrl.signal });
  await sleep(800);
  await fetch(base + "/api/scheduler/run-now", { method: "POST" });
  await sleep(800);
  ctrl.abort();
  try {
    const resp = await ssePromise;
    const ct = resp.headers.get("content-type");
    console.log(`[${ct?.includes("event-stream") ? "✓" : "✗"}] GET /api/events content-type: ${ct}`);
  } catch (e: any) {
    console.log(`[i] SSE connection aborted as designed: ${e.message.substring(0, 50)}`);
  }

  console.log("\n=== Test 6: 状态正常 ===");
  const s = getStatus();
  console.log(`daemon: ${s.daemon.running ? "运行" : "停止"} | monitor: ${s.monitor.running ? "运行" : "停止"} | uptime: ${Math.floor(s.uptime/1000)}s`);

  try { app.stop(); } catch {}
  if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
  process.exit(0);
}

main().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
