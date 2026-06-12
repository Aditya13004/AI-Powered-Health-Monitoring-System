import React from 'react';
import { CpuChipIcon, CloudIcon, ChatBubbleBottomCenterTextIcon, HomeModernIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const Step = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center">
    <div className="h-14 w-14 rounded-2xl bg-white shadow-glass border border-white/40 grid place-items-center">
      <Icon className="h-7 w-7 text-sky-600" />
    </div>
    <span className="mt-2 text-sm font-medium">{label}</span>
  </div>
);

export default function FlowDiagram() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 md:gap-6 flex-wrap justify-center">
      <Step icon={HeartIcon} label={t('flow.sensor', { defaultValue: 'Sensor' })} />
      <span className="text-slate-400">→</span>
      <Step icon={CpuChipIcon} label={t('flow.esp32', { defaultValue: 'ESP32' })} />
      <span className="text-slate-400">→</span>
      <Step icon={CloudIcon} label={t('flow.cloud', { defaultValue: 'Cloud AI' })} />
      <span className="text-slate-400">→</span>
      <Step icon={ChatBubbleBottomCenterTextIcon} label={t('flow.chatbot', { defaultValue: 'Chatbot' })} />
      <span className="text-slate-400">→</span>
      <Step icon={HomeModernIcon} label={t('flow.dashboard', { defaultValue: 'User Dashboard' })} />
    </div>
  );
}
