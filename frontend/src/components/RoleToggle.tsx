/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileMode, RoleDefinition } from '../types';
import { Layers, Database, Cpu, ChevronDown } from 'lucide-react';

interface RoleToggleProps {
  currentMode: ProfileMode;
  onModeChange: (mode: ProfileMode) => void;
  isDark: boolean;
  rolesList: RoleDefinition[];
}

const iconMap: Record<string, any> = {
  Layers,
  Database,
  Cpu
};

export default function RoleToggle({ currentMode, onModeChange, isDark, rolesList }: RoleToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeRole = rolesList.find(r => r.id === currentMode) || rolesList[0];
  const ActiveIcon = iconMap[activeRole?.icon] || Layers;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="relative z-50"
      id="profile-mode-selector"
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold tracking-wider transition-all duration-300 focus:outline-none cursor-pointer border ${
          isDark 
            ? 'bg-black/60 border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]' 
            : 'bg-white border-slate-200 hover:border-[#007AFF]/30 text-slate-700 hover:text-neutral-900 shadow-sm'
        }`}
      >
        <ActiveIcon className="w-3.5 h-3.5" />
        <span className="font-display tracking-widest uppercase">Profile: {activeRole?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {/* Dropdown Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute right-0 mt-2 p-1.5 w-56 rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden ${
              isDark 
                ? 'bg-neutral-950/95 border-white/10 text-white' 
                : 'bg-white/95 border-slate-200 text-neutral-800'
            }`}
          >
            {/* HUD Scanline/Header */}
            <div className={`px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.2em] border-b mb-1.5 ${
              isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'
            }`}>
              Select Environment
            </div>

            <div className="flex flex-col gap-1">
              {rolesList.map((role) => {
                const IconComponent = iconMap[role.icon] || Layers;
                const isActive = currentMode === role.id;

                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      onModeChange(role.id);
                      setIsOpen(false);
                    }}
                    className={`relative w-full px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold tracking-wider text-left transition-colors duration-250 cursor-pointer focus:outline-none ${
                      isActive 
                        ? isDark 
                          ? 'bg-[#00E5FF]/10 text-cyan-400 border border-[#00E5FF]/20 shadow-[inset_0_1px_8px_rgba(0,229,255,0.05)]' 
                          : 'bg-[#007AFF]/5 text-[#007AFF] border border-[#007AFF]/10'
                        : isDark
                          ? 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                          : 'hover:bg-[#FDFBF7] text-slate-600 hover:text-neutral-900 border border-transparent'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10 font-display tracking-widest uppercase">{role.label}</span>
                    
                    {/* Corner indicator dots like gaming targeter */}
                    {isActive && (
                      <span className={`ml-auto w-1 h-1 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-[#007AFF]'} animate-pulse`} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
