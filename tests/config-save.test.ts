import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { existsSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { loadConfig, validateConfig, saveConfig, ConfigValidationError, DEFAULT_CONFIG } from "../src/lib/config";

const TMP_DIR = join(import.meta.dir, ".tmp-config");
const TMP_CFG = join(TMP_DIR, "config.json");

beforeAll(() => {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });
});

afterAll(() => {
  for (let i = 0; i < 5; i++) {
    try { if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true }); break; }
    catch { Bun.sleepSync(200); }
  }
});

beforeEach(() => {
  if (existsSync(TMP_CFG)) rmSync(TMP_CFG);
});

describe("validateConfig", () => {
  it("应接受完整合法配置并返回合并后的值", () => {
    const result = validateConfig({
      scheduler: { startTime: "08:00", endTime: "22:00", intervalMinutes: 15 },
      command: { executable: "agy", args: ["--prompt", "hi"] },
      monitor: { intervalMinutes: 5, agyTimeoutMs: 8000 },
      web: { port: 4000, host: "127.0.0.1" },
    });
    expect(result.scheduler.intervalMinutes).toBe(15);
    expect(result.command.args).toEqual(["--prompt", "hi"]);
    expect(result.web.port).toBe(4000);
  });

  it("应在缺省时补齐默认配置", () => {
    const result = validateConfig({});
    expect(result.scheduler.startTime).toBe(DEFAULT_CONFIG.scheduler.startTime);
    expect(result.monitor.intervalMinutes).toBe(DEFAULT_CONFIG.monitor.intervalMinutes);
  });

  it("应拒绝错误的时间格式", () => {
    expect(() => validateConfig({ scheduler: { ...DEFAULT_CONFIG.scheduler, startTime: "25:00" } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ scheduler: { ...DEFAULT_CONFIG.scheduler, startTime: "9am" } }))
      .toThrow(ConfigValidationError);
  });

  it("应拒绝 startTime >= endTime", () => {
    expect(() => validateConfig({ scheduler: { startTime: "10:00", endTime: "09:00", intervalMinutes: 30 } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ scheduler: { startTime: "10:00", endTime: "10:00", intervalMinutes: 30 } }))
      .toThrow(ConfigValidationError);
  });

  it("应拒绝非正数的 interval 和 timeout", () => {
    expect(() => validateConfig({ scheduler: { ...DEFAULT_CONFIG.scheduler, intervalMinutes: 0 } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ scheduler: { ...DEFAULT_CONFIG.scheduler, intervalMinutes: -1 } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ monitor: { ...DEFAULT_CONFIG.monitor, intervalMinutes: 0 } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ monitor: { ...DEFAULT_CONFIG.monitor, agyTimeoutMs: -100 } }))
      .toThrow(ConfigValidationError);
  });

  it("应拒绝空的 executable", () => {
    expect(() => validateConfig({ command: { executable: "", args: [] } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ command: { executable: "   ", args: [] } }))
      .toThrow(ConfigValidationError);
  });

  it("应拒绝非法的 maxRetries", () => {
    expect(() => validateConfig({ command: { executable: "agy", args: [], maxRetries: -1 } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ command: { executable: "agy", args: [], maxRetries: 1.5 } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ command: { executable: "agy", args: [], maxRetries: "abc" as any } }))
      .toThrow(ConfigValidationError);
  });

  it("应接受合法的 maxRetries", () => {
    const result = validateConfig({ command: { executable: "agy", args: [], maxRetries: 0 } });
    expect(result.command.maxRetries).toBe(0);
    const result2 = validateConfig({ command: { executable: "agy", args: [], maxRetries: 5 } });
    expect(result2.command.maxRetries).toBe(5);
  });

  it("应拒绝非字符串数组的 args", () => {
    expect(() => validateConfig({ command: { executable: "agy", args: [1, 2] as any } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ command: { executable: "agy", args: "not-array" as any } }))
      .toThrow(ConfigValidationError);
  });

  it("应拒绝非法端口", () => {
    expect(() => validateConfig({ web: { port: 0, host: "127.0.0.1" } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ web: { port: 70000, host: "127.0.0.1" } }))
      .toThrow(ConfigValidationError);
    expect(() => validateConfig({ web: { port: 3000, host: "" } }))
      .toThrow(ConfigValidationError);
  });
});

