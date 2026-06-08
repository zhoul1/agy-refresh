"use strict";

// ── i18n ──────────────────────────────────────────────
const LOCALE_DATA = {
  zh: {
    "nav.overview": "总览",
    "nav.scheduler": "调度",
    "nav.trends": "趋势",
    "nav.settings": "设置",
    "nav.logs": "日志",
    "brand.title": "Agy 控制中心",
    "brand.sub": "定时调度 + 额度监控",
    "conn.connected": "已连接",
    "conn.reconnect": "连接中断，重连中...",
    "uptime": "进程运行 {{n}}",
    "pill.scheduler": "调度: {{s}}",
    "pill.schedulerRunning": "运行中",
    "pill.schedulerStopped": "已停止",
    "pill.monitor": "监控: {{s}}",
    "pill.monitorRunning": "运行中",
    "pill.monitorStopped": "已停止",
    "pill.unknown": "--",
    "page.overview.title": "总览",
    "page.overview.sub": "最新额度、运行状态与快捷操作",
    "page.scheduler.title": "调度",
    "page.scheduler.sub": "定时对话的状态、控制与执行历史",
    "page.trends.title": "趋势",
    "page.trends.sub": "每个模型的使用率随时间变化",
    "page.settings.title": "设置",
    "page.settings.sub": "调度、命令、监控参数调整后热生效",
    "page.logs.title": "日志",
    "page.logs.sub": "daemon / monitor / web 实时日志流",
    "metric.nextTalk": "下次对话",
    "metric.nextQuota": "下次额度采集",
    "metric.promptCredits": "Prompt Credits",
    "metric.flowCredits": "Flow Credits",
    "metric.googleOneAi": "Google One AI",
    "metric.accountName": "账号名称",
    "metric.used": "已用 {{n}}",
    "metric.usedShort": "已用",
    "metric.noData": "尚无数据",
    "metric.account": "账号 {{n}}",
    "metric.lastTalk": "上次对话",
    "metric.notYet": "尚未执行",
    "badge.success": "成功",
    "badge.fail": "失败",
    "badge.manual": "手动",
    "badge.auto": "自动",
    "badge.exhausted": "已耗尽",
    "badge.normal": "正常",
    "badge.yes": "是",
    "badge.no": "否",
    "btn.collectNow": "⚡ 立即采集额度",
    "btn.runNow": "▶ 立即执行一次对话",
    "btn.shortcutHint": "快捷操作立即生效，结果出现在「调度」和「日志」页",
    "quota.latestTitle": "最新模型额度",
    "quota.noData": "尚未采集到额度数据。请先启动 antigravity IDE / AG 2.0，然后点击「立即采集额度」。",
    "table.model": "模型",
    "table.displayName": "显示名",
    "table.usage": "使用率",
    "table.used": "已用",
    "table.remaining": "剩余",
    "table.resetTime": "重置时间",
    "table.status": "状态",
    "exec.recent": "最近对话执行",
    "exec.noRecords": "尚无执行记录",
    "monitor.status": "监控状态",
    "monitor.running": "运行中",
    "monitor.nextCollect": "下次采集",
    "monitor.lastCollect": "上次采集",
    "monitor.lastError": "最近错误",
    "execTable.time": "时间",
    "execTable.trigger": "触发",
    "execTable.duration": "耗时",
    "execTable.result": "结果",
    "execTable.expand": "▾ 展开",
    "execDetail.stdout": "STDOUT:",
    "execDetail.stderr": "STDERR:",
    "execDetail.noOutput": "无输出",
    "scheduler.title": "调度状态",
    "scheduler.desc": "daemon 每 {{interval}} 分钟执行一次 ({{start}} – {{end}})",
    "scheduler.status": "当前状态",
    "scheduler.running": "运行中",
    "scheduler.stopped": "已停止",
    "scheduler.btnStop": "⏹ 停止调度",
    "scheduler.btnStart": "▶ 启动调度",
    "scheduler.btnRunNow": "⚡ 立即执行一次",
    "scheduler.nextRun": "下一次执行",
    "scheduler.lastRun": "最近一次执行",
    "scheduler.notYet": "尚未执行",
    "scheduler.history": "执行历史",
    "scheduler.historySub": "最近 100 条",
    "trends.24h": "24 小时",
    "trends.7d": "7 天",
    "trends.30d": "30 天",
    "trends.noData": "尚无历史数据，无法绘制趋势图。请等待采集或调整时间范围。",
    "trends.usagePct": "使用率 %",
    "chart.usageLabel": "使用率 %",
    "settings.scheduler": "调度设置",
    "settings.schedulerSub": "每日对话的时间范围与触发间隔。下次触发时自动热重载。",
    "settings.startTime": "开始时间 (HH:MM)",
    "settings.startTimeHint": "必须早于结束时间",
    "settings.endTime": "结束时间 (HH:MM)",
    "settings.interval": "间隔 (分钟)",
    "settings.command": "命令设置",
    "settings.commandSub": "每次定时触发的命令行。Args 用空格分隔多个参数。",
    "settings.executable": "可执行文件",
    "settings.args": "参数 (用空格分隔)",
    "settings.argsHint": "例: --prompt 你好",
    "settings.monitor": "监控设置",
    "settings.monitorSub": "额度自动采集的间隔与 agy HTTP 超时。",
    "settings.collectInterval": "采集间隔 (分钟)",
    "settings.httpTimeout": "HTTP 超时 (毫秒)",
    "settings.web": "Web 服务设置",
    "settings.webSub": "本控制中心监听地址。修改后需重启进程才能生效。",
    "settings.host": "Host",
    "settings.port": "Port",
    "settings.tray": "系统托盘",
    "settings.traySub": "在 Windows 通知区域显示图标，方便快速操作。",
    "settings.trayEnabled": "启用系统托盘图标",
    "settings.save": "💾 保存并热生效",
    "settings.reload": "↻ 重新读取",
    "settings.reset": "恢复默认",
    "toast.saved": "配置已保存，热生效",
    "toast.saveFailed": "保存失败: {{msg}}",
    "toast.reloaded": "已重新加载",
    "toast.reloadFailed": "加载失败: {{msg}}",
    "toast.resetDone": "已恢复默认，点击保存以应用",
    "toast.collecting": "正在采集...",
    "toast.collected": "采集完成，记录 {{n}} 个模型",
    "toast.collectFail": "采集失败: {{msg}}",
    "toast.executing": "正在执行对话...",
    "toast.executed": "对话已触发，结果请看「调度」页",
    "toast.executeFail": "执行失败: {{msg}}",
    "toast.stopped": "调度已停止",
    "toast.stopFail": "停止失败: {{msg}}",
    "toast.started": "调度已启动",
    "toast.startFail": "启动失败: {{msg}}",
    "toast.triggered": "已触发，对话进行中",
    "logs.title": "实时日志",
    "logs.sub": "通过 SSE 推送，最多保留 500 条",
    "logs.source": "来源:",
    "logs.level": "级别:",
    "logs.all": "全部",
    "logs.clear": "清空显示",
    "autocontinue.cardTitle": "自动续杯",
    "autocontinue.enabled": "已启用",
    "autocontinue.disabled": "已关闭",
    "autocontinue.lastTrigger": "最近触发",
    "autocontinue.totalSuccess": "已成功续杯 {{n}} 次",
    "autocontinue.target": "目标对话",
    "autocontinue.notYet": "尚未触发",
    "autocontinue.settingsTitle": "自动续杯设置",
    "autocontinue.settingsSub": "额度耗尽后自动发送「继续」。每次额度采集时检查阈值，条件满足时触发一次。",
    "autocontinue.enableLabel": "启用自动续杯",
    "autocontinue.conversationId": "对话 UUID",
    "autocontinue.conversationIdHint": "从 agy TUI → /resume → 退出时复制 UUID",
    "autocontinue.prompt": "发送消息",
    "autocontinue.exhaustedThreshold": "耗尽阈值 %",
    "autocontinue.exhaustedThresholdHint": "平均剩余低于此值视为「额度已耗尽」",
    "autocontinue.refreshThreshold": "刷新阈值 %",
    "autocontinue.refreshThresholdHint": "平均剩余高于此值视为「额度已刷新」",
    "autocontinue.logTitle": "触发历史",
    "autocontinue.logTime": "时间",
    "autocontinue.logResult": "结果",
    "autocontinue.logDuration": "耗时",
    "autocontinue.logBefore": "触发前",
    "autocontinue.logAfter": "触发后",
    "autocontinue.success": "成功",
    "autocontinue.fail": "失败",
    "autocontinue.saved": "AutoContinue 设置已保存",
    "autocontinue.saveFailed": "保存失败: {{msg}}",
    "time.soon": "即将",
    "time.secondsAgo": "{{n}} 秒前",
    "time.minutesAgo": "{{n}} 分钟前",
    "time.hoursAgo": "{{n}} 小时前",
    "time.daysAgo": "{{n}} 天前",
    "time.daysHours": "{{n}} 天 {{m}} 小时",
    "time.hoursMin": "{{n}} 小时 {{m}} 分",
    "time.minSec": "{{n}} 分 {{m}} 秒",
    "time.hoursMinSec": "{{n}} 时 {{m}} 分 {{s}} 秒",
    "time.minutesSec": "{{n}} 分 {{s}} 秒",
    "time.seconds": "{{n}} 秒",
    "time.running": "运行 {{n}}",
    "time.emptyDash": "—",
    "lang.label": "语言",
    "lang.zh": "中文",
    "lang.en": "English",
  },

  en: {
    "nav.overview": "Overview",
    "nav.scheduler": "Scheduler",
    "nav.trends": "Trends",
    "nav.settings": "Settings",
    "nav.logs": "Logs",
    "brand.title": "Agy Control Center",
    "brand.sub": "Schedule + Quota Monitor",
    "conn.connected": "Connected",
    "conn.reconnect": "Disconnected, reconnecting...",
    "uptime": "Running {{n}}",
    "pill.scheduler": "Scheduler: {{s}}",
    "pill.schedulerRunning": "Running",
    "pill.schedulerStopped": "Stopped",
    "pill.monitor": "Monitor: {{s}}",
    "pill.monitorRunning": "Running",
    "pill.monitorStopped": "Stopped",
    "pill.unknown": "--",
    "page.overview.title": "Overview",
    "page.overview.sub": "Latest quota, status & quick actions",
    "page.scheduler.title": "Scheduler",
    "page.scheduler.sub": "Schedule control, status & execution history",
    "page.trends.title": "Trends",
    "page.trends.sub": "Usage rate over time per model",
    "page.settings.title": "Settings",
    "page.settings.sub": "Scheduler, command & monitor config (hot-reload)",
    "page.logs.title": "Logs",
    "page.logs.sub": "Real-time daemon / monitor / web logs",
    "metric.nextTalk": "Next Talk",
    "metric.nextQuota": "Next Quota",
    "metric.promptCredits": "Prompt Credits",
    "metric.flowCredits": "Flow Credits",
    "metric.googleOneAi": "Google One AI",
    "metric.accountName": "Account Name",
    "metric.used": "Used {{n}}",
    "metric.usedShort": "Used",
    "metric.noData": "No data",
    "metric.account": "Account {{n}}",
    "metric.lastTalk": "Last Talk",
    "metric.notYet": "Not yet",
    "badge.success": "Success",
    "badge.fail": "Fail",
    "badge.manual": "Manual",
    "badge.auto": "Auto",
    "badge.exhausted": "Exhausted",
    "badge.normal": "Normal",
    "badge.yes": "Yes",
    "badge.no": "No",
    "btn.collectNow": "⚡ Collect Quota Now",
    "btn.runNow": "▶ Run Talk Now",
    "btn.shortcutHint": "Actions take effect immediately. Check Scheduler and Logs for results.",
    "quota.latestTitle": "Latest Model Quota",
    "quota.noData": "No quota data yet. Please open AGy (antigravity IDE / AG 2.0) first, then click \"Collect Quota Now\".",
    "table.model": "Model",
    "table.displayName": "Display Name",
    "table.usage": "Usage",
    "table.used": "Used",
    "table.remaining": "Remaining",
    "table.resetTime": "Reset Time",
    "table.status": "Status",
    "exec.recent": "Recent Executions",
    "exec.noRecords": "No records",
    "monitor.status": "Monitor Status",
    "monitor.running": "Running",
    "monitor.nextCollect": "Next Collection",
    "monitor.lastCollect": "Last Collection",
    "monitor.lastError": "Last Error",
    "execTable.time": "Time",
    "execTable.trigger": "Trigger",
    "execTable.duration": "Duration",
    "execTable.result": "Result",
    "execTable.expand": "▾ Expand",
    "execDetail.stdout": "STDOUT:",
    "execDetail.stderr": "STDERR:",
    "execDetail.noOutput": "No output",
    "scheduler.title": "Scheduler Status",
    "scheduler.desc": "Daemon runs every {{interval}} min ({{start}} – {{end}})",
    "scheduler.status": "Status",
    "scheduler.running": "Running",
    "scheduler.stopped": "Stopped",
    "scheduler.btnStop": "⏹ Stop Scheduler",
    "scheduler.btnStart": "▶ Start Scheduler",
    "scheduler.btnRunNow": "⚡ Run Now",
    "scheduler.nextRun": "Next Run",
    "scheduler.lastRun": "Last Run",
    "scheduler.notYet": "Not yet executed",
    "scheduler.history": "Execution History",
    "scheduler.historySub": "Last 100",
    "trends.24h": "24 Hours",
    "trends.7d": "7 Days",
    "trends.30d": "30 Days",
    "trends.noData": "No history data yet. Wait for collection or adjust time range.",
    "trends.usagePct": "Usage %",
    "chart.usageLabel": "Usage %",
    "settings.scheduler": "Scheduler Settings",
    "settings.schedulerSub": "Daily talk time window and trigger interval. Hot-reloaded on next trigger.",
    "settings.startTime": "Start Time (HH:MM)",
    "settings.startTimeHint": "Must be before end time",
    "settings.endTime": "End Time (HH:MM)",
    "settings.interval": "Interval (min)",
    "settings.command": "Command Settings",
    "settings.commandSub": "Command line to execute on each trigger. Args separated by spaces.",
    "settings.executable": "Executable",
    "settings.args": "Args (space-separated)",
    "settings.argsHint": "e.g. --prompt hello",
    "settings.monitor": "Monitor Settings",
    "settings.monitorSub": "Quota auto-collection interval and agy HTTP timeout.",
    "settings.collectInterval": "Collection Interval (min)",
    "settings.httpTimeout": "HTTP Timeout (ms)",
    "settings.web": "Web Service Settings",
    "settings.webSub": "Listen address. Restart process to apply changes.",
    "settings.host": "Host",
    "settings.port": "Port",
    "settings.tray": "System Tray",
    "settings.traySub": "Show an icon in the Windows notification area for quick actions.",
    "settings.trayEnabled": "Enable system tray icon",
    "settings.save": "💾 Save & Hot Reload",
    "settings.reload": "↻ Reload",
    "settings.reset": "Reset Defaults",
    "toast.saved": "Config saved, hot reloaded",
    "toast.saveFailed": "Save failed: {{msg}}",
    "toast.reloaded": "Reloaded",
    "toast.reloadFailed": "Load failed: {{msg}}",
    "toast.resetDone": "Reset to defaults, click save to apply",
    "toast.collecting": "Collecting...",
    "toast.collected": "Collected, {{n}} models recorded",
    "toast.collectFail": "Collect failed: {{msg}}",
    "toast.executing": "Running talk...",
    "toast.executed": "Talk triggered, see Scheduler page",
    "toast.executeFail": "Execution failed: {{msg}}",
    "toast.stopped": "Scheduler stopped",
    "toast.stopFail": "Stop failed: {{msg}}",
    "toast.started": "Scheduler started",
    "toast.startFail": "Start failed: {{msg}}",
    "toast.triggered": "Triggered, talk in progress",
    "logs.title": "Live Logs",
    "logs.sub": "Via SSE, max 500 entries retained",
    "logs.source": "Source:",
    "logs.level": "Level:",
    "logs.all": "All",
    "logs.clear": "Clear",
    "autocontinue.cardTitle": "Auto Continue",
    "autocontinue.enabled": "Enabled",
    "autocontinue.disabled": "Disabled",
    "autocontinue.lastTrigger": "Last Trigger",
    "autocontinue.totalSuccess": "Refilled {{n}} times",
    "autocontinue.target": "Target",
    "autocontinue.notYet": "Not yet triggered",
    "autocontinue.settingsTitle": "Auto Continue Settings",
    "autocontinue.settingsSub": "Automatically send 'continue' when quota refreshes. Checked on each quota collection.",
    "autocontinue.enableLabel": "Enable Auto Continue",
    "autocontinue.conversationId": "Conversation UUID",
    "autocontinue.conversationIdHint": "Copy from agy TUI → /resume → exit prompt",
    "autocontinue.prompt": "Prompt",
    "autocontinue.exhaustedThreshold": "Exhaust Threshold %",
    "autocontinue.exhaustedThresholdHint": "Average remaining below this = exhausted",
    "autocontinue.refreshThreshold": "Refresh Threshold %",
    "autocontinue.refreshThresholdHint": "Average remaining above this = refreshed",
    "autocontinue.logTitle": "Trigger History",
    "autocontinue.logTime": "Time",
    "autocontinue.logResult": "Result",
    "autocontinue.logDuration": "Duration",
    "autocontinue.logBefore": "Before",
    "autocontinue.logAfter": "After",
    "autocontinue.success": "Success",
    "autocontinue.fail": "Fail",
    "autocontinue.saved": "AutoContinue settings saved",
    "autocontinue.saveFailed": "Save failed: {{msg}}",
    "time.soon": "Soon",
    "time.secondsAgo": "{{n}}s ago",
    "time.minutesAgo": "{{n}}m ago",
    "time.hoursAgo": "{{n}}h ago",
    "time.daysAgo": "{{n}}d ago",
    "time.daysHours": "{{n}}d {{m}}h",
    "time.hoursMin": "{{n}}h {{m}}m",
    "time.minSec": "{{n}}m {{m}}s",
    "time.hoursMinSec": "{{n}}h {{m}}m {{s}}s",
    "time.minutesSec": "{{n}}m {{s}}s",
    "time.seconds": "{{n}}s",
    "time.running": "Running {{n}}",
    "lang.label": "Language",
    "lang.zh": "中文",
    "lang.en": "English",
  },
};

