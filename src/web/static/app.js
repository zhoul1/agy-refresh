"use strict";

const Store = {
  status: null,
  config: null,
  executionHistory: [],
  latestQuota: null,
  quotaHistory: [],
  modelIds: [],
  logs: [],
  trendsHours: 168,
  logFilter: { source: "all", level: "all" },
  chartInstances: {},
  sse: null,
  countdownTimer: null,
  lastEventAt: Date.now(),
  saving: false,
};

const PageTitles = {
  overview: "总览",
  scheduler: "调度",
  trends: "趋势",
  settings: "设置",
  logs: "日志",
};
const PageSubs = {
  overview: "最新额度、运行状态与快捷操作",
  scheduler: "定时对话的状态、控制与执行历史",
  trends: "每个模型的使用率随时间变化",
  settings: "调度、命令、监控参数调整后热生效",
  logs: "daemon / monitor / web 实时日志流",
};

const api = {
  async get(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return r.json();
  },
  async send(url, method, body) {
    const opts = { method, headers: { "content-type": "application/json" } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const r = await fetch(url, opts);
    const data = r.status === 204 ? null : await r.json();
    if (!r.ok) throw new Error(data?.error || `${url}: ${r.status}`);
    return data;
  },
};

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function fmtTime(iso, withSeconds = false) {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}${withSeconds ? ":" + pad(d.getSeconds()) : ""}`;
}
function fmtAgo(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "即将";
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec} 秒前`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  return `${Math.floor(hr / 24)} 天前`;
}
function fmtUptime(ms) {
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hr = Math.floor((sec % 86400) / 3600);
  const min = Math.floor((sec % 3600) / 60);
  if (days > 0) return `${days} 天 ${hr} 小时`;
  if (hr > 0) return `${hr} 小时 ${min} 分`;
  return `${min} 分 ${sec % 60} 秒`;
}
function fmtCountdown(targetIso) {
  if (!targetIso) return "—";
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return "即将";
  const sec = Math.floor(diff / 1000);
  const hr = Math.floor(sec / 3600);
  const min = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (hr > 0) return `${hr} 时 ${min} 分 ${s} 秒`;
  if (min > 0) return `${min} 分 ${s} 秒`;
  return `${s} 秒`;
}
function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escapeAttr(s) {
  return escapeHtml(s);
}
function progressClass(pct) {
  if (pct > 80) return "bar-red";
  if (pct > 50) return "bar-yellow";
  return "bar-green";
}
function badgeClassForStatus(success) {
  return success ? "badge-success" : "badge-danger";
}

function toast(msg, type = "info") {
  const el = $("#toast");
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2400);
}

async function refreshStatus() {
  try {
    Store.status = await api.get("/api/status");
  } catch (e) { console.warn("status refresh failed", e); }
}
async function refreshLatestQuota() {
  try {
    const data = await api.get("/api/quota/latest");
    if (!data.error) Store.latestQuota = data;
  } catch (e) { /* no data yet is fine */ }
}
async function refreshExecutionHistory() {
  try {
    Store.executionHistory = await api.get("/api/scheduler/history?limit=100");
  } catch (e) { console.warn("history refresh failed", e); }
}
async function refreshConfig() {
  Store.config = await api.get("/api/config");
}
async function refreshQuotaHistory(hours) {
  const data = await api.get(`/api/quota/history?hours=${hours}`);
  Store.quotaHistory = data;
  Store.modelIds = [...new Set(data.flatMap((d) => d.models.map((m) => m.id)))];
}
async function refreshLogs() {
  Store.logs = await api.get("/api/logs?limit=300");
}

function renderTopbar() {
  const s = Store.status;
  if (!s) return;
  const dPill = $("#daemonPill");
  const mPill = $("#monitorPill");

  dPill.className = "status-pill " + (s.daemon.running ? "running" : "stopped");
  dPill.innerHTML = `<span class="dot ${s.daemon.running ? "dot-run" : "dot-stop"}"></span><span>调度: ${s.daemon.running ? "运行中" : "已停止"}</span>`;
  mPill.className = "status-pill " + (s.monitor.running ? "running" : "stopped");
  mPill.innerHTML = `<span class="dot ${s.monitor.running ? "dot-run" : "dot-stop"}"></span><span>监控: ${s.monitor.running ? "运行中" : "已停止"}</span>`;

  $("#uptime").textContent = `进程运行 ${fmtUptime(s.uptime)}`;
}

