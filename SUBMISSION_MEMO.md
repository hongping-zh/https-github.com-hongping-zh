# 🌿 Project Submission: EcoCompute AI

**Tagline**: The "Green AI" Architect powered by Gemini 3.

---

## 1. Project Overview
**EcoCompute AI** is an intelligent energy optimization platform designed to solve the growing carbon footprint of AI workloads. Unlike traditional static analysis tools, it leverages **Gemini 3 Pro** to act as a virtual "Performance Engineer," reading code and diagrams to prescribe sustainable optimizations (LoRA, Quantization, etc.).

## 💡 Inspiration (The "Why")
Training a single large language model can emit as much carbon as **five cars over their entire lifetimes**. As developers, we often chase state-of-the-art performance while ignoring the environmental cost. We wanted to build a tool that makes "Green AI" accessible—not by lecturing developers, but by giving them an intelligent Agent that does the hard work of optimization for them. We were inspired by the idea: *What if your IDE cared about the planet as much as it cares about syntax errors?*

## 2. Gemini 3 Feature Utilization (The "Action" & "Reasoning" Stack)
We utilized the full spectrum of the `@google/genai` SDK to create a specialized agent:

### 1. ⚡ Code Execution (Agentic Actions)
*   **Usage**: Configured `{ tools: [{ codeExecution: {} }] }`.
*   **Why**: We don't just ask the model to *guess* math. The agent writes and executes Python scripts inside the sandbox to strictly calculate **Arithmetic Intensity (FLOPs/Byte)**. This validates that a model is truly memory-bound before recommending optimizations.

### 2. 🧠 Thinking Budget (Reasoning Process)
*   **Usage**: Configured `{ thinkingConfig: { thinkingBudget: 1024 } }`.
*   **Why**: Energy optimization is complex physics. We allocated a token budget for "Deep Thinking" tuned to reduce quota/rate-limit failures while still enabling deep reasoning. This allows the model to plan its search queries for hardware specs before generating the final advice. The UI visualizes this token consumption in real-time.

### 3. 🔍 Google Search Grounding (Live Data)
*   **Usage**: Configured `{ tools: [{ googleSearch: {} }] }`.
*   **Why**: Hardware specs change monthly. The agent searches for **Real-time 2026 Hardware Specs** (e.g., NVIDIA B200 TDP, Coral TPU Host-to-USB overhead) and explicitly cross-references **MLPerf Inference v4.1** results.

### 4. 👁️ Multimodal Vision
*   **Usage**: Accepts hand-drawn neural network sketches.
*   **Why**: Correlates visual topology (e.g., "Is there a skip connection?") with code structure to find hidden bottlenecks.

## 3. Technical Highlights

### 🛡️ Hybrid Grounding Architecture
We built a "Data Moat" by combining:
1.  **Deterministic Static Analysis**: A client-side AST parser counts layers (Truth).
2.  **Probabilistic LLM Reasoning**: Gemini interprets these counts within the context of hardware constraints (Creativity).
3.  **Scientific Verification**: MLPerf benchmarks serve as the "Ground Truth" for energy predictions.

### 🔺 The Decision Triangle
A core UI component that visualizes the inherent engineering trade-offs between **Performance**, **Cost**, and **Carbon Efficiency**. This forces users to make conscious decisions rather than blindly chasing speed.

## 4. Product Value & Impact
Training large models generates massive carbon emissions. **EcoCompute AI** democratizes "Green AI" expertise, allowing any developer to reduce their model's energy consumption by 30-50% through automated, expert-level refactoring.

## 5. Challenges We Ran Into
*   **Prompt Engineering for Structure**: Getting the model to output strict JSON for the visualization while simultaneously maintaining the creative "Performance Engineer" persona was tricky. We solved this by using strict schema definitions in the system instruction.
*   **Balancing Token Budget**: The "Thinking Process" is powerful but hungry. We tuned the `thinkingBudget` to 1024 to reduce quota/rate-limit failures while still preserving deep reasoning for physics-heavy audits.
*   **Grounding Accuracy**: Initially, the model would hallucinate hardware specs. Implementing the **Google Search Tool** as a mandatory step for fetching TDP values solved this completely.

## 6. Accomplishments We're Proud Of
*   **The "Hybrid Grounding" System**: Successfully merging deterministic AST analysis (code math) with probabilistic LLM reasoning. It feels like magic but is grounded in math.
*   **Real-time Multimodal Analysis**: Seeing the agent correctly identify a "skip connection" from a rough hand-drawn sketch was a "wow" moment for the team.

## 7. What We Learned
*   **Agentic AI is different from Chat**: Building an agent that *does* things (searches, calculates) requires a different mindset than building a chatbot. You have to design for "Tools First."
*   **Sustainability is a Data Problem**: We realized that developers care about green AI, they just lack the data to act on it. EcoCompute bridges that gap.

## 8. What's Next for EcoCompute AI
*   **IDE Extension**: Porting this web app to a VS Code extension for inline linting.
*   **CI/CD Integration**: A GitHub Action that blocks PRs if the "Carbon Score" increases significantly.
*   **Enterprise Hardware Profiles**: Adding support for custom on-premise cluster configurations.

## 9. Conclusion
EcoCompute AI demonstrates that Generative AI isn't just a consumer of energy—it is the most powerful tool we have to optimize it.

**Let's Code Green! 🌿**