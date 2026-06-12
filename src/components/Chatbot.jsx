// src/components/Chatbot.jsx
// HealthSync AI Assistant — improved UI, Voice Assistant (STT & TTS), 3-sensor context

import React, { useEffect, useRef, useState } from 'react';
import { 
  PaperAirplaneIcon, 
  XMarkIcon, 
  SparklesIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import { MicrophoneIcon as MicrophoneIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';
import healthDataService from '../services/healthDataService';
import { useTranslation } from 'react-i18next';

export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: t('chatbot.defaultMsg') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Update voice language when app language changes
  useEffect(() => {
    if (recognitionRef.current) {
      const langMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
      recognitionRef.current.lang = langMap[i18n.language] || 'en-IN';
    }
  }, [i18n.language]);

  // Handle URL hash to open chatbot
  useEffect(() => {
    if (window.location.hash === '#ai-assistant') setOpen(true);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // TTS Output
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
    utterance.lang = langMap[i18n.language] || 'en-IN';
    
    // Slight adjustments for more natural voice depending on OS/Browser
    utterance.rate = 1;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Your browser does not support Speech Recognition.");
      }
    }
  };

  const streamAssistant = async (userMessage) => {
    setIsLoading(true);
    try {
      setMessages((prev) => [...prev, { role: 'bot', content: '' }]);

      let currentReadings = null;
      const result = await healthDataService.getSensorData(1);
      if (result.success && result.data.length > 0) {
        currentReadings = result.data[0];
      }

      const chatHistory = messages.filter((m, i) => i !== 0 && m.content.trim() !== '');
      
      const chatSession = await aiService.startChat(chatHistory, currentReadings);
      const resultCall = await chatSession.sendMessage(userMessage);
      const fullResponse = resultCall.response.text();

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = fullResponse;
        return newMessages;
      });

      if (autoSpeak) {
        speakText(fullResponse);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg = err?.message?.includes('API key') 
        ? '⚠️ Invalid API key. Please check your VITE_GROQ_API_KEY in .env.'
        : err?.message?.includes('quota') || err?.message?.includes('429')
        ? '⚠️ API quota exceeded. Please wait a moment and try again.'
        : `API Error: ${err?.message || "Unknown error occurred"}`;
        
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'bot' && !updated[lastIndex].content) {
          updated[lastIndex] = { ...updated[lastIndex], content: errMsg };
        } else {
          updated.push({ role: 'bot', content: errMsg });
        }
        return updated;
      });
      if (autoSpeak) speakText(errMsg);
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

  // Stop audio and listening when closing
  const handleClose = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!open && (
        <button
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-[9999] bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-full shadow-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center hover:scale-105 transition-transform duration-300"
          onClick={() => setOpen(true)}
          aria-label="Open AI Assistant"
        >
          <SparklesIcon className="h-7 w-7" />
        </button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-24px)] max-w-[380px] glass-strong rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/40 dark:border-slate-700/80 backdrop-blur-2xl"
            style={{ maxHeight: '560px', height: '80vh' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/20 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/60 backdrop-blur-md relative z-10 shadow-sm">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-inner">
                <SparklesIcon className="h-5 w-5 text-white" />
                <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[15px] text-slate-900 dark:text-white flex items-center gap-2">
                  {t('chatbot.title')}
                  <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Online</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{t('chatbot.subtitle')}</p>
              </div>
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`p-1.5 rounded-full transition-all ${autoSpeak ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'hover:bg-slate-200/60 text-slate-400 dark:hover:bg-slate-700'}`}
                title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
              >
                {autoSpeak ? <SpeakerWaveIcon className="h-5 w-5" /> : <SpeakerXMarkIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                aria-label="Close chat"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/20" style={{ minHeight: 0 }}>
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group items-end gap-2`}>
                  
                  {/* Bot Avatar beside message */}
                  {m.role === 'bot' && !isLoading && m.content && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm mb-0.5">
                       <SparklesIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}

                  <div className={`relative rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-br-sm shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-sm'
                  }`}>
                    {m.content || (m.role === 'bot' && isLoading ? (
                      <div className="flex gap-1.5 items-center py-2 px-1">
                        <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-teal-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : '')}
                  </div>

                  {/* Speaker Button for individual bot messages */}
                  {m.role === 'bot' && !isLoading && m.content && !autoSpeak && (
                     <button 
                       onClick={() => speakText(m.content)}
                       className="p-1.5 rounded-full text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 mb-0.5"
                       title="Read aloud"
                     >
                       <SpeakerWaveIcon className="h-4 w-4" />
                     </button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/40 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/70 backdrop-blur-md">
              <form onSubmit={onSubmit} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  title="Voice Input"
                  className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
                    isListening 
                      ? 'bg-rose-100 text-rose-500 animate-pulse shadow-inner' 
                      : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {isListening ? <MicrophoneIconSolid className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
                </button>
                <input
                  className="flex-1 rounded-xl border border-slate-200/80 dark:border-slate-600/80 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all shadow-sm"
                  placeholder={isListening ? "Listening..." : t('chatbot.placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary rounded-xl px-3 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-md flex-shrink-0"
                  type="submit"
                  disabled={isLoading || (!input.trim() && !isListening)}
                  aria-label="Send message"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
