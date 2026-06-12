import { expect, test, describe } from "bun:test";
import { getNextRunTime, getNextRollingRunTime } from "../src/lib/scheduler";
import { isValidTimeFormat, parseTimeToMinutes } from "../src/lib/config";
import type { SchedulerConfig } from "../src/lib/config";

describe("isValidTimeFormat", () => {
  test("应接受合法 HH:MM 格式", () => {
    expect(isValidTimeFormat("08:00")).toBe(true);
    expect(isValidTimeFormat("00:00")).toBe(true);
    expect(isValidTimeFormat("23:59")).toBe(true);
    expect(isValidTimeFormat("12:30")).toBe(true);
  });

  test("应拒绝非法格式", () => {
    expect(isValidTimeFormat("25:00")).toBe(false);
    expect(isValidTimeFormat("08:60")).toBe(false);
    expect(isValidTimeFormat("8:00")).toBe(false);
    expect(isValidTimeFormat("abc")).toBe(false);
    expect(isValidTimeFormat("")).toBe(false);
    expect(isValidTimeFormat("08-00")).toBe(false);
  });
});

describe("parseTimeToMinutes", () => {
  test("应正确转换 HH:MM 为分钟数", () => {
    expect(parseTimeToMinutes("00:00")).toBe(0);
    expect(parseTimeToMinutes("08:00")).toBe(480);
    expect(parseTimeToMinutes("23:59")).toBe(1439);
    expect(parseTimeToMinutes("12:30")).toBe(750);
  });

  test("应拒绝非法格式并抛出 Error", () => {
    expect(() => parseTimeToMinutes("25:00")).toThrow();
    expect(() => parseTimeToMinutes("abc")).toThrow();
  });
});

describe("Scheduler Logic (getNextRunTime)", () => {
  const defaultConfig: SchedulerConfig = {
    startTime: "08:00",
    endTime: "23:30",
    intervalMinutes: 30,
  };

  test("before start time: 07:59:00 -> 08:00:00 same day", () => {
    const now = new Date("2026-06-04T07:59:00");
    const next = getNextRunTime(now, defaultConfig);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(5); // June is 5 in JS Date
    expect(next.getDate()).toBe(4);
    expect(next.getHours()).toBe(8);
    expect(next.getMinutes()).toBe(0);
    expect(next.getSeconds()).toBe(0);
    expect(next.getMilliseconds()).toBe(0);
  });

  test("exactly at start time: 08:00:00 -> 08:00:00 same day (run now)", () => {
    const now = new Date("2026-06-04T08:00:00");
    const next = getNextRunTime(now, defaultConfig);
    expect(next.getDate()).toBe(4);
    expect(next.getHours()).toBe(8);
    expect(next.getMinutes()).toBe(0);
  });

  test("between intervals: 08:15:00 -> 08:30:00 same day", () => {
    const now = new Date("2026-06-04T08:15:00");
    const next = getNextRunTime(now, defaultConfig);
    expect(next.getDate()).toBe(4);
    expect(next.getHours()).toBe(8);
    expect(next.getMinutes()).toBe(30);
  });

  test("exactly at final interval: 23:00:00 -> 23:00:00 same day (run now)", () => {
    const now = new Date("2026-06-04T23:00:00");
    const next = getNextRunTime(now, defaultConfig);
    expect(next.getDate()).toBe(4);
    expect(next.getHours()).toBe(23);
    expect(next.getMinutes()).toBe(0);
  });

  test("at end time: 23:30:00 -> 23:30:00 same day (run now)", () => {
    const now = new Date("2026-06-04T23:30:00");
    const next = getNextRunTime(now, defaultConfig);
    expect(next.getDate()).toBe(4);
    expect(next.getHours()).toBe(23);
    expect(next.getMinutes()).toBe(30);
  });

  test("after end time: 23:30:01 -> 08:00:00 next day", () => {
    const now = new Date("2026-06-04T23:30:01");
    const next = getNextRunTime(now, defaultConfig);
    expect(next.getDate()).toBe(5);
    expect(next.getHours()).toBe(8);
    expect(next.getMinutes()).toBe(0);
  });
  test("after window: 23:45:00 -> 08:00:00 next day", () => {
    const now = new Date("2026-06-04T23:45:00");
    const next = getNextRunTime(now, defaultConfig);
    expect(next.getDate()).toBe(5);
    expect(next.getHours()).toBe(8);
    expect(next.getMinutes()).toBe(0);
  });

  test("early morning: 01:30:00 -> 08:00:00 same day", () => {
    const now = new Date("2026-06-04T01:30:00");
    const next = getNextRunTime(now, defaultConfig);
    expect(next.getDate()).toBe(4);
    expect(next.getHours()).toBe(8);
    expect(next.getMinutes()).toBe(0);
  });

  test("custom config: 09:00 to 10:00 every 15 mins", () => {
    const customConfig: SchedulerConfig = {
      startTime: "09:00",
      endTime: "10:00",
      intervalMinutes: 15,
    };

    // 09:05 -> 09:15
    let next = getNextRunTime(new Date("2026-06-04T09:05:00"), customConfig);
    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(15);

    // 10:00 -> 10:00 (run now)
    next = getNextRunTime(new Date("2026-06-04T10:00:00"), customConfig);
    expect(next.getDate()).toBe(4);
    expect(next.getHours()).toBe(10);
    expect(next.getMinutes()).toBe(0);
    // 10:00:02 -> tomorrow 09:00 (past tolerance)
    next = getNextRunTime(new Date("2026-06-04T10:00:02"), customConfig);
    expect(next.getDate()).toBe(5);
    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(0);
  });
});

