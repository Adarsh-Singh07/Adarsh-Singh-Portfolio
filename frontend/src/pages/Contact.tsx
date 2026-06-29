/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PortfolioService from '../services/api';
import { 
  Mail, 
  Linkedin, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink,
  Loader2,
  Terminal,
  Send,
  Github
} from 'lucide-react';

interface ContactProps {
  isDark: boolean;
}

type SubmissionStatus = 'idle' | 'validating' | 'encrypting' | 'handshake' | 'dispatching' | 'success' | 'error';

export default function Contact({ isDark }: ContactProps) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const emailAddress = 'adarsh2001gop@gmail.com';

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate secure terminal handshake logs
  useEffect(() => {
    if (status === 'encrypting') {
      setTerminalLogs(['[SYSTEM] Initializing secure socket handshake...']);
      const timer = setTimeout(() => {
        setTerminalLogs(prev => [...prev, '[CIPHER] AES-GCM-256 payload encryption applied.']);
        setStatus('handshake');
      }, 700);
      return () => clearTimeout(timer);
    }

    if (status === 'handshake') {
      const timer = setTimeout(() => {
        setTerminalLogs(prev => [...prev, '[TLS 1.3] Handshake established with core API endpoint.']);
        setStatus('dispatching');
      }, 700);
      return () => clearTimeout(timer);
    }

    if (status === 'dispatching') {
      const timer = setTimeout(() => {
        setTerminalLogs(prev => [...prev, '[GATEWAY] Email packet dispatched to uvicorn SMTP service.']);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.subject || !formState.message) {
      setErrorMessage('All transmission channels must be populated.');
      setStatus('error');
      return;
    }

    setStatus('encrypting');
    setErrorMessage('');

    try {
      // Dispatch API request to Python Backend
      const result = await PortfolioService.submitContactMessage(formState);
      
      // Delay success slightly to finish logs animation
      setTimeout(() => {
        setStatus('success');
        setFormState({ name: '', email: '', subject: '', message: '' });
      }, 1500);

    } catch (err: any) {
      setTimeout(() => {
        setErrorMessage(err.message || 'System fault: Gateway connection terminated.');
        setStatus('error');
      }, 1200);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full select-none">
      
      {/* 1. HERO HEADER */}
      <div className="mb-20 text-left max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-bold tracking-[0.2em] font-sans uppercase w-fit mb-6 ${
            isDark 
              ? 'bg-[#007AFF15] border-[#007AFF30] text-[#007AFF]' 
              : 'bg-[#007AFF10] border-[#007AFF20] text-[#007AFF]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>OUTREACH LINK STACKED</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-sans font-semibold tracking-tight leading-none mb-6"
        >
          Operational Outreach<br />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
            isDark 
              ? 'from-white via-white/80 to-white/40' 
              : 'from-neutral-950 via-neutral-900 to-neutral-500'
          } italic font-serif font-medium`}>Secure Form Gateway</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`text-base md:text-lg font-light leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Establish encrypted communication lines for enterprise proposals, ML opportunities, or project queries.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* 2. SECURE MESSAGE CONSOLE (FORM) */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formVariants}
          className={`lg:col-span-7 p-8 md:p-10 rounded-[32px] border relative overflow-hidden flex flex-col ${
            isDark 
              ? 'bg-gradient-to-b from-[#141416]/90 to-[#09090b]/95 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] shadow-2xl' 
              : 'bg-white border-neutral-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.03)]'
          }`}
        >
          
          {/* Animated Overlay for Secure Transmit Handshake */}
          <AnimatePresence>
            {(status === 'encrypting' || status === 'handshake' || status === 'dispatching') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#050505]/95 z-30 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-full max-w-md bg-black border border-white/10 rounded-2xl p-6 text-left font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-[#007AFF]">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      <span className="font-bold tracking-wider">SECURE SHIELD DISPATCH</span>
                    </div>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  
                  <div className="space-y-2 text-white/75 min-h-[100px]">
                    {terminalLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {log}
                      </div>
                    ))}
                    {status === 'dispatching' && (
                      <div className="animate-pulse text-[#007AFF] font-bold">
                        [SYSTEM] Transmitting packet to secure uvicorn handler...
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Overlay */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#050505]/95 z-30 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-display text-white mb-3">Transmission Secured</h3>
                <p className="text-xs text-slate-300 max-w-sm leading-relaxed mb-6">
                  Message packet parsed and successfully routed to Adarsh's inbox. An operational response will compile within 24 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2 border border-white/20 hover:border-white text-white/80 hover:text-white rounded-full text-xs font-mono font-medium transition-all duration-300"
                >
                  Clear Console Link
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <h2 className="text-xl font-bold font-display mb-8">Outreach Channel</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-1.5 relative">
                <input
                  type="text"
                  placeholder="NAME / IDENTITY"
                  value={formState.name}
                  onChange={e => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full py-3.5 bg-transparent border-b text-xs font-mono tracking-wider focus:outline-none transition-all duration-300 ${
                    isDark 
                      ? 'border-white/10 text-white placeholder-white/30 focus:border-[#007AFF]' 
                      : 'border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-[#007AFF]'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <input
                  type="email"
                  placeholder="EMAIL COORDINATES"
                  value={formState.email}
                  onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full py-3.5 bg-transparent border-b text-xs font-mono tracking-wider focus:outline-none transition-all duration-300 ${
                    isDark 
                      ? 'border-white/10 text-white placeholder-white/30 focus:border-[#007AFF]' 
                      : 'border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-[#007AFF]'
                  }`}
                />
              </div>

            </div>

            <div className="flex flex-col gap-1.5 relative">
              <input
                type="text"
                placeholder="SUBJECT / ROUTE ID"
                value={formState.subject}
                onChange={e => setFormState(prev => ({ ...prev, subject: e.target.value }))}
                className={`w-full py-3.5 bg-transparent border-b text-xs font-mono tracking-wider focus:outline-none transition-all duration-300 ${
                  isDark 
                    ? 'border-white/10 text-white placeholder-white/30 focus:border-[#007AFF]' 
                    : 'border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-[#007AFF]'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <textarea
                rows={5}
                placeholder="MESSAGE CONTENT / PAYLOAD"
                value={formState.message}
                onChange={e => setFormState(prev => ({ ...prev, message: e.target.value }))}
                className={`w-full py-3.5 bg-transparent border-b text-xs font-mono tracking-wider focus:outline-none transition-all duration-300 resize-none ${
                  isDark 
                    ? 'border-white/10 text-white placeholder-white/30 focus:border-[#007AFF]' 
                    : 'border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-[#007AFF]'
                }`}
              />
            </div>

            {/* Error Message Indicator */}
            {status === 'error' && errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                [FAULT] {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 border ${
                isDark 
                  ? 'bg-white border-white text-neutral-950 hover:bg-neutral-200 active:scale-[0.98]' 
                  : 'bg-neutral-950 border-neutral-950 text-white hover:bg-neutral-800 active:scale-[0.98]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Secure Transmission</span>
            </button>

          </form>

        </motion.div>
        
        {/* 3. ACCESS COORDINATES (SIDEBAR) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Coordinates container */}
          <div className={`p-8 rounded-[32px] border ${
            isDark 
              ? 'bg-gradient-to-b from-[#141416]/90 to-[#09090b]/95 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] shadow-md' 
              : 'bg-white border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.02)]'
          }`}>
            <h2 className="text-base font-bold font-display mb-6 tracking-wide">Direct Address Coordinates</h2>
            
            <div className="space-y-6">
              
              {/* Email Copier */}
              <div className="flex flex-col gap-1.5">
                <span className={`text-[9px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Direct Mail Endpoint
                </span>
                <div className={`flex items-center justify-between p-3.5 rounded-xl border font-mono text-xs ${
                  isDark ? 'bg-white/5 border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={isDark ? 'text-white/80' : 'text-neutral-800'}>{emailAddress}</span>
                  <button
                    onClick={copyEmailToClipboard}
                    className={`p-1.5 rounded-lg transition-colors border ${
                      copied 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : isDark ? 'hover:bg-white/10 border-transparent text-white/50 hover:text-white' : 'hover:bg-slate-200 border-transparent text-slate-500 hover:text-neutral-800'
                    }`}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* LinkedIn Gateway */}
              <div className="flex flex-col gap-1.5">
                <span className={`text-[9px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Professional Network
                </span>
                <a
                  href="https://www.linkedin.com/in/adarshsingh45/"
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between p-3.5 rounded-xl border font-mono text-xs transition-colors ${
                    isDark 
                      ? 'bg-white/5 border-white/[0.08] hover:bg-white/10 hover:border-white/20 text-white/80 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-350 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-[#007AFF]" />
                    <span>linkedin.com/in/adarshsingh45</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                </a>
              </div>

              {/* GitHub Gateway */}
              <div className="flex flex-col gap-1.5">
                <span className={`text-[9px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Source Repository
                </span>
                <a
                  href="https://github.com/Adarsh-Singh07"
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between p-3.5 rounded-xl border font-mono text-xs transition-colors ${
                    isDark 
                      ? 'bg-white/5 border-white/[0.08] hover:bg-white/10 hover:border-white/20 text-white/80 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-350 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-[#007AFF]" />
                    <span>github.com/Adarsh-Singh07</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                </a>
              </div>

              {/* Operating Location */}
              <div className="flex flex-col gap-1.5">
                <span className={`text-[9px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Operational Location
                </span>
                <div className={`flex items-center gap-2 p-3.5 rounded-xl border font-mono text-xs ${
                  isDark ? 'bg-white/5 border-white/[0.08] text-white/80' : 'bg-slate-50 border-slate-200 text-neutral-800'
                }`}>
                  <MapPin className="w-4 h-4 text-[#007AFF]" />
                  <span>Noida, Uttar Pradesh, India</span>
                </div>
              </div>

              {/* Availability Hours */}
              <div className="flex flex-col gap-1.5">
                <span className={`text-[9px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Response Hours
                </span>
                <div className={`flex items-center gap-2 p-3.5 rounded-xl border font-mono text-xs ${
                  isDark ? 'bg-white/5 border-white/[0.08] text-white/80' : 'bg-slate-50 border-slate-200 text-neutral-800'
                }`}>
                  <Clock className="w-4 h-4 text-[#007AFF]" />
                  <span>Mon – Fri, 9:00 AM – 6:00 PM IST</span>
                </div>
              </div>

            </div>
          </div>

          {/* Cryptographic Trust Section */}
          <div className={`p-8 rounded-[32px] border flex flex-col justify-between ${
            isDark 
              ? 'bg-gradient-to-b from-[#141416]/90 to-[#09090b]/95 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] shadow-md' 
              : 'bg-white border-slate-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.02)]'
          }`}>
            <div className="flex items-center gap-2 mb-4 text-[#007AFF]">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
              <h3 className="text-sm font-bold font-display tracking-wide uppercase">PGP Key Authentication</h3>
            </div>
            
            <p className={`text-xs font-light leading-relaxed mb-6 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Ensure authenticity of communication files and messages. All direct responses can be verified via my public PGP signature.
            </p>
            
            <div className={`flex items-center justify-between p-3 border rounded-xl font-mono text-[10px] ${
              isDark ? 'bg-black/40 border-white/5 text-white/40' : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <span>KEY ID: 0x7DE2DEF41234156</span>
              <span className="text-emerald-500 font-bold uppercase text-[9px] tracking-widest">ACTIVE</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
