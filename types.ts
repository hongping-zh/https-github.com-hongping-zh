
export interface HardwareProfile {
  id: string;
  name: string;
  type: 'GPU' | 'TPU' | 'CPU' | 'Mobile';
  icon: string;
  efficiency: string; // e.g. "Low", "Medium", "High"
  region?: string; // e.g., "us-central1"
  carbonIntensity?: number; // gCO2/kWh
  isVerified?: boolean; // NEW: Solves "Hallucination" critique. True = Hardcoded/Trusted DB.
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
  accuracyRisk: 'None' | 'Low' | 'Medium' | 'High'; // NEW: Solves "Accuracy Risk"
  estAccuracyDrop?: string; // e.g. "< 0.1%"
}

export interface TradeoffMetrics {
  performanceScore: number; // 0-100 (Higher is faster)
  costEfficiencyScore: number; // 0-100 (Higher is cheaper)
  carbonEfficiencyScore: number; // 0-100 (Higher is greener)
  accuracySafetyScore: number; // NEW: 0-100 (100 = No accuracy loss)
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
  
  // FinOps / Cost Analysis
  estimatedHourlyCost: number; 
  costSavingsPer1MInference: number; 
  
  // Uncertainty / Error Bars
  energyErrorMargin: number; 
  costErrorMargin: number; 

  // Uncertainty Quantification
  confidenceScore: number; 
  uncertaintyFactors: string[]; 
  strategyAnalysis: string; 
  
  // Decision Support
  tradeoffMetrics: TradeoffMetrics; 

  // Transparency & Explainability
  assumptions: string[]; 
  citations: string[]; 
  energy_model: string; 

  // MLPerf Validation
  benchmarkData?: BenchmarkData;

