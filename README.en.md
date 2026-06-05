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

# AGy Refresh ⚡

**Anti-starvation quota auto-refresh tool for AGy / Codeium AI Assistant — Scheduled execution · Quota monitoring · Historical trends**

A web dashboard + background scheduler that monitors your AGy (antigravity) / Codeium AI assistant usage quota.\
Automatically executes conversations to reset usage cycles, continuously collects quota data into SQLite, and visualizes historical trends through a web dashboard.

Perfect for: **AGy users, Codeium users, antigravity IDE users** who want to **auto-refresh AI usage quota, track quota history, and never run out of daily credits.**

</div>

---

## Why? 🤔

AGy's quota reset mechanism works like this: **if a conversation is active at a specific time, a new usage cycle is unlocked.**\
But the window doesn't trigger itself — you'd miss it and wait for the next cycle.

AGy Refresh handles it for you:

- **⏰ Scheduled conversations at 08:00 daily** — catch the reset window, ensure full-day availability
- **🔄 Continuous scheduling** — auto-executes every N minutes within the window, retries 3 times on failure
- **📊 Quota history tracking** — AGy only shows current usage; this tool collects and stores history
- **💻 Web dashboard** — status, scheduler, charts, settings, logs, all in your browser

> **Bottom line: Auto-refresh to prevent starvation, track usage trends with charts, all可视.**

---

## Features ✨

| Capability | Description |
|------------|-------------|
| 🕐 **Scheduled Execution** | Configurable time window + interval, triggers precisely at the scheduled minute |
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

# 3. Open in browser
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
| **Settings** | Visual `config.json` editor, save to hot-reload |
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
    "host": "0.0.0.0"
  }
}
```

| Field | Description |
|-------|-------------|
| `scheduler.startTime` / `endTime` | Daily execution window |
| `scheduler.intervalMinutes` | Execution interval within window |
| `command.executable` / `args` | Command and arguments to execute |
| `monitor.intervalMinutes` | Quota collection interval |
| `monitor.agyTimeoutMs` | HTTP timeout for quota collection |
| `web.port` / `web.host` | Dashboard listen address |

> All settings are editable via the Web UI and take effect immediately on save.

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
  └─ Web Server   → Elysia REST + SSE + static SPA

Runtime (singleton)
  ├─ State: daemon / monitor status
  ├─ EventEmitter → SSE → real-time browser updates
  └─ Ring buffer log (500 entries)
```

**Tech Stack:** [Bun](https://bun.sh/) · [Elysia](https://elysiajs.com/) · SQLite · Chart.js · Vanilla JS

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
