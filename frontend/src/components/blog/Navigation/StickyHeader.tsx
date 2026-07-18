import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReadingState, readingStore } from '../../../store/readingStore';
import { Share2, ArrowUp, Maximize, Minimize } from 'lucide-react';
import { BlogNote } from '../../../types';

interface StickyHeaderProps {
  article: BlogNote;
  isDark: boolean;
}

export default function StickyHeader({ article, isDark }: StickyHeaderProps) {
  const { scrollY, progress, timeRemainingStr, isFocusMode } = useReadingState();
  const isVisible = scrollY > 400 || isFocusMode; // Show after hero section, or always in focus mode

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-xl ${
            isDark 
              ? 'bg-neutral-900/80 border-white/10 text-white' 
              : 'bg-white/80 border-slate-200 text-slate-900'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <span className={`text-xs font-bold px-2 py-1 rounded border ${
                isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-[#FDFBF7] border-slate-200 text-slate-600'
              }`}>
                {article.category}
              </span>
              <h1 className="text-sm font-semibold truncate max-w-md hidden sm:block">
                {article.title}
              </h1>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {timeRemainingStr}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => readingStore.toggleFocusMode()}
                  className={`p-2 rounded-full transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  aria-label={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                  title={isFocusMode ? "Exit Focus Mode (Esc)" : "Enter Focus Mode (Shift+F)"}
                >
                  {isFocusMode ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleShare}
                  className={`p-2 rounded-full transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  aria-label="Share article"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleTop}
                  className={`p-2 rounded-full transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  aria-label="Back to top"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
            <div 
              className="h-full bg-[#007AFF] transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
