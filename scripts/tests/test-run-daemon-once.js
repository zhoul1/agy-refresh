import { runDaemonOnce } from "./src/lib/daemon.js";

console.log("=== 测试 runDaemonOnce ===\n");
console.log("开始调用...");
const result = await runDaemonOnce();
console.log("立即返回的结果:", JSON.stringify(result, null, 2));
console.log("\n现在等待 10 秒...");
await new Promise(r => setTimeout(r, 10000));
console.log("测试完成！");
