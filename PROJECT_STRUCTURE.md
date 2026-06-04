# 项目文件索引 (PROJECT_STRUCTURE.md)

以下为本项目的文件目录结构索引：

- `config.json` - 本地时间规则与命令执行配置文件。
- `.gitignore` - Git 忽略规则配置文件。
- `package.json` - Bun 项目配置，定义运行脚本与依赖。
- `PROJECT_STRUCTURE.md` - 本项目文件索引文档。
- `GEMINI.md` - AI 开发规范与提示词约束文件。
- `src/` - 源代码目录。
  - `cli/` - 命令行入口目录。
    - `index.ts` - 守护进程/命令行的启动入口。
  - `lib/` - 核心业务逻辑与适配器目录（无状态）。
    - `config.ts` - 配置文件加载与校验逻辑。
    - `scheduler.ts` - 定时时间计算逻辑（纯函数）。
    - `executor.ts` - 本地命令行调用适配器。
    - `daemon.ts` - 定时循环的核心调度控制。
- `tests/` - 自动化测试目录。
  - `scheduler.test.ts` - 时间计算核心测试用例。
  - `executor.test.ts` - 命令行调用功能测试用例。
