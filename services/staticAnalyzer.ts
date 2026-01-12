
export interface StructuralHighlight {
  label: string;
  lineNumbers: number[];
  suggestion: string; // New: Actionable engineering advice
}

export interface StaticAnalysis {
  isValid: boolean;
  errors: string[];
  estimatedFlops: number; // in GFLOPs
  layerCounts: Record<string, number>;
  imports: string[];
  structuralHighlights: StructuralHighlight[]; // Updated to include location data
}

// Helper to calculate line number from regex match index
const getLineFromIndex = (code: string, index: number): number => {
  return code.substring(0, index).split('\n').length;
};

/**
 * A regex-based static analyzer for PyTorch code.
 * P1-1: Enhanced to detect parameters (kernel_size, stride) and residual patterns with line numbers.
 */
export const analyzeCodeStatic = (code: string): StaticAnalysis => {
  const errors: string[] = [];
  const layerCounts: Record<string, number> = {};
  const estimatedFlops = 0; // Keeping simple counter, logic below handles FLOPs weight
  let currentFlops = 0;
  
  // Storage for highlights
  const highlightsMap: Record<string, { lines: Set<number>, suggestion: string }> = {};
  
  const addHighlight = (label: string, line: number, suggestion: string) => {
    if (!highlightsMap[label]) {
        highlightsMap[label] = { lines: new Set(), suggestion };
    }
    highlightsMap[label].lines.add(line);
  };

  // 1. Syntax / Import Verification
  const imports = (code.match(/^import\s+[\w.]+(?:\s+as\s+\w+)?/gm) || [])
    .map(s => s.trim());
  
  if (!code.includes("import torch")) {
    errors.push("Missing 'import torch'. Optimization requires PyTorch.");
  }
  if (code.includes("nn.Module") && !code.includes("torch.nn")) {
    errors.push("Detected nn.Module usage but missing 'import torch.nn'.");
  }

  // 2. Scientific Metrics (FLOPs Estimation & Param Extraction)
  const ops = [
    { name: 'Conv2d', regex: /nn\.Conv2d\s*\(([^)]+)\)/g, weight: 0.5 },
    { name: 'Linear', regex: /nn\.Linear\s*\(([^)]+)\)/g, weight: 0.1 }, 
    { name: 'BatchNorm', regex: /nn\.BatchNorm2d\s*\(/g, weight: 0.01 },
    { name: 'ReLU', regex: /nn\.ReLU\s*\(/g, weight: 0.0 },
    { name: 'MultiheadAttention', regex: /nn\.MultiheadAttention\s*\(/g, weight: 0.8 }
  ];

  ops.forEach(op => {
    let match;
    const regex = new RegExp(op.regex);
    let count = 0;
    while ((match = regex.exec(code)) !== null) {
      count++;
      currentFlops += op.weight;
      const line = getLineFromIndex(code, match.index);
      
      // P1-1: Param Extraction logic & Suggestions
      if (op.name === 'Conv2d' && match[1]) {
        const args = match[1];
        if (args.includes('stride=2') || args.includes('stride = 2')) {
           addHighlight("Spatial Downsampling", line, "Start of a new stage. Check if channel width doubles (C->2C) to preserve information flow.");
        }
        if (args.includes('groups=') && !args.includes('groups=1')) {
           addHighlight("Grouped Convolution", line, "Efficient (DW-Conv). Ensure memory alignment; depthwise can be bandwidth-bound on large tensors.");
        }
      }
      if (op.name === 'MultiheadAttention') {
          addHighlight("Attention Mechanism", line, "High Arithmetic Intensity. Consider FlashAttention (O(N) memory) if sequence length > 512.");
      }
    }
    if (count > 0) layerCounts[op.name] = count;
  });

  // 3. Heuristic Structural Detection (Fix P1-1: STRICT Semantic Residual Regex)
  // Purpose: Reduce false positives. Only match explicit residual patterns.
  const residualRegex = /(?:out|x|output|y)\s*\+=\s*(?:identity|x|residual|shortcut|inp)|(?:out|x|output|y)\s*=\s*(?:out|x|output|y)\s*\+\s*(?:identity|x|residual|shortcut|self\.[a-zA-Z0-9_]+\(.*\))|return\s+(?:out|x|output|y)\s*\+\s*(?:identity|x|residual|shortcut|self\.[a-zA-Z0-9_]+\(.*\))/g;
  
  let resMatch;
  while ((resMatch = residualRegex.exec(code)) !== null) {
      addHighlight(
          "Residual Connection", 
          getLineFromIndex(code, resMatch.index),
          "Essential for gradient flow. Ensure Identity path shape matches Output shape, or use a 1x1 projection."
      );
  }

  // Basic syntax check
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Syntax Error: Unbalanced parentheses (Open: ${openParens}, Close: ${closeParens})`);
  }

  // Convert map to array
  const structuralHighlights: StructuralHighlight[] = Object.entries(highlightsMap).map(([label, data]) => ({
    label,
    lineNumbers: Array.from(data.lines).sort((a, b) => a - b),
    suggestion: data.suggestion
  }));

  return {
    isValid: errors.length === 0,
    errors,
    estimatedFlops: parseFloat(currentFlops.toFixed(3)),
    layerCounts,
    imports,
    structuralHighlights
  };
};
