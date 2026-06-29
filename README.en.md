<p align="center">
  <a href="README.md">中文</a> · <strong>English</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Bun-1.3%2B-black?logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/tests-91_%E2%9C%94%EF%B8%8F-brightgreen" alt="Tests">
  <img src="https://img.shields.io/badge/PRs-welcome-orange" alt="PRs Welcome">
</p>

<div align="center">

# AGy Refresh ⚡

### Your AI Quota, Always Refilled. Zero Effort.

**Automatically keeps your AGy / antigravity / Codeium credits alive — with a live dashboard in your browser and a battery-style indicator in your system tray.**

---

## 🚨 Antigravity 2.0 Has No Plugin Support? We Fill That Gap.

Antigravity 2.0 doesn't support IDE plugins to check your quota — **AGy Refresh is the replacement**.

- **📊 Full Dashboard** — Not hidden in a corner like an IDE plugin, but a dedicated 5-tab control center
- **📈 Historical Trends** — IDE plugins only show current usage; here you get 24h / 7d / 30d trend curves
- **🪟 System Tray Resident** — More convenient than an IDE plugin, check credits without opening the editor
- **🔔 Real-time Alerts** — Credit exhausted, disconnected — pop-up notifications instantly
- **🌐 Access Anywhere** — Any device on your LAN can open the dashboard, not just inside the IDE

> **It does everything an IDE plugin does — and everything an IDE plugin can't.**

</div>

---

## The Problem

AGy gives you generous AI credits that **reset on a schedule** — but only if your account stays active at the right moment. Miss the window, and you're stuck waiting. Manually sending prompts to keep the quota alive is tedious. You have better things to do.

## The Solution

AGy Refresh automates the boring stuff:

- **Scheduled conversations** keep your reset window active every day
- **Quota monitoring** tracks usage across all models in real-time
- **Beautiful dashboard** shows status, history charts, and controls
- **System tray icon** (Windows) gives you a quick glance at remaining credits — like a battery indicator for your AI

> **TL;DR:** Set it and forget it. Your AI credits stay fresh, always.

---

## Screenshots

| Overview | Scheduler | Trends |
|----------|-----------|--------|
| Live quota, countdowns, quick actions | Start/stop, execution history | Per-model usage over 24h / 7d / 30d |

| Settings | System Tray |
|----------|-------------|
| Hot-reload config, enable tray icon | Color-coded: green → orange → red |

---

## Why Star This Repo? ⭐

| Feature | Why It Matters |
|---------|---------------|
| **🪟 System Tray Quota Indicator** | See your credits at a glance — green (plenty), orange (warning), red (exhausted). Hover for details, right-click for actions. No app to open. |
| **🤖 Fully Automated** | Runs on schedule, retries on failure. You sleep, it works. |
| **📊 Beautiful Dashboard** | 5-tab SPA: overview, scheduler, trends, settings, logs. All real-time via SSE. |
| **🔥 Blazing Fast** | Built with Bun + Elysia — minimal memory, instant startup. |
| **⚙️ Zero Restart Needed** | Change settings in the browser, changes apply instantly. |
| **🌍 Bilingual** | English and Chinese, auto-detected from your browser. |
| **🧪 Production Ready** | 91 tests covering scheduler, quota parser, database, config, web API, runtime. |
| **📦 One Dependency** | Only `elysia` — everything else uses Bun built-ins (`bun:sqlite`, `bun:child_process`, etc.). |
| **🔒 Privacy First** | Runs 100% locally. No cloud, no API keys, no telemetry. |
| **🛠️ Extensible** | Clean architecture, TDD-first, easy to adapt for other tools. |

---

## Features

