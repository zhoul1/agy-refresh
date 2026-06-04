import { startDaemon, runDaemonOnce } from "../lib/daemon";
import { runAgyCommand } from "../lib/executor";
import { loadConfig } from "../lib/config";
import { collectOnce, startMonitor } from "../lib/collector";
import { startWebServer } from "../web";
import {
  registerDaemonFactory,
  registerMonitorFactory,
  startDaemon as runtimeStartDaemon,
  startMonitor as runtimeStartMonitor,
  appendLog,
  onEvent,
} from "../lib/runtime";

function showHelp() {
  console.log(`
  Agy 控制中心 CLI 入口

  用法:
    bun run src/cli/index.ts [选项]

  选项:
    --all              启动 daemon + monitor + Web（默认推荐；UI 完整接管）
    --serve-only       仅启动 Web（不启动 daemon / monitor）
    --daemon-only      仅启动 daemon 调度（带 Web，方便看状态）
    --monitor-only     仅启动 monitor 采集（带 Web）
    --once, -o         立即执行一次 agy 对话并退出
    --collect-now      立即采集一次额度数据并退出
    --config <path>    指定自定义配置文件路径（默认 config.json）
    --help, -h         显示帮助信息

  推荐流程:
    bun run start --all
    然后浏览器打开 http://localhost:3000 即可控制一切
`);
}

async function installLogMirror() {
  onEvent("log", (entry) => {
    const tag = `[${entry.source.toUpperCase()}]`;
    const line = `${entry.ts.replace("T", " ").substring(0, 19)} ${tag} ${entry.msg}`;
    if (entry.level === "error") console.error(line);
    else if (entry.level === "warn") console.warn(line);
    else console.log(line);
  });
}

async function bootWebOnly(configPath: string) {
  const config = loadConfig(configPath);
  installLogMirror();
  startWebServer(config.web, { configPath });
  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
  await new Promise(() => {});
}

async function bootAll(configPath: string) {
  const config = loadConfig(configPath);
  installLogMirror();
  registerDaemonFactory(() => startDaemon(configPath));
  registerMonitorFactory(() => startMonitor(config.monitor));
  await runtimeStartDaemon();
  await runtimeStartMonitor();
  startWebServer(config.web, { configPath });
  appendLog("system", "info", `全部服务已启动，访问 http://${config.web.host === "0.0.0.0" ? "localhost" : config.web.host}:${config.web.port} 进行管理`);
  process.on("SIGINT", () => { appendLog("system", "info", "接收到 SIGINT，退出中..."); process.exit(0); });
  process.on("SIGTERM", () => { appendLog("system", "info", "接收到 SIGTERM，退出中..."); process.exit(0); });
  await new Promise(() => {});
}

async function bootDaemonOnly(configPath: string) {
  const config = loadConfig(configPath);
  installLogMirror();
  registerDaemonFactory(() => startDaemon(configPath));
  await runtimeStartDaemon();
  startWebServer(config.web, { configPath });
  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
  await new Promise(() => {});
}

async function bootMonitorOnly(configPath: string) {
  const config = loadConfig(configPath);
  installLogMirror();
  registerMonitorFactory(() => startMonitor(config.monitor));
  await runtimeStartMonitor();
  startWebServer(config.web, { configPath });
  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
  await new Promise(() => {});
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  let configPath: string | undefined;
  const configIndex = args.indexOf("--config");
  if (configIndex !== -1 && configIndex + 1 < args.length) {
    configPath = args[configIndex + 1];
  }

  if (args.includes("--collect-now")) {
    const config = loadConfig(configPath);
    try {
      const snapshot = await collectOnce(config.monitor.agyTimeoutMs);
      console.log(`[CLI] 采集完成，记录了 ${snapshot.models.length} 个模型额度`);
      if (snapshot.email) console.log(`[CLI] 账号: ${snapshot.email}`);
      for (const m of snapshot.models) {
        const pct = m.usedPercentage !== undefined ? m.usedPercentage.toFixed(1) : "?";
        console.log(`  ${m.modelId}: ${pct}% 已使用${m.isExhausted ? " (已耗尽)" : ""}`);
      }
      process.exit(0);
    } catch (err: any) {
      console.error(`[CLI] 采集失败: ${err.message}`);
      process.exit(1);
    }
  }

  if (args.includes("--once") || args.includes("-o")) {
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
  }

  if (args.includes("--all")) {
    await bootAll(configPath);
  } else if (args.includes("--daemon-only")) {
    await bootDaemonOnly(configPath);
  } else if (args.includes("--monitor-only")) {
    await bootMonitorOnly(configPath);
  } else {
    await bootAll(configPath);
  }
}

main().catch((err) => {
  console.error("运行时发生未捕获的错误:", err);
  process.exit(1);
});
