import React, { useState, useEffect } from 'react';
import { Leaf, TrendingUp } from 'lucide-react';

export const ImpactTracker: React.FC = () => {
  const [saved, setSaved] = useState(0);

  // Load saved impact from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('eco_impact_g');
    if (stored) setSaved(parseFloat(stored));
  }, []);

  // Listen for custom event when new impact is added
  useEffect(() => {
    const handleImpactUpdate = (e: CustomEvent) => {
      const newAmount = e.detail;
      const current = parseFloat(localStorage.getItem('eco_impact_g') || '0');
      const total = current + newAmount;
      localStorage.setItem('eco_impact_g', total.toString());
      setSaved(total);
    };

    window.addEventListener('impact-update' as any, handleImpactUpdate as any);
    return () => window.removeEventListener('impact-update' as any, handleImpactUpdate as any);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-gray-700/50">
      <div className="flex flex-col items-end">
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Global Impact</span>
        <div className="flex items-center gap-1.5 text-eco-400 font-mono text-sm">
          <Leaf className="w-3 h-3" />
          <span className="font-bold">{saved.toFixed(2)}g</span>
          <span className="text-gray-500 text-[10px]">CO2e Saved</span>
        </div>
      </div>
    </div>
  );
};