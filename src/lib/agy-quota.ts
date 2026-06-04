import https from "https";
import http from "http";
import type { AgyProcessInfo } from "./agy-process";
import type { QuotaSnapshot } from "./quota-parser";
import { parseUserStatusToSnapshot } from "./quota-parser";

const CONNECT_RPC_PATH = "/exa.language_server_pb.LanguageServerService/GetUnleashData";
// Accept 200 (success), 400 (bad request but Connect RPC understood), 401 (needs auth)
const VALID_STATUSES = new Set([200, 400, 401]);

function probePort(port: number, csrfToken?: string, timeout = 3000): Promise<string | null> {
  return new Promise((resolve) => {
    const options: https.RequestOptions = {
      hostname: "127.0.0.1",
      port,
      path: CONNECT_RPC_PATH,
      method: "POST",
      timeout,
      rejectUnauthorized: false,
      headers: {
        "Content-Type": "application/json",
        "Connect-Protocol-Version": "1",
        ...(csrfToken ? { "X-Codeium-Csrf-Token": csrfToken } : {}),
      },
    };
    const req = https.request(options, (res) => {
      if (res.statusCode && VALID_STATUSES.has(res.statusCode)) {
        res.resume();
        resolve(`https://127.0.0.1:${port}`);
      } else {
        res.resume();
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.write(JSON.stringify({ wrapper_data: {} }));
    req.end();
  });
}

function probePortHttp(port: number, csrfToken?: string, timeout = 3000): Promise<string | null> {
  return new Promise((resolve) => {
    const options: http.RequestOptions = {
      hostname: "127.0.0.1",
      port,
      path: CONNECT_RPC_PATH,
      method: "POST",
      timeout,
      headers: {
        "Content-Type": "application/json",
        "Connect-Protocol-Version": "1",
        ...(csrfToken ? { "X-Codeium-Csrf-Token": csrfToken } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk: string) => data += chunk);
      res.on("end", () => {
        if (data.toLowerCase().includes("client sent an http request to an https server")) {
          resolve(null);
          return;
        }
        if (res.statusCode && VALID_STATUSES.has(res.statusCode)) {
          resolve(`http://127.0.0.1:${port}`);
        } else {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.write(JSON.stringify({ wrapper_data: {} }));
    req.end();
  });
}

async function findConnectApi(ports: number[], csrfToken?: string): Promise<string | null> {
  for (const port of ports) {
    const r = await probePort(port, csrfToken);
    if (r) return r;
    const r2 = await probePortHttp(port, csrfToken);
    if (r2) return r2;
  }
  return null;
}

async function findConnectApiWithTokens(
  ports: number[],
  portTokenMap: Map<number, string>,
  extraTokens: string[],
): Promise<{ baseUrl: string; csrfToken?: string } | null> {
  for (const port of ports) {
    const tokensToTry = [portTokenMap.get(port), ...extraTokens, undefined];
    const seen = new Set<string>();
    for (const token of tokensToTry) {
      const key = token ?? "__none__";
      if (seen.has(key)) continue;
      seen.add(key);
      const r = await probePort(port, token);
      if (r) return { baseUrl: r, csrfToken: token };
      const r2 = await probePortHttp(port, token);
      if (r2) return { baseUrl: r2, csrfToken: token };
    }
  }
  return null;
}

export async function callGetUserStatus(
  baseUrl: string,
  csrfToken?: string,
  fetchFn?: (url: string, options: any) => Promise<Response>,
  extraOptions?: { signal?: AbortSignal },
): Promise<any> {
  const doFetch = fetchFn || globalThis.fetch.bind(globalThis);
  const url = new URL("/exa.language_server_pb.LanguageServerService/GetUserStatus", baseUrl).toString();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Connect-Protocol-Version": "1",
  };
  if (csrfToken) headers["X-Codeium-Csrf-Token"] = csrfToken;

  const res = await doFetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ metadata: { ideName: "antigravity", extensionName: "antigravity", locale: "en" } }),
    signal: extraOptions?.signal,
    tls: { rejectUnauthorized: false },
  });

  const text = await res.text();
  if (res.status >= 200 && res.status < 300) {
    try { return JSON.parse(text); } catch { return text; }
  }
  throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
}

export async function collectQuota(
  processInfo: AgyProcessInfo,
  ports: number[] = [],
  portTokenMap?: Map<number, string>,
): Promise<QuotaSnapshot> {
  ports = ports.length > 0 ? ports : (processInfo.port ? [processInfo.port] : []);
  console.log(`[Quota] Probing ports: ${ports.join(", ")}`);

  let endpoint: { baseUrl: string; csrfToken?: string } | null = null;

  if (portTokenMap && portTokenMap.size > 0) {
    const extraTokens: string[] = [];
    if (processInfo.csrfToken) extraTokens.push(processInfo.csrfToken);
    endpoint = await findConnectApiWithTokens(ports, portTokenMap, extraTokens);
  } else {
    const url = await findConnectApi(ports, processInfo.csrfToken);
    if (url) endpoint = { baseUrl: url, csrfToken: processInfo.csrfToken };
  }

  if (!endpoint) {
    throw new Error("Could not find Connect API endpoint. Is agy running?");
  }

  console.log(`[Quota] Found Connect API at ${endpoint.baseUrl}${endpoint.csrfToken ? " (with token)" : ""}`);
  const response = await callGetUserStatus(endpoint.baseUrl, endpoint.csrfToken);
  return parseUserStatusToSnapshot(response);
}
