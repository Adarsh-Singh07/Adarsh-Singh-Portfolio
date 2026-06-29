/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { SkillCategory, Certification, ProfileMode } from '../types';
import { Cpu, Terminal, ShieldAlert, Award, Compass, Sparkles } from 'lucide-react';

interface SkillsSectionProps {
  categories: SkillCategory[];
  certifications: Certification[];
  currentMode: ProfileMode;
  isDark: boolean;
}

export default function SkillsSection({ categories, certifications, currentMode, isDark }: SkillsSectionProps) {
  // Sort category priority based on dynamic mode priority
  const sortedCategories = [...categories].sort((a, b) => {
    return a.priority[currentMode] - b.priority[currentMode];
  });

  // Sort certifications
  const sortedCerts = [...certifications].sort((a, b) => {
    return a.priority[currentMode] - b.priority[currentMode];
  });

  return (
    <section 
      id="skills" 
      className={`relative py-24 transition-colors duration-1000 ${
        isDark 
          ? 'bg-[#050505] text-white' 
          : 'bg-slate-50 text-neutral-900'
      }`}
    >
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        
        {/* Step 3 Section Title */}
        <div className="mb-16 text-left max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[1px] bg-[#007AFF]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#007AFF]">
              Capabilities & Verified Standards
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-semibold tracking-tight">
            Engineering Capability
          </h2>
          <p className={`mt-3.5 text-base md:text-lg font-light ${
            isDark ? 'text-white/50' : 'text-neutral-950/60'
          }`}>
            Building scalable systems across Data, AI, Cloud and intelligent automation.
          </p>
        </div>

        {/* --- DYNAMIC CAPABILITY CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {sortedCategories.map((cat, i) => {
            const isFeatured = i === 0;

            return (
              <motion.div
                key={cat.title}
                layout
                className={`p-6 md:p-8 rounded-[32px] border transition-all duration-550 shadow-sm relative overflow-hidden ${
                  isFeatured 
                    ? isDark 
                      ? 'bg-[#151515] border-[#007AFF]/25 shadow-[0_20px_45px_rgba(0,122,255,0.15)]' 
                      : 'bg-white border-[#007AFF]/20 shadow-[0_15px_30px_rgba(0,122,255,0.05)]'
                    : isDark 
                      ? 'bg-[#151515]/60 border-white/5 hover:border-white/10' 
                      : 'bg-white border-neutral-200/60 hover:border-[#007AFF]/10'
                }`}
              >
                {/* Active Highlight Glow for Top Category */}
                {isFeatured && (
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[40px] opacity-20 bg-[#007AFF]" />
                )}

                <div className="flex items-center justify-between gap-3 mb-6 relative z-10">
                  <h3 className="text-lg font-semibold font-sans tracking-tight">{cat.title}</h3>
                  <span className={`text-[9px] uppercase font-sans tracking-widest font-bold px-2.5 py-1 rounded-full ${
                    isFeatured 
                      ? 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20'
                      : isDark ? 'bg-white/5 text-slate-400 border border-white/5' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isFeatured ? 'Primary Domain' : `Rank #${cat.priority[currentMode]}`}
                  </span>
                </div>

                <div className="space-y-3.5 relative z-10">
                  {cat.skills.map((skill) => (
                    <div 
                      key={skill.name}
                      style={{ contentVisibility: 'auto' }}
                      className={`flex items-center justify-between py-1 border-b border-dashed ${
                        isDark ? 'border-white/5' : 'border-slate-200/50'
                      }`}
                    >
                      <span className={`text-xs font-normal tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {skill.name}
                      </span>
                      <span className={`text-[10px] font-sans font-bold tracking-wider transition-all duration-300 ${
                        skill.level === 'Expert' 
                          ? 'text-[#007AFF]' 
                          : skill.level === 'Advanced' 
                            ? 'text-[#5AC8FA]' 
                            : 'text-slate-400/80'
                      }`}>
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* --- PREMIUM CERTIFICATIONS WALL --- */}
        <div className="mt-24">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4.5 h-4.5 text-[#007AFF]" />
            <h3 className="text-2xl font-sans font-semibold tracking-tight">Verified Technical Credentials</h3>
          </div>
          <p className={`text-sm font-light mb-8 max-w-xl ${isDark ? 'text-white/50' : 'text-neutral-950/60'}`}>
            Elite validation of cloud operations, automated AI pipeline development, and cognitive API orchestration.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCerts.map((cert) => (
              <motion.div
                key={cert.id}
                layout
                className={`p-6 rounded-[24px] border transition-all duration-300 relative group overflow-hidden ${
                  isDark 
                    ? 'bg-[#151515]/60 border-white/5 hover:border-white/10 hover:shadow-xl' 
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Micro branding stamp background */}
                <div className={`absolute top-3 right-3 text-[11px] font-mono font-extrabold opacity-5 select-none ${
                  isDark ? 'text-white' : 'text-black'
                }`}>
                  VERIFIED-ID
                </div>

                <div className="flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-serif italic block uppercase tracking-wider mb-2 text-[#007AFF]">
                      {cert.issuer}
                    </span>
                    <h4 className="text-sm font-semibold font-sans tracking-wide mb-4 leading-snug">
                      {cert.title}
                    </h4>
                  </div>

                  <div className="pt-3.5 border-t border-dashed mt-2 flex items-center justify-between border-white/5">
                    <span className={`text-[10px] font-mono ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                      {cert.code ? `Code: ${cert.code}` : 'Reference Credential'}
                    </span>
                    <span className={`text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 rounded ${
                      isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {cert.date}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
