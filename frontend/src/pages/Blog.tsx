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
      id: "databricks-lakehouse",
      title: "The Magic of Databricks: Building a Data Lakehouse",
      excerpt: "Imagine having the vast, bottomless storage of a data lake combined with the organized, easy-to-search structure of a data warehouse. That's the Databricks Lakehouse.",
      readTime: "8 min read",
      category: "Data Engineering",
      date: "2026-07-15",
      url: "#",
      logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/databricks/databricks-original.svg",
      brandColor: "#FF3621",
      priority: { general: 4, 'data-engineer': 4 }
    },
    {
      id: "langgraph-agents",
      title: "Teaching AI to Think in Loops with LangGraph",
      excerpt: "Standard AI bots just give one answer and stop. But what if they could double-check their own work, fix their mistakes, and think in continuous loops? Enter LangGraph.",
      readTime: "8 min read",
      category: "AI Agents",
      date: "2026-07-10",
      url: "#",
      logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
      brandColor: "#3776AB",
      priority: { general: 5, 'data-engineer': 5 }
    },
    {
      id: "rag-system",
      title: "Giving AI a Perfect Memory: How RAG Actually Works",
      excerpt: "Ever wish your AI could instantly pull up that one specific sentence from a 500-page manual? Retrieval-Augmented Generation (RAG) is the secret filing system making it happen.",
      readTime: "10 min read",
      category: "Generative AI",
      date: "2026-07-05",
      url: "#",
      logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg",
      brandColor: "#FF6F00",
      priority: { general: 6, 'data-engineer': 6 }
    },
    {
      id: "interviewos",
      title: "Building an AI Interviewer that Actually Listens",
      excerpt: "We built InterviewOS to mock-interview engineers. It had to listen in real-time, understand messy coding thoughts, and grade answers fairly. Here is the architecture behind it.",
      readTime: "9 min read",
      category: "AI Systems",
      date: "2026-06-28",
      url: "#",
      logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
      brandColor: "#61DAFB",
      priority: { general: 7, 'data-engineer': 7 }
    },
    {
      id: "google-cloud-run",
      title: "Scaling Python from Zero to Hero on Cloud Run",
      excerpt: "Deploying backend servers used to mean paying for machines even when no one was using them. Cloud Run changes the game by shrinking your app to zero when idle.",
      readTime: "7 min read",
      category: "Cloud",
      date: "2026-06-18",
      url: "#",
      logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg",
      brandColor: "#4285F4",
      priority: { general: 8, 'data-engineer': 8 }
    },
    {
      id: "vector-search",
      title: "Searching by Meaning, Not Just Keywords",
      excerpt: "Traditional databases look for exact word matches. Vector databases look for 'vibes' and meanings. Here is how Pgvector and Pinecone are revolutionizing search.",
      readTime: "8 min read",
      category: "Databases",
      date: "2026-06-02",
      url: "#",
      logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
      brandColor: "#4169E1",
      priority: { general: 9, 'data-engineer': 9 }
    },
    {
      id: "fastapi-production",
      title: "FastAPI: Making Python Fast Again",
      excerpt: "FastAPI is incredible, but putting it in production can be tricky. If you block the main thread, the whole app freezes. Here are the secrets to keeping it blazing fast.",
      readTime: "6 min read",
      category: "Backend",
      date: "2026-05-20",
      url: "#",
      logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg",
      brandColor: "#009688",
      priority: { general: 10, 'data-engineer': 10 }
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
        ease: [0.16, 1, 0.3, 1] as any
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
    <div className={`min-h-screen py-24 px-6 md:px-12 transition-colors duration-200 ${
      isDark ? 'bg-[#121212] text-white' : 'bg-[#FDFBF7] text-neutral-900'
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
                className={`p-6 rounded-[28px] border transition-all duration-500 flex flex-col justify-between cursor-pointer group overflow-hidden relative ${
                  isDark
                    ? 'bg-neutral-900/40 border-white/5 hover:border-white/15 hover:shadow-[0_15px_30px_rgba(0,122,255,0.06)]'
                    : 'bg-white border-neutral-200/60 hover:border-neutral-300 hover:shadow-[0_10px_25px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div 
                  className="absolute inset-0 opacity-[0.02] mix-blend-overlay group-hover:opacity-[0.08] transition-opacity duration-500 rounded-[28px]"
                  style={{ backgroundColor: blog.brandColor || '#007AFF' }}
                />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                        style={{ 
                          color: blog.brandColor || '#007AFF', 
                          backgroundColor: `${blog.brandColor || '#007AFF'}15`,
                          borderColor: `${blog.brandColor || '#007AFF'}25`
                        }}
                      >
                        {blog.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{blog.readTime}</span>
                    </div>
                    {blog.logoUrl && (
                      <img src={blog.logoUrl} alt={blog.category} className="w-6 h-6 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  <h3 className="text-lg font-sans font-semibold tracking-tight mb-3 group-hover:text-[#007AFF] transition-colors duration-300 line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className={`text-xs font-light leading-relaxed mb-6 flex-grow ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {blog.excerpt.length > 150 ? blog.excerpt.substring(0, 150) + '...' : blog.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800/10">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                      <span>{blog.date}</span>
                    </div>
                    <span 
                      className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                      style={{ color: blog.brandColor || '#007AFF' }}
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
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
