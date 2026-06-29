/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';

interface AnimatedOrbProps {
  isDark: boolean;
}

export default function AnimatedOrb({ isDark }: AnimatedOrbProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [pulseTrigger, setPulseTrigger] = useState(0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setPulseTrigger(prev => prev + 1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-square max-w-[380px] md:max-w-[450px] mx-auto flex items-center justify-center select-none cursor-pointer group" 
      id="luxury-orb-container"
    >
      {/* Cyberpunk HUD Targeting Reticle */}
      <div className={`absolute inset-[-25px] md:inset-[-35px] pointer-events-none transition-all duration-700 select-none z-0 ${
        isHovered 
          ? 'opacity-80 scale-100 rotate-45' 
          : 'opacity-0 scale-90 rotate-0'
      }`}>
        {/* Corner Brackets */}
        <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 transition-colors duration-500 ${isDark ? 'border-cyan-400' : 'border-blue-600'}`} />
        <div className={`absolute top-0 left-0 w-1.5 h-1.5 ${isDark ? 'bg-cyan-400' : 'bg-blue-600'}`} />
        
        <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 transition-colors duration-500 ${isDark ? 'border-cyan-400' : 'border-blue-600'}`} />
        <div className={`absolute top-0 right-0 w-1.5 h-1.5 ${isDark ? 'bg-cyan-400' : 'bg-blue-600'}`} />

        <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 transition-colors duration-500 ${isDark ? 'border-cyan-400' : 'border-blue-600'}`} />
        <div className={`absolute bottom-0 left-0 w-1.5 h-1.5 ${isDark ? 'bg-cyan-400' : 'bg-blue-600'}`} />

        <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 transition-colors duration-500 ${isDark ? 'border-cyan-400' : 'border-blue-600'}`} />
        <div className={`absolute bottom-0 right-0 w-1.5 h-1.5 ${isDark ? 'bg-cyan-400' : 'bg-blue-600'}`} />

        {/* HUD Sub-labels */}
        <div className={`absolute top-2 left-8 font-mono text-[8px] uppercase tracking-widest ${isDark ? 'text-cyan-400/80' : 'text-blue-600/80'} animate-pulse`}>
          SYS_LOCK: ON
        </div>
        <div className={`absolute bottom-2 right-8 font-mono text-[8px] uppercase tracking-widest ${isDark ? 'text-pink-500/80' : 'text-purple-600/80'} animate-pulse`}>
          TRK_INDEX_ADARSH
        </div>
      </div>

      {/* Dynamic Ambient Background Glow */}
      <div 
        className={`absolute inset-0 rounded-full blur-[80px] mix-blend-screen transition-all duration-700 ${
          isDark 
            ? isHovered
              ? 'bg-gradient-to-tr from-[#00E5FF] via-[#8A2BE2] to-[#FF007F] opacity-60 scale-[1.25]'
              : 'bg-gradient-to-tr from-[#007AFF] via-[#5AC8FA] to-transparent opacity-25'
            : isHovered
              ? 'bg-gradient-to-tr from-[#007AFF]/60 via-[#8A2BE2]/40 to-[#FF007F]/30 opacity-55 scale-[1.25]'
              : 'bg-gradient-to-tr from-[#007AFF]/50 via-slate-100 to-transparent opacity-25'
        }`}
      />

      {/* Pulsing expanding neon shockwaves on hover trigger */}
      <motion.div
        key={`shockwave-cyan-${pulseTrigger}`}
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={pulseTrigger > 0 ? { scale: 2.2, opacity: 0 } : { scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`absolute w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full border-2 pointer-events-none z-20 ${
          isDark ? 'border-cyan-400' : 'border-blue-500'
        }`}
      />
      <motion.div
        key={`shockwave-pink-${pulseTrigger}`}
        initial={{ scale: 0.75, opacity: 0.9 }}
        animate={pulseTrigger > 0 ? { scale: 1.9, opacity: 0 } : { scale: 0.75, opacity: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
        className={`absolute w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full border pointer-events-none z-20 ${
          isDark ? 'border-pink-500' : 'border-purple-500'
        }`}
      />

      {/* Main Breathing Orb Center */}
      <motion.div
        animate={{ 
          scale: isHovered ? 1.15 : 1,
          rotate: isHovered ? [0, 8, -8, 8, -8, 0] : 0
        }}
        transition={{ 
          scale: { type: 'spring', stiffness: 350, damping: 15 },
          rotate: { repeat: isHovered ? Infinity : 0, duration: 2.2, ease: "easeInOut" }
        }}
        className="relative z-10 w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full flex items-center justify-center"
      >
        {/* Core sphere with metallic/liquid mirror effect */}
        <div 
          className={`w-full h-full rounded-full transition-all duration-700 relative overflow-hidden animate-[float-slow_8s_ease-in-out_infinite] ${
            isDark 
              ? isHovered
                ? 'bg-gradient-to-br from-neutral-700 via-[#1A0B2E] to-black border border-[#00E5FF]/50 shadow-[inset_0_8px_32px_rgba(255,255,255,0.3)] shadow-[0_0_45px_rgba(0,229,255,0.4)]'
                : 'bg-gradient-to-br from-neutral-800 via-slate-950 to-black border border-white/20 shadow-[inset_0_8px_32px_rgba(255,255,255,0.15)]' 
              : isHovered
                ? 'bg-gradient-to-br from-white via-[#E8F0FE] to-neutral-200 border border-[#007AFF]/40 shadow-[inset_0_12px_44px_rgba(255,255,255,1),0_15px_35px_rgba(0,122,255,0.25)]'
                : 'bg-gradient-to-br from-white via-slate-100 to-neutral-200 border border-black/10 shadow-[inset_0_12px_44px_rgba(255,255,255,1),0_15px_30px_rgba(0,0,0,0.06)]'
          }`}
        >
          {/* Internal liquid highlight */}
          <div 
            className={`absolute top-[10%] left-[15%] w-[40%] h-[40%] rounded-full blur-[8px] opacity-70 transition-opacity duration-500 ${
              isHovered 
                ? 'opacity-90'
                : isDark ? 'bg-gradient-to-br from-white/30 to-transparent' : 'bg-gradient-to-br from-white/90 to-transparent'
            }`}
          />
          {/* Secondary micro light pulse */}
          <div 
            className={`absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full blur-[14px] bg-[#007AFF]/20 transition-all duration-500 ${
              isHovered ? 'scale-125 bg-[#00E5FF]/40' : 'animate-[glow-pulse_5s_ease-in-out_infinite]'
            }`}
          />
        </div>

        {/* Outer electric core outline aura */}
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-700 animate-[float-slow_8s_ease-in-out_infinite_100ms] ${
            isDark 
              ? isHovered
                ? 'border-2 border-[#00E5FF] shadow-[0_0_60px_rgba(0,229,255,0.85),inset_0_0_20px_rgba(0,229,255,0.5)] scale-[1.05]'
                : 'border-2 border-[#007AFF]/20 shadow-[0_0_40px_rgba(0,122,255,0.3)]' 
              : isHovered
                ? 'border-2 border-[#007AFF] shadow-[0_0_35px_rgba(0,122,255,0.4)] scale-[1.05]'
                : 'border-2 border-slate-300/40 shadow-[0_0_20px_rgba(0,0,0,0.03)]'
          }`}
        />
      </motion.div>

      {/* Luxury Rings */}
      {/* Outer Ring 1 - Fast Tilt Ring */}
      <motion.div
        animate={{ 
          rotate: [0, 360], 
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ 
          rotate: { repeat: Infinity, duration: isHovered ? 4.5 : 25, ease: "linear" },
          scale: { type: 'spring', stiffness: 300, damping: 20 }
        }}
        style={{ transformOrigin: 'center' }}
        className={`absolute w-[290px] h-[290px] md:w-[380px] md:h-[380px] rounded-full border border-dashed pointer-events-none transition-colors duration-700 ${
          isHovered
            ? 'border-[#00E5FF]/70'
            : isDark ? 'border-neutral-700/60' : 'border-neutral-300/80'
        }`}
      />

      {/* Internal Interactive Ring 2 - Glass Refraction (Optimized: No GPU-blocking blur) */}
      <motion.div 
        animate={{ scale: isHovered ? 1.18 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ transform: 'rotateX(65deg) rotateY(15deg)', transformStyle: 'preserve-3d' }}
        className="absolute w-[230px] h-[230px] md:w-[310px] md:h-[310px] pointer-events-none"
      >
        <div 
          className={`w-full h-full rounded-full border transition-all duration-700 ${
            isHovered
              ? isDark 
                ? 'animate-[spin-reverse_3.2s_linear_infinite] border-[#00E5FF] bg-white/[0.08] shadow-[0_0_35px_rgba(0,229,255,0.6),inset_0_0_15px_rgba(0,229,255,0.35)]' 
                : 'animate-[spin-reverse_3.2s_linear_infinite] border-[#007AFF] bg-black/[0.04]'
              : isDark 
                ? 'animate-[spin-reverse_35s_linear_infinite] border-white/10 bg-white/[0.01]' 
                : 'border-neutral-900/10 bg-black/[0.005] animate-[spin-reverse_35s_linear_infinite]'
          }`}
        />
      </motion.div>

      {/* Inner Metallic Precision Orbit Ring 3 */}
      <motion.div 
        animate={{ scale: isHovered ? 1.22 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ transform: 'rotateX(45deg) rotateY(-30deg)', transformStyle: 'preserve-3d' }}
        className="absolute w-[320px] h-[320px] md:w-[410px] md:h-[410px] pointer-events-none"
      >
        <div 
          className={`w-full h-full rounded-full border transition-all duration-700 ${
            isHovered
              ? isDark 
                ? 'animate-[spin-slow_3.8s_linear_infinite] border-pink-400 shadow-[0_0_40px_rgba(244,63,94,0.65),inset_0_0_20px_rgba(244,63,94,0.35)]' 
                : 'animate-[spin-slow_3.8s_linear_infinite] border-[#007AFF] bg-white/[0.02]'
              : isDark 
                ? 'animate-[spin-slow_45s_linear_infinite] border-sky-500/20' 
                : 'border-slate-400/30 animate-[spin-slow_45s_linear_infinite]'
          }`}
        />
      </motion.div>

      {/* Floating Sparkles (pure luxury geometry, accelerated on hover) */}
      <motion.div
        animate={{ 
          y: isHovered ? [0, -22, 0] : [0, -10, 0],
          scale: isHovered ? 1.8 : 1
        }}
        transition={{ repeat: Infinity, duration: isHovered ? 1.2 : 4, ease: "easeInOut" }}
        className={`absolute top-[20%] left-[10%] w-2 h-2 rounded-full transition-all duration-500 ${
          isHovered 
            ? 'bg-[#00E5FF] shadow-[0_0_15px_#00E5FF]' 
            : isDark ? 'bg-indigo-400/40' : 'bg-neutral-600/40'
        }`}
      />
      <motion.div
        animate={{ 
          y: isHovered ? [0, 20, 0] : [0, 8, 0],
          scale: isHovered ? 1.8 : 1
        }}
        transition={{ repeat: Infinity, duration: isHovered ? 1.4 : 5, ease: "easeInOut", delay: 0.5 }}
        className={`absolute bottom-[25%] right-[15%] w-1.5 h-1.5 rounded-full transition-all duration-500 ${
          isHovered 
            ? 'bg-[#FF007F] shadow-[0_0_15px_#FF007F]' 
            : isDark ? 'bg-sky-400/35' : 'bg-slate-500/35'
        }`}
      />
    </motion.div>
  );
}
