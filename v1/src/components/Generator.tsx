import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES } from '@lib/themes';
import { TRANSLATIONS } from '@lib/translations';
import { Copy, Check, ExternalLink, Flame, Settings, Palette, Globe, Eye } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Generator() {
  const [username, setUsername] = useState('dyzulk');
  const [theme, setTheme] = useState('default');
  const [locale, setLocale] = useState('en');
  const [mode, setMode] = useState('daily');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const badgeUrl = useMemo(() => {
    const url = new URL(`${baseUrl}/${username}`);
    if (theme !== 'default') url.searchParams.set('theme', theme);
    if (locale !== 'en') url.searchParams.set('locale', locale);
    if (mode !== 'daily') url.searchParams.set('mode', mode);
    return url.toString();
  }, [username, theme, locale, mode, baseUrl]);

  const markdownCode = `[![GitHub Streak](${badgeUrl})](https://git.io/streak-stats)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themes = Object.keys(THEMES);
  const locales = Object.keys(TRANSLATIONS).filter(k => typeof TRANSLATIONS[k] !== 'string');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <Settings size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">Configurator</h2>
            </div>

            <div className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">GitHub Username</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl px-5 py-4 text-white transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-600"
                    placeholder="e.g. dyzulk"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    @
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1 flex items-center gap-2">
                    <Palette size={14} /> Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-4 text-white transition-all outline-none"
                  >
                    {themes.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Locale Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1 flex items-center gap-2">
                    <Globe size={14} /> Locale
                  </label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-4 text-white transition-all outline-none"
                  >
                    {locales.map(l => (
                      <option key={l} value={l}>{l.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Calculation Mode</label>
                <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setMode('daily')}
                    className={cn(
                      "flex-1 py-3 rounded-xl transition-all text-sm font-medium",
                      mode === 'daily' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setMode('weekly')}
                    className={cn(
                      "flex-1 py-3 rounded-xl transition-all text-sm font-medium",
                      mode === 'weekly' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    Weekly
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl">
            <h3 className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Check size={16} /> Result Markdown
            </h3>
            <div className="relative">
              <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {markdownCode}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95"
              >
                {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 space-y-6 lg:sticky lg:top-8"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400">
                  <Eye size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Live Preview</h2>
              </div>
              <a 
                href={badgeUrl} 
                target="_blank" 
                className="p-2 text-slate-500 hover:text-white transition-colors"
                title="Open in new tab"
              >
                <ExternalLink size={20} />
              </a>
            </div>

            <div className="flex justify-center items-center min-h-[250px] bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 p-8 group-hover:border-indigo-500/30 transition-colors">
              <AnimatePresence mode="wait">
                <motion.div
                  key={badgeUrl}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <img
                    src={badgeUrl}
                    alt="Streak Stats"
                    className="max-w-full h-auto rounded-lg shadow-2xl ring-1 ring-white/10"
                    onLoad={() => setIsLoading(false)}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex gap-4 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live Engine
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 uppercase">
                {mode}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 uppercase">
                {theme}
              </div>
            </div>
            
            {/* Background Decor */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -z-10 group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                <Flame size={24} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">Fast</div>
                <div className="text-slate-500 text-sm italic">Edge optimized</div>
              </div>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <Globe size={24} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">Global</div>
                <div className="text-slate-500 text-sm italic">Cloudflare Network</div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