function updateCountdowns() {
  const s = Store.status;
  if (!s) return;
  $$("[data-cd='daemon-next']").forEach((el) => {
    el.textContent = s.daemon.nextRunAt ? fmtCountdown(s.daemon.nextRunAt) : "—";
  });
  $$("[data-cd='daemon-next-abs']").forEach((el) => {
    el.textContent = s.daemon.nextRunAt ? fmtTime(s.daemon.nextRunAt) : "—";
  });
  $$("[data-cd='monitor-next']").forEach((el) => {
    el.textContent = s.monitor.nextCollectAt ? fmtCountdown(s.monitor.nextCollectAt) : "—";
  });
  $$("[data-cd='monitor-next-abs']").forEach((el) => {
    el.textContent = s.monitor.nextCollectAt ? fmtTime(s.monitor.nextCollectAt) : "—";
  });
}

function renderOverview() {
  const s = Store.status;
  const q = Store.latestQuota;
  const html = [];

  html.push(`<div class="grid-4">
    <div class="metric accent">
      <div class="metric-label">下次对话</div>
      <div class="metric-value" data-cd="daemon-next">—</div>
      <div class="metric-extra" data-cd="daemon-next-abs">—</div>
    </div>
    <div class="metric">
      <div class="metric-label">下次额度采集</div>
      <div class="metric-value" data-cd="monitor-next">—</div>
      <div class="metric-extra" data-cd="monitor-next-abs">—</div>
    </div>
    <div class="metric ${q?.credits?.limit && (q.credits.used / q.credits.limit) > 0.8 ? 'warn' : 'success'}">
      <div class="metric-label">Prompt Credits</div>
      <div class="metric-value">${q?.credits ? `${q.credits.remaining ?? "?"} <span style="font-size:16px;color:var(--text-3)">/ ${q.credits.limit ?? "?"}</span>` : "—"}</div>
      <div class="metric-extra">${q?.credits?.used != null ? `已用 ${q.credits.used}` : "尚无数据"} · 账号 ${q?.email || "—"}</div>
    </div>
    <div class="metric">
      <div class="metric-label">上次对话</div>
      <div class="metric-value" style="font-size:18px">${s?.daemon?.lastExecution ? fmtAgo(s.daemon.lastExecution.runAt) : "—"}</div>
      <div class="metric-extra">${s?.daemon?.lastExecution ? (s.daemon.lastExecution.success ? '<span class="badge badge-success">成功</span>' : '<span class="badge badge-danger">失败</span>') + (s.daemon.lastExecution.triggeredBy === "manual" ? " 手动" : " 自动") : "尚未执行"}</div>
    </div>
  </div>`);

  html.push(`<div class="action-bar" style="margin-bottom: 16px">
    <button class="btn btn-primary" id="quickCollect">⚡ 立即采集额度</button>
    <button class="btn btn-success" id="quickRun">▶ 立即执行一次对话</button>
    <span style="color:var(--text-3);font-size:12px">快捷操作立即生效，结果出现在「调度」和「日志」页</span>
  </div>`);

  if (q && q.models && q.models.length > 0) {
    html.push(`<div class="card">
      <div class="card-title">最新模型额度 <span class="card-title-sub">${q.time ? fmtTime(q.time, true) : ""} · 账号 ${q.email || "—"}</span></div>
      <table class="model-table">
        <thead><tr>
          <th>模型</th><th>显示名</th><th style="width: 40%">使用率</th><th class="num">已用</th><th class="num">剩余</th><th>重置时间</th><th>状态</th>
        </tr></thead>
        <tbody>
        ${q.models.map((m) => {
          const pct = m.usedPct ?? 0;
          return `<tr>
            <td><span class="model-id">${escapeHtml(m.id)}</span></td>
            <td class="model-name">${escapeHtml(m.display || "—")}</td>
            <td><div class="progress-cell"><div class="bar-wrap"><div class="bar-fill ${progressClass(pct)}" style="width: ${pct}%"></div></div><span class="progress-num">${pct.toFixed(1)}%</span></div></td>
            <td class="num">${pct.toFixed(1)}%</td>
            <td class="num">${m.remainingPct != null ? m.remainingPct.toFixed(1) + "%" : "—"}</td>
            <td>${m.resetTime ? fmtTime(m.resetTime) : "—"}</td>
            <td>${m.exhausted ? '<span class="badge badge-danger">已耗尽</span>' : '<span class="badge badge-success">正常</span>'}</td>
          </tr>`;
        }).join("")}
        </tbody>
      </table>
    </div>`);
  } else {
    html.push(`<div class="card"><div class="empty">尚未采集到额度数据。点击上方「立即采集额度」按钮或确认 agy 语言服务器已启动。</div></div>`);
  }

  html.push(`<div class="grid-2">
    <div class="card">
      <div class="card-title">最近对话执行</div>
      ${Store.executionHistory.length === 0 ? '<div class="empty">尚无执行记录</div>' : renderExecutionRows(Store.executionHistory.slice(0, 5), true)}
    </div>
    <div class="card">
      <div class="card-title">监控状态</div>
      <table>
        <tr><td style="color:var(--text-3)">运行中</td><td>${s?.monitor?.running ? '<span class="badge badge-success">是</span>' : '<span class="badge badge-neutral">否</span>'}</td></tr>
        <tr><td style="color:var(--text-3)">下次采集</td><td><span data-cd="monitor-next">—</span> (${s?.monitor?.nextCollectAt ? fmtTime(s.monitor.nextCollectAt) : "—"})</td></tr>
        <tr><td style="color:var(--text-3)">上次采集</td><td>${s?.monitor?.lastCollectionAt ? fmtAgo(s.monitor.lastCollectionAt) : "—"}</td></tr>
        <tr><td style="color:var(--text-3)">最近错误</td><td>${s?.monitor?.lastError ? `<span class="badge badge-danger">${escapeHtml(s.monitor.lastError)}</span>` : "—"}</td></tr>
      </table>
    </div>
  </div>`);

  $("#content").innerHTML = html.join("");

  $("#quickCollect").onclick = async () => {
    try {
      toast("正在采集...", "info");
      const r = await api.send("/api/monitor/collect-now", "POST");
      toast(`采集完成，记录 ${r.models} 个模型`, "success");
      await refreshLatestQuota();
      await refreshStatus();
      renderOverview();
    } catch (e) { toast("采集失败: " + e.message, "error"); }
  };
  $("#quickRun").onclick = async () => {
    try {
      toast("正在执行对话...", "info");
      await api.send("/api/scheduler/run-now", "POST");
      toast("对话已触发，结果请看「调度」页", "success");
    } catch (e) { toast("执行失败: " + e.message, "error"); }
  };
}

