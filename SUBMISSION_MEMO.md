# 🌿 Project Submission: EcoCompute AI

**Tagline**: The "Green AI" Architect powered by Gemini 3.

---

## 💡 Inspiration
We were shocked to learn that training a single large AI model can emit as much carbon as **five cars over their entire lifetimes**. 

As developers, we want to build powerful AI, but we often treat energy as an afterthought because optimization is *hard*. It requires deep knowledge of hardware physics, memory bandwidth, and thermal dynamics. 

We asked: **What if we could use Gemini 3's reasoning capabilities to democratize this expertise?** What if every developer had a virtual "Senior Performance Engineer" sitting next to them, optimizing their code for sustainability in real-time?

## 🚀 What it does
**EcoCompute AI** is an intelligent energy auditing platform.
1.  **Audits**: It scans PyTorch code and hand-drawn architecture sketches.
2.  **Grounds**: It searches Google for real-time 2026 hardware specs (e.g., NVIDIA B200, Google Edge TPU) and MLPerf benchmarks.
3.  **Verifies**: It uses Python Code Execution to mathematically prove bottlenecks (e.g., Arithmetic Intensity).
4.  **Optimizes**: It refactors the code with Green AI techniques (LoRA, Quantization, Operator Fusion).

## ⚙️ How we built it
We utilized the full spectrum of the `@google/genai` SDK to create a specialized agent:

*   **Gemini 3 Pro**: The brain of the operation.
*   **Thinking Budget (1024 Tokens)**: We explicitly allocated a "Deep Thinking" budget. This allows the model to plan its audit strategy, formulate search queries, and cross-reference physics equations *before* generating a response.
*   **Agentic Tool Use**: 
    *   **Google Search**: Used to find dynamic data like "Carbon Intensity of Iowa Data Centers" or "H100 TDP".
    *   **Code Execution**: Used to calculate FLOPs/Byte. We don't let the LLM guess math; we make it write Python to prove it.
*   **Hybrid Grounding**: We built a custom "Data Moat" that combines deterministic Static Analysis (AST parsing) with probabilistic LLM reasoning.

## 🚧 Challenges we ran into
*   **Balancing the Token Budget**: Initially, the model would over-think simple tasks or under-think complex physics. We had to tune the `thinkingBudget` and prompt engineering to ensure it knew *when* to trigger the "Deep Reasoning" mode.
*   **Real-time Visualization**: Streaming the "Thinking Process" to the UI without breaking the JSON output structure was tricky. We implemented a custom stream parser that separates `[[PHASE]]` tags from the final JSON payload.
*   **Hallucination vs. Physics**: LLMs can be bad at math. We solved this by forcing the model to use the **Code Execution sandbox** for all arithmetic operations, ensuring 100% accuracy in our energy estimates.

## 🏆 Accomplishments that we're proud of
*   **The "Decision Triangle"**: A unique UI component that forces users to visualize the trade-off between Performance, Cost, and Carbon.
*   **Live Hardware Search**: The app doesn't rely on a stale database. It actually finds new hardware specs from the web in real-time.
*   **Scientific Rigor**: We cross-reference our predictions with MLPerf Inference v4.1 data, providing a confidence score that engineers can trust.

## 📚 What we learned
*   **Agentic Workflows > RAG**: For technical tasks, giving the model tools (Search, Code Exec) is far more powerful than just feeding it documents.
*   **Sustainability is a Data Problem**: Making carbon usage visible is half the battle. Once developers see the "Grams of CO2" metric, they naturally want to optimize it.

## 🔮 What's next for EcoCompute AI
*   **Video Profiler**: Upload screen recordings of `nsys` or PyTorch Profiler for visual hotspot detection.
*   **IDE Plugin**: A "Green Linter" for VS Code that warns you about energy-inefficient layers as you type.
*   **Google Maps Integration**: Precise carbon intensity based on the exact data center location.

---

**Let's Code Green! 🌿**