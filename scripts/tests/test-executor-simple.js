import { runAgyCommand } from "./src/lib/executor.js";

console.log("=== 测试 executor 用简单命令 ===\n");

console.log("测试1: cmd.exe /c echo test...");
try {
  const result = await runAgyCommand({
    executable: "cmd.exe",
    args: ["/c", "echo", "hello-world-from-test"],
  }, 5000);
  console.log(`success: ${result.success}`);
  console.log(`stdout: "${result.stdout.trim()}"`);
  console.log(`stderr: "${result.stderr.trim()}"`);
} catch (e) {
  console.log(`❌ Error: ${e}`);
}

console.log("\n测试2: agy 命令...");
try {
  const result = await runAgyCommand({
    executable: "agy",
    args: ["--log-file", "NUL", "--prompt", "你好"],
  }, 30000);
  console.log(`success: ${result.success}`);
  console.log(`stdout: "${result.stdout}"`);
  console.log(`stderr: "${result.stderr}"`);
} catch (e) {
  console.log(`❌ Error: ${e}`);
}
