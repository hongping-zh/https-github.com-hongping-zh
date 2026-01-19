
import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle2, XCircle, Terminal, GitMerge, ShieldAlert, FileJson, AlertTriangle, DollarSign, Wallet } from 'lucide-react';
import { demoOrchestrator } from '../services/demoOrchestrator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  energyValue: number; // The optimized energy from the main app
}

/**
 * CI/CD SIMULATOR (Digital Twin)
 * 
 * ARCHITECTURE NOTE:
 * In a production deployment, this component connects to the GitHub/GitLab Actions 
 * Webhook API to stream real-time build logs via WebSocket.
 * 
 * For this Hackathon Demo environment, we use `demoOrchestrator` to simulate 
 * the async event stream of a remote runner executing the "DeepGreen" pipeline.
 */
export const CiCdSimulator: React.FC<Props> = ({ isOpen, onClose, energyValue }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [activeTab, setActiveTab] = useState<'console' | 'config'>('config');

  const ENERGY_BUDGET = 0.0150; // Joules

  useEffect(() => {
    if (isOpen) {
      setLogs([]);
      setStatus('idle');
      setActiveTab('config'); 
    }
  }, [isOpen]);

  const runSimulation = async () => {
    setLogs([]);
    setActiveTab('console');
    
    // Delegate execution to the Scenario Engine (Simulates Remote Runner)
    await demoOrchestrator.runCiCdPipeline(
      energyValue,
      ENERGY_BUDGET,
      (logText) => setLogs(prev => [...prev, logText]),
      (newStatus) => setStatus(newStatus)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0d1117] border border-gray-700 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden h-[600px]">
        
        {/* Header (GitHub Style) */}
        <div className="bg-[#161b22] p-4 border-b border-gray-700 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="bg-eco-500/20 p-2 rounded-md">
                <GitMerge className="w-5 h-5 text-eco-400" />
             </div>
             <div>
               <h2 className="text-sm font-bold text-gray-200">Green FinOps Gatekeeper</h2>
               <p className="text-xs text-gray-500">Governance & Budget Control</p>
             </div>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
           {/* Sidebar */}
           <div className="w-48 bg-[#0d1117] border-r border-gray-700 p-4 flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'config' ? 'bg-[#1f6feb]/20 text-[#58a6ff]' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <FileJson className="w-4 h-4" />
                Policy Config
              </button>
              <button 
                onClick={() => setActiveTab('console')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'console' ? 'bg-[#1f6feb]/20 text-[#58a6ff]' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <Terminal className="w-4 h-4" />
                Console Output
              </button>

              <div className="mt-auto border-t border-gray-700 pt-4">
                 <div className={`p-3 rounded border ${status === 'success' ? 'bg-green-500/10 border-green-500/30' : status === 'failed' ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="flex items-center gap-2 mb-1">
                       <ShieldAlert className={`w-4 h-4 ${status === 'success' ? 'text-green-400' : status === 'failed' ? 'text-red-400' : 'text-gray-400'}`} />
                       <span className="text-xs font-bold text-gray-300">Gate Status</span>
                    </div>
                    <span className={`text-xs font-mono uppercase font-bold ${status === 'success' ? 'text-green-400' : status === 'failed' ? 'text-red-400' : 'text-gray-500'}`}>
                      {status === 'idle' ? 'WAITING' : status}
                    </span>
                 </div>
              </div>
           </div>

           {/* Main Panel */}
           <div className="flex-1 bg-black p-4 overflow-auto font-mono text-xs relative">
              {activeTab === 'console' ? (
                <>
                  {status === 'idle' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                       <Play className="w-12 h-12 mb-4 opacity-20" />
                       <p className="mb-4">Run Compliance Check against FinOps Budget</p>
                       <button 
                         onClick={runSimulation}
                         className="px-6 py-2 bg-eco-600 hover:bg-eco-500 text-white rounded font-bold shadow-lg shadow-eco-900/20 transition-all flex items-center gap-2"
                       >
                         <DollarSign className="w-4 h-4" />
                         Enforce Budget
                       </button>
                    </div>
                  )}
                  <div className="space-y-2">
                     {logs.map((log, i) => (
                       <div key={i} className={`pb-1 border-b border-gray-900/50 ${log.includes("FAILED") ? 'text-red-400' : log.includes("PASSED") ? 'text-green-400' : 'text-gray-300'}`}>
                         <span className="text-gray-600 select-none mr-3">{i+1}</span>
                         {log}
                       </div>
                     ))}
                     {status === 'running' && (
                       <div className="animate-pulse text-eco-500">_</div>
                     )}
                  </div>
                </>
              ) : (
                <div className="text-gray-300 h-full flex flex-col">
                   <div className="flex items-center gap-2 mb-4 bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                      <Wallet className="w-4 h-4 text-yellow-500" />
                      <p className="text-yellow-200">
                         <strong>FinOps Mode:</strong> This config blocks PRs that are projected to increase monthly cloud spend by {'>'}$500.
                      </p>
                   </div>
                   <pre className="text-blue-300 mb-2"># .github/workflows/finops-guard.yml</pre>
                   <code className="block leading-relaxed flex-1 overflow-auto">
{`name: Green FinOps Gate (Strict)

on: [pull_request]

jobs:
  energy-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run EcoCompute Audit
        uses: ecocompute/action@v2
        with:
          api-key: \${{ secrets.GEMINI_KEY }}
          hardware: "nvidia-a100"
          
          # 💰 CFO-LEVEL POLICY
          fail-on:
             # 1. Budget: Prevent Bill Shock
             cost-impact-exceeded: true
             max-cost-increase: 500 # USD/Month
             
             # 2. Efficiency: Maximize FLOPs/Watt
             energy-efficiency-drop: true
             max-efficiency-loss: 5.0 # %
             
          reporting:
             # Send report to FinOps Dashboard
             integration: "datadog-cost-explorer"
             notify-slack: "#finops-alerts"
`}
                   </code>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
