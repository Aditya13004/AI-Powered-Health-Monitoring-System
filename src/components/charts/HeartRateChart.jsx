import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { HeartIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export default function HeartRateChart({ data }) {
  const latest = data[data.length - 1];
  const avg = data.reduce((sum, point) => sum + point.hr, 0) / data.length;
  const trend = latest?.hr > avg ? 'up' : latest?.hr < avg ? 'down' : 'stable';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-soft-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Time: {label}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Heart Rate: <span className="font-bold">{payload[0].value} bpm</span>
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
      transition={{ duration: 0.6 }}
      className="card group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center">
            <HeartIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Heart Rate</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Beats per minute</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <ArrowTrendingUpIcon className={`h-4 w-4 ${
              trend === 'up' ? 'text-rose-500' : 
              trend === 'down' ? 'text-emerald-500' : 
              'text-slate-400'
            }`} />
            <span className={`font-medium ${
              trend === 'up' ? 'text-rose-600 dark:text-rose-400' : 
              trend === 'down' ? 'text-emerald-600 dark:text-emerald-400' : 
              'text-slate-500 dark:text-slate-400'
            }`}>
              {trend === 'up' ? 'Rising' : trend === 'down' ? 'Falling' : 'Stable'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e2e8f0" 
              strokeOpacity={0.5}
              className="dark:stroke-slate-700"
            />
            <XAxis 
              dataKey="t" 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              domain={[50, 140]} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="hr"
              stroke="#f43f5e"
              strokeWidth={3}
              fill="url(#heartRateGradient)"
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
          <p className="text-lg font-bold text-slate-900 dark:text-white">{latest?.hr || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Average</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{Math.round(avg)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Peak</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {Math.max(...data.map(d => d.hr))}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
