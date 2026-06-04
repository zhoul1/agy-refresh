import { EventEmitter } from "events";

export interface LogEntry {
  ts: string;
  source: "daemon" | "monitor" | "web" | "system";
  level: "info" | "warn" | "error";
  msg: string;
}

export interface DaemonState {
  running: boolean;
  startedAt: string | null;
  nextRunAt: string | null;
  lastExecution: {
    runAt: string;
    success: boolean;
    stdout: string | null;
    stderr: string | null;
    durationMs: number | null;
    triggeredBy: string | null;
  } | null;
}

export interface MonitorState {
  running: boolean;
  startedAt: string | null;
  nextCollectAt: string | null;
  lastCollectionAt: string | null;
  lastError: string | null;
}

export interface RuntimeStatus {
  daemon: DaemonState;
  monitor: MonitorState;
  uptime: number;
}

export type RuntimeEventName =
  | "daemon:start"
  | "daemon:stop"
  | "daemon:tick"
  | "daemon:executed"
  | "monitor:start"
  | "monitor:stop"
  | "monitor:tick"
  | "monitor:collected"
  | "monitor:failed"
  | "log"
  | "status";

export type RuntimeEventPayloads = {
  "daemon:start": void;
  "daemon:stop": void;
  "daemon:tick": { nextRunAt: Date };
  "daemon:executed": { success: boolean; stdout: string; stderr: string; durationMs: number; triggeredBy: string; runAt: string };
  "monitor:start": void;
  "monitor:stop": void;
  "monitor:tick": { nextCollectAt: Date };
  "monitor:collected": { recordId: number; modelCount: number; creditsLimit?: number; email?: string };
  "monitor:failed": { error: string };
  "log": LogEntry;
  "status": void;
};

class TypedEmitter {
  private inner = new EventEmitter();
  constructor() {
    this.inner.setMaxListeners(100);
  }
  on<K extends RuntimeEventName>(name: K, listener: (payload: RuntimeEventPayloads[K]) => void): void {
    this.inner.on(name, listener);
  }
  off<K extends RuntimeEventName>(name: K, listener: (payload: RuntimeEventPayloads[K]) => void): void {
    this.inner.off(name, listener);
  }
  emit<K extends RuntimeEventName>(name: K, payload: RuntimeEventPayloads[K]): void {
    this.inner.emit(name, payload);
  }
  removeAllListeners(name?: RuntimeEventName): void {
    this.inner.removeAllListeners(name);
  }
  listenerCount(name: RuntimeEventName): number {
    return this.inner.listenerCount(name);
  }
}

class CircularBuffer<T> {
  private items: T[] = [];
  constructor(private capacity: number) {}
  push(item: T): void {
    this.items.push(item);
    if (this.items.length > this.capacity) {
      this.items.splice(0, this.items.length - this.capacity);
    }
  }
  toArray(): T[] {
    return [...this.items];
  }
  clear(): void {
    this.items = [];
  }
  size(): number {
    return this.items.length;
  }
}

const LOG_CAPACITY = 500;

const daemon: DaemonState = {
  running: false,
  startedAt: null,
  nextRunAt: null,
  lastExecution: null,
};

const monitor: MonitorState = {
  running: false,
  startedAt: null,
  nextCollectAt: null,
  lastCollectionAt: null,
  lastError: null,
};

const startedAt = new Date();
const emitter = new TypedEmitter();
const logs = new CircularBuffer<LogEntry>(LOG_CAPACITY);

export type HandleStarter = () => { stop: () => void; getNextRunAt?: () => Date | null } | Promise<{ stop: () => void; getNextRunAt?: () => Date | null }>;

let daemonFactory: HandleStarter | null = null;
let monitorFactory: HandleStarter | null = null;
let daemonHandle: { stop: () => void; getNextRunAt?: () => Date | null } | null = null;
let monitorHandle: { stop: () => void; getNextCollectAt?: () => Date | null } | null = null;

export function registerDaemonFactory(factory: HandleStarter): void {
  daemonFactory = factory;
}

export function registerMonitorFactory(factory: HandleStarter): void {
  monitorFactory = factory;
}

export function appendLog(source: LogEntry["source"], level: LogEntry["level"], msg: string): void {
  const entry: LogEntry = { ts: new Date().toISOString(), source, level, msg };
  logs.push(entry);
  emitter.emit("log", entry);
}

export function getLogs(limit = 200): LogEntry[] {
  const all = logs.toArray();
  return all.slice(-limit);
}

export function clearLogs(): void {
  logs.clear();
}

export function getStatus(): RuntimeStatus {
  return {
    daemon: { ...daemon },
    monitor: { ...monitor },
    uptime: Date.now() - startedAt.getTime(),
  };
}

export function onEvent<K extends RuntimeEventName>(name: K, listener: (payload: RuntimeEventPayloads[K]) => void): void {
  emitter.on(name, listener);
}

export function offEvent<K extends RuntimeEventName>(name: K, listener: (payload: RuntimeEventPayloads[K]) => void): void {
  emitter.off(name, listener);
}

