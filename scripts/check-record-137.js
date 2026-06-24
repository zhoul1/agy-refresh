import { getRecentExecutions } from "./src/lib/database.js";

const records = getRecentExecutions(5);
for (const r of records) {
  console.log("id:", r.id, "success:", r.success === 1, "duration_ms:", r.duration_ms, "stderr:", r.stderr);
}
