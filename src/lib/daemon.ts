import { loadConfig } from "./config";
import { getNextRunTime, getNextRollingRunTime } from "./scheduler";
import { runAgyCommand } from "./executor";
import type { CommandResult } from "./executor";
import { appendLog, setDaemonNextRunAt, recordDaemonExecution } from "./runtime";
import { saveExecution, updateExecution } from "./database";

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
  let currentNextRun: Date | null = null;
  let lastRunStart: Date | null = null;

  async function scheduleCycle() {
    const currentConfig = loadConfig(configPath);

    const now = new Date();

    const nextRun = lastRunStart
      ? getNextRollingRunTime(lastRunStart, now, currentConfig.scheduler)
      : getNextRunTime(now, currentConfig.scheduler);
    currentNextRun = nextRun;
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
      lastRunStart = runAt;
      let result: (CommandResult & { retries: number }) | null = null;
      let cycleError: string | null = null;
      try {
        result = await executeWithRetry(currentConfig.command, "定时");
      } catch (e: any) {
        cycleError = e.message || String(e);
        appendLog("daemon", "error", `定时对话执行意外崩溃: ${cycleError}`);
      }
      const durationMs = Date.now() - runAt.getTime();

      if (result) {
        if (result.success) {
          appendLog("daemon", "info", `定时对话执行成功，输出:\n${result.stdout || "(空)"}`);
        } else {
          appendLog("daemon", "error", `定时对话执行失败（已重试 ${result.retries} 次），错误:\n${result.stderr || "(空)"}`);
        }
      }

      const finalStderr = result?.stderr ?? cycleError ?? "执行过程异常";
      try {
        saveExecution({
          success: result?.success ?? false,
          stdout: result?.stdout ?? "",
          stderr: finalStderr,
          durationMs,
          triggeredBy: "scheduled",
          runAt: runAt.toISOString(),
        });
      } catch (e: any) {
        appendLog("daemon", "error", `保存执行记录失败: ${e.message || String(e)}`);
      }

      recordDaemonExecution({
        success: result?.success ?? false,
        stdout: result?.stdout ?? "",
        stderr: finalStderr,
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
        currentNextRun = null;
        appendLog("daemon", "info", `守护进程定时服务已优雅终止。`);
        setDaemonNextRunAt(null);
      }
    },
    getNextRunAt(): Date | null {
      return currentNextRun;
    },
  };
}

export async function runDaemonOnce(configPath?: string, triggeredBy = "manual"): Promise<{ id: number; success: boolean; stdout: string; stderr: string; durationMs: number; runAt: string }> {
  const config = loadConfig(configPath);
  const runAt = new Date();
  
  // 1. 先保存占位记录
  const executionId = saveExecution({
    success: false,
    stdout: "",
    stderr: "执行中...",
    durationMs: 0,
    triggeredBy,
    runAt: runAt.toISOString(),
  });
  
  appendLog("daemon", "info", `手动触发对话: ${config.command.executable} ${config.command.args.join(" ")}`);
  
  // 2. 立即返回记录ID，后台继续执行
  (async () => {
    let result: (CommandResult & { retries: number }) | null = null;
    let captureError: string | null = null;
    try {
      result = await executeWithRetry(config.command, "手动");
    } catch (e: any) {
      captureError = e.message || String(e);
      appendLog("daemon", "error", `手动对话执行异常: ${captureError}`);
    }
    const durationMs = Date.now() - runAt.getTime();

    if (result) {
      if (result.success) {
        appendLog("daemon", "info", `手动对话执行成功，输出:\n${result.stdout || "(空)"}`);
      } else {
        appendLog("daemon", "error", `手动对话执行失败（已重试 ${result.retries} 次），错误:\n${result.stderr || "(空)"}`);
      }
    }
    
    // 更新数据库记录
    const finalResult = {
      success: result?.success ?? false,
      stdout: result?.stdout ?? "",
      stderr: result?.stderr ?? captureError ?? "执行过程异常",
      durationMs,
    };
    
    updateExecution(executionId, finalResult);
    
    recordDaemonExecution({
      ...finalResult,
      triggeredBy,
      runAt: runAt.toISOString(),
    });
  })();
  
  // 立即返回
  return {
    id: executionId,
    success: false,
    stdout: "",
    stderr: "执行中...",
    durationMs: 0,
    runAt: runAt.toISOString(),
  };
}

/** 重试间隔（毫秒） */
const RETRY_DELAY_MS = 5000;

/**
 * 执行命令并在失败时自动重试
 * @param command 命令配置（含 maxRetries）
 * @param context 调用上下文（用于日志标记）
 */
async function executeWithRetry(command: import("./config").CommandConfig, context = "自动"): Promise<CommandResult & { retries: number }> {
  const maxRetries = command.maxRetries;
  const totalTimeoutMs = (command.maxRetries + 1) * 65000; // 每次尝试最多 65s 的宽限

  let last: CommandResult | null = null;
  const overallTimer = setTimeout(() => {
    appendLog("daemon", "error", `${context}对话执行总体超时（${totalTimeoutMs}ms），终止重试`);
  }, totalTimeoutMs);

  try {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        appendLog("daemon", "warn", `${context}对话执行失败，第 ${attempt}/${maxRetries} 次重试...`);
        if (last && last.stderr) {
          appendLog("daemon", "warn", `${context}上次失败 stderr: ${last.stderr.substring(0, 500)}`);
        }
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
      appendLog("daemon", "info", `${context}对话开始执行（第 ${attempt + 1} 次尝试）`);
      last = await runAgyCommand(command);
      if (last.success) return { ...last, retries: attempt };
    }
    return { ...last!, retries: maxRetries };
  } finally {
    clearTimeout(overallTimer);
  }
}