function renderExecutionRows(rows, withLimit = false) {
  const limited = withLimit ? rows.slice(0, 5) : rows;
  return `<table>
    <thead><tr>
      <th>时间</th><th>触发</th><th class="num">耗时</th><th>结果</th><th></th>
    </tr></thead>
    <tbody>
    ${limited.map((r) => `<tr class="execution-row" data-id="${r.id}">
      <td>${fmtTime(r.runAt, true)}</td>
      <td>${r.triggeredBy === "manual" ? '<span class="badge badge-info">手动</span>' : '<span class="badge badge-neutral">自动</span>'}</td>
      <td class="num">${r.durationMs != null ? r.durationMs + ' ms' : '—'}</td>
      <td><span class="badge ${badgeClassForStatus(r.success)}">${r.success ? '成功' : '失败'}</span></td>
      <td><span style="color:var(--text-3);font-size:12px">▾ 展开</span></td>
    </tr>
    <tr class="execution-detail-row" data-detail-id="${r.id}"><td colspan="5">${renderExecutionDetail(r)}</td></tr>`).join("")}
    </tbody>
  </table>`;
}

function renderExecutionDetail(r) {
  const stdout = r.stdout ? `<div class="stdout">STDOUT:\n${escapeHtml(r.stdout)}</div>` : "";
  const stderr = r.stderr ? `<div class="stderr">STDERR:\n${escapeHtml(r.stderr)}</div>` : "";
  if (!stdout && !stderr) return `<div class="execution-detail show">无输出</div>`;
  return `<div class="execution-detail show">${stdout}${stderr}</div>`;
}

