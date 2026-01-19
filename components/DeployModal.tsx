import React, { useState } from 'react';
import { X, Box, Terminal, LayoutGrid, Download, ShieldCheck, Lock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'docker' | 'k8s' | 'vscode'>('docker');

  if (!isOpen) return null;

  const artifacts = {
    docker: `
# Dockerfile for On-Premise / Private Cloud
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Enterprise Config: Point to internal MLPerf mirror
ENV REACT_APP_MLPERF_MIRROR="https://internal.corp/mlperf"
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,
    k8s: `
# helm-chart/values.yaml (Admission Controller)
greenGate:
  enabled: true
  policy:
    maxEnergyPerInference: 0.015 # Joules
    enforceOn: ["Production", "Staging"]
  
  # Connect to Private LLM Gateway
  llmProvider:
    type: "openai-compatible" 
    endpoint: "http://gemini-gateway.internal"
    model: "gemini-3-pro-private"`,
    vscode: `
// .vscode/settings.json
{
  "ecoCompute.enableLinter": true,
  "ecoCompute.hardwareTarget": "nvidia-a100",
  "ecoCompute.energyThreshold": "strict",
  "ecoCompute.showInlineDecorations": true,
  "ecoCompute.telemetry": {
      "enabled": false // Privacy First
  }
}`
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0d1117] border border-gray-700 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[600px]">
        
        {/* Header */}
        <div className="bg-[#161b22] p-4 border-b border-gray-700 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="bg-purple-500/20 p-2 rounded-md">
                <Box className="w-5 h-5 text-purple-400" />
             </div>
             <div>
               <h2 className="text-sm font-bold text-gray-200">Enterprise Deployment</h2>
               <p className="text-xs text-gray-500">Self-Hosted & Private Cloud Options</p>
             </div>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-[#0d1117]">
            <button 
                onClick={() => setActiveTab('docker')}
                className={`flex-1 px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'docker' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <Box className="w-4 h-4" /> Docker
            </button>
            <button 
                onClick={() => setActiveTab('k8s')}
                className={`flex-1 px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'k8s' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <LayoutGrid className="w-4 h-4" /> Kubernetes
            </button>
            <button 
                onClick={() => setActiveTab('vscode')}
                className={`flex-1 px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'vscode' ? 'border-eco-500 text-eco-400 bg-eco-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <Terminal className="w-4 h-4" /> VS Code
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-black p-4 overflow-auto relative group">
           <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                  onClick={() => navigator.clipboard.writeText(artifacts[activeTab])}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-600 text-xs flex items-center gap-1"
               >
                  <Download className="w-3 h-3" /> Copy
               </button>
           </div>
           <pre className="font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
               <code>{artifacts[activeTab].trim()}</code>
           </pre>
        </div>

        {/* Footer */}
        <div className="bg-[#161b22] p-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
           <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-green-500" />
              <span>Security: <span className="text-gray-300">Air-gapped Ready</span></span>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-purple-500" />
              <span>Compliance: <span className="text-gray-300">ISO 27001 / SOC2</span></span>
           </div>
        </div>

      </div>
    </div>
  );
};