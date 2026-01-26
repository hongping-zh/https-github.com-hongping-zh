#!/usr/bin/env python3
"""
EcoCompute AI - GitHub Action Analysis Script
Analyzes Python files for AI/ML code and predicts training costs and carbon footprint.
"""

import os
import sys
import json
import glob
import re
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional

# GPU Cost Database (USD per hour, based on cloud pricing)
GPU_COSTS = {
    "nvidia-h100": {"hourly_cost": 3.50, "tdp_watts": 700, "efficiency": 1.0},
    "nvidia-a100": {"hourly_cost": 2.50, "tdp_watts": 400, "efficiency": 0.85},
    "nvidia-v100": {"hourly_cost": 1.50, "tdp_watts": 300, "efficiency": 0.65},
    "nvidia-t4": {"hourly_cost": 0.50, "tdp_watts": 70, "efficiency": 0.40},
    "nvidia-l4": {"hourly_cost": 0.80, "tdp_watts": 72, "efficiency": 0.55},
}

# Carbon intensity by region (gCO2/kWh)
CARBON_INTENSITY = {
    "us-west": 350,
    "us-east": 400,
    "eu-west": 300,
    "asia-east": 550,
    "default": 400,
}

# Pattern detection for ML frameworks
ML_PATTERNS = {
    "pytorch_training": [
        r"\.backward\(\)",
        r"optimizer\.step\(\)",
        r"loss\.backward\(\)",
        r"model\.train\(\)",
    ],
    "tensorflow_training": [
        r"model\.fit\(",
        r"tf\.GradientTape\(",
        r"optimizer\.apply_gradients\(",
    ],
    "large_model": [
        r"nn\.Linear\(\s*\d{4,}",  # Large linear layers
        r"nn\.Conv2d\(\s*\d{3,}",  # Large conv layers
        r"hidden_size\s*=\s*\d{4,}",
        r"num_layers\s*=\s*\d{2,}",
    ],
    "data_loading": [
        r"DataLoader\(",
        r"batch_size\s*=\s*\d+",
        r"num_workers\s*=\s*\d+",
    ],
}

@dataclass
class AnalysisResult:
    estimated_cost: float
    estimated_carbon: float
    estimated_hours: float
    files_analyzed: int
    ml_files_found: int
    training_loops_detected: int
    optimization_suggestions: List[Dict]
    passed: bool
    details: Dict

def find_python_files(include_patterns: str, exclude_patterns: str) -> List[Path]:
    """Find Python files matching include patterns, excluding specified patterns."""
    include_list = [p.strip() for p in include_patterns.split(",")]
    exclude_list = [p.strip() for p in exclude_patterns.split(",")]
    
    files = set()
    for pattern in include_list:
        files.update(glob.glob(pattern, recursive=True))
    
    # Remove excluded files
    for pattern in exclude_list:
        excluded = set(glob.glob(pattern, recursive=True))
        files -= excluded
    
    return [Path(f) for f in files if f.endswith(".py")]

def analyze_file(filepath: Path) -> Dict:
    """Analyze a single Python file for ML patterns."""
    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        return {"error": str(e), "is_ml": False}
    
    result = {
        "filepath": str(filepath),
        "is_ml": False,
        "has_training": False,
        "patterns_found": [],
        "complexity_score": 0,
    }
    
    # Check for ML imports
    ml_imports = [
        "import torch", "from torch", 
        "import tensorflow", "from tensorflow",
        "import keras", "from keras",
        "import jax", "from jax",
    ]
    
    for imp in ml_imports:
        if imp in content:
            result["is_ml"] = True
            break
    
    # Check for ML patterns
    for category, patterns in ML_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, content):
                result["patterns_found"].append(category)
                if "training" in category:
                    result["has_training"] = True
                if "large_model" in category:
                    result["complexity_score"] += 10
    
    # Estimate complexity based on code size
    lines = len(content.split("\n"))
    if lines > 500:
        result["complexity_score"] += 5
    if lines > 1000:
        result["complexity_score"] += 10
    
    return result

