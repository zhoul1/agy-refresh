const config = { executable: "agy", args: ["--prompt", "你好"] };
console.log("=== 直接用 Bun.spawn 执行 ===");
const proc = Bun.spawn([config.executable, ...config.args], {
  stdout: "pipe",
  stderr: "pipe",
  stdin: "ignore",
});
const stdoutText = await new Response(proc.stdout).text();
const stderrText = await new Response(proc.stderr).text();
const exitCode = await proc.exited;
console.log("退出码:", exitCode);
console.log("stdout:", JSON.stringify(stdoutText));
console.log("stderr:", JSON.stringify(stderrText));
