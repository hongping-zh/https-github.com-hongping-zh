import React from 'react';

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

export const MetricsCard: React.FC<Props> = ({ title, value, unit, trend, trendValue, color = 'text-white' }) => {
  return (
    <div className="bg-dark-800/50 p-4 rounded-xl border border-gray-800 backdrop-blur-sm">
      <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
      {trend && trendValue && (
        <div className={`text-xs mt-2 font-medium flex items-center gap-1 ${trend === 'down' ? 'text-eco-400' : 'text-red-400'}`}>
          <span>{trend === 'down' ? '↓' : '↑'}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};
