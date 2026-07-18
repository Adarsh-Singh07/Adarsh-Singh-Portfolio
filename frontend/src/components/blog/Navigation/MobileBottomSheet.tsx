import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReadingState } from '../../../store/readingStore';
import { List, X, ChevronRight, Share2, ArrowUp } from 'lucide-react';
import { BlogNote } from '../../../types';

interface MobileBottomSheetProps {
  article: BlogNote;
  isDark: boolean;
}

export default function MobileBottomSheet({ article, isDark }: MobileBottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { headings, activeHeadingId, progress } = useReadingState();

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
    setIsOpen(false);
  };

  // The FAB itself
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className={`relative w-14 h-14 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center backdrop-blur-xl border transition-transform hover:scale-105 active:scale-95 ${
            isDark ? 'bg-neutral-900/90 border-white/10' : 'bg-white/90 border-slate-200'
          }`}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="28" cy="28" r="22" fill="none" strokeWidth="3" className={isDark ? 'stroke-white/10' : 'stroke-slate-200'} />
            <circle 
              cx="28" cy="28" r="22" fill="none" strokeWidth="3" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round"
              className="stroke-[#007AFF] transition-all duration-300 ease-out" 
            />
          </svg>
          <List className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
        </button>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setIsOpen(false);
                }
              }}
              className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t shadow-2xl flex flex-col lg:hidden ${
                isDark ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200'
              }`}
              style={{ maxHeight: '85vh' }}
            >
              <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
              </div>

              <div className="px-6 pb-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Contents</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{Math.round(progress)}% Read</p>
                </div>
                <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-4 flex-1">
                <div className="flex flex-col gap-4 relative before:absolute before:inset-y-2 before:left-[7px] before:w-px before:bg-slate-200 dark:before:bg-white/10">
                  {headings.map((heading) => {
                    const isActive = heading.id === activeHeadingId;
                    return (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                          setIsOpen(false);
                        }}
                        className={`relative pl-6 flex items-start gap-2 ${
                          isActive 
                            ? 'text-[#007AFF] font-semibold' 
                            : isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-[-4px] top-1.5 w-[22px] h-[22px] bg-[#007AFF]/20 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#007AFF] rounded-full shadow-[0_0_8px_rgba(0,122,255,0.8)]" />
                          </div>
                        )}
                        <span className={heading.level === 3 ? 'text-[14px] mt-0.5' : 'text-[15px]'}>
                          {heading.text}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className={`px-6 py-5 border-t flex items-center justify-between ${
                isDark ? 'border-white/10 bg-neutral-900/50' : 'border-slate-200 bg-[#FDFBF7]'
              }`}>
                <button 
                  onClick={handleTop}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 shadow-sm'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" /> Top
                </button>
                <button 
                  onClick={handleShare}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white shadow-lg transition-transform hover:scale-105 active:scale-95 bg-[#007AFF] hover:bg-[#007AFF]/90`}
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