describe("getNextRollingRunTime", () => {
  const config: SchedulerConfig = {
    startTime: "08:00",
    endTime: "23:30",
    intervalMinutes: 60,
  };

  test("正常滚动: 10:00 执行后下一次应为 11:00", () => {
    const lastRun = new Date("2026-06-04T10:00:00");
    const now = new Date("2026-06-04T10:02:00");
    const next = getNextRollingRunTime(lastRun, now, config);
    expect(next.getDate()).toBe(4);
    expect(next.getHours()).toBe(11);
    expect(next.getMinutes()).toBe(0);
  });

  test("执行耗时超过间隔: 10:00 执行 + 70min > 11:00，应跳到 now + 60min", () => {
    const lastRun = new Date("2026-06-04T10:00:00");
    const now = new Date("2026-06-04T11:05:00");
    const next = getNextRollingRunTime(lastRun, now, config);
    expect(next.getHours()).toBe(12);
    expect(next.getMinutes()).toBe(5);
  });

  test("滚动结果超出结束时间: 22:30 执行 + 60min = 23:30，若 endTime=23:30 仍允许", () => {
    const c: SchedulerConfig = { startTime: "08:00", endTime: "23:30", intervalMinutes: 60 };
    const lastRun = new Date("2026-06-04T22:30:00");
    const now = new Date("2026-06-04T22:32:00");
    const next = getNextRollingRunTime(lastRun, now, c);
    // 22:30 + 60 = 23:30，等于 endTime 允许
    expect(next.getDate()).toBe(4);
    expect(next.getHours()).toBe(23);
    expect(next.getMinutes()).toBe(30);
  });

  test("滚动结果超出结束时间: 23:00 执行 + 60min = 00:00，推到次日 08:00", () => {
    const lastRun = new Date("2026-06-04T23:00:00");
    const now = new Date("2026-06-04T23:02:00");
    const next = getNextRollingRunTime(lastRun, now, config);
    expect(next.getDate()).toBe(5);
    expect(next.getHours()).toBe(8);
    expect(next.getMinutes()).toBe(0);
  });

  test("滚动结果早于开始时间: 07:30 执行 + 15min = 07:45，应提升到 08:00", () => {
    const c: SchedulerConfig = { startTime: "08:00", endTime: "23:30", intervalMinutes: 15 };
    const lastRun = new Date("2026-06-04T07:30:00");
    const now = new Date("2026-06-04T07:32:00");
    const next = getNextRollingRunTime(lastRun, now, c);
    expect(next.getDate()).toBe(4);
    expect(next.getHours()).toBe(8);
    expect(next.getMinutes()).toBe(0);
  });

  test("跨天: 23:00 + 60min 过午夜推到次日 08:00", () => {
    const lastRun = new Date("2026-06-04T23:00:00");
    const now = new Date("2026-06-04T23:01:00");
    const next = getNextRollingRunTime(lastRun, now, config);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(5);
    expect(next.getDate()).toBe(5);
    expect(next.getHours()).toBe(8);
    expect(next.getMinutes()).toBe(0);
  });
});
