import React from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground.jsx';
import { ArrowRightIcon, ChatBubbleBottomCenterTextIcon, HeartIcon, CpuChipIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative section-padding overflow-hidden">
      <AnimatedBackground />
      
      {/* Floating Elements — hidden on very small screens to avoid overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full opacity-20"
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-4 sm:right-20 w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full opacity-30"
          animate={{ y: [0, 20, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="hidden sm:block absolute bottom-40 left-1/4 w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full opacity-25"
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
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('hero.badge')}</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-balance leading-tight"
          >
            <span className="gradient-text">{t('hero.title1')}</span>
            <br className="hidden sm:block" />
            <span className="text-slate-900 dark:text-white leading-tight block sm:inline mt-1 sm:mt-0">{t('hero.title2')}</span>
            <br className="hidden sm:block" />
            <span className="text-slate-700 dark:text-slate-300 leading-tight block sm:inline mt-1 sm:mt-0">{t('hero.title3')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 sm:mt-8 text-base sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed text-balance px-2 sm:px-0"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 w-full px-4 sm:px-0"
          >
            <Link to="/dashboard" className="btn-primary group w-full sm:w-auto">
              <ArrowRightIcon className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" /> 
              {t('hero.startBtn')}
            </Link>
            <button 
              onClick={() => {
                const chatbotButton = document.querySelector('[aria-label="Open AI Assistant"]');
                if (chatbotButton) {
                  chatbotButton.click();
                }
              }}
              className="btn-outline group w-full sm:w-auto"
            >
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" /> 
              {t('hero.aiBtn')}
            </button>
            <Link to="/ocr" className="btn-outline group w-full sm:w-auto">
              <DocumentTextIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" /> 
              {t('hero.ocrBtn')}
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto"
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('hero.feat1Title')}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('hero.feat1Desc')}
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('hero.feat2Title')}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('hero.feat2Desc')}
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('hero.feat3Title')}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('hero.feat3Desc')}
              </p>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-12 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">99.9%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('hero.stat1')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">24/7</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('hero.stat2')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">AI-Powered</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('hero.stat3')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">Secure</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('hero.stat4')}</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
