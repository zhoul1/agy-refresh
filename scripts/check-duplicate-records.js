import { getRecentExecutions } from "./src/lib/database.js";

console.log("=== 数据库中的所有执行记录 ===\n");
const records = getRecentExecutions(200);

console.log(`总共 ${records.length} 条记录\n`);

// 按时间分组，看看有没有重复时间的
const groups = {};
for (const record of records) {
  const timeKey = record.run_at.slice(0, 19); // 精确到秒
  if (!groups[timeKey]) groups[timeKey] = [];
  groups[timeKey].push(record);
}

console.log("=== 按时间分组的记录 ===");
for (const time in groups) {
  if (groups[time].length > 1) {
    console.log(`⚠️  时间 ${time} 有 ${groups[time].length} 条重复记录！`);
  } else {
    console.log(`✅ 时间 ${time} 有 1 条记录`);
  }
}
