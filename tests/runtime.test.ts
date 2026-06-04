import { describe, it, expect, beforeEach } from "bun:test";
import {
  appendLog,
  getLogs,
  getStatus,
  startDaemon,
  stopDaemon,
  startMonitor,
  stopMonitor,
  recordDaemonExecution,
  recordMonitorCollection,
  recordMonitorFailure,
  setDaemonNextRunAt,
  setMonitorNextCollectAt,
  resetRuntimeForTests,
  onEvent,
  registerDaemonFactory,
  registerMonitorFactory,
} from "../src/lib/runtime";

beforeEach(() => {
  resetRuntimeForTests();
});

describe("runtime logs", () => {
  it("应累积日志并按追加顺序返回", () => {
    appendLog("daemon", "info", "hello");
    appendLog("monitor", "warn", "world");
    const logs = getLogs(10);
    expect(logs.length).toBe(2);
    expect(logs[0].source).toBe("daemon");
    expect(logs[1].level).toBe("warn");
  });

  it("应通过 onEvent 接收日志事件", () => {
    const received: string[] = [];
    onEvent("log", (entry) => received.push(entry.msg));
    appendLog("daemon", "info", "msg-1");
    appendLog("monitor", "info", "msg-2");
    expect(received).toEqual(["msg-1", "msg-2"]);
  });
});

describe("runtime daemon state", () => {
  it("应能启动并停止 daemon，状态正确切换", async () => {
    expect(getStatus().daemon.running).toBe(false);

    let stopped = false;
    registerDaemonFactory(() => ({ stop: () => { stopped = true; } }));
    await startDaemon();

    expect(getStatus().daemon.running).toBe(true);
    expect(getStatus().daemon.startedAt).not.toBeNull();

    stopDaemon();
    expect(getStatus().daemon.running).toBe(false);
    expect(stopped).toBe(true);
  });

  it("重复启动应被忽略", async () => {
    registerDaemonFactory(() => ({ stop: () => {} }));
    await startDaemon();
    await startDaemon();
    expect(getStatus().daemon.running).toBe(true);
  });

  it("未注册工厂时启动应抛错", async () => {
    await expect(startDaemon()).rejects.toThrow("daemon factory not registered");
  });

  it("setDaemonNextRunAt 应更新状态并发出 tick 事件", () => {
    const ticks: string[] = [];
    onEvent("daemon:tick", (p) => ticks.push(p.nextRunAt.toISOString()));
    const d = new Date("2030-01-01T10:00:00Z");
    setDaemonNextRunAt(d);
    expect(getStatus().daemon.nextRunAt).toBe(d.toISOString());
    expect(ticks.length).toBe(1);
  });

  it("recordDaemonExecution 应记录最后一次执行结果", () => {
    recordDaemonExecution({
      success: true,
      stdout: "ok",
      stderr: "",
      durationMs: 100,
      triggeredBy: "scheduled",
      runAt: new Date().toISOString(),
    });
    const status = getStatus();
    expect(status.daemon.lastExecution?.success).toBe(true);
    expect(status.daemon.lastExecution?.stdout).toBe("ok");
  });
});

describe("runtime monitor state", () => {
  it("应能启动并停止 monitor", async () => {
    registerMonitorFactory(() => ({ stop: () => {} }));
    await startMonitor();
    expect(getStatus().monitor.running).toBe(true);
    stopMonitor();
    expect(getStatus().monitor.running).toBe(false);
  });

  it("recordMonitorCollection 应更新采集时间", () => {
    recordMonitorCollection({ recordId: 1, modelCount: 5, email: "a@b.com" });
    const status = getStatus();
    expect(status.monitor.lastCollectionAt).not.toBeNull();
    expect(status.monitor.lastError).toBeNull();
  });

  it("recordMonitorFailure 应记录错误", () => {
    recordMonitorFailure("port not found");
    expect(getStatus().monitor.lastError).toBe("port not found");
  });

  it("setMonitorNextCollectAt 应更新下一次采集时间", () => {
    const d = new Date();
    setMonitorNextCollectAt(d);
    expect(getStatus().monitor.nextCollectAt).toBe(d.toISOString());
  });
});
