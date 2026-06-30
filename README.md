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

**自动保持 AGy / antigravity / Codeium 的额度持续可用 —— 系统托盘彩色图标一眼看穿用量，手机远程随时查看仪表盘。**

</div>

---

## 三大杀手锏

### 1. 🪟 系统托盘彩色图标 — 比电池电量还直观

右下角常驻一个图标，颜色随用量变化：

- 🟢 **绿色** — 额度充足，放心用
- 🟠 **橙色** — 已用过半，注意节制
- 🔴 **红色** — 即将耗尽，准备迎接下一轮
- ❌ **灰色叉号** — 连接断开

**悬停看详情**：Gemini / Claude / GPT 各池用量百分比 + 下次重置时间，一行搞定。

**右键菜单**：立刻采集、打开面板、查看每个模型用量，不用打开任何窗口。

### 2. 📱 手机远程查看 — 配合穿墙软件，随时随地

Web 仪表盘监听 `0.0.0.0`，局域网内任何设备都能访问。配合 Tailscale / ZeroTier 等穿墙工具，**手机远程查看用量**：

- 在公司用手机看家里电脑的 AI 额度
- 出差路上随时查看各模型消耗
- 多设备共享同一个仪表盘

> **别人用 IDE 插件看额度 → 你用浏览器 + 手机，全平台覆盖。**

### 3. 🤖 全自动额度续命 — 你睡觉，它在干活

AGy 的额度重置机制：**特定时间点有对话活动，就能解锁新一轮额度**。

AGy Refresh 替你盯着：
- 每天 08:00-23:30 自动发送对话请求
- 失败自动重试 3 次，不错过任何窗口
- 每 10 分钟采集一次额度，存入 SQLite 历史库

> **装上就不管了。AI 额度永远新鲜。**

---

## 有人问：这玩意儿真的有用吗？

**有。非常有用。**

- 你每天省下的**手动发消息时间** ≈ 30 分钟
- 你避免的**额度浪费** ≈ 每月多用好几天 AI
- 你获得的**安心感** ≈  priceless

**这不是一个小工具，这是你对 AI 额度掌控权的回归。**

别人还在手动发消息维持额度 → 你已经躺在沙发上看着托盘图标绿得发亮。
别人还在 IDE 角落里翻额度 → 你已经用手机远程查看全量趋势图。
别人还在担心额度耗尽 → 你的 AI 额度永不断电。

**这就是差距。**

---

## 为什么值得 Star？⭐

| 维度 | 开源项目平均 | AGy Refresh |
|------|-------------|-------------|
| 🧪 测试覆盖 | 多数无测试 | **91 个测试**，核心逻辑全覆盖 |
| 📦 依赖数量 | 平均 5-20 个 | **仅 1 个**（elysia），其余全是内置 |
| 🚀 启动速度 | 秒级 | **毫秒级**，Bun 驱动 |
| 💾 内存占用 | 50MB+ | **~50MB**，极致轻量 |
| 🔒 隐私 | 部分上云 | **100% 本地**，数据不出本机 |
| 🌍 国际化 | 英文为主 | **中英双语**，开箱即用 |
| ⚙️ 配置体验 | 改配置文件 | **Web UI 可视化**，热重载 |
| 📊 数据可视化 | 表格为主 | **Chart.js 趋势图**，24h/7d/30d |
| 🪟 系统级集成 | 无 | **托盘彩色图标**，比电池还直观 |
| 📱 远程访问 | 需自建 | **开箱即用**，手机浏览器直接看 |

> **这不是又一个监控工具 —— 这是一个把"装完就不管"做到极致的艺术品。**

---

## 功能全景

| 能力 | 说明 |
|------|------|
| 🪟 **系统托盘** | 彩色图标、悬停详情、右键菜单、按池用量统计 + 重置时间 |
| 📱 **远程仪表盘** | 局域网访问，配合穿墙工具手机远程查看 |
| 🕐 **定时调度** | 可配时间窗口 + 频率，精确到分钟级触发 |
| 🔁 **自动重试** | 最多 3 次重试（间隔 10 秒），不错过任何窗口 |
| 📡 **额度监控** | 调用 AGy Connect RPC API 拉取数据，存入 SQLite |
| 📈 **趋势图表** | Chart.js 折线图，按模型池分组，24h / 7d / 30d 切换 |
| 🌐 **Web 仪表盘** | 5 Tab：总览、调度、趋势、设置、日志，全实时 |
| ⚙️ **热重载** | 浏览器修改配置，保存即生效 |
| 🔔 **SSE 推送** | 状态变更、采集结果、日志流实时推送到浏览器 |
| 🌍 **i18n** | 中英双语，自动检测 + 一键切换 |
| 🧪 **91 个测试** | 生产级质量，覆盖核心逻辑 |

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

# 3. 浏览器打开 http://localhost:6789
#    设置 → 开启系统托盘 → 搞定
```

### 手机远程查看

```bash
# 方案 1：局域网直连
# 电脑和手机在同一 WiFi，手机浏览器打开 http://<电脑IP>:6789

# 方案 2：Tailscale（推荐）
# 电脑和手机都安装 Tailscale
# 手机浏览器打开 https://<电脑Tailscale IP>:6789
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
- **远程办公族** —— 手机随时查看家里电脑的 AI 用量
- **隐私优先者** —— 100% 本地运行，数据不出本机
- **Bun / Elysia 粉丝** —— 欣赏极简依赖和优雅架构的开发者

---

## 开源协议

MIT —— 免费使用、修改和分发。

---

<div align="center">

**觉得有用？** 点个 ⭐ 并分享给同样使用 AGy 的朋友！

*用 ❤️ 构建 by [zhoul1](https://github.com/zhoul1)*

</div>
