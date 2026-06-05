import { parseTimeToMinutes, type SchedulerConfig } from "./config";

/**
 * 根据当前时间和调度配置，计算并返回下一次触发执行的 Date 对象
 * @param now 当前时间
 * @param config 调度配置（包括起止时间、间隔）
 */
export function getNextRunTime(now: Date, config: SchedulerConfig): Date {
  const startMins = parseTimeToMinutes(config.startTime);
  const endMins = parseTimeToMinutes(config.endTime);
  const interval = config.intervalMinutes;

  if (startMins >= endMins) {
    throw new Error(`开始时间 (${config.startTime}) 必须早于结束时间 (${config.endTime})`);
  }
  if (interval <= 0) {
    throw new Error(`运行间隔必须大于 0: ${interval}`);
  }

  // 生成当天所有的调度时间点（从午夜开始计算的分钟数）
  const allowedMins: number[] = [];
  for (let m = startMins; m <= endMins; m += interval) {
    allowedMins.push(m);
  }

  // 计算当前时间对应的当天分钟数（高精度，支持秒和毫秒）
  const nowMins = now.getHours() * 60 + now.getMinutes() + (now.getSeconds() * 1000 + now.getMilliseconds()) / 60000;

  // 寻找当天第一个调度点（允许 1 秒容忍，确保整点时刻不会跳过）
  const nextMin = allowedMins.find((m) => m + 1 / 60000 > nowMins);

  const nextDate = new Date(now.getTime());

  if (nextMin !== undefined) {
    // 仍在当天调度周期内，设定为当天的对应时刻
    nextDate.setHours(Math.floor(nextMin / 60), nextMin % 60, 0, 0);
  } else {
    // 已超过当天最后一个调度点，设定为明天的第一个调度时刻
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(Math.floor(allowedMins[0] / 60), allowedMins[0] % 60, 0, 0);
  }

  return nextDate;
}
