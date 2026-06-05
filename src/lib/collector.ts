import { quietSpawnSync } from "./spawn";
import { detectAllAgyProcesses, discoverAllListeningPorts, type AgyProcessInfo } from "./agy-process";
import { collectQuota, type QuotaSnapshot } from "./agy-quota";
import { saveSnapshot } from "./database";
import type { MonitorConfig } from "./config";
import { appendLog, setMonitorNextCollectAt, recordMonitorCollection, recordMonitorFailure } from "./runtime";

function buildPortTokenMap(allProcesses: AgyProcessInfo[], allPids: number[]): Map<number, string> {
  const procByPid = new Map<number, AgyProcessInfo>();
  for (const p of allProcesses) procByPid.set(p.pid, p);

  const portTokenMap = new Map<number, string>();
  const pidSet = new Set(allPids);

  try {
    const stdout = quietSpawnSync(["netstat", "-ano"]).stdout.toString();
    for (const line of stdout.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) continue;
      const linePid = parseInt(parts[parts.length - 1], 10);
      if (!pidSet.has(linePid)) continue;
      const m = parts[1].match(/:(\d+)$/);
      if (!m) continue;
      const port = parseInt(m[1], 10);
      if (isNaN(port)) continue;
      const proc = procByPid.get(linePid);
      if (proc?.csrfToken) portTokenMap.set(port, proc.csrfToken);
    }
  } catch {}
  return portTokenMap;
}

export async function collectOnce(agyTimeoutMs = 10000): Promise<QuotaSnapshot> {
  appendLog("monitor", "info", `开始探测 agy 进程...`);
  const allProcesses = await detectAllAgyProcesses();
  if (allProcesses.length === 0) {
    throw new Error(
      "AGy process not found. Please open AGy (antigravity IDE / AG 2.0 / ag CLI) first.\n" +
      "未找到 AGy 进程，请先启动 antigravity IDE、AG 2.0 或 ag CLI"
    );
  }

  const allPids = allProcesses.map(p => p.pid);
  const csrfCount = allProcesses.filter(p => p.csrfToken).length;
  appendLog("monitor", "info", `发现 ${allProcesses.length} 个进程，${csrfCount} 个含 CSRF token`);

  const listeningPorts = await discoverAllListeningPorts(allPids);
  const cmdPorts = allProcesses.map(p => p.port).filter((p): p is number => p !== undefined);
  const allPorts = [...new Set([...cmdPorts, ...listeningPorts])];

  if (allPorts.length === 0) {
    throw new Error(
      "No AGy listening ports found. Please open AGy (antigravity IDE / AG 2.0 / ag CLI) first.\n" +
      "未找到 AGy 监听端口，请先启动 antigravity IDE、AG 2.0 或 ag CLI"
    );
  }

  const portTokenMap = buildPortTokenMap(allProcesses, allPids);
  appendLog("monitor", "info", `端口映射: ${[...portTokenMap.entries()].map(([p, t]) => `${p}=${t.substring(0,8)}...`).join(", ")}`);

  const processInfo: AgyProcessInfo = {
    pid: allProcesses[0].pid,
    csrfToken: allProcesses.find(p => p.csrfToken)?.csrfToken,
    port: allPorts[0],
  };

  appendLog("monitor", "info", `探测 ${allPorts.length} 个端口: ${allPorts.join(", ")}`);
  const snapshot = await collectQuota(processInfo, allPorts, portTokenMap);
  appendLog("monitor", "info", `获取到 ${snapshot.models.length} 个模型额度`);
  if (snapshot.email) appendLog("monitor", "info", `账号: ${snapshot.email}`);
  if (snapshot.promptCreditsLimit !== undefined) {
    appendLog("monitor", "info", `Prompt Credits: ${snapshot.promptCreditsUsed}/${snapshot.promptCreditsLimit}`);
  }

  const recordId = saveSnapshot(snapshot);
  appendLog("monitor", "info", `已保存为记录 #${recordId}`);

  recordMonitorCollection({
    recordId,
    modelCount: snapshot.models.length,
    creditsLimit: snapshot.promptCreditsLimit,
    email: snapshot.email,
  });

  return snapshot;
}

export function startMonitor(cfg: MonitorConfig, onCollect?: () => void) {
  const intervalMs = cfg.intervalMinutes * 60 * 1000;
  appendLog("monitor", "info", `启动定时采集，间隔=${cfg.intervalMinutes} 分钟`);

  function scheduleNext() {
    const nextAt = new Date(Date.now() + intervalMs);
    setMonitorNextCollectAt(nextAt);
  }

  async function tick() {
    try {
      await collectOnce(cfg.agyTimeoutMs);
      onCollect?.();
    } catch (err: any) {
      appendLog("monitor", "error", `采集失败: ${err.message || String(err)}`);
      recordMonitorFailure(err.message || String(err));
    } finally {
      scheduleNext();
    }
  }

  scheduleNext();
  tick();
  const timer = setInterval(tick, intervalMs);
  return {
    stop() {
      clearInterval(timer);
      setMonitorNextCollectAt(null);
      appendLog("monitor", "info", `已停止定时采集`);
    },
  };
}
