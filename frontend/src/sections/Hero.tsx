/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { HeroConfig } from '../types';
import AnimatedOrb from '../components/AnimatedOrb';
import { Sparkles, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  config: HeroConfig;
  isDark: boolean;
}

export default function Hero({ config, isDark }: HeroProps) {
  // Stagger wrapper definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section 
      id="about" 
      className={`relative min-h-[100vh] flex items-center justify-center pt-28 pb-16 overflow-hidden ${
        isDark 
          ? 'bg-[#050505] text-white' 
          : 'bg-slate-50 text-neutral-900'
      }`}
    >
      {/* Absolute Cinematic Grid Pattern Background */}
      <div 
        className={`absolute inset-0 z-0 opacity-[0.02] md:opacity-[0.035] transition-colors duration-1000 ${
          isDark ? 'bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(0,0,0,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.15)_1px,transparent_1px)]'
        }`}
        style={{ backgroundSize: '45px 45px' }}
      />
      
      {/* High-Luxury Decorative Ambient Vignette */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full filter blur-[150px] opacity-10 bg-indigo-500/50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        {/* Split Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[70vh]">
          
          {/* Keynote Left Column */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-start gap-6 text-left"
          >
            {/* Elite Badge Header */}
            <motion.div 
              variants={itemVariants} 
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.2em] font-sans uppercase ${
                isDark 
                  ? 'bg-[#007AFF15] border-[#007AFF30] text-[#007AFF]' 
                  : 'bg-[#007AFF10] border-[#007AFF20] text-[#007AFF] shadow-sm'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse"></div>
              <span>{config.badge}</span>
            </motion.div>

            {/* Massive Keynote Headline */}
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className={`text-[2.6rem] sm:text-5xl md:text-7xl font-sans font-semibold tracking-tight leading-[0.95] ${
                isDark ? 'text-white' : 'text-neutral-900'
              }`}>
                Building<br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                  isDark 
                    ? 'from-white via-white to-white/30' 
                    : 'from-neutral-950 via-neutral-900 to-neutral-400'
                } italic font-serif font-medium`}>Intelligent Systems</span><br />
                for the Future
              </h1>
            </motion.div>

            {/* Premium Refined Narrative Subtext */}
            <motion.p 
              variants={itemVariants}
              className={`text-base md:text-lg font-light leading-relaxed max-w-md ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              {config.subtext}
            </motion.p>

            {/* Professional Actions Row */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 mt-2">
              <Link
                to="/projects"
                className={`py-4 px-9 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 focus:outline-none transition-transform duration-300 hover:scale-105 cursor-pointer ${
                  isDark 
                    ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.1)]' 
                    : 'bg-neutral-900 text-white shadow-[0_10px_25px_rgba(0,0,0,0.1)]'
                }`}
              >
                <span>Explore Work</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <a
                href="/Adarsh_Singh_CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={`py-4 px-9 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 focus:outline-none transition-transform duration-300 hover:scale-105 cursor-pointer border ${
                  isDark 
                    ? 'border-white/20 text-white hover:bg-white/5' 
                    : 'border-neutral-300 text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <span>Resume</span>
              </a>
            </motion.div>

            {/* Elegant Trust Row Certification Labels */}
            <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-white/5 w-full max-w-lg select-none">
              <span className={`text-[10px] block uppercase font-sans tracking-[0.3em] mb-4 font-bold ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Elite Credentials
              </span>
              <div className="flex flex-wrap gap-x-5 gap-y-3.5 items-center opacity-70 hover:opacity-100 transition-all">
                {config.trustRow.map((label, index) => (
                  <div key={label} className="flex items-center gap-3">
                    {index > 0 && <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white/20' : 'bg-neutral-300'}`} />}
                    <span className={`text-base font-medium ${
                      index % 2 === 0 
                        ? 'font-serif italic text-lg text-glow-blue' 
                        : 'font-sans font-bold tracking-tighter'
                    } ${
                      isDark ? 'text-white' : 'text-neutral-900'
                    }`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

          </motion.div>
          
          {/* Keynote Right Column (Specially Custom-crafted Animated Orb Avatar) */}
          <div className="lg:col-span-5 flex items-center justify-center relative w-full pt-6 lg:pt-0">
            <AnimatedOrb isDark={isDark} />
          </div>

        </div>
      </div>
    </section>
  );
}
