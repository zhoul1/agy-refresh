// 测试一个简化版的 runDaemonOnce，直接立即返回！
import { saveExecution, updateExecution } from "./src/lib/database.js";
import { appendLog } from "./src/lib/runtime.js";
import { loadConfig } from "./src/lib/config.js";

async function testRunDaemonOnceFast() {
  const config = loadConfig();
  const runAt = new Date();
  
  // 1. 先保存占位记录
  const executionId = saveExecution({
    success: false,
    stdout: "",
    stderr: "执行中...",
    durationMs: 0,
    triggeredBy: "manual",
    runAt: runAt.toISOString(),
  });
  
  console.log(`✅ 已保存记录，id = ${executionId}, 现在立即返回！`);
  
  // 后台任务
  (async () => {
    console.log("后台任务开始...");
    await new Promise(r => setTimeout(r, 2000)); // 模拟耗时
    console.log("后台任务完成！更新记录...");
    updateExecution(executionId, {
      success: true,
      stdout: "test output",
      stderr: "",
      durationMs: 2000,
    });
    console.log("记录已更新！");
  })();
  
  return { id: executionId, success: false, stdout: "", stderr: "执行中...", durationMs:0, runAt: runAt.toISOString() };
}

console.log("=== 测试 fast runDaemonOnce ===");
const start = Date.now();
const ret = await testRunDaemonOnceFast();
console.log(`函数返回，耗时：${Date.now() - start}ms，返回值：`, ret);
console.log("主函数结束！后台任务还在跑！");
