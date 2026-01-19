
# 🌿 EcoCompute AI: 技术架构与开发指南

> **版本:** 2.1.0 (企业 FinOps 版)  
> **技术栈:** React 19, TypeScript, Google Gemini 3 Pro, Open-Source Governance  

---

## 1. 项目概述

**EcoCompute AI** 是 **绿色 FinOps** 的基础设施层。它超越了简单的代码审计，成为企业级的“守门人”，在代码合并前拦截云成本超支和合规风险。

### 核心价值主张 (Why Us?)
*   **对 CFO**: 防止“账单休克” (Bill Shock)，在 PR 阶段拦截低效代码。
*   **对 合规部**: 自动生成符合欧盟 AI 法案 (EU AI Act) 和 SEC 气候披露要求的审计线索。
*   **对 工程师**: 一位自动修复瓶颈的虚拟资深性能工程师。

---

## 2. 分层架构 (单位经济模型优化)

为了确保商业可行性和健康的单位经济模型 (Unit Economics)，系统采用了 **成本感知路由引擎 (Cost-Aware Routing)**，最大限度地减少昂贵的大模型调用。

```mermaid
graph TD
    A[输入代码] --> B{L1: 静态拦截网};
    B -- 简单语法错误 --> X[拒绝 (成本: $0)];
    B -- 通过 --> C{L2: 复杂度路由};
    
    C -- 低复杂度 --> D[Gemini Flash-Lite];
    D --> Y[快速修复 (成本: $0.001)];
    
    C -- 高复杂度 (架构变更) --> E[Gemini 3 Pro];
    
    subgraph "L3: 深度推理闭环 (高价值)"
    E --> F[思考预算 (1024 Tokens)];
    F --> G[搜索 & 数学验证];
    G --> H[架构重构];
    end
    
    H --> Z[企业级报告 (价值: $100+)];
```

### 层级详解
1.  **L1 静态拦截网 (客户端)**：利用正则/AST 启发式算法瞬间捕获低级问题（如缺失引用、未使用层）。**成本：$0**。
2.  **L2 Flash 路由器 (Serverless)**：轻量级模型对 PR 复杂度进行分类。如果是文档修改或简单修复，路由至 `gemini-2.5-flash-lite`。
3.  **L3 深度推理 (大脑)**：只有复杂的架构变更才会激活 **Gemini 3 Pro**。这确保了 SaaS 订阅的高利润率。

---

## 3. 关键技术模块

### 3.1. Gemini 3 服务 (`services/geminiService.ts`)
*   **角色**: L3 智能层。
*   **配置**:
    *   **思考预算**: 1024 Tokens (严格限制以保证 ROI)。
    *   **工具**: Google Search (硬件定价/规格), Code Execution (数学验证)。
    *   **输出**: 结构化 JSON，便于集成 Jira/GitHub/Datadog。

### 3.2. 场景编排器 (`services/demoOrchestrator.ts`)
*   **角色**: 企业 CI/CD 流水线的数字孪生。
*   **功能**: 模拟 GitHub Action Runner 与 SaaS 后端之间的异步通信。

### 3.3. 启发式模式匹配器 (`services/staticAnalyzer.ts`)
*   **角色**: L1 成本节约网关。
*   **功能**: 在请求到达 API 之前在本地过滤掉 80% 的噪音，大幅提高利润率。

---

## 4. "数据护城河"：全球能效知识库

与通用的代码助手不同，EcoCompute AI 聚合匿名化的性能数据，构建专有资产：
*   **数据集**: “在 NVIDIA B200 上，哪种 PyTorch 算子组合性能最佳？”
*   **飞轮效应**: 每一次审计都在优化我们的内部推荐引擎，随时间推移减少对外部搜索的依赖。

---

## 5. 部署与安全

### 模式 A: SaaS (按用量付费)
*   **计费**: 按“节省的算力时”抽成 或 按 Repo 数量订阅。
*   **适用**: 初创公司, 成长期企业。

### 模式 B: 企业气隙版 (License)
*   **架构**: Docker/Kubernetes 私有化部署。
*   **隐私**: “自带密钥” (BYOK) 或支持本地 LLM。
*   **适用**: 对冲基金, 国防, 科技巨头。

---

## 6. 路线图：从 "Linter" 到 "Runtime Agent"

1.  **现在**: 静态 CI/CD 守门人 (预防烂代码)。
2.  **Q3 2026**: **运行时 Profiler Agent**。连接 Datadog/Prometheus，将代码变更与真实的金钱支出关联起来。
3.  **Q4 2026**: **自动修复 PR**。机器人不仅评论，还直接提交包含修复代码和基准测试对比的 PR。

---

*生成于 Google Gemini 3 Hackathon 提交材料.*
