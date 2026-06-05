import { loadConfig } from "./config";
import { getNextRunTime } from "./scheduler";
import { runAgyCommand } from "./executor";
import type { CommandResult } from "./executor";
import { appendLog, setDaemonNextRunAt, recordDaemonExecution } from "./runtime";
import { saveExecution } from "./database";

export interface DaemonOptions {
  configPath?: string;
  triggeredBy?: string;
}

/**
 * 启动守护进程循环
 * @param configPath 配置文件路径
 */
export async function startDaemon(configPath?: string) {
  const initialConfig = loadConfig(configPath);
  appendLog("daemon", "info", `守护进程已成功启动。`);
  appendLog("daemon", "info", `时间范围: ${initialConfig.scheduler.startTime} -> ${initialConfig.scheduler.endTime}，间隔: ${initialConfig.scheduler.intervalMinutes} 分钟，命令: ${initialConfig.command.executable} ${initialConfig.command.args.join(" ")}`);

  let activeTimer: ReturnType<typeof setTimeout> | null = null;

  async function scheduleCycle() {
    const currentConfig = loadConfig(configPath);

    const now = new Date();
    const nextRun = getNextRunTime(now, currentConfig.scheduler);
    setDaemonNextRunAt(nextRun);
    const delayMs = nextRun.getTime() - now.getTime();

    const formattedNextRun = nextRun.toLocaleString("zh-CN", { hour12: false });
    const hoursWaiting = Math.floor(delayMs / 3600000);
    const minsWaiting = Math.floor((delayMs % 3600000) / 60000);
    const secsWaiting = Math.round((delayMs % 60000) / 1000);

    let waitString = "";
    if (hoursWaiting > 0) waitString += `${hoursWaiting} 小时 `;
    if (minsWaiting > 0 || hoursWaiting > 0) waitString += `${minsWaiting} 分钟 `;
    waitString += `${secsWaiting} 秒`;

    appendLog("daemon", "info", `下一轮对话计划: ${formattedNextRun}，倒计时 ${waitString}`);

    activeTimer = setTimeout(async () => {
      appendLog("daemon", "info", `[${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 触发定时对话`);
      const runAt = new Date();
      const result = await executeWithRetry(currentConfig.command);
      const durationMs = Date.now() - runAt.getTime();

      if (result.success) {
        appendLog("daemon", "info", `自动对话执行成功，输出:\n${result.stdout.trim() || "(无标准输出)"}`);
      } else {
        appendLog("daemon", "error", `自动对话执行失败（已重试 ${result.retries} 次），错误:\n${result.stderr.trim() || "(无错误输出)"}`);
      }

      try {
        saveExecution({
          success: result.success,
          stdout: result.stdout,
          stderr: result.stderr,
          durationMs,
          triggeredBy: "scheduled",
          runAt: runAt.toISOString(),
        });
      } catch (e: any) {
        appendLog("daemon", "error", `保存执行记录失败: ${e.message || String(e)}`);
      }

      recordDaemonExecution({
        success: result.success,
        stdout: result.stdout,
        stderr: result.stderr,
        durationMs,
        triggeredBy: "scheduled",
        runAt: runAt.toISOString(),
      });

      scheduleCycle();
    }, delayMs);
  }

  scheduleCycle();

  return {
    stop() {
      if (activeTimer) {
        clearTimeout(activeTimer);
        activeTimer = null;
        appendLog("daemon", "info", `守护进程定时服务已优雅终止。`);
        setDaemonNextRunAt(null);
      }
    },
    getNextRunAt(): Date | null {
      return activeTimer ? null : null;
    },
  };
}

export async function runDaemonOnce(configPath?: string, triggeredBy = "manual"): Promise<{ success: boolean; stdout: string; stderr: string; durationMs: number; runAt: string }> {
  const config = loadConfig(configPath);
  appendLog("daemon", "info", `手动触发对话: ${config.command.executable} ${config.command.args.join(" ")}`);
  const runAt = new Date();
  const result = await executeWithRetry(config.command);
  const durationMs = Date.now() - runAt.getTime();

  if (result.success) {
    appendLog("daemon", "info", `手动对话执行成功，输出:\n${result.stdout.trim() || "(无标准输出)"}`);
  } else {
    appendLog("daemon", "error", `手动对话执行失败（已重试 ${result.retries} 次），错误:\n${result.stderr.trim() || "(无错误输出)"}`);
  }

  try {
    saveExecution({
      success: result.success,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs,
      triggeredBy,
      runAt: runAt.toISOString(),
    });
  } catch (e: any) {
    appendLog("daemon", "error", `保存执行记录失败: ${e.message || String(e)}`);
  }

  recordDaemonExecution({
    success: result.success,
    stdout: result.stdout,
    stderr: result.stderr,
    durationMs,
    triggeredBy,
    runAt: runAt.toISOString(),
  });

  return { ...result, durationMs, runAt: runAt.toISOString() };
}

/** 最大重试次数 */
const MAX_RETRIES = 3;
/** 重试间隔（毫秒） */
const RETRY_DELAY_MS = 10000;

/**
 * 执行命令并在失败时自动重试
 */
async function executeWithRetry(command: import("./config").CommandConfig): Promise<CommandResult & { retries: number }> {
  let last: CommandResult | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      appendLog("daemon", "warn", `自动对话执行失败，${attempt}/${MAX_RETRIES} 次重试中...`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
    last = await runAgyCommand(command);
    if (last.success) return { ...last, retries: attempt };
  }
  return { ...last!, retries: MAX_RETRIES };
}
