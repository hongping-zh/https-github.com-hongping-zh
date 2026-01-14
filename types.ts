
export interface HardwareProfile {
  id: string;
  name: string;
  type: 'GPU' | 'TPU' | 'CPU' | 'Mobile';
  icon: string;
  efficiency: string; // e.g. "Low", "Medium", "High"
  region?: string; // e.g., "us-central1"
  carbonIntensity?: number; // gCO2/kWh
}

export interface EnergyBreakdownItem {
  component: string;
  percentage: number;
  joules: number;
  color: string;
  [key: string]: any;
}

export interface RecommendationItem {
  title: string;
  gain: string; // e.g. "15-20%"
  reasoning: string;
  category: 'High' | 'Medium' | 'Exploratory';
}

export interface TradeoffMetrics {
  performanceScore: number; // 0-100 (Higher is faster)
  costEfficiencyScore: number; // 0-100 (Higher is cheaper)
  carbonEfficiencyScore: number; // 0-100 (Higher is greener)
}

export interface BenchmarkData {
  found: boolean;
  source: string; // e.g., "MLPerf Inference v4.0"
  device: string; // e.g., "NVIDIA H100"
  metric: string; // e.g., "Joules/Stream"
  value: string; // e.g., "450 J"
}

export interface AnalysisResult {
  // Quantitative Metrics
  originalEnergyJoules: number;
  optimizedEnergyJoules: number;
  improvementPercentage: number;
  carbonSavedGrams: number;
  
  estimatedHourlyCost?: number;
  costSavingsPer1MInference?: number;
  
  // Uncertainty Quantification
  confidenceScore: number; // 0.0 to 1.0
  uncertaintyFactors: string[]; // List of factors lowering confidence
  strategyAnalysis: string; // Strategic advice based on confidence level
  
  // Decision Support
  tradeoffMetrics: TradeoffMetrics; // New: Triangle Model Data

  // Transparency & Explainability (P0-3)
  assumptions: string[]; // e.g., "Batch Size = 1", "FP16 Precision"
  citations: string[]; // e.g., "NVIDIA B200 Datasheet (2025)"
  energy_model: string; // Explanation of how GFLOPs -> Joules was derived

  // MLPerf Validation
  benchmarkData?: BenchmarkData;

  // Qualitative Analysis
  reasoning_trace: string; // Explicit Chain of Thought
  bottleneckAnalysis: string;
  impactAnalogy: string;
  
  // Categorized Recommendations
  recommendations: RecommendationItem[];
  
  // Code & Charts
  optimizedCode: string;
  breakdown: EnergyBreakdownItem[];
}

// Data Moat Types
export interface DataMoatMetric {
  label: string;
  value: string;
  icon: any;
  description: string;
}

export interface DataFlywheelStage {
  stage: number;
  title: string;
  description: string;
}

