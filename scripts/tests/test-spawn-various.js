import { spawn } from "node:child_process";

console.log("=== 尝试各种方式让 agy 输出到 pipe ===\n");

// 尝试1: shell=true
console.log("测试1: shell:true");
const child1 = spawn("agy", ["--prompt", "你好"], {
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
  shell: true,
});
let out1 = "", err1 = "";
child1.stdout?.on("data", d => { out1 += d; console.log(`[1 out] ${d}`); });
child1.stderr?.on("data", d => { err1 += d; console.log(`[1 err] ${d}`); });
await new Promise(res => child1.on("exit", res));
console.log(`测试1 结果: out="${out1}", err="${err1}"`);

console.log("\n测试2: 设置 env.PROMPT_MODE=1 或者类似的");
const child2 = spawn("agy", ["--prompt", "你好"], {
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, CI: "true" },
});
let out2 = "", err2 = "";
child2.stdout?.on("data", d => { out2 += d; console.log(`[2 out] ${d}`); });
child2.stderr?.on("data", d => { err2 += d; console.log(`[2 err] ${d}`); });
await new Promise(res => child2.on("exit", res));
console.log(`测试2 结果: out="${out2}", err="${err2}"`);

console.log("\n测试3: 尝试用 cmd /c 包装 agy");
const child3 = spawn("cmd.exe", ["/c", "agy --prompt 你好"], {
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
});
let out3 = "", err3 = "";
child3.stdout?.on("data", d => { out3 += d; console.log(`[3 out] ${d}`); });
child3.stderr?.on("data", d => { err3 += d; console.log(`[3 err] ${d}`); });
await new Promise(res => child3.on("exit", res));
console.log(`测试3 结果: out="${out3}", err="${err3}"`);
