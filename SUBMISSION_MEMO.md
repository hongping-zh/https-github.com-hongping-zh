
# 🌿 Project Submission: EcoCompute AI

**Tagline**: The "Green FinOps" Infrastructure for Enterprise AI.  
**Elevator Pitch**: Stops Cloud Bill Shock at the source by intercepting inefficient code in CI/CD.

---

## 💡 Inspiration
We were shocked to learn that training a single large AI model can emit as much carbon as **five cars over their entire lifetimes**. But for enterprises, the immediate pain is financial: **Cloud Bill Shock**.

Monitoring tools (like Datadog) only see the **symptoms** of high costs (spiking CPU/GPU usage). We wanted to build a tool that identifies the **root cause**: inefficient code.

We asked: **What if we could place a "Virtual Senior Performance Engineer" inside the CI/CD pipeline?** One that uses Gemini 3's deep reasoning to mathematically prove inefficiency and block expensive code *before* it merges?

## 🚀 What it does
**EcoCompute AI** is a Predictive Gatekeeper for AI Engineering.
1.  **Intercepts**: It acts as a GitHub Action / CI Gate, scanning PyTorch PRs (supporting everything from **ResNet-50** to **Llama 3**).
2.  **Grounds**: It searches Google for real-time 2026 hardware specs (e.g., **NVIDIA B200**, Google Edge TPU) and MLPerf benchmarks.
3.  **Calibrates**: It uses a "Scientific Calibration" method—first verifying its physics engine against known baselines (ResNet-50) before analyzing novel architectures.
4.  **Verifies**: It uses a **Python Sandbox** to mathematically prove "Arithmetic Intensity" (FLOPs/Byte), eliminating LLM math hallucinations.
5.  **Refactors**: It automatically generates optimized code (Quantization, Operator Fusion) to cut inference costs by 30-50%.

## ⚙️ How we built it (The Hybrid Grounding Engine)
We de-risked AI optimization by combining four layers of neuro-symbolic verification:

*   **Gemini 3 Pro (The Brain)**: We utilized the **1024-token `thinkingBudget`**. This allows the model to "plan" its audit strategy, formulate search queries, and cross-reference physics equations *before* generating a JSON report.
*   **Scientific Calibration Strategy**: To address the critique that "LLMs don't know physics," we implemented a calibration loop. The agent grounds itself on public MLPerf data (ResNet-50) to determine error margins before predicting the energy usage of complex custom models.
*   **Agentic Tool Use**: 
    *   **Google Search**: Used to find dynamic data like "Carbon Intensity of Iowa Data Centers" or "H100 On-demand Pricing".
    *   **Code Execution**: Used to calculate FLOPs. We force the agent to write Python code to verify its own assumptions.
*   **Static AST Analysis**: A deterministic regex layer that instantly maps code topology as ground truth.

## 🚧 Challenges we ran into
*   **Hallucination vs. Physics**: LLMs are notoriously bad at arithmetic. We solved this by forcing Gemini 3 to use the **Code Execution sandbox** for all FLOPs/Byte calculations, effectively giving the LLM a calculator.
*   **Balancing Token Costs**: Running a large reasoner model on every line of code is expensive. We built a **Cost-Aware Router** that sends simple syntax checks to `Gemini Flash-Lite` and only routes complex architectural changes to `Gemini 3 Pro`.
*   **Visualizing "Thinking"**: Streaming the raw "thought process" (e.g., "Checking MLPerf DB...") to the UI without breaking the JSON output required a custom stream parser.

## 🏆 Accomplishments that we're proud of
*   **Scientific Rigor**: We don't just guess; we provide **Error Bars** and **Confidence Scores** based on real MLPerf data.
*   **Llama 3 Support**: We successfully optimized modern GQA (Grouped Query Attention) blocks, proving the tool works for GenAI workloads.
*   **The "FinOps" Pivot**: Moving from a simple "linter" to a "Governance Tool" that speaks the language of CFOs (Dollar Savings).

## 🔮 What's next for EcoCompute AI
*   **Dynamic Tracing**: Integrating `torch.fx` to capture complex dynamic graphs beyond static analysis.
*   **Video Profiling**: Uploading screen recordings of `nsys` profilers for visual bottleneck detection.
*   **IDE Plugin**: Bringing the "Green Gatekeeper" directly into VS Code.

---

**Let's Code Green & Lean! 🌿**
