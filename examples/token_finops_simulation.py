"""
Token FinOps Prototype - EcoCompute AI
Simulates multi-agent interaction costs for Google Antigravity/Gemini agents.
"""

from dataclasses import dataclass
from typing import List, Dict

@dataclass
class ModelPricing:
    name: str
    input_price_per_1k: float  # $ per 1K tokens
    output_price_per_1k: float # $ per 1K tokens
    context_window: int

    @property
    def input_price_per_1m(self):
        return self.input_price_per_1k * 1000

    @property
    def output_price_per_1m(self):
        return self.output_price_per_1k * 1000

# Pricing Data (Approximate for 2025/2026)
GEMINI_1_5_PRO = ModelPricing("Gemini 1.5 Pro", 0.0035, 0.0105, 2_000_000) # $3.50/$10.50 per 1M
GEMINI_1_5_FLASH = ModelPricing("Gemini 1.5 Flash", 0.00035, 0.00105, 1_000_000) # $0.35/$1.05 per 1M

@dataclass
class AgentConfig:
    name: str
    model: ModelPricing
    system_prompt_tokens: int

@dataclass
class TaskProfile:
    name: str
    repo_context_tokens: int  # Initial code context loaded
    estimated_turns: int
    avg_output_tokens_per_turn: int

class TokenFinOpsEngine:
    def __init__(self, agents: List[AgentConfig]):
        self.agents = agents

    def simulate_task(self, task: TaskProfile) -> Dict:
        """
        Simulates the cost of running a multi-agent task.
        Assumes a shared context model (all agents see conversation history).
        """
        total_cost = 0.0
        total_input_tokens = 0
        total_output_tokens = 0
        
        # Conversation history starts empty
        history_tokens = 0
        
        print(f"--- Simulation: {task.name} ---")
        print(f"Agents: {[a.name for a in self.agents]}")
        print(f"Repo Context: {task.repo_context_tokens:,} tokens")
        print(f"Est. Turns: {task.estimated_turns}")
        print("-" * 30)

        for turn in range(1, task.estimated_turns + 1):
            # In this simple model, we assume round-robin or one active agent per turn
            # For worst-case estimation, let's assume the primary agent (first in list) acts
            active_agent = self.agents[0] 
            
            # Input = System Prompt + Repo Context + History
            current_input_tokens = (
                active_agent.system_prompt_tokens + 
                task.repo_context_tokens + 
                history_tokens
            )
            
            # Check context window
            if current_input_tokens > active_agent.model.context_window:
                print(f"⚠️ Turn {turn}: Context Limit Exceeded! ({current_input_tokens:,} > {active_agent.model.context_window:,})")
                break

            # Calculate Cost for this turn
            input_cost = (current_input_tokens / 1000) * active_agent.model.input_price_per_1k
            output_cost = (task.avg_output_tokens_per_turn / 1000) * active_agent.model.output_price_per_1k
            turn_cost = input_cost + output_cost

            # Update totals
            total_cost += turn_cost
            total_input_tokens += current_input_tokens
            total_output_tokens += task.avg_output_tokens_per_turn
            
            # Update history (The "Ballooning" Effect)
            # The agent's output is added to the history for the next turn
            history_tokens += task.avg_output_tokens_per_turn
            
            # Simulate User/Other Agent response adding to history as well
            history_tokens += 50 # Assumed short user feedback/ack

            print(f"Turn {turn:2}: Input={current_input_tokens:6,} | Cost=${turn_cost:.4f} | Cumulative=${total_cost:.4f}")

        return {
            "task": task.name,
            "total_cost": round(total_cost, 4),
            "total_tokens": total_input_tokens + total_output_tokens,
            "turns": task.estimated_turns
        }

def run_demo():
    # Scenario 1: Expensive Configuration
    # A generic "Manager" agent using Pro model with full repo context
    expensive_agents = [
        AgentConfig("Manager", GEMINI_1_5_PRO, system_prompt_tokens=2000)
    ]
    
    # Scenario 2: Optimized Configuration
    # Specialized agent using Flash model with focused context
    optimized_agents = [
        AgentConfig("Worker", GEMINI_1_5_FLASH, system_prompt_tokens=500)
    ]

    # Task: Refactoring a module
    # Requires reading 10 files (~50k tokens) and 10 turns of reasoning
    refactor_task = TaskProfile(
        name="Refactor Module A",
        repo_context_tokens=50_000, 
        estimated_turns=10,
        avg_output_tokens_per_turn=1000 # Generating code
    )

    engine_expensive = TokenFinOpsEngine(expensive_agents)
    result_expensive = engine_expensive.simulate_task(refactor_task)
    
    print("\n")
    
    engine_optimized = TokenFinOpsEngine(optimized_agents)
    result_optimized = engine_optimized.simulate_task(refactor_task)

    print("\n=== SUMMARY COMPARISON ===")
    print(f"Scenario 1 (Pro Model): ${result_expensive['total_cost']}")
    print(f"Scenario 2 (Flash Model): ${result_optimized['total_cost']}")
    
    savings = result_expensive['total_cost'] - result_optimized['total_cost']
    savings_pct = (savings / result_expensive['total_cost']) * 100
    print(f"Potential Savings: ${savings:.4f} ({savings_pct:.1f}%)")
    
    if result_expensive['total_cost'] > 1.0:
        print("\n[GATEKEEPER ALERT] 🔴 Blocked: Cost exceeds $1.00 threshold.")
        print("Recommendation: Use Gemini Flash or reduce context scope.")

if __name__ == "__main__":
    run_demo()
