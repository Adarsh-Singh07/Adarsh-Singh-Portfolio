import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, FolderGit2, Mail, Compass } from 'lucide-react';

interface NotFoundProps {
  isDark: boolean;
}

export default function NotFound({ isDark }: NotFoundProps) {
  return (
    <div className={`min-h-[80vh] flex items-center justify-center px-6 py-24 transition-colors duration-1000 ${
      isDark ? 'bg-transparent text-white' : 'bg-transparent text-neutral-900'
    }`}>
      {/* React 19 Native Head Metadata Hoisting */}
      <title>404: Page Not Found | Adarsh Singh</title>
      <meta name="robots" content="noindex, follow" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full text-center relative"
      >
        {/* Soft backlighting glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full filter blur-[100px] opacity-10 bg-indigo-500 pointer-events-none" />

        {/* Dynamic Glowing icon container */}
        <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-8 border ${
          isDark 
            ? 'bg-neutral-900/60 border-white/10 text-cyan-400 shadow-[0_8px_30px_rgba(0,229,255,0.1)]' 
            : 'bg-white border-neutral-200 text-sky-600 shadow-[0_8px_20px_rgba(0,0,0,0.05)]'
        }`}>
          <Compass className="w-10 h-10 animate-[spin_20s_linear_infinite]" />
        </div>

        <h1 className="text-8xl font-black font-mono tracking-tighter mb-4 bg-gradient-to-r from-sky-400 via-[#007AFF] to-indigo-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-xl font-bold font-sans tracking-tight mb-3">
          Lost in Data Space?
        </h2>
        <p className={`text-sm font-light leading-relaxed mb-10 ${
          isDark ? 'text-slate-400' : 'text-slate-650'
        }`}>
          The endpoint you are trying to resolve doesn't exist or has been relocated. Let's redirect you back to a verified route.
        </p>

        {/* Redirection Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/"
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
              isDark 
                ? 'bg-neutral-900/40 border-white/5 hover:border-white/15 hover:bg-neutral-900 text-slate-200' 
                : 'bg-white border-neutral-200 hover:border-neutral-350 hover:bg-slate-50 text-neutral-800'
            }`}
          >
            <Home className="w-4 h-4 text-[#007AFF]" />
            <span>Home</span>
          </Link>
          <Link
            to="/projects"
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
              isDark 
                ? 'bg-neutral-900/40 border-white/5 hover:border-white/15 hover:bg-neutral-900 text-slate-200' 
                : 'bg-white border-neutral-200 hover:border-neutral-350 hover:bg-slate-50 text-neutral-800'
            }`}
          >
            <FolderGit2 className="w-4 h-4 text-[#007AFF]" />
            <span>Projects</span>
          </Link>
          <Link
            to="/contact"
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
              isDark 
                ? 'bg-neutral-900/40 border-white/5 hover:border-white/15 hover:bg-neutral-900 text-slate-200' 
                : 'bg-white border-neutral-200 hover:border-neutral-350 hover:bg-slate-50 text-neutral-800'
            }`}
          >
            <Mail className="w-4 h-4 text-[#007AFF]" />
            <span>Contact</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
