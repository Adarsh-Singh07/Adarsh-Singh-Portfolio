/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';

interface AnimatedOrbProps {
  isDark: boolean;
}

export default function AnimatedOrb({ isDark }: AnimatedOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [pulseTrigger, setPulseTrigger] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [activeSector, setActiveSector] = useState('SYS_LOCK: ACTIVE');
  const [hudColorClass, setHudColorClass] = useState('text-cyan-400 border-cyan-400');

  const dimensionsRef = useRef({ width: 450, height: 450 });

  const handleMouseEnter = () => {
    setIsHovered(true);
    setPulseTrigger(prev => prev + 1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
    setActiveSector('SYS_LOCK: IDLE');
    setHudColorClass(isDark ? 'text-cyan-400 border-cyan-400' : 'text-blue-600 border-blue-600');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    dimensionsRef.current = { width, height };
    
    // Offset coordinates from the center of the container (-halfWidth to +halfWidth)
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;
    setCoords({ x, y });

    // Determine sector (North, South, East, West) based on mouse position
    if (Math.abs(x) > Math.abs(y)) {
      if (x > 0) {
        setActiveSector('SYS_SECTOR: EAST');
        setHudColorClass(isDark ? 'text-pink-400 border-pink-400/50' : 'text-pink-600 border-pink-500/40');
      } else {
        setActiveSector('SYS_SECTOR: WEST');
        setHudColorClass(isDark ? 'text-emerald-400 border-emerald-400/50' : 'text-emerald-600 border-emerald-500/40');
      }
    } else {
      if (y > 0) {
        setActiveSector('SYS_SECTOR: SOUTH');
        setHudColorClass(isDark ? 'text-amber-400 border-amber-400/50' : 'text-amber-600 border-amber-500/40');
      } else {
        setActiveSector('SYS_SECTOR: NORTH');
        setHudColorClass(isDark ? 'text-cyan-400 border-cyan-400/50' : 'text-blue-600 border-blue-500/40');
      }
    }
  };

  // Border and glow styles based on active sector when hovered
  const getDynamicGlowClass = () => {
    if (!isHovered) {
      return isDark 
        ? 'from-[#007AFF]/20 via-[#5AC8FA]/10 to-transparent opacity-25'
        : 'from-[#007AFF]/30 via-slate-100 to-transparent opacity-25';
    }
    if (activeSector === 'SYS_SECTOR: EAST') {
      return 'from-pink-500 via-[#8A2BE2] to-transparent opacity-60 scale-[1.3]';
    }
    if (activeSector === 'SYS_SECTOR: WEST') {
      return 'from-emerald-400 via-teal-900 to-transparent opacity-60 scale-[1.3]';
    }
    if (activeSector === 'SYS_SECTOR: SOUTH') {
      return 'from-amber-400 via-rose-900 to-transparent opacity-60 scale-[1.3]';
    }
    return 'from-cyan-400 via-blue-900 to-transparent opacity-60 scale-[1.3]';
  };

  return (
    <motion.div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className="relative w-full aspect-square max-w-[380px] md:max-w-[450px] mx-auto flex items-center justify-center select-none cursor-pointer group" 
      id="luxury-orb-container"
    >
      {/* Cyberpunk HUD Targeting Reticle */}
      <div className={`absolute inset-[-25px] md:inset-[-35px] pointer-events-none transition-all duration-700 select-none z-0 ${
        isHovered 
          ? 'opacity-90 scale-100 rotate-45' 
          : 'opacity-0 scale-90 rotate-0'
      }`}>
        {/* Corner Brackets */}
        <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 transition-colors duration-300 ${hudColorClass.split(' ')[1]}`} />
        <div className={`absolute top-0 left-0 w-1.5 h-1.5 transition-colors duration-300 bg-current ${hudColorClass.split(' ')[0]}`} />
        
        <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 transition-colors duration-300 ${hudColorClass.split(' ')[1]}`} />
        <div className={`absolute top-0 right-0 w-1.5 h-1.5 transition-colors duration-300 bg-current ${hudColorClass.split(' ')[0]}`} />

        <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 transition-colors duration-300 ${hudColorClass.split(' ')[1]}`} />
        <div className={`absolute bottom-0 left-0 w-1.5 h-1.5 transition-colors duration-300 bg-current ${hudColorClass.split(' ')[0]}`} />

        <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 transition-colors duration-300 ${hudColorClass.split(' ')[1]}`} />
        <div className={`absolute bottom-0 right-0 w-1.5 h-1.5 transition-colors duration-300 bg-current ${hudColorClass.split(' ')[0]}`} />

        {/* HUD Sub-labels */}
        <div className={`absolute top-2 left-8 font-mono text-[8px] uppercase tracking-widest transition-colors duration-300 ${hudColorClass.split(' ')[0]} animate-pulse`}>
          {activeSector}
        </div>
        <div className={`absolute bottom-2 right-8 font-mono text-[8px] uppercase tracking-widest ${isDark ? 'text-pink-500/80' : 'text-purple-600/80'} animate-pulse`}>
          TRK_COORD_X: {Math.round(coords.x)} Y: {Math.round(coords.y)}
        </div>
      </div>

      {/* Dynamic Ambient Background Glow */}
      <div 
        className={`absolute inset-0 rounded-full blur-[80px] mix-blend-screen transition-all duration-500 ${getDynamicGlowClass()}`}
        style={isHovered ? { transform: `translate(${coords.x * 0.1}px, ${coords.y * 0.1}px)` } : {}}
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

      {/* Main Breathing Orb Center with 3D Tilt Parallax */}
      <motion.div
        animate={{ 
          scale: isHovered ? 1.15 : 1,
          rotateX: isHovered ? -coords.y / 6 : 0,
          rotateY: isHovered ? coords.x / 6 : 0,
          rotateZ: isHovered ? (coords.x * coords.y) / 250 : 0
        }}
        transition={{ 
          scale: { type: 'spring' as any, stiffness: 350, damping: 15 },
          rotateX: { type: 'spring' as any, stiffness: 200, damping: 15 },
          rotateY: { type: 'spring' as any, stiffness: 200, damping: 15 },
          rotateZ: { type: 'spring' as any, stiffness: 200, damping: 15 }
        }}
        className="relative z-10 w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full flex items-center justify-center"
      >
        {/* Core sphere with metallic/liquid mirror effect */}
        <div 
          className={`w-full h-full rounded-full transition-all duration-500 relative overflow-hidden shadow-2xl ${
            isDark 
              ? isHovered
                ? 'bg-gradient-to-br from-neutral-700 via-[#1A0B2E] to-black border-2 border-[#00E5FF]/60 shadow-[inset_0_8px_32px_rgba(255,255,255,0.4),0_0_45px_rgba(0,229,255,0.5)]'
                : 'bg-gradient-to-br from-neutral-800 via-slate-950 to-black border border-white/20 shadow-[inset_0_8px_32px_rgba(255,255,255,0.15)]' 
              : isHovered
                ? 'bg-gradient-to-br from-white via-[#E8F0FE] to-neutral-200 border-2 border-[#007AFF]/60 shadow-[inset_0_12px_44px_rgba(255,255,255,1),0_15px_35px_rgba(0,122,255,0.3)]'
                : 'bg-gradient-to-br from-white via-slate-100 to-neutral-200 border border-black/10 shadow-[inset_0_12px_44px_rgba(255,255,255,1),0_15px_30px_rgba(0,0,0,0.06)]'
          }`}
        >
          {/* Internal liquid highlight */}
          <div 
            className={`absolute w-[45%] h-[45%] rounded-full blur-[8px] transition-all duration-300 ${
              isHovered 
                ? 'bg-gradient-to-br from-white/40 to-transparent'
                : isDark ? 'bg-gradient-to-br from-white/30 to-transparent' : 'bg-gradient-to-br from-white/90 to-transparent'
            }`}
            style={isHovered ? { 
              top: `${10 + (coords.y / dimensionsRef.current.height) * 35}%`, 
              left: `${15 + (coords.x / dimensionsRef.current.width) * 35}%` 
            } : {
              top: '10%',
              left: '15%'
            }}
          />
          {/* Secondary micro light pulse */}
          <div 
            className={`absolute bottom-[10%] right-[10%] w-[35%] h-[35%] rounded-full blur-[14px] bg-[#007AFF]/25 transition-all duration-500 ${
              isHovered ? 'scale-125 bg-[#00E5FF]/45' : 'animate-[glow-pulse_5s_ease-in-out_infinite]'
            }`}
          />
        </div>
      </motion.div>

      {/* Luxury Rings with dynamic orbital speed increases */}
      {/* Outer Ring 1 - Fast Tilt Ring */}
      <motion.div
        animate={{ 
          rotate: isHovered ? [0, 360] : [0, 360], 
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ 
          rotate: { repeat: Infinity, duration: isHovered ? 6 : 25, ease: "linear" },
          scale: { type: 'spring' as any, stiffness: 300, damping: 20 }
        }}
        style={{ transformOrigin: 'center' }}
        className={`absolute w-[290px] h-[290px] md:w-[380px] md:h-[380px] rounded-full border border-dashed pointer-events-none transition-colors duration-500 ${
          isHovered
            ? 'border-current'
            : isDark ? 'border-neutral-700/60' : 'border-neutral-300/80'
        } ${hudColorClass.split(' ')[0]}`}
      />

      {/* Internal Interactive Ring 2 - Glass Refraction */}
      <motion.div 
        animate={{ scale: isHovered ? 1.18 : 1 }}
        transition={{ type: 'spring' as any, stiffness: 300, damping: 20 }}
        style={{ transform: 'rotateX(65deg) rotateY(15deg)', transformStyle: 'preserve-3d' }}
        className="absolute w-[230px] h-[230px] md:w-[310px] md:h-[310px] pointer-events-none"
      >
        <div 
          className={`w-full h-full rounded-full border transition-all duration-500 ${
            isHovered
              ? isDark 
                ? 'animate-[spin-reverse_2s_linear_infinite] border-[#00E5FF] bg-white/[0.08] shadow-[0_0_35px_rgba(0,229,255,0.6),inset_0_0_15px_rgba(0,229,255,0.35)]' 
                : 'animate-[spin-reverse_2s_linear_infinite] border-[#007AFF] bg-black/[0.04]'
              : isDark 
                ? 'animate-[spin-reverse_35s_linear_infinite] border-white/10 bg-white/[0.01]' 
                : 'border-neutral-900/10 bg-black/[0.005] animate-[spin-reverse_35s_linear_infinite]'
          }`}
        />
      </motion.div>

      {/* Inner Metallic Precision Orbit Ring 3 */}
      <motion.div 
        animate={{ scale: isHovered ? 1.22 : 1 }}
        transition={{ type: 'spring' as any, stiffness: 300, damping: 20 }}
        style={{ transform: 'rotateX(45deg) rotateY(-30deg)', transformStyle: 'preserve-3d' }}
        className="absolute w-[320px] h-[320px] md:w-[410px] md:h-[410px] pointer-events-none"
      >
        <div 
          className={`w-full h-full rounded-full border transition-all duration-500 ${
            isHovered
              ? isDark 
                ? 'animate-[spin-slow_2.5s_linear_infinite] border-pink-400 shadow-[0_0_40px_rgba(244,63,94,0.65),inset_0_0_20px_rgba(244,63,94,0.35)]' 
                : 'animate-[spin-slow_2.5s_linear_infinite] border-[#007AFF] bg-white/[0.02]'
              : isDark 
                ? 'animate-[spin-slow_45s_linear_infinite] border-sky-500/20' 
                : 'border-slate-400/30 animate-[spin-slow_45s_linear_infinite]'
          }`}
        />
      </motion.div>

      {/* Floating Sparkles */}
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
