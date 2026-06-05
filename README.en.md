<p align="center">
  <strong>English</strong> · <a href="README.md">中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Bun-1.3%2B-black?logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/tests-91_✔️-brightgreen" alt="Tests">
  <img src="https://img.shields.io/badge/PRs-welcome-orange" alt="PRs Welcome">
</p>

<div align="center">

# AGy Refresh ⚡ — Quota Monitor in Your System Tray

**No browser tab needed. Your AI credits live in the Windows taskbar, like a battery indicator.**

</div>

---

## 🪟 Windows System Tray — Battery-Style Quota Indicator

**The killer feature.** AGy 2.0 doesn't support plugins to show quota? We put the dashboard right in your taskbar notification area.

- **🎨 Icon changes color by usage** — Green (plenty) → Orange (warning) → Red (exhausted), just like a laptop battery
- **🖱️ Hover for details** — Credits remaining, model count, scheduler status — no window to open
- **📋 Right-click for actions** — Collect now, open dashboard, per-model usage breakdown
- **🔔 Toast notifications** — Disconnected, reconnected — Windows bubble tips keep you informed
- **⚙️ Toggle from Web Settings** — Enable/disable anytime

> Other tools make you open a settings page to see quota → **AGy Refresh brings quota to your fingertips.**

---

## Why? 🤔

AGy's quota reset works like this: **if a conversation is active at a specific time, a new usage cycle unlocks.**\
But the window doesn't trigger itself — miss it and you wait for the next cycle.

AGy Refresh watches it for you:

- **🪟 System tray resident** — Glance at bottom-right to know today's quota
- **⏰ Scheduled conversations at 08:00 daily** — Catch the reset window, ensure all-day availability
- **🔄 Continuous scheduling** — Auto-executes every N minutes within the window, retries 3x on failure
- **📊 Quota history tracking** — AGy only shows current usage; this tool collects & stores history
- **💻 Web dashboard** — Status, scheduler, charts, settings, logs — all in the browser

> In short: **Auto-refresh to prevent starvation, tray-resident, visually trackable.**

---

## Features ✨

| Capability | Description |
|------------|-------------|
| 🪟 **Windows System Tray** | Color-coded icon (green/orange/red), hover for details, right-click actions, toast alerts |
| 🕐 **Scheduled Execution** | Configurable time window + interval, triggers precisely on the minute |
| 🔁 **Auto Retry** | Retries up to 3 times (10s apart) on failure, never misses a window |
| 📡 **Quota Collection** | Pulls usage from AGy Connect RPC API every N minutes, stores in SQLite |
| 📈 **Historical Trends** | Chart.js line charts with 24h / 7d / 30d switching |
| 🌐 **Web Dashboard** | Overview, scheduler controls, trend charts, config editor, live logs — 5 tabs |
| ⚙️ **Hot-Reload Config** | Edit via Web UI, changes take effect immediately |
| 🔔 **SSE Real-time Push** | Status changes, collection results, log stream — instant browser updates |
| 🌍 **i18n** | English (default) / Chinese, auto-detects browser language, one-click switch |
| 🧪 **91 Tests** | Unit + integration tests with full coverage |

---

## Quick Start 🚀

### Prerequisites

- [Bun](https://bun.sh/) installed
- [AGy (antigravity)](https://codeium.com/) CLI (`agy`) in your PATH, language server running

```bash
# 1. Install dependencies
bun install

# 2. One-command start (scheduler + collector + web dashboard)
bun run start --all

# 3. Open Settings → Enable System Tray
open http://localhost:6789
```

### Run as a Background Service (Recommended)

```bash
# Use PM2 for process management
bun run pm2:start

# Auto-start on boot (one-time setup)
pm2 startup
pm2 save
```

---

## Dashboard Overview 🖥️

| Tab | Content |
|-----|---------|
| **Overview** | Next talk countdown, Prompt Credits, model quota table, quick actions |
| **Scheduler** | Start/stop control, next run countdown, last execution result, history |
| **Trends** | Usage rate line charts per model (24h / 7d / 30d) |
| **Settings** | Visual `config.json` editor, **System Tray toggle**, save to hot-reload |
| **Logs** | Real-time SSE log stream from daemon / monitor / web, filterable by source/level |

---

## Configuration ⚙️

```json
{
  "scheduler": {
    "startTime": "08:00",
    "endTime": "23:30",
    "intervalMinutes": 30
  },
  "command": {
    "executable": "agy",
    "args": ["--prompt", "Hello"]
  },
  "monitor": {
    "intervalMinutes": 10,
    "agyTimeoutMs": 50000
  },
  "web": {
    "port": 6789,
    "host": "0.0.0.0",
    "trayEnabled": true
  }
}
```

> All settings editable via Web UI, changes hot-reload instantly.

---

## CLI Modes

```bash
bun run start --all              # Scheduler + collector + web (recommended)
bun run start --serve-only       # Web dashboard only
bun run start --daemon-only      # Scheduler + web only
bun run start --monitor-only     # Collector + web only
bun run start --once             # Execute one conversation and exit
bun run start --collect-now      # Collect quota once and exit
```

---

## Architecture 🏗️

```
CLI --all
  ├─ Daemon       → Schedule loop, execute command, retry on failure
  ├─ Monitor      → Collect Connect RPC → SQLite
  ├─ Web Server   → Elysia REST + SSE + static SPA
  └─ Tray Icon    → PowerShell system tray (Windows)

Runtime (singleton)
  ├─ State: daemon / monitor status
  ├─ EventEmitter → SSE → real-time browser updates
  └─ Ring buffer log (500 entries)
```

**Tech Stack:** [Bun](https://bun.sh/) · [Elysia](https://elysiajs.com/) · SQLite · Chart.js · Vanilla JS · PowerShell

---

## Tests 🧪

```bash
bun test
```

| Module | Tests | Coverage |
|--------|-------|----------|
| Scheduler | 11 | Time boundaries, exact triggers, cross-day |
| Executor | 2 | Command execution adapter |
| Quota Parser | 14 | AGy quota JSON parsing |
| Process Detector | 10 | Process detection parameter extraction |
| Database | 6 | SQLite CRUD + idempotence |
| Daemon Executions | 6 | Execution history CRUD |
| Config Save | 10 | Config validation + atomic write |
| Runtime | 11 | Singleton + EventEmitter + Buffer |
| Connect RPC | 6 | RPC client + integration |
| Web API | 17 | REST routes + SSE + static files |
| **Total** | **91** | **100% green** |

---

## License 📄

MIT
