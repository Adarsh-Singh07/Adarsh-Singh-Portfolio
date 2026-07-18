import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReadingState, readingStore } from '../../../store/readingStore';
import { ChevronUp, ChevronDown, List } from 'lucide-react';

interface TableOfContentsProps {
  isDark: boolean;
}

export default function TableOfContents({ isDark }: TableOfContentsProps) {
  const { headings, activeHeadingId, progress, scrollDirection, isFocusMode } = useReadingState();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const collapseTimeout = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle auto-collapse logic
  useEffect(() => {
    const handleInactivity = () => {
      if (isHovered) return;
      
      // In focus mode, always auto-collapse quickly (e.g. 1.5s)
      if (isFocusMode) {
        setIsExpanded(false);
        return;
      }

      // If we are scrolling up, keep it expanded
      if (scrollDirection === 'up') {
        setIsExpanded(true);
      } else {
        // Auto collapse after 3.5s of inactivity when scrolling down or idle
        setIsExpanded(false);
      }
    };

    if (collapseTimeout.current) clearTimeout(collapseTimeout.current);
    
    // Reset timer when scroll direction changes or hovered
    collapseTimeout.current = setTimeout(handleInactivity, isFocusMode ? 1500 : 3500);

    return () => {
      if (collapseTimeout.current) clearTimeout(collapseTimeout.current);
    };
  }, [scrollDirection, isHovered, isFocusMode]);

  // Smart auto-scroll active heading into view
  useEffect(() => {
    if (!isExpanded || !activeHeadingId) return;
    const activeEl = containerRef.current?.querySelector(`[data-id="${activeHeadingId}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeHeadingId, isExpanded]);

  if (headings.length === 0) return null;

  const handlePrev = () => {
    const idx = headings.findIndex(h => h.id === activeHeadingId);
    if (idx > 0) {
      document.getElementById(headings[idx - 1].id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    const idx = headings.findIndex(h => h.id === activeHeadingId);
    if (idx !== -1 && idx < headings.length - 1) {
      document.getElementById(headings[idx + 1].id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const circumference = 2 * Math.PI * 14;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="fixed right-6 xl:right-12 top-32 z-40 hidden lg:block"
      onMouseEnter={() => { setIsHovered(true); setIsExpanded(true); }}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsExpanded(true)}
    >
      <AnimatePresence initial={false} mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: 20, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 20, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`w-[280px] max-w-[320px] rounded-2xl border backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors duration-300 ${
              isDark 
                ? 'bg-neutral-900/10 border-white/10' 
                : 'bg-white/10 border-slate-200/50'
            }`}
          >
            <div className={`px-5 py-3 text-xs font-bold uppercase tracking-widest border-b flex items-center justify-between ${
              isDark ? 'border-white/10 text-slate-400' : 'border-slate-200/50 text-slate-500'
            }`}>
              <span>Contents</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            
            <div 
              ref={containerRef}
              className="p-4 max-h-[50vh] overflow-y-auto custom-scrollbar flex flex-col gap-2 relative before:absolute before:inset-y-4 before:left-5 before:w-px before:bg-slate-200/50 dark:before:bg-white/10"
            >
              {headings.map((heading) => {
                const isActive = activeHeadingId === heading.id;
                
                return (
                  <a
                    key={heading.id}
                    data-id={heading.id}
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`relative pl-5 py-1.5 text-sm transition-all duration-300 block ${
                      heading.level === 3 ? 'ml-3 text-[13px]' : ''
                    } ${
                      isActive 
                        ? 'text-[#007AFF] font-medium scale-[1.02] origin-left' 
                        : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.span 
                        layoutId="active-indicator"
                        className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#007AFF] rounded-full shadow-[0_0_8px_rgba(0,122,255,0.6)]" 
                      />
                    )}
                    <span className="line-clamp-2 block leading-snug">{heading.text}</span>
                  </a>
                );
              })}
            </div>

            <div className={`flex items-center justify-between px-3 py-2 border-t ${
              isDark ? 'border-white/10' : 'border-slate-200/50'
            }`}>
              <div className="flex gap-1">
                <button onClick={handlePrev} className={`p-1.5 rounded-lg transition-colors group relative ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={handleNext} className={`p-1.5 rounded-lg transition-colors group relative ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`w-12 h-12 rounded-full border backdrop-blur-2xl shadow-lg flex items-center justify-center cursor-pointer relative group transition-colors duration-300 ${
              isDark 
                ? 'bg-neutral-900/10 border-white/10 hover:border-white/20 hover:bg-neutral-900/30' 
                : 'bg-white/10 border-slate-200/50 hover:border-slate-300 hover:bg-white/40'
            }`}
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="24" cy="24" r="14" fill="none" strokeWidth="2.5" className={isDark ? 'stroke-white/10' : 'stroke-slate-200'} />
              <circle 
                cx="24" cy="24" r="14" fill="none" strokeWidth="2.5" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round"
                className="stroke-[#007AFF] transition-all duration-300 ease-out" 
              />
            </svg>
            <List className={`w-4 h-4 ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
