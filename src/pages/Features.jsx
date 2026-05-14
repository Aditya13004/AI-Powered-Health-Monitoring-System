import React from 'react';
import FeatureCard from '../components/FeatureCard.jsx';
import { HeartIcon, ChartBarIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon, CpuChipIcon, CloudIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const coreFeatures = [
  { 
    icon: HeartIcon, 
    title: 'Real-time Temperature & Oxygen Monitoring', 
    desc: 'Continuous IoT sensor monitoring — Temperature (DS18B20), Oxygen/SpO₂, and Humidity — with millisecond latency and medical-grade accuracy.',
    delay: 0.1
  },
  { 
    icon: ChartBarIcon, 
    title: 'AI Health Predictions', 
    desc: 'Advanced CNN, LSTM, and Transformer models that forecast health trends and detect anomalies before they become critical.',
    delay: 0.2
  },
  { 
    icon: ChatBubbleLeftRightIcon, 
    title: 'Smart AI Chatbot (RAG)', 
    desc: 'Intelligent conversational AI that answers health questions and provides contextual insights based on your medical data.',
    delay: 0.3
  },
  { 
    icon: ShieldCheckIcon, 
    title: 'Cloud-secured History', 
    desc: 'Enterprise-grade encrypted storage with complete access controls for your longitudinal health data and alerts.',
    delay: 0.4
  },
];

const additionalFeatures = [
  { 
    icon: CpuChipIcon, 
    title: 'Edge Computing', 
    desc: 'Local processing capabilities for real-time analysis without compromising data privacy or requiring constant internet.',
    delay: 0.1
  },
  { 
    icon: CloudIcon, 
    title: 'Multi-Device Sync', 
    desc: 'Seamless synchronization across all your devices with real-time data backup and recovery capabilities.',
    delay: 0.2
  },
];

export default function Features() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 border border-blue-200 dark:border-blue-700 mb-6">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Platform Features</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Powerful <span className="gradient-text">Features</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            A comprehensive medical-tech platform built for trust, performance, and usability. 
            Experience the future of healthcare monitoring.
          </p>
        </motion.div>

        {/* Core Features */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center"
          >
            Core Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon} 
                title={feature.title} 
                desc={feature.desc}
                delay={feature.delay}
              />
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center"
          >
            Advanced Capabilities
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {additionalFeatures.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon} 
                title={feature.title} 
                desc={feature.desc}
                delay={feature.delay}
              />
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-teal-600/90"></div>
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <div className="text-blue-100">Uptime Guarantee</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Monitoring</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">Privacy-first</div>
                <div className="text-blue-100">Data Protection</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