def estimate_costs(
    file_results: List[Dict],
    gpu: str,
    region: str = "default"
) -> Dict:
    """Estimate training costs based on analysis results."""
    
    gpu_info = GPU_COSTS.get(gpu, GPU_COSTS["nvidia-a100"])
    carbon_intensity = CARBON_INTENSITY.get(region, CARBON_INTENSITY["default"])
    
    # Calculate complexity score
    total_complexity = sum(r.get("complexity_score", 0) for r in file_results)
    training_files = sum(1 for r in file_results if r.get("has_training", False))
    ml_files = sum(1 for r in file_results if r.get("is_ml", False))
    
    # Estimate training hours (simplified model)
    # Base: 1 hour per training file, scaled by complexity
    base_hours = max(1, training_files) * (1 + total_complexity / 50)
    
    # Estimate cost
    estimated_cost = base_hours * gpu_info["hourly_cost"]
    
    # Estimate carbon (kWh * gCO2/kWh / 1000 = kg CO2)
    energy_kwh = base_hours * gpu_info["tdp_watts"] / 1000
    estimated_carbon = energy_kwh * carbon_intensity / 1000
    
    return {
        "estimated_hours": round(base_hours, 2),
        "estimated_cost": round(estimated_cost, 2),
        "estimated_carbon": round(estimated_carbon, 2),
        "ml_files": ml_files,
        "training_files": training_files,
        "total_complexity": total_complexity,
    }

def generate_suggestions(file_results: List[Dict], costs: Dict) -> List[Dict]:
    """Generate optimization suggestions based on analysis."""
    suggestions = []
    
    # Check for large models without optimization
    large_model_files = [r for r in file_results if "large_model" in r.get("patterns_found", [])]
    if large_model_files:
        suggestions.append({
            "title": "Consider Mixed Precision Training",
            "description": "Large models detected. Using FP16/BF16 can reduce memory and speed up training by 2x.",
            "potential_savings": "30-50%",
            "priority": "high",
        })
    
    # Check for training without gradient checkpointing hints
    if costs["training_files"] > 0 and costs["total_complexity"] > 20:
        suggestions.append({
            "title": "Enable Gradient Checkpointing",
            "description": "Complex training detected. Gradient checkpointing can reduce memory usage significantly.",
            "potential_savings": "20-40% memory",
            "priority": "medium",
        })
    
    # Suggest efficient data loading
    data_loading_files = [r for r in file_results if "data_loading" in r.get("patterns_found", [])]
    if data_loading_files:
        suggestions.append({
            "title": "Optimize DataLoader",
            "description": "Consider using pin_memory=True and appropriate num_workers for faster data loading.",
            "potential_savings": "10-20%",
            "priority": "low",
        })
    
    # Cost-based suggestions
    if costs["estimated_cost"] > 100:
        suggestions.append({
            "title": "Consider Spot/Preemptible Instances",
            "description": f"Estimated cost ${costs['estimated_cost']:.2f}. Spot instances can save 60-90%.",
            "potential_savings": "60-90%",
            "priority": "high",
        })
    
    return suggestions

def generate_report(result: AnalysisResult, budget_limit: float, carbon_limit: float) -> str:
    """Generate a Markdown report for PR comment."""
    
    status_emoji = "✅" if result.passed else "❌"
    status_text = "PASSED" if result.passed else "FAILED"
    
    report = f"""## 🌿 EcoCompute AI Cost Analysis Report

### {status_emoji} Status: **{status_text}**

| Metric | Estimated | Limit | Status |
|--------|-----------|-------|--------|
| 💰 **Cost** | ${result.estimated_cost:.2f} | ${budget_limit:.2f} | {"✅" if result.estimated_cost <= budget_limit else "❌"} |
| 🌍 **Carbon** | {result.estimated_carbon:.2f} kg CO₂e | {carbon_limit:.2f} kg | {"✅" if result.estimated_carbon <= carbon_limit else "❌"} |
| ⏱️ **Est. Time** | {result.estimated_hours:.1f} hours | - | - |

### 📊 Analysis Summary

- **Files Analyzed**: {result.files_analyzed}
- **ML Files Found**: {result.ml_files_found}
- **Training Loops Detected**: {result.training_loops_detected}

"""
    
    if result.optimization_suggestions:
        report += "### 💡 Optimization Suggestions\n\n"
        for i, suggestion in enumerate(result.optimization_suggestions, 1):
            priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(suggestion["priority"], "⚪")
            report += f"{i}. {priority_emoji} **{suggestion['title']}**\n"
            report += f"   - {suggestion['description']}\n"
            report += f"   - Potential Savings: {suggestion['potential_savings']}\n\n"
    
    report += """---
<sub>Powered by [EcoCompute AI](https://github.com/hongping-zh/ecocompute-ai) | [Live Demo](https://ecocompute-ai-l7e41qn4gf.edgeone.dev/)</sub>
"""
    
    return report

