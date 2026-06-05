# AutoContinue 自动续杯 — 方案设计

> 状态: `待实现` · 最后更新: 2026-06-05

---

## 要解决的问题

AGy 额度用完后对话中断，用户人不在电脑前，无法手动发「继续」来延续对话。
需要工具在额度恢复后自动向指定对话发送「继续」消息，让对话持续进行。

---

## 核心逻辑

```
Monitor 每 N 分钟采集额度
  → 保存到 SQLite（已有）
  → 对比上次与本次额度
  → 如果「上次剩余 < 耗尽阈值」且「这次剩余 > 刷新阈值」
       → 执行命令: agy --conversation=<UUID> -p "继续"
       → 记录结果到 auto_continue_logs 表
```

---

## 配置

### config.json 新增段

```json
{
  "autoContinue": {
    "enabled": true,
    "conversationId": "0891d29c-6b8f-40d0-9857-408586519998",
    "prompt": "继续",
    "exhaustedThreshold": 20,
    "refreshThreshold": 50
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `enabled` | boolean | 总开关 |
| `conversationId` | string | 目标对话 UUID，用户在设置页手动填入（从 TUI `/resume` 退出提示复制） |
| `prompt` | string | 发送的消息内容，默认"继续" |
| `exhaustedThreshold` | number | 剩余额度低于此值视为"耗尽"（百分比，默认 20） |
| `refreshThreshold` | number | 剩余额度高于此值视为"已刷新"（百分比，默认 50） |

---

## 数据库

### 新建表 auto_continue_logs

```sql
CREATE TABLE auto_continue_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  run_at      TEXT NOT NULL,           -- ISO 时间戳
  success     INTEGER NOT NULL,        -- 0/1
  stdout      TEXT,                    -- agy 命令输出
  stderr      TEXT,                    -- agy 命令错误输出
  duration_ms INTEGER,                -- 执行耗时
  conversation_id TEXT,               -- 使用的对话 UUID
  prompt      TEXT,                    -- 发送的消息
  quota_used_before REAL,             -- 触发前的已用额度百分比
  quota_used_after  REAL              -- 触发后的已用额度百分比
);
```

---

## 文件改动清单

| 文件 | 改动 |
|------|------|
| `src/lib/config.ts` | 新增 `AutoContinueConfig` 接口 + 默认值 + validate 校验 |
| `src/lib/runtime.ts` | 新增 `recordAutoContinue()`、`getAutoContinueLogs()` |
| `src/lib/database.ts` | 新增 `saveAutoContinueLog()`、`getAutoContinueLogs()` |
| `src/lib/executor.ts` | 新增 `continueConversation(config, conversationId)` 拼接 `agy --conversation=<ID> -p "继续"` 并执行 |
| `src/lib/collector.ts` | 采集成功后调 `maybeTriggerAutoContinue()`，检查额度状态并触发 |
| `src/web/index.ts` | 新增 API: `GET /api/monitor/auto-continue/status`、`GET /api/monitor/auto-continue/logs` |
| `src/web/static/app.js` | 总览页加状态卡片、监控页加配置/开关/日志 |
| `src/web/static/index.html` | UI 微调 |
| `tests/` | 新增 `auto-continue.test.ts` |

---

## 仪表盘 UI

### 总览页 — 新增卡片

```
┌─ 自动续杯 ─────────────────────────────────┐
│  状态: ● 已启用 / ○ 已关闭                  │
│  最近触发: 5 分钟前 — 成功/失败             │
│  累计: 已成功续杯 3 次                      │
│  目标对话: 0891d29c-... (前 8 位)           │
└─────────────────────────────────────────────┘
```

### 监控页 — 新增 autoContinue 段

- 开关按钮 (enabled)
- 配置表格: conversationId、prompt、阈值
- 触发历史列表 (分页)

### 设置页 — 新增 autoContinue 段

- enabled: 开关
- conversationId: 文本输入框（粘贴 UUID）
- prompt: 文本输入框
- exhaustedThreshold: 数字输入框
- refreshThreshold: 数字输入框

---

## 使用流程

1. 用户进一次 agy TUI → `/resume` 找到当前项目对话 → 退出复制 UUID
2. 在 Web 仪表盘 **设置 → 自动续杯** 填入 UUID，开启开关
3. 每次额度耗尽 → 刷新 → 自动发「继续」
4. 仪表盘的**总览页**可以看到触发状态，**监控页**可查看详细日志

---

## 注意事项

- `conversationId` 的稳定性未经验证。如果 AGy 服务端导致 ID 失效，需用户手动更新
- 如果 `--conversation=<ID>` 后续不可用，可降级为 `--continue`（延续最近 CLI 会话）
- `/resume` 对话列表的自动化获取暂不支持（无已知 RPC 接口）
- 只监控一个固定对话，不处理多对话场景
