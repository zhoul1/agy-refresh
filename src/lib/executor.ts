import { quietSpawn } from "./spawn";
import type { CommandConfig } from "./config";

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

/**
 * 执行配置的 agy (或其他) 命令行工具，并捕获输出结果
 * @param config 外部命令配置
 */
export async function runAgyCommand(config: CommandConfig): Promise<CommandResult> {
  try {
    // 启动子进程 (静默模式，Windows 下无弹窗)
    const proc = quietSpawn([config.executable, ...config.args], {
      stdout: "pipe",
      stderr: "pipe",
    });

    // 异步流式读取输出
    const stdoutText = await new Response(proc.stdout).text();
    const stderrText = await new Response(proc.stderr).text();

    // 等待子进程退出
    const exitCode = await proc.exited;

    return {
      success: exitCode === 0,
      stdout: stdoutText,
      stderr: stderrText,
    };
  } catch (error: any) {
    return {
      success: false,
      stdout: "",
      // 如果找不到可执行文件，Bun.spawn 可能会抛出错误，在此处捕获
      stderr: error?.message || String(error),
    };
  }
}
