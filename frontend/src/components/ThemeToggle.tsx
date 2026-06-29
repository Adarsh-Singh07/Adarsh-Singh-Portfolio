/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function ThemeToggle({ isDark, toggleTheme }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggler"
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-full overflow-hidden transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-offset-1 select-none cursor-pointer ${
        isDark 
          ? 'bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-white focus:ring-blue-500' 
          : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-neutral-900 focus:ring-indigo-600'
      }`}
      aria-label="Toggle luxury display theme"
    >
      <motion.div
        initial={false}
        animate={{ y: isDark ? -30 : 0, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-center"
      >
        <Sun className="w-4.5 h-4.5" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{ y: isDark ? 0 : 30, opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="w-4.5 h-4.5" />
      </motion.div>
    </button>
  );
}
