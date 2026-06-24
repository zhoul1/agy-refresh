import { getRecentExecutions } from "./src/lib/database.js";

console.log("=== 查看最新的执行记录 ===\n");
const records = getRecentExecutions(5); // 取最后5条记录

for (const record of records) {
  console.log(`id: ${record.id}`);
  console.log(`time: ${record.run_at}`);
  console.log(`success: ${record.success === 1}`);
  console.log(`durationMs: ${record.duration_ms}`);
  console.log(`triggeredBy: ${record.triggered_by}`);
  console.log(`stdout: ${record.stdout}`);
  console.log(`stderr: ${record.stderr}`);
  console.log("---\n");
}
