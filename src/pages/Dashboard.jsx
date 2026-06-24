// src/pages/Dashboard.jsx
// HealthSync Health Monitoring Dashboard
// Sensors: Temperature, Oxygen (SpO2), Humidity
// Backend: Supabase (with demo-mode simulation fallback)

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import VitalCard from '../components/VitalCard.jsx';
import TemperatureChart from '../components/charts/TemperatureChart.jsx';
import OxygenChart from '../components/charts/OxygenChart.jsx';
import HumidityChart from '../components/charts/HumidityChart.jsx';
import HeartRateChart from '../components/charts/HeartRateChart.jsx';
import healthDataService from '../services/healthDataService';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SunIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CloudIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  BellAlertIcon,
  CpuChipIcon,
  CheckCircleIcon,
  UserCircleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

import { aiService } from '../services/aiService';
import { useTranslation } from 'react-i18next';

// ─── Icon Helper ────────────────────────────────────────────────
function getSensorIcon(sensorName) {
  if (sensorName?.toLowerCase().includes('temp')) return SunIcon;
  if (sensorName?.toLowerCase().includes('oxy') || sensorName?.toLowerCase().includes('spo2')) return ShieldCheckIcon;
  if (sensorName?.toLowerCase().includes('humid')) return CloudIcon;
  if (sensorName?.toLowerCase().includes('heart') || sensorName?.toLowerCase().includes('hr') || sensorName?.toLowerCase().includes('bpm')) return HeartIcon;
  return CpuChipIcon;
}

