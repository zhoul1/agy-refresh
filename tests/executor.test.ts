import { expect, test, describe } from "bun:test";
import { runAgyCommand } from "../src/lib/executor";

describe("Command Executor Adapter", () => {
  test("executes successfully and captures stdout", async () => {
    // Windows 平台使用 cmd.exe /c echo hello 进行测试
    const config = {
      executable: "cmd.exe",
      args: ["/c", "echo", "hello-world-test"],
    };

    const result = await runAgyCommand(config);
    expect(result.success).toBe(true);
    expect(result.stdout.trim()).toBe("hello-world-test");
    expect(result.stderr.trim()).toBe("");
  });

  test("handles command execution failure gracefully", async () => {
    const config = {
      executable: "non-existent-executable-xyz",
      args: [],
    };

    const result = await runAgyCommand(config);
    expect(result.success).toBe(false);
    expect(result.stdout).toBe("");
    expect(result.stderr.length).toBeGreaterThan(0);
  });
});