export const EXAMPLES: Record<string, string> = {
  'ResNet-50 Block': `import torch
import torch.nn as nn

class Bottleneck(nn.Module):
    expansion = 4
    def __init__(self, inplanes, planes, stride=1):
        super(Bottleneck, self).__init__()
        # 1x1 conv - High memory access relative to compute
        self.conv1 = nn.Conv2d(inplanes, planes, kernel_size=1, bias=False)
        self.bn1 = nn.BatchNorm2d(planes)
        # 3x3 conv
        self.conv2 = nn.Conv2d(planes, planes, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(planes)
        # 1x1 conv
        self.conv3 = nn.Conv2d(planes, planes * self.expansion, kernel_size=1, bias=False)
        self.bn3 = nn.BatchNorm2d(planes * self.expansion)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        identity = x
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)
        out = self.conv2(out)
        out = self.bn2(out)
        out = self.relu(out)
        out = self.conv3(out)
        out = self.bn3(out)
        
        if stride != 1 or inplanes != planes * self.expansion:
             # This skip connection logic is often a bottleneck if not fused
             identity = nn.Sequential(
                nn.Conv2d(inplanes, planes * self.expansion, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(planes * self.expansion),
             )(x)

        out += identity
        out = self.relu(out)
        return out`,

  'BERT Attention': `import torch
import torch.nn as nn
import math

class SelfAttention(nn.Module):
    def __init__(self, hidden_size, num_heads):
        super(SelfAttention, self).__init__()
        self.num_heads = num_heads
        self.head_dim = hidden_size // num_heads
        
        # Standard Linear projections are memory bandwidth intensive
        self.query = nn.Linear(hidden_size, hidden_size)
        self.key = nn.Linear(hidden_size, hidden_size)
        self.value = nn.Linear(hidden_size, hidden_size)
        self.out = nn.Linear(hidden_size, hidden_size)

    def forward(self, x):
        b, s, h = x.shape
        # Matrix multiplications (High FLOPs)
        q = self.query(x)
        k = self.key(x)
        v = self.value(x)
        
        # Scaled Dot-Product Attention
        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(self.head_dim)
        attn = torch.softmax(scores, dim=-1)
        out = torch.matmul(attn, v)
        return self.out(out)`,

  'MobileNetV2': `import torch
import torch.nn as nn

class InvertedResidual(nn.Module):
    def __init__(self, inp, oup, stride, expand_ratio):
        super(InvertedResidual, self).__init__()
        hidden_dim = round(inp * expand_ratio)
        self.use_res_connect = stride == 1 and inp == oup

        layers = []
        if expand_ratio != 1:
            # Pointwise
            layers.append(nn.Conv2d(inp, hidden_dim, 1, 1, 0, bias=False))
            layers.append(nn.BatchNorm2d(hidden_dim))
            layers.append(nn.ReLU6(inplace=True))
        
        # Depthwise (Efficient but fragmented memory access)
        layers.extend([
            nn.Conv2d(hidden_dim, hidden_dim, 3, stride, 1, groups=hidden_dim, bias=False),
            nn.BatchNorm2d(hidden_dim),
            nn.ReLU6(inplace=True),
            # Pointwise-linear
            nn.Conv2d(hidden_dim, oup, 1, 1, 0, bias=False),
            nn.BatchNorm2d(oup),
        ])
        self.conv = nn.Sequential(*layers)

    def forward(self, x):
        if self.use_res_connect:
            return x + self.conv(x)
        else:
            return self.conv(x)`
};

export const INITIAL_CODE = EXAMPLES['ResNet-50 Block'];

