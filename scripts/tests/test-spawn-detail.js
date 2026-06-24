import { spawn } from "node:child_process";
import { Readable } from "node:stream";

console.log("=== 详细测试 node:child_process 执行 agy ===\n");

console.log("测试1: 普通 spawn agy --prompt ...");
const child1 = spawn("agy", ["--prompt", "你好"], {
  windowsHide: false,
  stdio: "inherit",
});

await new Promise((resolve) => {
  child1.on("exit", (code) => {
    console.log(`测试1 退出码: ${code}`);
    resolve(null);
  });
  child1.on("error", (e) => console.log(`测试1 Error: ${e}`));
});

console.log("\n测试2: spawn agy 并且捕获所有输出...");
const child2 = spawn("agy", ["--prompt", "你好"], {
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
});

let stdout2 = "";
let stderr2 = "";

child2.stdout?.on("data", (chunk) => {
  console.log(`[stdout 数据] ${chunk}`);
  stdout2 += chunk;
});
child2.stderr?.on("data", (chunk) => {
  console.log(`[stderr 数据] ${chunk}`);
  stderr2 += chunk;
});

await new Promise((resolve) => {
  child2.on("exit", (code) => {
    console.log(`测试2 退出码: ${code}`);
    console.log(`测试2 stdout: "${stdout2}"`);
    console.log(`测试2 stderr: "${stderr2}"`);
    resolve(null);
  });
  child2.on("error", (e) => console.log(`测试2 Error: ${e}`));
});

console.log("\n测试3: spawn with inherit，看看有没有输出...");
const child3 = spawn("agy", ["--prompt", "你好"], {
  windowsHide: false,
  stdio: "inherit",
});

await new Promise((resolve) => {
  child3.on("exit", (code) => {
    console.log(`测试3 退出码: ${code}`);
    resolve(null);
  });
  child3.on("error", (e) => console.log(`测试3 Error: ${e}`));
});
