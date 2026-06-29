/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'motion/react';
import PortfolioService from '../services/api';
import { 
  Send, 
  Mail, 
  Github, 
  Linkedin, 
  MapPin, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  Loader2, 
  Clock 
} from 'lucide-react';

interface ContactFooterProps {
  isDark: boolean;
}

export default function ContactFooter({ isDark }: ContactFooterProps) {
  // Form submission states
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await PortfolioService.submitContactMessage(formData);
      setSubmitResult(res);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setSubmitResult({ success: false, message: 'Your message could not be delivered to the gateway because of an error. Please retry.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    {
      title: "Direct Pipeline",
      value: "adarsh2001gop@gmail.com",
      href: "mailto:adarsh2001gop@gmail.com",
      icon: Mail,
      label: "Send direct request"
    },
    {
      title: "Github Ledger",
      value: "github.com/Adarsh-Singh07",
      href: "https://github.com/Adarsh-Singh07",
      icon: Github,
      label: "Review source architectures"
    },
    {
      title: "Professional Ledger",
      value: "linkedin.com/in/adarshsingh45",
      href: "https://linkedin.com/in/adarshsingh45",
      icon: Linkedin,
      label: "Forge corporate contract"
    },
    {
      title: "Physical Location",
      value: "Bengaluru, India",
      icon: MapPin,
      label: "Engineering Hub"
    }
  ];

  return (
    <section 
      id="contact" 
      className={`relative pt-24 pb-8 transition-colors duration-1000 border-t ${
        isDark 
          ? 'bg-[#050505] text-white border-neutral-900' 
          : 'bg-white text-neutral-900 border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        
        {/* Step 5 Title Header */}
        <div className="mb-16 text-left max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[1px] bg-[#007AFF]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#007AFF]">
              Secure Client Transmission Gateway
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-semibold tracking-tight">
            Let’s Build Something Intelligent
          </h2>
          <p className={`mt-3.5 text-base md:text-lg font-light ${
            isDark ? 'text-white/50' : 'text-neutral-950/60'
          }`}>
            Whether it’s AI integration, custom high-throughput Data Engineering, or distributed systems – let’s create meaningful impact.
          </p>
        </div>

        {/* Form and Contact Cards Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="interactive-contact-anchor">
          
          {/* Left Side: Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            {contactCards.map((card) => {
              const IconComp = card.icon;
              const isLink = !!card.href;

              const CardBody = (
                <div 
                  className={`p-5 rounded-[24px] border flex items-center gap-4 transition-all duration-300 w-full text-left h-full ${
                    isDark 
                      ? 'bg-[#151515]/60 border-white/5 text-white hover:bg-[#151515] hover:border-[#007AFF]/35' 
                      : 'bg-slate-50 border-neutral-200/60 text-neutral-900 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${
                    isDark ? 'bg-white/5 border border-white/5 text-[#007AFF]' : 'bg-slate-100 border border-slate-250 text-[#007AFF]'
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className={`text-[9px] uppercase font-sans tracking-widest font-bold block ${
                      isDark ? 'text-white/30' : 'text-neutral-400'
                    }`}>
                      {card.title}
                    </span>
                    <span className="text-sm font-semibold truncate font-sans block mt-0.5">{card.value}</span>
                    <span className={`text-[10px] font-serif italic mt-0.5 block ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>
                      {card.label}
                    </span>
                  </div>
                </div>
              );

              if (isLink) {
                return (
                  <a 
                    key={card.title} 
                    href={card.href} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="block hover:-translate-y-0.5 transition-transform duration-300 select-none"
                  >
                    {CardBody}
                  </a>
                );
              }

              return (
                <div key={card.title} className="select-none">
                  {CardBody}
                </div>
              );
            })}

            {/* Resume button request box */}
            <div className={`p-6 rounded-[24px] border ${
              isDark ? 'bg-[#151515]/60 border-white/5' : 'bg-slate-50 border-neutral-200/60'
            }`}>
              <h4 className="text-sm font-semibold font-sans tracking-tight mb-2">Architectural Blueprint Ready</h4>
              <p className={`text-xs font-light leading-relaxed mb-4 ${isDark ? 'text-white/50' : 'text-neutral-950/60'}`}>
                Grab my comprehensive qualifications catalog containing custom performance indexes, cloud architectures and code bases.
              </p>
              <a
                href="mailto:adarsh2001gop@gmail.com?subject=Resume%20Request%20-%20AI%20%26%20Data%20Engineer"
                className={`py-2 px-4 rounded-xl text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                  isDark 
                    ? 'bg-white/5 hover:bg-[#007AFF]/20 text-white border border-white/5 hover:border-[#007AFF]/30' 
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Blueprint Resume</span>
                <ArrowUpRight className="w-3 h-3 text-[#007AFF]" />
              </a>
            </div>
          </div>

          {/* Right Side: Luxury Contact Form */}
          <div className="lg:col-span-7">
            <div className={`p-6 md:p-8 rounded-[32px] border ${
              isDark 
                ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5' 
                : 'glass-card-light'
            }`}>
              <h3 className="text-xl font-sans font-semibold tracking-tight mb-6">
                Transmit Secure Message
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="name" className={`text-[10px] font-sans uppercase tracking-[0.15em] block font-bold ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>
                      Full Identity *
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Recruiter, CTO"
                      className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all duration-300 ${
                        isDark 
                          ? 'bg-neutral-900 border-white/5 text-white placeholder-white/20 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/25' 
                          : 'bg-white border-slate-200 text-neutral-900 placeholder-slate-400 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label htmlFor="email" className={`text-[10px] font-sans uppercase tracking-[0.15em] block font-bold ${
                      isDark ? 'text-white/40' : 'text-neutral-500'
                    }`}>
                      Secure Email *
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. contact@company.com"
                      className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all duration-300 ${
                        isDark 
                          ? 'bg-neutral-900 border-white/5 text-white placeholder-white/20 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/25' 
                          : 'bg-white border-slate-200 text-neutral-900 placeholder-slate-400 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label htmlFor="subject" className={`text-[10px] font-sans uppercase tracking-[0.15em] block font-bold ${
                    isDark ? 'text-white/40' : 'text-neutral-500'
                  }`}>
                    Subject Matter
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g. System Integration Request"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all duration-300 ${
                      isDark 
                        ? 'bg-neutral-900 border-white/5 text-white placeholder-white/20 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/25' 
                        : 'bg-white border-slate-200 text-neutral-900 placeholder-slate-400 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20'
                    }`}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label htmlFor="message" className={`text-[10px] font-sans uppercase tracking-[0.15em] block font-bold ${
                    isDark ? 'text-white/40' : 'text-neutral-500'
                  }`}>
                    System Parameters (Message) *
                  </label>
                  <textarea
                    required
                    name="message"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Specify project architectures, timeline variables or corporate proposal requirements..."
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none transition-all duration-300 resize-none ${
                      isDark 
                        ? 'bg-neutral-900 border-white/5 text-white placeholder-white/20 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/25' 
                        : 'bg-white border-slate-200 text-neutral-900 placeholder-slate-400 focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF]/20'
                    }`}
                  />
                </div>

                {/* Submit button with loading triggers */}
                <button
                  id="submit-contact-button"
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-2xl text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 border focus:outline-none ${
                    isSubmitting 
                      ? 'bg-neutral-800 border-neutral-700 text-slate-400 pointer-events-none' 
                      : isDark 
                        ? 'bg-white text-black border-transparent hover:bg-[#007AFF] hover:text-white' 
                        : 'bg-neutral-900 text-white border-transparent hover:bg-[#007AFF]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Blueprint Data...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Transmission</span>
                    </>
                  )}
                </button>

                {/* Interactive Results Screen alert */}
                {submitResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-xs flex items-start gap-2.5 border mt-4 ${
                      submitResult.success
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                        : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{submitResult.message}</span>
                  </motion.div>
                )}
              </form>
            </div>
          </div>

        </div>

        {/* Minimal Premium Footer */}
        <div className={`mt-24 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 select-none ${
          isDark ? 'border-white/5 text-white/30' : 'border-slate-100 text-slate-400'
        }`}>
          <div className="text-xs font-sans font-medium">
            © 2026 Adarsh Singh. All Systems Operational.
          </div>
          <div className="flex items-center gap-2 text-[10px] font-sans tracking-widest uppercase font-bold">
            <span>Crafted with precision</span>
            <Clock className="w-3.5 h-3.5 text-[#007AFF] font-extrabold" />
          </div>
        </div>

      </div>
    </section>
  );
}
