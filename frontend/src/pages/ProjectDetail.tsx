import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, Cpu, Layers, Database, Calendar, Edit } from 'lucide-react';
import { Project, ProfileMode } from '../types';
import SEO from '../components/SEO';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';

interface ProjectDetailProps {
  projects: Project[];
  currentMode?: ProfileMode;
  isDark: boolean;
  onRefreshData?: () => void;
}

export default function ProjectDetail({ projects, currentMode = 'general', isDark, onRefreshData }: ProjectDetailProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const project = projects.find(p => p.id === projectId);
  
  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  if (!project) {
    return (
      <div className={`min-h-screen py-32 px-6 flex flex-col items-center justify-center text-center transition-colors duration-1000 ${
        isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-neutral-900'
      }`}>
        <span className="text-sm font-mono text-red-500 mb-2">Error 404</span>
        <h1 className="text-3xl font-bold font-sans mb-4">Case Study Not Found</h1>
        <p className="text-sm opacity-60 mb-6 max-w-sm">The project you are looking for does not exist in the active portfolio configuration.</p>
        <Link 
          to="/projects" 
          className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-full flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Projects</span>
        </Link>
      </div>
    );
  }

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
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      setIsModalOpen(false);
      if (onRefreshData) onRefreshData();
      // Wait briefly for GCS sync, then refresh window state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Failed to save project:', err);
      alert('Failed to save project data.');
    }
  };

  const handleDelete = async (targetId: string) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile || !activeProfile.projects) return;

      activeProfile.projects = activeProfile.projects.filter(p => p.id !== targetId);
      await PortfolioService.saveAdminConfig(token, fullConfig);
      setIsModalOpen(false);
      if (onRefreshData) onRefreshData();
      navigate('/projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project.');
    }
  };

  // Construct SoftwareApplication JSON-LD Schema for rich search snippet indexing
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": project.title,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "url": `https://adarshsingh.in/projects/${project.id}`,
    "downloadUrl": project.githubUrl || undefined,
    "softwareVersion": "1.0.0",
    "description": project.description,
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-1000 ${
      isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-neutral-900'
    }`}>
      <SEO 
        title={`${project.title} | Case Study | Adarsh Singh`}
        description={project.description.slice(0, 155) + '...'}
        keywords={`${project.technologies.join(', ')}, Case Study, AI Systems Architecture, System Engineering`}
        canonicalUrl={`https://adarshsingh.in/projects/${project.id}`}
        schema={projectSchema}
      />

      <div className="max-w-4xl mx-auto w-full">
        {/* Navigation Breadcrumb Path */}
        <div className="mb-12 flex justify-between items-center">
          <Link 
            to="/projects" 
            className={`flex items-center gap-2 text-xs font-semibold cursor-pointer transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-655 hover:text-neutral-950'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-[#007AFF]" />
            <span>Back to Bento Catalog</span>
          </Link>

          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-glow cursor-pointer transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Case Study</span>
            </button>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-left mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#007AFF] px-2.5 py-1 rounded-md bg-[#007AFF]/10">
              {project.status || 'Active'}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight mb-6 leading-tight">
            {project.title}
          </h1>

          <p className={`text-base md:text-lg font-light leading-relaxed whitespace-pre-line ${
            isDark ? 'text-slate-300' : 'text-slate-650'
          }`}>
            {project.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-4 mb-16">
          {project.githubUrl && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`px-5 py-3 rounded-full flex items-center gap-2 text-xs font-semibold transition-all duration-300 cursor-pointer ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : 'bg-white hover:bg-slate-50 text-neutral-900 border border-slate-200'
              }`}
            >
              <Github className="w-4 h-4" />
              <span>Source Repository</span>
            </a>
          )}

          {project.demoUrl && (
            <a 
              href={project.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-5 py-3 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-full flex items-center gap-2 text-xs font-semibold shadow-glow cursor-pointer transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Live Deployment</span>
            </a>
          )}
        </div>

        {/* Metrics Section */}
        {project.metrics && project.metrics.length > 0 && (
          <section className="mb-16">
            <h2 className="text-lg font-bold font-sans tracking-tight mb-6 text-left border-b border-white/5 pb-3">
              Performance Indicators &amp; Deliverables
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {project.metrics.map((metric, idx) => (
                <div 
                  key={idx} 
                  className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
                    isDark ? 'bg-[#007AFF05] border-[#007AFF15]' : 'bg-slate-100/50 border-slate-200'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-650'
                  }`}>
                    {metric.label}
                  </span>
                  <span className="text-3xl font-bold font-sans text-[#007AFF]">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Stack Section */}
        <section className="mb-16">
          <h2 className="text-lg font-bold font-sans tracking-tight mb-6 text-left border-b border-white/5 pb-3">
            Core Technologies &amp; Libraries
          </h2>
          <div className="flex flex-wrap gap-2.5 justify-start">
            {project.technologies.map((tech, idx) => (
              <span 
                key={idx} 
                className={`text-xs px-3.5 py-1.5 rounded-xl border font-mono ${
                  isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Case Study Detailed Breakdown */}
        <section className="text-left space-y-10">
          <h2 className="text-lg font-bold font-sans tracking-tight border-b border-white/5 pb-3">
            Under the Hood: System Overview
          </h2>
          
          <div className="space-y-6">
            <h3 className="font-semibold text-base text-[#007AFF]">1. Engineering Objective &amp; Problem Statement</h3>
            <p className={`text-xs md:text-sm font-light leading-relaxed ${isDark ? 'text-slate-350' : 'text-slate-655'}`}>
              The implementation addresses critical issues in distributed environments, such as high database transaction latency, data consistency errors during high concurrent spikes, and integration barriers when building AI agent systems. By using event-driven architectures, low-latency API layers, and intelligent orchestration models, this framework ensures production stability at scale.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-base text-[#007AFF]">2. Architecture Design</h3>
            <p className={`text-xs md:text-sm font-light leading-relaxed ${isDark ? 'text-slate-350' : 'text-slate-655'}`}>
              The backend leverages a lightweight, asynchronous containerized architecture deployed on high-availability cloud platforms. WebSockets support bidirectional communication, and data streaming loops are processed in parallel configurations. RAG modules query high-dimensional vector databases, and indexing maps ensure near-instant metadata extraction.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold text-base text-[#007AFF]">3. Key Challenges &amp; Resolution</h3>
            <ul className={`list-disc pl-5 text-xs md:text-sm font-light leading-relaxed space-y-2.5 ${isDark ? 'text-slate-350' : 'text-slate-655'}`}>
              <li><strong>Cold Start Latency:</strong> Optimized container scaling rules and memory boundaries to achieve faster boot responses.</li>
              <li><strong>Database Lockups:</strong> Structured indices and query parameters to avoid full-table scans.</li>
              <li><strong>Context Window Management:</strong> Built dynamic context token packing algorithms to limit processing costs in LLM retrieval tasks.</li>
            </ul>
          </div>
        </section>
      </div>

      {isAdmin && (
        <DetailEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
          item={project}
          type="project"
          isAdmin={isAdmin}
          isDark={isDark}
        />
      )}
    </div>
  );
}