// ─── Component ──────────────────────────────────────────────────
export default function Dashboard() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [points, setPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiData, setAiData] = useState({
    healthStatus: 'Normal',
    summary: 'Analyzing recent sensor data...',
    insights: [],
    alerts: []
  });
  const intervalRef = useRef(null);

  const [simulatedHr, setSimulatedHr] = useState(72);
  const [hrData, setHrData] = useState([]);

  // Simulated Heart Rate Effect
  useEffect(() => {
    const initialData = Array.from({ length: 30 }, (_, i) => ({
      t: i,
      hr: Math.floor(Math.random() * (85 - 72 + 1)) + 72
    }));
    setHrData(initialData);
    setSimulatedHr(initialData[initialData.length - 1].hr);

    const interval = setInterval(() => {
      const nextHr = Math.floor(Math.random() * (85 - 72 + 1)) + 72;
      setSimulatedHr(nextHr);
      setHrData(prev => {
        const updated = [...prev, { t: prev.length ? prev[prev.length - 1].t + 1 : 0, hr: nextHr }];
        return updated.length > 50 ? updated.slice(-50) : updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshAIInsights = useCallback(async (dataPoints) => {
    if (!aiService.isConfigured || !dataPoints || dataPoints.length === 0) return;
    setIsAILoading(true);
    try {
      const data = await aiService.getHealthInsights(dataPoints);
      if (data) setAiData(data);
    } catch (err) {
      console.error("AI Insights Error:", err);
    } finally {
      setIsAILoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const result = await healthDataService.getSensorData(30);
      if (result.success) {
        setPoints(result.data);
        refreshAIInsights(result.data);
      }
      setIsLoading(false);
    };
    load();
  }, [refreshAIInsights]);

  // Supabase real-time subscription
  useEffect(() => {
    const unsub = healthDataService.subscribeToSensorData((newPoint) => {
      setPoints(prev => {
        const updated = [...prev, { ...newPoint, t: prev.length }];
        return updated.length > 50 ? updated.slice(-50) : updated;
      });
      setLastUpdate(new Date());
    });
    return unsub;
  }, []);

  // Auto-refresh: simulated readings every 3 seconds
  useEffect(() => {
    if (!autoRefresh) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(async () => {
      const newReading = await healthDataService.addSensorReading(points);
      setPoints(prev => {
        const updated = [...prev, { ...newReading, t: prev.length }];
        return updated.length > 50 ? updated.slice(-50) : updated;
      });
      setLastUpdate(new Date());
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, points.length]);

  const manualRefresh = async () => {
    const result = await healthDataService.getSensorData(30);
    if (result.success) {
      setPoints(result.data);
      setLastUpdate(new Date());
    }
  };

  const handleRefreshAI = () => {
    refreshAIInsights(points);
  };

  const latest = points[points.length - 1];

  // Overall health status from AI
  const healthStatus = aiData.healthStatus || 'Normal';

  const avgTemp = useMemo(() => points.length ? (points.reduce((s, p) => s + p.temp, 0) / points.length).toFixed(1) : 0, [points]);
  const avgO2 = useMemo(() => points.length ? Math.round(points.reduce((s, p) => s + p.o2, 0) / points.length) : 0, [points]);
  const avgHumidity = useMemo(() => points.length ? Math.round(points.reduce((s, p) => s + p.humidity, 0) / points.length) : 0, [points]);

  const tempTrend = useMemo(() => {
    if (points.length < 2) return 'stable';
    const recent = points.slice(-5);
    const avg = recent.reduce((s, p) => s + p.temp, 0) / recent.length;
    if (latest.temp > avg + 0.2) return 'up';
    if (latest.temp < avg - 0.2) return 'down';
    return 'stable';
  }, [points, latest]);

  const aiInsights = aiData.insights || [];
  const activeAlerts = aiData.alerts || [];

  const displayName = user?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="container-custom">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-72" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-slate-200 dark:bg-slate-700 rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container-custom">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.welcome', { defaultValue: 'Welcome back' })},</p>
                  <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-3">
                {t('dashboard.title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                {t('dashboard.subtitle')}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {autoRefresh && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  {t('dashboard.live', { defaultValue: 'Live' })}
                </div>
              )}
              <button
                onClick={() => setAutoRefresh(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  autoRefresh
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {autoRefresh ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                {autoRefresh ? t('dashboard.pause', { defaultValue: 'Pause' }) : t('dashboard.startLive', { defaultValue: 'Start Live' })}
              </button>
              <button
                onClick={manualRefresh}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Refresh data"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleRefreshAI}
                disabled={isAILoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-all disabled:opacity-50"
              >
                <CpuChipIcon className={`h-4 w-4 ${isAILoading ? 'animate-spin' : ''}`} />
                {isAILoading ? t('dashboard.analyzing', { defaultValue: 'Analyzing...' }) : t('dashboard.refreshAi', { defaultValue: 'Refresh AI' })}
              </button>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
              >
                {t('dashboard.logout', { defaultValue: 'Logout' })}
              </button>
            </div>
          </div>

          {/* Last update */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-3">
            <ClockIcon className="h-3.5 w-3.5" />
            {t('dashboard.lastUpdate', { defaultValue: 'Last updated:' })} {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </motion.div>

        {/* ── Emergency Alerts Banner ── */}
        <AnimatePresence>
          {activeAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className={`rounded-2xl p-4 border-2 ${
                activeAlerts.some(a => a.severity === 'critical')
                  ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-700'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-700'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <BellAlertIcon className={`h-6 w-6 ${
                    activeAlerts.some(a => a.severity === 'critical') ? 'text-rose-600' : 'text-amber-600'
                  } animate-pulse`} />
                  <span className={`font-bold text-lg ${
                    activeAlerts.some(a => a.severity === 'critical') ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300'
                  }`}>
                    {activeAlerts.some(a => a.severity === 'critical') ? '🚨 ' + t('dashboard.emergency', { defaultValue: 'Emergency Alert' }) : '⚠️ ' + t('dashboard.healthWarning', { defaultValue: 'Health Warning' })}
                  </span>
                </div>
                <div className="space-y-1">
                  {activeAlerts.map((alert, i) => (
                    <p key={i} className={`text-sm font-medium ${
                      alert.severity === 'critical' ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300'
                    }`}>
                      {alert.msg}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Overall Status Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <div className={`card p-4 sm:p-5 ${
            healthStatus === 'Critical' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' :
            healthStatus === 'Warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
            'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
          }`}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                healthStatus === 'Critical' ? 'bg-rose-500' :
                healthStatus === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}>
                {healthStatus === 'Normal'
                  ? <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  : <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.healthStatus')}</p>
                <p className={`text-lg sm:text-xl font-bold ${
                  healthStatus.toLowerCase() === 'critical' ? 'text-rose-600 dark:text-rose-400' :
                  healthStatus.toLowerCase() === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                  'text-emerald-600 dark:text-emerald-400'
                }`}>{healthStatus}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {aiData.summary}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center mt-4 pt-4 border-t border-current/10">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.avgTemp', { defaultValue: 'Avg Temp' })}</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{avgTemp}°C</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.avgO2', { defaultValue: 'Avg SpO₂' })}</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{avgO2}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.avgHumidity', { defaultValue: 'Avg Humidity' })}</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{avgHumidity}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Vital Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {/* Temperature */}
          <VitalCard
            label={t('dashboard.temp')}
            value={latest?.temp ?? '—'}
            unit="°C"
            icon={SunIcon}
            trend={tempTrend}
            status={!latest ? 'default' : latest.temp > 38.5 ? 'warning' : latest.temp > 37.5 ? 'medium' : 'normal'}
          />
          {/* Oxygen */}
          <VitalCard
            label={t('dashboard.spO2')}
            value={latest?.o2 ?? '—'}
            unit="%"
            icon={ShieldCheckIcon}
            status={!latest ? 'default' : latest.o2 < 90 ? 'warning' : latest.o2 < 95 ? 'medium' : 'normal'}
          />
          {/* Humidity */}
          <VitalCard
            label={t('dashboard.humidity')}
            value={latest?.humidity ?? '—'}
            unit="%"
            icon={CloudIcon}
            status={!latest ? 'default' : (latest.humidity > 70 || latest.humidity < 30) ? 'medium' : 'normal'}
          />
          {/* Heart Rate (Simulated) */}
          <VitalCard
            label={t('dashboard.heartRate', { defaultValue: 'Heart Rate' })}
            value={simulatedHr}
            unit="BPM"
            icon={HeartIcon}
            status={simulatedHr < 60 ? 'Low' : simulatedHr > 100 ? 'High' : 'Normal'}
          />
        </motion.div>

        {/* ── Charts ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 overflow-x-hidden"
        >
          <TemperatureChart data={points} />
          <OxygenChart data={points} />
          <HumidityChart data={points} />
          <HeartRateChart data={hrData} />
        </motion.div>

        {/* ── AI Health Insights ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white flex items-center justify-center">
              <CpuChipIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.aiInsight')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.aiInsightSub', { defaultValue: 'Powered by real-time sensor analysis' })}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isAILoading ? (
              <div className="col-span-full flex justify-center py-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : aiInsights.length > 0 ? (
              aiInsights.map((insight, i) => {
                const Icon = getSensorIcon(insight.sensor);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-start gap-3 p-4 rounded-2xl ${
                      insight.type === 'critical' ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800' :
                      insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' :
                      'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      insight.type === 'critical' ? 'bg-rose-500' :
                      insight.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className={`text-sm font-medium leading-relaxed ${
                      insight.type === 'critical' ? 'text-rose-700 dark:text-rose-300' :
                      insight.type === 'warning' ? 'text-amber-700 dark:text-amber-300' :
                      'text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {insight.text}
                    </p>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-slate-500 text-sm">{t('dashboard.noInsights', { defaultValue: 'No insights available right now.' })}</p>
            )}
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          {[
            { label: t('dashboard.dataPoints', { defaultValue: 'Data Points' }), value: points.length, sub: t('dashboard.sensorReadings', { defaultValue: 'sensor readings' }) },
            { label: t('dashboard.avgTemp', { defaultValue: 'Avg Temp' }), value: `${avgTemp}°C`, sub: 'DS18B20' },
            { label: t('dashboard.avgO2', { defaultValue: 'Avg SpO₂' }), value: `${avgO2}%`, sub: t('dashboard.pulseOximeter', { defaultValue: 'Pulse Oximeter' }) },
            { label: t('dashboard.avgHumidity', { defaultValue: 'Avg Humidity' }), value: `${avgHumidity}%`, sub: 'DHT22' },
          ].map((stat, i) => (
            <div key={i} className="card text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{stat.sub}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
