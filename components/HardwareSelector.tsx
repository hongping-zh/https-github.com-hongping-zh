import React from 'react';
import { HardwareProfile } from '../types';
import { MapPin, Leaf } from 'lucide-react';

interface Props {
  selected: HardwareProfile;
  onSelect: (hw: HardwareProfile) => void;
}

// Fix 3.1: Export this constant so App.tsx uses the exact same data.
// Refined Data for Demo Narrative:
// 1. Google Edge TPU moved to europe-west4 (Eemshaven - Green Data Center) to be the clear ECO PICK (180g).
// 2. NVIDIA B200 in us-central1 (Iowa - Wind mix) is efficient but higher than TPU.
// 3. Legacy hardware (Xeon/A100) placed in higher intensity regions to show contrast.
export const hardwareOptions: HardwareProfile[] = [
  { id: 'h5', name: 'NVIDIA B200 (2026)', type: 'GPU', icon: '🚀', efficiency: 'Ultra', region: 'us-central1', carbonIntensity: 360 },
  { id: 'h1', name: 'NVIDIA A100', type: 'GPU', icon: '⚡', efficiency: 'Medium', region: 'asia-east1', carbonIntensity: 620 },
  { id: 'h2', name: 'Google Edge TPU', type: 'TPU', icon: '🍃', efficiency: 'High', region: 'europe-west4', carbonIntensity: 180 }, 
  { id: 'h3', name: 'ARM Cortex-A78', type: 'Mobile', icon: '📱', efficiency: 'High', region: 'global', carbonIntensity: 450 },
  { id: 'h4', name: 'Intel Xeon Scalable', type: 'CPU', icon: '💻', efficiency: 'Low', region: 'us-east1', carbonIntensity: 480 },
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
              flex flex-col items-start p-3 rounded-xl border transition-all min-w-[150px] relative overflow-hidden
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