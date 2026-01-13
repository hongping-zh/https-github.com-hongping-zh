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
async function retryOperation<T>(operation: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && (error.status === 503 || error.status === 429 || error.message.includes("fetch"))) {
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
 * Main Analysis Function
 * NOW SUPPORTS DYNAMIC API KEY FOR MVP (BYOK)
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

  // Step 1: Run Static Analysis (Enhanced P1-1)
  const staticData = analyzeCodeStatic(code);
  const estimatedGFlops = staticData.estimatedFlops;
  const layerSummary = JSON.stringify(staticData.layerCounts);
  // Flatten highlights for the prompt
  const structuralHighlights = staticData.structuralHighlights.map(h => h.label).join(", ");

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
  // P0-2: Explicit Phase Tags for Real Streaming
  // P0-3: Explainability Requirements & Code Execution Fallback
  const systemInstruction = `
    You are **DeepGreen AI**, an energy optimization agent powered by Gemini 3.
    
    ## TASK SCOPE: ${scope === 'module' ? 'FULL MODULE / PROJECT SCAN' : 'CODE SNIPPET ANALYSIS'}
    Target Hardware: ${hardware.name} (${hardware.type}).
    Target Region: ${hardware.region || 'Global Average'} (Carbon Intensity: ${hardware.carbonIntensity || 'Unknown'} gCO2/kWh).

    ## CRITICAL: REAL-TIME STREAMING PROTOCOL
    You MUST output specific tags on a new line when you start a new phase. 
    Use exactly these tags:
    [[PHASE: SEARCH]] - When using Google Search.
    [[PHASE: COMPUTE]] - When running Python code to verify math.
    [[PHASE: ANALYSIS]] - When analyzing bottlenecks.
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
    
    3. **CARBON CALCULATOR**:
       - Use the 'calculate_carbon_footprint' tool to get precise emissions based on energy usage and region.
    
    **FALLBACK**: If Code Execution fails, state in 'assumptions' that values are 'Estimated via Static Analysis'.

    ## EXPLAINABILITY REQUIREMENT
    You must populate 'assumptions', 'citations', and 'energy_model' in the JSON output. 
    Do not make up numbers. State your sources.

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
          thinkingConfig: { 
            thinkingBudget: 2048 // Explicit budget as requested
          },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              // P0-2: Real Steps in Reasoning Trace
              reasoning_trace: { type: Type.STRING, description: "Structured technical audit including Search and Code Execution results." },
              
              // P0-3: Explainability Fields
              assumptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List technical assumptions (e.g., 'Batch Size=1', 'FP16', 'Utilization=85%', 'Duration=24h')" },
              citations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sources for data" },
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
                  carbonEfficiencyScore: { type: Type.NUMBER }
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
                    category: { type: Type.STRING, enum: ["High", "Medium", "Exploratory"] }
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
      if (error instanceof GeminiError) throw error;
      throw new GeminiError(error.message || "Unknown API Error", true);
    }
  });
};