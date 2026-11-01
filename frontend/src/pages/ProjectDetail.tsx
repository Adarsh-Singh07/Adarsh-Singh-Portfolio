/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink, Edit } from 'lucide-react';
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
      <div className="min-h-screen py-32 px-6 flex flex-col items-center justify-center text-center bg-[var(--background)] text-[var(--foreground)]">
        <span className="text-sm font-mono text-[var(--accent)] mb-2">Error 404</span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3rem',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          Case Study Not Found
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', maxWidth: '28rem' }}>
          The project specification you are looking for does not exist in the active configuration.
        </p>
        <Link 
          to="/projects" 
          className="px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
          style={{
            background: 'var(--accent)',
            color: 'var(--background)',
          }}
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
      } else {
        activeProfile.projects.push(updatedProject);
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      setIsModalOpen(false);
      if (onRefreshData) onRefreshData();
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
    <div className="min-h-screen py-28 px-6 md:px-12 bg-[var(--background)] text-[var(--foreground)]">
      <SEO 
        title={`${project.title} | Case Study | Adarsh Singh`}
        description={project.description.slice(0, 155) + '...'}
        keywords={`${project.technologies.join(', ')}, Case Study, AI Systems Architecture, System Engineering`}
        canonicalUrl={`https://adarshsingh.in/projects/${project.id}`}
        schema={projectSchema}
      />

      <div className="max-w-4xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-12 flex justify-between items-center">
          <Link 
            to="/projects" 
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span>Back to Projects Archive</span>
          </Link>

          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-white rounded-full flex items-center gap-1.5 text-xs font-semibold transition-colors"
              style={{ background: 'var(--accent)' }}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Case Study</span>
            </button>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-left mb-12">
          <div className="eyebrow" style={{ marginBottom: '1rem' }}>
            System Spec · {project.status || 'Active'}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.5rem',
              textTransform: 'uppercase',
              lineHeight: 1,
              color: 'var(--foreground)',
              marginBottom: '1.5rem',
            }}
            className="sm:text-[4.5rem]"
          >
            {project.title}
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--muted)',
              lineHeight: 1.5,
              whiteSpace: 'pre-line',
            }}
          >
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
              className="px-6 py-3 rounded-sm flex items-center gap-2 text-xs font-semibold transition-colors border"
              style={{
                borderColor: 'var(--line-strong)',
                color: 'var(--foreground)',
                background: 'var(--surface)',
              }}
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
              className="px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
              style={{
                background: 'var(--accent)',
                color: 'var(--background)',
              }}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Live System</span>
            </a>
          )}
        </div>

        {/* Metrics Section */}
        {project.metrics && project.metrics.length > 0 && (
          <section className="mb-16">
            <h2
              className="text-lg font-bold font-sans tracking-tight mb-6 text-left pb-3 uppercase"
              style={{ borderBottom: '1px solid var(--line)', color: 'var(--foreground)' }}
            >
              Performance Indicators &amp; Deliverables
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {project.metrics.map((metric, idx) => (
                <div 
                  key={idx} 
                  className="p-6 rounded-[0.25rem] border text-center"
                  style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      color: 'var(--muted)',
                      display: 'block',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {metric.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '2.5rem',
                      color: 'var(--accent)',
                    }}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Stack Section */}
        <section className="mb-16">
          <h2
            className="text-lg font-bold font-sans tracking-tight mb-6 text-left pb-3 uppercase"
            style={{ borderBottom: '1px solid var(--line)', color: 'var(--foreground)' }}
          >
            Core Technologies &amp; Architecture Libraries
          </h2>
          <div className="flex flex-wrap gap-2.5 justify-start">
            {project.technologies.map((tech, idx) => (
              <span 
                key={idx} 
                className="text-xs px-3.5 py-1.5 rounded-sm border font-mono"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--line)',
                  color: 'var(--foreground)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Detailed Breakdown */}
        <section className="text-left space-y-10">
          <h2
            className="text-lg font-bold font-sans tracking-tight pb-3 uppercase"
            style={{ borderBottom: '1px solid var(--line)', color: 'var(--foreground)' }}
          >
            Under the Hood: System Overview
          </h2>
          
          {project.title === "EMIVO" || project.id === "emivo" ? (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-base flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                  <span>1. Enterprise Architecture &amp; System Vision</span>
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  <strong>EMIVO</strong> is an AI-native, enterprise-grade eCommerce SaaS platform engineered to streamline digital retail for startups, SMEs, and enterprise merchants. Built on a modular microservices pattern with FastAPI, PostgreSQL, and Supabase, EMIVO decouples storefront delivery from back-office management, combining instant checkout speeds with real-time inventory synchronization across multi-tenant deployments.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-base flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                  <span>2. Intelligent Automation &amp; AI-Driven Features</span>
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                  <li><strong>Conversational Shopping Assistants:</strong> RAG-driven shopping co-pilots utilizing <strong>Qdrant</strong> vector embeddings for real-time natural language product discovery.</li>
                  <li><strong>Automated Content &amp; Catalog Generation:</strong> Multi-LLM pipelines (OpenAI, Gemini, Groq) generating high-converting descriptions, tags, and SEO metadata.</li>
                  <li><strong>Smart Vector Search:</strong> Hybrid BM25 and vector semantic search powered by Qdrant to understand customer intent, synonyms, and multi-parameter filters.</li>
                  <li><strong>Automated Order &amp; Inventory Management:</strong> Event-driven WebSocket streams monitoring stock thresholds, supplier orders, and payment webhooks via Stripe.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-base flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                  <span>3. Cloud-Native Infrastructure &amp; Production Security</span>
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                  <li><strong>Containerized Microservices:</strong> Deployed with <strong>Docker Compose</strong> and reverse-proxied via <strong>Nginx</strong> for horizontal scalability and zero-downtime updates.</li>
                  <li><strong>High-Performance In-Memory Cache:</strong> Integrated <strong>Redis</strong> layer to guarantee sub-2-second AI responses under heavy concurrent loads.</li>
                  <li><strong>Security &amp; Multi-Tenancy:</strong> Enterprise-grade security featuring JWT token authentication, Cloudflare DDoS shielding, and isolated tenant partitions.</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-base" style={{ color: 'var(--accent)' }}>
                  1. Engineering Objective &amp; Problem Statement
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  The implementation addresses critical issues in distributed environments, such as high database transaction latency, data consistency errors during high concurrent spikes, and integration barriers when building AI agent systems. By using event-driven architectures, low-latency API layers, and intelligent orchestration models, this framework ensures production stability at scale.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-base" style={{ color: 'var(--accent)' }}>
                  2. Architecture Design
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  The backend leverages a lightweight, asynchronous containerized architecture deployed on high-availability cloud platforms. WebSockets support bidirectional communication, and data streaming loops are processed in parallel configurations. RAG modules query high-dimensional vector databases, and indexing maps ensure near-instant metadata extraction.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-base" style={{ color: 'var(--accent)' }}>
                  3. Key Challenges &amp; Resolution
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                  <li><strong>Cold Start Latency:</strong> Optimized container scaling rules and memory boundaries to achieve faster boot responses.</li>
                  <li><strong>Database Lockups:</strong> Structured indices and query parameters to avoid full-table scans.</li>
                  <li><strong>Context Window Management:</strong> Built dynamic context token packing algorithms to limit processing costs in LLM retrieval tasks.</li>
                </ul>
              </div>
            </>
          )}
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
