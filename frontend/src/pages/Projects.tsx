/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Project, ProfileMode } from '../types';
import { Github, ExternalLink, Plus } from 'lucide-react';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';
import SEO from '../components/SEO';
import LiquidImage from '../components/LiquidImage';

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
  const [, setModalMode] = useState<'view' | 'create'>('view');

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
  const featuredProject = sortedProjects.find(p => p.id === 'emivo' || p.id === 'agentic-rag-platform') || sortedProjects[0];

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
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.62,
        ease: [0.16, 1, 0.3, 1] as any
      }
    },
    exit: { opacity: 0, y: -16, transition: { duration: 0.25 } }
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
    <div className="min-h-screen py-28 px-6 md:px-12 max-w-7xl mx-auto w-full bg-[var(--background)] text-[var(--foreground)]">
      <SEO 
        title="AI & Data Engineering Projects | Adarsh Singh"
        description="Browse the collection of AI and Data Engineering projects built by Adarsh Singh, showcasing Large Language Models (LLMs), RAG pipelines, and automated analytics."
        keywords="AI Projects, Machine Learning, RAG Pipelines, Python Backend, Cloud Run, Data Analytics, Supabase"
        canonicalUrl="https://adarshsingh.in/projects"
        schema={projectsSchema}
      />
      
      {/* Editorial Page Header */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left max-w-3xl">
          <div className="eyebrow" style={{ marginBottom: '1.25rem' }}>
            Production Works
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '4rem',
              textTransform: 'uppercase',
              lineHeight: 0.95,
              color: 'var(--foreground)',
              letterSpacing: '-0.01em',
            }}
            className="sm:text-[5.5rem]"
          >
            Architectural Works &amp;<br />
            <span style={{ color: 'var(--accent)' }}>Intelligent Systems</span>
          </h1>
          <p
            style={{
              marginTop: '1.5rem',
              fontSize: '1.25rem',
              color: 'var(--muted)',
              lineHeight: 1.45,
            }}
          >
            An asymmetrical curation of generative ecosystems, low-latency streaming lakes, and deep machine learning architectures built for scale.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleAddNew}
            className="px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300"
            style={{
              background: 'var(--accent)',
              color: 'var(--background)',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div
        className="mb-12 flex flex-wrap gap-2.5 items-center justify-start pb-6"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="relative px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 focus:outline-none cursor-pointer"
              style={{
                background: isActive ? 'var(--accent)' : 'var(--surface)',
                color: isActive ? 'var(--background)' : 'var(--muted)',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent)' : 'var(--line)',
              }}
            >
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Bento Grid Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
      >
        {/* Spotlight Featured Project */}
        {featuredProject && projectBelongsToCategory(featuredProject, activeCategory) && (
          <motion.div
            layout
            variants={itemVariants}
            onClick={(e) => handleCardClick(featuredProject, e)}
            className="col-span-1 lg:col-span-12 p-8 md:p-10 rounded-[0.25rem] relative overflow-hidden transition-all duration-340 border cursor-pointer flex flex-col justify-between group"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--line-strong)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')}
          >
            <div className="relative z-10 w-full">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <span
                  className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase"
                  style={{
                    background: 'rgba(255, 59, 29, 0.12)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(255, 59, 29, 0.25)',
                  }}
                >
                  Spotlight System Spec
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: 'var(--accent)' }}
                  />
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      color: 'var(--muted)',
                    }}
                  >
                    Status: <span style={{ color: 'var(--foreground)' }}>{featuredProject.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                <div className="lg:col-span-7">
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2.5rem',
                      textTransform: 'uppercase',
                      lineHeight: 1.05,
                      color: 'var(--foreground)',
                      marginBottom: '1rem',
                      transition: 'color 340ms ease-out',
                    }}
                    className="group-hover:!text-[var(--accent)]"
                  >
                    {featuredProject.title}
                  </h2>
                  <p
                    style={{
                      fontSize: '1.0625rem',
                      color: 'var(--muted)',
                      lineHeight: 1.6,
                      maxWidth: '54ch',
                    }}
                  >
                    {featuredProject.description}
                  </p>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-end lg:items-end">
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      color: 'var(--muted)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    System Stack Configuration
                  </span>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {featuredProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-sm"
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--line)',
                          color: 'var(--foreground)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative z-10 pt-6 mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
              style={{ borderTop: '1px solid var(--line)' }}
            >
              <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                {featuredProject.metrics && featuredProject.metrics.map((metric) => (
                  <div key={metric.label}>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '2rem',
                        lineHeight: 1,
                        color: 'var(--accent)',
                      }}
                    >
                      {metric.value}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        color: 'var(--muted)',
                        display: 'block',
                        marginTop: '0.25rem',
                      }}
                    >
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
                  className="p-3 rounded-sm border flex items-center justify-center transition-colors"
                  style={{
                    borderColor: 'var(--line-strong)',
                    color: 'var(--muted)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--foreground)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--muted)';
                    e.currentTarget.style.borderColor = 'var(--line-strong)';
                  }}
                >
                  <Github className="w-4 h-4" />
                </a>
                {featuredProject.demoUrl && (
                  <a
                    href={featuredProject.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--background)',
                    }}
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
                  className={`p-6 md:p-8 rounded-[0.25rem] border transition-all duration-340 cursor-pointer flex flex-col justify-between group ${
                    isLarge ? 'col-span-1 lg:col-span-8' : 'col-span-1 lg:col-span-4'
                  }`}
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--line)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-sm font-bold border"
                        style={{
                          background: 'rgba(255, 59, 29, 0.08)',
                          color: 'var(--accent)',
                          borderColor: 'rgba(255, 59, 29, 0.2)',
                        }}
                      >
                        {proj.status}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                        color: 'var(--foreground)',
                        marginBottom: '0.5rem',
                        transition: 'color 340ms ease-out',
                      }}
                      className="group-hover:!text-[var(--accent)]"
                    >
                      {proj.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--muted)',
                        lineHeight: 1.5,
                        marginBottom: '1.5rem',
                      }}
                    >
                      {proj.description.substring(0, 160)}...
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-between mt-auto pt-4"
                    style={{ borderTop: '1px solid var(--line)' }}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.slice(0, 3).map((tech) => (
                        <span 
                          key={tech} 
                          className="px-2 py-0.5 rounded-sm text-[9px] font-mono"
                          style={{
                            background: 'var(--surface-2)',
                            color: 'var(--muted)',
                            border: '1px solid var(--line)',
                          }}
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
                        className="p-2 rounded-sm border flex items-center justify-center transition-colors"
                        style={{
                          borderColor: 'var(--line)',
                          color: 'var(--muted)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--foreground)';
                          e.currentTarget.style.borderColor = 'var(--accent)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--muted)';
                          e.currentTarget.style.borderColor = 'var(--line)';
                        }}
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
