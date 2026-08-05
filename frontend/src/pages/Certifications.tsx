/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  Cpu, 
  Cloud, 
  ShieldCheck, 
  Plus, 
  Search, 
  Calendar, 
  ExternalLink 
} from 'lucide-react';
import PortfolioService from '../services/api';
import { Certification, ProfileMode } from '../types';
import DetailEditModal from '../components/DetailEditModal';
import SEO from '../components/SEO';

interface CertificationsProps {
  certifications?: Certification[];
  currentMode: ProfileMode;
  isDark: boolean;
  onRefreshData?: () => void;
}

// Brand SVGs for verified credentials
const MicrosoftLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h11v11H0z" fill="#F25022"/>
    <path d="M12 0h11v11H12z" fill="#7FBA00"/>
    <path d="M0 12h11v11H0z" fill="#00A4EF"/>
    <path d="M12 12h11v11H12z" fill="#FFB900"/>
  </svg>
);

const GoogleCloudLogo = ({ className = "w-5.5 h-5.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

const AWSLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 54 33" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FF9900" d="M12.9 14.1c0 2.2-.4 3.9-1.2 5.1-1.1.1.2-2.4 1.9-3.9 1.9-1.2 0-2.3-.3-3.2-1s-1.3-1.8-1.3-3.3c0-1.5.4-2.8 1.3-3.6s2-1.2 3.3-1.2c1.3 0 2.4.4 3.2 1.2s1.2 2 1.2 3.6zm-4.4 0c0-1.4-.2-2.4-.5-2.9s-.9-.8-1.6-.8-1.3.3-1.7.8-.5 1.5-.5 2.9.2 2.3.5 2.9.9.8 1.6.8 1.3-.3 1.6-.8.6-1.5.6-2.9z"/>
    <path fill="#FF9900" d="M37.8 24.3c-5.8 4.2-14.2 6.5-21.5 6.5-10.1 0-19.2-3.7-26-10-.6-.5-.1-1.2.7-.9 7.4 4.3 16.5 6.8 25.9 6.8 6.4 0 13.1-1.5 19-4.7.9-.5 1.7.7 1.2 1.6z"/>
    <path fill="#FF9900" d="M40.3 22.2c-.6-.7-3.8-.4-5.3-.2-.5.1-.5-.4-.1-.6 2.6-1.8 6.6-1.3 7.3.2.6 1.3-.4 5.6-2.8 7.6-.4.4-.7.1-.6-.3.5-1.5 1.5-6 1.5-6.7z"/>
  </svg>
);

const IBMLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h130v30H0zm0 40h130v30H0zm0 40h50v30H0zm0 40h50v30H0zm0 40h130v30H0zm0 40h130v30H0zM40 80h50v80H40zm190-80h140v30H230zm0 40h140v30H230zm0 40h50v30h40v-30h50zm0 40h50v30h40v-30h50zm0 40h140v30H230zm0 40h140v30H230zm40-80h10v80h-10zm190-80h140v30H460zm0 40h50v30h40v-30h50zm0 40h50v30h40v-30h50zm0 40h50v30h40v-30h50zm0 40h50v30h40v-30h50zm0 40h140v30H460zm40-160h10v160h-10z" fill="#0F62FE"/>
  </svg>
);

