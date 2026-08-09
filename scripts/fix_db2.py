path = "tests/database.test.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = """beforeEach(() => {
  resetDb();
});"""
new = """beforeEach(() => {
  resetDb();
  delete process.env.__TEST_DB_PATH;
  for (let i = 0; i < 5; i++) {
    try { if (existsSync(TEST_DB_PATH)) rmSync(TEST_DB_PATH, { force: true }); break; } catch {}
    try { if (existsSync(TEST_DB_PATH + "-shm")) rmSync(TEST_DB_PATH + "-shm", { force: true }); break; } catch {}
    try { if (existsSync(TEST_DB_PATH + "-wal")) rmSync(TEST_DB_PATH + "-wal", { force: true }); break; } catch {}
    Bun.sleepSync(100);
  }
  process.env.__TEST_DB_PATH = TEST_DB_PATH;
});"""
if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK")
else:
    print("NOT FOUND - checking current content")
    idx = content.find("beforeEach")
    print(repr(content[idx:idx+200]))
