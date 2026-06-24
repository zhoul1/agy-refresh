import { loadConfig } from "./src/lib/config.js";
import { readStream } from "./src/lib/executor.js";
import { quietSpawn } from "./src/lib/spawn.js";

console.log("=== 测试: 使用 --print 选项 ===");
const proc = quietSpawn(["agy", "--print", "你好"], {
  stdout: "pipe",
  stderr: "pipe",
});
const stdout = await readStream(proc.stdout);
const stderr = await readStream(proc.stderr);
const exit = await proc.exited;
console.log("exitCode", exit);
console.log("stdout:", JSON.stringify(stdout));
console.log("stderr:", JSON.stringify(stderr));
