import { startDaemon } from "../lib/daemon";
import { runAgyCommand } from "../lib/executor";
import { loadConfig } from "../lib/config";

function showHelp() {
  console.log(`
定时自动调用 agy 工具 CLI 入口

用法:
  bun run src/cli/index.ts [选项]

选项:
  --once, -o        立即执行一次对话并退出（用于测试验证）
  --daemon, -d      以守护进程模式运行定时任务（默认模式）
  --config <path>   指定自定义配置文件路径（默认读取当前目录下的 config.json）
  --help, -h        显示帮助信息
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  // 解析 --config 参数
  let configPath: string | undefined;
  const configIndex = args.indexOf("--config");
  if (configIndex !== -1 && configIndex + 1 < args.length) {
    configPath = args[configIndex + 1];
  }

  const isOnce = args.includes("--once") || args.includes("-o");
  const isDaemon = args.includes("--daemon") || args.includes("-d") || !isOnce;

  if (isOnce) {
    const config = loadConfig(configPath);
    console.log(`[CLI] 正在以单次执行模式调用命令: ${config.command.executable} ${config.command.args.join(" ")}`);
    const result = await runAgyCommand(config.command);
    if (result.success) {
      console.log(`[CLI] 执行成功！输出内容如下:`);
      console.log("-----------------------------------------");
      console.log(result.stdout.trim() || "(无标准输出)");
      console.log("-----------------------------------------");
      process.exit(0);
    } else {
      console.error(`[CLI] 执行失败！错误描述如下:`);
      console.error("-----------------------------------------");
      console.error(result.stderr.trim() || "(无错误输出)");
      console.error("-----------------------------------------");
      process.exit(1);
    }
  } else if (isDaemon) {
    const daemon = await startDaemon(configPath);

    // 监听退出信号以优雅停机
    process.on("SIGINT", () => {
      console.log("\n[CLI] 接收到退出信号 (SIGINT)，正在关闭守护进程...");
      daemon.stop();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\n[CLI] 接收到终止信号 (SIGTERM)，正在关闭守护进程...");
      daemon.stop();
      process.exit(0);
    });
  }
}

main().catch((err) => {
  console.error("运行时发生未捕获的错误:", err);
  process.exit(1);
});
