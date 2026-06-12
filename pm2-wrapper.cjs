const { spawn } = require("node:child_process");
const path = require("node:path");

const bun = process.env.BUN_PATH || "bun";
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
