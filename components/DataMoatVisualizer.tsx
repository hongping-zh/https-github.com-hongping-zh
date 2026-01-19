
import React, { useState, useEffect } from 'react';
import { moatService } from '../services/moatService';
import { Shield, ChevronRight, Database, Activity, Lock, Globe } from 'lucide-react';

export const DataMoatVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flywheel' | 'metrics'>('flywheel');
  // Local state to force re-render when the service emits an event
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setTick(t => t + 1);
    };
    window.addEventListener('moat-update', handleUpdate);
    return () => window.removeEventListener('moat-update', handleUpdate);
  }, []);

  const characteristics = moatService.getMoatCharacteristics();
  const flywheel = moatService.getDataFlywheel();
  
  // Use real data from the singleton service
  const stats = moatService.getDataCollectionScale(); 
  // Cast strictly for type safety if needed, though Record<string, string|object> is flexible.
  const layersScanned = stats["Session Layers Scanned"] as string;
  const optsIdentified = stats["Optimizations Identified"] as string;

  return (
    <div className="bg-dark-900/50 border border-gray-800 rounded-2xl p-6 overflow-hidden relative animate-in fade-in">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Shield className="w-64 h-64 text-eco-500" />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
          <Globe className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Global Efficiency Knowledge Base™</h2>
          <p className="text-xs text-gray-400">Proprietary Dataset & Network Effect</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 text-sm border-b border-gray-800 relative z-10">
        <button
          onClick={() => setActiveTab('flywheel')}
          className={`pb-2 transition-colors ${activeTab === 'flywheel' ? 'text-eco-400 border-b-2 border-eco-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Data Flywheel
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-2 transition-colors ${activeTab === 'metrics' ? 'text-eco-400 border-b-2 border-eco-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Competitive Barriers
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[200px]">
        {activeTab === 'flywheel' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {flywheel.map((stage, idx) => (
              <div key={stage.stage} className="relative group">
                <div className="bg-dark-800/80 p-4 rounded-xl border border-gray-700 h-full hover:border-eco-500/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-gray-500">Stage 0{stage.stage}</span>
                    {idx < flywheel.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-600 md:hidden" />
                    )}
                  </div>
                  <h3 className="font-bold text-eco-400 mb-2 text-sm">{stage.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{stage.description}</p>
                </div>
                {/* Connector for desktop */}
                {idx < flywheel.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {characteristics.map((char, idx) => {
              const Icon = char.icon;
              return (
                <div key={idx} className="flex items-start gap-4 bg-dark-800/80 p-4 rounded-xl border border-gray-700">
                  <div className="bg-black/40 p-2 rounded-lg text-gray-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{char.label}</h3>
                    <div className="text-xs font-mono text-eco-400 mb-2">{char.value}</div>
                    <p className="text-xs text-gray-500 leading-relaxed">{char.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Real-time Session Stats Footer (No Fake Data) */}
      <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500 relative z-10">
        <div className="flex items-center gap-2">
           <Activity className="w-3 h-3 text-eco-500" />
           <span>Data Ingested (Session): <span className="text-gray-300 transition-all">{layersScanned} Layers</span></span>
        </div>
        <div className="flex items-center gap-2">
           <Database className="w-3 h-3 text-blue-500" />
           <span>Dataset Contributed: <span className="text-gray-300 transition-all">{optsIdentified} Records</span></span>
        </div>
        <div className="flex items-center gap-2 opacity-60">
           <Lock className="w-3 h-3" />
           <span>Privacy: Anonymized</span>
        </div>
      </div>
    </div>
  );
};
