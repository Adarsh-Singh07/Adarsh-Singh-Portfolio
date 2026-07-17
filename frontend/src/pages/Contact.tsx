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
  Github,
  Edit
} from 'lucide-react';
import { Coordinates, ProfileMode } from '../types';
import DetailEditModal from '../components/DetailEditModal';
import SEO from '../components/SEO';

interface ContactProps {
  isDark: boolean;
  coordinates?: Coordinates;
  currentMode: ProfileMode;
  onRefreshData?: () => void;
}

type SubmissionStatus = 'idle' | 'validating' | 'encrypting' | 'handshake' | 'dispatching' | 'success' | 'error';

export default function Contact({ isDark, coordinates, currentMode, onRefreshData }: ContactProps) {
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  // Use dynamic coordinates or default fallbacks
  const coords = coordinates || {
    email: 'hello@adarshsingh.in',
    linkedin: 'linkedin.com/in/adarshsingh45',
    github: 'github.com/Adarsh-Singh07',
    location: 'Noida, Uttar Pradesh, India',
    hours: 'Mon – Fri, 9:00 AM – 6:00 PM IST'
  };

  const copyEmailToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering modal click
    navigator.clipboard.writeText(coords.email);
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
      await PortfolioService.submitContactMessage(formState);
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

  const handleCoordinatesClick = () => {
    setIsModalOpen(true);
  };

  const handleSaveCoordinates = async (updatedCoords: any) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile) return;

      activeProfile.coordinates = updatedCoords;
      await PortfolioService.saveAdminConfig(token, fullConfig);
      
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save coordinates:', err);
      alert('Failed to save contact coordinates.');
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

  const contactSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://adarshsingh.in/contact/#webpage",
        "url": "https://adarshsingh.in/contact",
        "name": "Operational Outreach & Collaboration | Adarsh Singh",
        "description": "Secure form gateway to establish communications, request AI consultation, or explore data pipelines proposals with Adarsh Singh."
      }
    ]
  };

  return (
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full select-none">
      <SEO 
        title="Connect & Collaborate | Adarsh Singh"
        description="Get in touch with Adarsh Singh for AI system design consulting, big data pipeline contracts, or professional collaborations."
        keywords="Contact, Project Inquiries, Professional Hiring, Consultation"
        canonicalUrl="https://adarshsingh.in/contact"
        schema={contactSchema}
      />
      
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

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#007AFF] block mb-2">
            Secure Outpost
          </span>
          <h2 className="text-xl font-bold font-sans tracking-tight mb-8">Send Operational Message</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-[10px] uppercase font-mono tracking-widest mb-2 font-bold ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>Sender Identity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Recruiters / Tech Leads"
                  value={formState.name}
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  className={`w-full px-5 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:border-[#007AFF] bg-transparent ${
                    isDark ? 'border-white/[0.08] text-white' : 'border-slate-200 text-neutral-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[10px] uppercase font-mono tracking-widest mb-2 font-bold ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>Return Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@enterprise.com"
                  value={formState.email}
                  onChange={e => setFormState({ ...formState, email: e.target.value })}
                  className={`w-full px-5 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:border-[#007AFF] bg-transparent ${
                    isDark ? 'border-white/[0.08] text-white' : 'border-slate-200 text-neutral-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[10px] uppercase font-mono tracking-widest mb-2 font-bold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>Subject Line</label>
              <input
                type="text"
                required
                placeholder="e.g. AI Architecture Consultancy"
                value={formState.subject}
                onChange={e => setFormState({ ...formState, subject: e.target.value })}
                className={`w-full px-5 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:border-[#007AFF] bg-transparent ${
                  isDark ? 'border-white/[0.08] text-white' : 'border-slate-200 text-neutral-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[10px] uppercase font-mono tracking-widest mb-2 font-bold ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>Message Payload</label>
              <textarea
                required
                rows={5}
                placeholder="Compose your outreach inquiry..."
                value={formState.message}
                onChange={e => setFormState({ ...formState, message: e.target.value })}
                className={`w-full px-5 py-4 rounded-2xl border text-sm transition-all focus:outline-none focus:border-[#007AFF] bg-transparent resize-none ${
                  isDark ? 'border-white/[0.08] text-white' : 'border-slate-200 text-neutral-900'
                }`}
              />
            </div>

            {status === 'error' && (
              <div className="text-xs text-rose-500 font-mono flex items-center gap-1.5 animate-shake">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'success'}
              className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 border ${
                status === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : isDark
                    ? 'bg-white text-black hover:bg-neutral-200 border-transparent hover:shadow-glow'
                    : 'bg-neutral-950 text-white hover:bg-neutral-900 border-transparent hover:shadow-md'
              }`}
            >
              {status === 'success' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Outreach Packet Transmitted</span>
                </>
              ) : (
                <>
                  <Send className="w-4.5 h-4.5" />
                  <span>Transmit Encrypted Packet</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
        
        {/* 3. ACCESS COORDINATES (SIDEBAR) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Coordinates container */}
          <div 
            onClick={handleCoordinatesClick}
            className={`p-8 rounded-[32px] border cursor-pointer relative transition-all duration-300 group ${
              isDark 
                ? 'bg-gradient-to-b from-[#141416]/90 to-[#09090b]/95 border-white/[0.08] hover:border-[#007AFF]/35 shadow-md' 
                : 'bg-white border-slate-200 hover:border-[#007AFF]/25 shadow-sm'
            }`}
          >
            <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit className="w-4 h-4 text-[#007AFF]" />
            </div>

            <h2 className="text-base font-bold font-display mb-6 tracking-wide group-hover:text-[#007AFF] transition-colors">Direct Address Coordinates</h2>
            
            <div className="space-y-6">
              
              {/* Email Copier */}
              <div className="flex flex-col gap-1.5">
                <span className={`text-[9px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Direct Mail Endpoint
                </span>
                <div className={`flex items-center justify-between p-3.5 rounded-xl border font-mono text-xs ${
                  isDark ? 'bg-white/5 border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className={isDark ? 'text-white/80' : 'text-neutral-800'}>{coords.email}</span>
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
                  href={coords.linkedin.startsWith('http') ? coords.linkedin : `https://${coords.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()} // Avoid modal
                  className={`flex items-center justify-between p-3.5 rounded-xl border font-mono text-xs transition-colors ${
                    isDark 
                      ? 'bg-white/5 border-white/[0.08] hover:bg-white/10 hover:border-white/20 text-white/80 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-350 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-[#007AFF]" />
                    <span>{coords.linkedin.replace('https://', '').replace('www.', '')}</span>
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
                  href={coords.github.startsWith('http') ? coords.github : `https://${coords.github}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()} // Avoid modal
                  className={`flex items-center justify-between p-3.5 rounded-xl border font-mono text-xs transition-colors ${
                    isDark 
                      ? 'bg-white/5 border-white/[0.08] hover:bg-white/10 hover:border-white/20 text-white/80 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-350 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-[#007AFF]" />
                    <span>{coords.github.replace('https://', '').replace('www.', '')}</span>
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
                  <span>{coords.location}</span>
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
                  <span>{coords.hours}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Detail Edit Modal */}
      <DetailEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="coordinates"
        item={coords}
        onSave={handleSaveCoordinates}
        isAdmin={isAdmin}
        isDark={isDark}
      />
    </div>
  );
}
