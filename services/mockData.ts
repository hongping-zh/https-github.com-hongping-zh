import { AnalysisResult } from "../types";

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  originalEnergyJoules: 0.0225,
  optimizedEnergyJoules: 0.0084,
  improvementPercentage: 62.6,
  carbonSavedGrams: 0.00018,
  estimatedHourlyCost: 3.93, // A100 pricing roughly
  costSavingsPer1MInference: 42.50,
  
  // NEW: Credibility Moat (Error Bars)
  energyErrorMargin: 0.0005, // +/- Joules
  costErrorMargin: 4.10, // +/- USD
  
  confidenceScore: 0.92,
  uncertaintyFactors: ["Assumed Batch Size = 32", "Using Global Avg Carbon Intensity"],
  
  strategyAnalysis: "The architecture relies heavily on standard 3x3 Convolutions with frequent memory access. By fusing Batch Normalization into the preceding Convolution layers and utilizing Depthwise Separable Convolutions (MobileNet style), we can drastically reduce arithmetic intensity and memory bandwidth pressure.",
  
  bottleneckAnalysis: "Memory Bandwidth Bound: The standard ResNet Bottleneck block performs redundant memory reads/writes during the batch norm and activation phases. The 1x1 expansions are computationally expensive without contributing significantly to the receptive field.",
  
  impactAnalogy: "Saving this energy per inference on a model with 1M daily users is equivalent to planting 12 trees per year.",
  
  tradeoffMetrics: {
    performanceScore: 85,
    costEfficiencyScore: 92,
    carbonEfficiencyScore: 88,
    accuracySafetyScore: 98 // NEW: High score means low accuracy risk
  },
  
  recommendations: [
    {
      title: "Fuse Conv+BatchNorm",
      gain: "15-18%",
      reasoning: "Merging BN parameters into Conv weights eliminates a memory access pass during inference.",
      category: "High",
      accuracyRisk: "None",
      estAccuracyDrop: "0.0%"
    },
    {
      title: "Use Depthwise Separable Conv",
      gain: "30-40%",
      reasoning: "Splitting spatial and channel correlations significantly reduces FLOPs with minimal accuracy loss.",
      category: "High",
      accuracyRisk: "Low",
      estAccuracyDrop: "< 0.5%"
    },
    {
      title: "FP16 Quantization",
      gain: "50% Memory",
      reasoning: "Half-precision reduces memory traffic by half, directly speeding up bandwidth-bound layers.",
      category: "Medium",
      accuracyRisk: "Low",
      estAccuracyDrop: "< 0.1%"
    }
  ],
  
  breakdown: [
    { component: "Conv2d (3x3)", percentage: 45, joules: 0.0101, color: "#ef4444" },
    { component: "Memory R/W", percentage: 35, joules: 0.0078, color: "#f97316" },
    { component: "BatchNorm", percentage: 15, joules: 0.0033, color: "#eab308" },
    { component: "Other", percentage: 5, joules: 0.0013, color: "#3b82f6" }
  ],
  
  benchmarkData: {
    found: true,
    source: "MLPerf Inference v4.1 (Datacenter)",
    device: "NVIDIA A100-PCIe-80GB",
    metric: "Energy/Stream",
    value: "0.022 J/Stream (ResNet50)"
  },
  
  assumptions: [
    "Batch Size: 32",
    "Precision: FP32 (Original) vs FP16 (Optimized)",
    "Utilization: 80% Sustained",
    "Carbon Intensity: 450 gCO2/kWh (Global Avg)"
  ],
  
  // P1-5: Strict Citation Format Update
  citations: [
    "[Source: MLPerf Inference v4.1 Results] - Validated ResNet50 baseline energy at 0.022J/Stream.",
    "[Source: NVIDIA A100 Datasheet] - Peak memory bandwidth confirms 1.6 TB/s constraint.",
    "[Source: MobileNetV2 Paper (CVPR 2018)] - Depthwise Separable Conv reduces FLOPs by ~8x."
  ],
  
  energy_model: "E_total = (FLOPs / Perf_W) + (Mem_Bytes * E_dram). Calibrated against MLPerf baseline.",
  
  // P1-5: Explicit Trace showing the Error & Correction
  reasoning_trace: "1. [[PHASE: SEARCH]] Retrieved A100 specs: 250W TDP, 19.5 TFLOPs (FP32).\n2. [[PHASE: COMPUTE]] Attempting Arithmetic Intensity calculation...\n3. [[PHASE: CORRECTION]] ⚠️ Error: FP32 assumptions led to >100% theoretical bandwidth. Self-Correcting: Switching to FP16 precision constraints.\n4. [[PHASE: COMPUTE]] Re-running Python Verification... Success. Intensity = 45 FLOPs/Byte.\n5. [[PHASE: STRATEGY]] Synthesizing Green AI recommendations based on bandwidth bottleneck.",
  
  optimizedCode: `import torch
import torch.nn as nn

class OptimizedBlock(nn.Module):
    def __init__(self, inplanes, planes, stride=1, expansion=4):
        super(OptimizedBlock, self).__init__()
        hidden_dim = planes * expansion
        
        # Optimization 1: Depthwise Separable Convolution
        # Drastically reduces FLOPs and parameters
        self.conv = nn.Sequential(
            # Pointwise
            nn.Conv2d(inplanes, hidden_dim, 1, 1, 0, bias=False),
            nn.BatchNorm2d(hidden_dim),
            nn.ReLU6(inplace=True),
            
            # Depthwise (stride handles downsampling here)
            nn.Conv2d(hidden_dim, hidden_dim, 3, stride, 1, groups=hidden_dim, bias=False),
            nn.BatchNorm2d(hidden_dim),
            nn.ReLU6(inplace=True),
            
            # Pointwise Linear
            nn.Conv2d(hidden_dim, planes * expansion, 1, 1, 0, bias=False),
            nn.BatchNorm2d(planes * expansion)
        )
        
        # Optimization 2: Fused Skip Connection
        self.use_res_connect = (stride == 1 and inplanes == planes * expansion)

    def forward(self, x):
        if self.use_res_connect:
            return x + self.conv(x)
        else:
            return self.conv(x)

# Note: Weights should be converted to FP16 for deployment
# model.half()`
};