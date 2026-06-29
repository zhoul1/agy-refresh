<p align="center">
  <strong>中文</strong> · <a href="README.en.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Bun-1.3%2B-black?logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/tests-91_%E2%9C%94%EF%B8%8F-brightgreen" alt="Tests">
  <img src="https://img.shields.io/badge/PRs-welcome-orange" alt="PRs Welcome">
</p>

<div align="center">

# AGy Refresh ⚡

### 你的 AI 额度，永不断电。零操作，全自动。

**自动保持 AGy / antigravity / Codeium 的额度持续可用 —— 浏览器仪表盘实时监控，Windows 系统托盘一眼看到底。**

---

## 🚨 Antigravity 2.0 不能装插件？我们用这个补上。

Antigravity 2.0 不支持安装 IDE 插件来查看额度使用情况，**AGy Refresh 就是那个替代品**。

- **📊 完整仪表盘** — 不像 IDE 插件那样藏在角落，而是独立的 5 Tab 控制中心
- **📈 历史趋势图** — IDE 插件只能看当前用量，这里能看 24h / 7d / 30d 的变化曲线
- **🪟 系统托盘常驻** — 比 IDE 插件更方便，不用打开编辑器也能一眼看到额度
- **🔔 实时通知** — 额度耗尽、连接断开，第一时间弹窗提醒
- **🌐 随时随地访问** — 局域网内任何设备都能打开仪表盘，不只是 IDE 里

> **IDE 插件能做的，这个能做。IDE 插件做不了的，这个也能做。**

</div>

---

## 痛点

AGy 提供慷慨的 AI 额度，但**额度重置有一个前提**：在特定时间点必须有对话活动。错过窗口期，就只能干等。手动发消息维持活跃度？太麻烦了。你值得更好的方式。

## 解决方案

AGy Refresh 帮你搞定一切：

- **定时对话** 自动抓住重置窗口，每天准时触发
- **额度监控** 实时追踪所有模型的使用情况
- **精美仪表盘** 状态、历史图表、控制面板一目了然
- **系统托盘图标** (Windows) 像电池电量一样，一眼看见剩余 Credits

> **一句话：** 装上就不管了。AI 额度永远新鲜。

---

## 截图预览

| 总览 | 调度 | 趋势 |
|------|------|------|
| 实时额度、倒计时、快捷操作 | 启停控制、执行历史 | 按模型分组，24h / 7d / 30d 切换 |

| 设置 | 系统托盘 |
|------|----------|
| 可视化配置、热重载、托盘开关 | 颜色指示：绿 → 橙 → 红 |

---

## 为什么值得 Star？⭐

| 亮点 | 价值 |
|------|------|
| **🪟 系统托盘额度指示器** | 绿(充足)、橙(警告)、红(耗尽)，悬停查看详情，右键直接操作。不用打开任何窗口 |
| **🤖 全自动运行** | 定时触发，失败自动重试。你睡觉，它在干活 |
| **📊 精美仪表盘** | 5 个 Tab 的 SPA：总览、调度、趋势、设置、日志。SSE 实时推送 |
| **🔥 极致性能** | Bun + Elysia 驱动，内存占用极低，启动瞬间完成 |
| **⚙️ 零重启热重载** | 浏览器改配置，保存即生效，无需重启进程 |
| **🌍 中英双语** | 自动检测浏览器语言，右上角一键切换 |
| **🧪 生产级质量** | 91 个测试覆盖调度器、额度解析、数据库、配置、Web API、运行时 |
| **📦 极简单依赖** | 只有 `elysia` 一个外部依赖，其余全部使用 Bun 内置模块 |
| **🔒 隐私优先** | 100% 本地运行。不上云、不要 API Key、无遥测 |
| **🛠️ 易于扩展** | 清晰架构、TDD 驱动、适配其他工具很简单 |

---

## 功能特性

| 能力 | 说明 |
|------|------|
| 🪟 **系统托盘** | 颜色指示用量，悬停看详情，右键菜单操作，Toast 通知提醒 |
| 🕐 **定时调度** | 可配时间窗口 + 频率，精确到分钟级触发 |
| 🔁 **自动重试** | 最多 3 次重试（间隔 10 秒），不错过任何一次窗口 |
| 📡 **额度监控** | 调用 AGy Connect RPC API 拉取数据，存入 SQLite |
| 📈 **趋势图表** | Chart.js 折线图，按模型分组，支持 24h / 7d / 30d 切换 |
| 🌐 **Web 仪表盘** | 5 个 Tab：总览、调度、趋势、设置、日志，全实时 |
| ⚙️ **热重载** | 浏览器修改配置，保存即生效 |
| 🔔 **SSE 推送** | 状态变更、采集结果、日志流实时推送到浏览器 |
| 🌍 **i18n** | 中英双语，自动检测 + 一键切换 |
| 🧪 **91 个测试** | 完整覆盖：调度器、执行器、解析器、数据库、运行时、Web API |

