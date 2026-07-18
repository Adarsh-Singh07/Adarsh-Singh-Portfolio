import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { AI_ENGINEERING_ROADMAP, LearningNode } from '../../../data/learningPath';
import { CheckCircle2, Circle, Lock } from 'lucide-react';

interface LearningPathRoadmapProps {
  currentSlug: string;
  isDark: boolean;
}

export default function LearningPathRoadmap({ currentSlug, isDark }: LearningPathRoadmapProps) {
  const currentIndex = AI_ENGINEERING_ROADMAP.findIndex(n => n.slug === currentSlug);
  
  if (currentIndex === -1) return null; // Not part of the roadmap

  // Show 1 previous, current, and up to 3 next
  const startIndex = Math.max(0, currentIndex - 1);
  const visibleNodes = AI_ENGINEERING_ROADMAP.slice(startIndex, startIndex + 5);

  return (
    <div className={`mt-16 p-8 rounded-3xl border ${
      isDark ? 'bg-neutral-900/50 border-white/10' : 'bg-[#FDFBF7] border-slate-200'
    }`}>
      <div className="mb-8">
        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          AI Engineering Journey
        </h3>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          You are on step {currentIndex + 1} of {AI_ENGINEERING_ROADMAP.length} in this learning path.
        </p>
      </div>

      <div className="relative">
        {/* Connecting Line */}
        <div className={`absolute left-[19px] top-4 bottom-4 w-[2px] ${
          isDark ? 'bg-white/10' : 'bg-slate-200'
        }`} />

        <div className="flex flex-col gap-6">
          {visibleNodes.map((node, i) => {
            const nodeGlobalIndex = startIndex + i;
            const isCompleted = nodeGlobalIndex < currentIndex;
            const isCurrent = nodeGlobalIndex === currentIndex;
            const isLocked = nodeGlobalIndex > currentIndex;

            return (
              <div key={node.slug} className={`relative flex items-start gap-6 group`}>
                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted ? 'bg-emerald-500 text-white' :
                  isCurrent ? 'bg-[#007AFF] text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]' :
                  isDark ? 'bg-neutral-800 border-2 border-white/10 text-slate-500' : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                   isCurrent ? <Circle className="w-4 h-4 fill-current" /> :
                   <Lock className="w-4 h-4" />}
                </div>

                <div className="pt-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      isCompleted ? 'text-emerald-500' :
                      isCurrent ? 'text-[#007AFF]' :
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      Step {nodeGlobalIndex + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      node.difficulty === 'Advanced' ? 'text-rose-500 bg-rose-500/10' :
                      node.difficulty === 'Intermediate' ? 'text-amber-500 bg-amber-500/10' :
                      'text-emerald-500 bg-emerald-500/10'
                    }`}>
                      {node.difficulty}
                    </span>
                  </div>
                  
                  {isCurrent || isCompleted ? (
                    <Link 
                      to={`/blog/${node.slug}`}
                      className={`block text-lg font-bold mb-1 transition-colors ${
                        isCurrent 
                          ? (isDark ? 'text-white' : 'text-slate-900') 
                          : (isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900')
                      }`}
                    >
                      {node.title}
                    </Link>
                  ) : (
                    <h4 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {node.title}
                    </h4>
                  )}
                  
                  <p className={`text-sm ${
                    isCurrent ? (isDark ? 'text-slate-400' : 'text-slate-600') :
                    isDark ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {node.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
