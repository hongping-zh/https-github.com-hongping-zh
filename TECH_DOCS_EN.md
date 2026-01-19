
# 🌿 EcoCompute AI: Technical Architecture & Development Guide

> **Version:** 2.1.0 (Enterprise FinOps Edition)  
> **Stack:** React 19, TypeScript, Google Gemini 3 Pro, Open-Source Governance  

---

## 1. Project Overview

**EcoCompute AI** is the infrastructure layer for **Green FinOps**. It moves beyond simple code auditing to become an enterprise "Gatekeeper" that prevents cloud cost overruns and compliance violations before they merge.

### Core Value Proposition (The "Why")
- **For CFOs**: Prevent "Bill Shock" by blocking inefficient code at the PR level.
- **For Compliance**: Auto-generate audit trails for EU AI Act & SEC Climate Disclosure.
- **For Engineers**: A virtual Senior Performance Engineer that fixes bottlenecks automatically.

---

## 2. Tiered Architecture (Unit Economics Optimization)

To ensure commercial viability and positive unit economics, the system uses a **Cost-Aware Routing Engine** to minimize expensive LLM calls.

```mermaid
graph TD
    A[Input Code] --> B{L1: Static Gate};
    B -- Simple Syntax Error --> X[Reject (Cost: $0)];
    B -- Valid --> C{L2: Complexity Router};
    
    C -- Low Complexity --> D[Gemini Flash-Lite];
    D --> Y[Quick Fix (Cost: $0.001)];
    
    C -- High Complexity (Arch Change) --> E[Gemini 3 Pro];
    
    subgraph "L3: Deep Reasoning Loop (High Value)"
    E --> F[Thinking Budget (1024 Tokens)];
    F --> G[Search & Math Verification];
    G --> H[Architecture Refactor];
    end
    
    H --> Z[Enterprise Report (Value: $100+)];
```

### Layer Details
1.  **L1 Static Gate (Client-Side)**: Regex/AST heuristics instantly catch low-hanging fruit (e.g., missing imports, unused layers). **Cost: $0**.
2.  **L2 Flash Router (Serverless)**: A lightweight model classifies the PR complexity. If it's a documentation change or simple fix, it routes to `gemini-2.5-flash-lite`.
3.  **L3 Deep Reasoning (The Brain)**: Only complex architectural changes activate **Gemini 3 Pro**. This ensures high margins on the SaaS subscription.

---

## 3. Key Technical Modules

### 3.1. The Gemini 3 Service (`services/geminiService.ts`)
*   **Role**: The L3 Intelligence Layer.
*   **Configuration**:
    *   **Thinking Budget**: 1024 Tokens (Strictly capped for ROI).
    *   **Tools**: Google Search (Hardware Pricing/Specs), Code Execution (Math Verification).
    *   **Output**: Structured JSON for integration with Jira/GitHub/Datadog.

### 3.2. Simulation Controller (`services/demoOrchestrator.ts`)
*   **Role**: Digital Twin of the Enterprise CI/CD Pipeline.
*   **Function**: Simulates the async communication between the GitHub Action Runner and the SaaS Backend.

### 3.3. Heuristic Pattern Matcher (`services/staticAnalyzer.ts`)
*   **Role**: The L1 Cost-Saving Gate.
*   **Function**: Filters out 80% of noise locally before it hits the API, drastically improving margins.

---

## 4. The "Data Moat": Global Efficiency Knowledge Base

Unlike generic coding assistants, EcoCompute AI aggregates anonymized performance data to build a proprietary asset:
*   **The Dataset**: "Which PyTorch operators perform best on NVIDIA B200?"
*   **The Flywheel**: Every audit improves our internal recommendation engine, reducing dependency on external search over time.

---

## 5. Deployment & Security

### Mode A: SaaS (Usage-Based)
*   **Billing**: Per "Compute-Hour Saved" or Per-Repo.
*   **Ideal for**: Startups, Scale-ups.

### Mode B: Enterprise Air-Gap (License)
*   **Architecture**: Docker/Kubernetes on-premise.
*   **Privacy**: "Bring Your Own Key" (BYOK) or Local LLM support.
*   **Ideal for**: Hedge Funds, Defense, Big Tech.

---

## 6. Roadmap: From "Linter" to "Runtime Agent"

1.  **Now**: Static CI/CD Gatekeeper (Prevent bad code).
2.  **Q3 2026**: **Runtime Profiler Agent**. Connect to Datadog/Prometheus to correlate code changes with real-world dollar spend.
3.  **Q4 2026**: **Auto-Fix PRs**. The bot doesn't just comment; it opens a PR with the fix and benchmarks attached.

---

*Generated for Google Gemini 3 Hackathon Submission.*