  // Qualitative Analysis
  reasoning_trace: string; 
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

// V38 Chat Types
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const EXAMPLES: Record<string, string> = {
  'Llama 3 Attention (GQA)': `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class LlamaGQA(nn.Module):
    """
    Llama 3 Style Grouped Query Attention (GQA).
    Optimized for reduced KV cache memory bandwidth.
    """
    def __init__(self, dim=4096, n_heads=32, n_kv_heads=8):
        super().__init__()
        self.n_heads = n_heads
        self.n_kv_heads = n_kv_heads
        self.n_rep = n_heads // n_kv_heads # Replication factor (e.g. 4)
        self.head_dim = dim // n_heads
        
        # GQA: Query has n_heads, Keys/Values have fewer n_kv_heads
        self.wq = nn.Linear(dim, n_heads * self.head_dim, bias=False)
        self.wk = nn.Linear(dim, n_kv_heads * self.head_dim, bias=False)
        self.wv = nn.Linear(dim, n_kv_heads * self.head_dim, bias=False)
        self.wo = nn.Linear(n_heads * self.head_dim, dim, bias=False)

    def forward(self, x):
        b, s, d = x.shape
        
        # Projections
        xq = self.wq(x).view(b, s, self.n_heads, self.head_dim)
        xk = self.wk(x).view(b, s, self.n_kv_heads, self.head_dim)
        xv = self.wv(x).view(b, s, self.n_kv_heads, self.head_dim)
        
        # GQA: Repeat KV heads to match Query heads virtually
        # In optimized inference (vLLM), we don't physically repeat, but for Torch logic we do:
        xk = xk.repeat_interleave(self.n_rep, dim=2)
        xv = xv.repeat_interleave(self.n_rep, dim=2)
        
        # Transpose for Attention: (B, H, S, D)
        xq, xk, xv = xq.transpose(1, 2), xk.transpose(1, 2), xv.transpose(1, 2)
        
        # Scaled Dot-Product Attention
        scores = torch.matmul(xq, xk.transpose(-2, -1)) / math.sqrt(self.head_dim)
        scores = F.softmax(scores.float(), dim=-1).type_as(xq)
        output = torch.matmul(scores, xv)
        
        output = output.transpose(1, 2).contiguous().view(b, s, -1)
        return self.wo(output)`,

  'ResNet-50 Block (Baseline)': `import torch
import torch.nn as nn

class Bottleneck(nn.Module):
    """
    Standard ResNet-50 Bottleneck. 
    Used as the 'Calibration Baseline' for EcoCompute's physics engine.
    """
    expansion = 4
    
    def __init__(self, inplanes=64, planes=64, stride=1, downsample=None):
        super(Bottleneck, self).__init__()
        # Store parameters as instance variables
        self.stride = stride
        self.downsample = downsample
        
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
        
        # Create downsample layer if dimensions don't match
        if inplanes != planes * self.expansion or stride != 1:
            self.downsample = nn.Sequential(
                nn.Conv2d(inplanes, planes * self.expansion, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(planes * self.expansion),
            )

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
        
        # Apply downsample if needed
        if self.downsample is not None:
            identity = self.downsample(x)

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
            return self.conv(x)`,

  'Multi-Agent FinOps (Antigravity)': `"""
Multi-Agent Parallel Development - Cost Prediction Demo
Shows how EcoCompute Agent FinOps predicts token costs BEFORE execution.
"""
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class AgentConfig:
    name: str
    model: str
    input_price_per_1m: float
    output_price_per_1m: float

# Define 5-agent swarm (Antigravity-style)
AGENT_SWARM = [
    AgentConfig("Architect", "gemini-2.0-pro", 3.50, 10.50),
    AgentConfig("Frontend", "gemini-2.0-flash", 0.35, 1.05),
    AgentConfig("Backend", "gemini-2.0-flash", 0.35, 1.05),
    AgentConfig("Tester", "gemini-2.0-flash", 0.35, 1.05),
    AgentConfig("Reviewer", "gemini-2.0-pro", 3.50, 10.50),
]

def predict_agent_cost(agent: AgentConfig, turns: int, repo_tokens: int) -> float:
    """Predict cost with Context Ballooning effect."""
    total_cost = 0.0
    history_tokens = 0
    
    for turn in range(1, turns + 1):
        input_tokens = 2000 + repo_tokens + history_tokens
        input_cost = (input_tokens / 1_000_000) * agent.input_price_per_1m
        output_cost = (1000 / 1_000_000) * agent.output_price_per_1m
        total_cost += input_cost + output_cost
        history_tokens += 1050  # Context grows each turn
    
    return total_cost

def predict_swarm_cost(turns: int = 15, repo_tokens: int = 50000) -> Dict:
    """Predict total multi-agent workflow cost."""
    costs = {a.name: predict_agent_cost(a, turns, repo_tokens) for a in AGENT_SWARM}
    subtotal = sum(costs.values())
    overhead = subtotal * 0.2  # Coordination overhead
    
    return {
        "agent_costs": costs,
        "subtotal": subtotal,
        "coordination_overhead": overhead,
        "total": subtotal + overhead
    }

# Run prediction
result = predict_swarm_cost(turns=15, repo_tokens=50000)
print(f"Total Predicted Cost: \${result['total']:.2f}")
print(f"Without FinOps (monthly): \${result['total'] * 10:.2f}")
print(f"With FinOps (51% savings): \${result['total'] * 10 * 0.49:.2f}")`
};

export const INITIAL_CODE = EXAMPLES['ResNet-50 Block (Baseline)'];

// A hand-drawn style SVG of a Residual Block topology
export const DEMO_SKETCH = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDUwIiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7Ij4KICA8ZGVmcz4KICAgIDxtYXJrZXIgaWQ9ImFycm93IiBtYXJrZXJXaWR0aD0iMTAiIG1hcmtlckhlaWdodD0iMTAiIHJlZlg9IjkiIHJlZlk9IjMiIG9yaWVudD0iYXV0byI+CiAgICAgIDxwYXRoIGQ9Ik0wLDAgTDAsNiBMOSwzIHoiIGZpbGw9IiMzMzMiIC8+CiAgICA8L21hcmtlcj4KICA8L2RlZnM+CiAgPHN0eWxlPgogICAgdGV4dCB7IGZvbnQtZmFtaWx5OiAnQ29taWMgU2FucyBNUycsICdDaGFsa2JvYXJkIFNFJywgc2Fucy1zZXJpZjsgZm9udC1zaXplOiAxNnB4OyBmaWxsOiAjMzMzOyB9CiAgICBwYXRoLCByZWN0IHsgc3Ryb2tlOiAjMzMzOyBzdHJva2Utd2lkdGg6IDI7IGZpbGw6IG5vbmU7IHN0cm9rZS1saW5lY2FwOiByb3VuZDsgc3Ryb2tlLWxpbmVqb2luOiByb3VuZDsgfQogIDwvc3R5bGU+CiAgCiAgPCEtLSBJbnB1dCAtLT4KICA8cmVjdCB4PSI1MCIgeT0iMTg1IiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHJ4PSI1IiAvPgogIDx0ZXh0IHg9IjU1IiB5PSIyMjAiPklucHV0PC90ZXh0PgogIDx0ZXh0IHg9IjQ1IiB5PSIyNjUiIHN0eWxlPSJmb250LXNpemU6MTJweCI+KHgsIGluX2NoKQo8L3RleHQ+CgogIDwhLS0gQXJyb3cgLS0+CiAgPHBhdGggZD0iTTEyMCAyMTUgSCAxNjAiIG1hcmtlci1lbmQ9InVybCgjYXJyb3cpIiAvPgogIDwhLS0gUmVzdG9uYWwgQmxvY2sgQm94IC0tPgogIDxyZWN0IHg9IjE3MCIgeT0iOTAiIHdpZHRoPSIyODAiIGhlaWdodD0iMjUwIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZT0iIzY2NiIgLz4KICA8dGV4dCB4PSIxODAiIHk9IjgwIiBzdHlsZT0iZmlsbDojNjY2Ij5Cb3R0bGVuZW1jIEJsb2NrPC90ZXh0PgogIDwhLS0gQ29udjEgLS0+CiAgPHJlY3QgeD0iMTkwIiB5PSIxMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCIgLz4KICA8dGV4dCB4PSIyMDUiIHk9IjEzNSI+Q29udjE8L3RleHQ+CiAgPHRleHQgeD0iMjg1IiB5PSIxMzUiIHN0eWxlPSJmb250LXNpemU6MTJweCI+MXgxPC90ZXh0PgoKICA8IS0tIEFycm93IC0tPgogIDxwYXRoIGQ9Ik0yMzAgMTU1IFYgMTgwIiBtYXJrZXItZW5kPSJ1cmwoI2Fycm93KSIgLz4KICA8IS0tIENvbnYgMyAtLT4KICA8cmVjdCB4PSIxOTAiIHk9IjE5MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiAvPgogIDx0ZXh0IHg9IjIwNSIgeT0iMjE1Ij5Db252MzwvdGV4dD4KICA8dGV4dCB4PSIyODUiIHk9IjIxNSIgc3R5bGU9ImZvbnQtc2l6ZToxMnB4Ij4xeDE8L3RleHQ+CgogIDwhLS0gQXJyb3cgLS0+CiAgPHBhdGggZD0iTTIzMCAyMzUgViAyNjAiIG1hcmtlci1lbmQ9InVybCgjYXJyb3cpIiAvPgogIDwhLS0gQ29udiAzIC0tPgogIDxyZWN0IHg9IjE5MCIgeT0iMjcwIiB3aWR0aD0iODAiIGhlaWdodD0iNDAiIC8+CiAgPHRleHQgeD0iMjA1IiB5PSIyOTUiPkNvbnYzPC90ZXh0PgogIDx0ZXh0IHg9IjIwNSIgeT0iMjk1IiBzdHlsZT0iZm9udC1zaXplOjEycHgiPjF4MTwvdGV4dD4KCiAgPCEtLSBTa2lwIENvbm5lY3Rpb24gLS0+CiAgPHBhdGggZD0iTTE2MCAyMTUgViAzNTAgSCAzODAiIHN0eWxlPSJzdHJva2U6ICMyMmM1NWU7IiAvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMzcwIiBzdHlsZT0iZmlsbDojMjJjNTVlOyBmb250LXNpemU6MTJweCI+SWRlbnRpdHkgKFNraXApPC90ZXh0PgoKICA8IS0tIFJlbHUgLyBBZGQgLS0+CiAgPGNpcmNsZSBjeD0iNDAwIiBjeT0iMjkwIiByPSIxNSIgLz4KICA8dGV4dCB4PSIzOTMiIHk9IjI5NSIgc3R5bGU9ImZvbnQtd2VpZ2h0OmJvbGQiPis8L3RleHQ+CgogIDwhLS0gQXJyb3cgLS0+CiAgPHBhdGggZD0iTTI3MCAyOTAgSCAzODAiIG1hcmtlci1lbmQ9InVybCgjYXJyb3cpIiAvPgogIDxwYXRoIGQ9Ik00MDAgMzUwIFYgMzEwIiBtYXJrZXItZW5kPSJ1cmwoI2Fycm93KSIgLz4KICA8IS0tIE91dHB1dCAtLT4KICA8cGF0aCBkPSJNNDE1IDI5MCBIIDQ2MCIgbWFya2VyLWVuZD0idXJsKCNhcnJvdykiIC8+CiAgPHJlY3QgeD0iNDYwIiB5PSIyNjUiIHdpZHRoPSI2MCIgaGVpZ2h0PSI1MCIgLz4KICA8dGV4dCB4PSI0NzAiIHk9IjI5NSI+T3V0PC90ZXh0Pgo8L3N2Zz4=`;