---

## 快速开始

### 前置条件

- [Bun](https://bun.sh/) (v1.3+)
- [AGy (antigravity)](https://codeium.com/) CLI 已在 PATH 中且语言服务器正在运行
- Windows（系统托盘功能需要）

```bash
# 1. 安装依赖
bun install

# 2. 一键启动（调度 + 监控 + Web 仪表盘）
bun run start --all

# 3. 打开浏览器
open http://localhost:6789

# 4. 进入设置 → 开启系统托盘 → 搞定
```

### 后台运行（推荐）

```bash
# PM2 进程守护
bun run pm2:start

# 开机自启（只需一次）
pm2 startup
pm2 save
```

---

## 仪表盘一览

| Tab | 内容 |
|-----|------|
| **总览** | 下次对话倒计时、Prompt/Flow Credits、最新模型额度表、快捷按钮 |
| **调度** | 启停控制、下次执行倒计时、最近执行结果、完整历史 |
| **趋势** | 按模型分组的使用率折线图，按池聚合（Gemini / Claude / GPT-OSS） |
| **设置** | 可视化配置编辑器、系统托盘开关、局域网地址检测 |
| **日志** | daemon / monitor / web 实时日志流，可按来源和级别筛选 |

---

## 配置说明

```json
{
  "scheduler": {
    "startTime": "08:00",
    "endTime": "23:30",
    "intervalMinutes": 30
  },
  "command": {
    "executable": "agy",
    "args": ["--prompt", "你好"]
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

所有配置均可通过 Web UI 修改，无需编辑文件。

---

## CLI 模式

```bash
bun run start --all              # 调度 + 监控 + Web + 托盘（推荐）
bun run start --serve-only       # 仅 Web 仪表盘
bun run start --daemon-only      # 仅调度 + Web
bun run start --monitor-only     # 仅监控 + Web
bun run start --once             # 执行一次对话后退出
bun run start --collect-now      # 采集一次额度后退出
```

---

## 架构设计

```
CLI --all
  ├─ Daemon       → 定时循环，执行命令，失败自动重试
  ├─ Monitor      → 定时 RPC 调用 → SQLite 存储
  ├─ Web Server   → Elysia REST API + SSE + 静态 SPA
  └─ Tray Icon    → PowerShell 系统托盘图标 (Windows)

运行时 (单例)
  ├─ 状态管理：daemon / monitor 运行状态
  ├─ EventEmitter → SSE → 浏览器实时更新
  └─ 环形日志缓冲区：500 条，自动清理
```

**技术栈：** [Bun](https://bun.sh/) · [Elysia](https://elysiajs.com/) · SQLite · Chart.js · 原生 JavaScript · PowerShell

---

## 测试

```bash
bun test
```

| 模块 | 测试数 | 覆盖范围 |
|------|-------|---------|
| 调度器 | 11 | 时刻边界、精确触发、跨日场景 |
| 执行器 | 2 | 命令执行适配器 |
| 额度解析 | 14 | AGy 额度 JSON 解析 |
| 进程检测 | 10 | 参数提取与评分 |
| 数据库 | 6 | SQLite CRUD + 幂等性 |
| 执行历史 | 6 | 执行记录持久化 |
| 配置保存 | 10 | 校验 + 原子写入 |
| 运行时 | 11 | 单例 + EventEmitter + 缓冲区 |
| Connect RPC | 6 | RPC 客户端 + 集成 |
| Web API | 17 | REST 路由 + SSE + 静态文件 |
| **合计** | **91** | **全部绿灯** |

---

## 适合谁？

- **AGy / antigravity / Codeium 用户** —— 想最大化利用免费额度的每一位
- **自动化爱好者** —— 喜欢"装完就不用管"的工具
- **私有部署拥趸** —— 偏好本地优先、尊重隐私的软件
- **Bun / Elysia 粉丝** —— 欣赏极简依赖和优雅架构的开发者

---

## 开源协议

MIT —— 免费使用、修改和分发。

---

<div align="center">

**觉得有用？** 点个 ⭐ 并分享给同样使用 AGy 的朋友！

*用 ❤️ 构建 by [zhoul1](https://github.com/zhoul1)*

</div>
