import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { mkdirSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { Database } from "bun:sqlite";
import { initSchema, saveSnapshot, getRecords, getLatestWithModels, getModelHistory, getRecordsRange, resetDb, saveImageGenQuota, getImageGenLatestPerModel, getImageGenHistory, getLatestImageGenQuota } from "../src/lib/database";
import { readFileSync } from "fs";
import { parseUserStatusToSnapshot } from "../src/lib/quota-parser";
import { parseImageGenQuota } from "../src/lib/image-gen-quota";

const FIXTURE_DIR = join(import.meta.dir, "fixtures");
const TEST_DB_DIR = join(import.meta.dir, ".tmp");
const TEST_DB_PATH = join(TEST_DB_DIR, "test-quota.db");

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
});

describe("database CRUD", () => {
  it("should create schema and save a record", () => {
    const rawJson = readFileSync(join(FIXTURE_DIR, "get-user-status-response.json"), "utf-8");
    const response = JSON.parse(rawJson);
    const snapshot = parseUserStatusToSnapshot(response);
    snapshot.rawJson = rawJson;

    const recordId = saveSnapshot(snapshot);
    expect(recordId).toBeGreaterThan(0);

    const records = getRecords(10);
    expect(records.length).toBeGreaterThan(0);
    expect(records[0].email).toBe("user@example.com");
  });

  it("should retrieve latest record with models", () => {
    const rawJson = readFileSync(join(FIXTURE_DIR, "get-user-status-response.json"), "utf-8");
    const snapshot = parseUserStatusToSnapshot(JSON.parse(rawJson));
    snapshot.rawJson = rawJson;
    saveSnapshot(snapshot);

    const { record, models } = getLatestWithModels();
    expect(record).not.toBeNull();
    expect(models.length).toBe(8);
  });

  it("should retrieve model history", () => {
    const rawJson = readFileSync(join(FIXTURE_DIR, "get-user-status-response.json"), "utf-8");
    const snapshot = parseUserStatusToSnapshot(JSON.parse(rawJson));
    snapshot.rawJson = rawJson;
    saveSnapshot(snapshot);

    const history = getModelHistory("MODEL_PLACEHOLDER_M20", 168);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].time).toBeTruthy();
    expect(typeof history[0].usedPct).toBe("number");
  });

  it("should retrieve records within time range", () => {
    const rawJson = readFileSync(join(FIXTURE_DIR, "get-user-status-response.json"), "utf-8");
    const snapshot = parseUserStatusToSnapshot(JSON.parse(rawJson));
    snapshot.rawJson = rawJson;
    saveSnapshot(snapshot);

    const range = getRecordsRange(168);
    expect(range.length).toBeGreaterThan(0);
    for (const entry of range) {
      expect(entry.record).toBeTruthy();
      expect(Array.isArray(entry.models)).toBe(true);
    }
  });

  it("should handle edge case models in DB", () => {
    const edgeJson = readFileSync(join(FIXTURE_DIR, "get-user-status-edge-cases.json"), "utf-8");
    const response = JSON.parse(edgeJson);
    const snapshot = parseUserStatusToSnapshot(response);
    snapshot.rawJson = edgeJson;

    const recordId = saveSnapshot(snapshot);
    expect(recordId).toBeGreaterThan(0);

    const { record, models } = getLatestWithModels();
    expect(record).not.toBeNull();

    const exhausted = models.find(m => m.model_id === "MODEL_EXHAUSTED");
    expect(exhausted).toBeDefined();
    expect(exhausted!.is_exhausted).toBe(1);
    expect(exhausted!.used_pct).toBe(100);
  });
});

describe("initSchema", () => {
  it("should be idempotent (can be called multiple times)", () => {
    const db = new Database(TEST_DB_PATH);
    expect(() => initSchema(db)).not.toThrow();
    expect(() => initSchema(db)).not.toThrow();
    db.close();
  });
});

describe("image_gen_quotas", () => {
  it("should save an exhausted report and read it back", () => {
    const rawJson = readFileSync(join(FIXTURE_DIR, "image-gen-quota.json"), "utf-8");
    const snapshot = parseImageGenQuota(rawJson)!;
    const id = saveImageGenQuota(snapshot);
    expect(id).toBeGreaterThan(0);

    const latest = getLatestImageGenQuota();
    expect(latest).not.toBeNull();
    expect(latest!.model_id).toBe("gemini-3.1-flash-image");
    expect(latest!.is_exhausted).toBe(1);
    expect(latest!.reset_time).toBe("2026-07-09T15:33:14Z");
  });

  it("should return latest per model", () => {
    const err = parseImageGenQuota(readFileSync(join(FIXTURE_DIR, "image-gen-quota.json"), "utf-8"))!;
    saveImageGenQuota(err);
    const ok = parseImageGenQuota({ ok: true, model: "gemini-3.1-flash-image" })!;
    saveImageGenQuota(ok);

    const perModel = getImageGenLatestPerModel();
    expect(perModel).toHaveLength(1);
    expect(perModel[0].model_id).toBe("gemini-3.1-flash-image");
    expect(perModel[0].is_exhausted).toBe(0);

    const history = getImageGenHistory(10);
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history[0].is_exhausted).toBe(0);
    expect(history[history.length - 1].is_exhausted).toBe(1);
  });
});
