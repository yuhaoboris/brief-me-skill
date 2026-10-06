# brief-me

把多轮讨论里的局部，连成一个能看懂的整体。

`brief-me` 是 Agent Skill，默认面向参与过对话的人。先理清主要部分、关系与依据，再选择合适的表达。需要逐层理解时，生成交互网页：先看整体，选择后让局部成为主视图，展开流程、内部结构和对外关系。文字保持简短，细节与依据按需查看。

同一主题再次调用时，更新原入口并保留可恢复旧版。用户决定是否验收；模型推断、未决问题与原文依据保持区分。文字、图片和视频仍可明确指定。

## 使用

在支持技能 slash command 的客户端中：

```text
/brief-me
/brief-me text 用中文解释，面向非技术同事
/brief-me image 画清楚刚才确定的系统边界
/brief-me web 把这几轮讨论的整体关系串起来，局部按需展开
/brief-me web 根据刚才的修正更新这份解释，保留旧版
/brief-me video 用约 90 秒解释这个机制如何运作
/brief-me text 用英语，严格按 ASD-STE100；说明合规检查范围
```

这些是给 Agent 的自然语言请求，不是独立程序的 CLI 参数。未指定形式时，Agent 根据内容和可用工具选择一种；明确指定后，不会静默换成另一种形式。

**Codex 使用 `$brief-me`。** 例如 `$brief-me 把这几轮讨论的关系讲清楚`。`/brief-me` 并不是所有客户端都支持的统一命令。

## 安装

可分发目录是 [`skills/brief-me/`](skills/brief-me/)，其中 [`SKILL.md`](skills/brief-me/SKILL.md) 是入口。复制整个目录，包含 `references/` 和 `agents/`，不要只复制入口文件。

| 客户端 | 当前项目的技能目录 | 调用 |
| --- | --- | --- |
| Claude Code | `.claude/skills/brief-me/` | `/brief-me` |
| Codex | `.agents/skills/brief-me/` | `$brief-me`，或从技能列表选择 |
| 其他支持 Agent Skills 的客户端 | 使用该客户端文档指定的位置 | 以客户端支持的调用方式为准 |

例如，在目标项目根目录复制到 Claude Code（已有同名技能时先比较内容，避免覆盖）：

```sh
mkdir -p .claude/skills
test ! -e .claude/skills/brief-me && test ! -L .claude/skills/brief-me && cp -R /path/to/brief-me-skill/skills/brief-me .claude/skills/brief-me
```

Codex 同理，把目标路径改为 `.agents/skills/brief-me`。安装后按客户端要求重新加载技能或开启新会话；技能只能总结客户端实际提供的对话上下文。

开发工作区已通过这两个项目目录的符号链接安装技能；这些本机配置不随仓库发布。克隆仓库后，请按上方说明安装。仓库直接提供技能源码，不维护预打包 ZIP。

依据：[Agent Skills 标准](https://agentskills.io/specification)、[Claude Code skills](https://code.claude.com/docs/en/skills)、[Codex skills](https://developers.openai.com/codex/skills)。技能不会自行创建一个能够读取其他客户端历史的后台服务。

## 四种产物及现实边界

| 模式 | 交付 | 运行要求 |
| --- | --- | --- |
| 文字 | 聊天中的简明解释，按需保存文件 | Agent 能访问当前对话 |
| 图片 | 可查看的 SVG、PNG 等图片，按需附可编辑源文件 | 图像工具或图表渲染能力 |
| 网页 | 自包含 HTML、局部交互、源码与可恢复旧版 | 默认 React + TypeScript + Tailwind CSS + Headless UI；阅读成品无需安装依赖 |
| 视频 | 原创分步视觉讲解、旁白、字幕及可播放视频 | 动画渲染、语音与视频合成能力 |

各模式在使用前检查能力，不强制商业 API。缺少显式指定模式的必要能力时，报告缺失项，并将分镜、源代码等标为辅助产物；它们不能冒充完成的图片或视频。技能本身是工作指令包，不内置大模型、语音服务或视频渲染引擎。

文字采用 ASD-STE100 的简化写作思路。**中文不是 ASD-STE100 合规文本**。英语严格模式需要依据完整官方规则、词典和技术词汇逐项检查；未经检查不承诺符合规范。截图是启发材料，不是规范依据。完整说明见 [文字模式](skills/brief-me/references/text.md)。

视频借鉴 3Blue1Brown 的逐步推导、视觉连续性和因果解释方式，制作原创内容；不复制片段、标识或声线。输出默认为本地文件，不会自动公开发布。

## 仓库结构

- `skills/brief-me/`：可安装的技能入口、模式参考与客户端元数据。
- `docs/validation.md`：验证范围、限制与后续回归检查要求。
- `docs/accepted-design.md`：本轮确认的设计与验收范围。
- `prototypes/harness-explainer/`：已验收的交互样本、源码与可恢复版本。
- `output/playwright/`：样本检查记录引用的截图与恢复结果。

本地客户端配置、`.local/` 中的历史制作与测试材料，以及 `brief-me/` 中的日常生成产物均不纳入 Git。

## 验证与来源

`0.2.0` 已固化 [Harness v003 样本](prototypes/harness-explainer/index.html) 的验收结果：局部成为视觉主体，展开内部流程、结构与外部连接，跨模块返回保留阅读位置。用户于 2026-10-06 验收通过；详见[确认记录](docs/accepted-design.md)。

已有验证结果与限制见 [`docs/validation.md`](docs/validation.md)。样本验收和技能格式检查不代表其他主题或四种模式都经过端到端验收。

已实测中文文字、英文合规未验证分支、PNG/SVG 图片和交互网页，以及视频能力缺失分支。初次本机语音尝试被零时长音频阻塞；后续在不同执行权限下完成了一段机制讲解视频，并记录解码、字幕时间、画面抽查和浏览器完整播放检查。旁白尚未逐字听审，这些结果不代表所有环境都能成功或用户已经验收。

灵感来自 [Andrej Karpathy 的推文](https://x.com/karpathy/status/2105819303471976479)。本次 X 直连返回 403，推文内容依据用户提供的原文截图。规范事实以 [ASD-STE100 官方资料](https://www.asd-ste100.org/) 为准。
