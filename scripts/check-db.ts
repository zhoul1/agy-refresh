import { getRecentExecutions, getLatestExecution } from "./src/lib/database.js";

console.log("=== Checking daemon_executions table ===");
console.log("Latest execution:", getLatestExecution());
console.log("\nRecent executions:");
const executions = getRecentExecutions(10);
for (const ex of executions) {
  console.log(`  ${ex.id} - ${ex.run_at} - success: ${ex.success === 1}`);
  console.log(`    stdout: ${ex.stdout ? ex.stdout.substring(0, 50) + "..." : "(none)"}`);
  console.log(`    stderr: ${ex.stderr ? ex.stderr.substring(0, 50) + "..." : "(none)"}`);
}