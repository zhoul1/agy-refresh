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
    "common.loading": "加载中…",
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
    "table.tag": "标签",
    "table.resetTime": "重置时间",
    "table.resetCountdown": "倒计时",
    "table.status": "状态",
    "table.used": "已消耗",
    "table.remaining": "未消耗",
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
    "scheduler.collect": "额度采集",
    "scheduler.collectSub": "每 {{interval}} 分钟自动采集",
    "scheduler.nextCollect": "下次采集",
    "scheduler.lastCollect": "上次采集",
    "scheduler.tabExec": "执行历史",
    "scheduler.tabCollect": "采集历史",
    "collect.time": "时间",
    "collect.account": "账号",
    "collect.modelCount": "模型数",
    "collect.promptCredits": "Prompt Credits",
    "collect.flowCredits": "Flow Credits",
    "collect.noRecords": "暂无采集记录",
    "collect.status": "状态",
    "collect.failed": "失败",
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
    "settings.retries": "最大重试次数",
    "settings.retriesHint": "执行失败后重试次数（默认 3）",
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
    "settings.imageGenMethod": "出图 RPC 方法名",
    "settings.imageGenMethodHint": "本地 AGy 语言服务器的出图方法，默认 GenerateImage。若返回“无法识别”，在此改为正确方法名",
    "settings.imageGenModel": "出图模型",
    "settings.imageGenPrompt": "出图提示词",
    "settings.imageGenEndpoint": "自定义出图端点 URL",
    "settings.imageGenEndpointHint": "留空则调用本地 AGy 服务；填 cloudcode-pa 等直连地址（需 Bearer Token）",
    "settings.imageGenAuthToken": "Bearer Token（直连时可选）",
    "settings.imageGenTimeout": "超时 (毫秒)",
    "settings.share": "分享连接",
    "settings.shareSub": "局域网内的其他设备可通过此地址访问控制中心",
    "settings.shareUrl": "局域网地址",
    "settings.shareCopy": "复制",
    "settings.shareHint": "确保其他设备与本机在同一局域网",
    "settings.shareCopied": "已复制到剪贴板",
    "settings.shareCopiedToast": "链接已复制",
    "settings.shareFailed": "复制失败",
    "settings.shareLoading": "检测中...",
    "settings.shareUnavailable": "无法检测局域网地址",
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
    "imagegen.title": "图像生成额度",
    "imagegen.sub": "手动触发出图，根据 429 返回记录限流状态与重置倒计时",
    "imagegen.noData": "尚无图像生成额度记录。触发一次出图后，把返回内容粘贴上报即可。",
    "imagegen.reportBtn": "📷 上报本次出图结果",
    "imagegen.activeExhaust": "限流中",
    "imagegen.model": "模型",
    "imagegen.status": "状态",
    "imagegen.exhausted": "已耗尽 (429)",
    "imagegen.normal": "正常",
    "imagegen.resetCountdown": "重置倒计时",
    "imagegen.resetTime": "重置时间",
    "imagegen.observedAt": "记录时间",
    "imagegen.history": "上报历史",
    "imagegen.formTitle": "上报图像生成结果",
    "imagegen.formHint": "粘贴出图接口返回的原始内容：限流时为 429 错误 JSON；成功时填 {\"ok\":true,\"model\":\"gemini-3.1-flash-image\"}",
    "imagegen.placeholder": "在此粘贴返回的 JSON ...",
    "imagegen.submit": "提交上报",
    "imagegen.cancel": "取消",
    "imagegen.toastCollected": "已记录：{{model}} {{s}}",
    "imagegen.toastFail": "上报失败：{{msg}}",
    "imagegen.triggerBtn": "📷 立即出图测试额度",
    "imagegen.triggering": "正在出图...",
    "imagegen.manualBtn": "手动上报",
    "imagegen.triggerOk": "出图成功：{{model}} 正常",
    "imagegen.triggerFail": "出图触发失败：{{msg}}",
    "logs.title": "实时日志",
    "logs.sub": "通过 SSE 推送，最多保留 500 条",
    "logs.source": "来源:",
    "logs.level": "级别:",
    "logs.all": "全部",
    "logs.clear": "清空显示",

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
    "common.loading": "Loading…",
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
    "table.tag": "Tag",
    "table.resetTime": "Reset Time",
    "table.resetCountdown": "Countdown",
    "table.status": "Status",
    "table.used": "Used",
    "table.remaining": "Remaining",
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
    "scheduler.collect": "Quota Collection",
    "scheduler.collectSub": "Auto every {{interval}} min",
    "scheduler.nextCollect": "Next Collection",
    "scheduler.lastCollect": "Last Collection",
    "scheduler.tabExec": "Execution History",
    "scheduler.tabCollect": "Collection History",
    "collect.time": "Time",
    "collect.account": "Account",
    "collect.modelCount": "Models",
    "collect.promptCredits": "Prompt Credits",
    "collect.flowCredits": "Flow Credits",
    "collect.noRecords": "No collection records yet",
    "collect.status": "Status",
    "collect.failed": "Failed",
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
    "settings.retries": "Max Retries",
    "settings.retriesHint": "Retry count on failure (default 3)",
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
    "settings.imageGenMethod": "Image-gen RPC Method",
    "settings.imageGenMethodHint": "Image-gen method on the local AGy language server. Default GenerateImage. Change here if result is 'unrecognized'",
    "settings.imageGenModel": "Image-gen Model",
    "settings.imageGenPrompt": "Image-gen Prompt",
    "settings.imageGenEndpoint": "Custom Image-gen Endpoint URL",
    "settings.imageGenEndpointHint": "Leave empty to call local AGy; set to a direct URL like cloudcode-pa (needs Bearer Token)",
    "settings.imageGenAuthToken": "Bearer Token (for direct endpoint)",
    "settings.imageGenTimeout": "Timeout (ms)",
    "settings.share": "Share Link",
    "settings.shareSub": "Other devices on the LAN can access the dashboard via this URL",
    "settings.shareUrl": "LAN URL",
    "settings.shareCopy": "Copy",
    "settings.shareHint": "Make sure other devices are on the same network",
    "settings.shareCopied": "Copied to clipboard",
    "settings.shareCopiedToast": "Link copied",
    "settings.shareFailed": "Copy failed",
    "settings.shareLoading": "Detecting...",
    "settings.shareUnavailable": "Unable to detect LAN address",
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
    "imagegen.title": "Image Gen Quota",
    "imagegen.sub": "Trigger an image generation; report the 429 response to track limits & reset countdown",
    "imagegen.noData": "No image-gen quota records yet. After a generation attempt, paste the returned content to report it.",
    "imagegen.reportBtn": "📷 Report This Generation",
    "imagegen.activeExhaust": "Rate Limited",
    "imagegen.model": "Model",
    "imagegen.status": "Status",
    "imagegen.exhausted": "Exhausted (429)",
    "imagegen.normal": "Normal",
    "imagegen.resetCountdown": "Reset Countdown",
    "imagegen.resetTime": "Reset Time",
    "imagegen.observedAt": "Reported At",
    "imagegen.history": "Report History",
    "imagegen.formTitle": "Report Image Generation Result",
    "imagegen.formHint": "Paste the raw response: 429 error JSON when rate-limited; or {\"ok\":true,\"model\":\"gemini-3.1-flash-image\"} on success",
    "imagegen.placeholder": "Paste the returned JSON here ...",
    "imagegen.submit": "Submit Report",
    "imagegen.cancel": "Cancel",
    "imagegen.toastCollected": "Recorded: {{model}} {{s}}",
    "imagegen.toastFail": "Report failed: {{msg}}",
    "imagegen.triggerBtn": "📷 Test Quota by Generating",
    "imagegen.triggering": "Generating...",
    "imagegen.manualBtn": "Manual Report",
    "imagegen.triggerOk": "Generated OK: {{model}} normal",
    "imagegen.triggerFail": "Generation failed: {{msg}}",
    "logs.title": "Live Logs",
    "logs.sub": "Via SSE, max 500 entries retained",
    "logs.source": "Source:",
    "logs.level": "Level:",
    "logs.all": "All",
    "logs.clear": "Clear",

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
  collectionHistory: [],
  imageGenLatest: [],
  imageGenHistory: [],
  models: [],
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
function badgeClassForStatus(success, stderr = "") {
  if (stderr === "执行中...") {
    return "badge-info";
  }
  return success ? "badge-success" : "badge-danger";
}

