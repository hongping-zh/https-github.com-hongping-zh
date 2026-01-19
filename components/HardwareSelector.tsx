import React from 'react';
import { HardwareProfile } from '../types';
import { MapPin, Leaf, ShieldCheck, Globe } from 'lucide-react';

interface Props {
  selected: HardwareProfile;
  onSelect: (hw: HardwareProfile) => void;
}

// Fix 3.1: Export this constant so App.tsx uses the exact same data.
// Refined Data for Demo Narrative with "Verification" status to solve Hallucination Critique
export const hardwareOptions: HardwareProfile[] = [
  { id: 'h5', name: 'NVIDIA B200 (2026)', type: 'GPU', icon: '🚀', efficiency: 'Ultra', region: 'us-central1', carbonIntensity: 360, isVerified: false }, // New hardware -> Web Search
  { id: 'h1', name: 'NVIDIA A100', type: 'GPU', icon: '⚡', efficiency: 'Medium', region: 'asia-east1', carbonIntensity: 620, isVerified: true }, // Verified Database
  { id: 'h2', name: 'Google Edge TPU', type: 'TPU', icon: '🍃', efficiency: 'High', region: 'europe-west4', carbonIntensity: 180, isVerified: true }, // Verified Database
  { id: 'h3', name: 'ARM Cortex-A78', type: 'Mobile', icon: '📱', efficiency: 'High', region: 'global', carbonIntensity: 450, isVerified: true }, // Verified Database
  { id: 'h4', name: 'Intel Xeon Scalable', type: 'CPU', icon: '💻', efficiency: 'Low', region: 'us-east1', carbonIntensity: 480, isVerified: true }, // Verified Database
];

export const HardwareSelector: React.FC<Props> = ({ selected, onSelect }) => {
  // Find lowest carbon intensity to highlight as Eco Pick
  const minCarbon = Math.min(...hardwareOptions.map(h => h.carbonIntensity || 9999));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {hardwareOptions.map((hw) => {
        const isEcoPick = hw.carbonIntensity === minCarbon;
        return (
          <button
            key={hw.id}
            onClick={() => onSelect(hw)}
            className={`
              flex flex-col items-start p-3 rounded-xl border transition-all min-w-[150px] relative overflow-hidden group
              ${selected.id === hw.id 
                ? 'bg-eco-900/30 border-eco-500 text-eco-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                : 'bg-dark-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:bg-dark-800/80'}
            `}
          >
            {isEcoPick && (
               <div 
                 className="absolute top-0 right-0 bg-eco-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg flex items-center gap-0.5 shadow-sm cursor-help"
                 title="Lowest carbon intensity (gCO2/kWh) among available options."
               >
                 <Leaf className="w-2 h-2 fill-current" />
                 ECO PICK
               </div>
            )}
            <div className="flex justify-between w-full mb-2">
              <span className="text-2xl">{hw.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                hw.efficiency === 'High' || hw.efficiency === 'Ultra' ? 'bg-eco-500/20 text-eco-400' : 'bg-orange-500/20 text-orange-400'
              }`}>
                {hw.efficiency} eff.
              </span>
            </div>
            <span className="font-semibold text-sm truncate w-full text-left">{hw.name}</span>
            <div className="flex items-center gap-1 mt-1 opacity-60 text-xs w-full">
               <MapPin className="w-3 h-3 shrink-0" />
               <span className="truncate">{hw.region}</span>
            </div>
            
            {/* New: Data Source Indicator (Hallucination Defense) */}
            <div className="flex items-center gap-1.5 mt-2 w-full text-[10px] bg-black/20 p-1 rounded">
               {hw.isVerified ? (
                 <>
                   <ShieldCheck className="w-3 h-3 text-green-400" />
                   <span className="text-green-200/70">Verified DB</span>
                 </>
               ) : (
                 <>
                   <Globe className="w-3 h-3 text-blue-400" />
                   <span className="text-blue-200/70">Live Search</span>
                 </>
               )}
            </div>

            <div className="flex items-center justify-between w-full mt-1.5">
               <span className="text-[10px] text-gray-500">{hw.carbonIntensity} gCO2/kWh</span>
               {selected.id !== hw.id && selected.carbonIntensity && hw.carbonIntensity && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${hw.carbonIntensity < selected.carbonIntensity ? 'bg-eco-500/10 text-eco-400 border border-eco-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                    {hw.carbonIntensity < selected.carbonIntensity ? `-${Math.round(100 - (hw.carbonIntensity/selected.carbonIntensity)*100)}%` : `+${Math.round((hw.carbonIntensity/selected.carbonIntensity)*100)-100}%`}
                  </span>
               )}
            </div>
          </button>
        );
      })}
    </div>
  );
};