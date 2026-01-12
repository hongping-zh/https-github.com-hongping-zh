import React from 'react';
import { X, Cpu, Zap, Search, Code2, Database, Map, Video, Layout } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#181825] border border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-800/50 hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-eco-500/20 p-3 rounded-xl">
               <Zap className="w-8 h-8 text-eco-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Project Documentation</h2>
              <p className="text-eco-400 font-mono text-sm">v2.0.0 (Hackathon Edition - Future Proof 2026)</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300">
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                <Cpu className="w-5 h-5 text-blue-400" />
                Core Architecture
              </h3>
              <p className="text-sm leading-relaxed mb-3">
                EcoCompute AI is a hybrid analysis engine designed to democratize Green AI. It combines deterministic <strong className="text-gray-100">Static Analysis</strong> with probabilistic <strong className="text-gray-100">Large Language Models (Gemini 3)</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-dark-800 p-4 rounded-lg border border-gray-800">
                   <h4 className="font-bold text-xs uppercase tracking-wider text-purple-400 mb-2">Frontend (React + Vite)</h4>
                   <ul className="text-xs space-y-2 text-gray-400">
                     <li>• Regex-based AST Parser (Static Analyzer)</li>
                     <li>• Real-time Syntax Pre-flight Checks</li>
                     <li>• Live Agent Telemetry Visualization</li>
                   </ul>
                </div>
                <div className="bg-dark-800 p-4 rounded-lg border border-gray-800">
                   <h4 className="font-bold text-xs uppercase tracking-wider text-eco-400 mb-2">Backend (Gemini 3 Agent)</h4>
                   <ul className="text-xs space-y-2 text-gray-400">
                     <li>• Streaming Reasoning (Thinking Process)</li>
                     <li>• <strong>Google Search Grounding (Live Web)</strong></li>
                     <li>• Uncertainty Quantification Engine</li>
                   </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                <Search className="w-5 h-5 text-yellow-400" />
                Technical Execution: Search Grounding
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Instead of relying on static databases, this agent uses <strong className="text-gray-200">Google Search</strong> to retrieve real-time hardware specifications. 
                This allows it to analyze 2026-era hardware (e.g., NVIDIA Blackwell B200) and specific system constraints like <strong className="text-gray-200">Host-to-USB communication overheads</strong> that are often missing from standard datasheets.
              </p>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                <Map className="w-5 h-5 text-green-400" />
                Development Roadmap (2026-2027)
              </h3>
              <div className="space-y-4">
                 <div className="flex gap-4">
                    <div className="w-16 pt-1 text-xs font-bold text-gray-500 text-right">Q3 2026</div>
                    <div className="flex-1 pb-4 border-l border-gray-700 pl-4 relative">
                       <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                       <h4 className="text-sm font-bold text-white">Google Maps Grounding</h4>
                       <p className="text-xs text-gray-400 mt-1">
                         Carbon intensity calculation based on real-time data center geolocation (Hydro vs Coal regions).
                       </p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-16 pt-1 text-xs font-bold text-gray-500 text-right">Q4 2026</div>
                    <div className="flex-1 pb-4 border-l border-gray-700 pl-4 relative">
                       <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                       <h4 className="text-sm font-bold text-white">Video Profiler Input</h4>
                       <p className="text-xs text-gray-400 mt-1">
                         Upload screen recordings of `nsys` or PyTorch Profiler. Gemini Vision detects hotspots dynamically.
                       </p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-16 pt-1 text-xs font-bold text-gray-500 text-right">2027</div>
                    <div className="flex-1 border-l border-gray-700 pl-4 relative">
                       <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-eco-500"></div>
                       <h4 className="text-sm font-bold text-white">IDE Plugin Ecosystem</h4>
                       <p className="text-xs text-gray-400 mt-1">
                         Real-time "Energy Linting" directly in VS Code, powered by the distilled Gemini Nano model.
                       </p>
                    </div>
                 </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};