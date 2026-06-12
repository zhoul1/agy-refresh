import { Database } from "bun:sqlite";
import { join, dirname } from "path";
import { mkdirSync, existsSync } from "fs";
import type { QuotaSnapshot, ModelQuotaInfo } from "./agy-quota";

const DATA_DIR = join(import.meta.dir, "..", "..", "data");
const DEFAULT_DB_PATH = join(DATA_DIR, "quota.db");

let _db: Database | null = null;

function getDbPath(): string {
  return process.env.__TEST_DB_PATH || DEFAULT_DB_PATH;
}

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function resetDb() {
  if (_db) { _db.close(); _db = null; }
}

export function getDb(): Database {
  if (!_db) {
    const path = getDbPath();
    ensureDir(path);
    _db = new Database(path);
    _db.run("PRAGMA journal_mode=WAL");
    initSchema(_db);
  }
  return _db;
}

export function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS quota_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recorded_at TEXT NOT NULL,
      email TEXT,
      raw_json TEXT,
      prompt_credits_used INTEGER,
      prompt_credits_limit INTEGER,
      prompt_credits_remaining INTEGER
    )
  `);
  // Add new columns if they don't exist (migration)
  try { db.run("ALTER TABLE quota_records ADD COLUMN name TEXT"); } catch {}
  try { db.run("ALTER TABLE quota_records ADD COLUMN plan_name TEXT"); } catch {}
  try { db.run("ALTER TABLE quota_records ADD COLUMN flow_credits_used INTEGER"); } catch {}
  try { db.run("ALTER TABLE quota_records ADD COLUMN flow_credits_limit INTEGER"); } catch {}
  try { db.run("ALTER TABLE quota_records ADD COLUMN flow_credits_remaining INTEGER"); } catch {}
  try { db.run("ALTER TABLE quota_records ADD COLUMN google_one_ai_credits INTEGER"); } catch {}
  db.run(`
    CREATE TABLE IF NOT EXISTS model_quotas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL REFERENCES quota_records(id),
      model_id TEXT NOT NULL,
      display_name TEXT,
      used_pct REAL,
      remaining_pct REAL,
      reset_time TEXT,
      is_exhausted INTEGER DEFAULT 0
    )
  `);
  try { db.run("ALTER TABLE model_quotas ADD COLUMN tag_title TEXT"); } catch {}
  try { db.run("ALTER TABLE model_quotas ADD COLUMN tag_description TEXT"); } catch {}
  try { db.run("ALTER TABLE model_quotas ADD COLUMN supports_images INTEGER DEFAULT 0"); } catch {}
  db.run(`CREATE INDEX IF NOT EXISTS idx_model_quotas_record ON model_quotas(record_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_quota_records_time ON quota_records(recorded_at)`);
  db.run(`
    CREATE TABLE IF NOT EXISTS daemon_executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_at TEXT NOT NULL,
      success INTEGER NOT NULL,
      stdout TEXT,
      stderr TEXT,
      duration_ms INTEGER,
      triggered_by TEXT
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_daemon_executions_time ON daemon_executions(run_at)`);
}

export function saveSnapshot(snapshot: QuotaSnapshot): number {
  const db = getDb();
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO quota_records (recorded_at, email, name, plan_name, raw_json, prompt_credits_used, prompt_credits_limit, prompt_credits_remaining, flow_credits_used, flow_credits_limit, flow_credits_remaining, google_one_ai_credits)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertModel = db.prepare(`
    INSERT INTO model_quotas (record_id, model_id, display_name, used_pct, remaining_pct, reset_time, is_exhausted, tag_title, tag_description, supports_images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = db.transaction(() => {
    const info = insert.run(
      now, snapshot.email || null, snapshot.name || null, snapshot.planName || null, snapshot.rawJson,
      snapshot.promptCreditsUsed ?? null, snapshot.promptCreditsLimit ?? null,
      snapshot.promptCreditsRemaining ?? null,
      snapshot.flowCreditsUsed ?? null, snapshot.flowCreditsLimit ?? null,
      snapshot.flowCreditsRemaining ?? null,
      snapshot.googleOneAiCredits ?? null
    );
    const recordId = Number(info.lastInsertRowid);
    for (const m of snapshot.models) {
      insertModel.run(recordId, m.modelId, m.displayName || null,
        m.usedPercentage ?? null, m.remainingPercentage ?? null,
        m.resetTime || null, m.isExhausted ? 1 : 0,
        m.tagTitle || null, m.tagDescription || null,
        m.supportsImages ? 1 : 0);
    }
    return recordId;
  })();
  return result;
}

export interface RecordRow {
  id: number;
  recorded_at: string;
  email: string | null;
  name: string | null;
  plan_name: string | null;
  prompt_credits_used: number | null;
  prompt_credits_limit: number | null;
  prompt_credits_remaining: number | null;
  flow_credits_used: number | null;
  flow_credits_limit: number | null;
  flow_credits_remaining: number | null;
  google_one_ai_credits: number | null;
}

export interface ModelQuotaRow {
  id: number;
  record_id: number;
  model_id: string;
  display_name: string | null;
  used_pct: number | null;
  remaining_pct: number | null;
  reset_time: string | null;
  is_exhausted: number;
  tag_title: string | null;
  tag_description: string | null;
  supports_images: number;
}

export function getRecords(limit = 1000): RecordRow[] {
  const db = getDb();
  return db.query(`SELECT * FROM quota_records ORDER BY recorded_at DESC LIMIT ?`).all(limit) as RecordRow[];
}

export function getModelsForRecord(recordId: number): ModelQuotaRow[] {
  const db = getDb();
  return db.query(`SELECT * FROM model_quotas WHERE record_id = ?`).all(recordId) as ModelQuotaRow[];
}

export function getLatestRecord(): RecordRow | null {
  const db = getDb();
  const rows = db.query(`SELECT * FROM quota_records ORDER BY recorded_at DESC LIMIT 1`).all() as RecordRow[];
  return rows[0] || null;
}

export function getLatestWithModels(): { record: RecordRow | null; models: ModelQuotaRow[] } {
  const record = getLatestRecord();
  if (!record) return { record: null, models: [] };
  return { record, models: getModelsForRecord(record.id) };
}

export function getRecordsRange(hours: number): { record: RecordRow; models: ModelQuotaRow[] }[] {
  const db = getDb();
  const since = new Date(Date.now() - hours * 3600000).toISOString();
  const records = db.query(`SELECT * FROM quota_records WHERE recorded_at >= ? ORDER BY recorded_at ASC`).all(since) as RecordRow[];
  const result: { record: RecordRow; models: ModelQuotaRow[] }[] = [];
  for (const r of records) {
    result.push({ record: r, models: getModelsForRecord(r.id) });
  }
  return result;
}

export function getModelHistory(modelId: string, hours = 168): { time: string; usedPct: number | null }[] {
  const db = getDb();
  const since = new Date(Date.now() - hours * 3600000).toISOString();
  return db.query(`
    SELECT q.recorded_at as time, m.used_pct as usedPct
    FROM model_quotas m
    JOIN quota_records q ON q.id = m.record_id
    WHERE m.model_id = ? AND q.recorded_at >= ?
    ORDER BY q.recorded_at ASC
  `).all(modelId, since) as { time: string; usedPct: number | null }[];
}

export function closeDb() {
  if (_db) { _db.close(); _db = null; }
}

export interface DaemonExecutionRow {
  id: number;
  run_at: string;
  success: number;
  stdout: string | null;
  stderr: string | null;
  duration_ms: number | null;
  triggered_by: string | null;
}

export interface DaemonExecutionInput {
  success: boolean;
  stdout?: string;
  stderr?: string;
  durationMs?: number;
  triggeredBy?: string;
  runAt?: string;
}

export function saveExecution(input: DaemonExecutionInput): number {
  const db = getDb();
  const runAt = input.runAt || new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO daemon_executions (run_at, success, stdout, stderr, duration_ms, triggered_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    runAt,
    input.success ? 1 : 0,
    input.stdout ?? null,
    input.stderr ?? null,
    input.durationMs ?? null,
    input.triggeredBy ?? null,
  );
  return Number(info.lastInsertRowid);
}

export function updateExecution(id: number, input: Partial<DaemonExecutionInput>) {
  const db = getDb();
  const sets = [];
  const params = [];
  
  if (input.success !== undefined) {
    sets.push("success = ?");
    params.push(input.success ? 1 : 0);
  }
  if (input.stdout !== undefined) {
    sets.push("stdout = ?");
    params.push(input.stdout ?? null);
  }
  if (input.stderr !== undefined) {
    sets.push("stderr = ?");
    params.push(input.stderr ?? null);
  }
  if (input.durationMs !== undefined) {
    sets.push("duration_ms = ?");
    params.push(input.durationMs ?? null);
  }
  if (input.triggeredBy !== undefined) {
    sets.push("triggered_by = ?");
    params.push(input.triggeredBy ?? null);
  }
  
  params.push(id);
  const stmt = db.prepare(`
    UPDATE daemon_executions 
    SET ${sets.join(", ")}
    WHERE id = ?
  `);
  stmt.run(...params);
}

export function getRecentExecutions(limit = 50): DaemonExecutionRow[] {
  const db = getDb();
  return db.query(`SELECT * FROM daemon_executions ORDER BY run_at DESC LIMIT ?`).all(limit) as DaemonExecutionRow[];
}

export function getLatestExecution(): DaemonExecutionRow | null {
  const db = getDb();
  const rows = db.query(`SELECT * FROM daemon_executions ORDER BY run_at DESC LIMIT 1`).all() as DaemonExecutionRow[];
  return rows[0] || null;
}


