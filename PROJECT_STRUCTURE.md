# 项目文件索引 (PROJECT_STRUCTURE.md)

以下为本项目的文件目录结构索引：

- `config.json` - 时间规则、命令执行、监控采集、Web 仪表盘全局配置文件（Web UI 可视化编辑，热生效）。
- `.gitignore` - Git 忽略规则配置文件。
- `package.json` - Bun 项目配置，定义运行脚本与依赖。
- `README.md` - 项目说明文档。
- `PROJECT_STRUCTURE.md` - 本项目文件索引文档。
- `GEMINI.md` - AI 开发规范与提示词约束文件。
- `src/`
  - `cli/`
    - `index.ts` - CLI 入口：`--all` / `--serve-only` / `--daemon-only` / `--monitor-only` / `--once` / `--collect-now`，统一注册运行时工厂并启动 web
  - `lib/`
    - `config.ts` - 配置文件加载、校验、保存（`loadConfig` / `validateConfig` / `saveConfig` / `ConfigValidationError`）
    - `scheduler.ts` - 定时时间计算逻辑（纯函数）
    - `executor.ts` - 本地 agy CLI 调用适配器
    - `daemon.ts` - 守护进程循环：定时调度 + 执行历史落库 + 手动单次触发（`runDaemonOnce`）
    - `agy-process.ts` - 检测 antigravity 语言服务器进程，提取 pid / csrf_token / port（含 extractArg / scoreCandidate 纯函数）
    - `agy-quota.ts` - Connect RPC 客户端，探测端口并调用 GetUserStatus 获取额度（export callGetUserStatus 支持 DI）
    - `quota-parser.ts` - 解析 Connect RPC JSON 响应 → QuotaSnapshot（纯函数，无可测试）
    - `database.ts` - SQLite 建表与 CRUD（`quota_records` + `model_quotas` + `daemon_executions`），env 可配置测试路径
    - `collector.ts` - 采集协调器，全端口探测 + port→token 映射 + 定时循环
    - `runtime.ts` - 进程内单例运行时：daemon/monitor 句柄、EventEmitter、500 条环形日志 buffer、状态查询
  - `web/`
    - `index.ts` - Elysia REST API + 静态文件服务：`/api/status` `/api/config` `/api/scheduler/*` `/api/monitor/*` `/api/quota/*` `/api/logs` `/api/events` (SSE)
    - `static/`
      - `index.html` - 单页应用入口（左侧栏 + 顶部状态栏 + 主内容区）
      - `style.css` - 白色主题样式（CSS 变量驱动，响应式布局）
      - `app.js` - 前端逻辑：hash 路由、5 个 Tab 渲染、SSE 实时推送、Chart.js 折线图、表单编辑
- `tests/`
  - `scheduler.test.ts` - 调度器核心逻辑测试（8 tests）
  - `executor.test.ts` - 命令行调用适配器测试（2 tests）
  - `quota-parser.test.ts` - parseUserStatusToSnapshot 纯函数测试（14 tests）
  - `process-detector.test.ts` - extractArg / scoreCandidate 纯函数测试（10 tests）
  - `database.test.ts` - SQLite CRUD + 幂等性测试（6 tests）
  - `daemon-executions.test.ts` - daemon_executions 表 CRUD 测试（6 tests）
  - `config-save.test.ts` - validateConfig + saveConfig 校验/原子写测试（10 tests）
  - `runtime.test.ts` - 运行时单例、启停、EventEmitter、环形 buffer 测试（11 tests）
  - `connect-rpc.test.ts` - callGetUserStatus DI 测试 + 真实 fixture 集成测试（6 tests）
  - `web-api.test.ts` - 端到端 Elysia 路由测试：REST API + SSE + 静态文件服务（17 tests）
  - `web-e2e-validate.ts` - 端到端手动运行验证脚本：启动全套服务 + 16 项 HTTP 断言（开发态验证用，可选运行）
  - `fixtures/`
    - `get-user-status-response.json` - 真实 API 响应 fixture
    - `get-user-status-edge-cases.json` - 边界用例 fixture（耗尽/无 quota/null label）

## 数据流

```
┌──────────────┐    启动     ┌─────────────┐
│ CLI --all    │ ─────────► │ runtime     │
│ (注册工厂)   │             │ (单例)      │
└──────────────┘             └──────┬──────┘
                                    │ 持有
                            ┌───────┴───────┐
                            ▼               ▼
                     ┌─────────────┐ ┌────────────┐
                     │ daemon      │ │ monitor    │
                     │ (定时调度)  │ │ (采集)     │
                     └──────┬──────┘ └─────┬──────┘
                            │ 落库         │ 落库
                            ▼              ▼
                     ┌─────────────────────────┐
                     │ SQLite (quota.db)       │
                     │ + daemon_executions     │
                     └────────────┬────────────┘
                                  │ 查询
                                  ▼
                     ┌─────────────────────────┐
                     │ Web REST API (Elysia)   │
                     │ + SSE 推送              │
                     └────────────┬────────────┘
                                  │ HTTP
                                  ▼
                     ┌─────────────────────────┐
                     │ 浏览器 SPA (白色主题)   │
                     └─────────────────────────┘
```
