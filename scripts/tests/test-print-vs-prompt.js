import { loadConfig } from "./src/lib/config.js";
import { readStream } from "./src/lib/executor.js";
import { quietSpawn } from "./src/lib/spawn.js";

console.log("=== 测试 --print 选项 ===");
const proc1 = quietSpawn(["agy", "--print", "你好"], {
  stdout: "pipe",
  stderr: "pipe",
});
const stdout1 = await readStream(proc1.stdout);
const stderr1 = await readStream(proc1.stderr);
const exit1 = await proc1.exited;
console.log("退出码:", exit1);
console.log("stdout:", JSON.stringify(stdout1));
console.log("stderr:", JSON.stringify(stderr1));

console.log("\n\n=== 测试 --prompt 选项 ===");
const proc2 = quietSpawn(["agy", "--prompt", "你好"], {
  stdout: "pipe",
  stderr: "pipe",
});
const stdout2 = await readStream(proc2.stdout);
const stderr2 = await readStream(proc2.stderr);
const exit2 = await proc2.exited;
console.log("退出码:", exit2);
console.log("stdout:", JSON.stringify(stdout2));
console.log("stderr:", JSON.stringify(stderr2));
