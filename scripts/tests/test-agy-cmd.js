import { quietSpawn } from "./src/lib/spawn.js";
import { loadConfig } from "./src/lib/config.js";
import { runAgyCommand } from "./src/lib/executor.js";

console.log("=== 测试 agy 命令执行情况 ===\n");
const config = loadConfig();

console.log(`1. 配置的命令: ${config.command.executable} ${config.command.args.join(" ")}`);

console.log("\n2. 测试 quietSpawn...");
try {
  const child = quietSpawn([config.command.executable, ...config.command.args], {
    stdout: "pipe",
    stderr: "pipe"
  });
  
  console.log("   进程已启动，设置超时为 5 秒...");
  
  const timeout = setTimeout(() => {
    console.log("   ⚠️  超时！强制杀死进程...");
    child.kill();
  }, 5000);
  
  const [stdoutText, stderrText, exitCode] = await Promise.all([
    (async () => {
      if (!child.stdout) return "";
      try {
        return await new Response(child.stdout).text();
      } catch (e) {
        return `(stdout read error: ${e})`;
      }
    })(),
    (async () => {
      if (!child.stderr) return "";
      try {
        return await new Response(child.stderr).text();
      } catch (e) {
        return `(stderr read error: ${e})`;
      }
    })(),
    child.exited
  ]);
  
  clearTimeout(timeout);
  
  console.log(`   退出代码: ${exitCode}`);
  console.log(`   stdout: ${stdoutText.trim() || "(空)"}`);
  console.log(`   stderr: ${stderrText.trim() || "(空)"}`);
  console.log(`   spawnError: ${child.spawnError || "(无)"}`);
  
} catch (e) {
  console.log(`   ❌ 出错: ${e}`);
}

console.log("\n3. 测试 runAgyCommand...");
try {
  const result = await runAgyCommand(config.command, 5000);
  console.log(`   success: ${result.success}`);
  console.log(`   stdout: ${result.stdout.trim() || "(空)"}`);
  console.log(`   stderr: ${result.stderr.trim() || "(空)"}`);
} catch (e) {
  console.log(`   ❌ 出错: ${e}`);
}
