import React, { useEffect, useRef } from 'react';
import { Cpu, Terminal, Activity, Zap, Server, BrainCircuit, Code2, Search } from 'lucide-react';

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
  const getPhaseDetails = (phase: string) => {
    switch (phase) {
      case 'SEARCH':
        return { text: "Tool Call: Google Search (2026 Specs)...", icon: Search, color: "text-blue-400" };
      case 'COMPUTE':
        return { text: "Tool Call: Code Execution (Calc Intensity)...", icon: Terminal, color: "text-orange-400" };
      case 'ANALYSIS':
        return { text: "Cross-referencing MLPerf v4.1...", icon: Server, color: "text-eco-400" };
      case 'STRATEGY':
        return { text: "Synthesizing Green Strategy...", icon: Cpu, color: "text-white" };
      default:
        // Default initial state
        return { text: "Allocating Thinking Budget (1024 Tokens)...", icon: BrainCircuit, color: "text-purple-400" };
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
            <div className="w-3 h-3 bg-eco-500 rounded-full animate-ping absolute inset-0" />
            <div className="w-3 h-3 bg-eco-500 rounded-full relative" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wide">GEMINI 3 AGENT</h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">Thinking</span>
               <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded border border-orange-500/30">Action</span>
            </div>
          </div>
        </div>
        <div className="bg-dark-800 border border-gray-700 rounded px-2 py-1 text-xs font-mono text-gray-400 flex items-center gap-2">
          <Activity className="w-3 h-3" />
          PID: {Math.floor(Math.random() * 9000) + 1000}
        </div>
      </div>

      {/* Thinking Budget Visualization */}
      <div className="relative z-10 py-2">
         <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
            <span className="flex items-center gap-1"><BrainCircuit className="w-3 h-3" /> THINKING BUDGET</span>
            <span>{simulatedUsed} / {budget} TOKENS</span>
         </div>
         <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-eco-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
         </div>
      </div>

      {/* Active Step Indicator */}
      <div className={`flex items-center gap-3 py-3 px-4 rounded-lg bg-dark-800/50 border border-gray-700/50 relative z-10 animate-in slide-in-from-left-2 duration-300 transition-colors`}>
        <div className={`p-1.5 rounded-md bg-white/5 ${currentStep.color}`}>
           <StepIcon className="w-5 h-5" />
        </div>
        <span className={`font-mono text-sm font-bold ${currentStep.color}`}>{currentStep.text}</span>
      </div>

      {/* Stream Terminal */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-black/80 rounded-lg border border-gray-800 p-4 font-mono text-xs text-green-500/90 overflow-y-auto relative z-10 shadow-inner"
      >
        <div className="whitespace-pre-wrap break-all leading-relaxed">
           <span className="opacity-50 select-none">{">_ initializing gemini-3-pro-preview environment...\n"}</span>
           {streamContent}
           <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse" />
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