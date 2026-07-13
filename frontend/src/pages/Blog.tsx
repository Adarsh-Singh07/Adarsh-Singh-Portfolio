/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BlogNote, ProfileMode } from '../types';
import { BookOpen, Calendar, Clock, Search, Plus, ArrowRight } from 'lucide-react';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';
import SEO from '../components/SEO';

interface BlogProps {
  blogs: BlogNote[];
  currentMode: ProfileMode;
  isDark: boolean;
  onRefreshData?: () => void;
}

export default function Blog({ blogs, currentMode, isDark, onRefreshData }: BlogProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBlog, setSelectedBlog] = useState<BlogNote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'create'>('view');

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;  // Predefined high-quality articles metadata
  const staticMetadata: BlogNote[] = [
    {
      id: "langgraph-agents",
      title: "Orchestrating Multi-Agent Workflows with LangGraph",
      excerpt: "Learn how to build cyclical, stateful agent systems using LangGraph to handle complex, multi-step tasks in production environments.",
      readTime: "8 min read",
      category: "AI Agents",
      date: "2026-07-10",
      url: "#",
      priority: { general: 5, 'data-engineer': 5 }
    },
    {
      id: "rag-system",
      title: "Production-Grade Retrieval-Augmented Generation (RAG)",
      excerpt: "A deep dive into building highly accurate, low-latency RAG systems using advanced chunking, hybrid search, and LLM reranking.",
      readTime: "10 min read",
      category: "Generative AI",
      date: "2026-07-05",
      url: "#",
      priority: { general: 6, 'data-engineer': 6 }
    },
    {
      id: "interviewos",
      title: "Case Study: Engineering InterviewOS Platform",
      excerpt: "An architectural review of InterviewOS, a mock interviewing system utilizing LLM evaluators and real-time audio streams.",
      readTime: "9 min read",
      category: "AI Systems",
      date: "2026-06-28",
      url: "#",
      priority: { general: 7, 'data-engineer': 7 }
    },
    {
      id: "google-cloud-run",
      title: "Zero to Hero: Deploying FastAPI on Google Cloud Run",
      excerpt: "A technical guide to containerizing FastAPI applications, configuring CPU bounds, and deploying securely on Google Cloud Run.",
      readTime: "7 min read",
      category: "Cloud",
      date: "2026-06-18",
      url: "#",
      priority: { general: 8, 'data-engineer': 8 }
    },
    {
      id: "vector-search",
      title: "High-Dimensional Vector Databases & Semantic Search",
      excerpt: "Comparing performance metrics, recall rates, and index types across Pinecone, Pgvector, and Weaviate databases.",
      readTime: "8 min read",
      category: "Databases",
      date: "2026-06-02",
      url: "#",
      priority: { general: 9, 'data-engineer': 9 }
    },
    {
      id: "fastapi-production",
      title: "Asynchronous Python: FastAPI Production Guide",
      excerpt: "Best practices for structural logging, connection pooling, exception handling, and production uvicorn configurations.",
      readTime: "6 min read",
      category: "Backend",
      date: "2026-05-20",
      url: "#",
      priority: { general: 10, 'data-engineer': 10 }
    },
    {
      id: "vercel-vs-firebase",
      title: "Firebase Hosting vs Vercel Edge for React Deployments",
      excerpt: "Comparing routing rewrite configurations, caching structures, CDN distributions, and build speeds on Vercel and Firebase.",
      readTime: "7 min read",
      category: "Frontend",
      date: "2026-05-12",
      url: "#",
      priority: { general: 11, 'data-engineer': 11 }
    }
  ];

  // Merge static metadata with database items
  const allBlogs = [...blogs];
  staticMetadata.forEach(staticItem => {
    if (!allBlogs.some(b => b.id === staticItem.id)) {
      allBlogs.push(staticItem);
    }
  });

  // Extract unique categories dynamically from merged list
  const categories = ['all', ...Array.from(new Set(allBlogs.map(blog => blog.category)))];

  // Filter & sort blogs by priority, excluding hidden ones
  const filteredBlogs = allBlogs
    .filter(blog => {
      const prio = blog.priority?.[currentMode];
      if (prio === 99 || prio === undefined) return false;

      const matchCategory = filter === 'all' || blog.category === filter;
      const matchSearch = 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) || 
        blog.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      const aPriority = a.priority?.[currentMode] ?? 99;
      const bPriority = b.priority?.[currentMode] ?? 99;
      return aPriority - bPriority;
    });
  const handleCardClick = (blog: BlogNote) => {
    navigate(`/blog/${blog.id}`);
  };

  const handleAddNew = () => {
    setSelectedBlog(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleSave = async (updatedBlog: BlogNote) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile) return;

      if (!activeProfile.blogs) {
        activeProfile.blogs = [];
      }

      const existingIndex = activeProfile.blogs.findIndex(b => b.id === updatedBlog.id);
      if (existingIndex >= 0) {
        activeProfile.blogs[existingIndex] = updatedBlog;
      } else {
        activeProfile.blogs.push(updatedBlog);
      }

      await PortfolioService.saveAdminConfig(token, fullConfig);
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save blog post:', err);
      alert('Failed to save blog data.');
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile || !activeProfile.blogs) return;

      activeProfile.blogs = activeProfile.blogs.filter(b => b.id !== blogId);
      await PortfolioService.saveAdminConfig(token, fullConfig);
      
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to delete blog post:', err);
      alert('Failed to delete blog.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const blogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://adarshsingh.in/blog/#webpage",
        "url": "https://adarshsingh.in/blog",
        "name": "Engineering Chronicle & AI Blog | Adarsh Singh",
        "description": "Technical insights, architectural tutorials, and deep-dives into vector databases and GenAI search written by Adarsh Singh."
      }
    ]
  };

  return (
    <div className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-1000 ${
      isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-neutral-900'
    }`}>
      <SEO 
        title="Technical Articles & AI Engineering Blog | Adarsh Singh"
        description="Read the latest guides, design patterns, and engineering blogs about LLMs, data form pipelines, and vector search systems written by Adarsh Singh."
        keywords="Technical Blog, AI Articles, Data Engineering Tutorials, LLM System Architecture"
        canonicalUrl="https://adarshsingh.in/blog"
        schema={blogSchema}
      />
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header Console Row */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#007AFF] block mb-2">
              Engineering Notes
            </span>
            <h1 className="text-4xl font-bold font-sans tracking-tight mb-4">
              Insights &amp; Deep Dives
            </h1>
            <p className={`text-sm font-light leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Technical write-ups detailing architectures, hybrid vector index engineering, and distributed streaming pipeline configurations.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleAddNew}
              className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-full flex items-center gap-2 text-xs font-semibold shadow-glow cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Blog Post</span>
            </button>
          )}
        </div>

        {/* Filters and Search Bar Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  filter === cat
                    ? 'bg-[#007AFF] text-white shadow-glow'
                    : isDark
                      ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
                      : 'bg-white border border-neutral-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={`relative flex items-center rounded-full border transition-all duration-300 max-w-md w-full ${
            isDark 
              ? 'bg-neutral-900/60 border-white/10 focus-within:border-white/20' 
              : 'bg-white border-neutral-200 focus-within:border-neutral-300'
          }`}>
            <Search className="absolute left-4 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-2.5 bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Blogs Grid */}
        {filteredBlogs.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredBlogs.map((blog) => (
              <motion.div
                key={blog.id}
                variants={cardVariants}
                onClick={() => handleCardClick(blog)}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`p-6 rounded-[28px] border transition-all duration-500 flex flex-col justify-between cursor-pointer group ${
                  isDark
                    ? 'bg-neutral-900/40 border-white/5 hover:border-white/15 hover:shadow-[0_15px_30px_rgba(0,122,255,0.06)]'
                    : 'bg-white border-neutral-200/60 hover:border-neutral-300 hover:shadow-[0_10px_25px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/25">
                      {blog.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{blog.readTime}</span>
                  </div>

                  <h3 className="text-lg font-sans font-semibold tracking-tight mb-3 group-hover:text-[#007AFF] transition-colors duration-300">
                    {blog.title}
                  </h3>
                  <p className={`text-xs font-light leading-relaxed mb-6 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {blog.excerpt.substring(0, 150)}...
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800/10">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                    <span>{blog.date}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#007AFF] flex items-center gap-1">
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <span className="text-xs font-mono text-slate-500">No blog posts found matching current filters.</span>
          </div>
        )}

      </div>

      {/* Detail Edit Modal */}
      <DetailEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="blog"
        item={selectedBlog}
        onSave={handleSave}
        onDelete={handleDelete}
        isAdmin={isAdmin}
        isDark={isDark}
      />
    </div>
  );
}
