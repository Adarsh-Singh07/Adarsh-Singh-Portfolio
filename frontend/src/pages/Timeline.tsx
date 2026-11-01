/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { JourneyMilestone, ProfileMode } from '../types';
import { Briefcase, GraduationCap, ChevronRight, MapPin } from 'lucide-react';
import SEO from '../components/SEO';

interface TimelineProps {
  journey: JourneyMilestone[];
  currentMode: ProfileMode;
  isDark: boolean;
}

type EraFilter = 'all' | 'professional' | 'academic';

export default function Timeline({ journey, currentMode, isDark }: TimelineProps) {
  const [filter, setFilter] = useState<EraFilter>('all');

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
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }
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
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full bg-[var(--background)] text-[var(--foreground)]">
      <SEO 
        title="Professional Journey & Experience | Adarsh Singh"
        description="Chronological career timeline of Adarsh Singh detailing positions, technical milestones, and project contributions in data systems and intelligence development."
        keywords="Work History, Professional Experience, Tech Timeline, Career Milestones"
        canonicalUrl="https://adarshsingh.in/timeline"
        schema={timelineSchema}
      />
      
      {/* 1. HERO HEADER */}
      <div className="mb-16 text-left max-w-3xl">
        <div className="eyebrow" style={{ marginBottom: '1.25rem' }}>
          Chronicle of Capabilities
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '4rem',
            textTransform: 'uppercase',
            lineHeight: 0.95,
            color: 'var(--foreground)',
            letterSpacing: '-0.01em',
            marginBottom: '1.5rem',
          }}
          className="sm:text-[5.5rem]"
        >
          Career Chronology<br />
          <span style={{ color: 'var(--accent)' }}>Engineering Path &amp; Milestones</span>
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--muted)',
            lineHeight: 1.45,
          }}
        >
          A historical record of technical engagements, academic foundations, and enterprise contributions across Capgemini, autonomous AI research, and cloud architecture.
        </p>
      </div>

      {/* 2. ERA FILTER CONTROLS */}
      <div className="mb-16 flex justify-start items-center relative z-20">
        <div
          className="p-1 rounded-full border flex items-center gap-1.5"
          style={{ background: 'var(--surface)', borderColor: 'var(--line-strong)' }}
        >
          {(['all', 'professional', 'academic'] as const).map((era) => {
            const isActive = filter === era;
            const label = era === 'all' ? 'All Epochs' : era === 'professional' ? 'Professional' : 'Academics';
            return (
              <button
                key={era}
                onClick={() => setFilter(era)}
                className="px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300"
                style={{
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'var(--background)' : 'var(--muted)',
                }}
              >
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TIMELINE INTERACTIVE TRACK */}
      <div className="relative">
        
        {/* Glow Path Light (Global background vertical axis line) */}
        <div
          className="absolute left-4 md:left-1/2 top-4 bottom-4 w-px -translate-x-1/2"
          style={{ background: 'linear-gradient(to bottom, var(--accent), var(--line), transparent)' }}
        />

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
                  {/* Date Column */}
                  <div className={`w-full md:w-1/2 px-12 pb-2 md:pb-0 flex items-center ${
                    isEven ? 'md:justify-start' : 'md:justify-end'
                  }`}>
                    <div className={`flex flex-col gap-1.5 ${
                      isEven ? 'md:items-start' : 'md:items-end'
                    }`}>
                      <div className="flex items-center gap-2">
                        {isPresent && (
                          <span
                            className="inline-block w-2 h-2 rounded-full animate-pulse"
                            style={{ background: 'var(--accent)' }}
                          />
                        )}
                        <span
                          className="font-mono text-xs md:text-sm font-bold tracking-wider uppercase"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {milestone.period}
                        </span>
                      </div>
                      
                      {isEmphasized && (
                        <span
                          className="text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm border"
                          style={{
                            background: 'rgba(255, 59, 29, 0.1)',
                            borderColor: 'rgba(255, 59, 29, 0.25)',
                            color: 'var(--accent)',
                          }}
                        >
                          Featured Milestone
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vertical Axis Marker */}
                  <div className="absolute left-4 md:left-1/2 top-1 md:top-1/2 -translate-y-1/2 md:-translate-x-1/2 flex items-center justify-center z-10">
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2"
                      style={{
                        borderColor: 'var(--background)',
                        background: isEmphasized ? 'var(--accent)' : 'var(--foreground)',
                      }}
                    />
                  </div>

                  {/* Card content */}
                  <div className="w-full md:w-1/2 px-12">
                    <div
                      className="p-6 md:p-8 rounded-[0.25rem] border relative group flex flex-col justify-between h-full transition-all duration-340"
                      style={{
                        background: 'var(--surface)',
                        borderColor: isEmphasized ? 'var(--accent)' : 'var(--line)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = isEmphasized ? 'var(--accent)' : 'var(--line)')}
                    >
                      <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                          {/* Card Header row */}
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <div
                              className="flex items-center gap-1.5 px-3 py-1 rounded-sm border text-[9px] font-mono tracking-widest uppercase"
                              style={{
                                background: 'var(--surface-2)',
                                borderColor: 'var(--line)',
                                color: 'var(--muted)',
                              }}
                            >
                              {isProfessional ? <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> : <GraduationCap className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />}
                              <span>{milestone.era}</span>
                            </div>
                            
                            {isPresent && (
                              <div
                                className="px-2.5 py-0.5 rounded-sm text-[8px] font-mono font-bold tracking-wider uppercase border"
                                style={{
                                  background: 'rgba(255, 59, 29, 0.1)',
                                  borderColor: 'rgba(255, 59, 29, 0.25)',
                                  color: 'var(--accent)',
                                }}
                              >
                                ACTIVE
                              </div>
                            )}
                          </div>

                          <h3
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: '1.25rem',
                              fontWeight: 600,
                              lineHeight: 1.3,
                              color: 'var(--foreground)',
                              transition: 'color 340ms ease-out',
                            }}
                            className="group-hover:!text-[var(--accent)]"
                          >
                            {milestone.title}
                          </h3>

                          {/* Company / Subtitle Info */}
                          <div
                            className="flex items-center gap-2 mt-2 font-mono text-[10px] tracking-wider uppercase font-semibold"
                            style={{ color: 'var(--muted)' }}
                          >
                            <span>{milestone.subtitle}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                              <span>IN</span>
                            </div>
                          </div>

                          <p
                            style={{
                              fontSize: '0.9375rem',
                              color: 'var(--muted)',
                              lineHeight: 1.5,
                              marginTop: '1.25rem',
                            }}
                          >
                            {milestone.description}
                          </p>
                        </div>

                        <div
                          className="pt-4 mt-6 flex items-center justify-between"
                          style={{ borderTop: '1px solid var(--line)', color: 'var(--muted)' }}
                        >
                          <span className="text-[9px] font-mono tracking-widest uppercase">Chronicle Verified</span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" style={{ color: 'var(--accent)' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* 4. CALL TO ACTION CONTACT TEASER */}
      <div
        className="mt-28 pt-16 text-center"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        <div className="eyebrow justify-center mb-4">
          Professional Engagements
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            textTransform: 'uppercase',
            color: 'var(--foreground)',
            marginBottom: '1.5rem',
          }}
        >
          Ready to architect a high-scale platform?
        </h2>
        <Link
          to="/contact"
          className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all duration-300"
          style={{
            background: 'var(--accent)',
            color: 'var(--background)',
          }}
        >
          <span>Establish Transmission</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