function bindExecutionRowToggles() {
  $$(".execution-row").forEach((tr) => {
    tr.addEventListener("click", () => {
      const id = tr.getAttribute("data-id");
      const detailTr = $(`.execution-detail-row[data-detail-id="${id}"] .execution-detail`);
      if (detailTr) detailTr.classList.toggle("show");
    });
  });
}

function renderScheduler() {
  const s = Store.status;
  const html = [];
  html.push(`<div class="card">
    <div class="card-title">调度状态 <span class="card-title-sub">daemon 每 ${Store.config?.scheduler?.intervalMinutes ?? "—"} 分钟执行一次 (${Store.config?.scheduler?.startTime ?? "—"} – ${Store.config?.scheduler?.endTime ?? "—"})</span></div>
    <div class="grid-3">
      <div>
        <div class="metric-label">当前状态</div>
        <div style="margin-top: 6px">${s?.daemon?.running ? '<span class="badge badge-success">运行中</span>' : '<span class="badge badge-neutral">已停止</span>'}</div>
        <div class="action-bar" style="margin-top: 12px">
          ${s?.daemon?.running
            ? '<button class="btn btn-danger btn-sm" id="btnStopDaemon">⏹ 停止调度</button>'
            : '<button class="btn btn-primary btn-sm" id="btnStartDaemon">▶ 启动调度</button>'}
          <button class="btn btn-success btn-sm" id="btnRunNow">⚡ 立即执行一次</button>
        </div>
      </div>
      <div>
        <div class="metric-label">下一次执行</div>
        <div class="metric-value" style="font-size: 22px" data-cd="daemon-next">—</div>
        <div class="metric-extra" data-cd="daemon-next-abs">—</div>
      </div>
      <div>
        <div class="metric-label">最近一次执行</div>
        ${s?.daemon?.lastExecution ? `
          <div style="margin-top: 6px">${fmtTime(s.daemon.lastExecution.runAt, true)} (${fmtAgo(s.daemon.lastExecution.runAt)})</div>
          <div style="margin-top: 4px"><span class="badge ${badgeClassForStatus(s.daemon.lastExecution.success)}">${s.daemon.lastExecution.success ? '成功' : '失败'}</span>
          ${s.daemon.lastExecution.triggeredBy === 'manual' ? '<span class="badge badge-info" style="margin-left:4px">手动</span>' : '<span class="badge badge-neutral" style="margin-left:4px">自动</span>'}
          ${s.daemon.lastExecution.durationMs != null ? `<span style="margin-left:6px;color:var(--text-3);font-size:12px">${s.daemon.lastExecution.durationMs} ms</span>` : ''}
          </div>
        ` : '<div class="metric-extra" style="margin-top:6px">尚未执行</div>'}
      </div>
    </div>
  </div>`);

  html.push(`<div class="card">
    <div class="card-title">执行历史 <span class="card-title-sub">最近 100 条</span></div>
    ${Store.executionHistory.length === 0 ? '<div class="empty">尚无执行记录</div>' : renderExecutionRows(Store.executionHistory)}
  </div>`);

  $("#content").innerHTML = html.join("");

  const stopBtn = $("#btnStopDaemon");
  if (stopBtn) stopBtn.onclick = async () => {
    try { await api.send("/api/scheduler/stop", "POST"); toast("调度已停止", "success"); }
    catch (e) { toast("停止失败: " + e.message, "error"); }
  };
  const startBtn = $("#btnStartDaemon");
  if (startBtn) startBtn.onclick = async () => {
    try { await api.send("/api/scheduler/start", "POST"); toast("调度已启动", "success"); }
    catch (e) { toast("启动失败: " + e.message, "error"); }
  };
  $("#btnRunNow").onclick = async () => {
    try { toast("正在执行对话...", "info"); await api.send("/api/scheduler/run-now", "POST"); toast("已触发，对话进行中", "success"); }
    catch (e) { toast("执行失败: " + e.message, "error"); }
  };
  bindExecutionRowToggles();
}