let _lang = (() => {
  const stored = localStorage.getItem("agy-lang");
  if (stored) return stored;
  const navLang = (navigator.language || "").toLowerCase();
  if (navLang.startsWith("zh")) return "zh";
  return "en";
})();

function t(key, vars) {
  const dict = LOCALE_DATA[_lang] || LOCALE_DATA["en"];
  let s = dict[key];
  if (s === undefined) {
    s = LOCALE_DATA["en"][key];
    if (s === undefined) s = key;
  }
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp("\\{\\{" + k + "\\}\\}", "g"), String(v));
    }
  }
  return s;
}

function setLang(l) {
  _lang = l;
  localStorage.setItem("agy-lang", l);
  document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
  applyI18n();
}
// ── end i18n ──────────────────────────────────────────

const Store = {
  status: null,
  config: null,
  executionHistory: [],
  latestQuota: null,
  quotaHistory: [],
  models: [],
  logs: [],
  trendsHours: 168,
  logFilter: { source: "all", level: "all" },
  chartInstances: {},
  sse: null,
  countdownTimer: null,
  lastEventAt: Date.now(),
  saving: false,
  autoContinueLogs: [],
  autoContinueState: null,
};

const PageTitles = {
  overview: "page.overview.title",
  scheduler: "page.scheduler.title",
  trends: "page.trends.title",
  settings: "page.settings.title",
  logs: "page.logs.title",
};
const PageSubs = {
  overview: "page.overview.sub",
  scheduler: "page.scheduler.sub",
  trends: "page.trends.sub",
  settings: "page.settings.sub",
  logs: "page.logs.sub",
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
  if (diff < 0) return t("time.soon");
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return t("time.secondsAgo", { n: sec });
  const min = Math.floor(sec / 60);
  if (min < 60) return t("time.minutesAgo", { n: min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t("time.hoursAgo", { n: hr });
  return t("time.daysAgo", { n: Math.floor(hr / 24) });
}
function fmtUptime(ms) {
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hr = Math.floor((sec % 86400) / 3600);
  const min = Math.floor((sec % 3600) / 60);
  if (days > 0) return t("time.daysHours", { n: days, m: hr });
  if (hr > 0) return t("time.hoursMin", { n: hr, m: min });
  return t("time.minSec", { n: min, m: sec % 60 });
}
function fmtCountdown(targetIso) {
  if (!targetIso) return "—";
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return t("time.soon");
  const sec = Math.floor(diff / 1000);
  const hr = Math.floor(sec / 3600);
  const min = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (hr > 0) return t("time.hoursMinSec", { n: hr, m: min, s });
  if (min > 0) return t("time.minutesSec", { n: min, s });
  return t("time.seconds", { n: s });
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
    const data = await api.get("/api/status");
    Store.status = data;
    if (data.autoContinue) Store.autoContinueState = data.autoContinue;
  } catch (e) { console.warn("status refresh failed", e); }
}
async function refreshAutoContinueState() {
  try {
    Store.autoContinueState = await api.get("/api/monitor/auto-continue/status");
  } catch (e) { /* no data yet */ }
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
  const seen = new Set();
  Store.models = [];
  for (const d of data) {
    for (const m of d.models) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        Store.models.push({ id: m.id, display: m.display });
      }
    }
  }
}
async function refreshLogs() {
  Store.logs = await api.get("/api/logs?limit=300");
}
async function refreshAutoContinueLogs() {
  try {
    Store.autoContinueLogs = await api.get("/api/monitor/auto-continue/logs?limit=20");
  } catch (e) { /* no data yet */ }
}

