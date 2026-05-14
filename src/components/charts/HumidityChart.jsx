// src/components/charts/HumidityChart.jsx
// Real-time humidity sensor chart for HealthSync

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { CloudIcon } from '@heroicons/react/24/outline';

export default function HumidityChart({ data }) {
  const latest = data[data.length - 1];
  const avg = data.length > 0 ? data.reduce((sum, p) => sum + (p.humidity || 0), 0) / data.length : 0;
  const trend = latest?.humidity > avg ? 'up' : latest?.humidity < avg ? 'down' : 'stable';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-soft-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Humidity: <span className="font-bold">{payload[0].value?.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="card group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
            <CloudIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Humidity</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Relative Humidity %</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-medium ${
            trend === 'up' ? 'text-blue-600 dark:text-blue-400' :
            trend === 'down' ? 'text-emerald-600 dark:text-emerald-400' :
            'text-slate-500 dark:text-slate-400'
          }`}>
            {trend === 'up' ? '↑ Rising' : trend === 'down' ? '↓ Falling' : '→ Stable'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis dataKey="t" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
            <YAxis domain={[20, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={{ stroke: '#e2e8f0' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#humidityGradient)"
              dot={false}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Current</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{latest?.humidity?.toFixed(1) ?? 0}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Average</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{avg.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
          <p className={`text-lg font-bold ${
            !latest?.humidity ? 'text-slate-400' :
            latest.humidity > 70 || latest.humidity < 30 ? 'text-amber-600 dark:text-amber-400' :
            'text-emerald-600 dark:text-emerald-400'
          }`}>
            {!latest?.humidity ? '—' :
             latest.humidity > 70 ? 'High' :
             latest.humidity < 30 ? 'Low' : 'Normal'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