function getStatusText(success, stderr = "") {
  if (stderr === "执行中...") {
    return "执行中...";
  }
  return success ? t("badge.success") : t("badge.fail");
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
/** 模型所属池的排序键 Gemini=0 Claude=1 GPT=2 其他=3 */
function poolOrderKey(id, display) {
  const lower = (id + " " + (display || "")).toLowerCase();
  if (lower.includes("gemini")) return 0;
  if (lower.includes("claude")) return 1;
  if (lower.includes("gpt") || lower.includes("oss")) return 2;
  return 3; // 其余
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
  Store.models.sort((a, b) => poolOrderKey(a.id, a.display) - poolOrderKey(b.id, b.display));
}
async function refreshCollectionHistory() {
  try {
    Store.collectionHistory = await api.get("/api/collection/history?hours=720");
  } catch (e) { console.warn("collection history refresh failed", e); }
}
async function refreshLogs() {
  Store.logs = await api.get("/api/logs?limit=300");
}
async function refreshImageGenLatest() {
  try { Store.imageGenLatest = await api.get("/api/image-gen/latest"); } catch {}
}
async function refreshImageGenHistory(limit = 50) {
  try { Store.imageGenHistory = await api.get(`/api/image-gen/history?limit=${limit}`); } catch {}
}

/**
 * 轮询执行记录直到完成（stderr 不再是"执行中..."），然后渲染并提示。
 * @param executionId 新创建的执行记录 ID
 * @param shouldRender 返回 boolean，判断当前是否应重新渲染（避免覆盖用户已切换的页面）
 * @param renderFn 重新渲染函数
 */
function pollExecution(executionId, shouldRender, renderFn) {
  if (!executionId) {
    toast(t("toast.triggered"), "success");
    return;
  }
  const checkInterval = setInterval(async () => {
    await refreshExecutionHistory();
    await refreshStatus();
    if (shouldRender()) renderFn();

    const exec = Store.executionHistory?.find((e) => e.id === executionId);
    if (exec && exec.stderr !== "执行中...") {
      clearInterval(checkInterval);
      if (shouldRender()) renderFn();
      toast(t("toast.triggered"), "success");
    }
  }, 2000);
  setTimeout(() => clearInterval(checkInterval), 30000);
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
  $$("[data-cd-model]").forEach((el) => {
    const rt = el.getAttribute("data-cd-model");
    el.textContent = rt ? fmtCountdown(rt) : "—";
  });
}

async function renderOverview() {
  const s = Store.status;
  const q = Store.latestQuota;
  const html = [];

  // ensure 7-day history is available for the trend chart
  if (Store.quotaHistory.length === 0) {
    try { await refreshQuotaHistory(168); } catch (e) { /* ignore */ }
  }

  // ── Hero: health gauge + provider usage ──
  const credits = q?.credits;
  const healthPct = credits?.limit ? Math.round((credits.remaining / credits.limit) * 100) : null;
  const healthVal = healthPct != null ? healthPct : 0;
  const healthLabel = healthPct == null ? "—" : healthPct >= 50 ? "健康" : healthPct >= 20 ? "偏低" : "紧张";
  const pools = computePoolUsage(q);
  html.push(`<div class="dash-hero">
    <div class="card gauge-card">
      <div class="card-title">额度健康度</div>
      <div class="gauge-wrap">
        ${gaugeSVG(healthVal)}
        <div class="gauge-center">
          <div class="gauge-pct">${healthPct != null ? healthPct + "%" : "—"}</div>
          <div class="gauge-label">${healthLabel}</div>
        </div>
      </div>
      <div class="gauge-info">
        <div class="gauge-line"><span>Prompt 额度</span><span>${credits ? (credits.remaining ?? "?") + " / " + (credits.limit ?? "?") : "—"}</span></div>
        <div class="gauge-line"><span>Flow 额度</span><span>${q?.flowCredits?.limit ? (q.flowCredits.remaining ?? "?") + " / " + q.flowCredits.limit : "—"}</span></div>
        <div class="gauge-line"><span>上次对话</span><span>${s?.daemon?.lastExecution ? fmtAgo(s.daemon.lastExecution.runAt) : "—"}</span></div>
      </div>
    </div>
    <div class="card provider-card">
      <div class="card-title">Provider 用量</div>
      <div class="provider-list">
        ${providerRow("Claude", pools.Claude, "var(--provider-claude)")}
        ${providerRow("Gemini", pools.Gemini, "var(--provider-gemini)")}
        ${providerRow("GPT", pools.GPT, "var(--provider-gpt)")}
      </div>
    </div>
  </div>`);

  // ── Trend (7-day) ──
  html.push(`<div class="card trend-card">
    <div class="card-title">近 7 天额度消耗</div>
    <div class="chart-container"><canvas id="overviewTrend"></canvas></div>
  </div>`);

  // ── Bottom: quick actions + system status ──
  html.push(`<div class="dash-bottom">
    <div class="card quick-actions">
      <div class="card-title">快捷操作</div>
      <div class="action-bar">
        <button class="btn btn-primary" id="quickCollect">${t("btn.collectNow")}</button>
        <button class="btn btn-success" id="quickRun">${t("btn.runNow")}</button>
      </div>
      <div class="metric-extra margin-top-md">${t("btn.shortcutHint")}</div>
    </div>
    <div class="card sys-status">
      <div class="card-title">系统状态</div>
      <table class="monitor-table">
        <tr><td>定时调度</td><td>${s?.daemon?.running ? '<span class="badge badge-success">运行中</span>' : '<span class="badge badge-neutral">已停止</span>'}</td></tr>
        <tr><td>监听队列</td><td>${s?.monitor?.running ? '<span class="badge badge-success">运行中</span>' : '<span class="badge badge-neutral">空闲</span>'}</td></tr>
        <tr><td>最后错误</td><td>${s?.monitor?.lastError ? '<span class="badge badge-danger">' + escapeHtml(s.monitor.lastError) + '</span>' : '<span class="badge badge-success">无</span>'}</td></tr>
      </table>
    </div>
  </div>`);

  // ── 图像生成额度 ──
  const igLatest = Store.imageGenLatest || [];
  const igHistory = Store.imageGenHistory || [];
  html.push(`<div class="card">
    <div class="card-title">${t("imagegen.title")} <span class="card-title-sub">${t("imagegen.sub")}</span></div>
    ${igLatest.length === 0
      ? `<div class="empty">${t("imagegen.noData")}</div>`
      : `<table class="model-table">
        <thead><tr>
          <th>${t("imagegen.model")}</th><th>${t("imagegen.status")}</th><th>${t("imagegen.resetCountdown")}</th><th>${t("imagegen.resetTime")}</th><th>${t("imagegen.observedAt")}</th>
        </tr></thead>
        <tbody>
        ${igLatest.map((r) => {
          const expired = r.resetTime && Date.now() >= new Date(r.resetTime).getTime();
          const active = r.exhausted && !expired;
          const statusBadge = active
            ? '<span class="badge badge-danger">' + t("imagegen.activeExhaust") + '</span>'
            : (r.exhausted ? '<span class="badge badge-neutral">' + t("imagegen.exhausted") + '</span>' : '<span class="badge badge-success">' + t("imagegen.normal") + '</span>');
          return `<tr>
            <td><span class="model-id">${escapeHtml(r.modelId)}</span></td>
            <td>${statusBadge}</td>
            <td class="countdown" data-cd-model="${escapeAttr(r.resetTime)}">${r.resetTime ? fmtCountdown(r.resetTime) : "—"}</td>
            <td>${r.resetTime ? fmtTime(r.resetTime, true) : "—"}</td>
            <td>${fmtAgo(r.observedAt)}</td>
          </tr>`;
        }).join("")}
        </tbody>
      </table>`}
    <div class="action-bar margin-top-md">
      <button class="btn btn-primary" id="imgGenTriggerBtn">${t("imagegen.triggerBtn")}</button>
      <button class="btn" id="imgGenReportBtn">${t("imagegen.manualBtn")}</button>
    </div>
  </div>`);

  if (igHistory.length > 0) {
    html.push(`<div class="card">
      <div class="card-title">${t("imagegen.history")}</div>
      <table>
        <thead><tr>
          <th>${t("imagegen.model")}</th><th>${t("imagegen.status")}</th><th>${t("imagegen.resetTime")}</th><th>${t("imagegen.observedAt")}</th>
        </tr></thead>
        <tbody>
        ${igHistory.slice(0, 10).map((r) => {
          const badge = r.exhausted ? '<span class="badge badge-danger">' + t("imagegen.exhausted") + '</span>' : '<span class="badge badge-success">' + t("imagegen.normal") + '</span>';
          return `<tr>
            <td><span class="model-id">${escapeHtml(r.modelId)}</span></td>
            <td>${badge}</td>
            <td>${r.resetTime ? fmtTime(r.resetTime, true) : "—"}</td>
            <td>${fmtAgo(r.observedAt)}</td>
          </tr>`;
        }).join("")}
        </tbody>
      </table>
    </div>`);
  }

  // ── Recent executions ──
  html.push(`<div class="card">
    <div class="card-title">${t("exec.recent")}</div>
    ${Store.executionHistory.length === 0 ? '<div class="empty">' + t("exec.noRecords") + '</div>' : renderExecutionRows(Store.executionHistory.slice(0, 5), true)}
  </div>`);

  $("#content").innerHTML = html.join("");
  drawOverviewTrend();

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
      const result = await api.send("/api/scheduler/run-now", "POST");
      await refreshExecutionHistory();
      await refreshStatus();
      renderOverview();
      pollExecution(result.execution?.id, () => location.hash === "#overview" || location.hash === "", renderOverview);
    } catch (e) {
      toast(t("toast.executeFail", { msg: e.message }), "error");
      await refreshExecutionHistory();
      await refreshStatus();
      if (location.hash === "#overview" || location.hash === "") renderOverview();
    }
  };
  bindExecutionRowToggles();
  const imgGenReportBtn = $("#imgGenReportBtn");
  if (imgGenReportBtn) imgGenReportBtn.onclick = () => openImageGenReportModal();
  const imgGenTriggerBtn = $("#imgGenTriggerBtn");
  if (imgGenTriggerBtn) imgGenTriggerBtn.onclick = async () => {
    imgGenTriggerBtn.disabled = true;
    const original = imgGenTriggerBtn.textContent;
    imgGenTriggerBtn.textContent = t("imagegen.triggering");
    try {
      const r = await api.send("/api/image-gen/trigger", "POST");
      if (r.ok) {
        toast(r.isExhausted ? t("imagegen.toastCollected", { model: r.modelId, s: t("imagegen.exhausted") }) : t("imagegen.triggerOk", { model: r.modelId }), r.isExhausted ? "error" : "success");
      } else {
        toast(t("imagegen.triggerFail", { msg: r.error || "unknown" }), "error");
        console.warn("image-gen trigger raw:", r.raw);
      }
      await refreshImageGenLatest();
      await refreshImageGenHistory();
      renderOverview();
    } catch (e) {
      toast(t("imagegen.triggerFail", { msg: e.message }), "error");
    } finally {
      imgGenTriggerBtn.disabled = false;
      imgGenTriggerBtn.textContent = original;
    }
  };
}

