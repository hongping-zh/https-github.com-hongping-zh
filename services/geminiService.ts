
import { GoogleGenAI, Type, FunctionDeclaration, Tool, FunctionCallPart, FunctionResponsePart } from "@google/genai";
import { AnalysisResult, HardwareProfile } from "../types";
import { analyzeCodeStatic } from "./staticAnalyzer";

// Region Carbon Intensity Map (Duplicated from HardwareSelector to avoid circular deps/React imports)
const REGION_CARBON_INTENSITY: Record<string, number> = {
  'us-central1': 360,
  'asia-east1': 620,
  'europe-west4': 180,
  'global': 450,
  'us-east1': 480
};

// Custom Error Types for better UI handling
export class GeminiError extends Error {
  constructor(message: string, public isRetryable: boolean = false) {
    super(message);
    this.name = "GeminiError";
  }
}

// Retry Logic Helper
async function retryOperation<T>(operation: () => Promise<T>, retries = 1, delay = 2000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Check for rate limits or server errors
    // Parsing error message to check for 429 inside nested JSON strings
    const errorString = JSON.stringify(error);
    const isRateLimit = error.status === 429 || error.code === 429 || errorString.includes("429") || errorString.includes("quota") || errorString.includes("RESOURCE_EXHAUSTED");

    if (retries > 0 && (error.status === 503 || isRateLimit || error.message?.includes("fetch"))) {
      await new Promise(res => setTimeout(res, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

async function processImageForGemini(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Browser Canvas context failed"));
          return;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngDataUrl = canvas.toDataURL("image/png");
        const base64Data = pngDataUrl.split(',')[1];
        resolve(base64Data);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = (err) => {
      console.error("Image loading error", err);
      reject(new Error("Failed to load or rasterize image."));
    };

    img.src = dataUrl;
  });
}

/**
 * Main Analysis Function (Production Path)
 * Uses Real Gemini 3 Pro with Thinking Config.
 */
export const analyzeAndOptimizeStream = async (
  apiKey: string, // Changed: API Key must be passed in
  code: string,
  hardware: HardwareProfile,
  onChunk: (text: string) => void,
  imageBase64?: string,
  scope: 'snippet' | 'module' = 'snippet',
  onPhaseChange?: (phase: string) => void
): Promise<AnalysisResult> => {

  if (!apiKey) {
    throw new GeminiError("API Key is missing. Please configure your settings.", false);
  }

  // Initialize Client Scope-Locally
  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Step 1: Run Static Analysis (L1 Gate)
  const staticData = analyzeCodeStatic(code);
  const estimatedGFlops = staticData.estimatedFlops;
  const layerSummary = JSON.stringify(staticData.layerCounts);
  // Flatten highlights for the prompt
  const structuralHighlights = staticData.structuralHighlights.map(h => h.label).join(", ");

  // L1 COST-AWARE ROUTING GATE
  // This is NOT a simulation; it is a client-side optimization to decide if we strictly need the expensive model.
  // For the purpose of this Demo App, we default to Gemini 3 Pro to showcase its capabilities,
  // but we log the routing decision to demonstrate the "FinOps Architecture".
  onChunk(`> [L1 Gate] Analyzed Request Complexity (Static AST)...\n`);
  if (staticData.requiresDynamicTracing) {
      onChunk(`> [Router] Complexity: High (Architecture Change). Routing to Gemini 3 Pro (Tier 3)...\n\n`);
  } else if (staticData.estimatedFlops < 1.0 && !imageBase64) {
      // In a real SaaS, this would route to Flash-Lite. For the Hackathon, we upgrade to Pro.
      onChunk(`> [Router] Complexity: Low. Upgrading to Gemini 3 Pro for Deep Audit (Hackathon Mode)...\n\n`);
  } else {
      onChunk(`> [Router] Complexity: Medium. Routing to Gemini 3 Pro (Tier 3)...\n\n`);
  }

  // Step 2: Prepare Image
  let visionPart = null;
  if (imageBase64) {
    try {
      const pngBase64 = await processImageForGemini(imageBase64);
      visionPart = { 
        inlineData: { 
          mimeType: "image/png", 
          data: pngBase64 
        } 
      };
    } catch (e) {
      console.warn("Vision processing failed:", e);
      onChunk("\n[System Warning: Image processing failed. Proceeding with code analysis only...]\n");
    }
  }

  // Step 3: System Instruction
  // NOTE: We use [[PHASE]] tags to synchronize the UI "Agent State" with the model's actions.
  // This allows the frontend to visualize the Agent's workflow (e.g. "Searching...", "Computing...").
  // The actual *reasoning* is handled by Gemini 3's native 'thinkingConfig'.
  const systemInstruction = `
    You are **DeepGreen AI**, an energy optimization agent powered by Gemini 3.
    
    ## TASK SCOPE: ${scope === 'module' ? 'FULL MODULE / PROJECT SCAN' : 'CODE SNIPPET ANALYSIS'}
    Target Hardware: ${hardware.name} (${hardware.type}).
    Target Region: ${hardware.region || 'Global Average'} (Carbon Intensity: ${hardware.carbonIntensity || 'Unknown'} gCO2/kWh).

    ## UI SYNCHRONIZATION PROTOCOL (Agent State)
    To help the user visualize your workflow, you MUST output specific tags on a new line BEFORE you perform an action.
    
    Use exactly these tags:
    [[PHASE: SEARCH]] - Before calling Google Search to get hardware specs.
    [[PHASE: COMPUTE]] - Before calling the Python Sandbox (Code Execution) to verify math.
    [[PHASE: CORRECTION]] - IF you encounter a tool error or hallucination, output this tag to signal "Self-Healing", then retry.
    [[PHASE: ANALYSIS]] - When analyzing the data returned by tools.
    [[PHASE: STRATEGY]] - When formulating the final Green AI strategy.

    ## GROUNDING DATA (Static Analysis)
    - **Valid Python Syntax**: ${staticData.isValid}
    - **Detected Layers**: ${layerSummary}
    - **Structural Highlights**: ${structuralHighlights}
    - **Estimated Compute**: ${estimatedGFlops} GFLOPs (theoretical - use as baseline)

    ## MANDATORY TOOL USE & FALLBACKS
    1. **GOOGLE SEARCH**: 
       - Find **2026 hardware specifications** for '${hardware.name}'. Look for TDP and Joules/Op.
       - **FINOPS CHECK**: Search for "On-demand price per hour for ${hardware.name} on AWS/GCP/Azure".
       - **MLPerf Validation**: Search for "MLPerf Inference v4.0" or "v5.0" results for this hardware class.
    
    2. **CODE EXECUTION (Calculus)**: 
       - Calculate Arithmetic Intensity (FLOPs / Byte) using Python.
       - Verify tensor shape compatibility.
       - **SELF-CORRECTION**: If the code fails (e.g. MemoryError), YOU MUST Output [[PHASE: CORRECTION]], then rewrite the python code with simplified assumptions and try again.
    
    3. **CARBON CALCULATOR**:
       - Use the 'calculate_carbon_footprint' tool to get precise emissions based on energy usage and region.
    
    ## EXPLAINABILITY & TRANSPARENCY (Show, Don't Mock)
    - **CITATIONS**: In the 'citations' array, you MUST format strings as: "[Source: Website/Paper Title] - Context". e.g., "[Source: NVIDIA Datasheet] - H100 TDP is 700W".
    - **ASSUMPTIONS**: Explicitly list all physics assumptions (FP16 vs FP32, Batch Size).

    ## CRITICAL BUG DETECTION
    If the user's code implies a specific architecture (like ResNet, Transformer) but is **missing key components** (e.g., missing residual connection 'x + out', missing LayerNorm, missing activation), you MUST start the 'bottleneckAnalysis' field with the exact text: "CRITICAL BUG:".

    ## FINOPS (COST) ESTIMATION
    You must estimate the monetary savings.
    1. Find hourly cost of the hardware.
    2. Estimate runtime for 1 Million Inferences based on FLOPs/throughput.
    3. Calculate 'costSavingsPer1MInference' = (Original_Time - Optimized_Time) * Hourly_Rate.

    ## OUTPUT SCHEMA
    Return JSON strictly matching the schema.
  `;

  const textPrompt = visionPart 
    ? `Analyze the attached neural network sketch/diagram for ${hardware.name}. \n\nINSTRUCTION: Use the visual diagram as the PRIMARY source for the architecture. The code below is context. \n\nCode Context:\n${code}`
    : `Analyze this PyTorch code for ${hardware.name} (ID: ${hardware.id}):\n${code}`;

  const parts: any[] = [{ text: textPrompt }];
  if (visionPart) {
    parts.unshift(visionPart);
  }

  // P1-New: Add Custom Tool for Carbon Calculation
  const tools: Tool[] = [
    { googleSearch: {} },
    { codeExecution: {} },
    {
      functionDeclarations: [{
        name: "calculate_carbon_footprint",
        description: "Calculate carbon footprint based on energy consumption and region.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            energyJoules: { type: Type.NUMBER, description: "Total energy consumed in Joules" },
            region: { type: Type.STRING, description: "Data center region (e.g., us-central1)" }
          },
          required: ["energyJoules", "region"]
        }
      }]
    }
  ];

  return retryOperation(async () => {
    try {
      const chat = ai.chats.create({
        model: "gemini-3-pro-preview",
        config: {
          systemInstruction,
          tools: tools,
          // NATIVE THINKING CONFIG: This enables the model's internal reasoning loop.
          // We set a budget to allow it to plan the audit strategy.
          thinkingConfig: { 
            thinkingBudget: 1024 
          },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              // P0-2: Real Steps in Reasoning Trace
              reasoning_trace: { type: Type.STRING, description: "Structured technical audit including Search and Code Execution results." },
              
              // P0-3: Explainability Fields
              assumptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List technical assumptions (e.g., 'Batch Size=1', 'FP16', 'Utilization=85%', 'Duration=24h')" },
              citations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sources for data with [Source: Name] format" },
              energy_model: { type: Type.STRING, description: "How Joules were calculated from GFLOPs" },
              
              originalEnergyJoules: { type: Type.NUMBER },
              optimizedEnergyJoules: { type: Type.NUMBER },
              improvementPercentage: { type: Type.NUMBER },
              carbonSavedGrams: { type: Type.NUMBER },
              
              // NEW FINOPS FIELDS
              estimatedHourlyCost: { type: Type.NUMBER, description: "Hourly cost of the hardware in USD" },
              costSavingsPer1MInference: { type: Type.NUMBER, description: "Estimated USD saved per 1 million inferences" },

              confidenceScore: { type: Type.NUMBER },
              uncertaintyFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
              
              benchmarkData: {
                type: Type.OBJECT,
                properties: {
                  found: { type: Type.BOOLEAN },
                  source: { type: Type.STRING },
                  device: { type: Type.STRING },
                  metric: { type: Type.STRING },
                  value: { type: Type.STRING }
                },
                required: ["found", "source", "device", "metric", "value"]
              },

              strategyAnalysis: { type: Type.STRING },
              bottleneckAnalysis: { type: Type.STRING },
              impactAnalogy: { type: Type.STRING },
              tradeoffMetrics: {
                type: Type.OBJECT,
                properties: {
                  performanceScore: { type: Type.NUMBER },
                  costEfficiencyScore: { type: Type.NUMBER },
                  carbonEfficiencyScore: { type: Type.NUMBER },
                  accuracySafetyScore: { type: Type.NUMBER }
                }
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    gain: { type: Type.STRING },
                    reasoning: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ["High", "Medium", "Exploratory"] },
                    accuracyRisk: { type: Type.STRING },
                    estAccuracyDrop: { type: Type.STRING }
                  }
                }
              },
              optimizedCode: { type: Type.STRING },
              breakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    component: { type: Type.STRING },
                    percentage: { type: Type.NUMBER },
                    joules: { type: Type.NUMBER },
                    color: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      // Tool Execution Loop to handle multi-turn function calls
      let currentMessage: any[] = parts;
      let finalJsonText = "";
      let keepGoing = true;

      while (keepGoing) {
        keepGoing = false; // Default to stop unless we find tool calls
        
        const result = await chat.sendMessageStream({ message: currentMessage });
        let accumulatedText = "";
        let toolCalls: any[] = [];
        
        for await (const chunk of result) {
            const text = chunk.text || "";
            accumulatedText += text;
            finalJsonText += text; // Keep adding to final for the JSON parse step

            // Pass streaming text to UI (filtering out system tags)
            // P0-2: Updated Regex to be more flexible with spaces
            const phaseRegex = /\[\[PHASE:\s*(.*?)\]\]/;
            
            const match = text.match(phaseRegex);
            if (match && onPhaseChange) {
              onPhaseChange(match[1].trim());
            }

            const cleanChunk = text.replace(/\[\[PHASE:.*?\]\]/g, '');
            if (cleanChunk) {
              onChunk(cleanChunk);
            }

            // Check for tool calls in this chunk
            if (chunk.functionCalls) {
              toolCalls.push(...chunk.functionCalls);
            }
        }
        
        // Handle Tool Execution
        if (toolCalls.length > 0) {
            keepGoing = true;
            finalJsonText = ""; // Reset JSON text if we are in a tool loop (the final JSON comes after)
            
            const functionResponses = [];
            
            for (const call of toolCalls) {
                if (call.name === "calculate_carbon_footprint") {
                    const args = call.args as any;
                    const joules = args.energyJoules || 0;
                    const region = args.region || "global";
                    
                    // Simple local logic using our map
                    const intensity = REGION_CARBON_INTENSITY[region] || REGION_CARBON_INTENSITY['global'] || 450;
                    // Formula: (Joules / 3,600,000) * Intensity(g/kWh)
                    // 1 kWh = 3.6e6 Joules
                    const kwh = joules / 3600000;
                    const grams = kwh * intensity;
                    
                    const response = { carbonGrams: grams };
                    
                    onChunk(`\n> [Tool] Calculating Carbon: ${joules.toFixed(2)}J @ ${region} (${intensity}g/kWh) = ${grams.toFixed(4)}g CO2\n`);
                    
                    functionResponses.push({
                        id: call.id,
                        name: call.name,
                        response: { result: response }
                    });
                }
            }
            
            // Prepare the response message for the next turn
            currentMessage = functionResponses.map(fr => ({
               functionResponse: fr
            }));
        }
      }

      if (!finalJsonText) throw new GeminiError("Model failed to generate a JSON response.", true);
      
      // P0-2: Ultra-Safe JSON Extraction
      // 1. Strip all phase tags globally first (Robust Regex)
      let cleanText = finalJsonText.replace(/\[\[PHASE:[\s\S]*?\]\]/g, '');
      
      // 2. Find the first valid '{' and last valid '}' to isolate JSON
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      } else {
          cleanText = cleanText.trim();
      }
      
      try {
        return JSON.parse(cleanText) as AnalysisResult;
      } catch (e) {
        console.error("Malformed JSON:", cleanText);
        throw new GeminiError("Failed to parse analysis report. The model output was malformed.", false);
      }

    } catch (error: any) {
      console.error("Gemini Failure:", error);
      
      // ---------------------------------------------------------
      // ROBUST ERROR PARSING FOR 429 / QUOTA
      // ---------------------------------------------------------
      let errorMsg = error.message || "Unknown API Error";
      let status = error.status || error.code;
      
      try {
        // Try to parse nested error JSON if it exists in the message string
        // The Google SDK sometimes wraps the API JSON response in the error.message string
        if (typeof errorMsg === 'string' && (errorMsg.trim().startsWith('{'))) {
             const parsed = JSON.parse(errorMsg);
             if (parsed.error) {
                 errorMsg = parsed.error.message || errorMsg;
                 status = parsed.error.code || status;
             }
        }
      } catch (e) {
        // ignore parse error and use original message
      }

      // Explicitly catch Resource Exhausted / Rate Limit
      if (status === 429 || errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
         throw new GeminiError("Gemini Quota Exceeded (429). Please wait a moment, check your plan, or use a paid API Key.", true);
      }
      
      if (error instanceof GeminiError) throw error;
      throw new GeminiError(errorMsg, true);
    }
  });
};