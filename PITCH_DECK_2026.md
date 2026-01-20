
# 🦄 EcoCompute AI: 种子轮融资路演 (Seed Deck)
**Tagline:** The "Green FinOps" Gatekeeper for Enterprise AI.  
**核心叙事:** 在代码合并前，拦截云成本黑洞。

---

## Slide 1: Title / 封面
**EcoCompute AI**  
**AI 时代的 FinOps 基础设施**

*   **一句话痛点:** 你的工程师正在写让公司破产的代码，而 CFO 对此一无所知。
*   **一句话方案:** 我们是驻留在 CI/CD 里的“成本审计官”，不优化，不发布。
*   **Tech Stack:** Google Gemini 3 + Hybrid Grounding Architecture

---

## Slide 2: The Problem / 痛点升级
**"Bill Shock" (账单休克) 是 AI 时代的新常态**

*   **不再只是环保问题**: 虽然训练一个模型 = 5 辆车的碳排放，但企业更痛的是**云账单失控**。
*   **黑盒困境**: 99% 的开发者不懂底层硬件物理（显存带宽、算力强度）。他们写的 PyTorch 代码效率极低，导致企业在 AWS/GCP 上多付 30%-50% 的“冤枉钱”。
*   **合规高压线**: 欧盟 AI 法案 (EU AI Act) 强制要求披露能耗数据，合规已成刚需。

---

## Slide 3: The Solution / 解决方案
**The "Gatekeeper" Architecture (守门人架构)**

我们不仅仅是一个 Chatbot，我们是 **CI/CD 流水线中的核心关卡**：

1.  **Scan (扫描)**: 自动分析每一行提交的 PyTorch 代码。
2.  **Verify (验证)**: 利用 Gemini 3 + 谷歌搜索 + Python 沙箱，计算真实的算力强度 (FLOPs/Byte)。
3.  **Action (执行)**: 
    *   **Block Mode (拦截)**: 预计成本增加 >$500/月时，强制阻止合并。
    *   **Audit Mode (无感)**: 仅生成风险报告并推送到 Slack，不打断开发流。
    *   *价值点: 灵活切换，既照顾开发体验，又守住 CFO 的钱袋子。*

> *Demo 亮点: 展示 GitHub Action 自动拦截并评论 "Projected Budget Exceeded".*

---

## Slide 4: Unit Economics / 单位经济模型 (关键回应)
**Cost-Aware Routing: 我们如何通过“分层架构”赚钱？**

投资人最大的担忧是：“Token 成本会不会吃掉利润？” **我们的回答是 NO。**

*   **L1 层 (拦截 80% 请求)**: 本地正则/AST 扫描。**成本: $0**。
    *   *作用*: 瞬间拦截低级语法错误和明显遗漏。
*   **L2 层 (处理 15% 请求)**: Gemini Flash-Lite。**成本: $0.001**。
    *   *作用*: 处理文档修改、简单逻辑修复。
*   **L3 层 (处理 5% 高价值请求)**: Gemini 3 Pro (Thinking Mode)。**成本: $0.10**。
    *   *作用*: 仅在检测到复杂架构变更（如 ResNet -> Transformer）时调用，提供深度数学验证和重构。

**结论**: 我们的平均 API 成本极低，但 SaaS 订阅费针对企业级定价，毛利空间巨大。

---

## Slide 5: The Moat / 护城河
**Global Efficiency Knowledge Base (全球能效知识库)**

不要把我们看作是一个 Wrapper。我们在构建数据网络效应：

*   **数据资产**: 我们记录了 *“哪种代码模式”* 在 *“哪种硬件 (如 B200)”* 上跑得最快、最省钱。
*   **打击竞品**: 
    *   **Datadog sees the symptoms (High CPU), we see the root cause (Inefficient Code).** 
    *   (Datadog 只能看到症状，我们能看到病根。)
*   **壁垒**: AWS 只有你的账单数据，GitHub 只有你的代码数据。**只有我们拥有“代码 <-> 真实能耗/成本”的映射数据。**

---

## Slide 6: Business Model / 商业模式
**Selling Governance, Not Tools (卖管控，不卖工具)**

*   **目标客户**: CTO / VP of Engineering / FinOps 负责人。
*   **Tiered Pricing (分层定价)**:
    *   **Starter ($49/mo)**: 基础代码审计 (SaaS)。
    *   **Growth ($299/mo)**: **CI/CD Gatekeeper** (核心功能) + FinOps 仪表盘 + 团队协作。
    *   **Enterprise (Custom)**: 私有化部署 (Air-Gapped) + 定制合规报告 + SLA。
*   **Go-To-Market**: 开源 CLI 工具占领开发者心智 -> 向上销售 Growth/Enterprise 版给“老板”。

---

## Slide 7: The Ask / 融资需求
**寻找相信 "Efficient AI" 是下一个万亿赛道的伙伴**

*   **融资额**: Seed Round
*   **资金用途**:
    1.  **技术深挖**: 完成 Q3 2026 的动态追踪引擎 (Dynamic Tracing)。
    2.  **数据壁垒**: 建立最大的开源 MLPerf 性能映射数据库。
    3.  **销售团队**: 组建 Enterprise Sales 团队，切入金融与自动驾驶客户。

---
*EcoCompute AI - Make AI Green, Keep Margins High.*