function openImageGenReportModal() {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal">
    <div class="modal-title">${t("imagegen.formTitle")}</div>
    <div class="modal-hint">${t("imagegen.formHint")}</div>
    <textarea class="form-input modal-textarea" id="imgGenRaw" placeholder="${t("imagegen.placeholder")}"></textarea>
    <div class="action-bar" style="margin-top:14px">
      <button class="btn btn-primary" id="imgGenSubmit">${t("imagegen.submit")}</button>
      <button class="btn" id="imgGenCancel">${t("imagegen.cancel")}</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  $("#imgGenCancel").onclick = close;
  $("#imgGenSubmit").onclick = async () => {
    const raw = $("#imgGenRaw").value.trim();
    if (!raw) { toast(t("imagegen.toastFail", { msg: "empty" }), "error"); return; }
    try {
      const r = await api.send("/api/image-gen/report", "POST", { raw });
      toast(t("imagegen.toastCollected", { model: r.modelId, s: r.isExhausted ? t("imagegen.exhausted") : t("imagegen.normal") }), "success");
      close();
      await refreshImageGenLatest();
      await refreshImageGenHistory();
      renderOverview();
    } catch (e) {
      toast(t("imagegen.toastFail", { msg: e.message }), "error");
    }
  };
}

/* ── Command Center helpers (gauge / donut / provider / trend) ── */
function gaugeSVG(pct) {
  const r = 70, cx = 80, cy = 80;
  const C = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, pct || 0));
  const L = (v / 100) * C;
  return `<svg class="health-gauge" viewBox="0 0 160 160" width="160" height="160">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#eef1f6" stroke-width="14"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#6366f1" stroke-width="14" stroke-linecap="round" stroke-dasharray="${L.toFixed(2)} ${C.toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>
  </svg>`;
}
function donutSVG(pct, color) {
  const r = 16, cx = 22, cy = 22;
  const C = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, pct || 0));
  const L = (v / 100) * C;
  return `<svg class="donut" viewBox="0 0 44 44" width="44" height="44">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#eef1f6" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${L.toFixed(2)} ${C.toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>
  </svg>`;
}
function providerRow(name, pct, color) {
  const p = pct != null ? Math.round(pct) : 0;
  return `<div class="provider-item">
    ${donutSVG(pct != null ? pct : 0, color)}
    <div class="provider-meta">
      <div class="provider-name">${name}</div>
      <div class="provider-val">${pct != null ? p + "% 剩余" : "— 无数据"}</div>
    </div>
    <div class="provider-track"><div class="provider-track-fill" style="width:${p}%;background:${color}"></div></div>
  </div>`;
}
function computePoolUsage(q) {
  const result = { Claude: null, Gemini: null, GPT: null, Other: null };
  if (!q || !q.models) return result;
  const sums = {}, counts = {};
  for (const m of q.models) {
    const pool = modelPoolName(m.id, m.display);
    if (!sums[pool]) { sums[pool] = 0; counts[pool] = 0; }
    // 优先用剩余百分比；额度已耗尽（exhausted）但无数值时按 0 处理
    const rem = m.remainingPct != null ? m.remainingPct : (m.exhausted ? 0 : null);
    if (rem != null) { sums[pool] += rem; counts[pool]++; }
  }
  for (const k of Object.keys(result)) result[k] = counts[k] ? sums[k] / counts[k] : null;
  return result;
}
function drawOverviewTrend() {
  const canvas = document.getElementById("overviewTrend");
  if (!canvas) return;
  if (Store.chartInstances["overviewTrend"]) Store.chartInstances["overviewTrend"].destroy();
  const pools = {};
  for (const m of Store.models) {
    const p = modelPoolName(m.id, m.display);
    if (!pools[p]) pools[p] = [];
    pools[p].push(m);
  }
  const palette = { Claude: "#ef4444", Gemini: "#f59e0b", GPT: "#10b981", Other: "#6366f1" };
  const datasets = Object.entries(pools).map(([pool, models]) => {
    const values = Store.quotaHistory.map((d) => {
      let sum = 0, c = 0;
      for (const m of models) {
        const mm = d.models.find((x) => x.id === m.id);
        if (mm && mm.usedPct != null) { sum += mm.usedPct; c++; }
      }
      return c ? sum / c : null;
    });
    const color = palette[pool] || "#6366f1";
    return { label: pool, data: values, borderColor: color, backgroundColor: color + "22", fill: true, tension: 0.35, spanGaps: true, pointRadius: 0, borderWidth: 2 };
  });
  const labels = Store.quotaHistory.map((d) => { const s = fmtTime(d.time); return s.length > 5 ? s.slice(5) : s; });
  Store.chartInstances["overviewTrend"] = new Chart(canvas, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "bottom", labels: { boxWidth: 12, padding: 12, font: { size: 11 }, color: "#6b7280" } },
        tooltip: { mode: "index", intersect: false }
      },
      scales: {
        y: { beginAtZero: true, max: 100, grid: { color: "#eef1f6" }, ticks: { callback: (v) => v + "%", color: "#9ca3af", font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 11 }, maxTicksLimit: 8 } }
      }
    }
  });
}

