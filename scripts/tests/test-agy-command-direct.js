import { runAgyCommand } from "./src/lib/executor.js";
import { loadConfig } from "./src/lib/config.js";

console.log("=== 测试 agy 命令 ===\n");

const config = loadConfig();
console.log("配置的命令:", config.command);

console.log("\n开始执行...");
try {
  const result = await runAgyCommand(config.command, 30000);
  console.log("✅ 执行完成！");
  console.log("success:", result.success);
  console.log("stdout:", result.stdout);
  console.log("stderr:", result.stderr);
} catch (e) {
  console.error("❌ 执行出错:", e);
}
