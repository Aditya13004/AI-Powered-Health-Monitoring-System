import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {/* Main gradient orbs */}
      <motion.div 
        className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-blue-400/30 to-teal-400/30 blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-gradient-to-tr from-teal-400/25 to-emerald-400/25 blur-3xl"
        animate={{ 
          scale: [1.1, 1, 1.1],
          rotate: [360, 180, 0],
          opacity: [0.25, 0.4, 0.25]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-400/20 to-blue-400/20 blur-2xl"
        animate={{ 
          scale: [0.8, 1.2, 0.8],
          rotate: [0, 360, 0],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      {/* Floating particles */}
      <motion.div 
        className="absolute top-20 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60"
        animate={{ 
          y: [0, -30, 0],
          x: [0, 20, 0],
          opacity: [0.6, 0.2, 0.6]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="absolute top-40 right-1/3 w-1 h-1 bg-teal-400 rounded-full opacity-80"
        animate={{ 
          y: [0, -40, 0],
          x: [0, -15, 0],
          opacity: [0.8, 0.3, 0.8]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="absolute bottom-32 right-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-70"
        animate={{ 
          y: [0, -25, 0],
          x: [0, 25, 0],
          opacity: [0.7, 0.2, 0.7]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      {/* Animated wave pattern */}
      <motion.svg 
        className="absolute inset-x-0 top-20 mx-auto opacity-20 dark:opacity-10" 
        width="800" 
        height="120" 
        viewBox="0 0 800 120" 
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.path 
          d="M0 60 Q50 60, 100 60 Q130 20, 160 60 Q200 110, 240 60 Q270 20, 300 60 Q340 110, 380 60 Q420 20, 460 60 Q500 110, 540 60 Q580 20, 620 60 Q660 110, 700 60 Q750 60, 800 60" 
          stroke="url(#grad1)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        <motion.path 
          d="M0 80 Q100 40, 200 80 Q300 20, 400 80 Q500 140, 600 80 Q700 20, 800 80" 
          stroke="url(#grad2)" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
        />
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="800" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="grad2" x1="0" y1="0" x2="800" y2="0">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
    </div>
  );
}
