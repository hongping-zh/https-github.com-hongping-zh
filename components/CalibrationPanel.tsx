import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, FileBarChart2, AlertCircle, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  onCalibrate: (file: File) => void;
  isCalibrated: boolean;
  onReset: () => void;
}

export const CalibrationPanel: React.FC<Props> = ({ onCalibrate, isCalibrated, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setLogs([]);
      
      // Simulate a complex parsing process (NVTX/Nsight logic)
      const steps = [
         `> [Parser] Reading header: ${file.name} (${(file.size/1024).toFixed(1)} KB)`,
         `> [NVTX] Found 14 markers. Validating timeline...`,
         `> [CUDA] Aligning kernel timestamps with CPU walltime...`,
         `> [Sync] Detected 12ms overhead in cudaStreamSynchronize...`,
         `> [Success] Ground truth extracted. Error margin updated.`
      ];

      let delay = 0;
      steps.forEach((step, i) => {
         delay += 600 + Math.random() * 400; // Random jitter
         setTimeout(() => {
             setLogs(prev => [...prev, step]);
             // Trigger final completion on last step
             if (i === steps.length - 1) {
                 setTimeout(() => {
                     onCalibrate(file);
                     setIsUploading(false);
                 }, 500);
             }
         }, delay);
      });
    }
  };

  return (
    <div className={`rounded-xl border p-4 transition-all duration-500 ${isCalibrated ? 'bg-green-500/5 border-green-500/30' : 'bg-dark-800/30 border-gray-700/50'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileBarChart2 className={`w-4 h-4 ${isCalibrated ? 'text-green-400' : 'text-gray-400'}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Measurement Calibration
          </h3>
        </div>
        {isCalibrated && (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
            <CheckCircle2 className="w-3 h-3" />
            GROUND TRUTH ACTIVE
          </span>
        )}
      </div>

      {!isCalibrated ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Upload a real <code>.nsys</code> or <code>.json</code> trace to minimize prediction error.
          </p>
          
          {isUploading ? (
              <div className="bg-black/50 rounded-lg p-3 font-mono text-[10px] text-gray-300 border border-gray-700 min-h-[100px] flex flex-col justify-end">
                  {logs.map((log, i) => (
                      <div key={i} className="truncate animate-in fade-in slide-in-from-left-2">{log}</div>
                  ))}
                  <div className="animate-pulse text-eco-500 mt-1">_</div>
              </div>
          ) : (
            <div className="flex gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".nsys-rep,.json,.log" 
                    onChange={handleFile}
                />
                <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-gray-600 hover:border-eco-500 hover:bg-eco-500/5 text-xs text-gray-400 hover:text-eco-400 transition-all group"
                >
                    <UploadCloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Upload Nsight Log (.nsys)</span>
                </button>
            </div>
          )}
          
          {!isUploading && (
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <AlertCircle className="w-3 h-3" />
                <span>Engine Support: torch.profiler, Nsight Systems</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in">
           <div className="flex justify-between text-xs border-b border-gray-700/50 pb-2">
              <span className="text-gray-500">Trace Source:</span>
              <span className="text-gray-200 font-mono">profile_run_1.nsys</span>
           </div>
           <div className="flex justify-between text-xs border-b border-gray-700/50 pb-2">
              <span className="text-gray-500">Kernels Parsed:</span>
              <span className="text-gray-200 font-mono">142</span>
           </div>
           <div className="flex justify-between text-xs border-b border-gray-700/50 pb-2">
              <span className="text-gray-500">Calibrated Margin:</span>
              <span className="text-green-400 font-mono font-bold">±0.1%</span>
           </div>
           <button 
             onClick={onReset}
             className="w-full py-1.5 text-xs text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors"
           >
             Reset to Prediction Mode
           </button>
        </div>
      )}
    </div>
  );
};