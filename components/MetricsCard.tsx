import React from 'react';
import { Info } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  tooltip?: string; 
  errorMargin?: number; // New: Supports Error Bars (e.g. +/- 0.002)
}

export const MetricsCard: React.FC<Props> = ({ title, value, unit, trend, trendValue, color = 'text-white', tooltip, errorMargin }) => {
  return (
    <div className="bg-dark-800/50 p-4 rounded-xl border border-gray-800 backdrop-blur-sm relative group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</h3>
            {tooltip && (
                <div className="relative">
                    <Info className="w-3 h-3 text-gray-600 cursor-help hover:text-gray-400" />
                    <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-black border border-gray-700 rounded-lg text-[10px] text-gray-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {tooltip}
                    </div>
                </div>
            )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${color}`}>{value}</span>
          {unit && <span className="text-sm text-gray-400">{unit}</span>}
        </div>
        {errorMargin !== undefined && (
          <div className="flex items-center gap-1 mt-1 opacity-70" title={`Confidence Interval: ±${errorMargin}`}>
             <span className="text-[10px] text-gray-500 font-mono">±{errorMargin} (95% CI)</span>
             <div className="w-12 h-1 bg-gray-700 rounded-full relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-1/4 right-1/4 bg-gray-500 rounded-full" />
                <div className="absolute top-[-2px] bottom-[-2px] left-1/2 w-0.5 bg-gray-300" />
             </div>
          </div>
        )}
      </div>
      
      {trend && trendValue && (
        <div className={`text-xs mt-3 font-medium flex items-center gap-1 ${trend === 'down' ? 'text-eco-400' : 'text-red-400'}`}>
          <span>{trend === 'down' ? '↓' : '↑'}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};