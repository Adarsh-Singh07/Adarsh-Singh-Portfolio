import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Cpu, Database, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { Project } from '../types';

interface HorizontalScrollShowcaseProps {
  projects: Project[];
  isDark: boolean;
}

export default function HorizontalScrollShowcase({ projects, isDark }: HorizontalScrollShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Bind scroll position to horizontal translation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smooth transform: scroll vertically through section -> translate track horizontally
  const xTransform = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "-65%"]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.4]);

  return (
    <section 
      ref={containerRef} 
      className={`py-16 md:py-28 relative overflow-hidden transition-colors duration-300 border-t ${
        isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#F8F9FA] border-black/5'
      }`}
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[250px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[#007AFF] block mb-2">
            Dual-Axis Experience
          </span>
          <h2 className="text-3xl md:text-5xl font-sans font-bold tracking-tight">
            Horizontal Smooth Showcase
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="hidden sm:inline">Drag or scroll to explore projects</span>
          <ChevronRight className="w-4 h-4 text-[#007AFF] animate-pulse" />
        </div>
      </div>

      {/* Horizontal Smooth Track Container */}
      <div className="w-full overflow-hidden cursor-grab active:cursor-grabbing">
        <motion.div 
          style={{ opacity: opacityTransform }}
          className="w-full"
        >
          <motion.div 
            style={{ x: xTransform }}
            drag="x"
            dragConstraints={{ left: -1400, right: 0 }}
            dragElastic={0.1}
            className="flex items-center gap-6 px-6 md:px-12 w-max"
          >
            {projects.map((project, idx) => (
              <motion.div
                key={project.id || idx}
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ duration: 0.3 }}
                className={`w-[320px] sm:w-[420px] md:w-[480px] p-7 md:p-8 rounded-[32px] border flex flex-col justify-between select-none relative group overflow-hidden transition-all duration-500 ${
                  isDark 
                    ? 'bg-neutral-900/60 border-white/10 hover:border-[#007AFF]/50 hover:shadow-[0_20px_40px_rgba(0,122,255,0.12)]' 
                    : 'bg-white border-neutral-200 hover:border-sky-400 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]'
                }`}
              >
                {/* Subtle card ambient highlight */}
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#007AFF]/10 rounded-full blur-2xl group-hover:bg-[#007AFF]/20 transition-all duration-500" />

                <div>
                  {/* Card Header Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20">
                      {project.status || 'Active'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      0{idx + 1} / 0{projects.length}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl md:text-2xl font-sans font-bold tracking-tight mb-3 group-hover:text-[#007AFF] transition-colors duration-300">
                    {project.title}
                  </h3>

                  <p className={`text-xs md:text-sm font-light leading-relaxed mb-6 line-clamp-3 ${
                    isDark ? 'text-slate-300' : 'text-slate-650'
                  }`}>
                    {project.description}
                  </p>
                </div>

                {/* Card Footer Tech Stack & Action */}
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-6 text-[10px] font-mono">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <span 
                        key={tech} 
                        className={`px-2.5 py-1 rounded-lg border ${
                          isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 5 && (
                      <span className={`px-2.5 py-1 rounded-lg border ${
                        isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                        +{project.technologies.length - 5}
                      </span>
                    )}
                  </div>

                  <Link 
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#007AFF] hover:underline cursor-pointer group/link"
                  >
                    <span>View Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
