import { join, dirname } from "path";
import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from "fs";

export interface SchedulerConfig {
  startTime: string; // 格式: "HH:MM"，例如 "08:00"
  endTime: string;   // 格式: "HH:MM"，例如 "23:30"
  intervalMinutes: number; // 默认 30
}

export interface CommandConfig {
  executable: string; // 默认 "agy"
  args: string[];     // 默认 ["--prompt", "你好"]
}

export interface MonitorConfig {
  intervalMinutes: number;
  agyTimeoutMs: number;
}

export interface WebConfig {
  port: number;
  host: string;
}
export interface Config {
  scheduler: SchedulerConfig;
  command: CommandConfig;
  monitor: MonitorConfig;
  web: WebConfig;
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
  monitor: {
    intervalMinutes: 10,
    agyTimeoutMs: 10000,
  },
  web: {
    port: 6789,
    host: "0.0.0.0",
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

    const monitor: MonitorConfig = {
      intervalMinutes: typeof parsed.monitor?.intervalMinutes === "number" && parsed.monitor.intervalMinutes > 0
        ? parsed.monitor.intervalMinutes
        : DEFAULT_CONFIG.monitor.intervalMinutes,
      agyTimeoutMs: typeof parsed.monitor?.agyTimeoutMs === "number" && parsed.monitor.agyTimeoutMs > 0
        ? parsed.monitor.agyTimeoutMs
        : DEFAULT_CONFIG.monitor.agyTimeoutMs,
    };

    const web: WebConfig = {
      port: typeof parsed.web?.port === "number" ? parsed.web.port : DEFAULT_CONFIG.web.port,
      host: typeof parsed.web?.host === "string" ? parsed.web.host : DEFAULT_CONFIG.web.host,
    };

    // 检查 startTime 是否早于 endTime
    const startMins = parseTimeToMinutes(scheduler.startTime);
    const endMins = parseTimeToMinutes(scheduler.endTime);
    if (startMins >= endMins) {
      console.warn(`[Config] 开始时间 (${scheduler.startTime}) 大于或等于结束时间 (${scheduler.endTime})，重置为默认配置。`);
      return { ...DEFAULT_CONFIG };
    }

    return { scheduler, command, monitor, web };
  } catch (error) {
    console.error(`[Config] 解析配置文件失败，将使用默认配置。错误信息:`, error);
    return { ...DEFAULT_CONFIG };
  }
}

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

export function validateConfig(cfg: Partial<Config>): Config {
  const merged: Config = {
    scheduler: { ...DEFAULT_CONFIG.scheduler, ...(cfg.scheduler || {}) },
    command: { ...DEFAULT_CONFIG.command, ...(cfg.command || {}) },
    monitor: { ...DEFAULT_CONFIG.monitor, ...(cfg.monitor || {}) },
    web: { ...DEFAULT_CONFIG.web, ...(cfg.web || {}) },
  };

  if (!isValidTimeFormat(merged.scheduler.startTime)) {
    throw new ConfigValidationError(`scheduler.startTime 格式错误: ${merged.scheduler.startTime}`);
  }
  if (!isValidTimeFormat(merged.scheduler.endTime)) {
    throw new ConfigValidationError(`scheduler.endTime 格式错误: ${merged.scheduler.endTime}`);
  }
  if (parseTimeToMinutes(merged.scheduler.startTime) >= parseTimeToMinutes(merged.scheduler.endTime)) {
    throw new ConfigValidationError(`scheduler.startTime (${merged.scheduler.startTime}) 必须早于 endTime (${merged.scheduler.endTime})`);
  }
  if (typeof merged.scheduler.intervalMinutes !== "number" || merged.scheduler.intervalMinutes <= 0) {
    throw new ConfigValidationError(`scheduler.intervalMinutes 必须为正数: ${merged.scheduler.intervalMinutes}`);
  }

  if (typeof merged.command.executable !== "string" || merged.command.executable.trim().length === 0) {
    throw new ConfigValidationError(`command.executable 不能为空`);
  }
  if (!Array.isArray(merged.command.args) || merged.command.args.some(a => typeof a !== "string")) {
    throw new ConfigValidationError(`command.args 必须为字符串数组`);
  }

  if (typeof merged.monitor.intervalMinutes !== "number" || merged.monitor.intervalMinutes <= 0) {
    throw new ConfigValidationError(`monitor.intervalMinutes 必须为正数: ${merged.monitor.intervalMinutes}`);
  }
  if (typeof merged.monitor.agyTimeoutMs !== "number" || merged.monitor.agyTimeoutMs <= 0) {
    throw new ConfigValidationError(`monitor.agyTimeoutMs 必须为正数: ${merged.monitor.agyTimeoutMs}`);
  }

  if (typeof merged.web.port !== "number" || merged.web.port < 1 || merged.web.port > 65535) {
    throw new ConfigValidationError(`web.port 必须在 1-65535 之间: ${merged.web.port}`);
  }
  if (typeof merged.web.host !== "string" || merged.web.host.trim().length === 0) {
    throw new ConfigValidationError(`web.host 不能为空`);
  }

  return merged;
}

export function saveConfig(cfg: Partial<Config>, configPath?: string): Config {
  const valid = validateConfig(cfg);
  const targetPath = configPath || join(process.cwd(), "config.json");
  const tmpPath = targetPath + ".tmp";
  try {
    const dir = dirname(targetPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(tmpPath, JSON.stringify(valid, null, 2), "utf-8");
    renameSync(tmpPath, targetPath);
  } catch (err: any) {
    throw new ConfigValidationError(`写入配置文件失败: ${err.message || String(err)}`);
  }
  return valid;
}
