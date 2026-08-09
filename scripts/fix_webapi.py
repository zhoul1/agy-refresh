path = "tests/web-api.test.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add stopDaemon, stopMonitor to imports
content = content.replace(
    "resetRuntimeForTests,",
    "resetRuntimeForTests, stopDaemon, stopMonitor,"
)

# Fix beforeEach to stop before reset
old = """beforeEach(() => {
  resetDb();
  process.env.__TEST_DB_PATH = ":memory:";
  getDb();
  resetRuntimeForTests();
  registerDaemonFactory(() => daemonStarter(CFG_PATH));
  registerMonitorFactory(() => monitorStarter({ intervalMinutes: 1, agyTimeoutMs: 1000 }));
});"""
new = """beforeEach(() => {
  stopDaemon();
  stopMonitor();
  resetDb();
  process.env.__TEST_DB_PATH = ":memory:";
  getDb();
  resetRuntimeForTests();
  registerDaemonFactory(() => daemonStarter(CFG_PATH));
  registerMonitorFactory(() => monitorStarter({ intervalMinutes: 1, agyTimeoutMs: 1000 }));
});"""
if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK")
else:
    print("NOT FOUND")