function renderTopbar() {
  const s = Store.status;
  if (!s) return;
  const dPill = $("#daemonPill");
  const mPill = $("#monitorPill");

  dPill.className = "status-pill " + (s.daemon.running ? "running" : "stopped");
  dPill.innerHTML = `<span class="dot ${s.daemon.running ? "dot-run" : "dot-stop"}"></span><span>${t("pill.scheduler", { s: s.daemon.running ? t("pill.schedulerRunning") : t("pill.schedulerStopped") })}</span>`;
  mPill.className = "status-pill " + (s.monitor.running ? "running" : "stopped");
  mPill.innerHTML = `<span class="dot ${s.monitor.running ? "dot-run" : "dot-stop"}"></span><span>${t("pill.monitor", { s: s.monitor.running ? t("pill.monitorRunning") : t("pill.monitorStopped") })}</span>`;

  $("#uptime").textContent = t("time.running", { n: fmtUptime(s.uptime) });
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
      <div class="metric-label">${t("metric.nextTalk")}</div>
      <div class="metric-value" data-cd="daemon-next">—</div>
      <div class="metric-extra" data-cd="daemon-next-abs">—</div>
    </div>
    <div class="metric">
      <div class="metric-label">${t("metric.nextQuota")}</div>
      <div class="metric-value" data-cd="monitor-next">—</div>
      <div class="metric-extra" data-cd="monitor-next-abs">—</div>
    </div>
    <div class="metric ${q?.credits?.limit && (q.credits.used / q.credits.limit) > 0.8 ? 'warn' : 'success'}">
      <div class="metric-label">${t("metric.promptCredits")}</div>
      <div class="metric-value">${q?.credits ? `${q.credits.remaining ?? "?"} <span style="font-size:16px;color:var(--text-3)">/ ${q.credits.limit ?? "?"}</span>` : "—"}</div>
      <div class="metric-extra">${q?.credits?.used != null ? t("metric.used", { n: q.credits.used }) : t("metric.noData")} · ${escapeHtml(q?.planName || q?.email || "—")}</div>
    </div>
    <div class="metric ${q?.flowCredits?.limit && q.flowCredits.limit > 0 && (q.flowCredits.used / q.flowCredits.limit) > 0.8 ? 'warn' : 'success'}">
      <div class="metric-label">${t("metric.flowCredits")}</div>
      <div class="metric-value">${q?.flowCredits?.limit ? `${q.flowCredits.remaining ?? "?"} <span style="font-size:16px;color:var(--text-3)">/ ${q.flowCredits.limit ?? "?"}</span>` : "—"}</div>
      <div class="metric-extra">${q?.flowCredits?.used != null ? t("metric.used", { n: q.flowCredits.used }) : t("metric.noData")}</div>
    </div>
  </div>`);

  if (q?.googleOneAiCredits != null || q?.name) {
    html.push(`<div class="grid-4" style="margin-bottom:16px">
      <div class="metric">
        <div class="metric-label">${t("metric.lastTalk")}</div>
        <div class="metric-value" style="font-size:18px">${s?.daemon?.lastExecution ? fmtAgo(s.daemon.lastExecution.runAt) : "—"}</div>
        <div class="metric-extra">${s?.daemon?.lastExecution ? (s.daemon.lastExecution.success ? '<span class="badge badge-success">' + t("badge.success") + '</span>' : '<span class="badge badge-danger">' + t("badge.fail") + '</span>') + (s.daemon.lastExecution.triggeredBy === "manual" ? " " + t("badge.manual") : " " + t("badge.auto")) : t("metric.notYet")}</div>
      </div>
      ${q?.googleOneAiCredits != null ? `<div class="metric"><div class="metric-label">${t("metric.googleOneAi")}</div><div class="metric-value">${q.googleOneAiCredits}</div></div>` : ""}
      ${q?.name ? `<div class="metric"><div class="metric-label">${t("metric.accountName")}</div><div class="metric-value" style="font-size:18px">${escapeHtml(q.name)}</div></div>` : ""}
    </div>`);
  } else {
    html.push(`<div class="grid-4">
      <div class="metric">
        <div class="metric-label">${t("metric.lastTalk")}</div>
        <div class="metric-value" style="font-size:18px">${s?.daemon?.lastExecution ? fmtAgo(s.daemon.lastExecution.runAt) : "—"}</div>
        <div class="metric-extra">${s?.daemon?.lastExecution ? (s.daemon.lastExecution.success ? '<span class="badge badge-success">' + t("badge.success") + '</span>' : '<span class="badge badge-danger">' + t("badge.fail") + '</span>') + (s.daemon.lastExecution.triggeredBy === "manual" ? " " + t("badge.manual") : " " + t("badge.auto")) : t("metric.notYet")}</div>
      </div>
    </div>`);
  }

  html.push(`<div class="action-bar" style="margin-bottom: 16px">
    <button class="btn btn-primary" id="quickCollect">${t("btn.collectNow")}</button>
    <button class="btn btn-success" id="quickRun">${t("btn.runNow")}</button>
    <span style="color:var(--text-3);font-size:12px">${t("btn.shortcutHint")}</span>
  </div>`);

  if (q && q.models && q.models.length > 0) {
    html.push(`<div class="card">
      <div class="card-title">${t("quota.latestTitle")} <span class="card-title-sub">${q.time ? fmtTime(q.time, true) : ""} · ${t("metric.account", { n: q.email || "—" })}</span></div>
      <table class="model-table">
        <thead><tr>
          <th>${t("table.model")}</th><th>${t("table.displayName")}</th><th style="width: 40%">${t("table.usage")}</th><th class="num">${t("table.used")}</th><th class="num">${t("table.remaining")}</th><th>${t("table.resetTime")}</th><th>${t("table.status")}</th>
        </tr></thead>
        <tbody>
        ${q.models.map((m) => {
          const pct = m.usedPct ?? 0;
          return `<tr>
            <td><span class="model-id">${escapeHtml(m.id)}</span></td>
            <td class="model-name">${escapeHtml(m.display || "—")}</td>
            <td><div class="progress-cell"><div class="bar-wrap"><div class="bar-remaining" style="width:${m.remainingPct != null ? m.remainingPct.toFixed(1) : 0}%"></div><div class="bar-fill ${progressClass(pct)}" style="width:${pct.toFixed(1)}%"></div></div><span class="progress-num">${pct.toFixed(1)}%</span></div></td>
            <td class="num">${pct.toFixed(1)}%</td>
            <td class="num">${m.remainingPct != null ? m.remainingPct.toFixed(1) + "%" : "—"}</td>
            <td>${m.resetTime ? fmtTime(m.resetTime) : "—"}</td>
            <td>${m.exhausted ? '<span class="badge badge-danger">' + t("badge.exhausted") + '</span>' : '<span class="badge badge-success">' + t("badge.normal") + '</span>'}</td>
          </tr>`;
        }).join("")}
        </tbody>
      </table>
    </div>`);
  } else {
    html.push(`<div class="card"><div class="empty">${t("quota.noData")}</div></div>`);
  }

  html.push(`<div class="grid-2">
    <div class="card">
      <div class="card-title">${t("exec.recent")}</div>
      ${Store.executionHistory.length === 0 ? '<div class="empty">' + t("exec.noRecords") + '</div>' : renderExecutionRows(Store.executionHistory.slice(0, 5), true)}
    </div>
    <div class="card">
      <div class="card-title">${t("monitor.status")}</div>
      <table>
        <tr><td style="color:var(--text-3)">${t("monitor.running")}</td><td>${s?.monitor?.running ? '<span class="badge badge-success">' + t("badge.yes") + '</span>' : '<span class="badge badge-neutral">' + t("badge.no") + '</span>'}</td></tr>
        <tr><td style="color:var(--text-3)">${t("monitor.nextCollect")}</td><td><span data-cd="monitor-next">—</span> (${s?.monitor?.nextCollectAt ? fmtTime(s.monitor.nextCollectAt) : "—"})</td></tr>
        <tr><td style="color:var(--text-3)">${t("monitor.lastCollect")}</td><td>${s?.monitor?.lastCollectionAt ? fmtAgo(s.monitor.lastCollectionAt) : "—"}</td></tr>
        <tr><td style="color:var(--text-3)">${t("monitor.lastError")}</td><td>${s?.monitor?.lastError ? `<span class="badge badge-danger">${escapeHtml(s.monitor.lastError)}</span>` : "—"}</td></tr>
      </table>
    </div>
  </div>`);

  const ac = s?.autoContinue || Store.autoContinueState || null;
  const acEnabled = Store.config?.autoContinue?.enabled;
  html.push(`<div class="card">
    <div class="card-title">${t("autocontinue.cardTitle")} <span class="card-title-sub">${acEnabled ? '<span class="badge badge-success">' + t("autocontinue.enabled") + '</span>' : '<span class="badge badge-neutral">' + t("autocontinue.disabled") + '</span>'}</span></div>
    <div class="grid-2" style="margin-bottom:0">
      <div>
        <div class="metric-label">${t("autocontinue.lastTrigger")}</div>
        <div style="margin-top:6px">${ac?.lastTrigger ? fmtAgo(ac.lastTrigger.run_at || ac.lastTrigger.runAt) + ' ' + (ac.lastTrigger.success ? '<span class="badge badge-success">' + t("autocontinue.success") + '</span>' : '<span class="badge badge-danger">' + t("autocontinue.fail") + '</span>') : '<span class="badge badge-neutral">' + t("autocontinue.notYet") + '</span>'}</div>
        <div class="metric-extra">${ac?.lastAvgUsed != null ? ac.lastAvgUsed.toFixed(1) + '% → ' + (ac?.lastAvgRemaining != null ? ac.lastAvgRemaining.toFixed(1) + '%' : '—') : ''}</div>
      </div>
      <div>
        <div class="metric-label">${t("autocontinue.target")}</div>
        <div style="margin-top:6px;font-family:monospace;font-size:12px;color:var(--text-2)">${Store.config?.autoContinue?.conversationId ? escapeHtml(Store.config.autoContinue.conversationId.substring(0, 8) + "…") : "—"}</div>
      </div>
    </div>
  </div>`);

  $("#content").innerHTML = html.join("");

  $("#quickCollect").onclick = async () => {
    try {
      toast(t("toast.collecting"), "info");
      const r = await api.send("/api/monitor/collect-now", "POST");
      toast(t("toast.collected", { n: r.models }), "success");
      await refreshLatestQuota();
      await refreshQuotaHistory(Store.trendsHours);
      await refreshStatus();
      renderOverview();
    } catch (e) { toast(t("toast.collectFail", { msg: e.message }), "error"); }
  };
  $("#quickRun").onclick = async () => {
    try {
      toast(t("toast.executing"), "info");
      await api.send("/api/scheduler/run-now", "POST");
      toast(t("toast.executed"), "success");
    } catch (e) { toast(t("toast.executeFail", { msg: e.message }), "error"); }
  };
}

function renderExecutionRows(rows, withLimit = false) {
  const limited = withLimit ? rows.slice(0, 5) : rows;
  return `<table>
    <thead><tr>
      <th>${t("execTable.time")}</th><th>${t("execTable.trigger")}</th><th class="num">${t("execTable.duration")}</th><th>${t("execTable.result")}</th><th></th>
    </tr></thead>
    <tbody>
    ${limited.map((r) => `<tr class="execution-row" data-id="${r.id}">
      <td>${fmtTime(r.runAt, true)}</td>
      <td>${r.triggeredBy === "manual" ? '<span class="badge badge-info">' + t("badge.manual") + '</span>' : '<span class="badge badge-neutral">' + t("badge.auto") + '</span>'}</td>
      <td class="num">${r.durationMs != null ? r.durationMs + ' ms' : '—'}</td>
      <td><span class="badge ${badgeClassForStatus(r.success)}">${r.success ? t("badge.success") : t("badge.fail")}</span></td>
      <td><span style="color:var(--text-3);font-size:12px">${t("execTable.expand")}</span></td>
    </tr>
    <tr class="execution-detail-row" data-detail-id="${r.id}"><td colspan="5">${renderExecutionDetail(r)}</td></tr>`).join("")}
    </tbody>
  </table>`;
}

function renderExecutionDetail(r) {
  const stdout = r.stdout ? `<div class="stdout">${t("execDetail.stdout")}\n${escapeHtml(r.stdout)}</div>` : "";
  const stderr = r.stderr ? `<div class="stderr">${t("execDetail.stderr")}\n${escapeHtml(r.stderr)}</div>` : "";
  if (!stdout && !stderr) return `<div class="execution-detail show">${t("execDetail.noOutput")}</div>`;
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
    <div class="card-title">${t("scheduler.title")} <span class="card-title-sub">${t("scheduler.desc", { interval: Store.config?.scheduler?.intervalMinutes ?? "—", start: Store.config?.scheduler?.startTime ?? "—", end: Store.config?.scheduler?.endTime ?? "—" })}</span></div>
    <div class="grid-3">
      <div>
        <div class="metric-label">${t("scheduler.status")}</div>
        <div style="margin-top: 6px">${s?.daemon?.running ? '<span class="badge badge-success">' + t("scheduler.running") + '</span>' : '<span class="badge badge-neutral">' + t("scheduler.stopped") + '</span>'}</div>
        <div class="action-bar" style="margin-top: 12px">
          ${s?.daemon?.running
            ? '<button class="btn btn-danger btn-sm" id="btnStopDaemon">' + t("scheduler.btnStop") + '</button>'
            : '<button class="btn btn-primary btn-sm" id="btnStartDaemon">' + t("scheduler.btnStart") + '</button>'}
          <button class="btn btn-success btn-sm" id="btnRunNow">${t("scheduler.btnRunNow")}</button>
        </div>
      </div>
      <div>
        <div class="metric-label">${t("scheduler.nextRun")}</div>
        <div class="metric-value" style="font-size: 22px" data-cd="daemon-next">—</div>
        <div class="metric-extra" data-cd="daemon-next-abs">—</div>
      </div>
      <div>
        <div class="metric-label">${t("scheduler.lastRun")}</div>
        ${s?.daemon?.lastExecution ? `
          <div style="margin-top: 6px">${fmtTime(s.daemon.lastExecution.runAt, true)} (${fmtAgo(s.daemon.lastExecution.runAt)})</div>
          <div style="margin-top: 4px"><span class="badge ${badgeClassForStatus(s.daemon.lastExecution.success)}">${s.daemon.lastExecution.success ? t("badge.success") : t("badge.fail")}</span>
          ${s.daemon.lastExecution.triggeredBy === 'manual' ? '<span class="badge badge-info" style="margin-left:4px">' + t("badge.manual") + '</span>' : '<span class="badge badge-neutral" style="margin-left:4px">' + t("badge.auto") + '</span>'}
          ${s.daemon.lastExecution.durationMs != null ? `<span style="margin-left:6px;color:var(--text-3);font-size:12px">${s.daemon.lastExecution.durationMs} ms</span>` : ''}
          </div>
        ` : '<div class="metric-extra" style="margin-top:6px">' + t("scheduler.notYet") + '</div>'}
      </div>
    </div>
  </div>`);

  html.push(`<div class="card">
    <div class="card-title">${t("scheduler.history")} <span class="card-title-sub">${t("scheduler.historySub")}</span></div>
    ${Store.executionHistory.length === 0 ? '<div class="empty">' + t("exec.noRecords") + '</div>' : renderExecutionRows(Store.executionHistory)}
  </div>`);

  $("#content").innerHTML = html.join("");

  const stopBtn = $("#btnStopDaemon");
  if (stopBtn) stopBtn.onclick = async () => {
    try { await api.send("/api/scheduler/stop", "POST"); await refreshStatus(); renderScheduler(); toast(t("toast.stopped"), "success"); }
    catch (e) { toast(t("toast.stopFail", { msg: e.message }), "error"); }
  };
  const startBtn = $("#btnStartDaemon");
  if (startBtn) startBtn.onclick = async () => {
    try { await api.send("/api/scheduler/start", "POST"); await refreshStatus(); renderScheduler(); toast(t("toast.started"), "success"); }
    catch (e) { toast(t("toast.startFail", { msg: e.message }), "error"); }
  };
  $("#btnRunNow").onclick = async () => {
    try { toast(t("toast.executing"), "info"); await api.send("/api/scheduler/run-now", "POST"); await refreshStatus(); await refreshExecutionHistory(); renderScheduler(); toast(t("toast.triggered"), "success"); }
    catch (e) { toast(t("toast.executeFail", { msg: e.message }), "error"); }
  };
  bindExecutionRowToggles();
}

