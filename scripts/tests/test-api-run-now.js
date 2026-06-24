console.log("=== 测试 /api/scheduler/run-now ===\n");

console.log("1: 调用 /api/scheduler/history 先看看现有记录");
const histBefore = await fetch("http://localhost:6789/api/scheduler/history").then(r => r.json());
console.log(`   现有记录数: ${histBefore.length}`);

console.log("\n2: 调用 POST /api/scheduler/run-now");
const runResp = await fetch("http://localhost:6789/api/scheduler/run-now", { method: "POST" });
console.log(`   status: ${runResp.status}`);
const runData = await runResp.json();
console.log(`   ok: ${runData.ok}`);
console.log(`   execution: ${JSON.stringify(runData.execution)}`);

console.log("\n3: 等 1 秒，再次查 history");
await new Promise(r => setTimeout(r, 1000));
const histAfter = await fetch("http://localhost:6789/api/scheduler/history").then(r => r.json());
console.log(`   记录数: ${histAfter.length}`);
console.log("   最新记录:");
console.log(histAfter[0]);
