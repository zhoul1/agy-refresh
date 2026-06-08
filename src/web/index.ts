import { Elysia } from "elysia";
import { join, dirname } from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import {
  getLatestWithModels,
  getRecordsRange,
  getModelHistory,
  getRecords,
  getRecentExecutions,
  getLatestExecution,
  getAutoContinueLogs,
  type DaemonExecutionRow,
  type AutoContinueLogRow,
} from "../lib/database";
import {
  loadConfig,
  saveConfig,
  ConfigValidationError,
  type Config,
  type WebConfig,
} from "../lib/config";
import {
  getStatus,
  getLogs,
  appendLog,
  startDaemon,
  stopDaemon,
  startMonitor,
  stopMonitor,
  onEvent,
  offEvent,
  getAutoContinueState,
  type LogEntry,
  type AutoContinueState,
} from "../lib/runtime";
import { runDaemonOnce } from "../lib/daemon";
import { collectOnce } from "../lib/collector";
import { setTrayApiUrl, startTray, stopTray, isTrayRunning } from "../lib/tray";

const HERE = dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = join(HERE, "static");

interface WebServerOptions {
  configPath?: string;
}

function serializeExecution(row: DaemonExecutionRow) {
  return {
    id: row.id,
    runAt: row.run_at,
    success: row.success === 1,
    stdout: row.stdout,
    stderr: row.stderr,
    durationMs: row.duration_ms,
    triggeredBy: row.triggered_by,
  };
}

