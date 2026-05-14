import React from 'react';
import FlowDiagram from '../components/FlowDiagram.jsx';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  CpuChipIcon, 
  CloudIcon, 
  ChatBubbleLeftRightIcon, 
  HomeModernIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const steps = [
  {
    icon: HeartIcon,
    title: "Data Collection",
    description: "IoT sensors continuously capture Temperature, SpO₂, and Humidity with medical-grade precision.",
    details: "Advanced sensors provide real-time monitoring with millisecond latency and 99.9% accuracy."
  },
  {
    icon: CpuChipIcon,
    title: "Edge Processing",
    description: "ESP32 microcontroller processes and encrypts data locally before secure transmission.",
    details: "Local processing ensures data privacy and reduces bandwidth requirements while maintaining security."
  },
  {
    icon: CloudIcon,
    title: "Cloud AI Analysis",
    description: "Advanced AI models (CNN, LSTM, Transformer) analyze patterns and predict health trends.",
    details: "Machine learning algorithms detect anomalies and provide early warning systems for potential health issues."
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "AI Assistant",
    description: "RAG-powered chatbot provides contextual insights and answers health-related questions.",
    details: "Natural language processing makes complex medical data accessible through conversational AI."
  },
  {
    icon: HomeModernIcon,
    title: "Dashboard Visualization",
    description: "Real-time dashboard displays trends, alerts, and comprehensive health analytics.",
    details: "Interactive charts and graphs help users understand their health patterns and make informed decisions."
  }
];

export default function HowItWorks() {
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
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">How It Works</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            How <span className="gradient-text">HealthSync</span> Works
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Our end-to-end pipeline delivers continuous care through cutting-edge technology, 
            from data collection to actionable insights.
          </p>
        </motion.div>

        {/* Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="card text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
              Data Flow Pipeline
            </h2>
            <FlowDiagram />
          </div>
        </motion.div>

        {/* Detailed Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Step {index + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {step.description}
                </p>
                <p className="text-slate-500 dark:text-slate-500">
                  {step.details}
                </p>
              </div>
              
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="card-hover group">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <step.icon className="h-16 w-16 text-blue-500 dark:text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {step.title}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Step {index + 1} of 5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20"
        >
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Complete Process Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Technical Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-teal-600/90"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4" />
                  <div className="text-2xl font-bold mb-2">Privacy-first</div>
                  <div className="text-blue-100">Data Protection</div>
                </div>
                <div className="text-center">
                  <ClockIcon className="h-12 w-12 mx-auto mb-4" />
                  <div className="text-2xl font-bold mb-2">&lt;100ms</div>
                  <div className="text-blue-100">Response Time</div>
                </div>
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-4" />
                  <div className="text-2xl font-bold mb-2">99.9%</div>
                  <div className="text-blue-100">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
