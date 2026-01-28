"""
EcoCompute AI - Pre-merge cost prediction and carbon tracking for AI training.

Usage with Hugging Face Transformers:
    from ecocompute import EcoCallback
    trainer.add_callback(EcoCallback())
"""

from .callback import EcoCallback

__version__ = "1.0.0"
__all__ = ["EcoCallback"]
