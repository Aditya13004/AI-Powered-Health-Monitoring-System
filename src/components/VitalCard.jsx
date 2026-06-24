import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';

export default function VitalCard({ label, value, unit, status, icon: Icon, trend }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'high':
      case 'High':
      case 'warning':
        return 'text-rose-600 dark:text-rose-400';
      case 'medium':
      case 'Low':
        return 'text-amber-600 dark:text-amber-400';
      case 'low':
      case 'normal':
      case 'Normal':
        return 'text-emerald-600 dark:text-emerald-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'high':
      case 'High':
      case 'warning':
        return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
      case 'medium':
      case 'Low':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'low':
      case 'normal':
      case 'Normal':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-rose-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-emerald-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-rose-600 dark:text-rose-400';
      case 'down':
        return 'text-emerald-600 dark:text-emerald-400';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`card-hover group relative overflow-hidden ${getStatusBg(status)}`}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-slate-800/50 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
              {trend && (
                <div className={`flex items-center gap-1 text-xs ${getTrendColor(trend)}`}>
                  {getTrendIcon(trend)}
                  <span className="capitalize">{trend}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {value}
            </span>
            <span className="text-lg text-slate-500 dark:text-slate-400 font-medium">
              {unit}
            </span>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status === 'high' || status === 'High' || status === 'warning' ? 'bg-rose-500' :
                status === 'medium' || status === 'Low' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`} />
              <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                {status === 'high' ? 'High Risk' :
                 status === 'medium' ? 'Medium Risk' :
                 status === 'low' ? 'Low Risk' :
                 status === 'warning' ? 'Warning' :
                 status === 'normal' || status === 'Normal' ? 'Normal' :
                 status}
              </span>
            </div>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-1 h-1 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
}
