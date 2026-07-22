import { detectAllAgyProcesses, discoverAllListeningPorts } from "./agy-process";
import { findConnectApiWithTokens } from "./agy-quota";
import { parseImageGenQuota, type ImageGenQuotaSnapshot } from "./image-gen-quota";
import type { ImageGenConfig } from "./config";

export interface TriggerResult {
  ok: boolean;
  raw: string;
  snapshot?: ImageGenQuotaSnapshot;
  baseUrl?: string;
  method?: string;
  error?: string;
}

/** 复用额度采集的端口+CSRF 探测，定位本地 AGy Connect API */
export async function findAgyEndpoint(): Promise<{ baseUrl: string; csrfToken?: string } | null> {
  const allProcesses = await detectAllAgyProcesses();
  if (allProcesses.length === 0) return null;
  const allPids = allProcesses.map((p) => p.pid);
  const listeningPorts = await discoverAllListeningPorts(allPids);
  const cmdPorts = allProcesses.map((p) => p.port).filter((p): p is number => p !== undefined);
  const allPorts = [...new Set([...cmdPorts, ...listeningPorts])];
  if (allPorts.length === 0) return null;

  const portTokenMap = new Map<number, string>();
  for (const p of allProcesses) if (p.port && p.csrfToken) portTokenMap.set(p.port, p.csrfToken);
  const extraTokens = allProcesses.map((p) => p.csrfToken).filter((t): t is string => !!t);
  return findConnectApiWithTokens(allPorts, portTokenMap, extraTokens);
}

/**
 * 真正触发一次图像生成：调用本地 AGy 语言服务器的出图 RPC（方法名可配置），
 * 读取返回内容并解析为额度快照。返回原始内容以便排查（如方法名不正确）。
 */
export async function triggerImageGen(
  cfg: ImageGenConfig,
  fetchFn?: (url: string, options: any) => Promise<Response>,
  timeoutMs?: number,
  findEndpointFn?: () => Promise<{ baseUrl: string; csrfToken?: string } | null>,
): Promise<TriggerResult> {
  const endpoint = await (findEndpointFn || findAgyEndpoint)();
  if (!endpoint) {
    return { ok: false, raw: "", error: "未找到 AGy 服务，请先启动 antigravity IDE / AG 2.0 / ag CLI" };
  }

  const doFetch = fetchFn || globalThis.fetch.bind(globalThis);

  // 自定义端点（如 cloudcode-pa.googleapis.com）：直接 POST，可带 Bearer Token
  if (cfg.endpoint) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (cfg.authToken) headers["Authorization"] = `Bearer ${cfg.authToken}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs ?? cfg.timeoutMs);
    let raw = "";
    try {
      const res = await doFetch(cfg.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: cfg.model, prompt: cfg.prompt }),
        signal: controller.signal,
      });
      raw = await res.text();
    } catch (e: any) {
      clearTimeout(timer);
      return { ok: false, raw: "", baseUrl: cfg.endpoint, method: cfg.method, error: `请求失败: ${e.message || String(e)}` };
    } finally {
      clearTimeout(timer);
    }
    const snapshot = parseImageGenQuota(raw, cfg.model);
    if (snapshot && (snapshot.status === "OK" || snapshot.isExhausted)) {
      return { ok: true, raw, snapshot, baseUrl: cfg.endpoint, method: cfg.method };
    }
    return { ok: false, raw, baseUrl: cfg.endpoint, method: cfg.method, error: "返回内容无法识别（检查 endpoint / authToken / method 配置）" };
  }

  // 本地 AGy 语言服务器：调用可配置的 RPC 方法
  const url = new URL(`/exa.language_server_pb.LanguageServerService/${cfg.method}`, endpoint.baseUrl).toString();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Connect-Protocol-Version": "1",
  };
  if (endpoint.csrfToken) headers["X-Codeium-Csrf-Token"] = endpoint.csrfToken;

  const body = JSON.stringify({
    model: cfg.model,
    prompt: cfg.prompt,
    metadata: { ideName: "antigravity", extensionName: "antigravity", locale: "en" },
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs ?? cfg.timeoutMs);

  let raw = "";
  try {
    const res = await doFetch(url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
      tls: { rejectUnauthorized: false },
    });
    raw = await res.text();
  } catch (e: any) {
    clearTimeout(timer);
    return {
      ok: false,
      raw: "",
      baseUrl: endpoint.baseUrl,
      method: cfg.method,
      error: `请求失败: ${e.message || String(e)}`,
    };
  } finally {
    clearTimeout(timer);
  }

  const snapshot = parseImageGenQuota(raw, cfg.model);
  // 成功出图（status=OK）或命中限流（isExhausted）都视为“已拿到明确结果”
  if (snapshot && (snapshot.status === "OK" || snapshot.isExhausted)) {
    return { ok: true, raw, snapshot, baseUrl: endpoint.baseUrl, method: cfg.method };
  }

  return {
    ok: false,
    raw,
    baseUrl: endpoint.baseUrl,
    method: cfg.method,
    error: "返回内容无法识别（大概率是 imageGen.method 配置不正确，请在设置中调整）",
  };
}
