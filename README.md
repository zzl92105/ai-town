# AI 小镇

AI 小镇是一款 macOS 桌面端 AI 文本解谜游戏原型。玩家在小镇中调查失踪账本案，搜索地点、收集线索、和 NPC 问询，逐步整理证据链并提交最终推理。

项目当前实现了一个完整可玩的 MVP 案件包：`cases/missing-ledger/`。

## 功能概览

- 桌面端应用：基于 Tauri 打包为 macOS App。
- 案件调查：地点搜索、线索发现、线索标记、阶段推进。
- NPC 问询：固定话题对话 + DeepSeek 自由问答。
- AI 防剧透：按调查阶段、证据完整度、NPC 口吻和允许话题约束自由问答，并对模型返回做二次校验。
- 推理系统：矛盾识别、推理笔记、最终答案评分和结局复盘。
- 证据链：在线索板拖放/排序关键线索，并在最终推理中一键引用。
- 本地存档：Tauri 桌面环境使用 SQLite，Web 调试环境使用 localStorage 兜底。
- 案件配置：人物、地点、线索、话题、阶段和真相均以 JSON 组织；首页已有案件库元信息入口。

## 技术栈

- Tauri 2
- React 18
- TypeScript
- Vite
- Zustand
- Zod
- Rust + SQLite
- DeepSeek Chat API

## 目录结构

```text
cases/missing-ledger/        内置案件包
docs/                        PRD 和界面设计稿
src/domain/                  案件类型、校验、推理评分规则
src/domain/aiGuardrails.ts   NPC AI 透露边界和模型输出二次校验
src/domain/evidenceChain.ts  证据链排序和最终推理辅助
src/services/deepseek.ts     DeepSeek NPC 自由问答封装
src/storage/                 前端存档仓储接口和 SQLite 适配
src/store/gameStore.ts       游戏主状态和调查流程
src/ui/                      React 界面
src-tauri/                   Tauri/Rust 桌面端代码
```

## 开发环境

需要安装：

- Node.js
- pnpm 8.x
- Rust/Cargo
- macOS 上的 Xcode Command Line Tools

安装依赖：

```bash
pnpm install
```

如果本机 pnpm 版本不兼容，可以使用仓库声明版本：

```bash
npx pnpm@8.15.9 install
```

## 本地运行

启动 Tauri 桌面应用：

```bash
pnpm dev
```

仅调试前端：

```bash
pnpm web:dev
```

然后访问：

```text
http://127.0.0.1:1420/
```

## AI 对话配置

自由问答使用 DeepSeek API。App 内设置页可填写 DeepSeek API Key；开发环境也可以通过环境变量兜底：

```bash
DEEPSEEK_API_KEY=your_key pnpm dev
```

未配置 API Key 时，仍可进行本地调查、固定话题问询、线索整理和最终推理，但不能使用自由 AI 对话。

## 验证

运行测试：

```bash
pnpm test
```

构建前端：

```bash
pnpm build
```

检查 Tauri/Rust：

```bash
cd src-tauri
cargo check
cargo fmt --check
```

## 打包 macOS App

生成 macOS 应用和 DMG：

```bash
pnpm tauri build
```

默认产物位置：

```text
src-tauri/target/release/bundle/macos/
src-tauri/target/release/bundle/dmg/
```

当前本地构建默认未做 Apple Developer ID 签名和公证，分发给他人时 macOS 可能提示“无法验证开发者”。正式分发建议补齐签名和 notarization。

## 设计文档

需求文档见：

- [docs/PRD.md](docs/PRD.md)

界面效果图：

- [调查桌与 NPC 问询](docs/assets/mockup-investigation-interrogation.png)
- [镇内地图与最终推理](docs/assets/mockup-map-deduction.png)