function renderExecutionRows(rows, withLimit = false) {
  const limited = withLimit ? rows.slice(0, 5) : rows;
  return `<div class="table-scroll"><table>
    <thead><tr>
      <th>${t("execTable.time")}</th><th>${t("execTable.trigger")}</th><th class="num">${t("execTable.duration")}</th><th>${t("execTable.result")}</th><th></th>
    </tr></thead>
    <tbody>
    ${limited.map((r) => `<tr class="execution-row" data-id="${r.id}">
      <td>${fmtTime(r.runAt, true)}</td>
      <td>${r.triggeredBy === "manual" ? '<span class="badge badge-info">' + t("badge.manual") + '</span>' : '<span class="badge badge-neutral">' + t("badge.auto") + '</span>'}</td>
      <td class="num">${r.durationMs != null && r.durationMs > 0 ? r.durationMs + ' ms' : '—'}</td>
      <td><span class="badge ${badgeClassForStatus(r.success, r.stderr)}">${getStatusText(r.success, r.stderr)}</span></td>
      <td><span class="text-muted-sm">${t("execTable.expand")}</span></td>
    </tr>
    <tr class="execution-detail-row" data-detail-id="${r.id}"><td colspan="5">${renderExecutionDetail(r)}</td></tr>`).join("")}
    </tbody>
  </table></div>`;
}

