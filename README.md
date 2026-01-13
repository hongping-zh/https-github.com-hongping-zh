# 🌿 EcoCompute AI

> **AI-Powered Energy Auditing for Greener Machine Learning**

[![Built with Gemini 3](https://img.shields.io/badge/Powered%20by-Gemini%203%20Pro-blue)](https://ai.google.dev)
[![Live Demo](https://img.shields.io/badge/Demo-AI%20Studio-green)](https://ai.studio/apps/drive/1zlpvxS5MxmvgaIBVd5RkY3lh35Lqt2sj)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Gemini%203%20Hackathon-2026-purple)](https://gemini3.devpost.com)

---

## 🎯 What is EcoCompute AI?

Training a single large language model can emit as much carbon as **5 cars over their entire lifetime**. 

EcoCompute AI is a Gemini 3-powered platform that helps developers build greener AI by providing intelligent energy optimization recommendations. Think of it as having a senior performance engineer who can:
- **SEE** your architecture through code analysis and multimodal understanding
- **SEARCH** the latest hardware specifications in real-time
- **EXECUTE** Python code to verify calculations and ensure accuracy

### 🌍 Impact
- Reduce AI model energy consumption by **30-50%**
- Support sustainable AI development practices
- Democratize access to green AI expertise

---

## ✨ Gemini 3 Features Showcase

| Feature | Implementation | Impact |
|---------|----------------|---------|
| 🔍 **Google Search Grounding** | Real-time 2026 Hardware Specs | Accurate, up-to-date energy predictions |
| 🖼️ **Multimodal Understanding** | Hand-drawn architecture analysis | Detect visual topology issues |
| 💭 **Streaming Chain-of-Thought** | Real-time ThinkingPanel visualization | Transparent AI reasoning |
| 📊 **Structured JSON Output** | Typed results with confidence scores | Reliable, parseable insights |
| ⚡ **Code Execution** | Python sandbox for calculations | Verified mathematical accuracy |
| 🧠 **Thinking Budget** | 2048 tokens for deep reasoning | Thorough analysis |
| 🔧 **Function Calling** | Custom carbon footprint calculator | Region-specific emissions |

---

## 🚀 Quick Start

### 🌐 Try Live Demo
**[Experience EcoCompute AI on AI Studio](https://ai.studio/apps/drive/1zlpvxS5MxmvgaIBVd5RkY3lh35Lqt2sj)**

No installation required. Just paste your PyTorch code and get instant energy optimization recommendations!

### 📱 How to Use

1. **Input Your Code**: Paste PyTorch model code or upload hand-drawn architecture
2. **Select Hardware**: Choose target GPU/TPU and deployment region
3. **Run Analysis**: Click "Deep Energy Audit" for comprehensive evaluation
4. **Review Results**: Examine energy savings, confidence scores, and optimization strategies
5. **Get Optimized Code**: Download production-ready green implementation

---

## 🏗️ Architecture

### 🔄 Hybrid Grounding System

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Static AST     │    │   Gemini 3       │    │  MLPerf Data    │
│  Analysis       │───▶│   Agent          │───▶│  Validation     │
│  (Deterministic)│    │  (Probabilistic) │    │  (Ground Truth) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 📊 Core Components

- **Static Analyzer**: AST parsing, GFLOPs estimation, layer detection
- **Gemini Service**: Multi-turn tool execution, streaming responses
- **Hardware Profiles**: Regional carbon intensity, TDP data
- **Visualization**: Energy breakdown, decision triangle, telemetry

---

## 💡 Use Cases

### 🎯 Target Users

- **ML Engineers**: Optimize model deployment costs
- **Research Scientists**: Reduce computational resource usage
- **DevOps Teams**: Make informed infrastructure decisions
- **Sustainability Officers**: Track and reduce AI carbon footprint

### 📈 Example Results

| Model Type | Original Energy | Optimized Energy | Savings |
|------------|-----------------|------------------|---------|
| ResNet-50 | 0.022 J | 0.003 J | **85%** |
| BERT-Base | 0.045 J | 0.028 J | **38%** |
| MobileNetV2 | 0.012 J | 0.008 J | **33%** |

---

## 🛠️ Technical Implementation

### Under the Hood: Gemini 3 Config

We utilize the advanced agentic capabilities of the `@google/genai` SDK. Here is the actual configuration used in production to enable **Deep Reasoning** and **Live Grounding**:

```typescript
// services/geminiService.ts

const chat = ai.chats.create({
  model: "gemini-3-pro-preview",
  config: {
    // 🧠 1. Deep Reasoning: Allocating budget for complex physics calculations
    thinkingConfig: { 
      thinkingBudget: 2048 
    },
    
    // 🛠️ 2. Agentic Tool Use: Real-time Data + Math Verification
    tools: [
      { googleSearch: {} }, // Finds 2026 Hardware Specs (e.g., B200 TDP)
      { codeExecution: {} }, // Verifies Arithmetic Intensity via Python
      { functionDeclarations: [carbonCalculatorTool] } // Custom logic
    ],
    
    // 📝 3. Structured Output: JSON Schema for UI rendering
    responseMimeType: "application/json",
    responseSchema: AnalysisResultSchema
  }
});
```

### 📦 Technology Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Node.js, Express (optional for local deployment)
- **AI Engine**: Gemini 3 Pro API
- **Data Sources**: MLPerf, Google Search, Hardware specifications

---

## 📹 Demo Video

[![Watch Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/hqdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

**[Watch the 3-minute demo on YouTube](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)**

*Video highlights:*
- Real-time Gemini 3 streaming analysis
- Code execution in sandbox
- Energy optimization results
- Multimodal architecture understanding

**[Download Demo Subtitles (.srt)](demo_subtitles_en.srt)**

---

## 🌟 What's New in v18

- ✅ **Code Execution**: Python sandbox for verified calculations
- ✅ **Thinking Budget**: 2048 tokens for deep reasoning
- ✅ **Region Carbon Intensity**: Location-aware emissions
- ✅ **Function Calling**: Custom carbon calculator
- ✅ **MLPerf Validation**: Benchmark cross-referencing
- ✅ **Transparency Panel**: Full assumptions and citations
- ✅ **Critical Bug Detection**: Architecture flaw identification

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🐛 Bug Reports
- Use the [Issues](../../issues) page
- Include browser version, OS, and steps to reproduce

### 💡 Feature Requests
- Open an issue with "Feature Request" label
- Describe the use case and expected behavior

### 🔧 Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/ecocompute-ai.git
cd ecocompute-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY

# Run development server
npm run dev
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Let's Code Green! 🌿*