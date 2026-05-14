import React from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground.jsx';
import { ArrowRightIcon, ChatBubbleBottomCenterTextIcon, HeartIcon, CpuChipIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative section-padding overflow-hidden">
      <AnimatedBackground />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full opacity-20"
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full opacity-30"
          animate={{ y: [0, 20, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-40 left-1/4 w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full opacity-25"
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container-custom relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8, ease: "easeOut" }} 
          className="text-center"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 border border-blue-200 dark:border-blue-700 mb-8"
          >
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Live Health Monitoring</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-balance"
          >
            <span className="gradient-text">HealthSync</span>
            <br />
            <span className="text-slate-900 dark:text-white">Smart Healthcare,</span>
            <br />
            <span className="text-slate-700 dark:text-slate-300">Seamlessly Connected</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed text-balance"
          >
            Monitor vitals in real-time, get instant AI health insights, and stay connected with your healthcare team — 
            <span className="font-semibold text-blue-600 dark:text-blue-400"> anytime, anywhere</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Link to="/dashboard" className="btn-primary group">
              <ArrowRightIcon className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" /> 
              Start Monitoring
            </Link>
            <button 
              onClick={() => {
                const chatbotButton = document.querySelector('[aria-label="Open AI Assistant"]');
                if (chatbotButton) {
                  chatbotButton.click();
                }
              }}
              className="btn-outline group"
            >
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" /> 
              Talk to AI Assistant
            </button>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="card-hover group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <HeartIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real-time Monitoring</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Continuous Temperature, SpO₂, and Humidity monitoring with IoT-grade reliability and millisecond latency.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="card-hover group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <CpuChipIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Insights</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Advanced predictive analytics powered by CNN, LSTM, and Transformer models for early risk detection.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="card-hover group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Secure Dashboard</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Cloud-synced health history, encrypted storage, and comprehensive alerts for complete peace of mind.
              </p>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">99.9%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">AI-Powered</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Predictions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">Secure</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Cloud Storage</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