function renderExecutionDetail(r) {
  const stdout = r.stdout ? `<div class="stdout">${t("execDetail.stdout")}\n${escapeHtml(r.stdout)}</div>` : "";
  const stderr = r.stderr && r.stderr !== "执行中..." ? `<div class="stderr">${t("execDetail.stderr")}\n${escapeHtml(r.stderr)}</div>` : "";
  const content = [];
  if (stdout) content.push(stdout);
  if (stderr) content.push(stderr);
  if (content.length === 0) {
    if (r.success) {
      content.push(`<div class="execution-detail">${t("execDetail.noOutput")} (命令执行成功)</div>`);
    } else {
      content.push(`<div class="execution-detail">${t("execDetail.noOutput")}</div>`);
    }
  }
  return `<div class="execution-detail">${content.join("")}</div>`;
}

function bindExecutionRowToggles() {
  // 使用事件委托，避免重复绑定事件，绑定在 #content 上
  const content = document.querySelector("#content");
  if (content) {
    // 先移除之前的监听器（使用命名函数来移除）
    content.removeEventListener("click", handleExecutionRowClick);
    content.addEventListener("click", handleExecutionRowClick);
  }
}

function handleExecutionRowClick(e) {
  const tr = e.target.closest(".execution-row");
  if (!tr) return;
  const id = tr.getAttribute("data-id");
  const detailTr = document.querySelector(`.execution-detail-row[data-detail-id="${id}"] .execution-detail`);
  if (detailTr) {
    detailTr.classList.toggle("show");
  }
}

async function renderScheduler() {
  $("#content").innerHTML = `<div class="page-loading">${t("common.loading")}</div>`;
  const s = Store.status;
  const cfg = Store.config;
  try { await refreshExecutionHistory(); } catch {}
  try { await refreshCollectionHistory(); } catch {}
  const html = [];
  html.push(`<div class="card">
    <div class="card-title">${t("scheduler.title")} <span class="card-title-sub">${t("scheduler.desc", { interval: Store.config?.scheduler?.intervalMinutes ?? "—", start: Store.config?.scheduler?.startTime ?? "—", end: Store.config?.scheduler?.endTime ?? "—" })}</span></div>
    <div class="grid-3">
      <div>
        <div class="metric-label">${t("scheduler.status")}</div>
        <div class="margin-top-sm">${s?.daemon?.running ? '<span class="badge badge-success">' + t("scheduler.running") + '</span>' : '<span class="badge badge-neutral">' + t("scheduler.stopped") + '</span>'}</div>
        <div class="action-bar margin-top-md">
          ${s?.daemon?.running
            ? '<button class="btn btn-danger btn-sm" id="btnStopDaemon">' + t("scheduler.btnStop") + '</button>'
            : '<button class="btn btn-primary btn-sm" id="btnStartDaemon">' + t("scheduler.btnStart") + '</button>'}
          <button class="btn btn-success btn-sm" id="btnRunNow">${t("scheduler.btnRunNow")}</button>
        </div>
      </div>
      <div>
        <div class="metric-label">${t("scheduler.nextRun")}</div>
        <div class="metric-value metric-value-md" data-cd="daemon-next">—</div>
        <div class="metric-extra" data-cd="daemon-next-abs">—</div>
      </div>
      <div>
        <div class="metric-label">${t("scheduler.lastRun")}</div>
        ${s?.daemon?.lastExecution ? `
          <div class="margin-top-sm">${fmtTime(s.daemon.lastExecution.runAt, true)} (${fmtAgo(s.daemon.lastExecution.runAt)})</div>
          <div class="margin-top-sm"><span class="badge ${badgeClassForStatus(s.daemon.lastExecution.success)}">${s.daemon.lastExecution.success ? t("badge.success") : t("badge.fail")}</span>
          ${s.daemon.lastExecution.triggeredBy === 'manual' ? '<span class="badge badge-info" style="margin-left:4px">' + t("badge.manual") + '</span>' : '<span class="badge badge-neutral" style="margin-left:4px">' + t("badge.auto") + '</span>'}
          ${s.daemon.lastExecution.durationMs != null ? `<span class="text-muted-sm" style="margin-left:6px">${s.daemon.lastExecution.durationMs} ms</span>` : ''}
          </div>
        ` : '<div class="metric-extra margin-top-sm">' + t("scheduler.notYet") + '</div>'}
      </div>
    </div>
  </div>`);

  // ── Card 2: 额度采集 (monitor) — 自动采集倒计时 ──
  html.push(`<div class="card">
    <div class="card-title">${t("scheduler.collect")} <span class="card-title-sub">${t("scheduler.collectSub", { interval: cfg?.monitor?.intervalMinutes ?? "—" })}</span></div>
    <div class="grid-3">
      <div>
        <div class="metric-label">${t("scheduler.status")}</div>
        <div class="margin-top-sm">${s?.monitor?.running ? '<span class="badge badge-success">' + t("scheduler.running") + '</span>' : '<span class="badge badge-neutral">' + t("scheduler.stopped") + '</span>'}</div>
      </div>
      <div>
        <div class="metric-label">${t("scheduler.nextCollect")}</div>
        <div class="metric-value metric-value-md" data-cd="monitor-next">—</div>
        <div class="metric-extra" data-cd="monitor-next-abs">—</div>
      </div>
      <div>
        <div class="metric-label">${t("scheduler.lastCollect")}</div>
        <div class="margin-top-sm">${s?.monitor?.lastCollectionAt ? fmtTime(s.monitor.lastCollectionAt, true) + ' (' + fmtAgo(s.monitor.lastCollectionAt) + ')' : t("scheduler.notYet")}</div>
        ${s?.monitor?.lastError ? '<div class="margin-top-sm"><span class="badge badge-danger">' + escapeHtml(s.monitor.lastError) + '</span></div>' : ''}
      </div>
    </div>
  </div>`);

  // ── Tabs: 执行历史 / 采集历史 ──
  html.push(`<div class="tabs-row" id="schedTabs">
    <div class="tab active" data-tab="exec">${t("scheduler.tabExec")}</div>
    <div class="tab" data-tab="collect">${t("scheduler.tabCollect")}</div>
  </div>`);
  html.push(`<div id="schedExecPanel">${renderExecHistoryPanel()}</div>`);
  html.push(`<div id="schedCollectPanel" style="display:none">${renderCollectionHistory()}</div>`);

  $("#content").innerHTML = html.join("");

  $$("#schedTabs .tab").forEach((tab) => {
    tab.onclick = () => {
      const which = tab.getAttribute("data-tab");
      $$("#schedTabs .tab").forEach((t) => t.classList.toggle("active", t === tab));
      $("#schedExecPanel").style.display = which === "exec" ? "" : "none";
      $("#schedCollectPanel").style.display = which === "collect" ? "" : "none";
    };
  });

  const stopBtn = $("#btnStopDaemon");
  if (stopBtn) stopBtn.onclick = async () => {
    try { await api.send("/api/scheduler/stop", "POST"); await refreshStatus(); renderTopbar(); renderScheduler(); toast(t("toast.stopped"), "success"); }
    catch (e) { toast(t("toast.stopFail", { msg: e.message }), "error"); }
  };
  const startBtn = $("#btnStartDaemon");
  if (startBtn) startBtn.onclick = async () => {
    try { await api.send("/api/scheduler/start", "POST"); await refreshStatus(); renderTopbar(); renderScheduler(); toast(t("toast.started"), "success"); }
    catch (e) { toast(t("toast.startFail", { msg: e.message }), "error"); }
  };
  $("#btnRunNow").onclick = async () => {
    try {
      toast(t("toast.executing"), "info");
      const result = await api.send("/api/scheduler/run-now", "POST");
      await refreshStatus();
      await refreshExecutionHistory();
      renderScheduler();
      pollExecution(result.execution?.id, () => location.hash === "#scheduler", renderScheduler);
    } catch (e) {
      toast(t("toast.executeFail", { msg: e.message }), "error");
      await refreshStatus();
      await refreshExecutionHistory();
      if (location.hash === "#scheduler") renderScheduler();
    }
  };
  bindExecutionRowToggles();
}

