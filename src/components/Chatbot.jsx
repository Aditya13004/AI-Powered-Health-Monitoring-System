// src/components/Chatbot.jsx
// HealthSync AI Assistant — improved UI, 3-sensor context

import React, { useEffect, useRef, useState } from 'react';
import { PaperAirplaneIcon, XMarkIcon, ChatBubbleBottomCenterTextIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';
import healthDataService from '../services/healthDataService';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hi! I'm the HealthSync AI Assistant 🏥\nAsk me about your Temperature, SpO₂, or Humidity readings!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (window.location.hash === '#ai-assistant') setOpen(true);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const streamAssistant = async (userMessage) => {
    setIsLoading(true);
    try {
      setMessages((prev) => [...prev, { role: 'bot', content: '' }]);

      let currentReadings = null;
      const result = await healthDataService.getSensorData(1);
      if (result.success && result.data.length > 0) {
        currentReadings = result.data[0];
      }

      // Filter out the first hardcoded bot greeting and any empty loading messages
      const chatHistory = messages.filter((m, i) => i !== 0 && m.content.trim() !== '');
      
      const chatSession = await aiService.startChat(chatHistory, currentReadings);
      const resultCall = await chatSession.sendMessage(userMessage);
      const fullResponse = resultCall.response.text();

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = fullResponse;
        return newMessages;
      });
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'bot' && !updated[lastIndex].content) {
          updated[lastIndex] = { ...updated[lastIndex], content: "I'm having trouble reaching the AI service right now. Please check your API key." };
        } else {
          updated.push({ role: 'bot', content: "I'm having trouble reaching the AI service right now. Please check your API key." });
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    await streamAssistant(text);
  };

  return (
    <>
      {/* FAB button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 btn-primary rounded-full shadow-xl w-14 h-14 flex items-center justify-center"
        onClick={() => setOpen(true)}
        aria-label="Open AI Assistant"
      >
        <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm glass-strong rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/20 dark:border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-teal-600/10">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white">HealthSync AI</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Smart health assistant</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Close chat"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 shadow-soft'
                  }`}>
                    {m.content || (m.role === 'bot' && isLoading ? (
                      <div className="flex gap-1 items-center py-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : '')}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/20 dark:border-slate-700/50">
              <form onSubmit={onSubmit} className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="Ask about your vitals..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary rounded-xl px-3 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
