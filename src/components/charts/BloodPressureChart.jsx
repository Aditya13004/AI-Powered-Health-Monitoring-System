import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { HeartIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export default function BloodPressureChart({ data }) {
  const latest = data[data.length - 1];
  const avgSys = data.length > 0 ? data.reduce((sum, point) => sum + (point.bp_sys || 0), 0) / data.length : 0;
  const avgDia = data.length > 0 ? data.reduce((sum, point) => sum + (point.bp_dia || 0), 0) / data.length : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-soft-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Time: {label}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            Systolic: <span className="font-bold">{payload[0]?.value || 0} mmHg</span>
          </p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400">
            Diastolic: <span className="font-bold">{payload[1]?.value || 0} mmHg</span>
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
            <HeartIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Blood Pressure</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Systolic / Diastolic</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Current</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {latest?.bp_sys || 0}/{latest?.bp_dia || 0}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              domain={[50, 160]} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="bp_sys"
              stroke="#a855f7"
              strokeWidth={3}
              dot={false}
              isAnimationActive={true}
              name="Systolic"
            />
            <Line
              type="monotone"
              dataKey="bp_dia"
              stroke="#6366f1"
              strokeWidth={3}
              dot={false}
              isAnimationActive={true}
              name="Diastolic"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Systolic</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{latest?.bp_sys || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Diastolic</p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{latest?.bp_dia || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Avg Sys</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{Math.round(avgSys)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">Avg Dia</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{Math.round(avgDia)}</p>
        </div>
      </div>
    </motion.div>
  );
}
