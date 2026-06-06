import { expect, test, describe, beforeEach, afterAll } from "bun:test";
import { join } from "path";
import { unlinkSync } from "fs";

const TMP = join(import.meta.dir, ".tmp");

function cleanDb(dbPath: string) {
  try { unlinkSync(dbPath); } catch {}
  try { unlinkSync(dbPath + "-wal"); } catch {}
  try { unlinkSync(dbPath + "-shm"); } catch {}
}

import { resetDb, saveAutoContinueLog, getAutoContinueLogs, getLatestAutoContinueLog } from "../src/lib/database";
import { validateConfig, DEFAULT_CONFIG } from "../src/lib/config";
import { getAutoContinueState, setAutoContinueState, recordAutoContinueTrigger, resetRuntimeForTests } from "../src/lib/runtime";

let testIdx = 0;

describe("auto_continue_logs CRUD", () => {
  beforeEach(() => {
    resetDb();
    testIdx++;
    const path = join(TMP, `test-ac-${testIdx}.db`);
    cleanDb(path);
    process.env.__TEST_DB_PATH = path;
  });

  afterAll(() => {
    delete process.env.__TEST_DB_PATH;
    resetDb();
  });

  test("should insert a log and read it back", () => {
    const id = saveAutoContinueLog({
      success: true,
      stdout: "ok",
      stderr: "",
      durationMs: 1234,
      conversationId: "abc-123",
      prompt: "继续",
      quotaUsedBefore: 80,
      quotaUsedAfter: 10,
    });
    expect(id).toBeGreaterThan(0);

    const logs = getAutoContinueLogs(10);
    expect(logs.length).toBe(1);
    expect(logs[0].success).toBe(1);
    expect(logs[0].stdout).toBe("ok");
    expect(logs[0].duration_ms).toBe(1234);
    expect(logs[0].conversation_id).toBe("abc-123");
    expect(logs[0].prompt).toBe("继续");
    expect(logs[0].quota_used_before).toBe(80);
    expect(logs[0].quota_used_after).toBe(10);
  });

  test("should return latest log", () => {
    saveAutoContinueLog({ success: true, stdout: "first" });
    saveAutoContinueLog({ success: false, stderr: "fail" });
    const latest = getLatestAutoContinueLog();
    expect(latest).not.toBeNull();
    expect(latest!.success).toBe(0);
    expect(latest!.stderr).toBe("fail");
  });

  test("should return null when no logs", () => {
    expect(getLatestAutoContinueLog()).toBeNull();
  });

  test("should return logs in descending order", () => {
    saveAutoContinueLog({ success: true, stdout: "1" });
    saveAutoContinueLog({ success: true, stdout: "2" });
    const logs = getAutoContinueLogs(10);
    expect(logs.length).toBe(2);
    expect(logs[0].stdout).toBe("2");
    expect(logs[1].stdout).toBe("1");
  });
});

describe("AutoContinue config", () => {
  test("default config has autoContinue disabled", () => {
    expect(DEFAULT_CONFIG.autoContinue.enabled).toBe(false);
    expect(DEFAULT_CONFIG.autoContinue.conversationId).toBe("");
    expect(DEFAULT_CONFIG.autoContinue.prompt).toBe("继续");
    expect(DEFAULT_CONFIG.autoContinue.exhaustedThreshold).toBe(20);
    expect(DEFAULT_CONFIG.autoContinue.refreshThreshold).toBe(50);
  });

  test("validateConfig accepts valid autoContinue config", () => {
    const cfg = validateConfig({
      autoContinue: {
        enabled: true,
        conversationId: "abc-123-def",
        prompt: "继续",
        exhaustedThreshold: 10,
        refreshThreshold: 60,
      },
    });
    expect(cfg.autoContinue.enabled).toBe(true);
    expect(cfg.autoContinue.conversationId).toBe("abc-123-def");
  });

  test("validateConfig rejects empty conversationId when enabled", () => {
    expect(() => validateConfig({
      autoContinue: { enabled: true, conversationId: "", prompt: "继续", exhaustedThreshold: 10, refreshThreshold: 60 },
    })).toThrow("conversationId");
  });

  test("validateConfig rejects exhausted >= refresh", () => {
    expect(() => validateConfig({
      autoContinue: { enabled: true, conversationId: "abc", prompt: "继续", exhaustedThreshold: 50, refreshThreshold: 40 },
    })).toThrow("exhaustedThreshold");
  });

  test("validateConfig rejects threshold out of range", () => {
    expect(() => validateConfig({
      autoContinue: { enabled: true, conversationId: "abc", prompt: "继续", exhaustedThreshold: -1, refreshThreshold: 50 },
    })).toThrow("exhaustedThreshold");
  });
});

describe("AutoContinue runtime state", () => {
  beforeEach(() => {
    resetRuntimeForTests();
  });

  test("initial state has no trigger", () => {
    const state = getAutoContinueState();
    expect(state.lastAvgUsed).toBeNull();
    expect(state.lastAvgRemaining).toBeNull();
    expect(state.lastTrigger).toBeNull();
  });

  test("setAutoContinueState updates state values", () => {
    setAutoContinueState({
      lastAvgUsed: 85,
      lastAvgRemaining: 15,
      exhaustedThreshold: 20,
      refreshThreshold: 50,
    });
    const state = getAutoContinueState();
    expect(state.lastAvgUsed).toBe(85);
    expect(state.lastAvgRemaining).toBe(15);
  });

  test("recordAutoContinueTrigger sets lastTrigger and emits event", () => {
    let emitted: any = null;
    const { onEvent, offEvent } = require("../src/lib/runtime");
    const handler = (info: any) => { emitted = info; };
    onEvent("autocontinue:triggered", handler);

    recordAutoContinueTrigger({
      success: true,
      stdout: "done",
      stderr: "",
      durationMs: 500,
      conversationId: "abc",
      prompt: "继续",
      quotaUsedBefore: 80,
      quotaUsedAfter: 10,
      logId: 1,
    });

    expect(emitted).not.toBeNull();
    expect(emitted.success).toBe(true);

    const state = getAutoContinueState();
    expect(state.lastTrigger).not.toBeNull();
    expect(state.lastTrigger!.success).toBe(true);

    offEvent("autocontinue:triggered", handler);
  });
});
