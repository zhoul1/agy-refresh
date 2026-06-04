# agy 定时自动对话 + 额度监控控制中心

基于 [Bun](https://bun.sh/) + Elysia + 浏览器 SPA 的一站式工具：定时执行 `agy` 对话、自动采集额度数据，全部通过 Web 仪表盘可视化操作与配置。

> **推荐使用方式**：一条命令启动，浏览器打开 `http://localhost:3000` 即可。

## 功能特性

- **Web 仪表盘**（白色主题）：5 个 Tab 一站式管理
  - 📊 **总览**：下次对话倒计时、最新额度模型表、快捷操作（立即采集 / 立即执行）
  - ⏰ **调度**：daemon 启停控制、状态面板、实时倒计时、执行历史（可展开 stdout/stderr）
  - 📈 **趋势**：每个模型的使用率 Chart.js 折线图，支持 24h / 7d / 30d 切换
  - ⚙️ **设置**：分组表单编辑 `config.json`，保存即热生效
  - 📝 **日志**：daemon / monitor / web 实时日志流（SSE 推送 + 来源/级别过滤）
- **时间规则高度可配置**：每日开始/截止时间 + 频率间隔（分钟）
- **执行命令可配**：默认 `agy --prompt "你好"`，可自定义可执行文件路径与参数
- **高精度调度算法**：基于确定性的 setTimeout 时间差计算，无累计漂移，支持系统休眠恢复
- **配置热重载**：每次调度时刻重新读取 `config.json`
- **额度自动采集**：每 N 分钟通过调用 antigravity 语言服务器 Connect RPC API (GetUserStatus) 采集用量额度，入库 SQLite
- **SSE 实时推送**：浏览器通过 EventSource 接收所有状态变化、采集结果、执行历史
- **Web UI 改配置**：表单保存直接 PUT 到 `/api/config`，通过 `validateConfig` 严格校验，原子写回
- **全链路测试覆盖**：90 个单元 / 集成测试，100% 绿灯

---

## 快速开始

```bash
bun install
bun run start --all
```

打开浏览器访问 `http://localhost:3000` 即可看到控制中心。所有操作（启停调度、修改配置、立即执行、查看历史）都从浏览器完成。

---

## 配置文件

`config.json` 完整结构：

```json
{
  "scheduler": {
    "startTime": "08:00",
    "endTime": "23:30",
    "intervalMinutes": 30
  },
  "monitor": {
    "intervalMinutes": 10,
    "agyTimeoutMs": 8000
  },
  "web": {
    "port": 3000,
    "host": "0.0.0.0"
  },
  "command": {
    "executable": "agy",
    "args": ["--prompt", "你好"]
  }
}
```

字段说明：
- `scheduler.startTime` / `endTime` — 每日运行窗口（HH:MM）
- `scheduler.intervalMinutes` — 窗口内多久执行一次（分钟）
- `monitor.intervalMinutes` — 额度采集间隔（默认 10 分钟）
- `monitor.agyTimeoutMs` — agy 语言服务器 HTTP 请求超时
- `web.port` / `web.host` — 仪表盘监听地址（修改后需重启进程）
- `command.executable` / `args` — 定时触发的命令

> Web UI 设置页可直接编辑；保存后立即生效（daemon 在下一周期重新读取；monitor 重启时拉取）。

---

## 运行模式

```bash
bun run start --all              # 启动 daemon + monitor + Web（推荐，默认）
bun run start --serve-only       # 仅启动 Web（不跑 daemon/monitor）
bun run start --daemon-only      # 仅启动 daemon + Web
bun run start --monitor-only     # 仅启动 monitor + Web
bun run start --once             # 立即执行一次 agy 对话并退出
bun run start --collect-now      # 立即采集一次额度并退出
bun run start --config /path/to/config.json  # 指定配置路径
```

---

## Web API（高级用法）

Web 仪表盘背后的 REST 接口，可以自行用 curl / 脚本操作：

```
GET  /api/status                总状态聚合（daemon + monitor + quota 概览）
GET  /api/config                当前配置
PUT  /api/config                保存配置（带校验，热生效）
POST /api/config/reload         重新加载磁盘配置
GET  /api/scheduler/status      { running, nextRunAt, lastExecution }
POST /api/scheduler/start       启动调度
POST /api/scheduler/stop        停止调度
POST /api/scheduler/run-now     手动触发一次
GET  /api/scheduler/history     执行历史（?limit=50）
GET  /api/monitor/status        { running, nextCollectAt, lastError }
POST /api/monitor/start         启动监控
POST /api/monitor/stop          停止监控
POST /api/monitor/collect-now   手动采集一次
GET  /api/quota/latest          最新额度
GET  /api/quota/history?hours=168
GET  /api/quota/model/:id       单个模型历史
GET  /api/logs?limit=200        日志快照
GET  /api/events                SSE 实时推送（text/event-stream）
```

SSE 事件类型：`daemon` (start/stop/tick/executed) / `monitor` (start/stop/tick/collected/failed) / `log` / `hello`。

---

## 架构总览

```
CLI --all
  ├─ registerDaemonFactory + startDaemon()  → 调度循环
  ├─ registerMonitorFactory + startMonitor() → 采集循环
  └─ startWebServer()                        → REST + SSE + 静态 SPA

runtime (单例)
  ├─ 状态: daemon { running, nextRunAt, lastExecution }
  ├─ 状态: monitor { running, nextCollectAt, lastError }
  ├─ EventEmitter 推送所有变化
  └─ 环形日志 buffer (500 条) → SSE → 浏览器

daemon → 每次执行 写 daemon_executions 表 + emit 'daemon:executed'
monitor → 每次采集 写 quota_records / model_quotas 表 + emit 'monitor:collected'
```

详见 `PROJECT_STRUCTURE.md`。

---

## 自动化测试

```bash
bun test
```

测试覆盖：

| 测试文件 | 测试数 | 范围 |
|---------|--------|------|
| scheduler.test.ts | 8 | 调度时刻边界情况 |
| executor.test.ts | 2 | 命令执行适配器 |
| quota-parser.test.ts | 14 | 额度 JSON 解析纯函数 |
| process-detector.test.ts | 10 | 进程检测参数提取纯函数 |
| database.test.ts | 6 | SQLite CRUD + 幂等性 |
| daemon-executions.test.ts | 6 | 执行历史表 CRUD |
| config-save.test.ts | 10 | 配置校验 + 原子写 |
| runtime.test.ts | 11 | 运行时单例 + EventEmitter + buffer |
| connect-rpc.test.ts | 6 | Connect RPC 客户端 DI + 集成 |
| web-api.test.ts | 17 | Elysia 路由 + SSE + 静态文件 |
| **合计** | **90** | **100% 绿灯** |
