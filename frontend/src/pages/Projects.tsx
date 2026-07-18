/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Project, ProfileMode } from '../types';
import { ArrowRight, Github, ExternalLink, Plus, Layers, Cpu, Database } from 'lucide-react';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';
import SEO from '../components/SEO';

interface ProjectsPageProps {
  projects: Project[];
  currentMode: ProfileMode;
  isDark: boolean;
  onRefreshData?: () => void;
}

type ProjectCategory = 'All' | 'AI' | 'Data Engineering' | 'GenAI' | 'ETL' | 'Cloud';

export default function Projects({ projects, currentMode, isDark, onRefreshData }: ProjectsPageProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'create'>('view');

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  // Categories list
  const categories: ProjectCategory[] = ['All', 'AI', 'Data Engineering', 'GenAI', 'ETL', 'Cloud'];

  // Helper to check if a project belongs to a category
  const projectBelongsToCategory = (project: Project, category: ProjectCategory): boolean => {
    if (category === 'All') return true;
    const techs = project.technologies.map(t => t.toLowerCase());
    const title = project.title.toLowerCase();
    const desc = project.description.toLowerCase();

    if (category === 'AI') {
      return techs.some(t => ['pytorch', 'tensorflow', 'opencv', 'ml', 'agentic ai', 'rag', 'openai llm'].includes(t)) || title.includes('ml') || title.includes('ai');
    }
    if (category === 'Data Engineering') {
      return techs.some(t => ['databricks', 'apache spark', 'delta lake', 'sql', 'bigquery'].includes(t)) || desc.includes('data lakehouse') || desc.includes('etl');
    }
    if (category === 'GenAI') {
      return techs.some(t => ['rag', 'agentic ai', 'openai llm', 'vector stores'].includes(t)) || desc.includes('generative ai') || desc.includes('llm');
    }
    if (category === 'ETL') {
      return techs.some(t => ['etl', 'celery', 'redis', 'azure adf'].includes(t)) || desc.includes('etl') || desc.includes('workflow');
    }
    if (category === 'Cloud') {
      return techs.some(t => ['azure', 'gcp', 'aws', 'docker', 'redis'].includes(t)) || desc.includes('cloud');
    }
    return false;
  };

  // Sort projects by priority for the active profile mode, filtering out hidden items
  const sortedProjects = [...projects]
    .filter(p => {
      const prio = p.priority?.[currentMode];
      return prio !== 99 && prio !== undefined;
    })
    .sort((a, b) => {
      const prioA = a.priority?.[currentMode] ?? 99;
      const prioB = b.priority?.[currentMode] ?? 99;
      return prioA - prioB;
    });

  // Filter projects based on active category
  const filteredProjects = sortedProjects.filter(p => projectBelongsToCategory(p, activeCategory));

  // Identify featured project (Spotlight card)
  const featuredProject = sortedProjects.find(p => p.id === 'agentic-rag-platform') || sortedProjects[0];

  const handleCardClick = (project: Project, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a')) return;
    
    navigate(`/projects/${project.id}`);
  };

  const handleAddNew = () => {
    setSelectedProject(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleSave = async (updatedProject: Project) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile) return;

      if (!activeProfile.projects) {
        activeProfile.projects = [];
      }

      const existingIndex = activeProfile.projects.findIndex(p => p.id === updatedProject.id);
      if (existingIndex >= 0) {
        activeProfile.projects[existingIndex] = updatedProject;
      } else {
        activeProfile.projects.push(updatedProject);
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save project:', err);
      alert('Failed to save project data.');
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile || !activeProfile.projects) return;

      activeProfile.projects = activeProfile.projects.filter(p => p.id !== projectId);
      await PortfolioService.saveAdminConfig(token, fullConfig);
      
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project.');
    }
  };

  // Container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as any,
        stiffness: 100,
        damping: 18,
        duration: 0.8
      }
    },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } }
  };

  const projectsSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://adarshsingh.in/projects/#webpage",
        "url": "https://adarshsingh.in/projects",
        "name": "AI & Data Projects Catalog | Adarsh Singh",
        "description": "Portfolio projects page showcasing generative AI systems, RAG networks, and data platforms built by Adarsh Singh."
      }
    ]
  };

  return (
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <SEO 
        title="AI & Data Engineering Projects | Adarsh Singh"
        description="Browse the collection of AI and Data Engineering projects built by Adarsh Singh, showcasing Large Language Models (LLMs), RAG pipelines, and automated analytics."
        keywords="AI Projects, Machine Learning, RAG Pipelines, Python Backend, Vercel Deploy, Cloud Run, Data Analytics"
        canonicalUrl="https://adarshsingh.in/projects"
        schema={projectsSchema}
      />
      
      {/* Editorial Page Header */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-[1px] bg-[#007AFF]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#007AFF]">
              Bento Catalog v2.0
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-sans font-semibold tracking-tight leading-none mb-6">
            Architectural Works &amp;<br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
              isDark 
                ? 'from-white via-white/80 to-white/40' 
                : 'from-neutral-950 via-neutral-900 to-neutral-500'
            } italic font-serif font-medium`}>Intelligent Systems</span>
          </h1>
          <p className={`text-base md:text-lg font-light leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            An asymmetrical curation of generative ecosystems, low-latency streaming lakes, and deep machine translation endpoints.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-full flex items-center gap-2 text-xs font-semibold shadow-glow cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Luxury Filter Bar */}
      <div className="mb-12 flex flex-wrap gap-2.5 items-center justify-start border-b border-white/5 pb-6">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 focus:outline-none cursor-pointer ${
                isActive 
                  ? isDark ? 'text-white' : 'text-neutral-900' 
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-neutral-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className={`absolute inset-0 rounded-full z-0 ${
                    isDark 
                      ? 'bg-white/5 border border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)] backdrop-blur-md' 
                      : 'bg-white border border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
                  }`}
                  transition={{ type: 'spring' as any, stiffness: 350, damping: 25 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Bento Grid Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* Spotlight Featured Project */}
        {featuredProject && projectBelongsToCategory(featuredProject, activeCategory) && (
          <motion.div
            layout
            variants={itemVariants}
            onClick={(e) => handleCardClick(featuredProject, e)}
            className={`col-span-1 lg:col-span-12 p-8 md:p-10 rounded-[40px] relative overflow-hidden transition-all duration-500 hover:shadow-2xl border cursor-pointer ${
              isDark 
                ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5 hover:border-[#007AFF]/20' 
                : 'bg-white hover:bg-[#FDFBF7]/80 border-neutral-200/60 hover:border-[#007AFF]/15'
            } flex flex-col justify-between group`}
          >
            <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full filter blur-[120px] opacity-15 pointer-events-none bg-[#007AFF]/30 transition-opacity group-hover:opacity-25" />
            
            <div className="relative z-10 w-full">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                  isDark ? 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20' : 'bg-[#007AFF]/5 text-[#007AFF] border border-[#007AFF]/10'
                }`}>
                  Spotlight System Spec
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-[10px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Active Status: <span className="text-emerald-500 font-semibold">{featuredProject.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-6">
                  <h2 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight mb-4 group-hover:text-[#007AFF] transition-colors duration-300">
                    {featuredProject.title}
                  </h2>
                  <p className={`text-sm md:text-base font-light leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {featuredProject.description}
                  </p>
                </div>

                <div className="lg:col-span-6 flex flex-col justify-end lg:items-end">
                  <span className={`text-[9px] uppercase font-mono tracking-widest mb-3 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    System Stack Configuration
                  </span>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {featuredProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide border ${
                          isDark 
                            ? 'bg-white/5 border-white/5 text-slate-300' 
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 border-t border-white/5 pt-8 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                {featuredProject.metrics && featuredProject.metrics.map((metric) => (
                  <div key={metric.label}>
                    <span className={`text-2xl md:text-3xl font-serif italic block font-medium text-[#007AFF] ${
                      isDark ? 'text-white' : 'text-neutral-900'
                    }`}>
                      {metric.value}
                    </span>
                    <span className={`text-[9px] uppercase font-sans tracking-widest block mt-1 leading-none ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="col-span-1 flex items-center justify-end gap-4">
                <a
                  href={featuredProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-3 rounded-2xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    isDark 
                      ? 'bg-white/5 border-white/5 text-slate-300 hover:text-white hover:bg-[#007AFF]/10 hover:border-[#007AFF]/25' 
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-neutral-950 hover:bg-[#007AFF]/5 hover:border-[#007AFF]/20'
                  }`}
                >
                  <Github className="w-4 h-4" />
                </a>
                {featuredProject.demoUrl && (
                  <a
                    href={featuredProject.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all duration-300 border cursor-pointer ${
                      isDark 
                        ? 'bg-white text-black border-transparent hover:bg-neutral-200 shadow-glow' 
                        : 'bg-neutral-900 text-white border-transparent hover:bg-neutral-800'
                    }`}
                  >
                    <span>Live Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Other Projects */}
        <AnimatePresence mode="popLayout">
          {filteredProjects
            .filter(p => !featuredProject || p.id !== featuredProject.id)
            .map((proj, idx) => {
              const isLarge = idx % 3 === 0;
              return (
                <motion.div
                  key={proj.id}
                  layout
                  variants={itemVariants}
                  exit="exit"
                  onClick={(e) => handleCardClick(proj, e)}
                  className={`p-6 md:p-8 rounded-[32px] border transition-all duration-500 hover:shadow-xl cursor-pointer ${
                    isLarge ? 'col-span-1 lg:col-span-8' : 'col-span-1 lg:col-span-4'
                  } ${
                    isDark 
                      ? 'bg-[#151515]/60 hover:bg-[#151515] border-white/5 hover:border-[#007AFF]/15' 
                      : 'bg-white hover:bg-[#FDFBF7]/80 border-neutral-200/60 hover:border-[#007AFF]/10'
                  } flex flex-col justify-between group`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className={`text-[9px] uppercase font-sans tracking-widest px-2.5 py-1 rounded-full font-bold border ${
                        isDark
                          ? proj.status === 'Deployed' 
                            ? 'bg-[#007AFF]/15 text-[#007AFF] border-[#007AFF]/25' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : proj.status === 'Deployed'
                            ? 'bg-[#007AFF]/5 text-[#007AFF] border-[#007AFF]/10'
                            : 'bg-amber-500/5 text-amber-600 border-amber-500/10'
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-sans font-semibold tracking-tight mb-2 group-hover:text-[#007AFF] transition-colors duration-300">
                      {proj.title}
                    </h3>
                    <p className={`text-xs font-light leading-relaxed mb-6 ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {proj.description.substring(0, 160)}...
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.slice(0, 3).map((tech) => (
                        <span 
                          key={tech} 
                          className={`px-2 py-1 rounded-lg text-[9px] font-mono border ${
                            isDark ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          isDark ? 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 border-slate-250 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>

      </motion.div>

      {/* Detail Edit Modal */}
      <DetailEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="project"
        item={selectedProject}
        onSave={handleSave}
        onDelete={handleDelete}
        isAdmin={isAdmin}
        isDark={isDark}
      />
    </div>
  );
}
