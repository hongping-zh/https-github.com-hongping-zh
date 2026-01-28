"""
EcoCompute AI - Hugging Face Trainer Callback

Automatically tracks training cost and carbon emissions.

Usage:
    from ecocompute import EcoCallback
    trainer.add_callback(EcoCallback())
"""

import time
import os
from dataclasses import dataclass
from typing import Optional

try:
    from transformers import TrainerCallback, TrainerControl, TrainerState
    from transformers.training_args import TrainingArguments
except ImportError:
    raise ImportError(
        "transformers is required for EcoCallback. "
        "Install with: pip install transformers"
    )


@dataclass
class GPUProfile:
    """GPU specifications for cost and energy calculation."""
    name: str
    tflops: float  # FP16 TFLOPS
    tdp: int  # Watts
    cost_per_hour: float  # USD


# GPU profiles based on MLPerf benchmarks
GPU_PROFILES = {
    "h100": GPUProfile("NVIDIA H100", 1979, 700, 3.50),
    "a100-80gb": GPUProfile("NVIDIA A100 80GB", 312, 400, 2.50),
    "a100-40gb": GPUProfile("NVIDIA A100 40GB", 312, 400, 2.21),
    "a10g": GPUProfile("NVIDIA A10G", 125, 150, 1.00),
    "v100": GPUProfile("NVIDIA V100", 125, 300, 1.50),
    "t4": GPUProfile("NVIDIA T4", 65, 70, 0.50),
    "l4": GPUProfile("NVIDIA L4", 121, 72, 0.80),
    "rtx4090": GPUProfile("NVIDIA RTX 4090", 330, 450, 1.20),
    "rtx3090": GPUProfile("NVIDIA RTX 3090", 142, 350, 0.80),
}

# Carbon intensity by region (gCO2/kWh)
CARBON_INTENSITY = {
    "us-west": 350,
    "us-east": 400,
    "eu-west": 300,
    "eu-north": 20,  # Sweden - very clean
    "asia-east": 550,
    "default": 400,
}


def detect_gpu() -> GPUProfile:
    """Auto-detect GPU type from CUDA device name."""
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0).lower()
            
            if "h100" in gpu_name:
                return GPU_PROFILES["h100"]
            elif "a100" in gpu_name:
                if "80g" in gpu_name:
                    return GPU_PROFILES["a100-80gb"]
                return GPU_PROFILES["a100-40gb"]
            elif "a10g" in gpu_name:
                return GPU_PROFILES["a10g"]
            elif "v100" in gpu_name:
                return GPU_PROFILES["v100"]
            elif "t4" in gpu_name:
                return GPU_PROFILES["t4"]
            elif "l4" in gpu_name:
                return GPU_PROFILES["l4"]
            elif "4090" in gpu_name:
                return GPU_PROFILES["rtx4090"]
            elif "3090" in gpu_name:
                return GPU_PROFILES["rtx3090"]
    except Exception:
        pass
    
    # Default to A100 if detection fails
    return GPU_PROFILES["a100-40gb"]


def get_carbon_intensity(region: Optional[str] = None) -> int:
    """Get carbon intensity for a region."""
    if region is None:
        region = os.environ.get("ECOCOMPUTE_REGION", "default")
    return CARBON_INTENSITY.get(region.lower(), CARBON_INTENSITY["default"])