function renderExecHistoryPanel() {
  if (Store.executionHistory.length === 0) return '<div class="card"><div class="empty">' + t("exec.noRecords") + '</div></div>';
  return `<div class="card"><div class="card-title">${t("scheduler.history")} <span class="card-title-sub">${t("scheduler.historySub")}</span></div>${renderExecutionRows(Store.executionHistory)}</div>`;
}

function renderCollectionHistory() {
  const list = Store.collectionHistory || [];
  if (list.length === 0) return `<div class="card"><div class="empty">${t("collect.noRecords")}</div></div>`;
  const sorted = [...list].sort((a, b) => new Date(b.time) - new Date(a.time));
  const rows = sorted.map((h) => {
    const ok = h.success !== false;
    const pc = h.credits || {};
    const fc = h.flowCredits || {};
    const acct = h.email || h.name || "—";
    const pcStr = !ok ? "—" : (pc.used != null && pc.limit != null ? pc.used + " / " + pc.limit : "—");
    const fcStr = !ok ? "—" : (fc.used != null && fc.limit != null ? fc.used + " / " + fc.limit : "—");
    const status = ok
      ? '<span class="badge badge-success">✓</span>'
      : `<span class="badge badge-danger" title="${escapeHtml(h.error || "")}">✗ ${t("collect.failed")}</span>`;
    return `<tr>
      <td>${status}</td>
      <td>${fmtTime(h.time, true)}</td>
      <td>${escapeHtml(acct)}</td>
      <td class="num">${ok && h.modelCount != null ? h.modelCount : "—"}</td>
      <td>${pcStr}</td>
      <td>${fcStr}</td>
    </tr>`;
  }).join("");
  return `<div class="card"><div class="card-title">${t("scheduler.tabCollect")} <span class="card-title-sub">${t("scheduler.historySub")}</span></div>
    <div class="table-scroll"><table>
      <thead><tr><th>${t("collect.status")}</th><th>${t("collect.time")}</th><th>${t("collect.account")}</th><th class="num">${t("collect.modelCount")}</th><th>${t("collect.promptCredits")}</th><th>${t("collect.flowCredits")}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div></div>`;
}

function modelPoolName(id, display) {
  const lower = (id + " " + (display || "")).toLowerCase();
  if (lower.includes("gemini")) return "Gemini";
  if (lower.includes("claude")) return "Claude";
  if (lower.includes("gpt") || lower.includes("oss")) return "GPT";
  return display || id.replace("MODEL_PLACEHOLDER_", "");
}

