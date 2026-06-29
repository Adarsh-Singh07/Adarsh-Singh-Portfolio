/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Project, ProfileMode, Certification } from '../types';
import { 
  ArrowUpRight, 
  ExternalLink, 
  Cpu, 
  Database, 
  Award, 
  Briefcase, 
  Layers, 
  LineChart, 
  Code2 
} from 'lucide-react';

interface PortfolioBentoProps {
  projects: Project[];
  certifications: Certification[];
  currentMode: ProfileMode;
  isDark: boolean;
}

export default function PortfolioBento({ projects, certifications, currentMode, isDark }: PortfolioBentoProps) {
  // Dynamic sort of projects based on active mode priority
  const sortedProjects = [...projects].sort((a, b) => {
    return a.priority[currentMode] - b.priority[currentMode];
  });

  // Extract hero project dynamically
  const heroProject = sortedProjects.find(p => p.id === 'agentic-rag-platform') || sortedProjects[0];
  
  // Extract top certifications
  const featuredCerts = certifications.filter(c => c.featured).slice(0, 5);

  return (
    <section 
      id="projects" 
      className={`relative py-24 border-t transition-colors duration-1000 ${
        isDark 
          ? 'bg-[#050505] text-white border-neutral-900' 
          : 'bg-white text-neutral-900 border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        
        {/* Section Header */}
        <div className="mb-16 text-left max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[1px] bg-[#007AFF]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#007AFF]">
              Curation & Engineering Systems
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-semibold tracking-tight">
            Featured Bento &amp; Projects
          </h2>
          <p className={`mt-3.5 text-base md:text-lg font-light ${
            isDark ? 'text-white/50' : 'text-neutral-950/60'
          }`}>
            An asymmetrical display of critical production-grade creations, enterprise certifications, and active roles.
          </p>
        </div>

        {/* --- PREMIUM BENTO GRID (4 Columns/Grid Areas) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16 select-none">
          
          {/* Card 1: HERO FEATURED PROJECT (Agentic AI + RAG Platform) */}
          <motion.div 
            layout
            className={`col-span-1 lg:col-span-8 p-6 md:p-8 rounded-[40px] relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl border ${
              isDark 
                ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5' 
                : 'bg-white hover:bg-slate-50 border-neutral-200/60 hover:border-neutral-300'
            }`}
          >
            {/* Soft decorative background asset */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full filter blur-[100px] opacity-20 pointer-events-none bg-[#007AFF]/25" />

            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                    isDark ? 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20' : 'bg-[#007AFF]/5 text-[#007AFF] border border-[#007AFF]/10'
                  }`}>
                    Spotlight Engineering System
                  </span>
                  <span className={`text-xs font-mono ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                    Active Status: <span className="text-emerald-500 font-semibold">{heroProject.status}</span>
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight mb-3">
                  {heroProject.title}
                </h3>
                
                <p className={`text-sm md:text-base font-light leading-relaxed mb-6 max-w-xl ${
                  isDark ? 'text-white/50' : 'text-neutral-950/60'
                }`}>
                  {heroProject.description}
                </p>

                {/* Grid of technologies used in the project */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {heroProject.technologies.slice(0, 6).map((tech) => (
                    <span 
                      key={tech} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans tracking-wide ${
                        isDark ? 'bg-white/5 border border-white/5 text-slate-300' : 'bg-slate-100 border border-slate-200 text-slate-700'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Integrated Live Dynamic Metrics Row */}
              <div className="border-t border-white/5 pt-5 mt-4 grid grid-cols-3 gap-4">
                {heroProject.metrics.map((metric) => (
                  <div key={metric.label}>
                    <span className={`text-2xl md:text-3xl font-serif italic block font-medium text-glow-blue ${
                      isDark ? 'text-white' : 'text-neutral-900'
                    }`}>
                      {metric.value}
                    </span>
                    <span className={`text-[10px] uppercase font-sans tracking-widest block mt-0.5 ${
                      isDark ? 'text-white/40' : 'text-neutral-950/40'
                    }`}>
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* View Case Study trigger */}
              <div className="mt-6 flex items-center justify-end">
                <a 
                  href={heroProject.githubUrl}
                  target="_blank" 
                  rel="noreferrer"
                  className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transform hover:scale-102 transition-transform duration-300 ${
                    isDark ? 'text-white hover:text-[#007AFF]' : 'text-neutral-900 hover:text-[#007AFF]'
                  }`}
                >
                  <span>Build Architecture / Case Study</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Card 2: CORE EXPERTISE PANEL */}
          <motion.div 
            layout
            className={`col-span-1 lg:col-span-4 p-6 rounded-[32px] relative overflow-hidden transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl border ${
              isDark 
                ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5' 
                : 'bg-white hover:bg-slate-50 border-neutral-200/60 hover:border-neutral-300'
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-[#007AFF]" />
                  <span className={`text-[10px] uppercase font-sans tracking-widest font-bold ${
                    isDark ? 'text-white/40' : 'text-neutral-400'
                  }`}>
                    Core Competence Maps
                  </span>
                </div>
                
                <h3 className="text-xl font-sans font-semibold tracking-tight mb-4">
                  Intelligent Specializations
                </h3>

                <div className="space-y-3">
                  {[
                    "Data Engineering",
                    "Generative AI & LLMs",
                    "RAG Architectures",
                    "Distributed Computation",
                    "Cloud Infrastructure"
                  ].map((expertItem, i) => (
                    <div 
                      key={expertItem}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors duration-300 ${
                        isDark 
                          ? 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        currentMode === 'data-engineer' && i === 0 ? 'bg-sky-400 animate-ping' : 'bg-emerald-400'
                      }`} />
                      <span className="text-xs font-medium tracking-wide">{expertItem}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`mt-6 p-4 rounded-2xl text-[11px] font-mono leading-relaxed transition-colors duration-500 border ${
                isDark ? 'bg-black/20 text-white/40 border-white/5' : 'bg-slate-100/50 text-slate-500 border-slate-200/50'
              }`}>
                {currentMode === 'data-engineer' 
                  ? 'Optimized to favor low-latency data flow throughput, Spark, and Databricks.' 
                  : 'Staged for dynamic retrieval algorithms, OpenAI automators, and deep mathematical models.'}
              </div>
            </div>
          </motion.div>

          {/* Card 3: CAPGEMINI INDUSTRY CODES */}
          <motion.div 
            layout
            className={`col-span-1 lg:col-span-4 p-6 rounded-[32px] relative overflow-hidden transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl border ${
              isDark 
                ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5' 
                : 'bg-white hover:bg-slate-50 border-neutral-200/60 hover:border-neutral-300'
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4 text-[#007AFF]" />
                  <span className={`text-[10px] uppercase font-sans tracking-widest font-bold ${
                    isDark ? 'text-white/40' : 'text-neutral-400'
                  }`}>
                    Industry Placement
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-lg font-bold font-sans tracking-tight">Capgemini</h4>
                  <span className="text-xs block font-serif italic text-[#007AFF]">
                    Analyst – AI & Data Engineering
                  </span>
                </div>

                <p className={`text-xs font-light leading-relaxed ${isDark ? 'text-white/50' : 'text-neutral-950/60'}`}>
                  Specialized in analyzing massive structured records, optimizing cluster computations, and engineering scalable pipeline routines under clean Git automation frameworks.
                </p>
              </div>

              <div className="mt-6 flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl">
                <span className="text-[9px] uppercase font-sans tracking-widest text-emerald-500 font-bold">Active Placement</span>
                <span className="text-xs font-serif italic font-medium">Bengaluru, IN</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: CERTIFICATIONS STACK */}
          <motion.div 
            layout
            className={`col-span-1 lg:col-span-8 p-6 rounded-[32px] relative overflow-hidden transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl border ${
              isDark 
                ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5' 
                : 'bg-white hover:bg-slate-50 border-neutral-200/60 hover:border-neutral-300'
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-[#007AFF]" />
                  <span className={`text-[10px] uppercase font-sans tracking-widest font-bold ${
                    isDark ? 'text-white/40' : 'text-neutral-400'
                  }`}>
                    Industry Accreditations
                  </span>
                </div>

                <h3 className="text-xl font-sans font-semibold tracking-tight mb-4">
                  Cloud &amp; Intelligent Architecture Credentials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {featuredCerts.map((cert) => (
                    <div 
                      key={cert.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                        isDark 
                          ? 'bg-white/5 border-white/5 hover:border-white/10' 
                          : 'bg-slate-50 border-slate-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold tracking-tight font-sans">{cert.title}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-white/5">
                        <span className={`text-[10px] font-serif italic ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>{cert.issuer}</span>
                        <span className={`text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 rounded ${
                          isDark ? 'bg-white/10 text-[#007AFF]' : 'bg-slate-200 text-[#007AFF]'
                        }`}>
                          {cert.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* --- DETAILED HOVER PROJECTS (Product Showcase Style) --- */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-sans font-semibold tracking-tight">
              Featured Case Work
            </h3>
            <span className={`text-[10px] font-sans tracking-widest uppercase select-none ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
              Dynamic Priority Ordering Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sortedProjects.map((proj) => (
              <motion.div
                key={proj.id}
                layout
                className={`group p-6 md:p-7 rounded-[32px] border flex flex-col justify-between transition-all duration-500 transform hover:-translate-y-1 ${
                  isDark 
                    ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5 hover:border-[#007AFF]/30 hover:shadow-[0_20px_40px_rgba(0,122,255,0.15)]' 
                    : 'bg-white hover:bg-slate-50 border-neutral-200/60 hover:border-[#007AFF]/20 hover:shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-[9px] uppercase font-sans tracking-widest px-2.5 py-1 rounded-full font-bold ${
                      isDark 
                        ? proj.status === 'Deployed' ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-amber-500/10 text-amber-400'
                        : proj.status === 'Deployed' ? 'bg-[#007AFF]/5 text-[#007AFF]' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {proj.status}
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                      Priority index: #{proj.priority[currentMode]}
                    </span>
                  </div>

                  <h4 className="text-xl font-semibold font-sans tracking-tight mb-2.5 transition-colors group-hover:text-[#007AFF]">
                    {proj.title}
                  </h4>

                  <p className={`text-xs font-light leading-relaxed mb-5 ${
                    isDark ? 'text-white/50' : 'text-neutral-950/60'
                  }`}>
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {proj.technologies.map((t) => (
                      <span 
                        key={t}
                        className={`text-[10px] font-semibold font-sans tracking-wide px-2.5 py-0.5 rounded ${
                          isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <div className="flex gap-4">
                    {proj.metrics.slice(0, 1).map((m) => (
                      <div key={m.label}>
                        <span className="text-lg font-serif italic font-medium block text-[#007AFF] text-glow-blue">{m.value}</span>
                        <span className={`text-[9px] uppercase font-sans tracking-widest block ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>{m.label}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-2.5 rounded-full cursor-pointer transition-colors ${
                      isDark ? 'bg-white/5 text-white hover:bg-[#007AFF]/25' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
