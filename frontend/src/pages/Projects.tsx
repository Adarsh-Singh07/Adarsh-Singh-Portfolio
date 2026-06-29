/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, ProfileMode } from '../types';
import { ArrowUpRight, Github, ExternalLink, Cpu, Database, Cloud, Layers, CheckCircle2 } from 'lucide-react';

interface ProjectsPageProps {
  projects: Project[];
  currentMode: ProfileMode;
  isDark: boolean;
}

type ProjectCategory = 'All' | 'AI' | 'Data Engineering' | 'GenAI' | 'ETL' | 'Cloud';

export default function Projects({ projects, currentMode, isDark }: ProjectsPageProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');

  // Categories list
  const categories: ProjectCategory[] = ['All', 'AI', 'Data Engineering', 'GenAI', 'ETL', 'Cloud'];

  // Helper to check if a project belongs to a category
  const projectBelongsToCategory = (project: Project, category: ProjectCategory): boolean => {
    if (category === 'All') return true;
    
    const techs = project.technologies.map(t => t.toLowerCase());
    const title = project.title.toLowerCase();
    const desc = project.description.toLowerCase();

    if (category === 'AI') {
      return techs.some(t => ['pytorch', 'tensorflow', 'opencv', 'ml', 'agentic ai', 'rag', 'openai llm'].includes(t)) || title.includes('ml') || title.includes('ai');
    }
    if (category === 'Data Engineering') {
      return techs.some(t => ['databricks', 'apache spark', 'delta lake', 'sql', 'bigquery'].includes(t)) || desc.includes('data lakehouse') || desc.includes('etl');
    }
    if (category === 'GenAI') {
      return techs.some(t => ['rag', 'agentic ai', 'openai llm', 'vector stores'].includes(t)) || desc.includes('generative ai') || desc.includes('llm');
    }
    if (category === 'ETL') {
      return techs.some(t => ['etl', 'celery', 'redis', 'azure adf'].includes(t)) || desc.includes('etl') || desc.includes('workflow');
    }
    if (category === 'Cloud') {
      return techs.some(t => ['azure', 'gcp', 'aws', 'docker', 'redis'].includes(t)) || desc.includes('cloud');
    }
    return false;
  };

  // Sort projects by priority for the active profile mode
  const sortedProjects = [...projects].sort((a, b) => a.priority[currentMode] - b.priority[currentMode]);

  // Filter projects based on active category
  const filteredProjects = sortedProjects.filter(p => projectBelongsToCategory(p, activeCategory));

  // Identify featured project (Spotlight card)
  const featuredProject = sortedProjects.find(p => p.id === 'agentic-rag-platform') || sortedProjects[0];

  // Container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 18,
        duration: 0.8
      }
    },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full select-none">
      {/* Editorial Page Header */}
      <div className="mb-16 text-left max-w-4xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-[1px] bg-[#007AFF]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#007AFF]">
            Bento Catalog v2.0
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-sans font-semibold tracking-tight leading-none mb-6">
          Architectural Works &amp;<br />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
            isDark 
              ? 'from-white via-white/80 to-white/40' 
              : 'from-neutral-950 via-neutral-900 to-neutral-500'
          } italic font-serif font-medium`}>Intelligent Systems</span>
        </h1>
        <p className={`text-base md:text-lg font-light max-w-2xl leading-relaxed ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          An asymmetrical curation of generative ecosystems, low-latency streaming lakes, and deep machine translation endpoints. Click below to filter by stack focus.
        </p>
      </div>

      {/* Luxury Filter Bar */}
      <div className="mb-12 flex flex-wrap gap-2.5 items-center justify-start border-b border-white/5 pb-6">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 focus:outline-none cursor-pointer ${
                isActive 
                  ? isDark ? 'text-white' : 'text-neutral-900' 
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-neutral-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className={`absolute inset-0 rounded-full z-0 ${
                    isDark 
                      ? 'bg-white/5 border border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)] backdrop-blur-md' 
                      : 'bg-white border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
                  }`}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Bento Grid Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* Render SPOTLIGHT Featured Project if category is 'All' or matches featured project category */}
        {projectBelongsToCategory(featuredProject, activeCategory) && (
          <motion.div
            layout
            variants={itemVariants}
            className={`col-span-1 lg:col-span-12 p-8 md:p-10 rounded-[40px] relative overflow-hidden transition-all duration-500 hover:shadow-2xl border ${
              isDark 
                ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5 hover:border-[#007AFF]/20' 
                : 'bg-white hover:bg-slate-50/80 border-neutral-200/60 hover:border-[#007AFF]/15'
            } flex flex-col justify-between group`}
          >
            {/* Ambient Background Glow Layer */}
            <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full filter blur-[120px] opacity-15 pointer-events-none bg-[#007AFF]/30 transition-opacity group-hover:opacity-25" />
            
            <div className="relative z-10 w-full">
              {/* Card Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                  isDark ? 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20' : 'bg-[#007AFF]/5 text-[#007AFF] border border-[#007AFF]/10'
                }`}>
                  Spotlight System Spec
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Active Status: <span className="text-emerald-500 font-semibold">{featuredProject.status}</span>
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-6">
                  <h2 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight mb-4 group-hover:text-[#007AFF] transition-colors duration-300">
                    {featuredProject.title}
                  </h2>
                  <p className={`text-sm md:text-base font-light leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {featuredProject.description}
                  </p>
                </div>

                {/* Tech Badges Column */}
                <div className="lg:col-span-6 flex flex-col justify-end lg:items-end">
                  <span className={`text-[9px] uppercase font-mono tracking-widest mb-3 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    System Stack Configuration
                  </span>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {featuredProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide border ${
                          isDark 
                            ? 'bg-white/5 border-white/5 text-slate-300' 
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics & Action Links */}
            <div className="relative z-10 border-t border-white/5 pt-8 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                {featuredProject.metrics.map((metric) => (
                  <div key={metric.label}>
                    <span className={`text-2xl md:text-3xl font-serif italic block font-medium text-glow-blue ${
                      isDark ? 'text-white' : 'text-neutral-900'
                    }`}>
                      {metric.value}
                    </span>
                    <span className={`text-[9px] uppercase font-sans tracking-widest block mt-1 leading-none ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Links */}
              <div className="col-span-1 flex items-center justify-end gap-4">
                <a
                  href={featuredProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-3 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                    isDark 
                      ? 'bg-white/5 border-white/5 text-slate-300 hover:text-white hover:bg-[#007AFF]/10 hover:border-[#007AFF]/25' 
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-neutral-950 hover:bg-[#007AFF]/5 hover:border-[#007AFF]/20'
                  }`}
                  aria-label="GitHub Repository"
                >
                  <Github className="w-4 h-4" />
                </a>
                
                {featuredProject.demoUrl && (
                  <a
                    href={featuredProject.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all duration-300 border ${
                      isDark 
                        ? 'bg-white text-black border-transparent hover:bg-neutral-200 shadow-glow' 
                        : 'bg-neutral-900 text-white border-transparent hover:bg-neutral-800'
                    }`}
                  >
                    <span>Live Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Render OTHER Projects dynamically */}
        <AnimatePresence mode="popLayout">
          {filteredProjects
            .filter(p => p.id !== featuredProject.id)
            .map((proj, idx) => {
              const isLarge = idx % 3 === 0;
              return (
                <motion.div
                  key={proj.id}
                  layout
                  variants={itemVariants}
                  exit="exit"
                  className={`p-6 md:p-8 rounded-[32px] border transition-all duration-500 hover:shadow-xl ${
                    isLarge ? 'col-span-1 lg:col-span-8' : 'col-span-1 lg:col-span-4'
                  } ${
                    isDark 
                      ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5 hover:border-[#007AFF]/15' 
                      : 'bg-white hover:bg-slate-50/80 border-neutral-200/60 hover:border-[#007AFF]/10'
                  } flex flex-col justify-between group`}
                >
                  <div>
                    {/* Top Status */}
                    <div className="flex items-center justify-between mb-5">
                      <span className={`text-[9px] uppercase font-sans tracking-widest px-2.5 py-1 rounded-full font-bold border ${
                        isDark
                          ? proj.status === 'Deployed' 
                            ? 'bg-[#007AFF]/15 text-[#007AFF] border-[#007AFF]/25' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : proj.status === 'Deployed'
                            ? 'bg-[#007AFF]/5 text-[#007AFF] border-[#007AFF]/10'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {proj.status}
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        P-{proj.priority[currentMode]}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold font-sans tracking-tight mb-3 group-hover:text-[#007AFF] transition-colors duration-300">
                      {proj.title}
                    </h3>
                    <p className={`text-xs font-light leading-relaxed mb-6 ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {proj.description}
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {proj.technologies.map((tech) => (
                        <span
                          key={tech}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide border ${
                            isDark 
                              ? 'bg-white/5 border-white/5 text-slate-400' 
                              : 'bg-slate-100 border-slate-200/60 text-slate-600'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metrics & Links */}
                  <div className="border-t border-white/5 pt-5 mt-4 flex items-center justify-between gap-4">
                    <div className="flex gap-4">
                      {proj.metrics.slice(0, 2).map((m) => (
                        <div key={m.label}>
                          <span className="text-lg font-serif italic font-medium block text-[#007AFF] text-glow-blue leading-none">
                            {m.value}
                          </span>
                          <span className={`text-[8px] uppercase font-sans tracking-wider block mt-1 ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {m.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                          isDark 
                            ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10' 
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-neutral-900 hover:bg-slate-200'
                        }`}
                        aria-label="GitHub Repository"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                      
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                            isDark 
                              ? 'bg-[#007AFF]/10 border-[#007AFF]/20 text-[#007AFF] hover:bg-[#007AFF]/20' 
                              : 'bg-[#007AFF]/5 border-[#007AFF]/15 text-[#007AFF] hover:bg-[#007AFF]/10'
                          }`}
                          aria-label="Live Demo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