function poolSparklineSVG(series, color) {
  const w = 320, h = 64, pad = 4;
  const avail = series.map((v, i) => ({ v, i })).filter((p) => p.v != null);
  if (avail.length === 0) return `<div class="spark-empty">${t("metric.noData")}</div>`;
  const n = series.length;
  const xy = (p) => {
    const x = n === 1 ? w / 2 : pad + (p.i / (n - 1)) * (w - 2 * pad);
    const y = pad + (1 - p.v / 100) * (h - 2 * pad);
    return [x, y];
  };
  const linePts = avail.map((p) => xy(p).join(",")).join(" ");
  const first = xy(avail[0]);
  const last = xy(avail[avail.length - 1]);
  const areaPts = `${first[0].toFixed(1)},${(h - pad).toFixed(1)} ${linePts} ${last[0].toFixed(1)},${(h - pad).toFixed(1)}`;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" width="100%" height="${h}">
    <polygon points="${areaPts}" fill="${color}" fill-opacity="0.12"></polygon>
    <polyline points="${linePts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
  </svg>`;
}

function renderTrendsPoolSummary() {
  const pools = {};
  for (const m of Store.models) {
    const p = modelPoolName(m.id, m.display);
    (pools[p] = pools[p] || []).push(m);
  }
  const palette = { Claude: "#ef4444", Gemini: "#f59e0b", GPT: "#10b981", Other: "#6366f1" };
  const cards = Object.keys(pools).map((pool) => {
    const models = pools[pool];
    const color = palette[pool] || "#6366f1";
    const series = Store.quotaHistory.map((d) => {
      let sum = 0, c = 0;
      for (const m of models) {
        const mm = d.models.find((x) => x.id === m.id);
        if (mm && mm.usedPct != null) { sum += mm.usedPct; c++; }
      }
      return c ? sum / c : null;
    });
    const latestVals = series.filter((v) => v != null);
    const pct = latestVals.length ? Math.round(latestVals[latestVals.length - 1]) : null;
    return `<div class="trend-pool-card">
      <div class="trend-pool-head">
        <span class="trend-pool-dot" style="background:${color}"></span>
        <span class="trend-pool-name">${escapeHtml(pool)}</span>
        <span class="trend-pool-pct">${pct != null ? pct + "%" : "—"}</span>
      </div>
      ${poolSparklineSVG(series, color)}
    </div>`;
  }).join("");
  return `<div class="trend-pool-grid">${cards}</div>`;
}

async function renderTrends() {
  $("#content").innerHTML = `<div class="page-loading">${t("common.loading")}</div>`;
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
    html.push(`<div class="card">
      <div class="card-title">${t("trends.usagePct")}</div>
      ${renderTrendsPoolSummary()}
    </div>`);
  }

  $("#content").innerHTML = html.join("");

  $$(".tabs-row .tab").forEach((t) => {
    t.onclick = async () => {
      Store.trendsHours = parseInt(t.getAttribute("data-hours"), 10);
      await refreshQuotaHistory(Store.trendsHours);
      renderTrends();
    };
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
    <div class="form-group">
      <label class="form-label">${t("settings.retries")}</label>
      <input class="form-input" type="number" id="cfg-maxRetries" value="${c.command.maxRetries}" min="0" max="20">
      <div class="form-hint">${t("settings.retriesHint")}</div>
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
    <div class="card-title">${t("imagegen.title")} <span class="card-title-sub">${t("imagegen.sub")}</span></div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">${t("settings.imageGenMethod")}</label>
        <input class="form-input" type="text" id="cfg-imageGenMethod" value="${escapeAttr(c.imageGen.method)}">
        <div class="form-hint">${t("settings.imageGenMethodHint")}</div>
      </div>
      <div class="form-group">
        <label class="form-label">${t("settings.imageGenModel")}</label>
        <input class="form-input" type="text" id="cfg-imageGenModel" value="${escapeAttr(c.imageGen.model)}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">${t("settings.imageGenPrompt")}</label>
      <input class="form-input" type="text" id="cfg-imageGenPrompt" value="${escapeAttr(c.imageGen.prompt)}">
    </div>
    <div class="form-group">
      <label class="form-label">${t("settings.imageGenEndpoint")}</label>
      <input class="form-input" type="text" id="cfg-imageGenEndpoint" value="${escapeAttr(c.imageGen.endpoint)}">
      <div class="form-hint">${t("settings.imageGenEndpointHint")}</div>
    </div>
    <div class="form-group">
      <label class="form-label">${t("settings.imageGenAuthToken")}</label>
      <input class="form-input" type="password" id="cfg-imageGenAuthToken" value="${escapeAttr(c.imageGen.authToken)}" autocomplete="off">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">${t("settings.imageGenTimeout")}</label>
        <input class="form-input" type="number" id="cfg-imageGenTimeout" value="${c.imageGen.timeoutMs}" min="1000">
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
    <div class="card-title">${t("settings.share")}</div>
    <div class="fieldset-sub">${t("settings.shareSub")}</div>
    <div class="form-row">
      <div class="form-group" style="grid-column:1/-1">
        <label class="form-label">${t("settings.shareUrl")}</label>
        <div class="flex-gap-sm" style="gap:8px">
          <input class="form-input" type="text" id="cfg-shareUrl" readonly style="flex:1" value="${t("settings.shareLoading")}">
          <button class="btn btn-primary" id="btnCopyUrl">${t("settings.shareCopy")}</button>
        </div>
        <div class="form-hint" id="shareHint">${t("settings.shareHint")}</div>
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

  html.push(`<div class="action-bar settings-actions" style="margin-bottom: 30px">
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
          maxRetries: parseInt($("#cfg-maxRetries").value, 10) || 3,
        },
        monitor: {
          intervalMinutes: parseInt($("#cfg-monInterval").value, 10),
          agyTimeoutMs: parseInt($("#cfg-agyTimeout").value, 10),
        },
        imageGen: {
          enabled: true,
          endpoint: $("#cfg-imageGenEndpoint").value.trim(),
          method: $("#cfg-imageGenMethod").value.trim() || "GenerateImage",
          model: $("#cfg-imageGenModel").value.trim() || "gemini-3.1-flash-image",
          prompt: $("#cfg-imageGenPrompt").value,
          authToken: $("#cfg-imageGenAuthToken").value,
          timeoutMs: parseInt($("#cfg-imageGenTimeout").value, 10) || 30000,
        },
        web: { trayEnabled },
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
    $("#cfg-intervalMinutes").value = "60";
    $("#cfg-executable").value = "agy";
    $("#cfg-args").value = "--prompt hi";
    $("#cfg-maxRetries").value = "3";
    $("#cfg-monInterval").value = "10";
    $("#cfg-agyTimeout").value = "10000";
    $("#cfg-imageGenMethod").value = "GenerateImage";
    $("#cfg-imageGenModel").value = "gemini-3.1-flash-image";
    $("#cfg-imageGenPrompt").value = "a tiny red square on white background";
    $("#cfg-imageGenEndpoint").value = "";
    $("#cfg-imageGenAuthToken").value = "";
    $("#cfg-imageGenTimeout").value = "30000";
    const tb = $("#cfg-trayEnabled");
    if (tb) tb.checked = false;
    toast(t("toast.resetDone"), "info");
  };

  // share link
  const urlInput = $("#cfg-shareUrl");
  const copyBtn = $("#btnCopyUrl");
  const shareHint = $("#shareHint");
  if (urlInput && copyBtn) {
    fetch("/api/host").then(r => r.json()).then(data => {
      if (data.ips && data.ips.length > 0) {
        const url = `http://${data.ips[0]}:${data.port}`;
        urlInput.value = url;
      } else {
        urlInput.value = t("settings.shareUnavailable");
      }
    }).catch(() => {
      urlInput.value = t("settings.shareUnavailable");
    });
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(urlInput.value);
        if (shareHint) shareHint.textContent = t("settings.shareCopied");
        toast(t("settings.shareCopiedToast"), "success");
      } catch {
        toast(t("settings.shareFailed"), "error");
      }
    };
  }
}

