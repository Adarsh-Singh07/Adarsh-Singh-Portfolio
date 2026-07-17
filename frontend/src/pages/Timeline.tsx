/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JourneyMilestone, ProfileMode } from '../types';
import { Briefcase, GraduationCap, Calendar, Zap, ChevronRight, MapPin } from 'lucide-react';
import SEO from '../components/SEO';

interface TimelineProps {
  journey: JourneyMilestone[];
  currentMode: ProfileMode;
  isDark: boolean;
}

type EraFilter = 'all' | 'professional' | 'academic';

export default function Timeline({ journey, currentMode, isDark }: TimelineProps) {
  const [filter, setFilter] = useState<EraFilter>('all');

  // Filter and sort journey milestones (assuming chronological order in profile.json)
  const filteredJourney = journey.filter(item => {
    const eraLower = item.era.toLowerCase();
    if (filter === 'professional') {
      return eraLower.includes('experience') || eraLower.includes('professional') || eraLower.includes('work');
    }
    if (filter === 'academic') {
      return eraLower.includes('education') || eraLower.includes('academic');
    }
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  const timelineSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://adarshsingh.in/timeline/#webpage",
        "url": "https://adarshsingh.in/timeline",
        "name": "Career Timeline & Experiences | Adarsh Singh",
        "description": "Professional history, corporate milestones, and academic backgrounds of Adarsh Singh in AI and Data Systems."
      }
    ]
  };

  return (
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full select-none">
      <SEO 
        title="Professional Journey & Experience | Adarsh Singh"
        description="Chronological career timeline of Adarsh Singh detailing positions, technical milestones, and project contributions in data systems and intelligence development."
        keywords="Work History, Professional Experience, Tech Timeline, Career Milestones"
        canonicalUrl="https://adarshsingh.in/timeline"
        schema={timelineSchema}
      />
      
      {/* 1. HERO HEADER */}
      <div className="mb-16 text-left max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.2em] font-sans uppercase w-fit mb-6 ${
            isDark 
              ? 'bg-[#007AFF15] border-[#007AFF30] text-[#007AFF]' 
              : 'bg-[#007AFF10] border-[#007AFF20] text-[#007AFF]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>CHRONICLE OF CAPABILITIES</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-sans font-semibold tracking-tight leading-none mb-6"
        >
          Career Chronology<br />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
            isDark 
              ? 'from-white via-white/80 to-white/40' 
              : 'from-neutral-950 via-neutral-900 to-neutral-500'
          } italic font-serif font-medium`}>Engineering Path &amp; Milestones</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`text-base md:text-lg font-light leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          A historical record of technical engagements, academic foundations, and enterprise contributions.
        </motion.p>
      </div>

      {/* 2. ERA FILTER CONTROLS */}
      <div className="mb-16 flex justify-start items-center relative z-20">
        <div className={`p-1 rounded-2xl border flex items-center gap-1.5 backdrop-blur-xl ${
          isDark ? 'bg-white/5 border-white/[0.08]' : 'bg-slate-100 border-slate-200'
        }`}>
          {(['all', 'professional', 'academic'] as const).map((era) => {
            const isActive = filter === era;
            const label = era === 'all' ? 'All Epochs' : era === 'professional' ? 'Professional' : 'Academics';
            return (
              <button
                key={era}
                onClick={() => setFilter(era)}
                className={`relative px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all duration-300 ${
                  isActive 
                    ? isDark ? 'text-black' : 'text-white'
                    : isDark ? 'text-white/60 hover:text-white' : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="timeline-era-pill"
                    className={`absolute inset-0 rounded-xl -z-10 ${
                      isDark ? 'bg-white' : 'bg-neutral-950'
                    }`}
                    transition={{ type: 'spring' as any, stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TIMELINE INTERACTIVE TRACK */}
      <div className="relative">
        
        {/* Glow Path Light (Global background vertical axis line) */}
        <div className={`absolute left-4 md:left-1/2 top-4 bottom-4 w-[1.5px] -translate-x-[0.75px] ${
          isDark 
            ? 'bg-gradient-to-b from-[#007AFF]/30 via-white/10 to-transparent' 
            : 'bg-gradient-to-b from-[#007AFF]/30 via-slate-200 to-transparent'
        }`} />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredJourney.map((milestone, idx) => {
              const isProfessional = milestone.era.toLowerCase().includes('experience') || milestone.era.toLowerCase().includes('professional');
              const isEmphasized = milestone.emphasis && (milestone.emphasis[currentMode] || milestone.emphasis.general);
              const isEven = idx % 2 === 0;

              // Theme configuration for Professional vs Academic eras
              const eraTheme = isProfessional
                ? {
                    glow: 'from-[#007AFF]/6 to-transparent',
                    borderHover: 'group-hover:border-[#007AFF]/30',
                    dotColor: 'bg-[#007AFF]',
                    icon: <Briefcase className="w-3.5 h-3.5 text-[#007AFF]" />,
                    badgeClass: isDark ? 'bg-[#007AFF]/10 text-[#90CAF9] border-[#007AFF]/20' : 'bg-[#007AFF]/5 text-[#1565C0] border-[#007AFF]/10',
                    pulseGlow: 'bg-[#007AFF]/20'
                  }
                : {
                    glow: 'from-[#8A2BE2]/6 to-transparent',
                    borderHover: 'group-hover:border-[#8A2BE2]/30',
                    dotColor: 'bg-[#8A2BE2]',
                    icon: <GraduationCap className="w-3.5 h-3.5 text-[#8A2BE2]" />,
                    badgeClass: isDark ? 'bg-[#8A2BE2]/10 text-[#E040FB] border-[#8A2BE2]/20' : 'bg-[#8A2BE2]/5 text-[#6A1B9A] border-[#8A2BE2]/10',
                    pulseGlow: 'bg-[#8A2BE2]/20'
                  };

              const isPresent = milestone.period.toLowerCase().includes('present');

              return (
                <motion.div
                  key={milestone.id}
                  layout
                  variants={cardVariants}
                  className={`flex flex-col md:flex-row relative items-stretch w-full ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  
                  {/* Left Column: Date / Time Period */}
                  <div className={`w-full md:w-1/2 px-12 pb-2 md:pb-0 flex items-center md:justify-end ${
                    isEven ? 'md:justify-start' : 'md:justify-end'
                  }`}>
                    <div className={`flex flex-col gap-1.5 ${
                      isEven ? 'md:items-start' : 'md:items-end'
                    }`}>
                      <div className="flex items-center gap-2">
                        {isPresent && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                        <span className={`font-mono text-xs md:text-sm font-bold tracking-wider uppercase ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {milestone.period}
                        </span>
                      </div>
                      
                      {isEmphasized && (
                        <span className={`text-[8px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded border select-none ${
                          isDark ? 'bg-[#007AFF]/10 border-[#007AFF]/25 text-[#007AFF]' : 'bg-[#007AFF]/5 border-[#007AFF]/15 text-[#1565C0]'
                        }`}>
                          Featured Milestone
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vertical Axis Dot Marker */}
                  <div className="absolute left-4 md:left-1/2 top-1 md:top-1/2 -translate-y-1/2 md:-translate-x-[8px] flex items-center justify-center z-10">
                    <div className="relative flex items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-35 ${eraTheme.pulseGlow}`} />
                      <div className={`w-4 h-4 rounded-full border-2 border-neutral-950 ${eraTheme.dotColor} ${
                        isEmphasized ? 'scale-[1.2] shadow-[0_0_15px_#007AFF]' : ''
                      }`} />
                    </div>
                  </div>

                  {/* Right Column: Glassmorphic Card content */}
                  <div className="w-full md:w-1/2 px-12">
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ type: 'spring' as any, stiffness: 450, damping: 20 }}
                      className={`p-6 md:p-8 rounded-[32px] border relative group overflow-hidden flex flex-col justify-between h-full transition-all duration-300 ${
                        isDark 
                          ? `bg-gradient-to-b from-[#141416]/90 to-[#09090b]/95 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ${eraTheme.borderHover} ${
                              isEmphasized ? 'shadow-[0_15px_40px_rgba(0,122,255,0.1)] border-[#007AFF]/25' : ''
                            }` 
                          : 'bg-white border-neutral-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:border-[#007AFF]/15'
                      }`}
                    >
                      {/* Ambient background glow inside card */}
                      <div className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${eraTheme.glow} rounded-bl-full filter blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`} />

                      <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                          
                          {/* Card Header row */}
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-mono tracking-widest uppercase w-fit leading-none ${eraTheme.badgeClass}`}>
                              {eraTheme.icon}
                              <span>{milestone.era}</span>
                            </div>
                            
                            {/* Accent tag */}
                            {isPresent && (
                              <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full select-none text-[8px] font-mono font-bold tracking-wider text-emerald-400">
                                ACTIVE
                              </div>
                            )}
                          </div>

                          <h3 className={`text-lg md:text-xl font-bold font-display tracking-tight leading-snug transition-colors duration-300 group-hover:text-[#007AFF] ${
                            isDark ? 'text-white' : 'text-neutral-900'
                          }`}>
                            {milestone.title}
                          </h3>

                          {/* Company / Subtitle Info */}
                          <div className={`flex items-center gap-2 mt-2 font-mono text-[10px] tracking-wider uppercase font-semibold ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            <span>{milestone.subtitle}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#007AFF]" />
                              <span>IN</span>
                            </div>
                          </div>

                          <p className={`text-xs font-light leading-relaxed mt-5 ${
                            isDark ? 'text-slate-200' : 'text-slate-700'
                          }`}>
                            {milestone.description}
                          </p>

                        </div>

                        {/* Stately footer */}
                        <div className={`border-t border-solid pt-4 mt-6 flex items-center justify-between ${
                          isDark ? 'border-white/[0.06] text-slate-400' : 'border-neutral-100 text-slate-600'
                        }`}>
                          <span className="text-[8px] font-mono tracking-widest uppercase">Chronicle Verified</span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-[#007AFF]" />
                        </div>

                      </div>
                    </motion.div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* 4. CALL TO ACTION CONTACT TEASER */}
      <div className="mt-28 border-t border-white/5 pt-16 text-center">
        <span className={`text-[10px] uppercase font-mono tracking-[0.3em] font-bold block mb-4 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Secure Operational Logistics
        </span>
        <h2 className="text-2xl font-sans font-semibold tracking-tight mb-6">
          Ready to start a professional engagement?
        </h2>
        <motion.a
          href="/contact"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all duration-300 border ${
            isDark 
              ? 'bg-white text-black border-white hover:bg-neutral-200' 
              : 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'
          }`}
        >
          <span>Establish Connection</span>
          <ChevronRight className="w-4 h-4" />
        </motion.a>
      </div>

    </div>
  );
}
