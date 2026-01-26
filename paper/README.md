# 📄 EcoCompute AI Technical Report

## Download

**[📥 Download PDF](EcoCompute_AI_Technical_Report.pdf)** (166 KB)

> Note: If GitHub cannot render the PDF preview, please click the download button above or use the "Download" button in the file viewer.

---

## Abstract

**EcoCompute AI** is a CI/CD gatekeeper that predicts AI training costs and carbon footprint **before code merges**. Unlike traditional monitoring tools that report costs after the fact, EcoCompute enables proactive cost optimization.

### Key Contributions

1. **Pre-Merge Cost Prediction** — Static analysis of ML code to estimate GPU costs before training runs
2. **Hardware Grounding** — Physics-based model calibrated on MLPerf benchmarks achieving **<5% error margin**
3. **Agent Token FinOps** — First tool to predict multi-agent workflow costs (context ballooning, coordination overhead)
4. **Carbon Tracking** — Real-time CO₂e estimation with regional grid data

### Validation Results

| Benchmark | EcoCompute Error | Typical Tools |
|-----------|------------------|---------------|
| ResNet-50 (H100) | **2.9%** | 20-50% |
| BERT-Large (A100) | **3.0%** | 15-40% |
| User-reported (127 runs) | **4.2% mean** | N/A |

---

## Citation

If you use EcoCompute AI in your research, please cite:

```bibtex
@software{zhang2026ecocompute,
  author = {Zhang, Hongping},
  title = {EcoCompute AI: Pre-Merge Cost Prediction and Carbon Tracking for AI Training},
  year = {2026},
  url = {https://github.com/hongping-zh/ecocompute-ai},
  version = {1.0.0}
}
```

---

## Related Resources

- 🌐 [Live Demo](https://ecocompute-ai-elb0yplu9w.edgeone.dev/)
- 🧮 [Cost Calculator](https://hongping-zh.github.io/ecocompute-ai/calculator/)
- 📖 [Hardware Grounding Documentation](../docs/HARDWARE_GROUNDING.md)
- 📊 [LLaMA-3 Case Study](../docs/case-studies/llama3-optimization.md)