async function renderTrends() {
  await refreshQuotaHistory(Store.trendsHours);
  const html = [];
  html.push(`<div class="tabs-row">
    <div class="tab ${Store.trendsHours === 24 ? "active" : ""}" data-hours="24">${t("trends.24h")}</div>
    <div class="tab ${Store.trendsHours === 168 ? "active" : ""}" data-hours="168">${t("trends.7d")}</div>
    <div class="tab ${Store.trendsHours === 720 ? "active" : ""}" data-hours="720">${t("trends.30d")}</div>
  </div>`);

  if (Store.quotaHistory.length === 0) {
    html.push(`<div class="card"><div class="empty">${t("trends.noData")}</div></div>`);
  } else {
    for (const m of Store.models) {
      const label = m.display || m.id;
      html.push(`<div class="card">
        <div class="card-title">${escapeHtml(label)} <span class="card-title-sub">${t("trends.usagePct")}</span></div>
        <div class="chart-container"><canvas data-model="${escapeAttr(m.id)}"></canvas></div>
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
          label: t("chart.usageLabel"),
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
    <div class="card-title">${t("settings.scheduler")}</div>
    <div class="fieldset-sub">${t("settings.schedulerSub")}</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">${t("settings.startTime")}</label>
        <input class="form-input" type="text" id="cfg-startTime" value="${escapeAttr(c.scheduler.startTime)}">
        <div class="form-hint">${t("settings.startTimeHint")}</div>
      </div>
      <div class="form-group">
        <label class="form-label">${t("settings.endTime")}</label>
        <input class="form-input" type="text" id="cfg-endTime" value="${escapeAttr(c.scheduler.endTime)}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">${t("settings.interval")}</label>
      <input class="form-input" type="number" id="cfg-intervalMinutes" value="${c.scheduler.intervalMinutes}" min="1">
    </div>
  </div>`);

  html.push(`<div class="card">
    <div class="card-title">${t("settings.command")}</div>
    <div class="fieldset-sub">${t("settings.commandSub")}</div>
    <div class="form-group">
      <label class="form-label">${t("settings.executable")}</label>
      <input class="form-input" type="text" id="cfg-executable" value="${escapeAttr(c.command.executable)}">
    </div>
    <div class="form-group">
      <label class="form-label">${t("settings.args")}</label>
      <input class="form-input" type="text" id="cfg-args" value="${escapeAttr(c.command.args.join(' '))}">
      <div class="form-hint">${t("settings.argsHint")}</div>
    </div>
  </div>`);

  html.push(`<div class="card">
    <div class="card-title">${t("settings.monitor")}</div>
    <div class="fieldset-sub">${t("settings.monitorSub")}</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">${t("settings.collectInterval")}</label>
        <input class="form-input" type="number" id="cfg-monInterval" value="${c.monitor.intervalMinutes}" min="1">
      </div>
      <div class="form-group">
        <label class="form-label">${t("settings.httpTimeout")}</label>
        <input class="form-input" type="number" id="cfg-agyTimeout" value="${c.monitor.agyTimeoutMs}" min="1000">
      </div>
    </div>
  </div>`);

  html.push(`<div class="card">
    <div class="card-title">${t("settings.web")}</div>
    <div class="fieldset-sub">${t("settings.webSub")}</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">${t("settings.host")}</label>
        <input class="form-input" type="text" id="cfg-host" value="${escapeAttr(c.web.host)}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">${t("settings.port")}</label>
        <input class="form-input" type="number" id="cfg-port" value="${c.web.port}" readonly>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">${t("settings.tray")}</div>
    <div class="fieldset-sub">${t("settings.traySub")}</div>
    <div class="form-row">
      <label class="form-checkbox">
        <input type="checkbox" id="cfg-trayEnabled" ${c.web.trayEnabled ? "checked" : ""}>
        <span class="checkbox-label">${t("settings.trayEnabled")}</span>
      </label>
    </div>
  </div>`);

  const ac = Store.config?.autoContinue;
  html.push(`<div class="card">
    <div class="card-title">${t("autocontinue.settingsTitle")}</div>
    <div class="fieldset-sub">${t("autocontinue.settingsSub")}</div>
    <div class="form-group">
      <label class="form-label" style="display:flex;align-items:center;gap:8px">
        <input type="checkbox" id="cfg-ac-enabled" ${ac?.enabled ? 'checked' : ''} style="width:16px;height:16px">
        ${t("autocontinue.enableLabel")}
      </label>
    </div>
    <div class="form-group">
      <label class="form-label">${t("autocontinue.conversationId")}</label>
      <input class="form-input" type="text" id="cfg-ac-conversationId" value="${escapeAttr(ac?.conversationId || '')}" placeholder="0891d29c-6b8f-40d0-9857-408586519998">
      <div class="form-hint">${t("autocontinue.conversationIdHint")}</div>
    </div>
    <div class="form-group">
      <label class="form-label">${t("autocontinue.prompt")}</label>
      <input class="form-input" type="text" id="cfg-ac-prompt" value="${escapeAttr(ac?.prompt || '继续')}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">${t("autocontinue.exhaustedThreshold")}</label>
        <input class="form-input" type="number" id="cfg-ac-exhausted" value="${ac?.exhaustedThreshold ?? 20}" min="0" max="100">
        <div class="form-hint">${t("autocontinue.exhaustedThresholdHint")}</div>
      </div>
      <div class="form-group">
        <label class="form-label">${t("autocontinue.refreshThreshold")}</label>
        <input class="form-input" type="number" id="cfg-ac-refresh" value="${ac?.refreshThreshold ?? 50}" min="0" max="100">
        <div class="form-hint">${t("autocontinue.refreshThresholdHint")}</div>
      </div>
    </div>
  </div>`);

  if (Store.autoContinueLogs.length > 0) {
    html.push(`<div class="card">
      <div class="card-title">${t("autocontinue.logTitle")} <span class="card-title-sub">${t("scheduler.historySub")}</span></div>
      <table>
        <thead><tr>
          <th>${t("autocontinue.logTime")}</th><th>${t("autocontinue.logResult")}</th><th class="num">${t("autocontinue.logDuration")}</th><th class="num">${t("autocontinue.logBefore")}</th><th class="num">${t("autocontinue.logAfter")}</th>
        </tr></thead>
        <tbody>
        ${Store.autoContinueLogs.map((r) => `<tr>
          <td>${fmtTime(r.run_at, true)}</td>
          <td><span class="badge ${r.success ? 'badge-success' : 'badge-danger'}">${r.success ? t("autocontinue.success") : t("autocontinue.fail")}</span></td>
          <td class="num">${r.duration_ms != null ? r.duration_ms + ' ms' : '—'}</td>
          <td class="num">${r.quota_used_before != null ? r.quota_used_before.toFixed(1) + '%' : '—'}</td>
          <td class="num">${r.quota_used_after != null ? r.quota_used_after.toFixed(1) + '%' : '—'}</td>
        </tr>`).join("")}
        </tbody>
      </table>
    </div>`);
  }

  html.push(`<div class="action-bar" style="margin-bottom: 30px">
    <button class="btn btn-primary" id="btnSaveConfig">${t("settings.save")}</button>
    <button class="btn" id="btnReloadConfig">${t("settings.reload")}</button>
    <button class="btn btn-ghost" id="btnResetConfig">${t("settings.reset")}</button>
  </div>`);

  $("#content").innerHTML = html.join("");

  $("#btnSaveConfig").onclick = async () => {
    if (Store.saving) return;
    Store.saving = true;
    try {
      const args = $("#cfg-args").value.trim().length === 0 ? [] : $("#cfg-args").value.trim().split(/\s+/);
      const trayEnabled = $("#cfg-trayEnabled")?.checked ?? false;
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
        web: { trayEnabled },
        autoContinue: {
          enabled: $("#cfg-ac-enabled").checked,
          conversationId: $("#cfg-ac-conversationId").value.trim(),
          prompt: $("#cfg-ac-prompt").value.trim() || "继续",
          exhaustedThreshold: parseInt($("#cfg-ac-exhausted").value, 10) || 20,
          refreshThreshold: parseInt($("#cfg-ac-refresh").value, 10) || 50,
        },
      };
      Store.config = await api.send("/api/config", "PUT", payload);
      toast(t("toast.saved"), "success");
    } catch (e) {
      toast(t("toast.saveFailed", { msg: e.message }), "error");
    } finally {
      Store.saving = false;
    }
  };
  $("#btnReloadConfig").onclick = async () => {
    try { await refreshConfig(); renderSettings(); toast(t("toast.reloaded"), "success"); }
    catch (e) { toast(t("toast.reloadFailed", { msg: e.message }), "error"); }
  };
  $("#btnResetConfig").onclick = () => {
    $("#cfg-startTime").value = "08:00";
    $("#cfg-endTime").value = "23:30";
    $("#cfg-intervalMinutes").value = "30";
    $("#cfg-executable").value = "agy";
    $("#cfg-args").value = "--prompt 你好";
    $("#cfg-monInterval").value = "10";
    $("#cfg-agyTimeout").value = "10000";
    const tb = $("#cfg-trayEnabled");
    if (tb) tb.checked = false;
    $("#cfg-ac-enabled").checked = false;
    $("#cfg-ac-conversationId").value = "";
    $("#cfg-ac-prompt").value = "继续";
    $("#cfg-ac-exhausted").value = "20";
    $("#cfg-ac-refresh").value = "50";
    toast(t("toast.resetDone"), "info");
  };
}

function renderLogs() {
  const html = [];
  html.push(`<div class="card">
    <div class="card-title">${t("logs.title")} <span class="card-title-sub">${t("logs.sub")}</span></div>
    <div class="action-bar" style="margin-bottom: 12px">
      <label style="font-size: 12px; color: var(--text-3)">${t("logs.source")}</label>
      <select class="form-select" id="logSrc" style="width: 120px">
        <option value="all">${t("logs.all")}</option>
        <option value="daemon">daemon</option>
        <option value="monitor">monitor</option>
        <option value="web">web</option>
        <option value="system">system</option>
      </select>
      <label style="font-size: 12px; color: var(--text-3); margin-left: 8px">${t("logs.level")}</label>
      <select class="form-select" id="logLvl" style="width: 100px">
        <option value="all">${t("logs.all")}</option>
        <option value="error">error</option>
        <option value="warn">warn</option>
        <option value="info">info</option>
      </select>
      <button class="btn btn-sm" id="logClear" style="margin-left: auto">${t("logs.clear")}</button>
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

function applyI18n() {
  $$(".nav-item").forEach((el) => {
    const r = el.getAttribute("data-route");
    if (r && PageTitles[r]) {
      el.querySelector("span:last-child").textContent = t(PageTitles[r]);
    }
  });
  const brandTitle = $("#brandTitle");
  const brandSub = $("#brandSub");
  if (brandTitle) brandTitle.textContent = t("brand.title");
  if (brandSub) brandSub.textContent = t("brand.sub");
  const connStatus = $("#connStatus .dot + span");
  if (connStatus && !connStatus.textContent.includes("重连") && !connStatus.textContent.includes("reconnect")) {
    connStatus.textContent = t("conn.connected");
  }
  const langBtn = $("#langToggle");
  if (langBtn) langBtn.textContent = _lang === "zh" ? t("lang.en") : t("lang.zh");
  if (Store.status) renderTopbar();
  const toggle = $("#sidebarToggle");
  if (toggle) {
    const collapsed = $("#app").classList.contains("sidebar-collapsed");
    toggle.title = collapsed ? (_lang === "zh" ? "展开侧边栏" : "Expand sidebar") : (_lang === "zh" ? "收起侧边栏" : "Collapse sidebar");
  }
  const cur = location.hash.replace("#", "") || "overview";
  const titleEl = $("#pageTitle");
  const subEl = $("#pageSub");
  if (titleEl && PageTitles[cur]) titleEl.textContent = t(PageTitles[cur]);
  if (subEl && PageSubs[cur]) subEl.textContent = t(PageSubs[cur]);
}

function setRoute(route) {
  if (!PageTitles[route]) route = "overview";
  $$(".nav-item").forEach((el) => el.classList.toggle("active", el.getAttribute("data-route") === route));
  $("#pageTitle").textContent = t(PageTitles[route]);
  $("#pageSub").textContent = t(PageSubs[route]);
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
    conn.innerHTML = '<span class="dot dot-on"></span><span>' + t("conn.connected") + '</span>';
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
      refreshQuotaHistory(Store.trendsHours);
    } else if (d.type === "tick" || d.type === "start" || d.type === "stop" || d.type === "failed") {
      if (location.hash === "#overview") setRoute("overview");
    }
    renderTopbar();
  }));
  es.addEventListener("autocontinue", onEvent((d) => {
    refreshStatus();
    refreshAutoContinueLogs();
    if (location.hash === "#overview" || location.hash === "#settings") {
      setRoute(location.hash.replace("#", "") || "overview");
    }
  }));
  es.addEventListener("log", onEvent((entry) => {
    Store.logs.push(entry);
    if (Store.logs.length > 500) Store.logs.splice(0, Store.logs.length - 500);
    if (location.hash === "#logs") redrawLogs();
  }));
  es.onerror = () => {
    conn.innerHTML = '<span class="dot dot-warn"></span><span>' + t("conn.reconnect") + '</span>';
  };
  es.onopen = () => {
    conn.innerHTML = '<span class="dot dot-on"></span><span>' + t("conn.connected") + '</span>';
  };
}

async function boot() {
  Store.countdownTimer = setInterval(updateCountdowns, 1000);
  await refreshConfig();
  await refreshStatus();
  await refreshLatestQuota();
  await refreshExecutionHistory();
  await refreshLogs();
  await refreshAutoContinueLogs();
  await refreshAutoContinueState();
  renderTopbar();
  applyI18n();
  $("#langToggle").onclick = () => {
    setLang(_lang === "zh" ? "en" : "zh");
    const cur = location.hash.replace("#", "") || "overview";
    setRoute(cur);
  };
  const initial = location.hash.replace("#", "") || "overview";
  setRoute(initial);

  // sidebar toggle
  const sidebarToggle = $("#sidebarToggle");
  const appEl = $("#app");
  const storedSidebar = localStorage.getItem("agy-sidebar");
  if (storedSidebar === "collapsed") appEl.classList.add("sidebar-collapsed");
  if (sidebarToggle) {
    sidebarToggle.title = _lang === "zh" ? "收起侧边栏" : "Collapse sidebar";
    sidebarToggle.onclick = () => {
      appEl.classList.toggle("sidebar-collapsed");
      const collapsed = appEl.classList.contains("sidebar-collapsed");
      sidebarToggle.innerHTML = collapsed ? "▶" : "◀";
      sidebarToggle.title = collapsed
        ? (_lang === "zh" ? "展开侧边栏" : "Expand sidebar")
        : (_lang === "zh" ? "收起侧边栏" : "Collapse sidebar");
      localStorage.setItem("agy-sidebar", collapsed ? "collapsed" : "");
    };
  }

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
