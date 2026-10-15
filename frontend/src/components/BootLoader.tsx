/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BootLoader — branded initial loading screen for the portfolio.
 * Shows the AS monogram with a subtle animated ring and a status line that
 * cycles through 3–4 real-feeling process steps while the profile data loads.
 * The parent (App) drives `step` from real fetch signals with a timed fallback;
 * the loader dismisses as soon as the app is ready (data or error) — never on a
 * fixed long duration, and never with fake percentage counters.
 */
import { useState } from 'react';
import { motion } from 'motion/react';

const STEPS = [
  'Waking up Addy (AI Twin)…',
  'Loading projects & certifications…',
  'Fetching latest blogs…',
  'Polishing the experience…',
];

interface BootLoaderProps {
  /** 0-based index of the current step (0..STEPS.length-1) */
  step: number;
  /** when true, the loader fades out */
  leaving: boolean;
}

export default function BootLoader({ step, leaving }: BootLoaderProps) {
  // Read the saved theme synchronously so the loader matches on first paint.
  const [isDark] = useState(() => {
    try {
      const saved = localStorage.getItem('luxury-portfolio-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
    } catch {
      return true;
    }
  });

  const active = Math.min(Math.max(step, 0), STEPS.length - 1);

  return (
    <motion.div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none ${
        isDark ? 'bg-[#121212] text-white' : 'bg-[#FDFBF7] text-neutral-900'
      }`}
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{ pointerEvents: leaving ? 'none' : 'auto' }}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      {/* Brand mark with animated ring */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Soft glow */}
        <div
          className={`absolute w-36 h-36 rounded-full blur-2xl ${
            isDark ? 'bg-cyan-500/15' : 'bg-[#007AFF]/10'
          } animate-pulse`}
        />
        {/* Rotating dashed ring */}
        <div
          className="absolute w-28 h-28 rounded-full border-2 border-dashed border-cyan-400/40 animate-[spin_6s_linear_infinite]"
          aria-hidden="true"
        />
        {/* Monogram */}
        <div
          className={`relative w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center border shadow-2xl ${
            isDark
              ? 'border-white/10 shadow-cyan-500/20'
              : 'border-black/10 shadow-[#007AFF]/20'
          }`}
        >
          <img
            src="/favicon.png"
            alt="Adarsh Singh"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      </div>

      {/* Name */}
      <div className="text-center mb-8">
        <p className="font-display font-bold tracking-[0.25em] uppercase text-sm">
          Adarsh Singh
        </p>
        <p
          className={`text-[10px] font-mono tracking-[0.3em] uppercase mt-2 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          AI & Data Engineering
        </p>
      </div>

      {/* Process steps */}
      <div className="w-64 sm:w-72">
        <ul className="space-y-2.5">
          {STEPS.map((label, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={`flex items-center justify-center w-4 h-4 rounded-full border text-[8px] transition-all duration-300 ${
                    done
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                      : current
                        ? 'border-cyan-400 text-cyan-400 animate-pulse'
                        : isDark
                          ? 'border-white/15 text-transparent'
                          : 'border-black/15 text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  {done ? '✓' : '•'}
                </span>
                <span
                  className={`text-xs font-mono tracking-wide transition-all duration-300 ${
                    done
                      ? isDark
                        ? 'text-slate-500 line-through decoration-cyan-400/40'
                        : 'text-slate-400 line-through decoration-[#007AFF]/40'
                      : current
                        ? isDark
                          ? 'text-slate-100'
                          : 'text-neutral-900'
                        : isDark
                          ? 'text-slate-600'
                          : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Indeterminate progress bar — motion, not a fake percentage */}
        <div
          className={`mt-6 h-[3px] rounded-full overflow-hidden ${
            isDark ? 'bg-white/10' : 'bg-black/10'
          }`}
          aria-hidden="true"
        >
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#007AFF]"
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
