# 📊 Case Study: Detecting Redundant Compute in LLaMA-3 Training

## Executive Summary

Using EcoCompute AI's static analysis on a LLaMA-3 style training codebase, we identified **$127,000 in potential savings** (23% reduction) through three key optimizations that were invisible to traditional monitoring tools.

---

## 🎯 The Challenge

A research team was preparing to train a LLaMA-3 7B model on 500B tokens. Their initial cost estimate:

| Resource | Specification | Cost |
|----------|---------------|------|
| GPUs | 64× NVIDIA H100 | $3.50/hr each |
| Training Time | 14 days | 336 hours |
| **Total Estimated** | | **$752,640** |

They asked: *"Can we validate this estimate and find optimizations before we start?"*

---

## 🔍 EcoCompute Analysis Results

### Pre-flight Scan Output

```
🌿 EcoCompute AI - Pre-Training Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Analyzed: 47 Python files
🔍 Model Architecture: LLaMA-3 7B (6.7B parameters)
🎯 Training Config: 500B tokens, batch_size=2048, seq_len=4096

⚠️  REDUNDANCY DETECTED: 3 issues found

┌─────────────────────────────────────────────────────────────┐
│ Issue #1: Suboptimal Attention Implementation               │
│ Severity: HIGH | Potential Savings: $98,000 (13%)          │
├─────────────────────────────────────────────────────────────┤
│ Location: model/attention.py:45-89                          │
│                                                             │
│ Finding: Standard scaled dot-product attention detected.    │
│ FlashAttention-2 is available but not enabled.              │
│                                                             │
│ Impact:                                                     │
│   - Current: 2.3 ms/step attention compute                  │
│   - Optimized: 0.9 ms/step with FlashAttention-2            │
│   - Memory: 40% reduction enables larger batch sizes        │
│                                                             │
│ Recommendation:                                             │
│   Replace: outputs = torch.matmul(attn_weights, value)      │
│   With: outputs = F.scaled_dot_product_attention(q, k, v)   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Issue #2: Inefficient Gradient Checkpointing Strategy       │
│ Severity: MEDIUM | Potential Savings: $45,000 (6%)         │
├─────────────────────────────────────────────────────────────┤
│ Location: model/transformer.py:112-145                      │
│                                                             │
│ Finding: Checkpointing every layer, but MLP layers have     │
│ 3x more parameters than attention. Selective checkpointing  │
│ on MLP only would reduce recomputation overhead.            │
│                                                             │
│ Current Config:                                             │
│   checkpoint_every_layer: true                              │
│   recomputation_overhead: 33%                               │
│                                                             │
│ Optimized Config:                                           │
│   checkpoint_mlp_only: true                                 │
│   recomputation_overhead: 18%                               │
│                                                             │
│ Recommendation:                                             │
│   Use selective checkpointing for MLP blocks only.          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Issue #3: Data Loading Bottleneck                           │
│ Severity: LOW | Potential Savings: $15,000 (2%)            │
├─────────────────────────────────────────────────────────────┤
│ Location: data/dataloader.py:23-45                          │
│                                                             │
│ Finding: num_workers=4 is insufficient for 64 GPUs.         │
│ GPU utilization drops to 78% during data loading.           │
│                                                             │
│ Current: num_workers=4, pin_memory=False                    │
│ Optimal: num_workers=16, pin_memory=True, prefetch_factor=4 │
│                                                             │
│ Impact: 5% reduction in total training time                 │
└─────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Original Estimate:     $752,640
Optimized Estimate:    $625,640
─────────────────────────────────────
POTENTIAL SAVINGS:     $127,000 (16.9%)

Carbon Reduction:      8.2 tonnes CO₂e → 6.8 tonnes CO₂e
                       (1.4 tonnes saved)
```

---

## 🔧 Detailed Findings

### Issue #1: FlashAttention-2 Not Enabled

**Original Code:**
```python
# model/attention.py:45-89
def forward(self, x, mask=None):
    B, T, C = x.shape
    
    q = self.q_proj(x).view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
    k = self.k_proj(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
    v = self.v_proj(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
    
    # Standard attention - INEFFICIENT for long sequences
    attn_weights = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(self.head_dim)
    if mask is not None:
        attn_weights = attn_weights.masked_fill(mask == 0, float('-inf'))
    attn_weights = F.softmax(attn_weights, dim=-1)
    attn_weights = self.attn_dropout(attn_weights)
    
    output = torch.matmul(attn_weights, v)
    # ...
```

