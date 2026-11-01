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
  Zap, 
  Server, 
  ShieldCheck, 
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
  const [, setModalMode] = useState<'view' | 'create'>('view');

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

  const getBentoSpan = (index: number) => {
    if (index === 0) return 'col-span-1 lg:col-span-8';
    if (index === 1) return 'col-span-1 lg:col-span-4';
    if (index % 3 === 0) return 'col-span-1 lg:col-span-6';
    if (index % 3 === 1) return 'col-span-1 lg:col-span-6';
    return 'col-span-1 lg:col-span-12';
  };

  const getCategoryIcon = (title: string) => {
    const norm = (title || '').toLowerCase();
    if (norm.includes('language')) return Server;
    if (norm.includes('ai') || norm.includes('machine') || norm.includes('ml')) return Cpu;
    if (norm.includes('cloud') || norm.includes('platform')) return Cloud;
    if (norm.includes('data') || norm.includes('lakehouse') || norm.includes('pipeline') || norm.includes('database')) return Database;
    return Layers;
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'zap': return Zap;
      case 'database': return Database;
      case 'cloud': return Cloud;
      case 'shield': return ShieldCheck;
      default: return Cpu;
    }
  };

  const handleCategoryClick = (cat: SkillCategory) => {
    setSelectedItem(cat);
    setModalType('skills');
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleStrengthClick = (strength: PrestigeStrength) => {
    setSelectedItem(strength);
    setModalType('strength');
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleAddNewCategory = () => {
    setSelectedItem(null);
    setModalType('skills');
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleAddNewStrength = () => {
    setSelectedItem(null);
    setModalType('strength');
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleSave = async (updatedItem: any) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile) return;

      if (modalType === 'skills') {
        if (!activeProfile.skills) activeProfile.skills = [];
        const existingIndex = activeProfile.skills.findIndex(c => (c.id || c.title) === (updatedItem.id || updatedItem.title));
        if (existingIndex >= 0) {
          activeProfile.skills[existingIndex] = updatedItem;
        } else {
          activeProfile.skills.push(updatedItem);
        }
      } else {
        if (!activeProfile.strengths) activeProfile.strengths = [];
        const existingIndex = activeProfile.strengths.findIndex(s => s.id === updatedItem.id);
        if (existingIndex >= 0) {
          activeProfile.strengths[existingIndex] = updatedItem;
        } else {
          activeProfile.strengths.push(updatedItem);
        }
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save skill details:', err);
      alert('Failed to save configuration details.');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile) return;

      if (modalType === 'skills') {
        if (!activeProfile.skills) return;
        activeProfile.skills = activeProfile.skills.filter(c => (c.id || c.title) !== itemId);
      } else {
        if (!activeProfile.strengths) return;
        activeProfile.strengths = activeProfile.strengths.filter(s => s.id !== itemId);
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete element.');
    }
  };

  const principles = [
    {
      title: "Production Over Prototypes",
      desc: "Engineered for low latency, observability, and fault tolerance from day one."
    },
    {
      title: "Multi-Agent Systems With Guardrails",
      desc: "LangGraph, RAG, and strict schema validation turning probabilistic models into dependable software."
    },
    {
      title: "Full-Stack Ownership",
      desc: "From PostgreSQL, Supabase, and FastAPI backends to fluid frontends and cloud deployments."
    },
    {
      title: "Cloud-Native By Default",
      desc: "Architectures that scale elastically across Azure, GCP, and AWS while keeping compute lean."
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
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } 
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
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full bg-[var(--background)] text-[var(--foreground)]">
      <SEO 
        title="Technical Stack & Core Proficiencies | Adarsh Singh"
        description="Review the technical stack, programming languages, cloud frameworks, and databases mastered by Adarsh Singh."
        keywords="Python, React, TypeScript, PostgreSQL, Apache Spark, Docker, Cloud Run, GCP, BigQuery"
        canonicalUrl="https://adarshsingh.in/skills"
        schema={skillsSchema}
      />
      
      {/* 1. HERO INTRO */}
      <div className="mb-20 text-left max-w-4xl">
        <div className="eyebrow" style={{ marginBottom: '1.25rem' }}>
          {currentMode.replace('-', ' ').toUpperCase()} Stack Architecture
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
          Engineering Intelligence<br />
          <span style={{ color: 'var(--accent)' }}>Across Data, AI &amp; Cloud</span>
        </h1>

        <p 
          style={{
            fontSize: '1.25rem',
            color: 'var(--muted)',
            lineHeight: 1.45,
            maxWidth: '54ch',
          }}
        >
          Building scalable intelligent systems using modern distributed data engineering, autonomous multi-agent pipelines, and cloud-native infrastructure.
        </p>
      </div>

      {/* 2. TECHNOLOGY ECOSYSTEM BENTO */}
      <div className="mb-24">
        <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="flex items-center gap-3">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                textTransform: 'uppercase',
                color: 'var(--foreground)',
              }}
            >
              Technology Ecosystem
            </h2>
            {isAdmin && (
              <button
                onClick={handleAddNewCategory}
                className="p-1 rounded-full text-xs"
                style={{ background: 'var(--accent)', color: 'var(--background)' }}
                title="Add New Skills Category"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--muted)' }}>
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
                  whileHover={{ y: -4 }}
                  className={`p-6 md:p-8 rounded-[0.25rem] border transition-all duration-340 flex flex-col justify-between group relative overflow-hidden cursor-pointer ${spanClass}`}
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--line)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2.5 rounded-sm"
                          style={{
                            background: 'var(--surface-2)',
                            color: 'var(--accent)',
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'var(--foreground)',
                          }}
                        >
                          {cat.title}
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                        {(cat.skills || []).length} Units
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {(cat.skills || []).map(skill => (
                        <span
                          key={skill.name}
                          className="px-3 py-1 rounded-sm text-xs font-semibold tracking-wide border cursor-default select-none"
                          style={{
                            background: 'var(--surface-2)',
                            borderColor: 'var(--line)',
                            color: 'var(--foreground)',
                          }}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="text-[10px] font-mono leading-none tracking-wide pt-4 border-t flex items-center justify-between"
                    style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
                  >
                    <span>System Reliability</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                      Verified ✓
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-20 border rounded-sm" style={{ borderColor: 'var(--line)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>No dynamic skill categories configured for this profile role.</span>
          </div>
        )}
      </div>

      {/* 3. CORE ENGINEERING STRENGTHS */}
      <div className="mb-24 pt-16" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                textTransform: 'uppercase',
                color: 'var(--foreground)',
              }}
            >
              Core Engineering Strengths
            </h2>
            {isAdmin && (
              <button
                onClick={handleAddNewStrength}
                className="p-1 rounded-full text-xs"
                style={{ background: 'var(--accent)', color: 'var(--background)' }}
                title="Add New Engineering Strength"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--muted)' }}>
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
                className="p-6 rounded-[0.25rem] border flex flex-col justify-between cursor-pointer group transition-all duration-340"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--line)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div style={{ color: 'var(--accent)' }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: 'var(--foreground)',
                      }}
                      className="group-hover:!text-[var(--accent)] transition-colors"
                    >
                      {strength.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--muted)',
                      lineHeight: 1.5,
                      marginBottom: '1.5rem',
                    }}
                  >
                    {strength.desc}
                  </p>
                </div>

                <div
                  className="pt-4 border-t flex items-center justify-between"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)' }}>
                    Trust Signal
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
                    {strength.signal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ENGINEERING PHILOSOPHY */}
      <div className="mb-24 pt-16" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4 flex flex-col justify-start">
            <div className="eyebrow" style={{ marginBottom: '1rem' }}>
              Methodology
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                textTransform: 'uppercase',
                color: 'var(--foreground)',
                marginBottom: '1rem',
              }}
            >
              How I Build Systems
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              A systematic engineering paradigm structured around scalability metrics, cloud infrastructure, and operational reliability.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {principles.map((p, idx) => (
              <div key={p.title} className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.5rem',
                      color: 'var(--accent)',
                    }}
                  >
                    0{idx + 1}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: 'var(--foreground)',
                    }}
                  >
                    {p.title}
                  </h3>
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

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
