import { detectAgyProcess, discoverAllListeningPorts } from "./agy-process";
import { findConnectApiWithTokens, callGetUserStatus } from "./agy-quota";

export type AgyAuthState = "authed" | "needs-auth" | "no-server";

/**
 * 非交互式地探测 AGy（Antigravity）是否仍处于已登录状态，
 * 避免在需要登录时还要去拉起 `agy --prompt` 从而反复弹出 Google 授权页。
 *
 * 原理：复用项目已有的 AGy Connect API 探测逻辑。
 *  - 若本地 AGy 语言服务在运行且 GetUserStatus 返回 200 -> authed
 *  - 若语言服务在运行但返回 401 -> needs-auth（登录态已失效）
 *  - 若根本没找到运行中的语言服务 -> no-server
 *
 * 该探测只发 HTTP 请求，不会打开浏览器，因此本身不会触发授权弹窗。
 */
export async function checkAgyAuth(): Promise<AgyAuthState> {
  let proc;
  try {
    proc = await detectAgyProcess();
  } catch {
    return "no-server";
  }
  if (!proc) return "no-server";

  let ports: number[] = [];
  try {
    ports = await discoverAllListeningPorts([proc.pid]);
  } catch {
    ports = [];
  }
  if (ports.length === 0) return "no-server";

  let endpoint: { baseUrl: string; csrfToken?: string } | null = null;
  try {
    endpoint = await findConnectApiWithTokens(ports, new Map(), proc.csrfToken ? [proc.csrfToken] : []);
  } catch {
    endpoint = null;
  }
  if (!endpoint) return "no-server";

  try {
    await callGetUserStatus(endpoint.baseUrl, endpoint.csrfToken);
    return "authed";
  } catch (e: any) {
    const msg = String((e && e.message) || e);
    // 401 / unauthorized 表示需要重新登录
    if (/401|unauthorized|needs auth|not authorized/i.test(msg)) return "needs-auth";
    // 其它错误（网络抖动等）保守按 no-server 处理，避免误杀正常执行
    return "no-server";
  }
}