const CourseraLogo = ({ className = "w-5.5 h-5.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#0056B3"/>
    <path d="M14.5 15.5a3.5 3.5 0 0 1-3.5-3.5 3.5 3.5 0 0 1 3.5-3.5h1v-2h-1a5.5 5.5 0 0 0-5.5 5.5 5.5 5.5 0 0 0 5.5 5.5h1v-2h-1z" fill="#FFFFFF"/>
  </svg>
);

const getIssuerTheme = (issuer: string, title: string = '', isDark: boolean = true) => {
  const norm = (issuer + ' ' + title).toLowerCase();
  
  if (norm.includes('google') || norm.includes('gcp')) {
    return {
      glow: 'hover:shadow-[0_0_35px_-5px_rgba(66,133,244,0.18)]',
      borderHover: 'hover:border-[#4285F4]/40 dark:hover:border-[#4285F4]/55',
      logoBtn: (
        <div className="w-12 h-12 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center text-[#4285F4] transition-all duration-300">
          <GoogleCloudLogo />
        </div>
      ),
      accentColor: '#4285F4'
    };
  }
  
  if (norm.includes('ibm')) {
    return {
      glow: 'hover:shadow-[0_0_35px_-5px_rgba(15,98,254,0.18)]',
      borderHover: 'hover:border-[#0f62fe]/40 dark:hover:border-[#0f62fe]/55',
      logoBtn: (
        <div className="w-12 h-12 rounded-2xl bg-[#0f62fe]/10 border border-[#0f62fe]/20 flex items-center justify-center text-[#0f62fe] transition-all duration-300">
          <IBMLogo />
        </div>
      ),
      accentColor: '#0f62fe'
    };
  }

  if (norm.includes('microsoft') || norm.includes('azure')) {
    return {
      glow: 'hover:shadow-[0_0_35px_-5px_rgba(127,186,0,0.18)]',
      borderHover: 'hover:border-[#7FBA00]/40 dark:hover:border-[#7FBA00]/55',
      logoBtn: (
        <div className="w-12 h-12 rounded-2xl bg-[#7FBA00]/10 border border-[#7FBA00]/20 flex items-center justify-center text-[#7FBA00] transition-all duration-300">
          <MicrosoftLogo />
        </div>
      ),
      accentColor: '#7FBA00'
    };
  }
  
  if (norm.includes('amazon') || norm.includes('aws') || norm.includes('services')) {
    return {
      glow: 'hover:shadow-[0_0_35px_-5px_rgba(255,153,0,0.18)]',
      borderHover: 'hover:border-[#FF9900]/40 dark:hover:border-[#FF9900]/55',
      logoBtn: (
        <div className="w-12 h-12 rounded-2xl bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center text-[#FF9900] transition-all duration-300">
          <AWSLogo />
        </div>
      ),
      accentColor: '#FF9900'
    };
  }
  
  if (norm.includes('coursera')) {
    return {
      glow: 'hover:shadow-[0_0_35px_-5px_rgba(0,86,179,0.18)]',
      borderHover: 'hover:border-[#0056B3]/40 dark:hover:border-[#0056B3]/55',
      logoBtn: (
        <div className="w-12 h-12 rounded-2xl bg-[#0056B3]/10 border border-[#0056B3]/25 flex items-center justify-center text-[#0056B3] transition-all duration-300">
          <CourseraLogo />
        </div>
      ),
      accentColor: '#0056B3'
    };
  }
  
  return {
    glow: 'hover:shadow-[0_0_35px_-5px_rgba(0,122,255,0.18)]',
    borderHover: 'hover:border-[#007AFF]/40 dark:hover:border-[#007AFF]/55',
    logoBtn: (
      <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/10 border border-[#007AFF]/20 flex items-center justify-center text-[#007AFF] transition-all duration-300">
        <Award className="w-5 h-5" />
      </div>
    ),
    accentColor: '#007AFF'
  };
};

export default function Certifications({ certifications, currentMode, isDark, onRefreshData }: CertificationsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'create'>('view');

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  // Filter and sort certifications by priority, with robust null-safety & visibility settings
  const sortedCerts = (certifications || [])
    .filter(c => {
      if (!c) return false;
      const prio = c.priority?.[currentMode];
      // Filter out certifications marked as hidden (99) or not configured for this mode
      if (prio === 99 || prio === undefined) return false;

      const titleMatch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const issuerMatch = (c.issuer || '').toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || issuerMatch;
    })
    .sort((a, b) => {
      const prioA = a?.priority?.[currentMode] ?? 99;
      const prioB = b?.priority?.[currentMode] ?? 99;
      return prioA - prioB;
    });

  const handleCardClick = (cert: Certification) => {
    setSelectedCert(cert);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCert(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleSave = async (updatedCert: Certification) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile) return;

      if (!activeProfile.certifications) {
        activeProfile.certifications = [];
      }

      const existingIndex = activeProfile.certifications.findIndex(c => c.id === updatedCert.id);
      if (existingIndex >= 0) {
        activeProfile.certifications[existingIndex] = updatedCert;
      } else {
        activeProfile.certifications.push(updatedCert);
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save certification:', err);
      alert('Failed to save certification data.');
    }
  };

  const handleDelete = async (certId: string) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile || !activeProfile.certifications) return;

      activeProfile.certifications = activeProfile.certifications.filter(c => c.id !== certId);
      await PortfolioService.saveAdminConfig(token, fullConfig);
      
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to delete certification:', err);
      alert('Failed to delete certification.');
    }
  };

  const certsSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://adarshsingh.in/certifications/#webpage",
        "url": "https://adarshsingh.in/certifications",
        "name": "Verified Professional Credentials | Adarsh Singh",
        "description": "Directory of cloud computing, machine learning, and database systems credentials verified by Google Cloud, AWS, and Coursera."
      }
    ]
  };

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-200 ${
      isDark ? 'bg-[#121212] text-white' : 'bg-[#FDFBF7] text-neutral-900'
    }`}>
      <SEO 
        title="Professional Certifications & Accreditations | Adarsh Singh"
        description="Verified professional accreditations, cloud system certifications, and software training courses completed by Adarsh Singh."
        keywords="AWS Certifications, Google Cloud, Microsoft Azure, Coursera, Professional Credentials"
        canonicalUrl="https://adarshsingh.in/certifications"
        schema={certsSchema}
      />
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Page Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#007AFF] block mb-2">
              Credentials
            </span>
            <h1 className="text-4xl font-bold font-sans tracking-tight mb-4">
              Certifications &amp; Accreditations
            </h1>
            <p className={`text-sm font-light leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Industry-validated credentials proving competence in distributed computing, machine learning, and advanced cloud database architectures.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleAddNew}
              className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-full flex items-center gap-2 text-xs font-semibold shadow-glow cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certification</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-10 w-full max-w-md">
          <div className={`relative flex items-center rounded-full border transition-all duration-300 ${
            isDark 
              ? 'bg-neutral-900/60 border-white/10 focus-within:border-white/20 focus-within:shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
              : 'bg-white border-neutral-200 focus-within:border-neutral-300'
          }`}>
            <Search className="absolute left-4 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title or issuer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Certifications Cards Grid */}
        {sortedCerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCerts.map((cert) => {
              const theme = getIssuerTheme(cert.issuer, cert.title, isDark);
              const fallbackId = `fallback-badge-${cert.id}`;
              
              return (
                <motion.div
                  key={cert.id}
                  onClick={() => handleCardClick(cert)}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className={`p-6 rounded-[28px] border relative overflow-hidden transition-all duration-500 flex flex-col justify-between cursor-pointer group ${
                    isDark
                      ? 'bg-neutral-900/40 border-white/5'
                      : 'bg-white border-neutral-200/60'
                  } ${theme.glow} ${theme.borderHover}`}
                >
                  {/* Subtle brand glow on hover */}
                  <div 
                    className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-transparent to-transparent group-hover:from-current group-hover:to-transparent opacity-[0.03] transition-all duration-500 pointer-events-none" 
                    style={{ color: theme.accentColor }} 
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      {cert.badgeUrl ? (
                        <>
                          <img 
                            src={cert.badgeUrl} 
                            alt="Badge" 
                            className="w-12 h-12 object-contain group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // Hide image and show fallback brand SVG container
                              e.currentTarget.style.display = 'none';
                              const fallback = document.getElementById(fallbackId);
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                          <div id={fallbackId} style={{ display: 'none' }}>
                            {theme.logoBtn}
                          </div>
                        </>
                      ) : (
                        theme.logoBtn
                      )}

                      {cert.featured && (
                        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold font-sans tracking-tight mb-1 group-hover:text-[#007AFF] transition-colors">
                      {cert.title}
                    </h3>
                    <span className={`text-xs block font-medium mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {cert.issuer}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-800/10 relative z-10">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                      <span>{cert.date}</span>
                    </div>
                    {cert.credentialUrl && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#007AFF] flex items-center gap-1">
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed rounded-[32px] border-neutral-800">
            <span className="block text-slate-500 text-xs font-mono mb-2">No credentials found matching your search.</span>
          </div>
        )}

      </div>

      {/* Dynamic Detail / Edit Modal */}
      <DetailEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="certification"
        item={selectedCert}
        onSave={handleSave}
        onDelete={handleDelete}
        isAdmin={isAdmin}
        isDark={isDark}
      />
    </div>
  );
}