describe("saveConfig", () => {
  it("应原子写入并返回校验后的配置", () => {
    const result = saveConfig({
      scheduler: { startTime: "09:30", endTime: "21:30", intervalMinutes: 45 },
      command: { executable: "agy", args: ["--prompt", "test"] },
    }, TMP_CFG);
    expect(result.scheduler.intervalMinutes).toBe(45);
    expect(existsSync(TMP_CFG)).toBe(true);
    const onDisk = JSON.parse(readFileSync(TMP_CFG, "utf-8"));
    expect(onDisk.scheduler.startTime).toBe("09:30");
  });

  it("应在校验失败时不写入文件", () => {
    expect(() => saveConfig({ scheduler: { startTime: "25:00", endTime: "20:00", intervalMinutes: 30 } }, TMP_CFG))
      .toThrow(ConfigValidationError);
    expect(existsSync(TMP_CFG)).toBe(false);
  });
});

describe("loadConfig", () => {
  it("文件不存在时应回退到默认配置", () => {
    const cfg = loadConfig(join(TMP_DIR, "nonexistent.json"));
    expect(cfg.scheduler.startTime).toBe(DEFAULT_CONFIG.scheduler.startTime);
    expect(cfg.scheduler.intervalMinutes).toBe(DEFAULT_CONFIG.scheduler.intervalMinutes);
    expect(cfg.monitor.intervalMinutes).toBe(DEFAULT_CONFIG.monitor.intervalMinutes);
  });

  it("应加载合法配置文件", () => {
    writeFileSync(TMP_CFG, JSON.stringify({
      scheduler: { startTime: "09:00", endTime: "22:00", intervalMinutes: 45 },
      command: { executable: "agy", args: ["--prompt", "hi"] },
      monitor: { intervalMinutes: 5, agyTimeoutMs: 8000 },
      web: { port: 6789, host: "0.0.0.0" },
    }));
    const cfg = loadConfig(TMP_CFG);
    expect(cfg.scheduler.startTime).toBe("09:00");
    expect(cfg.scheduler.intervalMinutes).toBe(45);
    expect(cfg.command.executable).toBe("agy");
    expect(cfg.monitor.intervalMinutes).toBe(5);
    expect(cfg.web.port).toBe(6789);
  });

  it("JSON 解析失败时应回退到默认配置", () => {
    writeFileSync(TMP_CFG, "{invalid-json}");
    const cfg = loadConfig(TMP_CFG);
    expect(cfg.scheduler.startTime).toBe(DEFAULT_CONFIG.scheduler.startTime);
  });

  it("缺失字段应合并默认值", () => {
    writeFileSync(TMP_CFG, JSON.stringify({
      scheduler: { startTime: "10:00", endTime: "20:00", intervalMinutes: 30 },
    }));
    const cfg = loadConfig(TMP_CFG);
    expect(cfg.scheduler.startTime).toBe("10:00");
    expect(cfg.command.executable).toBe(DEFAULT_CONFIG.command.executable);
    expect(cfg.monitor.intervalMinutes).toBe(DEFAULT_CONFIG.monitor.intervalMinutes);
    expect(cfg.web.port).toBe(DEFAULT_CONFIG.web.port);
  });

  it("startTime >= endTime 时应回退到默认配置", () => {
    writeFileSync(TMP_CFG, JSON.stringify({
      scheduler: { startTime: "20:00", endTime: "08:00", intervalMinutes: 30 },
      command: { executable: "agy", args: ["--prompt", "hi"] },
    }));
    const cfg = loadConfig(TMP_CFG);
    expect(cfg.scheduler.startTime).toBe(DEFAULT_CONFIG.scheduler.startTime);
    expect(cfg.scheduler.endTime).toBe(DEFAULT_CONFIG.scheduler.endTime);
  });

  it("非法字段值应回退到默认值", () => {
    writeFileSync(TMP_CFG, JSON.stringify({
      scheduler: { startTime: "25:00", endTime: "22:00", intervalMinutes: -1 },
    }));
    const cfg = loadConfig(TMP_CFG);
    expect(cfg.scheduler.startTime).toBe(DEFAULT_CONFIG.scheduler.startTime);
    expect(cfg.scheduler.intervalMinutes).toBe(DEFAULT_CONFIG.scheduler.intervalMinutes);
  });
});
