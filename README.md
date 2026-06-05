<p align="center">
  <a href="README.en.md">English</a> · <strong>中文</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Bun-1.3%2B-black?logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/tests-91_✔️-brightgreen" alt="Tests">
  <img src="https://img.shields.io/badge/PRs-welcome-orange" alt="PRs Welcome">
</p>

<div align="center">

# AGy Refresh ⚡ — 系统托盘中的额度管家

**无需打开浏览器，任务栏右下角一眼看见你的 AI 用量。**

</div>

---

## 🪟 Windows 系统托盘 — 电池电量般的额度指示器

**这是本工具最亮眼的功能。** AGy 2.0 无法安装插件查看额度？我们直接把仪表盘塞进你的任务栏右下角。

- **🎨 图标随用量变色** — 绿色(充足) → 橙色(警告) → 红色(耗尽)，像电池电量一样一眼可知
- **🖱️ 鼠标悬停看详情** — Credits 剩余量、模型数量、调度状态，不用打开任何窗口
- **📋 右键菜单直接操作** — 立刻采集、打开面板、查看每个模型的用量百分比
- **🔔 状态变更通知** — 断开连接、重新上线，Windows 通知气泡实时提醒
- **⚙️ Web 设置一键开关** — 不想要随时关掉

> 其他工具让你进设置看额度 → **AGy Refresh 把额度送到你眼前。**

---

## Why? 🤔

AGy 的用量重置机制决定了：**只要在特定时间点有对话活动，就能解锁新一轮的额度使用周期。**\
但这个窗口不会自动触发，错过就得等下一个周期。

AGy Refresh 替你盯着：

- **🪟 系统托盘常驻** — 看一眼右下角就知道今天还有多少额度
- **⏰ 每天 08:00 准时发起对话** — 抓住重置窗口，保障全天可用
- **🔄 持续调度** — 窗口期内每 N 分钟自动执行，失败自动重试 3 次
- **📊 额度历史追踪** — AGy 只显示当前用量，没有趋势图？我们自己采
- **💻 Web 仪表盘** — 状态、调度、图表、配置、日志，浏览器全搞定

> 一句话：**自动刷新，防止饿死，桌面常驻，用量可视。**

---

## Features ✨

| 能力 | 说明 |
|------|------|
| 🪟 **Windows 系统托盘** | 颜色指示用量(绿/橙/红)，悬停看详情，右键菜单操作，通知提醒 |
| 🕐 **定时调度** | 可配开始/结束时间 + 频率，整点精确触发 |
| 🔁 **自动重试** | 执行失败自动重试 3 次（间隔 10s），不放过任何一次窗口 |
| 📡 **额度采集** | 每 N 分钟调用 AGy Connect RPC API 拉取用量，入库 SQLite |
| 📈 **历史趋势** | Chart.js 折线图，24h / 7d / 30d 自由切换 |
| 🌐 **Web 仪表盘** | 总览、调度控制、趋势图、配置编辑、实时日志，5 个 Tab 全搞定 |
| ⚙️ **配置热重载** | Web UI 改配置即存即生效，无需重启 |
| 🔔 **SSE 实时推送** | 状态变更、采集完成、日志流，浏览器即时更新 |
| 🌍 **i18n** | 中/英双语，自动检测浏览器语言，右上角一键切换 |
| 🧪 **91 个测试** | 单元测试 + 集成测试全覆盖，持续集成绿灯 |

---

## Quick Start 🚀

```bash
# 1. 安装依赖
bun install

# 2. 一键启动（调度 + 采集 + Web 仪表盘）
bun run start --all

# 3. 浏览器打开设置 → 开启系统托盘
open http://localhost:6789
```

### 后台运行（推荐）

```bash
# 使用 PM2 守护进程
bun run pm2:start

# 开机自启（仅需一次）
pm2 startup
pm2 save
```

---

## Dashboard 一览 🖥️

| Tab | 内容 |
|-----|------|
| **总览** | 下次对话倒计时、Prompt Credits、最新模型额度表、快捷操作 |
| **调度** | 启停控制、下一次执行倒计时、最近一次执行结果、历史记录 |
| **趋势** | 每个模型的使用率 Chart.js 折线图（24h / 7d / 30d） |
| **设置** | 可视化编辑 `config.json`，**系统托盘开关**，保存即热生效 |
| **日志** | daemon / monitor / web SSE 实时日志流，按来源/级别筛选 |

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
    "args": ["--prompt", "你是谁"]
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

> 所有配置均可通过 Web UI 修改，保存即热生效。

---

## CLI 模式

```bash
bun run start --all              # 调度 + 采集 + Web（推荐）
bun run start --serve-only       # 仅 Web 仪表盘
bun run start --daemon-only      # 仅调度 + Web
bun run start --monitor-only     # 仅采集 + Web
bun run start --once             # 立即执行一次对话，退出
bun run start --collect-now      # 立即采集一次额度，退出
```

---

## Architecture 🏗️

```
CLI --all
  ├─ Daemon       → 定时循环，执行命令，失败重试
  ├─ Monitor      → 定时采集 Connect RPC → SQLite
  ├─ Web Server   → Elysia REST + SSE + 静态 SPA
  └─ Tray Icon    → PowerShell 系统托盘 (Windows)

Runtime (单例)
  ├─ 状态管理: daemon / monitor 运行状态
  ├─ EventEmitter → SSE → 浏览器实时更新
  └─ 环形日志 buffer (500 条)
```

**技术栈：** [Bun](https://bun.sh/) · [Elysia](https://elysiajs.com/) · SQLite · Chart.js · Vanilla JS · PowerShell

---

## Tests 🧪

```bash
bun test
```

| 模块 | 测试数 | 覆盖范围 |
|------|-------|---------|
| Scheduler | 11 | 时刻边界，整点触发，跨日 |
| Executor | 2 | 命令执行适配器 |
| Quota Parser | 14 | AGy 额度 JSON 解析 |
| Process Detector | 10 | 进程检测参数提取 |
| Database | 6 | SQLite CRUD + 幂等 |
| Daemon Executions | 6 | 执行历史表 CRUD |
| Config Save | 10 | 配置校验 + 原子写 |
| Runtime | 11 | 单例 + EventEmitter + Buffer |
| Connect RPC | 6 | RPC 客户端 + 集成 |
| Web API | 17 | REST 路由 + SSE + 静态文件 |
| **合计** | **91** | **100% 绿灯** |

---

## License 📄

MIT
