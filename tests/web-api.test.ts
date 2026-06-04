import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { existsSync, rmSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { startWebServer } from "../src/web";
import { resetDb, getDb, saveExecution, getLatestExecution } from "../src/lib/database";
import {
  registerDaemonFactory,
  registerMonitorFactory,
  resetRuntimeForTests,
  getStatus,
  appendLog,
} from "../src/lib/runtime";
import { startDaemon as daemonStarter, runDaemonOnce } from "../src/lib/daemon";
import { startMonitor as monitorStarter } from "../src/lib/collector";
import { loadConfig, saveConfig, ConfigValidationError } from "../src/lib/config";

const PORT = 4099;
const HOST = "127.0.0.1";
const BASE = `http://${HOST}:${PORT}`;
const TMP_DIR = join(import.meta.dir, ".tmp-web-api");
const CFG_PATH = join(TMP_DIR, "config.json");

const FAST_EXECUTABLE = process.platform === "win32" ? "cmd" : "true";
const FAST_ARGS = process.platform === "win32" ? ["/c", "echo hello"] : [];

let app: any;

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
async function jsonReq(path: string, method = "GET", body?: any): Promise<{ status: number; data: any }> {
  const opts: RequestInit = { method };
  if (body !== undefined) {
    opts.headers = { "content-type": "application/json" };
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(BASE + path, opts);
  let data: any = null;
  const text = await r.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  return { status: r.status, data };
}

beforeAll(async () => {
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(TMP_DIR, { recursive: true });
  saveConfig({
    scheduler: { startTime: "00:00", endTime: "23:59", intervalMinutes: 30 },
    command: { executable: FAST_EXECUTABLE, args: FAST_ARGS },
    monitor: { intervalMinutes: 1, agyTimeoutMs: 1000 },
    web: { port: 3000, host: "127.0.0.1" },
  }, CFG_PATH);

  process.env.__TEST_DB_PATH = ":memory:";
  resetDb();
  getDb();
  resetRuntimeForTests();
  registerDaemonFactory(() => daemonStarter(CFG_PATH));
  registerMonitorFactory(() => monitorStarter({ intervalMinutes: 1, agyTimeoutMs: 1000 }));
  app = startWebServer({ port: PORT, host: HOST }, { configPath: CFG_PATH });
  await sleep(300);
});

afterAll(async () => {
  try { app?.stop?.(); } catch {}
  resetRuntimeForTests();
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
});

beforeEach(() => {
  resetDb();
  process.env.__TEST_DB_PATH = ":memory:";
  getDb();
  resetRuntimeForTests();
  registerDaemonFactory(() => daemonStarter(CFG_PATH));
  registerMonitorFactory(() => monitorStarter({ intervalMinutes: 1, agyTimeoutMs: 1000 }));
});

describe("GET /api/status", () => {
  it("应返回包含 daemon/monitor/quota 段的状态", async () => {
    const r = await jsonReq("/api/status");
    expect(r.status).toBe(200);
    expect(r.data).toHaveProperty("uptime");
    expect(r.data).toHaveProperty("daemon");
    expect(r.data).toHaveProperty("monitor");
    expect(r.data).toHaveProperty("quota");
    expect(r.data.daemon.running).toBe(false);
    expect(r.data.monitor.running).toBe(false);
  });
});

describe("GET /api/config", () => {
  it("应返回当前配置对象", async () => {
    const r = await jsonReq("/api/config");
    expect(r.status).toBe(200);
    expect(r.data.scheduler).toBeDefined();
    expect(r.data.command).toBeDefined();
    expect(r.data.monitor).toBeDefined();
    expect(r.data.web).toBeDefined();
  });
});

describe("PUT /api/config", () => {
  it("应接受合法更新并写回磁盘", async () => {
    const r = await jsonReq("/api/config", "PUT", {
      scheduler: { startTime: "09:00", endTime: "22:00", intervalMinutes: 45 },
    });
    expect(r.status).toBe(200);
    expect(r.data.scheduler.startTime).toBe("09:00");
    expect(r.data.scheduler.intervalMinutes).toBe(45);
  });

  it("应拒绝非法时间格式并返回 400", async () => {
    const r = await jsonReq("/api/config", "PUT", {
      scheduler: { startTime: "25:00", endTime: "22:00", intervalMinutes: 30 },
    });
    expect(r.status).toBe(400);
    expect(r.data.error).toContain("格式错误");
  });

  it("应拒绝 startTime >= endTime", async () => {
    const r = await jsonReq("/api/config", "PUT", {
      scheduler: { startTime: "20:00", endTime: "19:00", intervalMinutes: 30 },
    });
    expect(r.status).toBe(400);
    expect(r.data.error).toContain("必须早于");
  });

  it("应拒绝非正数 intervalMinutes", async () => {
    const r = await jsonReq("/api/config", "PUT", {
      scheduler: { startTime: "09:00", endTime: "22:00", intervalMinutes: 0 },
    });
    expect(r.status).toBe(400);
  });
});

describe("scheduler API", () => {
  it("POST /start 应启动调度，POST /stop 应停止", async () => {
    let r = await jsonReq("/api/scheduler/start", "POST");
    expect(r.status).toBe(200);
    await sleep(100);
    expect(getStatus().daemon.running).toBe(true);

    r = await jsonReq("/api/scheduler/stop", "POST");
    expect(r.status).toBe(200);
    await sleep(100);
    expect(getStatus().daemon.running).toBe(false);
  });

  it("POST /run-now 应触发一次执行并落库", async () => {
    const r = await jsonReq("/api/scheduler/run-now", "POST");
    expect(r.status).toBe(200);
    expect(r.data.ok).toBe(true);
    expect(r.data.execution).toBeDefined();
    await sleep(100);
    const latest = getLatestExecution();
    expect(latest).not.toBeNull();
    expect(latest!.triggered_by).toBe("manual");
  });

  it("GET /history 应返回执行列表", async () => {
    saveExecution({ success: true, stdout: "ok", triggeredBy: "scheduled" });
    saveExecution({ success: false, stderr: "fail", triggeredBy: "manual" });
    const r = await jsonReq("/api/scheduler/history?limit=10");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.length).toBe(2);
  });
});

describe("monitor API", () => {
  it("POST /start 应启动监控", async () => {
    const r = await jsonReq("/api/monitor/start", "POST");
    expect(r.status).toBe(200);
    await sleep(100);
    expect(getStatus().monitor.running).toBe(true);

    await jsonReq("/api/monitor/stop", "POST");
  });

  it("GET /status 应返回 monitor 状态", async () => {
    const r = await jsonReq("/api/monitor/status");
    expect(r.status).toBe(200);
    expect(r.data).toHaveProperty("running");
    expect(r.data).toHaveProperty("nextCollectAt");
  });
});

describe("quota API", () => {
  it("GET /latest 在空数据时应返回 error 字段", async () => {
    const r = await jsonReq("/api/quota/latest");
    expect(r.status).toBe(200);
    expect(r.data.error).toBe("no data");
  });

  it("GET /history 应返回数组（即使为空）", async () => {
    const r = await jsonReq("/api/quota/history?hours=24");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
  });
});

describe("logs API", () => {
  it("GET /api/logs 应返回累积的日志", async () => {
    appendLog("daemon", "info", "test log 1");
    appendLog("monitor", "error", "test log 2");
    const r = await jsonReq("/api/logs?limit=50");
    expect(r.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe("static files", () => {
  it("GET / 应返回 index.html", async () => {
    const r = await fetch(BASE + "/");
    expect(r.status).toBe(200);
    const ct = r.headers.get("content-type");
    expect(ct).toContain("text/html");
    const text = await r.text();
    expect(text).toContain("Agy 控制中心");
  });

  it("GET /app.js 应返回 JavaScript", async () => {
    const r = await fetch(BASE + "/app.js");
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("javascript");
  });

  it("GET /style.css 应返回 CSS", async () => {
    const r = await fetch(BASE + "/style.css");
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("css");
  });
});