export function startWebServer(cfg: WebConfig, options: WebServerOptions = {}) {
  const configPath = options.configPath;
  const app = new Elysia();

  app.onError(({ code, error, set }) => {
    if (error instanceof ConfigValidationError) {
      set.status = 400;
      return { error: error.message, type: "validation" };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: error.message, type: "validation" };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "not found" };
    }
    appendLog("web", "error", `请求异常: ${error?.message || String(error)}`);
    set.status = 500;
    return { error: error?.message || "internal error" };
  });

  app.get("/api/status", () => {
    const status = getStatus();
    const latest = getLatestWithModels();
    const latestExec = getLatestExecution();
    return {
      uptime: status.uptime,
      daemon: {
        ...status.daemon,
        lastExecution: status.daemon.lastExecution,
      },
      monitor: status.monitor,
      quota: {
        hasData: latest.record !== null,
        lastCollectedAt: latest.record?.recorded_at ?? null,
        email: latest.record?.email ?? null,
        credits: latest.record
          ? {
              used: latest.record.prompt_credits_used,
              remaining: latest.record.prompt_credits_remaining,
              limit: latest.record.prompt_credits_limit,
            }
          : null,
        modelCount: latest.models.length,
        latestExecutionAt: latestExec?.run_at ?? null,
      },
    };
  });

  app.get("/api/config", () => {
    return loadConfig(configPath);
  });

  app.put("/api/config", async ({ body, set }) => {
    const current = loadConfig(configPath);
    const incoming = body as Partial<Config>;
    const merged: Partial<Config> = {
      scheduler: { ...current.scheduler, ...(incoming.scheduler || {}) },
      command: { ...current.command, ...(incoming.command || {}) },
      monitor: { ...current.monitor, ...(incoming.monitor || {}) },
      web: { ...current.web, ...(incoming.web || {}) },
    };
    const valid = saveConfig(merged, configPath);
    if (valid.web.trayEnabled) {
      if (!isTrayRunning()) { setTrayApiUrl(`http://127.0.0.1:${valid.web.port}`); startTray(); }
    } else {
      stopTray();
    }
    appendLog("web", "info", `配置已更新: scheduler=${valid.scheduler.startTime}-${valid.scheduler.endTime}/${valid.scheduler.intervalMinutes}min, cmd=${valid.command.executable}`);
    return valid;
  });

  app.post("/api/config/reload", () => {
    const fresh = loadConfig(configPath);
    appendLog("web", "info", "配置已重新加载");
    return fresh;
  });

  app.get("/api/scheduler/status", () => getStatus().daemon);

  app.post("/api/scheduler/start", async ({ set }) => {
    try {
      await startDaemon();
      return { ok: true };
    } catch (e: any) {
      set.status = 500;
      return { error: e.message || String(e) };
    }
  });

  app.post("/api/scheduler/stop", () => {
    stopDaemon();
    return { ok: true };
  });

  app.post("/api/scheduler/run-now", async ({ set }) => {
    try {
      const result = await runDaemonOnce(configPath, "manual");
      return { ok: true, execution: result };
    } catch (e: any) {
      set.status = 500;
      return { error: e.message || String(e) };
    }
  });

  app.get("/api/scheduler/history", ({ query }) => {
    const limit = Math.min(parseInt(String(query.limit ?? "50"), 10) || 50, 500);
    const rows = getRecentExecutions(limit);
    return rows.map(serializeExecution);
  });

  app.get("/api/monitor/status", () => getStatus().monitor);

  app.post("/api/monitor/start", async ({ set }) => {
    try {
      await startMonitor();
      return { ok: true };
    } catch (e: any) {
      set.status = 500;
      return { error: e.message || String(e) };
    }
  });

  app.post("/api/monitor/stop", () => {
    stopMonitor();
    return { ok: true };
  });

  app.post("/api/monitor/collect-now", async ({ set }) => {
    try {
      const snapshot = await collectOnce();
      return { ok: true, models: snapshot.models.length, email: snapshot.email, recordId: null };
    } catch (e: any) {
      set.status = 500;
      return { error: e.message || String(e) };
    }
  });

  app.get("/api/monitor/auto-continue/status", () => {
    return getAutoContinueState();
  });

  app.get("/api/monitor/auto-continue/logs", ({ query }) => {
    const limit = Math.min(parseInt(String(query.limit ?? "50"), 10) || 50, 500);
    return getAutoContinueLogs(limit);
  });

  app.get("/api/quota/latest", () => {
    const { record, models } = getLatestWithModels();
    if (!record) return { error: "no data" };
    return {
      time: record.recorded_at,
      email: record.email,
      name: record.name,
      planName: record.plan_name,
      credits: {
        used: record.prompt_credits_used,
        remaining: record.prompt_credits_remaining,
        limit: record.prompt_credits_limit,
      },
      flowCredits: {
        used: record.flow_credits_used,
        remaining: record.flow_credits_remaining,
        limit: record.flow_credits_limit,
      },
      googleOneAiCredits: record.google_one_ai_credits,
      models: models.map((m) => ({
        id: m.model_id,
        display: m.display_name,
        usedPct: m.used_pct,
        remainingPct: m.remaining_pct,
        resetTime: m.reset_time,
        exhausted: m.is_exhausted === 1,
      })),
    };
  });

  app.get("/api/quota/history", ({ query }) => {
    const hours = Math.min(parseInt(String(query.hours ?? "168"), 10) || 168, 24 * 30);
    const history = getRecordsRange(hours);
    return history.map((h) => ({
      time: h.record.recorded_at,
      email: h.record.email,
      name: h.record.name,
      planName: h.record.plan_name,
      credits: {
        used: h.record.prompt_credits_used,
        remaining: h.record.prompt_credits_remaining,
        limit: h.record.prompt_credits_limit,
      },
      flowCredits: {
        used: h.record.flow_credits_used,
        remaining: h.record.flow_credits_remaining,
        limit: h.record.flow_credits_limit,
      },
      googleOneAiCredits: h.record.google_one_ai_credits,
      models: h.models.map((m) => ({
        id: m.model_id,
        display: m.display_name,
        usedPct: m.used_pct,
        remainingPct: m.remaining_pct,
        resetTime: m.reset_time,
        exhausted: m.is_exhausted === 1,
      })),
    }));
  });

  app.get("/api/quota/model/:id", ({ params, query }) => {
    const hours = Math.min(parseInt(String(query.hours ?? "168"), 10) || 168, 24 * 30);
    return getModelHistory(params.id, hours);
  });

  app.get("/api/logs", ({ query }) => {
    const limit = Math.min(parseInt(String(query.limit ?? "200"), 10) || 200, 500);
    return getLogs(limit);
  });

  app.get("/api/events", ({ set }) => {
    set.headers["content-type"] = "text/event-stream";
    set.headers["cache-control"] = "no-cache";
    set.headers["connection"] = "keep-alive";
    set.headers["x-accel-buffering"] = "no";

    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        const send = (event: string, data: any) => {
          try {
            controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          } catch {}
        };

        send("hello", { ts: Date.now() });

        const handlers: Array<[string, (data: any) => void]> = [
          ["daemon:start", () => send("daemon", { type: "start" })],
          ["daemon:stop", () => send("daemon", { type: "stop" })],
          ["daemon:tick", (d) => send("daemon", { type: "tick", nextRunAt: d.nextRunAt })],
          ["daemon:executed", (d) => send("daemon", { type: "executed", ...d })],
          ["monitor:start", () => send("monitor", { type: "start" })],
          ["monitor:stop", () => send("monitor", { type: "stop" })],
          ["monitor:tick", (d) => send("monitor", { type: "tick", nextCollectAt: d.nextCollectAt })],
          ["monitor:collected", (d) => send("monitor", { type: "collected", ...d })],
          ["monitor:failed", (d) => send("monitor", { type: "failed", ...d })],
          ["log", (d: LogEntry) => send("log", d)],
          ["autocontinue:triggered", (d) => send("autocontinue", { type: "triggered", ...d })],
          ["autocontinue:state", (d: AutoContinueState) => send("autocontinue", { type: "state", ...d })],
        ];
        for (const [name, h] of handlers) onEvent(name as any, h as any);

        const heartbeat = setInterval(() => {
          try { controller.enqueue(enc.encode(`: heartbeat\n\n`)); } catch {}
        }, 15000);

        (controller as any)._cleanup = () => {
          clearInterval(heartbeat);
          for (const [name, h] of handlers) offEvent(name as any, h as any);
        };
      },
      cancel(reason) {
        const cleanup = (this as any)._cleanup;
        if (typeof cleanup === "function") cleanup();
      },
    });

    return new Response(stream, { headers: set.headers });
  });

  if (existsSync(join(STATIC_DIR, "index.html"))) {
    app.get("/", async () => {
      const f = Bun.file(join(STATIC_DIR, "index.html"));
      return new Response(f, { headers: { "content-type": "text/html; charset=utf-8" } });
    });
    app.get("/app.js", async () => {
      const f = Bun.file(join(STATIC_DIR, "app.js"));
      return new Response(f, { headers: { "content-type": "application/javascript; charset=utf-8" } });
    });
    app.get("/style.css", async () => {
      const f = Bun.file(join(STATIC_DIR, "style.css"));
      return new Response(f, { headers: { "content-type": "text/css; charset=utf-8" } });
    });
  }

  app.listen({ port: cfg.port, hostname: cfg.host });
  const displayHost = cfg.host === "0.0.0.0" ? "localhost" : cfg.host;
  appendLog("web", "info", `仪表盘启动: http://${displayHost}:${cfg.port}`);

  if (cfg.trayEnabled) {
    setTrayApiUrl(`http://127.0.0.1:${cfg.port}`);
    startTray();
    appendLog("web", "info", "系统托盘图标已启动");
  }

  return app;
}
