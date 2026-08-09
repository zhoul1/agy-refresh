import { loadConfig } from "./config";
import { getNextRunTime, getNextRollingRunTime } from "./scheduler";
import { runAgyCommand } from "./executor";
import { checkAgyAuth } from "./agy-auth";
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
        } else if (result.authRequired) {
          appendLog("daemon", "warn", `定时对话跳过：Antigravity 需要重新登录（本次不会弹出授权页）。`);
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
      } else if (result.authRequired) {
        appendLog("daemon", "warn", `手动对话跳过：Antigravity 需要重新登录（本次不会弹出授权页）。`);
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
async function executeWithRetry(command: import("./config").CommandConfig, context = "自动"): Promise<CommandResult & { retries: number; authRequired?: boolean }> {
  // —— 鉴权预检：需要登录时直接跳过执行，避免反复弹出 Google 授权页 ——
  let effectiveMaxRetries = command.maxRetries;
  try {
    const authState = await checkAgyAuth();
    if (authState === "needs-auth") {
      const msg = `检测到 Antigravity 登录态已失效，跳过本次对话以免反复弹出 Google 授权页。请运行 \`agy\`（或打开 Antigravity）完成 Google 登录后，守护将自动恢复。`;
      appendLog("daemon", "warn", msg);
      return { success: false, stdout: "", stderr: "AUTH_REQUIRED: " + msg, retries: 0, authRequired: true };
    }
    if (authState === "no-server") {
      // 语言服务未运行：本次只尝试一次（不重试），避免无谓地反复弹窗
      appendLog("daemon", "warn", `未检测到 AGy 语言服务在运行，本次仅尝试执行一次（若需要登录可能会弹一次授权页，不会反复弹）。`);
      effectiveMaxRetries = 0;
    }
  } catch (e: any) {
    appendLog("daemon", "warn", `鉴权预检异常（将照常执行）: ${e?.message || e}`);
  }

  const maxRetries = effectiveMaxRetries;
  const totalTimeoutMs = (maxRetries + 1) * 65000; // 每次尝试最多 65s 的宽限

  let last: CommandResult | null = null;
  let timedOut = false;
  const overallTimer = setTimeout(() => {
    timedOut = true;
    appendLog("daemon", "error", `${context}对话执行总体超时（${totalTimeoutMs}ms），终止重试`);
  }, totalTimeoutMs);

  try {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (timedOut) {
        appendLog("daemon", "warn", `${context}对话因总体超时已终止，不再重试`);
        break;
      }
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

      // 若失败明显是由「未登录 / 需要授权」引起，立即停止重试，避免反复弹授权页
      if (looksLikeAuthFailure(last)) {
        const msg = `本次执行疑似因未登录而失败，停止重试以免反复弹窗。请先登录 AGy（运行 \`agy\` 或打开 Antigravity）。`;
        appendLog("daemon", "warn", msg);
        return { ...last, retries: attempt, authRequired: true };
      }
    }
    return { ...last!, retries: maxRetries };
  } finally {
    clearTimeout(overallTimer);
  }
}

/**
 * 通过输出内容粗略判断失败是否由「未登录 / 需要授权」引起。
 * 命中则不再重试，避免 agy 反复拉起浏览器授权页。
 */
function looksLikeAuthFailure(r: CommandResult): boolean {
  const s = ((r.stdout || "") + "\n" + (r.stderr || "")).toLowerCase();
  return /accounts\.google\.com|oauth2\/auth|authentication required|not authenticated|please (sign in|log in)|unauthorized|authorize your account|login required|needs? (to )?login|token (expired|invalid)/i.test(s);
}
