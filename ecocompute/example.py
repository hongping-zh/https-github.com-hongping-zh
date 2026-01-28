"""
Example: Using EcoCompute AI with Hugging Face Transformers

This example shows how to track training cost and carbon emissions
with just one line of code.
"""

from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)
from datasets import load_dataset

# Import EcoCompute callback
from ecocompute import EcoCallback


def main():
    # Load a small model and dataset for demo
    model_name = "distilbert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
    
    # Load dataset
    dataset = load_dataset("imdb", split="train[:1000]")
    
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)
    
    tokenized_dataset = dataset.map(tokenize_function, batched=True)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=1,
        per_device_train_batch_size=8,
        logging_steps=100,
        save_strategy="no",
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
    )
    
    # ✨ Add EcoCompute callback - just one line!
    trainer.add_callback(EcoCallback())
    
    # Train
    trainer.train()
    
    # Output will show:
    # 🌿 EcoCompute AI Report
    # ══════════════════════════════════════════════════════════
    # This run cost $0.45 and emitted 0.12 kg CO₂e
    # ══════════════════════════════════════════════════════════


if __name__ == "__main__":
    main()
