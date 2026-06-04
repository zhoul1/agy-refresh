import { loadConfig } from "./config";
import { getNextRunTime } from "./scheduler";
import { runAgyCommand } from "./executor";

/**
 * 启动守护进程循环
 * @param configPath 配置文件路径
 */
export async function startDaemon(configPath?: string) {
  const initialConfig = loadConfig(configPath);
  console.log(`[Daemon] 守护进程已成功启动。`);
  console.log(`[Daemon] 当前配置参数:`);
  console.log(`         - 时间范围: ${initialConfig.scheduler.startTime} -> ${initialConfig.scheduler.endTime}`);
  console.log(`         - 调度间隔: ${initialConfig.scheduler.intervalMinutes} 分钟`);
  console.log(`         - 执行命令: ${initialConfig.command.executable} ${initialConfig.command.args.join(" ")}`);

  let activeTimer: ReturnType<typeof setTimeout> | null = null;

  async function scheduleCycle() {
    // 每次调度重新读取配置以支持热更新
    const currentConfig = loadConfig(configPath);

    const now = new Date();
    const nextRun = getNextRunTime(now, currentConfig.scheduler);
    const delayMs = nextRun.getTime() - now.getTime();

    // 格式化输出提示
    const formattedNextRun = nextRun.toLocaleString("zh-CN", { hour12: false });
    const hoursWaiting = Math.floor(delayMs / 3600000);
    const minsWaiting = Math.floor((delayMs % 3600000) / 60000);
    const secsWaiting = Math.round((delayMs % 60000) / 1000);
    
    let waitString = "";
    if (hoursWaiting > 0) waitString += `${hoursWaiting} 小时 `;
    if (minsWaiting > 0 || hoursWaiting > 0) waitString += `${minsWaiting} 分钟 `;
    waitString += `${secsWaiting} 秒`;

    console.log(`[Daemon] 下一轮对话计划时间: ${formattedNextRun}，等待倒计时: ${waitString}`);

    // 使用定时器挂起，等待到达下个周期时刻
    activeTimer = setTimeout(async () => {
      console.log(`[Daemon] [${new Date().toLocaleTimeString("zh-CN", { hour12: false })}] 触发定时对话...`);
      
      const result = await runAgyCommand(currentConfig.command);
      if (result.success) {
        console.log(`[Daemon] 自动对话执行成功！命令行输出:`);
        console.log(result.stdout.trim() || "(无标准输出)");
      } else {
        console.error(`[Daemon] 自动对话执行失败！错误描述:`);
        console.error(result.stderr.trim() || "(无错误输出)");
      }

      // 自动开启下一轮调度循环
      scheduleCycle();
    }, delayMs);
  }

  // 启动主调度轮询
  scheduleCycle();

  // 返回优雅退出句柄
  return {
    stop() {
      if (activeTimer) {
        clearTimeout(activeTimer);
        console.log(`[Daemon] 守护进程定时服务已优雅终止。`);
      }
    }
  };
}