def main():
    # Get environment variables
    budget_limit = float(os.environ.get("BUDGET_LIMIT", "500"))
    carbon_limit = float(os.environ.get("CARBON_LIMIT", "50"))
    gpu = os.environ.get("GPU", "nvidia-a100")
    include_patterns = os.environ.get("INCLUDE_PATTERNS", "**/*.py")
    exclude_patterns = os.environ.get("EXCLUDE_PATTERNS", "**/test_*.py,**/*_test.py")
    
    print("🌿 EcoCompute AI - Starting Analysis...")
    print(f"   GPU: {gpu}")
    print(f"   Budget Limit: ${budget_limit}")
    print(f"   Carbon Limit: {carbon_limit} kg CO₂e")
    print()
    
    # Find and analyze files
    files = find_python_files(include_patterns, exclude_patterns)
    print(f"📁 Found {len(files)} Python files to analyze")
    
    file_results = []
    for f in files:
        result = analyze_file(f)
        file_results.append(result)
        if result.get("is_ml"):
            print(f"   🔍 ML code found: {f}")
    
    # Estimate costs
    costs = estimate_costs(file_results, gpu)
    
    # Generate suggestions
    suggestions = generate_suggestions(file_results, costs)
    
    # Determine pass/fail
    passed = (costs["estimated_cost"] <= budget_limit and 
              costs["estimated_carbon"] <= carbon_limit)
    
    # Create result object
    result = AnalysisResult(
        estimated_cost=costs["estimated_cost"],
        estimated_carbon=costs["estimated_carbon"],
        estimated_hours=costs["estimated_hours"],
        files_analyzed=len(files),
        ml_files_found=costs["ml_files"],
        training_loops_detected=costs["training_files"],
        optimization_suggestions=suggestions,
        passed=passed,
        details=costs,
    )
    
    # Output results
    print()
    print("=" * 50)
    print("📊 Analysis Results")
    print("=" * 50)
    print(f"   💰 Estimated Cost: ${result.estimated_cost:.2f}")
    print(f"   🌍 Estimated Carbon: {result.estimated_carbon:.2f} kg CO₂e")
    print(f"   ⏱️  Estimated Time: {result.estimated_hours:.1f} hours")
    print(f"   📁 ML Files: {result.ml_files_found}")
    print(f"   🔄 Training Loops: {result.training_loops_detected}")
    print()
    
    if passed:
        print("✅ PASSED - Within budget and carbon limits")
    else:
        print("❌ FAILED - Exceeds budget or carbon limits")
    
    # Save results
    with open("ecocompute_result.json", "w") as f:
        json.dump(asdict(result), f, indent=2)
    
    # Generate and save report
    report = generate_report(result, budget_limit, carbon_limit)
    with open("ecocompute_report.md", "w", encoding="utf-8") as f:
        f.write(report)
    
    # Set GitHub Action outputs
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"estimated_cost={result.estimated_cost}\n")
            f.write(f"estimated_carbon={result.estimated_carbon}\n")
            f.write(f"passed={str(result.passed).lower()}\n")
            f.write(f"optimization_suggestions={json.dumps(result.optimization_suggestions)}\n")
    
    print()
    print("📄 Report saved to ecocompute_report.md")
    
    return 0 if passed else 1

if __name__ == "__main__":
    sys.exit(main())