function renderTrends() {
  const html = [];
  html.push(`<div class="tabs-row">
    <div class="tab ${Store.trendsHours === 24 ? "active" : ""}" data-hours="24">24 小时</div>
    <div class="tab ${Store.trendsHours === 168 ? "active" : ""}" data-hours="168">7 天</div>
    <div class="tab ${Store.trendsHours === 720 ? "active" : ""}" data-hours="720">30 天</div>
  </div>`);

  if (Store.quotaHistory.length === 0) {
    html.push(`<div class="card"><div class="empty">尚无历史数据，无法绘制趋势图。请等待采集或调整时间范围。</div></div>`);
  } else {
    for (const mid of Store.modelIds) {
      html.push(`<div class="card">
        <div class="card-title">${escapeHtml(mid)} <span class="card-title-sub">使用率 %</span></div>
        <div class="chart-container"><canvas data-model="${escapeAttr(mid)}"></canvas></div>
      </div>`);
    }
  }

  $("#content").innerHTML = html.join("");

  $$(".tabs-row .tab").forEach((t) => {
    t.onclick = async () => {
      Store.trendsHours = parseInt(t.getAttribute("data-hours"), 10);
      await refreshQuotaHistory(Store.trendsHours);
      renderTrends();
    };
  });

  drawCharts();
}

function drawCharts() {
  const palette = ["#2563eb", "#7c3aed", "#0891b2", "#16a34a", "#d97706", "#dc2626", "#db2777", "#65a30d"];
  $$("canvas[data-model]").forEach((canvas, idx) => {
    const mid = canvas.getAttribute("data-model");
    const labels = Store.quotaHistory.map((d) => fmtTime(d.time));
    const values = Store.quotaHistory.map((d) => {
      const m = d.models.find((x) => x.id === mid);
      return m?.usedPct ?? null;
    });
    const color = palette[idx % palette.length];
    if (Store.chartInstances[mid]) Store.chartInstances[mid].destroy();
    Store.chartInstances[mid] = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "使用率 %",
          data: values,
          borderColor: color,
          backgroundColor: color + "22",
          fill: true,
          tension: 0.3,
          spanGaps: true,
          pointRadius: values.length > 50 ? 0 : 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: "#e5e9f0" } },
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10, color: "#9ca3af" } },
        },
      },
    });
  });
}

