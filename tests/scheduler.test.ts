import { expect, test, describe } from "bun:test";
import { getNextRunTime } from "../src/lib/scheduler";
import type { SchedulerConfig } from "../src/lib/config";

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
