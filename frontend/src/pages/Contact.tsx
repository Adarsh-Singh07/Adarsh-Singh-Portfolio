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

export default function Contact({ coordinates, currentMode, onRefreshData, isDark }: ContactProps) {
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

  const coords = coordinates || {
    email: 'hello@adarshsingh.in',
    linkedin: 'linkedin.com/in/adarshsingh45',
    github: 'github.com/Adarsh-Singh07',
    location: 'Bengaluru, India',
    hours: 'Mon – Fri, 9:00 AM – 6:00 PM IST'
  };

  const copyEmailToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coords.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full bg-[var(--background)] text-[var(--foreground)]">
      <SEO 
        title="Connect & Collaborate | Adarsh Singh"
        description="Get in touch with Adarsh Singh for AI system design consulting, big data pipeline contracts, or professional collaborations."
        keywords="Contact, Project Inquiries, Professional Hiring, Consultation"
        canonicalUrl="https://adarshsingh.in/contact"
        schema={contactSchema}
      />
      
      {/* 1. HERO HEADER */}
      <div className="mb-16 text-left max-w-3xl">
        <div className="eyebrow" style={{ marginBottom: '1.25rem' }}>
          Direct Outreach
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '4rem',
            textTransform: 'uppercase',
            lineHeight: 0.95,
            color: 'var(--foreground)',
            letterSpacing: '-0.01em',
            marginBottom: '1.5rem',
          }}
          className="sm:text-[5.5rem]"
        >
          Operational Outreach<br />
          <span style={{ color: 'var(--accent)' }}>Secure Form Gateway</span>
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--muted)',
            lineHeight: 1.45,
          }}
        >
          Establish encrypted communication lines for enterprise proposals, ML opportunities, or cloud architecture reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* 2. SECURE MESSAGE CONSOLE (FORM) */}
        <div
          className="lg:col-span-7 p-8 md:p-10 rounded-[0.25rem] border relative overflow-hidden flex flex-col"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--line-strong)',
          }}
        >
          {/* Animated Overlay for Secure Transmit Handshake */}
          <AnimatePresence>
            {(status === 'encrypting' || status === 'handshake' || status === 'dispatching') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 text-center"
                style={{ background: 'rgba(8, 8, 10, 0.95)' }}
              >
                <div
                  className="w-full max-w-md border rounded-sm p-6 text-left font-mono text-xs"
                  style={{ background: 'var(--surface)', borderColor: 'var(--line-strong)' }}
                >
                  <div
                    className="flex items-center justify-between border-b pb-3 mb-4"
                    style={{ borderColor: 'var(--line)', color: 'var(--accent)' }}
                  >
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
                      <div className="animate-pulse font-bold" style={{ color: 'var(--accent)' }}>
                        [SYSTEM] Transmitting packet to secure uvicorn handler...
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: 'var(--accent)',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Direct Outpost
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              textTransform: 'uppercase',
              color: 'var(--foreground)',
              marginBottom: '2rem',
            }}
          >
            Send Operational Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: 'var(--muted)',
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}
                >
                  Sender Identity *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Recruiter / VP of Eng"
                  value={formState.name}
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--line-strong)',
                    padding: '0.75rem 0',
                    color: 'var(--foreground)',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: 'var(--muted)',
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}
                >
                  Return Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@enterprise.com"
                  value={formState.email}
                  onChange={e => setFormState({ ...formState, email: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--line-strong)',
                    padding: '0.75rem 0',
                    color: 'var(--foreground)',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--muted)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Subject Line *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise AI Architecture Consultancy"
                value={formState.subject}
                onChange={e => setFormState({ ...formState, subject: e.target.value })}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--line-strong)',
                  padding: '0.75rem 0',
                  color: 'var(--foreground)',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--muted)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Message Payload *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Compose your inquiry or specify architecture variables..."
                value={formState.message}
                onChange={e => setFormState({ ...formState, message: e.target.value })}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--line-strong)',
                  padding: '0.75rem 0',
                  color: 'var(--foreground)',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {status === 'error' && (
              <div className="text-xs text-rose-500 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'success'}
              className="w-full py-4 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
              style={{
                background: status === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'var(--accent)',
                color: status === 'success' ? '#4ade80' : 'var(--background)',
              }}
            >
              {status === 'success' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Outreach Packet Transmitted</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Encrypted Packet</span>
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* 3. ACCESS COORDINATES (SIDEBAR) */}
        <div className="lg:col-span-5 space-y-8">
          <div 
            onClick={handleCoordinatesClick}
            className="p-8 rounded-[0.25rem] border cursor-pointer relative transition-all duration-300 group"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--line-strong)',
            }}
          >
            {isAdmin && (
              <div className="absolute right-6 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
            )}

            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                textTransform: 'uppercase',
                color: 'var(--foreground)',
                marginBottom: '1.5rem',
              }}
            >
              Direct Address Coordinates
            </h2>
            
            <div className="space-y-6">
              
              {/* Email Copier */}
              <div className="flex flex-col gap-1.5">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)' }}>
                  Direct Mail Endpoint
                </span>
                <div
                  className="flex items-center justify-between p-3.5 rounded-sm border font-mono text-xs"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}
                >
                  <span style={{ color: 'var(--foreground)' }}>{coords.email}</span>
                  <button
                    onClick={copyEmailToClipboard}
                    className="p-1.5 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* LinkedIn Gateway */}
              <div className="flex flex-col gap-1.5">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)' }}>
                  Professional Network
                </span>
                <a
                  href={coords.linkedin.startsWith('http') ? coords.linkedin : `https://${coords.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-between p-3.5 rounded-sm border font-mono text-xs transition-colors"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--foreground)' }}
                >
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span>{coords.linkedin.replace('https://', '').replace('www.', '')}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                </a>
              </div>

              {/* GitHub Gateway */}
              <div className="flex flex-col gap-1.5">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)' }}>
                  Source Repository
                </span>
                <a
                  href={coords.github.startsWith('http') ? coords.github : `https://${coords.github}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-between p-3.5 rounded-sm border font-mono text-xs transition-colors"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--foreground)' }}
                >
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span>{coords.github.replace('https://', '').replace('www.', '')}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                </a>
              </div>

              {/* Operating Location */}
              <div className="flex flex-col gap-1.5">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)' }}>
                  Operational Location
                </span>
                <div
                  className="flex items-center gap-2 p-3.5 rounded-sm border font-mono text-xs"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--foreground)' }}
                >
                  <MapPin className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  <span>{coords.location}</span>
                </div>
              </div>

              {/* Availability Hours */}
              <div className="flex flex-col gap-1.5">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)' }}>
                  Response Hours
                </span>
                <div
                  className="flex items-center gap-2 p-3.5 rounded-sm border font-mono text-xs"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--foreground)' }}
                >
                  <Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
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