function renderSettings() {
  const c = Store.config;
  if (!c) return;
  const html = [];
  html.push(`<div class="card">
    <div class="card-title">调度设置</div>
    <div class="fieldset-sub">每日对话的时间范围与触发间隔。下次触发时自动热重载。</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">开始时间 (HH:MM)</label>
        <input class="form-input" type="text" id="cfg-startTime" value="${escapeAttr(c.scheduler.startTime)}">
        <div class="form-hint">必须早于结束时间</div>
      </div>
      <div class="form-group">
        <label class="form-label">结束时间 (HH:MM)</label>
        <input class="form-input" type="text" id="cfg-endTime" value="${escapeAttr(c.scheduler.endTime)}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">间隔 (分钟)</label>
      <input class="form-input" type="number" id="cfg-intervalMinutes" value="${c.scheduler.intervalMinutes}" min="1">
    </div>
  </div>`);

  html.push(`<div class="card">
    <div class="card-title">命令设置</div>
    <div class="fieldset-sub">每次定时触发的命令行。Args 用空格分隔多个参数。</div>
    <div class="form-group">
      <label class="form-label">可执行文件</label>
      <input class="form-input" type="text" id="cfg-executable" value="${escapeAttr(c.command.executable)}">
    </div>
    <div class="form-group">
      <label class="form-label">参数 (用空格分隔)</label>
      <input class="form-input" type="text" id="cfg-args" value="${escapeAttr(c.command.args.join(' '))}">
      <div class="form-hint">例: --prompt 你好</div>
    </div>
  </div>`);

  html.push(`<div class="card">
    <div class="card-title">监控设置</div>
    <div class="fieldset-sub">额度自动采集的间隔与 agy HTTP 超时。</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">采集间隔 (分钟)</label>
        <input class="form-input" type="number" id="cfg-monInterval" value="${c.monitor.intervalMinutes}" min="1">
      </div>
      <div class="form-group">
        <label class="form-label">HTTP 超时 (毫秒)</label>
        <input class="form-input" type="number" id="cfg-agyTimeout" value="${c.monitor.agyTimeoutMs}" min="1000">
      </div>
    </div>
  </div>`);

  html.push(`<div class="card">
    <div class="card-title">Web 服务设置</div>
    <div class="fieldset-sub">本控制中心监听地址。修改后需重启进程才能生效。</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Host</label>
        <input class="form-input" type="text" id="cfg-host" value="${escapeAttr(c.web.host)}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Port</label>
        <input class="form-input" type="number" id="cfg-port" value="${c.web.port}" readonly>
      </div>
    </div>
  </div>`);

  html.push(`<div class="action-bar" style="margin-bottom: 30px">
    <button class="btn btn-primary" id="btnSaveConfig">💾 保存并热生效</button>
    <button class="btn" id="btnReloadConfig">↻ 重新读取</button>
    <button class="btn btn-ghost" id="btnResetConfig">恢复默认</button>
  </div>`);

  $("#content").innerHTML = html.join("");

  $("#btnSaveConfig").onclick = async () => {
    if (Store.saving) return;
    Store.saving = true;
    try {
      const args = $("#cfg-args").value.trim().length === 0 ? [] : $("#cfg-args").value.trim().split(/\s+/);
      const payload = {
        scheduler: {
          startTime: $("#cfg-startTime").value,
          endTime: $("#cfg-endTime").value,
          intervalMinutes: parseInt($("#cfg-intervalMinutes").value, 10),
        },
        command: {
          executable: $("#cfg-executable").value,
          args,
        },
        monitor: {
          intervalMinutes: parseInt($("#cfg-monInterval").value, 10),
          agyTimeoutMs: parseInt($("#cfg-agyTimeout").value, 10),
        },
      };
      Store.config = await api.send("/api/config", "PUT", payload);
      toast("配置已保存，热生效", "success");
    } catch (e) {
      toast("保存失败: " + e.message, "error");
    } finally {
      Store.saving = false;
    }
  };
  $("#btnReloadConfig").onclick = async () => {
    try { await refreshConfig(); renderSettings(); toast("已重新加载", "success"); }
    catch (e) { toast("加载失败: " + e.message, "error"); }
  };
  $("#btnResetConfig").onclick = () => {
    $("#cfg-startTime").value = "08:00";
    $("#cfg-endTime").value = "23:30";
    $("#cfg-intervalMinutes").value = "30";
    $("#cfg-executable").value = "agy";
    $("#cfg-args").value = "--prompt 你好";
    $("#cfg-monInterval").value = "10";
    $("#cfg-agyTimeout").value = "10000";
    toast("已恢复默认，点击保存以应用", "info");
  };
}

function renderLogs() {
  const html = [];
  html.push(`<div class="card">
    <div class="card-title">实时日志 <span class="card-title-sub">通过 SSE 推送，最多保留 500 条</span></div>
    <div class="action-bar" style="margin-bottom: 12px">
      <label style="font-size: 12px; color: var(--text-3)">来源:</label>
      <select class="form-select" id="logSrc" style="width: 120px">
        <option value="all">全部</option>
        <option value="daemon">daemon</option>
        <option value="monitor">monitor</option>
        <option value="web">web</option>
        <option value="system">system</option>
      </select>
      <label style="font-size: 12px; color: var(--text-3); margin-left: 8px">级别:</label>
      <select class="form-select" id="logLvl" style="width: 100px">
        <option value="all">全部</option>
        <option value="error">error</option>
        <option value="warn">warn</option>
        <option value="info">info</option>
      </select>
      <button class="btn btn-sm" id="logClear" style="margin-left: auto">清空显示</button>
    </div>
    <div class="log-stream" id="logStream"></div>
  </div>`);
  $("#content").innerHTML = html.join("");
  $("#logSrc").value = Store.logFilter.source;
  $("#logLvl").value = Store.logFilter.level;
  $("#logSrc").onchange = (e) => { Store.logFilter.source = e.target.value; redrawLogs(); };
  $("#logLvl").onchange = (e) => { Store.logFilter.level = e.target.value; redrawLogs(); };
  $("#logClear").onclick = () => { Store.logs = []; redrawLogs(); };
  redrawLogs();
}