| Capability | Description |
|------------|-------------|
| 🪟 **System Tray** | Color-coded icon, hover tooltips, right-click menu, toast notifications |
| 🕐 **Scheduler** | Configurable time window + frequency, precise minute-level triggers |
| 🔁 **Auto Retry** | Up to 3 retries with 10s intervals — never misses a window |
| 📡 **Quota Monitor** | Queries AGy Connect RPC API, stores in SQLite |
| 📈 **Trend Charts** | Chart.js line graphs per model, 24h / 7d / 30d views |
| 🌐 **Web Dashboard** | 5-tab SPA: Overview, Scheduler, Trends, Settings, Logs |
| ⚙️ **Hot-Reload** | Edit config via UI, applies instantly |
| 🔔 **SSE Push** | Real-time status, logs, and events streamed to browser |
| 🌍 **i18n** | English / Chinese, auto-detect + one-click toggle |
| 🧪 **91 Tests** | Full coverage: scheduler, executor, parser, database, runtime, web API |

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.3+)
- [AGy (antigravity)](https://codeium.com/) CLI in your PATH with language server running
- Windows (for system tray feature)

```bash
# 1. Install dependencies
bun install

# 2. Start everything (scheduler + monitor + web dashboard)
bun run start --all

# 3. Open your browser
open http://localhost:6789

# 4. Go to Settings → Enable System Tray → Done
```

### Run as a Background Service

```bash
# PM2 process management
bun run pm2:start

# Auto-start on boot (one-time)
pm2 startup
pm2 save
```

---

## Dashboard Tour

| Tab | What You See |
|-----|--------------|
| **Overview** | Next talk countdown, Prompt/Flow Credits, latest model quotas, quick action buttons |
| **Scheduler** | Start/stop daemon, next run countdown, last execution result, full history |
| **Trends** | Per-model usage line charts grouped by pool (Gemini / Claude / GPT-OSS) |
| **Settings** | Visual config editor, system tray toggle, share link detection |
| **Logs** | Real-time daemon / monitor / web log stream, filterable by source and level |

---

## Configuration

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

All settings are editable through the Web UI — no file editing needed.

---

## CLI Modes

```bash
bun run start --all              # Scheduler + Monitor + Web + Tray (recommended)
bun run start --serve-only       # Web dashboard only
bun run start --daemon-only      # Scheduler + Web
bun run start --monitor-only     # Monitor + Web
bun run start --once             # Execute one conversation and exit
bun run start --collect-now      # Collect quota once and exit
```

---

## Architecture

```
CLI --all
  ├─ Daemon       → Scheduled loop, executes commands, auto-retry
  ├─ Monitor      → Periodic RPC calls → SQLite storage
  ├─ Web Server   → Elysia REST API + SSE + Static SPA
  └─ Tray Icon    → PowerShell notification area icon (Windows)

Runtime (Singleton)
  ├─ State Management: daemon / monitor status
  ├─ EventEmitter → SSE → Real-time browser updates
  └─ Ring Buffer: 500 log entries, auto-cleanup
```

**Tech Stack:** [Bun](https://bun.sh/) · [Elysia](https://elysiajs.com/) · SQLite · Chart.js · Vanilla JS · PowerShell

---

## Tests

```bash
bun test
```

| Module | Tests | Coverage |
|--------|-------|----------|
| Scheduler | 11 | Time boundaries, exact triggers, cross-day |
| Executor | 2 | Command execution adapter |
| Quota Parser | 14 | AGy quota JSON parsing |
| Process Detector | 10 | Parameter extraction & scoring |
| Database | 6 | SQLite CRUD + idempotence |
| Daemon Executions | 6 | Execution history persistence |
| Config Save | 10 | Validation + atomic writes |
| Runtime | 11 | Singleton + EventEmitter + Buffer |
| Connect RPC | 6 | RPC client + integration |
| Web API | 17 | REST routes + SSE + static files |
| **Total** | **91** | **All green** |

---

## Who Is This For?

- **AGy / antigravity / Codeium users** who want to maximize their free tier credits
- **Automation enthusiasts** who love "set it and forget it" tools
- **Self-hosted lovers** who prefer local-first, privacy-respecting software
- **Bun / Elysia fans** who appreciate minimal dependencies and clean architecture

---

## License

MIT — free to use, modify, and distribute.

---

<div align="center">

**Found this useful?** Give it a ⭐ and share it with others who use AGy!

*Built with ❤️ by [zhoul1](https://github.com/zhoul1)*

</div>
