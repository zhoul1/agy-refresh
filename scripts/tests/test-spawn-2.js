import { loadConfig } from "./src/lib/config.js";

const config = loadConfig();
console.log("=== 测试1: Bun.spawn 直接执行 ===");
const proc1 = Bun.spawn([config.command.executable, ...config.command.args], {
  stdin: "ignore",
  stdout: "pipe",
  stderr: "pipe",
});
const stdout1 = await new Response(proc1.stdout).text();
const stderr1 = await new Response(proc1.stderr).text();
const exit1 = await proc1.exited;
console.log("Bun.spawn: exitCode", exit1);
console.log("Bun.spawn stdout:", JSON.stringify(stdout1));
console.log("Bun.spawn stderr:", JSON.stringify(stderr1));

console.log("\n\n=== 测试2: node:child_process spawn 不带 windowsHide ===");
import { spawn } from "node:child_process";
import { Readable } from "node:stream";
const child2 = spawn(config.command.executable, config.command.args, {
  stdio: ["ignore", "pipe", "pipe"],
});
const stdout2 = await Readable.toWeb(child2.stdout).getReader().read().then(v => v.value ? new TextDecoder().decode(v.value) : "");
const stderr2 = await Readable.toWeb(child2.stderr).getReader().read().then(v => v.value ? new TextDecoder().decode(v.value) : "");
const exit2 = await new Promise((resolve) => child2.on("exit", resolve));
console.log("node spawn: exitCode", exit2);
console.log("node spawn stdout:", JSON.stringify(stdout2));
console.log("node spawn stderr:", JSON.stringify(stderr2));
