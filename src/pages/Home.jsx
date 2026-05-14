import React from 'react';
import Hero from '../components/Hero.jsx';
import FeatureCard from '../components/FeatureCard.jsx';
import { HeartIcon, CpuChipIcon, ShieldCheckIcon, ChartBarIcon, ChatBubbleLeftRightIcon, CloudIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const features = [
  {
    icon: HeartIcon,
    title: "Real-time Vitals",
    desc: "Continuous Temperature, Oxygen, and Humidity monitoring with IoT-grade reliability and instant health insights.",
    delay: 0.1
  },
  {
    icon: CpuChipIcon,
    title: "Predictive AI",
    desc: "Advanced CNN, LSTM, and Transformer models that estimate risk and trends early, providing proactive health management.",
    delay: 0.2
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure Cloud",
    desc: "Enterprise-grade encrypted storage and access controls ensuring your health data remains private and secure.",
    delay: 0.3
  }
];

const additionalFeatures = [
  {
    icon: ChartBarIcon,
    title: "Advanced Analytics",
    desc: "Comprehensive health trend analysis with predictive modeling and personalized insights.",
    delay: 0.1
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "AI Assistant",
    desc: "Intelligent chatbot powered by RAG technology to answer health questions and provide guidance.",
    delay: 0.2
  },
  {
    icon: CloudIcon,
    title: "Cloud Integration",
    desc: "Seamless synchronization across all devices with real-time data backup and recovery.",
    delay: 0.3
  }
];

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* Main Features Section */}
      <section className="section-padding bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 border border-blue-200 dark:border-blue-700 mb-6">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Core Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Why Choose <span className="gradient-text">HealthSync</span>?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Experience the future of healthcare with our cutting-edge technology that puts your health monitoring in your hands.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
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
      </section>

      {/* Additional Features Section */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              More Powerful Features
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Discover additional capabilities that make HealthSync the complete health monitoring solution.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-teal-600/90"></div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h3 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Transform Your Health Monitoring?
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust HealthSync for their health monitoring needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl shadow-soft-lg hover:shadow-glow hover:scale-105 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Now
              </motion.a>
              <motion.a
                href="/features"
                className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
