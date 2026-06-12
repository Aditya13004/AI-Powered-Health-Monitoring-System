// src/components/Navbar.jsx
// HealthSync Navigation — Supabase Auth + fixed alignment

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/', key: 'home', exact: true },
  { to: '/features', key: 'features' },
  { to: '/how-it-works', key: 'howItWorks' },
  { to: '/dashboard', key: 'dashboard' },
  { to: '/appointments', key: 'appointments' },
  { to: '/ocr', key: 'ocrScanner' },
  { to: '/contact', key: 'contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Persist dark mode preference
    return localStorage.getItem('hs_dark') === 'true';
  });
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hs_dark', darkMode);
  }, [darkMode]);

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  const linkCls = ({ isActive }) =>
    `px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap ${
      isActive
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-soft'
        : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`;

  const displayName = user?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-700/50 shadow-soft-lg'
          : 'bg-white/70 dark:bg-slate-900/70 border-white/20 dark:border-slate-700/20'
      }`}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <motion.div
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-base">H</span>
            </motion.div>
            <span className="font-extrabold text-base sm:text-xl tracking-tight gradient-text group-hover:scale-105 transition-transform duration-300">
              HealthSync
            </span>
          </Link>

          {/* Desktop Navigation — centered */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={linkCls}
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

            {/* Auth buttons — desktop */}
            {!loading && (
              <>
                {user ? (
                  <div className="hidden lg:flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                      {t('nav.hi')}, {displayName}
                    </span>
                    <Link to="/dashboard" className="btn-primary text-sm px-4 py-2">
                      {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                    >
                      Login
                    </Link>
                    <Link to="/signup" className="btn-primary text-sm px-4 py-2">
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Language Switcher */}
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="p-1 rounded-lg text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="mr">MR</option>
            </select>

            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </motion.button>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <XMarkIcon className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Bars3Icon className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden border-t border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg"
          >
            <div className="px-4 py-5 space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {t(`nav.${item.key}`)}
                  </NavLink>
                </motion.div>
              ))}

              {/* Mobile auth */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                {user ? (
                  <>
                    <p className="text-sm text-slate-500 dark:text-slate-400 px-3">{t('nav.hi')}, {displayName}</p>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-primary w-full justify-center text-sm">
                      {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      Login
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary w-full justify-center text-sm">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
