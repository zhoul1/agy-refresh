export interface AgyProcessInfo {
  pid: number;
  csrfToken?: string;
  port?: number;
}

export function extractArg(cmd: string, name: string): string | null {
  const eq = new RegExp(`${name}=([^\\s"']+|"[^"]*"|'[^']*')`, "i");
  const m = cmd.match(eq);
  if (m) return m[1].replace(/^["']|["']$/g, "");
  const sp = new RegExp(`${name}\\s+([^\\s"']+|"[^"]*"|'[^']*')`, "i");
  const m2 = cmd.match(sp);
  if (m2) return m2[1].replace(/^["']|["']$/g, "");
  return null;
}

export async function detectAllAgyProcesses(): Promise<AgyProcessInfo[]> {
  const results: AgyProcessInfo[] = [];

  try {
    const proc = Bun.spawn(["wmic", "process", 'where', 'name like \'%antigravity%\' or commandline like \'%antigravity%\'', "get", "processid,commandline", "/format:csv"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const out = await new Response(proc.stdout).text();
    for (const line of out.split("\n")) {
      if (!line.trim() || line.includes("Node,CommandLine")) continue;
      const idx = line.lastIndexOf(",");
      if (idx < 0) continue;
      const cmd = line.substring(0, idx);
      const pidStr = line.substring(idx + 1).trim();
      const pid = parseInt(pidStr, 10);
      if (isNaN(pid) || !cmd.toLowerCase().includes("antigravity")) continue;
      const csrfToken = extractArg(cmd, "--csrf_token") || undefined;
      const extPort = extractArg(cmd, "--extension_server_port");
      results.push({
        pid,
        csrfToken,
        port: extPort ? parseInt(extPort, 10) : undefined,
      });
    }
  } catch {}

  if (results.length === 0) {
    try {
      const proc = Bun.spawn(["powershell", "-Command", "Get-CimInstance Win32_Process -Filter \"Name like '%antigravity%'\" | Select-Object ProcessId,CommandLine | ConvertTo-Json"], {
        stdout: "pipe",
      });
      const out = await new Response(proc.stdout).text();
      const data = JSON.parse(out.trim() || "[]");
      const list = Array.isArray(data) ? data : [data];
      for (const p of list) {
        if (!p?.ProcessId || !p?.CommandLine) continue;
        const cmd = p.CommandLine;
        const pid = p.ProcessId;
        results.push({
          pid,
          csrfToken: extractArg(cmd, "--csrf_token") || undefined,
          port: (() => { const v = extractArg(cmd, "--extension_server_port"); return v ? parseInt(v, 10) : undefined; })(),
        });
      }
    } catch {}
  }

  return results;
}

export function scoreCandidate(c: AgyProcessInfo): number {
  let score = 0;
  if (c.port) score += 10;
  if (c.csrfToken) score += 20;
  return score;
}

export async function detectAgyProcess(): Promise<AgyProcessInfo | null> {
  const all = await detectAllAgyProcesses();
  if (all.length === 0) return null;

  const scored = all.map(p => ({ info: p, score: scoreCandidate(p) }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].info;
}

export async function discoverAllListeningPorts(allPids: number[]): Promise<number[]> {
  const portSet = new Set<number>();

  try {
    const proc = Bun.spawn(["netstat", "-ano"], { stdout: "pipe" });
    const out = await new Response(proc.stdout).text();
    const pidSet = new Set(allPids);
    for (const line of out.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const linePid = parseInt(parts[parts.length - 1], 10);
      if (pidSet.has(linePid)) {
        const m = parts[1].match(/:(\d+)$/);
        if (m) {
          const port = parseInt(m[1], 10);
          if (!isNaN(port)) portSet.add(port);
        }
      }
    }
  } catch {}

  if (portSet.size === 0) {
    for (const pid of allPids) {
      try {
        const proc = Bun.spawn(["powershell", "-Command",
          `Get-NetTCPConnection -OwningProcess ${pid} -State Listen | Select-Object -ExpandProperty LocalPort`
        ], { stdout: "pipe" });
        const out = (await new Response(proc.stdout).text()).trim();
        for (const s of out.split("\n")) {
          const p = parseInt(s.trim(), 10);
          if (!isNaN(p)) portSet.add(p);
        }
      } catch {}
    }
  }

  return [...portSet];
}
