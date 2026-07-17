/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileMode, RoleDefinition } from '../types';
import ThemeToggle from './ThemeToggle';
import RoleToggle from './RoleToggle';
import { Menu, X, FileText, ArrowUpRight, ChevronDown } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  currentMode: ProfileMode;
  onModeChange: (mode: ProfileMode) => void;
  rolesList: RoleDefinition[];
}

export default function Navbar({ isDark, toggleTheme, currentMode, onModeChange, rolesList }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const location = useLocation();
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Projects', path: '/projects' },
    { label: 'Skills', path: '/skills' },
    { label: 'Certifications', path: '/certifications' },
    { label: 'Timeline', path: '/timeline' },
    { label: 'Blogs', path: '/blog' },
    { label: 'Contact', path: '/contact' },
    { label: 'Semantic Explorer', path: '/dashboard' },
    { label: 'Admin Panel', path: '/admin' },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setMenuDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav
        id="global-navbar"
        className={`fixed left-1/2 -translate-x-1/2 w-[94%] md:w-[90%] max-w-7xl z-50 transition-all duration-500 ease-out rounded-full flex items-center justify-between px-6 md:px-10 top-4 py-3.5 ${
          isDark
            ? 'bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:border-white/20'
            : 'bg-white/85 backdrop-blur-xl border border-black/5 shadow-[0_10px_35px_rgba(0,0,0,0.04)] hover:border-black/10'
        }`}
      >
        <div className="w-full flex items-center justify-between">
          
          {/* Circular DP Logo with "AS" Fallback */}
          <Link
            to="/"
            id="navbar-logo"
            className="group flex items-center gap-2 select-none focus:outline-none"
          >
            <div 
              className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm tracking-widest transition-all duration-300 overflow-hidden ${
                isDark 
                  ? 'bg-gradient-to-tr from-neutral-800 to-black border border-white/10 text-white group-hover:scale-105 group-hover:border-white/25 shadow-glow' 
                  : 'bg-gradient-to-tr from-white to-slate-100 border border-black/10 text-neutral-900 group-hover:scale-105 group-hover:border-black/20 shadow-sm'
              }`}
            >
              {!imgError ? (
                <img 
                  src="/api/v1/portfolio/assets/avatar.jpg" 
                  alt="AS" 
                  onError={() => setImgError(true)} 
                  className="w-full h-full object-cover"
                />
              ) : (
                "AS"
              )}
            </div>
            <div className="hidden sm:block text-left">
              <span className={`text-xs block font-bold tracking-widest font-display uppercase leading-none ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Adarsh Singh
              </span>
              <span className={`text-[9px] block font-mono tracking-wider transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {currentMode === 'data-engineer' ? 'DATA ENGINE' : 'AI & DATA'}
              </span>
            </div>
          </Link>

          {/* Right Controls: Hover Profile Toggle + Theme Switch + Resume Button */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* custom theme manual toggle */}
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

            {/* view resume dynamic link */}
            <a
              href="/api/v1/portfolio/assets/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 focus:outline-none transition-all duration-300 cursor-pointer ${
                isDark 
                  ? 'bg-white text-black hover:bg-neutral-200 border border-transparent hover:shadow-[0_0_15px_rgba(255,255,255,0.25)]' 
                  : 'bg-neutral-900 text-white hover:bg-neutral-800 border border-transparent hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume</span>
            </a>

            {/* Desktop Navigation Links (Collapsed under a single Menu dropdown on the right) */}
            <div 
              ref={menuContainerRef}
              onMouseEnter={() => setMenuDropdownOpen(true)}
              onMouseLeave={() => setMenuDropdownOpen(false)}
              className="relative"
              id="desktop-nav-menu"
            >
              <button
                onClick={() => setMenuDropdownOpen(prev => !prev)}
                className={`px-5 py-2 rounded-full flex items-center gap-2 text-xs font-semibold tracking-wider transition-all duration-300 focus:outline-none cursor-pointer border ${
                  isDark 
                    ? 'bg-black/60 border-white/10 hover:border-[#007AFF]/45 text-slate-300 hover:text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]' 
                    : 'bg-white border-slate-200 hover:border-[#007AFF]/35 text-slate-700 hover:text-neutral-950 shadow-sm'
                }`}
              >
                <Menu className="w-3.5 h-3.5" />
                <span className="font-display tracking-widest uppercase">Menu</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${menuDropdownOpen ? 'rotate-180 text-[#007AFF]' : ''}`} />
              </button>

              <AnimatePresence>
                {menuDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`absolute right-0 mt-2 p-1.5 w-56 rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden ${
                      isDark 
                        ? 'bg-neutral-950/95 border-white/10 text-white' 
                        : 'bg-white/95 border-slate-200 text-neutral-800'
                    }`}
                  >
                    <div className={`px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.2em] border-b mb-1.5 ${
                      isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'
                    }`}>
                      Navigation
                    </div>
                    <div className="flex flex-col gap-1">
                      {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.label}
                            to={item.path}
                            onClick={() => setMenuDropdownOpen(false)}
                            className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wider transition-colors duration-250 ${
                              isActive 
                                ? isDark 
                                  ? 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20 shadow-[inset_0_1px_8px_rgba(0,122,255,0.05)]' 
                                  : 'bg-[#007AFF]/5 text-[#007AFF] border border-[#007AFF]/10'
                                : isDark
                                  ? 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                                  : 'hover:bg-slate-50 text-slate-600 hover:text-neutral-900 border border-transparent'
                            }`}
                          >
                            <span className="font-display tracking-widest uppercase">{item.label}</span>
                            {isActive && <span className="w-1 h-1 rounded-full bg-[#007AFF] animate-pulse" />}
                          </Link>
                        );
                      })}
                    </div>

                    <div className={`px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-[0.2em] border-t border-b my-1.5 ${
                      isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'
                    }`}>
                      Switch Profile
                    </div>
                    <div className="flex flex-col gap-1">
                      {rolesList.map((role) => {
                        const isActive = currentMode === role.id;
                        return (
                          <button
                            key={role.id}
                            onClick={() => {
                              onModeChange(role.id);
                              setMenuDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold tracking-wider text-left transition-colors duration-250 cursor-pointer focus:outline-none ${
                              isActive 
                                ? isDark 
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                                  : 'bg-[#007AFF]/5 text-[#007AFF] border border-[#007AFF]/10'
                                : isDark
                                  ? 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                                  : 'hover:bg-slate-50 text-slate-600 hover:text-neutral-900 border border-transparent'
                            }`}
                          >
                            <span className="font-display tracking-widest uppercase">{role.label}</span>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Buttons Layout */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            
            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 rounded-full border cursor-pointer focus:outline-none ${
                isDark 
                  ? 'bg-neutral-950 border-neutral-800 text-slate-300 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
              aria-label="Open primary layout menu"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as any }}
            className={`fixed inset-x-0 top-[76px] z-40 p-6 flex flex-col gap-6 lg:hidden border-b ${
              isDark 
                ? 'bg-black/95 backdrop-blur-xl border-neutral-900 text-white shadow-2xl' 
                : 'bg-white/95 backdrop-blur-xl border-slate-100 text-neutral-900 shadow-xl'
            }`}
          >
            {/* Mobile Mode Switcher indicator */}
            <div className="flex flex-col gap-2 border-b pb-4 px-2" id="mobile-role-selector-box">
              <span className={`text-[10px] uppercase font-mono tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Portfolio Profile Mode
              </span>
              <div className="flex flex-wrap gap-2">
                {rolesList.map((role) => {
                  const isActive = currentMode === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => {
                        onModeChange(role.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        isActive
                          ? isDark
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'bg-[#007AFF] text-white border border-transparent shadow-sm'
                          : isDark
                            ? 'bg-neutral-900 text-slate-400 border border-neutral-800'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {role.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Navigation List */}
            <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-medium uppercase tracking-wider py-1.5 px-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-neutral-900 font-bold'
                        : isDark ? 'text-slate-300 hover:bg-neutral-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-neutral-950'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Call-To-Action Link */}
            <a
              href="/api/v1/portfolio/assets/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full py-3 rounded-xl text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 focus:outline-none transition-all duration-300 ${
                isDark 
                  ? 'bg-neutral-900 text-white border border-white/15' 
                  : 'bg-slate-100 text-neutral-900 border border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>View Resume</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
