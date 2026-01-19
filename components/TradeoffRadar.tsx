import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TradeoffMetrics } from '../types';

interface Props {
  metrics: TradeoffMetrics;
}

export const TradeoffRadar: React.FC<Props> = ({ metrics }) => {
  const data = [
    {
      subject: 'Performance',
      A: metrics.performanceScore,
      fullMark: 100,
    },
    {
      subject: 'Cost Savings',
      A: metrics.costEfficiencyScore,
      fullMark: 100,
    },
    {
      subject: 'Green Impact',
      A: metrics.carbonEfficiencyScore,
      fullMark: 100,
    },
    {
      subject: 'Accuracy Safety', // NEW: Addressing the "Accuracy Risk" critique
      A: metrics.accuracySafetyScore || 95, // Default high safety if undefined
      fullMark: 100,
    },
  ];

  return (
    <div className="bg-dark-800/50 p-4 rounded-xl border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[250px]">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Decision Quadrant</h3>
        <p className="text-[10px] text-gray-400">Balancing Risk vs Reward</p>
      </div>
      
      <div className="w-full h-full flex items-center justify-center mt-4">
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Score"
              dataKey="A"
              stroke="#22c55e"
              strokeWidth={2}
              fill="#22c55e"
              fillOpacity={0.3}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e2e', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1 text-[10px] text-gray-500">
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
            <span>Current Config</span>
         </div>
      </div>
    </div>
  );
};