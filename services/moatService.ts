import { DataMoatMetric, DataFlywheelStage } from "../types";
import { Database, Network, Zap, GitMerge, ShieldCheck, Activity } from "lucide-react";

/**
 * EcoCompute Live Session Telemetry
 * Replaces the "Fake Data Moat" with actual session metrics.
 */
export class EcoComputeDataMoat {
  
  private sessionOpsAnalyzed = 0;
  private sessionOptimizationsFound = 0;

  private dispatchUpdate() {
    window.dispatchEvent(new CustomEvent('moat-update'));
  }

  public logAnalysis(layerCount: number, optCount: number) {
    this.sessionOpsAnalyzed += layerCount;
    this.sessionOptimizationsFound += optCount;
    this.dispatchUpdate();
  }
  
  public logError() {
    // Keep stats but maybe trigger a refresh to show "Active" status persists
    this.dispatchUpdate();
  }

  /**
   * 1. 规模壁垒: What data are we collecting *Right Now*?
   */
  public getDataCollectionScale(): Record<string, string | object> {
    return {
      "Source": "Live User Session",
      "Session Layers Scanned": this.sessionOpsAnalyzed.toString(),
      "Optimizations Identified": this.sessionOptimizationsFound.toString(),
      "Status": "Active Telemetry"
    };
  }

  /**
   * 2. 护城河特征: Why is this approach scientific?
   */
  public getMoatCharacteristics(): DataMoatMetric[] {
    return [
      {
        label: "Hybrid Grounding",
        value: "Static + GenAI",
        icon: Database,
        description: "We combine deterministic Static Analysis (AST) with probabilistic Generative AI. We don't just guess; we count."
      },
      {
        label: "Tool Use",
        value: "Agentic Loop",
        icon: Network,
        description: "Gemini 3 calls external tools (MLPerf DB) to fetch real-time hardware coefficients."
      },
      {
        label: "Validation",
        value: "Pre-flight Check",
        icon: ShieldCheck,
        description: "Code is syntactically verified before energy estimation to prevent hallucinating on broken code."
      }
    ];
  }

  /**
   * 3. 数据飞轮: How does it work?
   */
  public getDataFlywheel(): DataFlywheelStage[] {
    return [
      {
        stage: 1,
        title: "Ingest (Static)",
        description: "Regex-parser extracts layer counts & imports locally."
      },
      {
        stage: 2,
        title: "Ground (Tool)",
        description: "Agent looks up Joules/Op from MLPerf DB."
      },
      {
        stage: 3,
        title: "Reason (Gemini)",
        description: "LLM synthesizes math + architectural context."
      },
      {
        stage: 4,
        title: "Verify (Loop)",
        description: "User feedback tunes the next prediction."
      },
    ];
  }
}

export const moatService = new EcoComputeDataMoat();
