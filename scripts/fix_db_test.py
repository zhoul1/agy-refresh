path = "tests/database.test.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the TEST_DB_DIR/TEST_DB_PATH setup with :memory:
content = content.replace(
    "const FIXTURE_DIR = join(import.meta.dir, \"fixtures\");\nconst TEST_DB_DIR = join(import.meta.dir, \".tmp\");\nconst TEST_DB_PATH = join(TEST_DB_DIR, \"test-quota.db\");",
    "const FIXTURE_DIR = join(import.meta.dir, \"fixtures\");\nconst TEST_DB_PATH = \":memory:\";"
)

# Replace beforeAll
content = content.replace(
    '''beforeAll(() => {
  if (!existsSync(TEST_DB_DIR)) mkdirSync(TEST_DB_DIR, { recursive: true });
  process.env.__TEST_DB_PATH = TEST_DB_PATH;
});''',
    '''beforeAll(() => {
  process.env.__TEST_DB_PATH = TEST_DB_PATH;
});'''
)

# Replace afterAll
content = content.replace(
    '''afterAll(() => {
  resetDb();
  delete process.env.__TEST_DB_PATH;
  for (let i = 0; i < 5; i++) {
    try { if (existsSync(TEST_DB_DIR)) rmSync(TEST_DB_DIR, { recursive: true, force: true }); break; }
    catch { Bun.sleepSync(200); }
  }
});''',
    '''afterAll(() => {
  resetDb();
  delete process.env.__TEST_DB_PATH;
});'''
)

# Replace beforeEach
content = content.replace(
    '''beforeEach(() => {
  resetDb();
  delete process.env.__TEST_DB_PATH;
  for (let i = 0; i < 5; i++) {
    try { if (existsSync(TEST_DB_PATH)) rmSync(TEST_DB_PATH, { force: true }); break; } catch {}
    try { if (existsSync(TEST_DB_PATH + '-shm')) rmSync(TEST_DB_PATH + '-shm', { force: true }); break; } catch {}
    try { if (existsSync(TEST_DB_PATH + '-wal')) rmSync(TEST_DB_PATH + '-wal', { force: true }); break; } catch {}
    Bun.sleepSync(100);
  }
  process.env.__TEST_DB_PATH = TEST_DB_PATH;
});''',
    '''beforeEach(() => {
  resetDb();
  process.env.__TEST_DB_PATH = TEST_DB_PATH;
  getDb();
});'''
)

# Remove unused imports
content = content.replace('import { mkdirSync, existsSync, rmSync } from "fs";', '')
# Clean up the empty line
content = content.replace('\n\nimport { readFileSync }', '\nimport { readFileSync }')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("OK")
