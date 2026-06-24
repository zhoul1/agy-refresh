import { loadConfig } from "./src/lib/config.js";
import { quietSpawn } from "./src/lib/spawn.js";
import { readStream } from "./src/lib/executor.js";

const config = loadConfig();
console.log("配置的命令:", config.command);

console.log("\n开始执行...");
const proc = quietSpawn([config.command.executable, ...config.command.args], {
  stdout: "pipe",
  stderr: "pipe",
});

const timer = setTimeout(() => {
  proc.kill();
}, 60000);

console.log("进程已启动，等待输出...");

const [stdout, stderr, exitCode] = await Promise.all([
  readStream(proc.stdout),
  readStream(proc.stderr),
  proc.exited,
]);

clearTimeout(timer);

console.log("\n=== 执行结果 ===");
console.log("退出码:", exitCode);
console.log("stdout:", JSON.stringify(stdout));
console.log("stderr:", JSON.stringify(stderr));
console.log("spawnError:", JSON.stringify(proc.spawnError));