// A hand-drawn style SVG of a Residual Block topology
export const DEMO_SKETCH = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDUwIiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7Ij4KICA8ZGVmcz4KICAgIDxtYXJrZXIgaWQ9ImFycm93IiBtYXJrZXJXaWR0aD0iMTAiIG1hcmtlckhlaWdodD0iMTAiIHJlZlg9IjkiIHJlZlk9IjMiIG9yaWVudD0iYXV0byI+CiAgICAgIDxwYXRoIGQ9Ik0wLDAgTDAsNiBMOSwzIHoiIGZpbGw9IiMzMzMiIC8+CiAgICA8L21hcmtlcj4KICA8L2RlZnM+CiAgPHN0eWxlPgogICAgdGV4dCB7IGZvbnQtZmFtaWx5OiAnQ29taWMgU2FucyBNUycsICdDaGFsa2JvYXJkIFNFJywgc2Fucy1zZXJpZjsgZm9udC1zaXplOiAxNnB4OyBmaWxsOiAjMzMzOyB9CiAgICBwYXRoLCByZWN0IHsgc3Ryb2tlOiAjMzMzOyBzdHJva2Utd2lkdGg6IDI7IGZpbGw6IG5vbmU7IHN0cm9rZS1saW5lY2FwOiByb3VuZDsgc3Ryb2tlLWxpbmVqb2luOiByb3VuZDsgfQogIDwvc3R5bGU+CiAgCiAgPCEtLSBJbnB1dCAtLT4KICA8cmVjdCB4PSI1MCIgeT0iMTg1IiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHJ4PSI1IiAvPgogIDx0ZXh0IHg9IjU1IiB5PSIyMjAiPklucHV0PC90ZXh0PgogIDx0ZXh0IHg9IjQ1IiB5PSIyNjUiIHN0eWxlPSJmb250LXNpemU6MTJweCI+KHgsIGluX2NoKQo8L3RleHQ+CgogIDwhLS0gQXJyb3cgLS0+CiAgPHBhdGggZD0iTTEyMCAyMTUgSCAxNjAiIG1hcmtlci1lbmQ9InVybCgjYXJyb3cpIiAvPgoKICA8IS0tIFJlc0Jsb2NrIEJveCAtLT4KICA8cmVjdCB4PSIxNzAiIHk9IjkwIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI1MCIgc3Ryb2tlLWRhc2hhcnJheT0iNSw1IiBzdHJva2U9IiM2NjYiIC8+CiAgPHRleHQgeD0iMTgwIiB5PSI4MCIgc3R5bGU9ImZpbGw6IzY2NiI+Qm90dGxlbmVjayBCbG9jazwvdGV4dD4KCiAgPCEtLSBDb252IDEgLS0+CiAgPHJlY3QgeD0iMTkwIiB5PSIxMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgLz4KICA8dGV4dCB4PSIyMDUiIHk9IjEzNSI+Q29udjE8L3RleHQ+CiAgPHRleHQgeD0iMjg1IiB5PSIxMzUiIHN0eWxlPSJmb250LXNpemU6MTJweCI+MXgxPC90ZXh0PgoKICA8IS0tIEFycm93IC0tPgogIDxwYXRoIGQ9Ik0yMzAgMTU1IFYgMTgwIiBtYXJrZXItZW5kPSJ1cmwoI2Fycm93KSIgLz4KCiAgPCEtLSBDb252IDIgLS0+CiAgPHJlY3QgeD0iMTkwIiB5PSIxOTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgLz4KICA8dGV4dCB4PSIyMDUiIHk9IjIxNSI+Q29udjI8L3RleHQ+CiAgPHRleHQgeD0iMjg1IiB5PSIyMTUiIHN0eWxlPSJmb250LXNpemU6MTJweCI+M3gzPC90ZXh0PgoKICA8IS0tIEFycm93IC0tPgogIDxwYXRoIGQ9Ik0yMzAgMjM1IFYgMjYwIiBtYXJrZXItZW5kPSJ1cmwoI2Fycm93KSIgLz4KICA8IS0tIENvbnYgMyAtLT4KICA8cmVjdCB4PSIxOTAiIHk9IjI3MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiAvPgogIDx0ZXh0IHg9IjIwNSIgeT0iMjk1Ij5Db252MzwvdGV4dD4KICA8dGV4dCB4PSIyODUiIHk9IjI5NSIgc3R5bGU9ImZvbnQtc2l6ZToxMnB4Ij4xeDE8L3RleHQ+CgogIDwhLS0gU2tpcCBDb25uZWN0aW9uIC0tPgogIDxwYXRoIGQ9Ik0xNjAgMjE1IFYgMzUwIEggMzgwIiBzdHlsZT0ic3Ryb2tlOiAjMjJjNTVlOyIgLz4KICA8dGV4dCB4PSIyMDAiIHk9IjM3MCIgc3R5bGU9ImZpbGw6IzIyYzU1ZTsgZm9udC1zaXplOjEycHgiPklkZW50aXR5IChTa2lwKTwvdGV4dD4KCiAgPCEtLSBSZWx1IC8gQWRkIC0tPgogIDxjaXJjbGUgY3g9IjQwMCIgY3k9IjI5MCIgcj0iMTUiIC8+CiAgPHRleHQgeD0iMzkzIiB5PSIyOTUiIHN0eWxlPSJmb250LXdlaWdodDpib2xkIj4rPC90ZXh0PgoKICA8IS0tIEFycm93IC0tPgogIDxwYXRoIGQ9Ik0yNzAgMjkwIEggMzgwIiBtYXJrZXItZW5kPSJ1cmwoI2Fycm93KSIgLz4KICA8cGF0aCBkPSJNNDAwIDM1MCBWIDMxMCIgbWFya2VyLWVuZD0idXJsKCNhcnJvdykiIC8+CiAgPCEtLSBPdXRwdXQgLS0+CiAgPHBhdGggZD0iTTQxNSAyOTAgSCA0NjAiIG1hcmtlci1lbmQ9InVybCgjYXJyb3cpIiAvPgogIDxyZWN0IHg9IjQ2MCIgeT0iMjY1IiB3aWR0aD0iNjAiIGhlaWdodD0iNTAiIC8+CiAgPHRleHQgeD0iNDcwIiB5PSIyOTUiPk91dDwvdGV4dD4KPC9zdmc+`;
