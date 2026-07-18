import React, { useEffect, useState } from 'react';
import { readingStore } from '../../../store/readingStore';
import { X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReadingMemoryProps {
  articleId: string;
  version?: string;
}

interface SavedState {
  scrollY: number;
  activeHeadingId: string;
  timestamp: number;
  version?: string;
}

export default function ReadingMemory({ articleId, version }: ReadingMemoryProps) {
  const [showToast, setShowToast] = useState(false);
  const [savedScrollY, setSavedScrollY] = useState<number | null>(null);

  useEffect(() => {
    const memoryKey = `reading-memory-${articleId}`;
    const rawData = localStorage.getItem(memoryKey);
    
    if (rawData) {
      try {
        const saved: SavedState = JSON.parse(rawData);
        // Only prompt if version matches (if version is provided), and scroll is significant (>300px)
        if ((!version || saved.version === version) && saved.scrollY > 300) {
          // ensure it's not too old (e.g. within last 30 days)
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (Date.now() - saved.timestamp < thirtyDays) {
            setSavedScrollY(saved.scrollY);
            setShowToast(true);
          }
        }
      } catch (e) {
        console.error('Failed to parse reading memory', e);
      }
    }

    const handleUnload = () => {
      const state = readingStore.getState();
      if (state.scrollY > 300) {
        localStorage.setItem(memoryKey, JSON.stringify({
          scrollY: state.scrollY,
          activeHeadingId: state.activeHeadingId,
          timestamp: Date.now(),
          version
        }));
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    // Also save periodically in case of crash
    const interval = setInterval(handleUnload, 15000);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      clearInterval(interval);
      handleUnload();
    };
  }, [articleId, version]);

  const handleResume = () => {
    if (savedScrollY !== null) {
      window.scrollTo({ top: savedScrollY, behavior: 'smooth' });
    }
    setShowToast(false);
  };

  const handleDismiss = () => {
    setShowToast(false);
    localStorage.removeItem(`reading-memory-${articleId}`);
  };

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-3 rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10"
        >
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">Continue where you left off?</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">We saved your reading progress.</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleResume}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-xs font-semibold transition-colors"
            >
              <Play className="w-3 h-3 fill-current" /> Resume
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
