import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, ThumbsDown, Sparkles, MessageSquare } from 'lucide-react';
import { BlogNote } from '../../../types';
import LearningPathRoadmap from './LearningPathRoadmap';

interface ArticleFooterProps {
  article: BlogNote;
  isDark: boolean;
}

export default function ArticleFooter({ article, isDark }: ArticleFooterProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  return (
    <div className="mt-20 pt-16 border-t border-slate-200 dark:border-white/10">
      
      {/* Completion Celebration */}
      <div className={`p-8 rounded-3xl flex flex-col items-center text-center mb-16 ${
        isDark ? 'bg-gradient-to-b from-[#007AFF]/10 to-transparent' : 'bg-gradient-to-b from-[#007AFF]/5 to-transparent'
      }`}>
        <div className="w-16 h-16 rounded-full bg-[#007AFF]/10 flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-[#007AFF]" />
        </div>
        <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          You've finished this article!
        </h2>
        <p className={`max-w-md mx-auto mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Great job completing "{article.title}". You just leveled up your knowledge in {article.category}.
        </p>

        {/* Feedback Mechanism */}
        <div className="flex flex-col items-center gap-4">
          <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Was this helpful?
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFeedbackGiven('up')}
              className={`p-4 rounded-2xl flex items-center justify-center transition-all ${
                feedbackGiven === 'up' 
                  ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/30'
                  : isDark 
                    ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-400' 
                    : 'bg-white hover:bg-[#FDFBF7] text-slate-500 hover:text-emerald-500 shadow-sm border border-slate-200'
              }`}
            >
              <ThumbsUp className={`w-6 h-6 ${feedbackGiven === 'up' ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setFeedbackGiven('down')}
              className={`p-4 rounded-2xl flex items-center justify-center transition-all ${
                feedbackGiven === 'down' 
                  ? 'bg-rose-500 text-white scale-110 shadow-lg shadow-rose-500/30'
                  : isDark 
                    ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400' 
                    : 'bg-white hover:bg-[#FDFBF7] text-slate-500 hover:text-rose-500 shadow-sm border border-slate-200'
              }`}
            >
              <ThumbsDown className={`w-6 h-6 ${feedbackGiven === 'down' ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          <AnimatePresence>
            {feedbackGiven && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                Thanks for your feedback!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <LearningPathRoadmap currentSlug={article.id} isDark={isDark} />

      {/* Discussion Prompt */}
      <div className={`mt-16 p-8 rounded-3xl border flex flex-col sm:flex-row items-center gap-6 justify-between ${
        isDark ? 'bg-neutral-900/30 border-white/10' : 'bg-[#FDFBF7] border-slate-200'
      }`}>
        <div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Have questions?
          </h3>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Reach out on Twitter or LinkedIn to discuss this topic further.
          </p>
        </div>
        <a 
          href="https://twitter.com/intent/tweet" 
          target="_blank" 
          rel="noreferrer"
          className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 font-semibold flex items-center gap-2 flex-shrink-0 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          Discuss on X
        </a>
      </div>
    </div>
  );
}
