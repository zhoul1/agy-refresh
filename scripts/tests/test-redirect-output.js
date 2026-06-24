import { join } from "path";
import { existsSync, unlinkSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { quietSpawnSync } from "./src/lib/spawn.js";

const tempFile = join(tmpdir(), "agy-output-" + Date.now() + ".txt");
console.log("临时文件:", tempFile);

try {
  // 先删除旧的（如果有）
  if (existsSync(tempFile)) unlinkSync(tempFile);
  
  // 执行命令并重定向到文件
  console.log("执行命令: agy --prompt 你好 >", tempFile, "2>&1");
  const result = quietSpawnSync(["cmd.exe", "/c", "agy --prompt 你好 > \"" + tempFile + "\" 2>&1"]);
  
  console.log("\n=== 执行结果 ===");
  console.log("退出码:", result.status);
  
  // 读取文件
  if (existsSync(tempFile)) {
    const content = readFileSync(tempFile, "utf8");
    console.log("文件内容:\n", JSON.stringify(content));
  } else {
    console.log("文件不存在！");
  }
} finally {
  // 清理
  if (existsSync(tempFile)) unlinkSync(tempFile);
}
