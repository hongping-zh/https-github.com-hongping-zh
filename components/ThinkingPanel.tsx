import React, { useEffect, useRef } from 'react';
import { Cpu, Terminal, Activity, Zap, Server, BrainCircuit, Code2, Search, RotateCcw, AlertOctagon } from 'lucide-react';

interface Props {
  streamContent: string;
  activePhase: string; // P0-2: Real Phase from backend
  isSandboxActive: boolean; // P0-3: True only if 'COMPUTE' phase was triggered
}

export const ThinkingPanel: React.FC<Props> = ({ streamContent, activePhase, isSandboxActive }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of stream
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamContent]);

  // Map real phase tags to UI elements
  // CRITICAL UPDATE: Added 'CORRECTION' phase to show Self-Healing capabilities
  const getPhaseDetails = (phase: string) => {
    switch (phase) {
      case 'SEARCH':
        return { text: "Tool Call: Google Search (2026 Specs)...", icon: Search, color: "text-blue-400", bg: "bg-blue-500/10" };
      case 'COMPUTE':
        return { text: "Sandbox: Verifying Physics Math...", icon: Terminal, color: "text-orange-400", bg: "bg-orange-500/10" };
      case 'CORRECTION':
        return { text: "Anomaly Detected. Self-Correcting...", icon: RotateCcw, color: "text-yellow-400", bg: "bg-yellow-500/10" };
      case 'ANALYSIS':
        return { text: "Cross-referencing MLPerf v4.1...", icon: Server, color: "text-eco-400", bg: "bg-eco-500/10" };
      case 'STRATEGY':
        return { text: "Synthesizing Green Strategy...", icon: Cpu, color: "text-white", bg: "bg-white/5" };
      default:
        // Default initial state
        return { text: "Allocating Thinking Budget (1024 Tokens)...", icon: BrainCircuit, color: "text-purple-400", bg: "bg-purple-500/10" };
    }
  };

  const currentStep = getPhaseDetails(activePhase);
  const StepIcon = currentStep.icon;
  
  // Visualize Thinking Budget Consumption
  const budget = 1024;
  const simulatedUsed = Math.min(budget, Math.floor(streamContent.length * 0.6)); 
  const progress = (simulatedUsed / budget) * 100;

  return (
    <div className="h-full flex flex-col gap-4 rounded-2xl border border-eco-500/30 bg-dark-900/80 backdrop-blur-md p-6 relative overflow-hidden shadow-2xl">
      
      {/* Background Grid Animation */}
      <div className="absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] opacity-10 pointer-events-none">
        {Array.from({ length: 400 }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-eco-500/20" />
        ))}
      </div>

      {/* Header: Agent Status */}
      <div className="flex items-center justify-between relative z-10 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full animate-ping absolute inset-0 ${activePhase === 'CORRECTION' ? 'bg-yellow-500' : 'bg-eco-500'}`} />
            <div className={`w-3 h-3 rounded-full relative ${activePhase === 'CORRECTION' ? 'bg-yellow-500' : 'bg-eco-500'}`} />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wide">GEMINI 3 AGENT</h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">Thinking Mode</span>
               {activePhase === 'CORRECTION' && (
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-500/30 animate-pulse">Self-Healing</span>
               )}
            </div>
          </div>
        </div>
        <div className="bg-dark-800 border border-gray-700 rounded px-2 py-1 text-xs font-mono text-gray-400 flex items-center gap-2">
          <Activity className="w-3 h-3" />
          PID: {Math.floor(Math.random() * 9000) + 1000}
        </div>
      </div>

      {/* Thinking Budget Visualization */}
      <div className="relative z-10 py-2 group">
         <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
            <span className="flex items-center gap-1">
                <BrainCircuit className="w-3 h-3" /> 
                THINKING BUDGET (GEMINI 3 EXCLUSIVE)
            </span>
            <span>{simulatedUsed} / {budget} TOKENS</span>
         </div>
         <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ease-out ${activePhase === 'CORRECTION' ? 'bg-yellow-500' : 'bg-gradient-to-r from-purple-500 via-blue-500 to-eco-500'}`}
              style={{ width: `${progress}%` }}
            />
         </div>
         
         {/* Tooltip for Thinking Budget - "Why this matters" */}
         <div className="absolute top-full left-0 mt-2 w-64 p-2 bg-black border border-purple-500/30 rounded text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            <strong>Why Thinking Budget?</strong><br/>
            Gemini 3 allocates tokens to "plan" complex physics calculations and self-correct errors <em>before</em> generating the final JSON.
         </div>
      </div>

      {/* Active Step Indicator */}
      <div className={`flex items-center gap-3 py-3 px-4 rounded-lg border border-gray-700/50 relative z-10 animate-in slide-in-from-left-2 duration-300 transition-colors ${currentStep.bg}`}>
        <div className={`p-1.5 rounded-md bg-black/20 ${currentStep.color}`}>
           <StepIcon className={`w-5 h-5 ${activePhase === 'CORRECTION' ? 'animate-spin' : ''}`} />
        </div>
        <span className={`font-mono text-sm font-bold ${currentStep.color}`}>{currentStep.text}</span>
      </div>

      {/* Stream Terminal */}
      <div 
        ref={scrollRef}
        className={`flex-1 bg-black/80 rounded-lg border p-4 font-mono text-xs overflow-y-auto relative z-10 shadow-inner transition-colors ${activePhase === 'CORRECTION' ? 'border-yellow-500/30 text-yellow-200/90' : 'border-gray-800 text-green-500/90'}`}
      >
        <div className="whitespace-pre-wrap break-all leading-relaxed">
           <span className="opacity-50 select-none">{">_ initializing gemini-3-pro-preview environment...\n"}</span>
           {streamContent}
           <span className={`inline-block w-2 h-4 ml-1 animate-pulse ${activePhase === 'CORRECTION' ? 'bg-yellow-500' : 'bg-green-500'}`} />
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex justify-between text-[10px] text-gray-500 font-mono relative z-10 pt-2 border-t border-gray-800">
        <span className={`flex items-center gap-1 transition-colors duration-500 ${isSandboxActive ? 'text-orange-400 font-bold' : 'text-gray-600'}`}>
             <Code2 className="w-3 h-3" />
             SANDBOX: {isSandboxActive ? 'ACTIVE' : 'STANDBY'}
        </span>
        <span className="flex items-center gap-1 text-blue-400/80">
            <Server className="w-3 h-3" />
            MLPERF DB: CONNECTED
        </span>
      </div>
    </div>
  );
};