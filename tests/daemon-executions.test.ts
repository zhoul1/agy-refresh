import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { mkdirSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { initSchema, saveExecution, getRecentExecutions, getLatestExecution, resetDb, getDb } from "../src/lib/database";

const TEST_DB_DIR = join(import.meta.dir, ".tmp");
const TEST_DB_PATH = join(TEST_DB_DIR, "test-executions.db");

beforeAll(() => {
  if (!existsSync(TEST_DB_DIR)) mkdirSync(TEST_DB_DIR, { recursive: true });
  process.env.__TEST_DB_PATH = TEST_DB_PATH;
});

afterAll(() => {
  resetDb();
  delete process.env.__TEST_DB_PATH;
  for (let i = 0; i < 5; i++) {
    try { if (existsSync(TEST_DB_DIR)) rmSync(TEST_DB_DIR, { recursive: true, force: true }); break; }
    catch { Bun.sleepSync(200); }
  }
});

beforeEach(() => {
  resetDb();
  process.env.__TEST_DB_PATH = ":memory:";
  getDb();
});

describe("daemon_executions CRUD", () => {
  it("should insert a successful execution and read it back", () => {
    const id = saveExecution({
      success: true,
      stdout: "hello from agy",
      stderr: "",
      durationMs: 1234,
      triggeredBy: "scheduled",
    });
    expect(id).toBeGreaterThan(0);

    const latest = getLatestExecution();
    expect(latest).not.toBeNull();
    expect(latest!.success).toBe(1);
    expect(latest!.stdout).toBe("hello from agy");
    expect(latest!.duration_ms).toBe(1234);
    expect(latest!.triggered_by).toBe("scheduled");
  });

  it("should insert a failed execution with stderr", () => {
    saveExecution({
      success: false,
      stdout: "",
      stderr: "command not found: agy",
      durationMs: 50,
      triggeredBy: "manual",
    });

    const latest = getLatestExecution();
    expect(latest!.success).toBe(0);
    expect(latest!.stderr).toBe("command not found: agy");
    expect(latest!.triggered_by).toBe("manual");
  });

  it("should return recent executions in descending order with limit", () => {
    for (let i = 0; i < 5; i++) {
      saveExecution({
        success: i % 2 === 0,
        stdout: `run ${i}`,
        durationMs: i * 100,
        triggeredBy: "scheduled",
        runAt: new Date(Date.now() + i * 1000).toISOString(),
      });
    }

    const recent = getRecentExecutions(3);
    expect(recent.length).toBe(3);
    expect(recent[0].stdout).toBe("run 4");
    expect(recent[1].stdout).toBe("run 3");
    expect(recent[2].stdout).toBe("run 2");
  });

  it("should accept execution without optional fields", () => {
    const id = saveExecution({ success: true });
    expect(id).toBeGreaterThan(0);
    const latest = getLatestExecution();
    expect(latest!.stdout).toBeNull();
    expect(latest!.stderr).toBeNull();
    expect(latest!.duration_ms).toBeNull();
    expect(latest!.triggered_by).toBeNull();
  });

  it("should return null when no executions exist", () => {
    const latest = getLatestExecution();
    expect(latest).toBeNull();
    expect(getRecentExecutions(10)).toEqual([]);
  });

  it("should handle large stdout within SQLite limit", () => {
    const big = "x".repeat(50000);
    saveExecution({ success: true, stdout: big, triggeredBy: "manual" });
    const latest = getLatestExecution();
    expect(latest!.stdout!.length).toBe(50000);
  });
});
