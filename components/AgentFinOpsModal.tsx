import React, { useState, useEffect } from 'react';
import { X, Bot, Zap, AlertTriangle, TrendingUp, DollarSign, MessageSquare, Box } from 'lucide-react';

interface AgentFinOpsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODELS = {
  'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', input: 3.50, output: 10.50, context: 2000000 },
  'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', input: 0.35, output: 1.05, context: 1000000 },
};

export function AgentFinOpsModal({ isOpen, onClose }: AgentFinOpsModalProps) {
  const [agentModel, setAgentModel] = useState<keyof typeof MODELS>('gemini-1.5-pro');
  const [repoSize, setRepoSize] = useState(50000); // Tokens
  const [turns, setTurns] = useState(10);
  const [avgOutput, setAvgOutput] = useState(1000);
  
  const [simulation, setSimulation] = useState<{cost: number, tokens: number, history: any[]} | null>(null);

  useEffect(() => {
    runSimulation();
  }, [agentModel, repoSize, turns, avgOutput]);

  const runSimulation = () => {
    let totalCost = 0;
    let totalTokens = 0;
    let historyTokens = 0;
    const history = [];
    const model = MODELS[agentModel];

    for (let i = 1; i <= turns; i++) {
      // Input = System (2000) + Repo + History
      const inputTokens = 2000 + repoSize + historyTokens;
      const inputCost = (inputTokens / 1000000) * model.input;
      const outputCost = (avgOutput / 1000000) * model.output;
      
      const turnCost = inputCost + outputCost;
      totalCost += turnCost;
      
      history.push({
        turn: i,
        input: inputTokens,
        cost: turnCost,
        cumulative: totalCost
      });

      // Context Ballooning: Output adds to history
      historyTokens += avgOutput + 50; // +50 for user ack
    }

    setSimulation({ cost: totalCost, tokens: totalTokens, history });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181825] border border-gray-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#1e1e2e]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Agent Token FinOps</h2>
              <p className="text-xs text-indigo-300 font-mono tracking-wider uppercase">Multi-Agent Cost Simulator</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Controls */}
          <div className="w-full lg:w-1/3 p-6 border-r border-gray-800 overflow-y-auto bg-[#1e1e2e]/50">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Agent Model</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(MODELS).map(([key, m]) => (
                    <button
                      key={key}
                      onClick={() => setAgentModel(key as any)}
                      className={`px-4 py-3 rounded-xl border text-left transition-all ${
                        agentModel === key 
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                          : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-bold text-sm">{m.name}</div>
                      <div className="text-[10px] opacity-70 mt-1">${m.input}/1M in • ${m.output}/1M out</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 font-bold uppercase">Repo Context Size</span>
                    <span className="text-indigo-400 font-mono">{repoSize.toLocaleString()} tokens</span>
                  </div>
                  <input 
                    type="range" min="1000" max="1000000" step="1000" 
                    value={repoSize}
                    onChange={(e) => setRepoSize(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-gray-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                    <span>Small Script</span>
                    <span>Full Monorepo</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 font-bold uppercase">Conversation Turns</span>
                    <span className="text-indigo-400 font-mono">{turns} turns</span>
                  </div>
                  <input 
                    type="range" min="1" max="50" step="1" 
                    value={turns}
                    onChange={(e) => setTurns(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-gray-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-200/80">
                    <strong className="text-yellow-500 block mb-1">Context Ballooning Effect</strong>
                    Each turn re-sends the entire history + repo context. Costs grow linearly with turns, even if output is small.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 p-6 bg-[#11111b] overflow-y-auto">
            {simulation && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30">
                    <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Total Cost</div>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                      ${simulation.cost.toFixed(4)}
                      <span className="text-sm font-normal text-gray-400">/ run</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-gray-800/30 border border-gray-700">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Context Velocity</div>
                    <div className="text-3xl font-bold text-gray-200 flex items-baseline gap-1">
                      {((repoSize + (turns * avgOutput)) / 1000).toFixed(1)}k
                      <span className="text-sm font-normal text-gray-500">tokens</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Cost Velocity Chart
                  </h3>
                  <div className="h-48 flex items-end gap-1 pb-2 border-b border-gray-800">
                    {simulation.history.map((step, idx) => {
                      const height = (step.cost / simulation.cost) * 100;
                      return (
                        <div key={idx} className="flex-1 group relative flex flex-col justify-end">
                          <div 
                            className="w-full bg-indigo-500/40 hover:bg-indigo-400 rounded-t-sm transition-all relative"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-[10px] px-2 py-1 rounded border border-gray-700 whitespace-nowrap">
                              Turn {step.turn}: ${step.cost.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                    <span>Turn 1</span>
                    <span>Turn {turns}</span>
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300">Detailed Breakdown</span>
                    <span className="text-[10px] text-gray-500 font-mono">GEMINI-1.5-PRO</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-800/50 text-gray-500 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 font-medium">Turn</th>
                          <th className="px-4 py-2 font-medium">Input Tokens</th>
                          <th className="px-4 py-2 font-medium text-right">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800 text-gray-300 font-mono">
                        {simulation.history.map((step) => (
                          <tr key={step.turn} className="hover:bg-white/5">
                            <td className="px-4 py-2 text-gray-500">#{step.turn}</td>
                            <td className="px-4 py-2 text-indigo-300">{step.input.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right">${step.cost.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
