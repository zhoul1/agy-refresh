import { join } from "path";
import { existsSync, readFileSync } from "fs";

export interface SchedulerConfig {
  startTime: string; // 格式: "HH:MM"，例如 "08:00"
  endTime: string;   // 格式: "HH:MM"，例如 "23:30"
  intervalMinutes: number; // 默认 30
}

export interface CommandConfig {
  executable: string; // 默认 "agy"
  args: string[];     // 默认 ["--prompt", "你好"]
}

export interface Config {
  scheduler: SchedulerConfig;
  command: CommandConfig;
}

export const DEFAULT_CONFIG: Config = {
  scheduler: {
    startTime: "08:00",
    endTime: "23:30",
    intervalMinutes: 30,
  },
  command: {
    executable: "agy",
    args: ["--prompt", "你好"],
  },
};

/**
 * 校验 HH:MM 时间格式是否正确
 */
export function isValidTimeFormat(timeStr: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr);
}

/**
 * 将 HH:MM 时间字符串转换为当天分钟数（从 00:00 开始算起）
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!isValidTimeFormat(timeStr)) {
    throw new Error(`无效的时间格式，必须为 HH:MM 格式: ${timeStr}`);
  }
  const [hourStr, minuteStr] = timeStr.split(":");
  return parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
}

/**
 * 加载并解析配置文件
 * @param configPath 配置文件路径，默认读取当前目录下的 config.json
 */
export function loadConfig(configPath?: string): Config {
  const targetPath = configPath || join(process.cwd(), "config.json");

  if (!existsSync(targetPath)) {
    console.warn(`[Config] 配置文件未找到 (${targetPath})，将使用默认配置。`);
    return { ...DEFAULT_CONFIG };
  }

  try {
    const rawContent = readFileSync(targetPath, "utf-8");
    const parsed = JSON.parse(rawContent);

    // 深层合并并验证配置项
    const scheduler: SchedulerConfig = {
      startTime: typeof parsed.scheduler?.startTime === "string" && isValidTimeFormat(parsed.scheduler.startTime)
        ? parsed.scheduler.startTime
        : DEFAULT_CONFIG.scheduler.startTime,
      endTime: typeof parsed.scheduler?.endTime === "string" && isValidTimeFormat(parsed.scheduler.endTime)
        ? parsed.scheduler.endTime
        : DEFAULT_CONFIG.scheduler.endTime,
      intervalMinutes: typeof parsed.scheduler?.intervalMinutes === "number" && parsed.scheduler.intervalMinutes > 0
        ? parsed.scheduler.intervalMinutes
        : DEFAULT_CONFIG.scheduler.intervalMinutes,
    };

    const command: CommandConfig = {
      executable: typeof parsed.command?.executable === "string" && parsed.command.executable.trim().length > 0
        ? parsed.command.executable
        : DEFAULT_CONFIG.command.executable,
      args: Array.isArray(parsed.command?.args)
        ? parsed.command.args.map((arg: any) => String(arg))
        : DEFAULT_CONFIG.command.args,
    };

    // 检查 startTime 是否早于 endTime
    const startMins = parseTimeToMinutes(scheduler.startTime);
    const endMins = parseTimeToMinutes(scheduler.endTime);
    if (startMins >= endMins) {
      console.warn(`[Config] 开始时间 (${scheduler.startTime}) 大于或等于结束时间 (${scheduler.endTime})，重置为默认配置。`);
      return { ...DEFAULT_CONFIG };
    }

    return { scheduler, command };
  } catch (error) {
    console.error(`[Config] 解析配置文件失败，将使用默认配置。错误信息:`, error);
    return { ...DEFAULT_CONFIG };
  }
}
