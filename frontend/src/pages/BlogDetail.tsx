import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, Edit } from 'lucide-react';
import { BlogNote, ProfileMode } from '../types';
import SEO from '../components/SEO';
import DetailEditModal from '../components/DetailEditModal';
import PortfolioService from '../services/api';

// New Blog Components
import MarkdownRenderer from '../components/blog/MarkdownRenderer';
import ArticleFooter from '../components/blog/Footer/ArticleFooter';
import RelatedArticles from '../components/blog/RelatedArticles';
import TagList from '../components/blog/TagList';

// Advanced Navigation Components
import StickyHeader from '../components/blog/Navigation/StickyHeader';
import TableOfContents from '../components/blog/Navigation/TableOfContents';
import MobileBottomSheet from '../components/blog/Navigation/MobileBottomSheet';
import ReadingMemory from '../components/blog/Navigation/ReadingMemory';
import ArticleSearch from '../components/blog/Navigation/ArticleSearch';
import { readingStore, useReadingState } from '../store/readingStore';

interface BlogDetailProps {
  blogs: BlogNote[];
  currentMode?: ProfileMode;
  isDark: boolean;
  onRefreshData?: () => void;
}



export default function BlogDetail({ blogs, currentMode = 'general', isDark, onRefreshData }: BlogDetailProps) {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Resolve the active article from the backend-provided blog list (single source of truth).
  const activeBlog: BlogNote | null = (Array.isArray(blogs) ? blogs : []).find(b => b.id === blogId) || null;

  const { isFocusMode } = useReadingState();

  const token = sessionStorage.getItem('admin-token') || localStorage.getItem('admin-token');
  const isAdmin = !!token;

  if (!activeBlog) {
    return (
      <div className={`min-h-screen py-32 px-6 flex flex-col items-center justify-center text-center transition-colors duration-200 ${
        isDark ? 'bg-[#121212] text-white' : 'bg-[#FDFBF7] text-neutral-900'
      }`}>
        <span className="text-sm font-mono text-red-500 mb-2">Error 404</span>
        <h1 className="text-3xl font-bold font-sans mb-4">Article Not Found</h1>
        <p className="text-sm opacity-60 mb-6 max-w-sm">The article you are looking for does not exist or has been archived.</p>
        <Link 
          to="/blog" 
          className="px-5 py-2.5 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white rounded-full flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Blog</span>
        </Link>
      </div>
    );
  }

  React.useEffect(() => {
    if (activeBlog?.content) {
      // Parse headings directly from markdown to guarantee stability and bypass DOM rendering issues
      const extractHeadings = (markdown: string) => {
        const extracted: any[] = [];
        const lines = markdown.split('\n');
        let inCodeBlock = false;
        const slugCounts = new Map<string, number>();

        for (const line of lines) {
          if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
          }
          if (!inCodeBlock) {
            const match = line.match(/^(#{2,3})\s+(.+)$/);
            if (match) {
              const level = match[1].length;
              let text = match[2].trim();
              text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
              text = text.replace(/[*_~`]/g, '');
              text = text.replace(/<[^>]+>/g, '');
              
              let id = text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
              
              if (slugCounts.has(id)) {
                const count = slugCounts.get(id)! + 1;
                slugCounts.set(id, count);
                id = `${id}-${count}`;
              } else {
                slugCounts.set(id, 0);
              }
              
              if (text) extracted.push({ id, text, level });
            }
          }
        }
        return extracted;
      };

      const tocHeadings = extractHeadings(activeBlog.content || '');
      readingStore.initialize(tocHeadings, activeBlog.content || '');
      
      const onScroll = () => readingStore.handleScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'f' && e.shiftKey) {
          e.preventDefault();
          readingStore.toggleFocusMode();
        } else if (e.key === 'Escape') {
          readingStore.setFocusMode(false);
        }
      };
      window.addEventListener('keydown', onKeyDown);
      
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('keydown', onKeyDown);
        readingStore.cleanup();
      };
    }
  }, [activeBlog]);

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
      setIsModalOpen(false);
      if (onRefreshData) onRefreshData();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Failed to save blog:', err);
      alert('Failed to save blog data.');
    }
  };

  const handleDelete = async (targetId: string) => {
    if (!token) return;
    try {
      const fullConfig = await PortfolioService.getAdminConfig(token);
      const activeProfile = fullConfig[currentMode];
      if (!activeProfile || !activeProfile.blogs) return;

      activeProfile.blogs = activeProfile.blogs.filter(b => b.id !== targetId);
      await PortfolioService.saveAdminConfig(token, fullConfig);
      setIsModalOpen(false);
      if (onRefreshData) onRefreshData();
      navigate('/blog');
    } catch (err) {
      console.error('Failed to delete blog:', err);
      alert('Failed to delete blog.');
    }
  };

  // Calculate actual reading time
  const wordCount = activeBlog.content?.trim().split(/\s+/).length || 0;
  const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
  const displayReadTime = activeBlog.readTime || calculatedReadTime;

  // Construct JSON-LD Schemas
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://adarshsingh.in" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://adarshsingh.in/blog" },
      { "@type": "ListItem", "position": 3, "name": activeBlog.title, "item": `https://adarshsingh.in/blog/${activeBlog.id}` }
    ]
  };

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": activeBlog.title,
    "description": activeBlog.excerpt,
    "datePublished": activeBlog.date,
    "mainEntityOfPage": `https://adarshsingh.in/blog/${activeBlog.id}`,
    "author": {
      "@type": "Person",
      "name": "Adarsh Singh",
      "url": "https://adarshsingh.in"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Adarsh Singh",
      "logo": {
        "@type": "ImageObject",
        "url": "https://adarshsingh.in/og-image.png"
      }
    }
  };

  // Related Articles / search across the backend blog list.
  const safeBlogs = Array.isArray(blogs) ? blogs : [];
  const allArticlesList = safeBlogs.map(b => ({
    id: b.id, title: b.title, excerpt: b.excerpt, date: b.date, category: b.category, tags: b.tags, difficulty: b.difficulty
  }));

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#121212] text-white' : 'bg-[#FDFBF7] text-neutral-900'
    }`}>
      <SEO 
        title={`${activeBlog.title} | Adarsh Singh`}
        description={activeBlog.excerpt}
        keywords={`${activeBlog.category}, Software Engineering, React, Python, Adarsh Singh`}
        canonicalUrl={`https://adarshsingh.in/blog/${activeBlog.id}`}
        schema={[breadcrumbSchema, blogPostingSchema]}
      />

      <StickyHeader article={activeBlog} isDark={isDark} />
      <ReadingMemory articleId={activeBlog.id} version={activeBlog.version} />
      <ArticleSearch isDark={isDark} allArticles={allArticlesList} />

      <div className={`pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto w-full flex flex-col xl:flex-row gap-16 relative transition-all duration-500 ease-out ${isFocusMode ? 'justify-center' : ''}`}>
        {/* Main Content Area */}
        <div className={`flex-1 max-w-[820px] w-full transition-all duration-500 mx-auto ${isFocusMode ? 'xl:mx-auto' : 'xl:mx-0'}`}>
          {/* Navigation Row */}
          <div className="mb-12 flex justify-between items-center">
            <Link 
              to="/blog" 
              className={`flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-[#007AFF]" />
              <span>Blog</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => readingStore.toggleFocusMode()}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isFocusMode 
                    ? 'bg-[#007AFF] text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]' 
                    : isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                aria-label={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                title={isFocusMode ? "Exit Focus Mode (Esc)" : "Enter Focus Mode (Shift+F)"}
              >
                {/* Maximize icon from lucide-react (we can just import it) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isFocusMode ? (
                    <>
                      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                    </>
                  ) : (
                    <>
                      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                    </>
                  )}
                </svg>
                <span>{isFocusMode ? "Exit Focus" : "Focus Mode"}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-glow cursor-pointer transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-16 flex flex-col items-start text-left">
            <div className="flex items-center gap-3 mb-6">
              {activeBlog.logoUrl && (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm p-2"
                  style={{ 
                    backgroundColor: `${activeBlog.brandColor || '#007AFF'}15`,
                    borderColor: `${activeBlog.brandColor || '#007AFF'}25`
                  }}
                >
                  <img src={activeBlog.logoUrl} alt={activeBlog.category} className="w-full h-full object-contain" />
                </div>
              )}
              <span className="text-[#007AFF] font-mono text-sm tracking-wider font-semibold uppercase">
                {activeBlog.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-6 max-w-3xl">
              {activeBlog.title}
            </h1>
            
            <p className={`text-xl font-light leading-relaxed mb-8 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {activeBlog.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden border border-slate-300 dark:border-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">AS</span>
                  <img src="/api/v1/portfolio/assets/avatar.jpg" alt="Adarsh Singh" className="absolute inset-0 w-full h-full object-cover z-10" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                <div className="flex flex-col text-left">
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>Adarsh Singh</span>
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    <time dateTime={activeBlog.date}>{activeBlog.date}</time>
                    {activeBlog.lastUpdated && (
                      <span className="hidden sm:inline"> (Updated {activeBlog.lastUpdated})</span>
                    )}
                    <span>·</span>
                    <span>{displayReadTime}</span>
                    {activeBlog.difficulty && (
                      <>
                        <span>·</span>
                        <span className={`px-1.5 py-0.5 rounded-sm border ${
                          activeBlog.difficulty === 'Advanced' 
                            ? 'text-rose-500 border-rose-500/20 bg-rose-500/10' 
                            : activeBlog.difficulty === 'Intermediate'
                            ? 'text-amber-500 border-amber-500/20 bg-amber-500/10'
                            : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
                        }`}>{activeBlog.difficulty}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Tags */}
          <TagList tags={activeBlog.tags} isDark={isDark} />

          {/* Markdown Content */}
          <MarkdownRenderer content={activeBlog.content} title={activeBlog.title} isDark={isDark} />

          {!isFocusMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ArticleFooter article={activeBlog} isDark={isDark} />
              <RelatedArticles 
                currentArticleId={activeBlog.id} 
                category={activeBlog.category} 
                allArticles={allArticlesList} 
                isDark={isDark} 
              />
            </motion.div>
          )}
        </div>

        {/* Sidebar TOC & Mobile FAB */}
        <TableOfContents isDark={isDark} />
        <MobileBottomSheet article={activeBlog} isDark={isDark} />
      </div>

      {isAdmin && (
        <DetailEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
          item={activeBlog}
          type="blog"
          isAdmin={isAdmin}
          isDark={isDark}
        />
      )}
    </div>
  );
}
