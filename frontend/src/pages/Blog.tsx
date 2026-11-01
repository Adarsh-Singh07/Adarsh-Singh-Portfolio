/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BlogNote, ProfileMode } from '../types';
import { Calendar, Search, Plus, ArrowRight } from 'lucide-react';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';
import SEO from '../components/SEO';

interface BlogProps {
  blogs: BlogNote[];
  currentMode: ProfileMode;
  isDark?: boolean;
  onRefreshData?: () => void;
}

export default function Blog({ blogs, currentMode, onRefreshData }: BlogProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBlog, setSelectedBlog] = useState<BlogNote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setModalMode] = useState<'view' | 'create'>('view');

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  // Blog list is sourced from the backend profile (single source of truth).
  const allBlogs: BlogNote[] = Array.isArray(blogs) ? [...blogs] : [];

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
    <div
      className="min-h-screen py-32"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        paddingLeft: 'var(--gutter)',
        paddingRight: 'var(--gutter)',
      }}
    >
      <SEO 
        title="Technical Articles & AI Engineering Blog | Adarsh Singh"
        description="Read the latest guides, design patterns, and engineering blogs about LLMs, data form pipelines, and vector search systems written by Adarsh Singh."
        keywords="Technical Blog, AI Articles, Data Engineering Tutorials, LLM System Architecture"
        canonicalUrl="https://adarshsingh.in/blog"
        schema={blogSchema}
      />
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header Console Row */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left max-w-2xl">
            <div className="eyebrow mb-3">
              <span className="eyebrow-dot" />
              <span>Engineering Notes</span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                lineHeight: 0.95,
              }}
              className="mb-4"
            >
              Insights &amp; Deep Dives
            </h1>
            <p
              style={{
                color: 'var(--muted)',
                fontSize: '1.0625rem',
                lineHeight: 1.6,
              }}
            >
              Technical write-ups detailing architectures, hybrid vector index engineering, and distributed streaming pipeline configurations.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleAddNew}
              className="px-6 py-3 rounded-full flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all duration-300"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#08080a',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Blog Post</span>
            </button>
          )}
        </div>

        {/* Filters and Search Bar Row */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6 border-b"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: filter === cat ? 'var(--accent)' : 'var(--surface)',
                  color: filter === cat ? '#08080a' : 'var(--muted)',
                  border: `1px solid ${filter === cat ? 'var(--accent)' : 'var(--line)'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div
            className="relative flex items-center rounded-full border transition-all duration-300 max-w-md w-full"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--line)',
            }}
          >
            <Search className="absolute left-4 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-transparent text-sm focus:outline-none placeholder:text-neutral-500"
              style={{ color: 'var(--foreground)' }}
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
                className="p-7 rounded-[28px] border transition-all duration-500 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--line)',
                }}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                        style={{ 
                          color: 'var(--accent)', 
                          backgroundColor: 'rgba(255, 59, 29, 0.1)',
                          borderColor: 'rgba(255, 59, 29, 0.2)'
                        }}
                      >
                        {blog.category}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">{blog.readTime}</span>
                    </div>
                    {blog.logoUrl && (
                      <img src={blog.logoUrl} alt={blog.category} className="w-6 h-6 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.45rem',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.15,
                    }}
                    className="mb-3 group-hover:text-[#ff3b1d] transition-colors duration-300 line-clamp-2"
                  >
                    {blog.title}
                  </h3>
                  <p
                    style={{
                      color: 'var(--muted)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                    }}
                    className="mb-6 flex-grow"
                  >
                    {blog.excerpt.length > 150 ? blog.excerpt.substring(0, 150) + '...' : blog.excerpt}
                  </p>

                  <div
                    className="flex items-center justify-between mt-auto pt-4 border-t"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                      <Calendar className="w-3.5 h-3.5 text-[#ff3b1d]" />
                      <span>{blog.date}</span>
                    </div>
                    <span 
                      className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors duration-300 group-hover:text-[#ff3b1d]"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-24">
            <span className="text-sm font-mono text-neutral-400">No blog posts found matching current filters.</span>
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
        isDark={true}
      />
    </div>
  );
}