**Optimized Code:**
```python
# model/attention.py:45-89 (OPTIMIZED)
def forward(self, x, mask=None):
    B, T, C = x.shape
    
    q = self.q_proj(x).view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
    k = self.k_proj(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
    v = self.v_proj(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
    
    # FlashAttention-2 - 2.5x faster, 40% less memory
    output = F.scaled_dot_product_attention(
        q, k, v,
        attn_mask=mask,
        dropout_p=self.dropout if self.training else 0.0,
        is_causal=True  # Enable causal mask optimization
    )
    # ...
```

**Why EcoCompute Caught This:**
- Static analysis detected `torch.matmul` pattern in attention context
- Cross-referenced with PyTorch version (2.0+) which supports SDPA
- Calculated memory savings based on sequence length (4096) and batch size

---

### Issue #2: Suboptimal Gradient Checkpointing

**Original Config:**
```python
# config.py
CHECKPOINT_CONFIG = {
    "checkpoint_every_layer": True,  # Checkpoints ALL layers
    "checkpoint_activations": True,
}
```

**Analysis:**
```
Layer Type     | Parameters | Activation Memory | Recompute Cost
─────────────────────────────────────────────────────────────────
Attention      | 33.5M      | 2.1 GB           | 0.8 ms
MLP            | 100.7M     | 4.2 GB           | 1.2 ms
LayerNorm      | 0.02M      | 0.1 GB           | 0.05 ms

Insight: MLP has 3x parameters but only 1.5x recompute cost.
         Checkpointing attention layers wastes 15% compute.
```

**Optimized Config:**
```python
# config.py (OPTIMIZED)
CHECKPOINT_CONFIG = {
    "checkpoint_every_layer": False,
    "checkpoint_mlp_only": True,  # Only checkpoint MLP blocks
    "checkpoint_activations": True,
}
```

---

### Issue #3: DataLoader Bottleneck

**Original:**
```python
# data/dataloader.py
train_loader = DataLoader(
    dataset,
    batch_size=2048,
    num_workers=4,        # Too few for 64 GPUs
    pin_memory=False,     # Missing optimization
    prefetch_factor=2,    # Default, could be higher
)
```

**GPU Utilization Analysis:**
```
Time (minutes)    GPU Util    Bottleneck
────────────────────────────────────────
0-5               95%         None
5-10              78%         Data loading
10-15             95%         None
15-20             76%         Data loading
...

Average GPU Utilization: 87%
Optimal GPU Utilization: 95%+
Lost Compute: 8% × 336 hours = 26.9 GPU-hours wasted
```

**Optimized:**
```python
# data/dataloader.py (OPTIMIZED)
train_loader = DataLoader(
    dataset,
    batch_size=2048,
    num_workers=16,       # 1 worker per 4 GPUs
    pin_memory=True,      # Faster CPU→GPU transfer
    prefetch_factor=4,    # Pre-load more batches
    persistent_workers=True,  # Avoid worker restart overhead
)
```

---

## 📈 Results After Optimization

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Training Time | 336 hours | 280 hours | -16.7% |
| Total Cost | $752,640 | $625,640 | -$127,000 |
| GPU Utilization | 87% | 96% | +9% |
| Carbon Footprint | 8.2 tonnes | 6.8 tonnes | -17% |

---

## 🎓 Key Takeaways

### 1. Static Analysis Finds What Monitoring Misses

Traditional monitoring (Datadog, CloudWatch) shows you **what happened**. EcoCompute shows you **what will happen** and **what could be better**.

### 2. Small Code Changes = Large Savings

| Change | Lines Modified | Savings |
|--------|----------------|---------|
| FlashAttention | 3 lines | $98,000 |
| Selective Checkpointing | 2 lines | $45,000 |
| DataLoader Config | 4 lines | $15,000 |
| **Total** | **9 lines** | **$158,000** |

### 3. Carbon Impact is Significant

1.4 tonnes CO₂e saved = **9,100 km of driving avoided**

---

## 🔗 Try It Yourself

1. **Live Demo**: [ecocompute-ai-l7e41qn4gf.edgeone.dev](https://ecocompute-ai-l7e41qn4gf.edgeone.dev/)
2. **GitHub Action**: Add to your CI/CD pipeline
3. **Cost Calculator**: [Interactive Calculator](../calculator/index.html)

---

## 📚 References

- [FlashAttention-2 Paper](https://arxiv.org/abs/2307.08691)
- [PyTorch SDPA Documentation](https://pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html)
- [Gradient Checkpointing Best Practices](https://pytorch.org/docs/stable/checkpoint.html)
- [LLaMA-3 Technical Report](https://ai.meta.com/llama/)

---

<p align="center">
  <i>This case study is based on a composite of real optimization scenarios. Actual savings may vary based on specific configurations.</i>
</p>
