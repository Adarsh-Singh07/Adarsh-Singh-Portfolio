/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { JourneyMilestone, BlogNote, ProfileMode } from '../types';
import { BookOpen, Compass, Target, ArrowUpRight, GraduationCap } from 'lucide-react';

interface JourneySectionProps {
  journey: JourneyMilestone[];
  blogs: BlogNote[];
  currentMode: ProfileMode;
  philosophy: string;
  isDark: boolean;
}

export default function JourneySection({ journey, blogs, currentMode, philosophy, isDark }: JourneySectionProps) {
  // Sort blogs based on current mode priority
  const sortedBlogs = [...blogs].sort((a, b) => {
    return a.priority[currentMode] - b.priority[currentMode];
  });

  return (
    <section 
      id="journey" 
      className={`relative py-24 transition-colors duration-200 ${
        isDark 
          ? 'bg-[#121212] text-white' 
          : 'bg-white text-neutral-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        
        {/* Step 4 Section Title */}
        <div className="mb-16 text-left max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[1px] bg-[#007AFF]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#007AFF]">
              Origin Story & Continuous Growth
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-semibold tracking-tight">
            The Journey
          </h2>
          <p className={`mt-3.5 text-base md:text-lg font-light ${
            isDark ? 'text-white/50' : 'text-neutral-950/60'
          }`}>
            Tracing progress from logical computing mathematics to crafting massive real-time pipelines and learning systems.
          </p>
        </div>

        {/* --- HORIZONTAL SCROLL STORYTELLING TIMELINE --- */}
        <div className="mb-24 overflow-x-auto pb-8 pt-4 scrollbar-thin select-none" id="journey-timeline-scroller">
          <div className="flex gap-6 min-w-[1000px] md:min-w-[1200px] px-2 relative">
            
            {/* Draw Horizontal Connecting Line */}
            <div className={`absolute top-1/2 left-0 right-0 h-[2px] z-0 -translate-y-1/2 ${
              isDark ? 'bg-gradient-to-r from-[#007AFF]/10 via-[#007AFF]/30 to-transparent' : 'bg-gradient-to-r from-slate-200 via-slate-350 to-slate-200'
            }`} />

            {journey.map((item, index) => {
              const isEmphasized = item.emphasis[currentMode];
              
              return (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  className={`w-[260px] md:w-[320px] p-6 rounded-[28px] relative z-10 border transition-all duration-500 flex flex-col justify-between ${
                    isEmphasized
                      ? isDark 
                        ? 'bg-[#151515] border-[#007AFF]/35 shadow-[0_15px_30px_rgba(0,122,255,0.15)]' 
                        : 'bg-white border-[#007AFF]/30 shadow-[0_10px_25px_-5px_rgba(0,122,255,0.06)]'
                      : isDark
                        ? 'bg-[#121212]/90 border-white/5 hover:border-white/10'
                        : 'bg-[#FDFBF7]/80 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Floating Step Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[10px] font-serif italic font-bold text-[#007AFF]">
                        {item.era}
                      </span>
                      <span className={`text-[10px] font-sans font-bold tracking-wider ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                        {item.period}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold font-sans tracking-tight leading-snug mb-1">
                      {item.title}
                    </h4>
                    
                    <span className={`text-xs block font-serif italic mb-3 ${
                      isDark ? 'text-white/50' : 'text-neutral-500'
                    }`}>
                      {item.subtitle}
                    </span>

                    <p className={`text-xs font-light leading-relaxed ${
                      isDark ? 'text-white/50' : 'text-neutral-950/60'
                    }`}>
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-dashed border-white/5 flex items-center justify-between">
                    <span className={`text-[9px] uppercase font-sans tracking-widest font-bold ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>Timeline Milestone 0{index + 1}</span>
                    {isEmphasized && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Extra Future Vision card block */}
            <div className={`w-[260px] md:w-[320px] p-6 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-neutral-950 border-neutral-900/60' : 'bg-[#FDFBF7] border-slate-200/80'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[10px] font-serif italic font-bold text-[#007AFF]">
                    Vision
                  </span>
                  <Target className="w-3.5 h-3.5 text-[#007AFF]" />
                </div>
                <h4 className="text-base font-semibold font-sans tracking-tight leading-snug mb-2">
                  Future Continuous
                </h4>
                <p className={`text-xs font-light leading-relaxed ${
                  isDark ? 'text-white/50' : 'text-neutral-950/60'
                }`}>
                  “Building intelligent infrastructure for the future of AI systems.”
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-dashed border-white/5 flex items-center justify-between text-[9px] uppercase font-sans tracking-widest font-bold text-neutral-400">
                <span>Milestone 05</span>
                <span>Active</span>
              </div>
            </div>

          </div>
        </div>

        {/* --- DYNAMIC BLOG ARTICLES (Apple News / Medium Premium editorial look) --- */}
        <div className="mt-28" id="blogs">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-2xl font-sans font-semibold tracking-tight">Thoughts &amp; Engineering Notes</h3>
              </div>
              <p className={`text-sm font-light ${isDark ? 'text-white/50' : 'text-neutral-950/60'}`}>
                Scribbles, architectural breakdowns, and learnings from deploying code pipelines.
              </p>
            </div>
            <span className={`text-[9px] font-sans tracking-widest uppercase block mt-4 md:mt-0 font-bold ${
              isDark ? 'text-white/30' : 'text-[#007AFF]'
            }`}>
              {currentMode === 'data-engineer' ? 'RECOMMENDING DATA PAPERS FIRST' : 'RECOMMENDING RAG THEORIES FIRST'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedBlogs.map((post) => (
              <motion.article 
                key={post.id}
                layout
                className={`p-6 md:p-8 rounded-[32px] border flex flex-col justify-between transition-all duration-400 hover:shadow-xl ${
                  isDark 
                    ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5 hover:border-[#007AFF]/20' 
                    : 'bg-white border-slate-200/80 hover:border-slate-350'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[9px] uppercase font-sans tracking-widest font-bold px-2.5 py-1 rounded-full ${
                      isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {post.category}
                    </span>
                    <span className={`text-[10px] font-sans font-bold tracking-wider ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                      {post.readTime}
                    </span>
                  </div>

                  <h4 className="text-lg md:text-xl font-semibold font-sans tracking-tight mb-3 hover:text-[#007AFF] transition-colors">
                    <a href={post.url}>{post.title}</a>
                  </h4>

                  <p className={`text-xs md:text-sm font-light leading-relaxed mb-6 ${
                    isDark ? 'text-white/50' : 'text-neutral-950/60'
                  }`}>
                    {post.excerpt}
                  </p>
                </div>

                <div className="border-t border-dashed border-white/5 pt-4 flex items-center justify-between">
                  <span className={`text-[10px] font-mono ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                    Published {post.date}
                  </span>
                  <a 
                    href={post.url}
                    className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors text-[#007AFF] hover:text-[#5AC8FA]"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* --- LUXURY CINEMATIC QUOTE OR PHILOSOPHY WORDING --- */}
        <div className="mt-32 pt-16 border-t border-dashed border-white/5 text-center">
          <div className="max-w-3xl mx-auto px-4 select-none">
            <span className="text-[10px] uppercase font-sans tracking-[0.2em] block mb-4 font-bold text-[#007AFF]">
              Personal Creed
            </span>
            <blockquote className={`text-xl md:text-3xl font-serif font-light italic leading-relaxed tracking-wide ${
              isDark ? 'text-slate-200' : 'text-neutral-900 font-normal'
            }`}>
              “{philosophy}”
            </blockquote>
            <div className={`mt-4 text-[10px] font-sans tracking-widest uppercase font-bold ${
              isDark ? 'text-white/30' : 'text-neutral-400'
            }`}>
              — Adarsh Singh
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
