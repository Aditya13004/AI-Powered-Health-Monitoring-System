// src/contexts/AuthContext.jsx
// Provides Supabase Auth state across the entire app

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode: check localStorage for demo auth
      const demoAuth = localStorage.getItem('hs_demo_auth');
      if (demoAuth) {
        try {
          const parsed = JSON.parse(demoAuth);
          setUser(parsed);
        } catch {}
      }
      setLoading(false);
      return;
    }

    // Get current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async ({ email, password, name }) => {
    if (!isSupabaseConfigured) {
      // Demo mode signup
      const demoUser = { id: 'demo-' + Date.now(), email, name, isDemoUser: true };
      localStorage.setItem('hs_demo_auth', JSON.stringify(demoUser));
      setUser(demoUser);
      return { data: demoUser, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });
    return { data, error };
  };

  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured) {
      // Demo mode login - accept any credentials
      const demoUser = { id: 'demo-user', email, name: email.split('@')[0], isDemoUser: true };
      localStorage.setItem('hs_demo_auth', JSON.stringify(demoUser));
      setUser(demoUser);
      return { data: demoUser, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('hs_demo_auth');
      localStorage.removeItem('hs_auth'); // legacy
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isConfigured: isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
