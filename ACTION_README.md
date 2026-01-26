# EcoCompute AI GitHub Action

🌿 **CI/CD gatekeeper that predicts AI training costs and carbon footprint before code merges.**

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-EcoCompute%20AI-green?logo=github)](https://github.com/marketplace/actions/ecocompute-ai-cost-gate)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://opensource.org/licenses/Apache-2.0)

## 🚀 Quick Start

Add to your workflow (`.github/workflows/ecocompute.yml`):

```yaml
name: EcoCompute Cost Gate
on: [pull_request]

jobs:
  cost-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: EcoCompute AI Analysis
        uses: hongping-zh/ecocompute-ai@v1
        with:
          budget_limit: 500    # USD
          carbon_limit: 50     # kg CO2e
          gpu: nvidia-a100
```

## 📋 Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `budget_limit` | Maximum allowed cost in USD | No | `500` |
| `carbon_limit` | Maximum allowed carbon in kg CO₂e | No | `50` |
| `gpu` | Target GPU (nvidia-h100, nvidia-a100, nvidia-v100, nvidia-t4) | No | `nvidia-a100` |
| `fail_on_exceed` | Fail workflow if limits exceeded | No | `true` |
| `comment_on_pr` | Post results as PR comment | No | `true` |
| `include_patterns` | Files to analyze (glob) | No | `**/*.py` |
| `exclude_patterns` | Files to exclude (glob) | No | `**/test_*.py` |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `estimated_cost` | Predicted training cost in USD |
| `estimated_carbon` | Predicted carbon footprint in kg CO₂e |
| `passed` | Whether the check passed (true/false) |
| `optimization_suggestions` | JSON array of suggestions |

## 📊 Example PR Comment

When `comment_on_pr: true`, the action posts a detailed report:

```
## 🌿 EcoCompute AI Cost Analysis Report

### ✅ Status: PASSED

| Metric | Estimated | Limit | Status |
|--------|-----------|-------|--------|
| 💰 Cost | $127.50 | $500.00 | ✅ |
| 🌍 Carbon | 8.3 kg CO₂e | 50.00 kg | ✅ |
| ⏱️ Est. Time | 3.2 hours | - | - |

### 💡 Optimization Suggestions
1. 🔴 **Consider Mixed Precision Training**
   - Large models detected. Using FP16/BF16 can reduce memory and speed up training by 2x.
   - Potential Savings: 30-50%
```

## 🔧 Advanced Usage

### Custom File Patterns

```yaml
- uses: hongping-zh/ecocompute-ai@v1
  with:
    include_patterns: 'src/**/*.py,models/**/*.py'
    exclude_patterns: '**/test_*.py,**/conftest.py'
```

### Use Outputs in Subsequent Steps

```yaml
- name: EcoCompute Analysis
  id: ecocompute
  uses: hongping-zh/ecocompute-ai@v1

- name: Check Results
  run: |
    echo "Estimated cost: ${{ steps.ecocompute.outputs.estimated_cost }}"
    echo "Passed: ${{ steps.ecocompute.outputs.passed }}"
```

### Non-blocking Mode

```yaml
- uses: hongping-zh/ecocompute-ai@v1
  with:
    fail_on_exceed: false  # Don't fail, just report
```

## 🌍 Supported GPUs

| GPU | Hourly Cost | TDP | Efficiency |
|-----|-------------|-----|------------|
| NVIDIA H100 | $3.50 | 700W | 100% |
| NVIDIA A100 | $2.50 | 400W | 85% |
| NVIDIA V100 | $1.50 | 300W | 65% |
| NVIDIA T4 | $0.50 | 70W | 40% |
| NVIDIA L4 | $0.80 | 72W | 55% |

## 📈 How It Works

1. **Static Analysis** - Scans Python files for ML/AI patterns
2. **Complexity Scoring** - Estimates model size and training complexity
3. **Cost Prediction** - Calculates estimated GPU hours and costs
4. **Carbon Estimation** - Computes CO₂e based on energy and grid intensity
5. **Optimization Suggestions** - Provides actionable recommendations

## 🔗 Links

- **Live Demo**: https://ecocompute-ai-l7e41qn4gf.edgeone.dev/
- **GitHub**: https://github.com/hongping-zh/ecocompute-ai
- **Issues**: https://github.com/hongping-zh/ecocompute-ai/issues

## 📄 License

Apache 2.0 - Free for open source and commercial use.

---

<p align="center">
  <b>Built with 💚 for a sustainable AI future</b>
</p>
