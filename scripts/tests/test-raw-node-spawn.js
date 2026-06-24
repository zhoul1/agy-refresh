import { spawn } from "node:child_process";
import { Readable } from "node:stream";

console.log("=== 直接用 node:child_process spawn 执行 ===");
const child = spawn("agy", ["--prompt", "你好"], {
  stdio: ["ignore", "pipe", "pipe"],
});

const chunks = [];
const errChunks = [];

child.stdout?.on("data", (chunk) => {
  console.log("STDOUT CHUNK:", chunk);
  chunks.push(chunk);
});

child.stderr?.on("data", (chunk) => {
  console.log("STDERR CHUNK:", chunk);
  errChunks.push(chunk);
});

const exitCode = await new Promise((resolve) => child.on("exit", resolve));
console.log("退出码:", exitCode);
console.log("stdout:", JSON.stringify(Buffer.concat(chunks).toString("utf8")));
console.log("stderr:", JSON.stringify(Buffer.concat(errChunks).toString("utf8")));
