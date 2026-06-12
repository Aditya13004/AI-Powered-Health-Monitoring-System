import React from 'react';
import FeatureCard from '../components/FeatureCard.jsx';
import { HeartIcon, ChartBarIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon, CpuChipIcon, CloudIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Features() {
  const { t } = useTranslation();

  const coreFeatures = [
    { 
      icon: HeartIcon, 
      title: t('features.feat1'), 
      desc: t('features.feat1Desc'),
      delay: 0.1
    },
    { 
      icon: ChartBarIcon, 
      title: t('features.feat2'), 
      desc: t('features.feat2Desc'),
      delay: 0.2
    },
    { 
      icon: ChatBubbleLeftRightIcon, 
      title: t('features.feat3'), 
      desc: t('features.feat3Desc'),
      delay: 0.3
    },
    {
      icon: LockClosedIcon,
      title: t('features.feat4', { defaultValue: 'Secure Records' }),
      desc: t('features.feat4Desc', { defaultValue: 'All your health data is encrypted and stored securely with HIPAA-aligned practices.' }),
      delay: 0.4
    },
  ];

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
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('features.platformBadge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t('features.title')}
          </h1>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            {t('features.subtitle')}
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
            {t('features.coreFeatures')}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <div className="text-blue-100">{t('features.uptime')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">{t('features.monitoring')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">Privacy-first</div>
                <div className="text-blue-100">{t('features.dataProtection')}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
