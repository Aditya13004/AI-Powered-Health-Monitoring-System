import React from 'react';
import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="card-hover group relative overflow-hidden"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-teal-50/50 dark:from-blue-900/10 dark:to-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon container */}
      <motion.div 
        className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-300"
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="h-8 w-8" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-teal-400 opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300" />
      </motion.div>

      {/* Content */}
      <div className="relative">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
          {desc}
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
    </motion.div>
  );
}