class EcoCallback(TrainerCallback):
    """
    Hugging Face Trainer callback for tracking training cost and carbon emissions.
    
    Usage:
        from ecocompute import EcoCallback
        trainer.add_callback(EcoCallback())
    
    Environment variables:
        ECOCOMPUTE_REGION: Cloud region for carbon intensity (default: "default")
        ECOCOMPUTE_GPU: Override GPU type (e.g., "h100", "a100-80gb")
        ECOCOMPUTE_COST_PER_HOUR: Override hourly cost in USD
    
    Example:
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
        )
        trainer.add_callback(EcoCallback())
        trainer.train()
        
        # Output:
        # 🌿 EcoCompute AI Report
        # ══════════════════════════════════════════════════════════
        # This run cost $45.23 and emitted 12.5 kg CO₂e
        # ══════════════════════════════════════════════════════════
    """
    
    def __init__(
        self,
        gpu: Optional[str] = None,
        region: Optional[str] = None,
        cost_per_hour: Optional[float] = None,
        num_gpus: Optional[int] = None,
        verbose: bool = True,
    ):
        """
        Initialize EcoCallback.
        
        Args:
            gpu: GPU type (auto-detected if None). Options: h100, a100-80gb, a100-40gb, v100, t4, l4
            region: Cloud region for carbon intensity. Options: us-west, us-east, eu-west, eu-north, asia-east
            cost_per_hour: Override hourly cost per GPU in USD
            num_gpus: Number of GPUs (auto-detected if None)
            verbose: Print detailed report (default: True)
        """
        self.gpu_type = gpu or os.environ.get("ECOCOMPUTE_GPU")
        self.region = region or os.environ.get("ECOCOMPUTE_REGION", "default")
        self.cost_override = cost_per_hour or (
            float(os.environ["ECOCOMPUTE_COST_PER_HOUR"]) 
            if "ECOCOMPUTE_COST_PER_HOUR" in os.environ else None
        )
        self.num_gpus_override = num_gpus
        self.verbose = verbose
        
        self.start_time: Optional[float] = None
        self.gpu_profile: Optional[GPUProfile] = None
        self.num_gpus: int = 1
        
    def on_train_begin(
        self,
        args: TrainingArguments,
        state: TrainerState,
        control: TrainerControl,
        **kwargs,
    ):
        """Called at the beginning of training."""
        self.start_time = time.time()
        
        # Detect GPU
        if self.gpu_type and self.gpu_type.lower() in GPU_PROFILES:
            self.gpu_profile = GPU_PROFILES[self.gpu_type.lower()]
        else:
            self.gpu_profile = detect_gpu()
        
        # Detect number of GPUs
        if self.num_gpus_override:
            self.num_gpus = self.num_gpus_override
        else:
            try:
                import torch
                self.num_gpus = torch.cuda.device_count() or 1
            except Exception:
                self.num_gpus = 1
        
        if self.verbose:
            print(f"\n🌿 EcoCompute AI tracking started")
            print(f"   GPU: {self.gpu_profile.name} x {self.num_gpus}")
            print(f"   Region: {self.region}")
        
    def on_train_end(
        self,
        args: TrainingArguments,
        state: TrainerState,
        control: TrainerControl,
        **kwargs,
    ):
        """Called at the end of training."""
        if self.start_time is None or self.gpu_profile is None:
            return
        
        # Calculate duration
        duration_seconds = time.time() - self.start_time
        duration_hours = duration_seconds / 3600
        
        # Calculate cost
        cost_per_hour = self.cost_override or self.gpu_profile.cost_per_hour
        total_cost = cost_per_hour * duration_hours * self.num_gpus
        
        # Calculate energy (kWh)
        power_kw = (self.gpu_profile.tdp / 1000) * self.num_gpus
        energy_kwh = power_kw * duration_hours
        
        # Calculate carbon emissions
        carbon_intensity = get_carbon_intensity(self.region)
        carbon_kg = (energy_kwh * carbon_intensity) / 1000
        
        # Format output
        self._print_report(
            duration_hours=duration_hours,
            total_cost=total_cost,
            energy_kwh=energy_kwh,
            carbon_kg=carbon_kg,
            state=state,
        )
    
    def _print_report(
        self,
        duration_hours: float,
        total_cost: float,
        energy_kwh: float,
        carbon_kg: float,
        state: TrainerState,
    ):
        """Print the EcoCompute report."""
        # Main summary line
        print("\n")
        print("🌿 EcoCompute AI Report")
        print("═" * 58)
        print(f"This run cost ${total_cost:.2f} and emitted {carbon_kg:.1f} kg CO₂e")
        print("═" * 58)
        
        if self.verbose:
            # Detailed breakdown
            print(f"\n📊 Details:")
            print(f"   Duration:     {self._format_duration(duration_hours)}")
            print(f"   GPU:          {self.gpu_profile.name} x {self.num_gpus}")
            print(f"   Energy:       {energy_kwh:.2f} kWh")
            print(f"   Region:       {self.region} ({get_carbon_intensity(self.region)} gCO₂/kWh)")
            
            if state.global_step > 0:
                cost_per_step = total_cost / state.global_step
                print(f"   Steps:        {state.global_step:,}")
                print(f"   Cost/step:    ${cost_per_step:.6f}")
            
            # Optimization tips
            print(f"\n💡 Tips:")
            if self.region not in ["eu-north"]:
                potential_carbon = (energy_kwh * 20) / 1000  # EU-North intensity
                savings = carbon_kg - potential_carbon
                print(f"   → Training in EU-North (Sweden) would save {savings:.1f} kg CO₂e")
            
            if total_cost > 10:
                print(f"   → Consider mixed precision (FP16/BF16) for 30-50% speedup")
            
            print(f"\n📄 Learn more: https://hongping-zh.github.io/ecocompute-ai/calculator/")
        
        print("")
    
    @staticmethod
    def _format_duration(hours: float) -> str:
        """Format duration in human-readable format."""
        if hours < 1/60:
            return f"{hours * 3600:.1f} seconds"
        elif hours < 1:
            return f"{hours * 60:.1f} minutes"
        elif hours < 24:
            return f"{hours:.2f} hours"
        else:
            return f"{hours / 24:.1f} days"