function renderLogs() {
  const html = [];
  html.push(`<div class="card">
    <div class="card-title">${t("logs.title")} <span class="card-title-sub">${t("logs.sub")}</span></div>
    <div class="action-bar log-filter" style="margin-bottom: 12px">
      <label class="text-muted-sm">${t("logs.source")}</label>
      <select class="form-select" id="logSrc" style="width: 120px">
        <option value="all">${t("logs.all")}</option>
        <option value="daemon">daemon</option>
        <option value="monitor">monitor</option>
        <option value="web">web</option>
        <option value="system">system</option>
      </select>
      <label class="text-muted-sm" style="margin-left: 8px">${t("logs.level")}</label>
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
  const ham = $("#hamburgerBtn");
  if (ham) {
    const closed = $("#app").classList.contains("sidebar-closed");
    ham.title = closed ? (_lang === "zh" ? "展开侧边栏" : "Open sidebar") : (_lang === "zh" ? "收起侧边栏" : "Close sidebar");
  }
  const cur = location.hash.replace("#", "") || "overview";
  const titleEl = $("#pageTitle");
  const subEl = $("#pageSub");
  if (titleEl && PageTitles[cur]) titleEl.textContent = t(PageTitles[cur]);
  if (subEl && PageSubs[cur]) subEl.textContent = t(PageSubs[cur]);
}

let _settingHash = false;
function setRoute(route) {
  if (!PageTitles[route]) route = "overview";
  $$(".nav-item").forEach((el) => el.classList.toggle("active", el.getAttribute("data-route") === route));
  $("#pageTitle").textContent = t(PageTitles[route]);
  $("#pageSub").textContent = t(PageSubs[route]);
  _settingHash = true;
  location.hash = route;
  _settingHash = false;
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
      refreshCollectionHistory();
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
  es.addEventListener("imagegen", onEvent((d) => {
    refreshImageGenLatest();
    refreshImageGenHistory();
    if (location.hash === "#overview" || location.hash === "") setRoute("overview");
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
  await refreshImageGenLatest();
  await refreshImageGenHistory();
  await refreshLogs();
  renderTopbar();
  applyI18n();
  $("#langToggle").onclick = () => {
    setLang(_lang === "zh" ? "en" : "zh");
    const cur = location.hash.replace("#", "") || "overview";
    setRoute(cur);
  };
  const initial = location.hash.replace("#", "") || "overview";
  setRoute(initial);

  // sidebar drawer toggle (mobile-style overlay)
  const hamburgerBtn = $("#hamburgerBtn");
  const appEl = $("#app");

  function closeSidebar() {
    appEl.classList.add("sidebar-closed");
    appEl.classList.remove("sidebar-open");
    hamburgerBtn.innerHTML = "☰";
    hamburgerBtn.title = _lang === "zh" ? "展开侧边栏" : "Open sidebar";
    localStorage.setItem("agy-sidebar", "collapsed");
  }
  function openSidebar() {
    appEl.classList.remove("sidebar-closed");
    appEl.classList.add("sidebar-open");
    hamburgerBtn.innerHTML = "✕";
    hamburgerBtn.title = _lang === "zh" ? "收起侧边栏" : "Close sidebar";
    localStorage.setItem("agy-sidebar", "open");
  }
  function toggleSidebar() {
    if (appEl.classList.contains("sidebar-closed")) {
      openSidebar();
    } else {
      closeSidebar();
    }
  }

  // 导航点击：阻止 <a> 原生 hash 跳转，避免与 hashchange 冲突
  $$(".nav-item").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      setRoute(el.getAttribute("data-route") || "overview");
    });
  });

  if (hamburgerBtn) hamburgerBtn.onclick = toggleSidebar;
  const overlay = $("#sidebarOverlay");
  if (overlay) overlay.onclick = () => closeSidebar();

  // Restore sidebar state from localStorage
  // Start with sidebar open by default (no state saved or unknown)
  // Only collapse if explicitly set in previous session
  const savedState = localStorage.getItem("agy-sidebar");
  if (savedState === "collapsed" || window.innerWidth <= 600) {
    closeSidebar();
  } else {
    openSidebar();
  }

  // 切换设备/缩放视口时，按宽度同步侧边栏状态（避免桌面缩到手机时抽屉盖住内容）
  let _lastVpW = window.innerWidth;
  let _vpTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(_vpTimer);
    _vpTimer = setTimeout(() => {
      const w = window.innerWidth;
      if (_lastVpW > 600 && w <= 600) closeSidebar();
      else if (_lastVpW <= 600 && w > 600) openSidebar();
      _lastVpW = w;
    }, 150);
  });

  connectSSE();
  setInterval(async () => {
    try { await refreshStatus(); renderTopbar(); } catch {}
  }, 30000);
}

window.addEventListener("hashchange", () => {
  if (_settingHash) return;
  setRoute(location.hash.replace("#", ""));
});
window.addEventListener("beforeunload", () => { if (Store.sse) Store.sse.close(); });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