function redrawLogs() {
  const stream = $("#logStream");
  if (!stream) return;
  const filtered = Store.logs.filter((l) => {
    if (Store.logFilter.source !== "all" && l.source !== Store.logFilter.source) return false;
    if (Store.logFilter.level !== "all" && l.level !== Store.logFilter.level) return false;
    return true;
  });
  const atBottom = stream.scrollTop + stream.clientHeight >= stream.scrollHeight - 20;
  stream.innerHTML = filtered.map((l) => `<div class="log-line">
    <span class="log-time">${fmtTime(l.ts, true)}</span>
    <span class="log-source ${l.source}">${l.source.padEnd(7)}</span>
    <span class="log-level ${l.level}">[${l.level}]</span>
    <span class="log-msg">${escapeHtml(l.msg)}</span>
  </div>`).join("");
  if (atBottom) stream.scrollTop = stream.scrollHeight;
}

function setRoute(route) {
  if (!PageTitles[route]) route = "overview";
  $$(".nav-item").forEach((el) => el.classList.toggle("active", el.getAttribute("data-route") === route));
  $("#pageTitle").textContent = PageTitles[route];
  $("#pageSub").textContent = PageSubs[route];
  location.hash = route;
  switch (route) {
    case "overview": renderOverview(); break;
    case "scheduler": renderScheduler(); break;
    case "trends": renderTrends(); break;
    case "settings": renderSettings(); break;
    case "logs": renderLogs(); break;
  }
}

function connectSSE() {
  if (Store.sse) try { Store.sse.close(); } catch {}
  const es = new EventSource("/api/events");
  Store.sse = es;
  const conn = $("#connStatus");
  const onEvent = (handler) => (e) => {
    try { handler(JSON.parse(e.data)); } catch {}
  };
  es.addEventListener("hello", () => {
    conn.innerHTML = '<span class="dot dot-on"></span><span>已连接</span>';
  });
  es.addEventListener("daemon", onEvent((d) => {
    refreshStatus();
    if (d.type === "executed") {
      refreshExecutionHistory();
      refreshStatus();
      if (location.hash === "#scheduler" || location.hash === "#overview" || location.hash === "") {
        setRoute(location.hash.replace("#", "") || "overview");
      }
    } else if (d.type === "tick" || d.type === "start" || d.type === "stop") {
      if (location.hash === "#overview" || location.hash === "#scheduler" || location.hash === "") {
        const cur = location.hash.replace("#", "") || "overview";
        if (cur === "overview" || cur === "scheduler") setRoute(cur);
      }
    }
    renderTopbar();
  }));
  es.addEventListener("monitor", onEvent((d) => {
    refreshStatus();
    if (d.type === "collected") {
      refreshLatestQuota();
    } else if (d.type === "tick" || d.type === "start" || d.type === "stop" || d.type === "failed") {
      if (location.hash === "#overview") setRoute("overview");
    }
    renderTopbar();
  }));
  es.addEventListener("log", onEvent((entry) => {
    Store.logs.push(entry);
    if (Store.logs.length > 500) Store.logs.splice(0, Store.logs.length - 500);
    if (location.hash === "#logs") redrawLogs();
  }));
  es.onerror = () => {
    conn.innerHTML = '<span class="dot dot-warn"></span><span>连接中断，重连中...</span>';
  };
  es.onopen = () => {
    conn.innerHTML = '<span class="dot dot-on"></span><span>已连接</span>';
  };
}

async function boot() {
  Store.countdownTimer = setInterval(updateCountdowns, 1000);
  await refreshConfig();
  await refreshStatus();
  await refreshLatestQuota();
  await refreshExecutionHistory();
  await refreshLogs();
  renderTopbar();
  const initial = location.hash.replace("#", "") || "overview";
  setRoute(initial);
  connectSSE();
  setInterval(async () => {
    try { await refreshStatus(); renderTopbar(); } catch {}
  }, 30000);
}

window.addEventListener("hashchange", () => setRoute(location.hash.replace("#", "")));
window.addEventListener("beforeunload", () => { if (Store.sse) Store.sse.close(); });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
