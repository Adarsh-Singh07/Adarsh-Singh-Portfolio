/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SkillCategory, ProfileMode, PrestigeStrength } from '../types';
import { 
  Cpu, 
  Database, 
  Cloud, 
  Layers, 
  CheckCircle2, 
  Zap, 
  Server, 
  ShieldCheck, 
  Infinity,
  Plus
} from 'lucide-react';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';
import SEO from '../components/SEO';

interface SkillsProps {
  categories: SkillCategory[];
  strengths: PrestigeStrength[];
  currentMode: ProfileMode;
  isDark: boolean;
  onRefreshData?: () => void;
}

export default function Skills({ categories, strengths, currentMode, isDark, onRefreshData }: SkillsProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'strength' | 'skills'>('strength');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'create'>('view');

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  // Filter and sort dynamic skill categories based on active profile mode
  const activeCategories = (categories || [])
    .filter(cat => {
      if (!cat) return false;
      const prio = cat.priority?.[currentMode];
      return prio !== 99 && prio !== undefined;
    })
    .sort((a, b) => {
      const prioA = a.priority?.[currentMode] ?? 99;
      const prioB = b.priority?.[currentMode] ?? 99;
      return prioA - prioB;
    });

  // Dynamic Bento structure sizing formulas for categories
  const getBentoSpan = (index: number) => {
    if (index === 0) return 'col-span-1 lg:col-span-8';
    if (index === 1) return 'col-span-1 lg:col-span-4';
    if (index % 3 === 0) return 'col-span-1 lg:col-span-6';
    if (index % 3 === 1) return 'col-span-1 lg:col-span-6';
    return 'col-span-1 lg:col-span-12';
  };

  // Map category title to standard Lucide icons dynamically
  const getCategoryIcon = (title: string) => {
    const norm = (title || '').toLowerCase();
    if (norm.includes('language')) return Server;
    if (norm.includes('ai') || norm.includes('machine') || norm.includes('ml')) return Cpu;
    if (norm.includes('cloud') || norm.includes('platform')) return Cloud;
    if (norm.includes('data') || norm.includes('lakehouse') || norm.includes('pipeline') || norm.includes('database')) return Database;
    if (norm.includes('tool') || norm.includes('dev') || norm.includes('practice') || norm.includes('practices')) return Layers;
    return ShieldCheck;
  };

  // Dynamic Strength Icon Lookup
  const getIconComponent = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'cpu': return Cpu;
      case 'cloud': return Cloud;
      case 'database': return Database;
      case 'zap': return Zap;
      case 'infinity': return Infinity;
      case 'shieldcheck':
      case 'shield-check': return ShieldCheck;
      default: return Database;
    }
  };

  // Handlers for Category (Skills) Modals
  const handleCategoryClick = (cat: SkillCategory) => {
    setSelectedItem(cat);
    setModalType('skills');
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleAddNewCategory = () => {
    setSelectedItem(null);
    setModalType('skills');
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Handlers for Core Strength Modals
  const handleStrengthClick = (strength: PrestigeStrength) => {
    setSelectedItem(strength);
    setModalType('strength');
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleAddNewStrength = () => {
    setSelectedItem(null);
    setModalType('strength');
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Unified save handler
  const handleSave = async (updatedItem: any) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile) return;

      if (modalType === 'strength') {
        if (!activeProfile.strengths) activeProfile.strengths = [];
        const idx = activeProfile.strengths.findIndex(s => s.id === updatedItem.id);
        if (idx >= 0) activeProfile.strengths[idx] = updatedItem;
        else activeProfile.strengths.push(updatedItem);
      } else {
        if (!activeProfile.skills) activeProfile.skills = [];
        const idx = activeProfile.skills.findIndex(c => c.id === updatedItem.id);
        if (idx >= 0) activeProfile.skills[idx] = updatedItem;
        else activeProfile.skills.push(updatedItem);
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save item:', err);
      alert('Failed to save configuration details.');
    }
  };

  // Unified delete handler
  const handleDelete = async (itemId: string) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile) return;

      if (modalType === 'strength') {
        if (activeProfile.strengths) {
          activeProfile.strengths = activeProfile.strengths.filter(s => s.id !== itemId);
        }
      } else {
        if (activeProfile.skills) {
          activeProfile.skills = activeProfile.skills.filter(c => c.id !== itemId);
        }
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item.');
    }
  };

  const principles = [
    {
      title: 'Scalability First',
      desc: 'System bottlenecks are resolved at the ingestion layer. Design pipelines that scale horizontally without expanding computational spend.'
    },
    {
      title: 'Automation Mindset',
      desc: 'If a workflow runs more than twice, it deserves a scheduled automation trigger. Continuous integration saves developer hours.'
    },
    {
      title: 'Cloud Native Thinking',
      desc: 'Avoid heavy server instances. Deploy lightweight, containerized microservices that activate on demand and utilize cached nodes.'
    },
    {
      title: 'Production Readiness',
      desc: 'Code is not complete without structured telemetry logging, robust error boundaries, and validated type constraints.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.08 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const skillsSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://adarshsingh.in/skills/#webpage",
        "url": "https://adarshsingh.in/skills",
        "name": "Skills Stack & Technical Core | Adarsh Singh",
        "description": "Bento Grid directory mapping out the programming languages, cloud frameworks, and databases mastered by Adarsh Singh."
      }
    ]
  };

  return (
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full select-none animate-[fadeIn_0.5s_ease-out]">
      <SEO 
        title="Technical Stack & Core Proficiencies | Adarsh Singh"
        description="Review the technical stack, programming languages, cloud frameworks, and databases mastered by Adarsh Singh."
        keywords="Python, React, TypeScript, PostgreSQL, Apache Spark, Docker, Cloud Run, GCP, BigQuery"
        canonicalUrl="https://adarshsingh.in/skills"
        schema={skillsSchema}
      />
      
      {/* 1. HERO INTRO */}
      <div className="mb-20 text-left max-w-4xl">
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
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span>{currentMode.replace('-', ' ').toUpperCase()} STACK CONFIG</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-sans font-semibold tracking-tight leading-none mb-6"
        >
          Engineering Intelligence<br />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
            isDark 
              ? 'from-white via-white/80 to-white/40' 
              : 'from-neutral-950 via-neutral-900 to-neutral-500'
          } italic font-serif font-medium`}>Across Data, AI &amp; Cloud</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`text-base md:text-lg font-light max-w-2xl leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
          Building scalable intelligent systems using modern data engineering, GenAI pipelines, cloud architecture and automation ecosystems.
        </motion.p>
      </div>

      {/* 2. TECHNOLOGY ECOSYSTEM BENTO */}
      <div className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight font-sans">Technology Ecosystem</h2>
            {isAdmin && (
              <button
                onClick={handleAddNewCategory}
                className="p-1 rounded-full bg-[#007AFF]/15 text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-colors cursor-pointer"
                title="Add New Skills Category"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Asymmetric Bento View
          </span>
        </div>

        {activeCategories.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {activeCategories.map((cat, index) => {
              const spanClass = getBentoSpan(index);
              const Icon = getCategoryIcon(cat.title);

              return (
                <motion.div
                  key={cat.id || cat.title}
                  layout
                  variants={itemVariants}
                  onClick={() => handleCategoryClick(cat)}
                  whileHover={{ y: -4, scale: 1.005 }}
                  className={`p-6 md:p-8 rounded-[40px] border transition-all duration-500 hover:shadow-2xl flex flex-col justify-between group relative overflow-hidden cursor-pointer ${spanClass} ${
                    isDark 
                      ? 'bg-gradient-to-b from-[#141416]/80 to-[#09090b]/90 border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] hover:border-[#007AFF]/35' 
                      : 'bg-white hover:bg-slate-100/50 border-neutral-200/60 hover:border-[#007AFF]/25 shadow-sm'
                  }`}
                >
                  {/* Soft Ambient glow on card hover */}
                  <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full filter blur-[80px] opacity-0 group-hover:opacity-100 bg-[#007AFF]/15 pointer-events-none transition-opacity duration-500" />

                  <div>
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          isDark ? 'bg-white/5 text-white/80' : 'bg-slate-100 text-neutral-800'
                        } group-hover:bg-[#007AFF] group-hover:text-white transition-colors duration-300`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold tracking-wider font-sans uppercase">
                          {cat.title}
                        </h3>
                      </div>
                      <span className={`text-[9px] font-mono tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {(cat.skills || []).length} Units
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {(cat.skills || []).map(skill => (
                        <motion.span
                          key={skill.name}
                          whileHover={{ y: -2, scale: 1.03 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide border cursor-default select-none ${
                            isDark 
                              ? 'bg-white/[0.04] border-white/[0.06] text-white/80 hover:bg-white/[0.08] hover:border-white/15 hover:text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-neutral-900'
                          }`}
                        >
                          {skill.name}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div className={`text-[10px] font-mono leading-none tracking-wide pt-4 border-t flex items-center justify-between ${
                    isDark ? 'border-white/[0.06] text-slate-300' : 'border-neutral-100 text-slate-600'
                  }`}>
                    <span>System Reliability</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Verified
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-20 border border-dashed rounded-[40px] border-neutral-800">
            <span className="text-xs font-mono text-slate-500">No dynamic skill categories configured for this profile role.</span>
          </div>
        )}
      </div>

      {/* 3. CORE ENGINEERING STRENGTHS */}
      <div className="mb-24 border-t border-white/5 pt-16">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold font-sans tracking-tight">Core Engineering Strengths</h2>
            {isAdmin && (
              <button
                onClick={handleAddNewStrength}
                className="p-1.5 rounded-full bg-[#007AFF]/15 text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-colors cursor-pointer"
                title="Add New Engineering Strength"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Trust Signals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(strengths || []).map((strength) => {
            const IconComponent = getIconComponent(strength.icon);
            return (
              <div
                key={strength.id}
                onClick={() => handleStrengthClick(strength)}
                className={`p-6 rounded-[32px] border flex flex-col justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300 ${
                  isDark 
                    ? 'bg-neutral-900/40 border-white/5 hover:border-white/15 hover:shadow-[0_15px_30px_rgba(0,122,255,0.06)]' 
                    : 'bg-white border-neutral-200 hover:border-neutral-350 hover:shadow-[0_10px_25px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-[#007AFF] group-hover:scale-105 transition-transform duration-300">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold tracking-tight font-sans group-hover:text-[#007AFF] transition-colors">
                      {strength.title}
                    </h3>
                  </div>
                  <p className={`text-xs font-light leading-relaxed mb-6 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}>
                    {strength.desc}
                  </p>
                </div>

                <div className={`pt-4 border-t border-solid flex items-center justify-between ${
                  isDark ? 'border-white/[0.06]' : 'border-neutral-100'
                }`}>
                  <span className={`text-[9px] uppercase font-mono tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Trust Signal
                  </span>
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-[#007AFF] uppercase">
                    {strength.signal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ENGINEERING PHILOSOPHY */}
      <div className="mb-24 border-t border-white/5 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4 flex flex-col justify-start">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#007AFF] block mb-3">
              METHODOLOGY
            </span>
            <h2 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight mb-4">
              How I Build Systems
            </h2>
            <p className={`text-sm font-light leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              A systematic engineering paradigm structured around scalability metrics, cloud infrastructure, and operational reliability.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {principles.map((p, idx) => (
              <div key={p.title} className="text-left">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xl font-mono font-medium ${isDark ? 'text-white/20' : 'text-neutral-300'}`}>
                    0{idx + 1}
                  </span>
                  <h3 className="text-base font-semibold tracking-tight font-sans">
                    {p.title}
                  </h3>
                </div>
                <p className={`text-xs font-light leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* 5. TRUST SECTION */}
      <div className="border-t border-white/5 pt-16 text-center select-none">
        <span className={`text-[10px] uppercase font-mono tracking-[0.3em] font-bold block mb-6 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Recruiter Core Focus Competency Wall
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-50 hover:opacity-100 transition-opacity duration-500">
          {['Cloud Architectures', 'Generative AI Systems', 'Medallion ETL', 'Low Latency APIs', 'Agile Automation', 'Production Infrastructure'].map((item, idx) => (
            <div key={item} className="flex items-center gap-2">
              {idx > 0 && <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-350'}`} />}
              <span className={`text-xs font-semibold tracking-wider ${isDark ? 'text-white/80' : 'text-neutral-800'}`}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Edit Modal */}
      <DetailEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        item={selectedItem}
        onSave={handleSave}
        onDelete={handleDelete}
        isAdmin={isAdmin}
        isDark={isDark}
      />
    </div>
  );
}
