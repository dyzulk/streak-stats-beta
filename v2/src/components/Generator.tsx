import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES } from '@lib/themes';
import { TRANSLATIONS } from '@lib/translations';
import * as Lucide from 'lucide-react';
const { Copy, Check, ExternalLink, Flame, Globe, Settings, Palette, Eye, Type, Maximize2, Shield } = (Lucide as any).default || Lucide;

import { Card, Button, Select, Input } from './ui';

export default function Generator() {
  const [params, setParams] = useState({
    username: 'dyzulk',
    theme: 'default',
    locale: 'en',
    mode: 'daily',
    hide_border: false,
    border_radius: 4.5,
    short_numbers: false,
    hide_total_contributions: false,
    hide_current_streak: false,
    hide_longest_streak: false,
    card_width: 495,
    card_height: 195,
    date_format: '',
    exclude_days: '',
    // Colors
    background: '',
    border: '',
    stroke: '',
    ring: '',
    fire: '',
    currStreakNum: '',
    sideNums: '',
    currStreakLabel: '',
    sideLabels: '',
    dates: '',
    excludeDaysLabel: '',
  });
  
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const badgeUrl = useMemo(() => {
    const query = new URLSearchParams();
    
    // Core params
    if (params.theme !== 'default') query.set('theme', params.theme);
    if (params.locale !== 'en') query.set('locale', params.locale);
    if (params.mode !== 'daily') query.set('mode', params.mode);
    
    // Booleans
    if (params.hide_border) query.set('hide_border', 'true');
    if (params.short_numbers) query.set('short_numbers', 'true');
    if (params.hide_total_contributions) query.set('hide_total_contributions', 'true');
    if (params.hide_current_streak) query.set('hide_current_streak', 'true');
    if (params.hide_longest_streak) query.set('hide_longest_streak', 'true');
    
    // Numbers
    if (params.border_radius !== 4.5) query.set('border_radius', params.border_radius.toString());
    if (params.card_width !== 495) query.set('card_width', params.card_width.toString());
    if (params.card_height !== 195) query.set('card_height', params.card_height.toString());
    
    // Text
    if (params.date_format) query.set('date_format', params.date_format);
    if (params.exclude_days) query.set('exclude_days', params.exclude_days);
    
    // Colors
    const colors = [
      'background', 'border', 'stroke', 'ring', 'fire', 
      'currStreakNum', 'sideNums', 'currStreakLabel', 'sideLabels', 'dates', 'excludeDaysLabel'
    ];
    colors.forEach(c => {
      const val = (params as any)[c];
      if (val) query.set(c, val.replace('#', ''));
    });

    const queryString = query.toString();
    const fullPath = `/${params.username}${queryString ? `?${queryString}` : ''}`;

    if (!baseUrl) return fullPath;
    try {
      return new URL(fullPath, baseUrl).toString();
    } catch (e) {
      return fullPath;
    }
  }, [params, baseUrl]);

  const markdownCode = `[![GitHub Streak](${badgeUrl})](https://git.io/streak-stats)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateParam = (key: string, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const themeOptions = Object.keys(THEMES).map(t => ({
    label: t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' '),
    value: t
  }));

  const localeOptions = Object.keys(TRANSLATIONS)
    .filter(k => typeof TRANSLATIONS[k] !== 'string')
    .map(l => ({
      label: l.toUpperCase(),
      value: l
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Properties */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-8 bg-zinc-950/40 backdrop-blur-md border-zinc-900">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
              <Settings size={18} className="text-indigo-400" />
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Configuration</h2>
            </div>

            <div className="space-y-6">
              {/* Basic Section */}
              <div className="space-y-4">
                <Input
                  label="GitHub Username"
                  value={params.username}
                  onChange={(e) => updateParam('username', e.target.value)}
                  placeholder="e.g. dyzulk"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Theme"
                    options={themeOptions}
                    value={params.theme}
                    onChange={(v) => updateParam('theme', v)}
                  />
                  <Select
                    label="Locale"
                    options={localeOptions}
                    value={params.locale}
                    onChange={(v) => updateParam('locale', v)}
                  />
                </div>
              </div>

              {/* Layout Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <Maximize2 size={14} className="text-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Layout & Sizing</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Card Width"
                    type="number"
                    value={params.card_width}
                    onChange={(e) => updateParam('card_width', parseInt(e.target.value) || 0)}
                  />
                  <Input
                    label="Card Height"
                    type="number"
                    value={params.card_height}
                    onChange={(e) => updateParam('card_height', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Border Radius"
                    type="number"
                    step="0.5"
                    value={params.border_radius}
                    onChange={(e) => updateParam('border_radius', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    label="Exclude Days"
                    value={params.exclude_days}
                    onChange={(e) => updateParam('exclude_days', e.target.value)}
                    placeholder="e.g. Sat,Sun"
                  />
                </div>
                <div className="w-full">
                  <Input
                    label="Date Format"
                    value={params.date_format}
                    onChange={(e) => updateParam('date_format', e.target.value)}
                    placeholder="e.g. M j[, Y]"
                  />
                </div>
              </div>

              {/* Visibility Section */}
              <div className="space-y-3 pt-4 border-t border-zinc-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={14} className="text-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visibility & Options</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: 'Hide Border', key: 'hide_border' },
                    { label: 'Short Numbers', key: 'short_numbers' },
                    { label: 'Hide Total', key: 'hide_total_contributions' },
                    { label: 'Hide Current', key: 'hide_current_streak' },
                    { label: 'Hide Longest', key: 'hide_longest_streak' },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => updateParam(opt.key, !(params as any)[opt.key])}
                        className={`w-8 h-4 rounded-full transition-colors relative ${
                          (params as any)[opt.key] ? 'bg-indigo-500' : 'bg-zinc-800'
                        }`}
                      >
                        <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${
                          (params as any)[opt.key] ? 'left-5' : 'left-1'
                        }`} />
                      </div>
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <Palette size={14} className="text-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Color Overrides</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Background', key: 'background' },
                    { label: 'Border', key: 'border' },
                    { label: 'Ring', key: 'ring' },
                    { label: 'Fire', key: 'fire' },
                    { label: 'Current Streak Num', key: 'currStreakNum' },
                    { label: 'Side Nums', key: 'sideNums' },
                    { label: 'Dates', key: 'dates' },
                    { label: 'Stroke', key: 'stroke' },
                  ].map(c => (
                    <Input
                      key={c.key}
                      label={c.label}
                      value={(params as any)[c.key]}
                      onChange={(e) => updateParam(c.key, e.target.value)}
                      placeholder="e.g. ff0000"
                    />
                  ))}
                  <Input
                    label="Exclude Days Color"
                    value={params.excludeDaysLabel}
                    onChange={(e) => updateParam('excludeDaysLabel', e.target.value)}
                    placeholder="e.g. ff0000"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Preview & Markdown */}
        <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-8">
          {/* Preview Card */}
          <Card className="p-6 border-zinc-900 bg-zinc-950/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Eye size={18} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Live Preview</h2>
              </div>
              <div className="flex gap-2">
                <div className="flex bg-zinc-900/50 p-1 rounded-md border border-zinc-800">
                  <button
                    onClick={() => updateParam('mode', 'daily')}
                    className={`px-3 py-1 rounded-[4px] transition-all text-[10px] font-bold uppercase tracking-wider ${
                      params.mode === 'daily' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => updateParam('mode', 'weekly')}
                    className={`px-3 py-1 rounded-[4px] transition-all text-[10px] font-bold uppercase tracking-wider ${
                      params.mode === 'weekly' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Weekly
                  </button>
                </div>
                <a 
                  href={badgeUrl} 
                  target="_blank" 
                  className="p-2 text-zinc-500 hover:text-white transition-colors bg-zinc-900/50 rounded-md border border-zinc-800"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="flex justify-center items-center min-h-[250px] bg-black/40 rounded-lg border border-zinc-900/50 p-8 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={badgeUrl}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <img
                    src={badgeUrl}
                    alt="Streak Stats"
                    className="max-w-full h-auto shadow-2xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/495x195?text=Invalid+Parameters';
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2.5 py-1 rounded-md border border-zinc-800 text-[10px] text-zinc-500 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE_SYNC
              </div>
              <div className="bg-zinc-900/50 px-2.5 py-1 rounded-md border border-zinc-800 text-[10px] text-zinc-500 font-mono uppercase">
                {params.theme}
              </div>
              <div className="bg-zinc-900/50 px-2.5 py-1 rounded-md border border-zinc-800 text-[10px] text-zinc-500 font-mono uppercase">
                {params.locale}
              </div>
            </div>
          </Card>

          {/* Markdown Card - Moved here */}
          <Card className="p-6 border-zinc-900 bg-zinc-950/40 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Type size={18} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">
                Result Markdown
              </h3>
            </div>
            <div className="space-y-4">
              <div className="relative group">
                <div className="bg-black border border-zinc-900 rounded-md p-4 text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap min-h-[80px] leading-relaxed select-all">
                  {markdownCode}
                </div>
              </div>
              <Button 
                onClick={handleCopy} 
                variant={copied ? 'secondary' : 'primary'}
                className="w-full h-11 gap-2 text-xs uppercase tracking-widest font-bold"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? 'Copied to clipboard' : 'Copy Markdown Code'}
              </Button>
            </div>
          </Card>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg flex items-start gap-3">
            <Shield size={16} className="text-indigo-400 mt-0.5" />
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Streak Forge respects your privacy. All data fetching is performed securely via GitHub's official GraphQL API and cached at the edge for optimal performance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
