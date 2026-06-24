import { getDb, resetDb } from "./src/lib/database.js";

console.log("=== 开始清理重复记录 ===\n");

const db = getDb();

// 找到所有记录
const allRecords = db.prepare("SELECT * FROM daemon_executions ORDER BY run_at ASC, id ASC").all();

console.log(`总共有 ${allRecords.length} 条记录\n`);

// 找出重复的记录并删除
const seen = new Set();
const toDelete = [];

for (const record of allRecords) {
  const timeKey = record.run_at.slice(0, 19); // 精确到秒
  if (seen.has(timeKey)) {
    toDelete.push(record.id);
  } else {
    seen.add(timeKey);
  }
}

console.log(`将删除 ${toDelete.length} 条重复记录\n`);

if (toDelete.length > 0) {
  const deleteStmt = db.prepare("DELETE FROM daemon_executions WHERE id = ?");
  for (const id of toDelete) {
    deleteStmt.run(id);
  }
  console.log(`✅ 成功删除了 ${toDelete.length} 条重复记录！`);
} else {
  console.log("没有需要删除的重复记录！");
}

// 验证剩余记录
const remaining = db.prepare("SELECT * FROM daemon_executions").all();
console.log(`\n剩余记录：${remaining.length} 条`);
