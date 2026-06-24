import { runDaemonOnce } from "./src/lib/daemon.js";

console.log("Testing runDaemonOnce...");
const result = await runDaemonOnce();
console.log("\nResult:");
console.log(result);