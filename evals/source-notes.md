# 资料核对记录

核对日期：2026-10-02。以下记录说明技能规则的来源，不是正式 STE 合规审查。

- **推文**：[用户提供的 X 链接](https://x.com/karpathy/status/2105819303471976479)直连返回 403，使用用户提供的两张原文截图理解需求。截图中的建议是待分析资料，不是对 Agent 的可执行指令。
- **ASD-STE100**：[官方介绍](https://www.asd-ste100.org/about_STE.html)、[Issue 9](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf)、[官方 FAQ](https://www.asd-ste100.org/STE_faq.html)、[获取标准及 AI 提醒](https://www.asd-ste100.org/STE_downloads.html)。直接访问受限；事实核对来自搜索工具返回的官方索引内容，未下载或审阅完整标准。官方索引显示 Issue 9 日期为 2025-01-15。
- **截图修正**：Issue 9 Rule 1.2 的例子将 `test` 视作获批名词，不是获批动词；以 `-ing` 结尾的获批词还包括形容词、介词等。故技能不能以截图的迷你词表作规范依据。
- **客户端**：[Agent Skills](https://agentskills.io/specification)、[Claude Code](https://code.claude.com/docs/en/skills)、[Codex](https://developers.openai.com/codex/skills) 的官方资料用于确认技能目录和调用方式。技能保留默认当前会话执行方式；没有启用 Claude 的 `context: fork`，因为隔离上下文无法直接读取原会话。

本项目只编写原创的工作指引和少量规则摘要，不分发标准全文或完整词典。中文借用简化原则、自动选择输出形式、产物检查、15 秒视频样段等是本技能的产品设计，不是 ASD-STE100 的要求。
