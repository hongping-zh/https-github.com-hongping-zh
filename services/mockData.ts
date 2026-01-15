import { AnalysisResult } from "../types";

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  originalEnergyJoules: 0.0225,
  optimizedEnergyJoules: 0.0084,
  improvementPercentage: 62.6,
  carbonSavedGrams: 0.00018,
  estimatedHourlyCost: 3.93,
  costSavingsPer1MInference: 42.5,
  confidenceScore: 0.92,
  uncertaintyFactors: ["Assumed Batch Size = 32", "Using Global Avg Carbon Intensity"],
  strategyAnalysis:
    "The architecture relies heavily on standard 3x3 Convolutions with frequent memory access. By fusing Batch Normalization into the preceding Convolution layers and utilizing Depthwise Separable Convolutions (MobileNet style), we can drastically reduce arithmetic intensity and memory bandwidth pressure.",
  bottleneckAnalysis:
    "Memory Bandwidth Bound: The standard ResNet Bottleneck block performs redundant memory reads/writes during the batch norm and activation phases. The 1x1 expansions are computationally expensive without contributing significantly to the receptive field.",
  impactAnalogy: "Saving this energy per inference on a model with 1M daily users is equivalent to planting 12 trees per year.",
  tradeoffMetrics: {
    performanceScore: 85,
    costEfficiencyScore: 92,
    carbonEfficiencyScore: 88
  },
  recommendations: [
    {
      title: "Fuse Conv+BatchNorm",
      gain: "15-18%",
      reasoning: "Merging BN parameters into Conv weights eliminates a memory access pass during inference.",
      category: "High"
    },
    {
      title: "Use Depthwise Separable Conv",
      gain: "30-40%",
      reasoning: "Splitting spatial and channel correlations significantly reduces FLOPs with minimal accuracy loss.",
      category: "High"
    },
    {
      title: "FP16 Quantization",
      gain: "50% Memory",
      reasoning: "Half-precision reduces memory traffic by half, directly speeding up bandwidth-bound layers.",
      category: "Medium"
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
  citations: [
    "MLPerf Inference Benchmark v4.1 Results",
    "NVIDIA A100 Tensor Core GPU Architecture Whitepaper",
    "MobileNetV2: Inverted Residuals and Linear Bottlenecks (CVPR 2018)"
  ],
  energy_model: "E_total = (FLOPs / Perf_W) + (Mem_Bytes * E_dram). Calibrated against MLPerf baseline.",
  reasoning_trace:
    "1. [SEARCH] Retrieved A100 specs: 250W TDP, 19.5 TFLOPs (FP32).\n2. [ANALYSIS] Input code is a standard ResNet Bottleneck. High memory traffic detected at BN layers.\n3. [COMPUTE] Calculated Arithmetic Intensity: 45 FLOPs/Byte (Low). System is bandwidth bound.\n4. [STRATEGY] Applied Operator Fusion and Quantization simulation.\n5. [VERIFY] Cross-referenced with MLPerf ResNet50-v1.5 energy results.",
  optimizedCode: `import torch
import torch.nn as nn

class OptimizedBlock(nn.Module):
    def __init__(self, inplanes, planes, stride=1, expansion=4):
        super(OptimizedBlock, self).__init__()
        hidden_dim = planes * expansion
        
        self.conv = nn.Sequential(
            nn.Conv2d(inplanes, hidden_dim, 1, 1, 0, bias=False),
            nn.BatchNorm2d(hidden_dim),
            nn.ReLU6(inplace=True),
            
            nn.Conv2d(hidden_dim, hidden_dim, 3, stride, 1, groups=hidden_dim, bias=False),
            nn.BatchNorm2d(hidden_dim),
            nn.ReLU6(inplace=True),
            
            nn.Conv2d(hidden_dim, planes * expansion, 1, 1, 0, bias=False),
            nn.BatchNorm2d(planes * expansion)
        )
        
        self.use_res_connect = (stride == 1 and inplanes == planes * expansion)

    def forward(self, x):
        if self.use_res_connect:
            return x + self.conv(x)
        else:
            return self.conv(x)

# Note: Weights should be converted to FP16 for deployment
# model.half()`
};