export function subscribe(listener: () => void): () => void {
  const onStatus = () => listener();
  emitter.on("status", onStatus);
  emitter.on("daemon:tick", onStatus);
  emitter.on("daemon:start", onStatus);
  emitter.on("daemon:stop", onStatus);
  emitter.on("daemon:executed", onStatus);
  emitter.on("monitor:tick", onStatus);
  emitter.on("monitor:start", onStatus);
  emitter.on("monitor:stop", onStatus);
  emitter.on("monitor:collected", onStatus);
  emitter.on("monitor:failed", onStatus);
  return () => {
    emitter.off("status", onStatus);
    emitter.off("daemon:tick", onStatus);
    emitter.off("daemon:start", onStatus);
    emitter.off("daemon:stop", onStatus);
    emitter.off("daemon:executed", onStatus);
    emitter.off("monitor:tick", onStatus);
    emitter.off("monitor:start", onStatus);
    emitter.off("monitor:stop", onStatus);
    emitter.off("monitor:collected", onStatus);
    emitter.off("monitor:failed", onStatus);
  };
}

export function notifyStatusChange(): void {
  emitter.emit("status", undefined);
}

export function setDaemonNextRunAt(date: Date | null): void {
  daemon.nextRunAt = date ? date.toISOString() : null;
  if (date) {
    emitter.emit("daemon:tick", { nextRunAt: date });
  }
  emitter.emit("status", undefined);
}

export function recordDaemonExecution(payload: RuntimeEventPayloads["daemon:executed"]): void {
  daemon.lastExecution = {
    runAt: payload.runAt,
    success: payload.success,
    stdout: payload.stdout,
    stderr: payload.stderr,
    durationMs: payload.durationMs,
    triggeredBy: payload.triggeredBy,
  };
  emitter.emit("daemon:executed", payload);
  emitter.emit("status", undefined);
}

export function setMonitorNextCollectAt(date: Date | null): void {
  monitor.nextCollectAt = date ? date.toISOString() : null;
  if (date) {
    emitter.emit("monitor:tick", { nextCollectAt: date });
  }
  emitter.emit("status", undefined);
}

export function recordMonitorCollection(payload: RuntimeEventPayloads["monitor:collected"]): void {
  monitor.lastCollectionAt = new Date().toISOString();
  monitor.lastError = null;
  emitter.emit("monitor:collected", payload);
  emitter.emit("status", undefined);
}

export function recordMonitorFailure(error: string): void {
  monitor.lastError = error;
  monitor.lastCollectionAt = new Date().toISOString();
  emitter.emit("monitor:failed", { error });
  emitter.emit("status", undefined);
}

export async function startDaemon(): Promise<void> {
  if (daemonHandle) {
    appendLog("system", "warn", "daemon 已在运行中，重复启动被忽略");
    return;
  }
  if (!daemonFactory) {
    appendLog("system", "error", "未注册 daemon 工厂，无法启动");
    throw new Error("daemon factory not registered");
  }
  try {
    daemonHandle = await daemonFactory();
  } catch (e: any) {
    appendLog("daemon", "error", `daemon 启动失败: ${e.message || String(e)}`);
    throw e;
  }
  daemon.running = true;
  daemon.startedAt = new Date().toISOString();
  appendLog("daemon", "info", "daemon 启动");
  emitter.emit("daemon:start", undefined);
  emitter.emit("status", undefined);
}

export function stopDaemon(): void {
  if (!daemonHandle) {
    appendLog("system", "warn", "daemon 未运行，停止被忽略");
    return;
  }
  try {
    daemonHandle.stop();
  } catch (e: any) {
    appendLog("daemon", "error", `daemon 停止失败: ${e.message || String(e)}`);
  }
  daemonHandle = null;
  daemon.running = false;
  daemon.nextRunAt = null;
  appendLog("daemon", "info", "daemon 已停止");
  emitter.emit("daemon:stop", undefined);
  emitter.emit("status", undefined);
}

export function isDaemonRunning(): boolean {
  return daemon.running;
}

export async function startMonitor(): Promise<void> {
  if (monitorHandle) {
    appendLog("system", "warn", "monitor 已在运行中，重复启动被忽略");
    return;
  }
  if (!monitorFactory) {
    appendLog("system", "error", "未注册 monitor 工厂，无法启动");
    throw new Error("monitor factory not registered");
  }
  try {
    monitorHandle = await monitorFactory();
  } catch (e: any) {
    appendLog("monitor", "error", `monitor 启动失败: ${e.message || String(e)}`);
    throw e;
  }
  monitor.running = true;
  monitor.startedAt = new Date().toISOString();
  appendLog("monitor", "info", "monitor 启动");
  emitter.emit("monitor:start", undefined);
  emitter.emit("status", undefined);
}

export function stopMonitor(): void {
  if (!monitorHandle) {
    appendLog("system", "warn", "monitor 未运行，停止被忽略");
    return;
  }
  try {
    monitorHandle.stop();
  } catch (e: any) {
    appendLog("monitor", "error", `monitor 停止失败: ${e.message || String(e)}`);
  }
  monitorHandle = null;
  monitor.running = false;
  monitor.nextCollectAt = null;
  appendLog("monitor", "info", "monitor 已停止");
  emitter.emit("monitor:stop", undefined);
  emitter.emit("status", undefined);
}

export function isMonitorRunning(): boolean {
  return monitor.running;
}

export function resetRuntimeForTests(): void {
  daemonFactory = null;
  monitorFactory = null;
  daemonHandle = null;
  monitorHandle = null;
  daemon.running = false;
  daemon.startedAt = null;
  daemon.nextRunAt = null;
  daemon.lastExecution = null;
  monitor.running = false;
  monitor.startedAt = null;
  monitor.nextCollectAt = null;
  monitor.lastCollectionAt = null;
  monitor.lastError = null;
  logs.clear();
  emitter.removeAllListeners();
}
