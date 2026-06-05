const { spawn } = require("node:child_process");
const path = require("node:path");

const bun = "C:\\Users\\zl\\AppData\\Roaming\\npm\\bun.cmd";
const cwd = __dirname;
const child = spawn(bun, ["run", "src/cli/index.ts", "--all"], {
  cwd,
  stdio: "inherit",
  windowsHide: true,
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
