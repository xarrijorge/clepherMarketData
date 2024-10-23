// src/components/MarketChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {  MarketChartProps } from '../utilities/interfaces';

export const MarketChart: React.FC<MarketChartProps> = ({ chartData, visibleLines, LINE_CONFIGS }) => {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            type="category"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
            formatter={(value: number) => [`${value.toFixed(2)}`, '']}
          />
          <Legend />
          {LINE_CONFIGS.map(config => (
            visibleLines.has(config.key) && (
              <Line
                key={config.key}
                yAxisId="left"
                type="monotone"
                dataKey={config.key}
                stroke={config.color}
                dot={false}
                name={config.label}
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};