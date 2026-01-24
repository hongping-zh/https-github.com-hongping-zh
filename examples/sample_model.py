"""
EcoCompute AI - Sample PyTorch Model for CI/CD Testing
This file demonstrates a typical ML model that EcoCompute AI would analyze.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class TransformerBlock(nn.Module):
    """A simple transformer block for demonstration."""
    
    def __init__(self, embed_dim=512, num_heads=8, ff_dim=2048, dropout=0.1):
        super().__init__()
        self.attention = nn.MultiheadAttention(embed_dim, num_heads, dropout=dropout)
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.ff = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, embed_dim),
            nn.Dropout(dropout)
        )
    
    def forward(self, x):
        # Self-attention with residual connection
        attn_out, _ = self.attention(x, x, x)
        x = self.norm1(x + attn_out)
        
        # Feed-forward with residual connection
        ff_out = self.ff(x)
        x = self.norm2(x + ff_out)
        return x


class SimpleVisionTransformer(nn.Module):
    """
    A simplified Vision Transformer (ViT) for image classification.
    
    EcoCompute AI Analysis Notes:
    - Patch embedding: O(n) complexity
    - Transformer blocks: O(n²) attention complexity
    - Estimated FLOPs: ~4.5 GFLOPs for 224x224 input
    """
    
    def __init__(
        self,
        image_size=224,
        patch_size=16,
        num_classes=1000,
        embed_dim=768,
        num_heads=12,
        num_layers=12,
        ff_dim=3072,
        dropout=0.1
    ):
        super().__init__()
        
        self.patch_size = patch_size
        num_patches = (image_size // patch_size) ** 2
        
        # Patch embedding
        self.patch_embed = nn.Conv2d(
            3, embed_dim, 
            kernel_size=patch_size, 
            stride=patch_size
        )
        
        # Positional embedding
        self.pos_embed = nn.Parameter(
            torch.zeros(1, num_patches + 1, embed_dim)
        )
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        
        # Transformer blocks
        self.blocks = nn.ModuleList([
            TransformerBlock(embed_dim, num_heads, ff_dim, dropout)
            for _ in range(num_layers)
        ])
        
        # Classification head
        self.norm = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, num_classes)
        
        # Initialize weights
        nn.init.trunc_normal_(self.pos_embed, std=0.02)
        nn.init.trunc_normal_(self.cls_token, std=0.02)
    
    def forward(self, x):
        batch_size = x.shape[0]
        
        # Patch embedding: (B, 3, H, W) -> (B, embed_dim, H/P, W/P)
        x = self.patch_embed(x)
        x = x.flatten(2).transpose(1, 2)  # (B, num_patches, embed_dim)
        
        # Add CLS token
        cls_tokens = self.cls_token.expand(batch_size, -1, -1)
        x = torch.cat([cls_tokens, x], dim=1)
        
        # Add positional embedding
        x = x + self.pos_embed
        
        # Transformer blocks
        for block in self.blocks:
            x = block(x)
        
        # Classification
        x = self.norm(x[:, 0])  # Use CLS token
        x = self.head(x)
        return x


def estimate_flops(model, input_size=(1, 3, 224, 224)):
    """Estimate FLOPs for the model (simplified calculation)."""
    # This is a placeholder - EcoCompute AI does this automatically
    total_params = sum(p.numel() for p in model.parameters())
    # Rough estimate: 2 FLOPs per parameter per forward pass
    estimated_flops = total_params * 2
    return estimated_flops


if __name__ == "__main__":
    # Create model
    model = SimpleVisionTransformer(
        image_size=224,
        patch_size=16,
        num_classes=1000,
        embed_dim=768,
        num_heads=12,
        num_layers=12
    )
    
    # Test forward pass
    dummy_input = torch.randn(1, 3, 224, 224)
    output = model(dummy_input)
    
    # Print model info
    total_params = sum(p.numel() for p in model.parameters())
    print(f"Model: SimpleVisionTransformer")
    print(f"Total Parameters: {total_params:,}")
    print(f"Output Shape: {output.shape}")
    print(f"Estimated FLOPs: {estimate_flops(model):,}")
    print()
    print("=" * 50)
    print("EcoCompute AI would analyze this model and report:")
    print("- Estimated training cost per epoch")
    print("- Carbon footprint (CO2e)")
    print("- Optimization suggestions")
    print("=" * 50)
